const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function getCliArgValue(prefix, args = process.argv.slice(2)) {
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : '';
}

function getPublishDir(args = process.argv.slice(2), env = process.env) {
  const cliOutDir = getCliArgValue('--out-dir=', args);
  return path.resolve(ROOT_DIR, cliOutDir || env.PUBLISH_DIR || '.');
}

module.exports = {
  ROOT_DIR,
  getCliArgValue,
  getPublishDir
};