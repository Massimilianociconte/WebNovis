/**
 * WebNovis Build Script
 * JS: Terser
 * CSS: Lightning CSS with safe fallback to CleanCSS
 *
 * Goals:
 * - Handle modern CSS syntax (nesting, special characters, custom properties)
 * - Preserve cascade behavior safely
 * - Support per-file exceptions
 * - Auto-discover assets referenced by local HTML pages
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const { transform } = require('lightningcss');
const CleanCSS = require('clean-css');
let htmlMinifier;
try { htmlMinifier = require('html-minifier-terser'); } catch (e) { htmlMinifier = null; }

const PROJECT_ROOT = path.resolve(process.cwd());

const config = {
    discovery: {
        htmlRoots: ['.'],
        skipDirs: ['.git', 'node_modules']
    },
    js: {
        explicitInputs: ['js/main.js', 'js/chat.js', 'js/text-effects.js', 'js/search.js', 'js/web-vitals-reporter.js'],
        suffix: '.min.js',
        skip: [],
        overrides: {},
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                dead_code: true,
                unused: true,
                passes: 3,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
                pure_getters: true,
                global_defs: {
                    DEBUG: false
                }
            },
            mangle: {
                toplevel: false,
                properties: false
            },
            format: {
                comments: false,
                ascii_only: false,
                beautify: false,
                semicolons: true
            },
            sourceMap: false
        }
    },
    css: {
        explicitInputs: [
            'css/style.css',
            'css/revolution.css',
            'css/leviathan-inspired.css',
            'css/social-feed-modern.css',
            'css/weby-mobile-fix.css',
            'css/nicole-inspired.css',
            'css/portfolio-premium.css',
            'css/search.css'
        ],
        suffix: '.min.css',
        skip: [],
        forceCleanCss: [],
        overrides: {},
        lightningOptions: {
            minify: true,
            sourceMap: false,
            drafts: {
                nesting: true,
                customMedia: true
            }
        },
        cleanCssFallbackOptions: {
            level: {
                1: {
                    all: true,
                    removeEmpty: true,
                    removeWhitespace: true
                },
                // Keep level-2 transforms off in fallback mode to avoid risky reordering.
                2: false
            },
            format: false
        }
    }
};

function log(level, message) {
    console.log(`[${level}] ${message}`);
}

function normalizePath(inputPath) {
    return inputPath.replace(/\\/g, '/');
}

function deepMerge(base, override) {
    if (!override) return base;
    const result = { ...base };
    Object.keys(override).forEach((key) => {
        const baseValue = result[key];
        const overrideValue = override[key];
        if (
            baseValue &&
            typeof baseValue === 'object' &&
            !Array.isArray(baseValue) &&
            overrideValue &&
            typeof overrideValue === 'object' &&
            !Array.isArray(overrideValue)
        ) {
            result[key] = deepMerge(baseValue, overrideValue);
            return;
        }
        result[key] = overrideValue;
    });
    return result;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB'];
    const idx = Math.floor(Math.log(bytes) / Math.log(1024));
    const safeIdx = Math.min(idx, units.length - 1);
    return `${(bytes / Math.pow(1024, safeIdx)).toFixed(2)} ${units[safeIdx]}`;
}

function getSavings(originalSize, minifiedSize) {
    const saved = originalSize - minifiedSize;
    const percent = originalSize > 0 ? ((saved / originalSize) * 100).toFixed(1) : '0.0';
    return { saved, percent };
}

function listFilesRecursive(startDir, skipDirs) {
    const absStart = path.resolve(PROJECT_ROOT, startDir);
    if (!fs.existsSync(absStart)) return [];

    const out = [];
    const stack = [absStart];

    while (stack.length > 0) {
        const current = stack.pop();
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            const absPath = path.join(current, entry.name);
            const relPath = normalizePath(path.relative(PROJECT_ROOT, absPath));
            if (entry.isDirectory()) {
                if (skipDirs.includes(entry.name)) continue;
                stack.push(absPath);
                continue;
            }
            out.push(relPath);
        }
    }

    return out;
}

function extractAttribute(tag, attributeName) {
    const match = new RegExp(`${attributeName}\\s*=\\s*["']([^"']+)["']`, 'i').exec(tag);
    return match ? match[1] : null;
}

function resolveLocalAsset(assetRef, htmlDirRel) {
    if (!assetRef) return null;

    const cleanRef = assetRef.split('#')[0].split('?')[0].trim();
    if (!cleanRef) return null;
    if (/^(https?:)?\/\//i.test(cleanRef) || cleanRef.startsWith('data:')) return null;

    let relPath;
    if (cleanRef.startsWith('/')) {
        relPath = cleanRef.slice(1);
    } else {
        relPath = normalizePath(path.join(htmlDirRel, cleanRef));
    }

    const abs = path.resolve(PROJECT_ROOT, relPath);
    if (!abs.startsWith(PROJECT_ROOT)) return null;

    return normalizePath(path.relative(PROJECT_ROOT, abs));
}

function discoverAssetsFromHtml(htmlPathRel) {
    const absHtmlPath = path.resolve(PROJECT_ROOT, htmlPathRel);
    if (!fs.existsSync(absHtmlPath)) return { js: [], css: [] };

    const html = fs.readFileSync(absHtmlPath, 'utf8');
    const htmlDirRel = normalizePath(path.dirname(htmlPathRel));
    const js = new Set();
    const css = new Set();

    const scriptTags = html.match(/<script\b[^>]*>/gi) || [];
    for (const tag of scriptTags) {
        const src = extractAttribute(tag, 'src');
        const local = resolveLocalAsset(src, htmlDirRel);
        if (local && local.endsWith('.js')) js.add(local);
    }

    const linkTags = html.match(/<link\b[^>]*>/gi) || [];
    for (const tag of linkTags) {
        if (!/\brel\s*=\s*["'][^"']*stylesheet[^"']*["']/i.test(tag)) continue;
        const href = extractAttribute(tag, 'href');
        const local = resolveLocalAsset(href, htmlDirRel);
        if (local && local.endsWith('.css')) css.add(local);
    }

    return { js: [...js], css: [...css] };
}

function toSourceAsset(assetPath, ext) {
    if (!assetPath.endsWith(`.${ext}`)) return null;
    if (assetPath.endsWith(`.min.${ext}`)) return assetPath.replace(`.min.${ext}`, `.${ext}`);
    return assetPath;
}

function collectBuildInputs() {
    const discoveredFiles = new Set();
    for (const root of config.discovery.htmlRoots) {
        const files = listFilesRecursive(root, config.discovery.skipDirs);
        files.forEach((file) => discoveredFiles.add(file));
    }
    const htmlFiles = [...discoveredFiles].filter((file) => file.toLowerCase().endsWith('.html'));

    const discoveredJs = new Set();
    const discoveredCss = new Set();

    for (const htmlFile of htmlFiles) {
        const assets = discoverAssetsFromHtml(htmlFile);
        assets.js.forEach((asset) => discoveredJs.add(asset));
        assets.css.forEach((asset) => discoveredCss.add(asset));
    }

    const jsCandidates = new Set([
        ...config.js.explicitInputs.map(normalizePath),
        ...[...discoveredJs].map((asset) => toSourceAsset(asset, 'js')).filter(Boolean)
    ]);
    const cssCandidates = new Set([
        ...config.css.explicitInputs.map(normalizePath),
        ...[...discoveredCss].map((asset) => toSourceAsset(asset, 'css')).filter(Boolean)
    ]);

    const jsInputs = [...jsCandidates]
        .filter((file) => file.endsWith('.js') && !file.endsWith('.min.js'))
        .filter((file) => fs.existsSync(path.resolve(PROJECT_ROOT, file)))
        .sort();

    const cssInputs = [...cssCandidates]
        .filter((file) => file.endsWith('.css') && !file.endsWith('.min.css'))
        .filter((file) => fs.existsSync(path.resolve(PROJECT_ROOT, file)))
        .sort();

    return { htmlFiles, jsInputs, cssInputs };
}

function outputPathFor(sourcePath, suffix) {
    const parsed = path.parse(sourcePath);
    return normalizePath(path.join(parsed.dir, `${parsed.name}${suffix}`));
}

function shouldSkip(filePath, skipList) {
    return skipList.includes(filePath);
}

async function minifyJsFile(filePath) {
    try {
        const source = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(source, 'utf8');

        const override = config.js.overrides[filePath];
        const terserOptions = deepMerge(config.js.terserOptions, override);
        const result = await minify(source, terserOptions);
        if (!result || !result.code) throw new Error('Terser returned empty output');

        const outPath = outputPathFor(filePath, config.js.suffix);
        fs.writeFileSync(outPath, result.code, 'utf8');
        const minifiedSize = Buffer.byteLength(result.code, 'utf8');
        const { saved, percent } = getSavings(originalSize, minifiedSize);

        log('OK', `${filePath} -> ${outPath} (${formatBytes(originalSize)} -> ${formatBytes(minifiedSize)}, -${percent}%, saved ${formatBytes(saved)})`);
        return { success: true, originalSize, minifiedSize };
    } catch (error) {
        log('ERR', `JS minify failed for ${filePath}: ${error.message}`);
        return { success: false, error };
    }
}

function minifyCssWithLightning(filePath, source) {
    const override = config.css.overrides[filePath];
    const lightningOptions = deepMerge(config.css.lightningOptions, override);
    const transformed = transform({
        ...lightningOptions,
        filename: path.resolve(PROJECT_ROOT, filePath),
        code: Buffer.from(source, 'utf8')
    });
    return Buffer.from(transformed.code).toString('utf8');
}

function minifyCssWithCleanCss(source) {
    const result = new CleanCSS(config.css.cleanCssFallbackOptions).minify(source);
    if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors.join(', '));
    }
    return result.styles;
}

function minifyCssFile(filePath) {
    try {
        const source = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(source, 'utf8');
        const forceFallback = config.css.forceCleanCss.includes(filePath);

        let minified = '';
        let engine = 'lightningcss';

        if (forceFallback) {
            minified = minifyCssWithCleanCss(source);
            engine = 'cleancss(forced)';
        } else {
            try {
                minified = minifyCssWithLightning(filePath, source);
            } catch (error) {
                log('WARN', `Lightning CSS failed for ${filePath}, using CleanCSS fallback: ${error.message}`);
                minified = minifyCssWithCleanCss(source);
                engine = 'cleancss(fallback)';
            }
        }

        const outPath = outputPathFor(filePath, config.css.suffix);
        fs.writeFileSync(outPath, minified, 'utf8');
        const minifiedSize = Buffer.byteLength(minified, 'utf8');
        const { saved, percent } = getSavings(originalSize, minifiedSize);

        log('OK', `${filePath} -> ${outPath} [${engine}] (${formatBytes(originalSize)} -> ${formatBytes(minifiedSize)}, -${percent}%, saved ${formatBytes(saved)})`);
        return { success: true, originalSize, minifiedSize };
    } catch (error) {
        log('ERR', `CSS minify failed for ${filePath}: ${error.message}`);
        return { success: false, error };
    }
}

async function build() {
    log('INFO', 'Build started');
    const { htmlFiles, jsInputs, cssInputs } = collectBuildInputs();
    log('INFO', `HTML scanned: ${htmlFiles.length}`);
    log('INFO', `JS inputs: ${jsInputs.length}`);
    log('INFO', `CSS inputs: ${cssInputs.length}`);

    let totalOriginal = 0;
    let totalMinified = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const file of jsInputs) {
        if (shouldSkip(file, config.js.skip)) {
            log('SKIP', `JS ${file}`);
            continue;
        }
        const result = await minifyJsFile(file);
        if (result.success) {
            totalOriginal += result.originalSize;
            totalMinified += result.minifiedSize;
            successCount += 1;
        } else {
            errorCount += 1;
        }
    }

    for (const file of cssInputs) {
        if (shouldSkip(file, config.css.skip)) {
            log('SKIP', `CSS ${file}`);
            continue;
        }
        const result = minifyCssFile(file);
        if (result.success) {
            totalOriginal += result.originalSize;
            totalMinified += result.minifiedSize;
            successCount += 1;
        } else {
            errorCount += 1;
        }
    }

    const { saved, percent } = getSavings(totalOriginal, totalMinified);
    log('INFO', `Processed: ${successCount}, Errors: ${errorCount}`);
    log('INFO', `Total: ${formatBytes(totalOriginal)} -> ${formatBytes(totalMinified)} (saved ${formatBytes(saved)}, -${percent}%)`);

    if (errorCount > 0) {
        process.exitCode = 1;
        log('WARN', 'Build finished with errors');
        return;
    }

    // HTML minification
    if (htmlMinifier) {
        log('INFO', 'Starting HTML minification...');
        let htmlSuccess = 0;
        let htmlOrigTotal = 0;
        let htmlMinTotal = 0;
        const htmlMinifyOptions = {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            collapseBooleanAttributes: true,
            sortAttributes: true,
            sortClassName: true,
            conservativeCollapse: true,
            removeOptionalTags: false,
            preserveLineBreaks: false
        };
        // Only minify HTML files that are NOT in node_modules or .git
        const htmlToMinify = htmlFiles.filter(f => !f.includes('node_modules') && !f.includes('.git') && !f.includes('newsletter-template'));
        for (const htmlFile of htmlToMinify) {
            try {
                const absPath = path.resolve(PROJECT_ROOT, htmlFile);
                const source = fs.readFileSync(absPath, 'utf8');
                const origSize = Buffer.byteLength(source, 'utf8');
                const minified = await htmlMinifier.minify(source, htmlMinifyOptions);
                const minSize = Buffer.byteLength(minified, 'utf8');
                if (minSize < origSize) {
                    fs.writeFileSync(absPath, minified, 'utf8');
                    htmlOrigTotal += origSize;
                    htmlMinTotal += minSize;
                    htmlSuccess++;
                }
            } catch (err) {
                log('WARN', `HTML minify skipped ${htmlFile}: ${err.message}`);
            }
        }
        if (htmlSuccess > 0) {
            const { saved: hSaved, percent: hPercent } = getSavings(htmlOrigTotal, htmlMinTotal);
            log('OK', `HTML: ${htmlSuccess} files minified (${formatBytes(htmlOrigTotal)} -> ${formatBytes(htmlMinTotal)}, -${hPercent}%, saved ${formatBytes(hSaved)})`);
            totalOriginal += htmlOrigTotal;
            totalMinified += htmlMinTotal;
        }
    } else {
        log('INFO', 'html-minifier-terser not installed, skipping HTML minification');
    }

    log('INFO', 'Build finished successfully');
}

build().catch((error) => {
    log('ERR', error.stack || error.message);
    process.exitCode = 1;
});
