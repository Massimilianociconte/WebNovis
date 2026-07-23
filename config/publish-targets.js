const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_ROOT = ROOT_DIR;

function getCliArgValue(prefix, args = process.argv.slice(2)) {
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : '';
}

function getPublishDir(args = process.argv.slice(2), env = process.env) {
  const cliOutDir = getCliArgValue('--out-dir=', args);
  return path.resolve(ROOT_DIR, cliOutDir || env.PUBLISH_DIR || '.');
}

function getReportDir(args = process.argv.slice(2), env = process.env) {
  const cliReportDir = getCliArgValue('--report-dir=', args);
  return path.resolve(ROOT_DIR, cliReportDir || env.REPORT_DIR || 'build/public-artifact');
}

function getBuildRoots(args = process.argv.slice(2), env = process.env) {
  return Object.freeze({
    sourceRoot: SOURCE_ROOT,
    publishRoot: getPublishDir(args, env),
    reportRoot: getReportDir(args, env)
  });
}

module.exports = {
  ROOT_DIR,
  SOURCE_ROOT,
  getBuildRoots,
  getCliArgValue,
  getPublishDir,
  getReportDir
};
