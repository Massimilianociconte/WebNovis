#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const { ROOT_DIR, getPublishDir, getReportDir } = require('../config/publish-targets');
const {
  PUBLIC_FONT_EXTENSIONS,
  PUBLIC_HTML_ROOT_FILES,
  PUBLIC_MEDIA_EXTENSIONS,
  PUBLIC_TECHNICAL_FILES,
  assertSafePublishTarget,
  walkFiles
} = require('./public-artifact');
const { assertArtifact, collectReferencedStaticAssets } = require('./verify-public-artifact');

function copyFile(sourcePath, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

function copyTreeFiltered(sourceDir, targetDir, predicate) {
  if (!fs.existsSync(sourceDir)) return;
  const stack = [{ source: sourceDir, target: targetDir }];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current.source, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const sourcePath = path.join(current.source, entry.name);
      const targetPath = path.join(current.target, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Refusing symlink input in public asset family: ${sourcePath}`);
      }
      if (entry.isDirectory()) {
        stack.push({ source: sourcePath, target: targetPath });
      } else if (entry.isFile() && predicate(sourcePath)) {
        copyFile(sourcePath, targetPath);
      }
    }
  }
}

function runNode(relativeScript, args, env) {
  const result = spawnSync(process.execPath, [path.join(ROOT_DIR, relativeScript), ...args], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env,
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error(`${relativeScript} failed with exit ${result.status}`);
  }
}

function resolveSourceDateEpoch(env = process.env) {
  if (env.SOURCE_DATE_EPOCH && /^\d+$/.test(env.SOURCE_DATE_EPOCH)) {
    return env.SOURCE_DATE_EPOCH;
  }
  try {
    return execFileSync('git', ['log', '-1', '--format=%ct'], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      timeout: 5000
    }).trim();
  } catch (_) {
    return String(Math.floor(Date.UTC(2026, 1, 27) / 1000));
  }
}

function getTrackedWorktreeState() {
  try {
    return execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      timeout: 10_000
    });
  } catch (error) {
    throw new Error(`Unable to capture source worktree state: ${error.message}`);
  }
}

function materializeStaticSources(stagingRoot) {
  copyTreeFiltered(
    path.join(ROOT_DIR, 'blog'),
    path.join(stagingRoot, 'blog'),
    (sourcePath) => sourcePath.endsWith('.html')
  );
  copyTreeFiltered(
    path.join(ROOT_DIR, 'portfolio'),
    path.join(stagingRoot, 'portfolio'),
    (sourcePath) => sourcePath.endsWith('.html')
  );
  copyTreeFiltered(
    path.join(ROOT_DIR, 'Img'),
    path.join(stagingRoot, 'Img'),
    (sourcePath) => PUBLIC_MEDIA_EXTENSIONS.has(path.extname(sourcePath).toLowerCase())
  );
  copyTreeFiltered(
    path.join(ROOT_DIR, 'fonts'),
    path.join(stagingRoot, 'fonts'),
    (sourcePath) => PUBLIC_FONT_EXTENSIONS.has(path.extname(sourcePath).toLowerCase())
  );

  for (const filename of PUBLIC_HTML_ROOT_FILES) {
    copyFile(path.join(ROOT_DIR, filename), path.join(stagingRoot, filename));
  }
  for (const filename of PUBLIC_TECHNICAL_FILES) {
    copyFile(path.join(ROOT_DIR, filename), path.join(stagingRoot, filename));
  }

  for (const entry of fs.readdirSync(ROOT_DIR, { withFileTypes: true })) {
    if (entry.isFile() && /^[a-f0-9]{32}\.txt$/i.test(entry.name)) {
      copyFile(path.join(ROOT_DIR, entry.name), path.join(stagingRoot, entry.name));
    }
  }
}

function pruneUnreferencedStaticAssets(stagingRoot, reportRoot) {
  const allFiles = walkFiles(stagingRoot);
  const referenced = collectReferencedStaticAssets(stagingRoot, allFiles);
  const candidates = allFiles.filter((relativePath) =>
    relativePath.startsWith('Img/') || relativePath.startsWith('fonts/')
  );
  const pruned = [];
  for (const relativePath of candidates) {
    if (referenced.has(relativePath)) continue;
    fs.rmSync(path.join(stagingRoot, relativePath));
    pruned.push(relativePath);
  }
  fs.mkdirSync(reportRoot, { recursive: true });
  fs.writeFileSync(
    path.join(reportRoot, 'public-asset-closure.json'),
    `${JSON.stringify({
      schemaVersion: 1,
      copiedCandidateCount: candidates.length,
      publishedReferencedCount: candidates.length - pruned.length,
      prunedUnreferencedCount: pruned.length,
      pruned
    }, null, 2)}\n`,
    'utf8'
  );
  console.log(
    `Asset closure: ${candidates.length - pruned.length} referenced media/fonts retained, `
    + `${pruned.length} unreferenced files pruned.`
  );
  return { candidates, pruned, referenced };
}

function promoteArtifact(stagingRoot, publishRoot) {
  const backupRoot = path.join(
    path.dirname(publishRoot),
    `.dist.__previous__-${process.pid}`
  );
  if (fs.existsSync(backupRoot)) {
    fs.rmSync(backupRoot, { recursive: true, force: true });
  }

  let movedPrevious = false;
  try {
    if (fs.existsSync(publishRoot)) {
      fs.renameSync(publishRoot, backupRoot);
      movedPrevious = true;
    }
    fs.renameSync(stagingRoot, publishRoot);
    if (movedPrevious) fs.rmSync(backupRoot, { recursive: true, force: true });
  } catch (error) {
    if (!fs.existsSync(publishRoot) && movedPrevious && fs.existsSync(backupRoot)) {
      fs.renameSync(backupRoot, publishRoot);
    }
    throw error;
  }
}

function main(env = process.env) {
  const publishRoot = assertSafePublishTarget(getPublishDir());
  const reportRoot = getReportDir();
  const stagingRoot = assertSafePublishTarget(
    path.join(ROOT_DIR, `.dist.__staging__-${process.pid}`),
    { allowStaging: true }
  );
  const sourceDateEpoch = resolveSourceDateEpoch(env);
  const buildEnv = {
    ...env,
    PUBLISH_DIR: stagingRoot,
    REPORT_DIR: reportRoot,
    SOURCE_DATE_EPOCH: sourceDateEpoch,
    TZ: 'UTC'
  };
  const worktreeBefore = getTrackedWorktreeState();

  if (fs.existsSync(stagingRoot)) {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingRoot, { recursive: true });

  try {
    console.log(`Preparing public artifact in isolated staging: ${path.basename(stagingRoot)}`);
    console.log(`SOURCE_DATE_EPOCH=${sourceDateEpoch}`);
    materializeStaticSources(stagingRoot);

    runNode('scripts/generate-all-geo.js', [
      `--out-dir=${stagingRoot}`,
      `--report-dir=${reportRoot}`
    ], buildEnv);
    runNode('build.js', [`--out-dir=${stagingRoot}`], buildEnv);

    copyFile(
      path.join(ROOT_DIR, 'js', 'web-vitals.iife.js'),
      path.join(stagingRoot, 'js', 'web-vitals.iife.js')
    );

    runNode('scripts/normalize-public-html.js', [`--out-dir=${stagingRoot}`], buildEnv);
    runNode('scripts/update-footer.js', [`--out-dir=${stagingRoot}`], buildEnv);
    runNode('build-search-index.js', [`--out-dir=${stagingRoot}`, '--public-only'], buildEnv);
    runNode('generate-sitemap.js', [`--out-dir=${stagingRoot}`], buildEnv);
    runNode('scripts/generate-llms-index.js', [`--out-dir=${stagingRoot}`], buildEnv);
    runNode('scripts/generate-llms-full.js', [`--out-dir=${stagingRoot}`], buildEnv);
    runNode('scripts/sync-security-headers.js', [`--out-dir=${stagingRoot}`], buildEnv);
    pruneUnreferencedStaticAssets(stagingRoot, reportRoot);
    runNode('scripts/validate-pages.js', ['--all', '--verbose', `--out-dir=${stagingRoot}`], buildEnv);

    const report = assertArtifact({
      publishRoot: stagingRoot,
      reportRoot,
      sourceRoot: ROOT_DIR
    });

    const worktreeAfter = getTrackedWorktreeState();
    if (worktreeAfter !== worktreeBefore) {
      throw new Error(
        'Public build changed the source worktree. The staged artifact was not promoted.'
      );
    }

    promoteArtifact(stagingRoot, publishRoot);
    console.log(
      `✅ Public artifact promoted locally to ${path.relative(ROOT_DIR, publishRoot)}: `
      + `${report.fileCount} files, ${report.htmlFileCount} HTML, `
      + `${report.builtSitemapUrlCount} sitemap URLs.`
    );
  } catch (error) {
    if (fs.existsSync(stagingRoot)) {
      fs.rmSync(stagingRoot, { recursive: true, force: true });
    }
    throw error;
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`⛔ Public artifact build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  copyTreeFiltered,
  main,
  materializeStaticSources,
  pruneUnreferencedStaticAssets,
  promoteArtifact,
  resolveSourceDateEpoch,
  runNode
};
