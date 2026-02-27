const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const patterns = [
  { name: 'hero rotating with sr-only + aria-hidden', needle: '<span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true">' },
  { name: 'morphing text with sr-only + aria-hidden', needle: '<span class="sr-only">Trasformati</span><span class="morphing-text-container" aria-hidden="true"' },
  { name: 'social mockup figure role img', needle: '<figure aria-label="Simulatore feed Instagram Web Novis — i dati mostrati (like, commenti) sono puramente illustrativi" class="visual-card" role="img">' },
  { name: 'social mockup sr-only figcaption', needle: '<figcaption class="sr-only">Simulazione del feed Instagram di Web Novis con esempi di post social media</figcaption>' },
  { name: 'process structured 5 fasi', needle: 'processo strutturato in 5 fasi' },
  { name: 'process second section differentiated', needle: 'Dal primo incontro alla messa online: trasparenza totale, tempi certi e codice 100% custom.' },
];

for (const p of patterns) {
  const idx = html.indexOf(p.needle);
  console.log('\n===', p.name, '===');
  if (idx === -1) {
    console.log('NOT FOUND');
    continue;
  }
  console.log('index:', idx);
  console.log(html.substring(Math.max(0, idx - 140), Math.min(html.length, idx + p.needle.length + 180)));
}
