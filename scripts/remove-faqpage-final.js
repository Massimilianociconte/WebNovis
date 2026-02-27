const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(d) {
  let r = [];
  try {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.name.startsWith('.') || ['node_modules','Img','css','js','fonts','docs','scripts','tests','test-SEO'].includes(e.name)) continue;
      if (e.isDirectory()) r = r.concat(walk(f));
      else if (e.name.endsWith('.html')) r.push(f);
    }
  } catch(e) {}
  return r;
}

const files = walk(ROOT);
let fixed = 0;

for (const f of files) {
  let c = fs.readFileSync(f, 'utf-8');
  if (!c.includes('FAQPage')) continue;
  
  // Remove any script block containing FAQPage - handles both minified and multi-line
  const before = c;
  
  // Pattern 1: single-line script blocks
  c = c.replace(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>\s*\{[^<]*?"@type"\s*:\s*"FAQPage"[^<]*?<\/script>/g, '');
  
  // Pattern 2: multi-line with whitespace  
  c = c.replace(/<script\s+type="application\/ld\+json">\s*\{\s*"@context"\s*:\s*"https:\/\/schema\.org"\s*,\s*"@type"\s*:\s*"FAQPage"[\s\S]*?<\/script>/g, '');
  
  if (c !== before) {
    fs.writeFileSync(f, c, 'utf-8');
    fixed++;
    console.log('Fixed:', path.relative(ROOT, f));
  }
}

console.log('\nTotal fixed:', fixed);
