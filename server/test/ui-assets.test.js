const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const appRoot = path.join(root, 'src/app');
const assetRoot = path.join(root, 'src/assets');
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) walk(file);
    else if (/\.(html|ts)$/.test(name)) files.push(file);
  }
}
walk(appRoot);
const refs = new Set();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(new RegExp('(?:src/assets/)?images/svgelements/([A-Za-z0-9_./-]+\\.svg)', 'g'))) refs.add(match[1]);
}
for (const rel of refs) assert.ok(fs.existsSync(path.join(assetRoot, 'images/svgelements', rel)), `missing UI asset: ${rel}`);
const allAssets = [];
function list(dir) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) list(file);
    else if (name.endsWith('.svg')) allAssets.push(file);
  }
}
list(path.join(assetRoot, 'images/svgelements'));
console.log(`UI assets: ${allAssets.length} SVG files; ${refs.size} literal references verified.`);
console.log('Dynamic/non-literal references require manual inspection and are not inferred by this test.');
