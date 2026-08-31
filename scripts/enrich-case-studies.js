#!/usr/bin/env node
/**
 * Arricchisce i case study di portfolio/case-study con:
 *  - sezione "Servizi WebNovis coinvolti" (link editoriali descrittivi ai servizi realmente usati)
 *  - FAQ visibili (<details>) basate sui dati già pubblicati (prezzi di catalogo, tempi, zona)
 *  - la FAQPage corrispondente viene generata dal build (config/seo-html-transforms.js)
 *
 * Uso:
 *   node scripts/enrich-case-studies.js            # scrittura
 *   node scripts/enrich-case-studies.js --dry-run  # solo report
 *
 * Idempotente: il blocco `data-webnovis-case-extra` viene sostituito, non duplicato.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'portfolio', 'case-study');
const DRY_RUN = process.argv.includes('--dry-run');

const SERVICE_LINKS = {
  'sviluppo-web': {
    href: '/servizi/sviluppo-web.html',
    label: 'Sviluppo web su misura',
    desc: 'Progettazione e sviluppo completo, dal design al codice proprietario senza template.'
  },
  'seo-milano': {
    href: '/servizi/seo-milano.html',
    label: 'SEO per farsi trovare',
    desc: 'Ottimizzazione tecnica e locale per aumentare la visibilità su Google.'
  },
  'ecommerce': {
    href: '/servizi/ecommerce.html',
    label: 'E-commerce custom',
    desc: 'Catalogo, pagamenti e spedizioni sotto controllo, senza vincoli di piattaforma.'
  },
  'brand-identity': {
    href: '/servizi/brand-identity.html',
    label: 'Brand identity',
    desc: 'Logo, colori e linee guida per un’identità riconoscibile e coerente.'
  },
  'graphic-design': {
    href: '/servizi/graphic-design.html',
    label: 'Graphic design',
    desc: 'Materiali visivi coordinati con l’identità del progetto.'
  },
  'landing-page': {
    href: '/servizi/landing-page.html',
    label: 'Landing page',
    desc: 'Pagine concentrate su un solo obiettivo: la conversione.'
  },
  'audit-gratuito': {
    href: '/servizi/audit-gratuito.html',
    label: 'Audit gratuito',
    desc: 'Analisi tecnica, contenuti e visibilità del sito attuale.'
  }
};

const FAQ = {
  sito: [
    {
      q: 'Quanto costa realizzare un sito simile?',
      a: 'I prezzi di catalogo WebNovis partono da 500 € per una landing page, 1.200 € per un sito vetrina e 3.500 € per un e-commerce completo. Ogni progetto viene quotato sul perimetro reale con un preventivo gratuito.'
    },
    {
      q: 'Quanto tempo richiede un progetto come questo?',
      a: 'Le stime indicative sono 1-2 settimane per una landing page, 2-3 settimane per un sito vetrina e 4-6 settimane per un e-commerce. Dipendenze, revisioni e integrazioni possono modificare il calendario: i tempi confermati arrivano con la proposta.'
    },
    {
      q: 'Lavorate anche nella zona della mia attività?',
      a: 'Sì. La base operativa è a Rho, nell’hinterland ovest di Milano, e il lavoro viene gestito da remoto con clienti in tutta Italia: dal preventivo alla consegna, tutto il processo si svolge online.'
    }
  ],
  custom: [
    {
      q: 'Quanto costa sviluppare una piattaforma o un’app di questo tipo?',
      a: 'Ogni prodotto digitale viene quotato sul perimetro reale: funzionalità, piattaforme coinvolte e integrazioni. Il preventivo gratuito definisce costi e tempistiche prima dell’avvio, senza costi nascosti in corso d’opera.'
    },
    {
      q: 'Come parte il progetto?',
      a: 'Il processo in 5 fasi parte dall’analisi dei requisiti: scoperta, proposta con milestone condivise, sviluppo con revisioni periodiche, lancio e supporto post-lancio.'
    },
    {
      q: 'Il prodotto resta di proprietà del cliente?',
      a: 'Sì. Il codice è scritto su misura e consegnato al cliente, senza vincoli verso template o piattaforme di terze parti.'
    }
  ]
};

const CASE_EXTRA = {
  'aether-digital.html': {
    services: ['brand-identity', 'sviluppo-web'],
    intro: 'L’identità visiva e il sito di Aether Digital nascono insieme: design e codice sono stati progettati come un unico progetto.',
    faqType: 'custom'
  },
  'arconti31.html': {
    services: ['sviluppo-web', 'seo-milano'],
    intro: 'Il sito di Arconti 31 unisce sviluppo web e visibilità locale per portare online la storia di un pub storico di Gallarate.',
    faqType: 'sito'
  },
  'comeleapi.html': {
    services: ['sviluppo-web', 'seo-milano'],
    intro: 'Il progetto unisce un’esperienza mobile-first alla SEO locale, per far trovare un’attività di benessere tra Bresso e Cusano Milanino.',
    faqType: 'sito'
  },
  'ember-oak.html': {
    services: ['sviluppo-web'],
    intro: 'Il sito di Ember & Oak è stato sviluppato su misura per tradurre online l’esperienza del fine dining.',
    faqType: 'sito'
  },
  'fbtotalsecurity.html': {
    services: ['sviluppo-web', 'seo-milano'],
    intro: 'Il sito corporate di FB Total Security combina sviluppo professionale e SEO tecnica per generare contatti qualificati.',
    faqType: 'sito'
  },
  'lumina-creative.html': {
    services: ['graphic-design', 'sviluppo-web'],
    intro: 'Per Lumina Creative il design e lo sviluppo sono proceduti di pari passo, con un’esperienza immersiva costruita sull’identità dello studio.',
    faqType: 'sito'
  },
  'mikuna.html': {
    services: ['sviluppo-web', 'seo-milano'],
    intro: 'Il sito di Mikuna porta online il ristorante peruviano con menu interattivo e SEO locale per Varese.',
    faqType: 'sito'
  },
  'mimmo-fratelli.html': {
    services: ['ecommerce'],
    intro: 'L’e-commerce di Mimmo Fratelli porta online trent’anni di attività con catalogo, offerte settimanali e consegna a domicilio.',
    faqType: 'sito'
  },
  'momentum.html': {
    services: ['landing-page', 'sviluppo-web'],
    intro: 'Oltre all’app, il progetto Momentum include landing page e blog dedicati per presentare il prodotto e supportarne la crescita.',
    faqType: 'custom'
  },
  'muse-editorial.html': {
    services: ['graphic-design', 'sviluppo-web'],
    intro: 'Il layout editoriale di Muse nasce dal graphic design e diventa un’esperienza di navigazione su misura.',
    faqType: 'sito'
  },
  'popblock-studio.html': {
    services: ['brand-identity', 'graphic-design'],
    intro: 'Il branding neo-brutalista di PopBlock Studio dimostra come un’identità audace possa restare coerente su ogni superficie.',
    faqType: 'sito'
  },
  'quickseo.html': {
    services: ['sviluppo-web', 'audit-gratuito'],
    intro: 'QuickSEO è un prodotto WebNovis: una web app SaaS per analisi SEO tecnica, performance, sicurezza e accessibilità.',
    faqType: 'custom'
  },
  'structure-arch.html': {
    services: ['sviluppo-web', 'graphic-design'],
    intro: 'Il portfolio di Structure traduce la narrazione spaziale dello studio di architettura in un layout orizzontale tecnico.',
    faqType: 'sito'
  },
  'unimidoc.html': {
    services: ['sviluppo-web'],
    intro: 'UnimiDoc è una piattaforma custom per appunti verificati: ricerca per corso, anteprime protette e sistema a crediti.',
    faqType: 'custom'
  }
};

const STYLE_BLOCK =
  '<style data-webnovis-case-extra-style>.case-extra{padding-top:1rem}.case-extra h2{font-size:1.5rem;margin-bottom:.6rem}.case-extra-intro{color:var(--text-muted,rgba(255,255,255,.7));max-width:62ch}.case-extra-list{list-style:none;margin:1.2rem 0 0;padding:0;display:grid;gap:.8rem}.case-extra-list li{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1rem 1.2rem;background:rgba(255,255,255,.03)}.case-extra-list a{font-weight:600;color:#8b8fff;text-decoration:none}.case-extra-list a:hover{text-decoration:underline}.case-extra-list span{display:block;margin-top:.25rem;font-size:.9rem;color:var(--text-muted,rgba(255,255,255,.7))}.case-faq{margin-top:1.6rem;display:grid;gap:.7rem}.case-faq details{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:.9rem 1.1rem;background:rgba(255,255,255,.03)}.case-faq summary{cursor:pointer;font-weight:600;color:var(--white,#fff)}.case-faq details p{margin:.7rem 0 0;color:var(--text-muted,rgba(255,255,255,.75));line-height:1.65}.case-extra-cta{margin-top:1.4rem;font-weight:600}.case-extra-cta a{color:#8b8fff;text-decoration:none}.case-extra-cta a:hover{text-decoration:underline}</style>';

function buildFaqSchema(file, caseData) {
  const canonical = `https://www.webnovis.com/portfolio/case-study/${file}`;
  const mainEntity = FAQ[caseData.faqType]
    .map(
      (f) =>
        `{"@type":"Question","name":${JSON.stringify(f.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(f.a)}}}`
    )
    .join(',');
  return `{"@context":"https://schema.org","@type":"FAQPage","@id":"${canonical}#faq-case-extra","mainEntity":[${mainEntity}]}`;
}

function buildBlock(caseData) {
  const items = caseData.services
    .map((key) => SERVICE_LINKS[key])
    .filter(Boolean)
    .map(
      (s) =>
        `<li><a href="${s.href}">${s.label}</a><span>${s.desc}</span></li>`
    )
    .join('');

  const faqItems = FAQ[caseData.faqType]
    .map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`)
    .join('');

  return `<section class="case-section" data-webnovis-case-extra aria-labelledby="case-extra-title"> <div class="container case-shell"> ${STYLE_BLOCK} <div class="case-extra"> <h2 id="case-extra-title">Servizi WebNovis coinvolti nel progetto</h2> <p class="case-extra-intro">${caseData.intro}</p> <ul class="case-extra-list"> ${items} </ul> <h2 id="case-faq-title" class="case-faq-heading">Domande frequenti su un progetto simile</h2> <div class="case-faq"> ${faqItems} </div> <p class="case-extra-cta">Vuoi un risultato simile per la tua attività? <a href="/preventivo.html">Richiedi un preventivo gratuito</a>.</p> </div> </div> </section>`;
}

function main() {
  const files = fs
    .readdirSync(DIR)
    .filter((name) => name.endsWith('.html'))
    .sort();

  let updated = 0;
  const problems = [];

  for (const file of files) {
    const caseData = CASE_EXTRA[file];
    if (!caseData) {
      problems.push(`${file}: nessuna configurazione CASE_EXTRA (saltato)`);
      continue;
    }

    const filePath = path.join(DIR, file);
    const html = fs.readFileSync(filePath, 'utf8');

    if (!/<section class="cta-inline"/i.test(html)) {
      problems.push(`${file}: sezione cta-inline non trovata (saltato)`);
      continue;
    }

    const missing = caseData.services.filter((key) => !SERVICE_LINKS[key]);
    if (missing.length) {
      problems.push(`${file}: service key sconosciute: ${missing.join(', ')} (saltato)`);
      continue;
    }

    if (DRY_RUN) {
      updated++;
      continue;
    }

    const block = buildBlock(caseData);
    const faqScript = `<script type="application/ld+json" data-webnovis-case-faq>${buildFaqSchema(file, caseData)}</script>`;
    let next;
    if (/data-webnovis-case-extra/i.test(html)) {
      next = html.replace(
        /<section class="case-section" data-webnovis-case-extra[\s\S]*?<\/section>/i,
        block
      );
      next = next.replace(
        /\s*<script type="application\/ld\+json" data-webnovis-case-faq>[\s\S]*?<\/script>/i,
        ''
      );
      next = next.replace('</body>', ` ${faqScript}</body>`);
    } else {
      next = html.replace(
        /<section class="cta-inline"/i,
        `${block} <section class="cta-inline"`
      );
      next = next.replace('</body>', ` ${faqScript}</body>`);
    }

    if (next !== html) {
      fs.writeFileSync(filePath, next, 'utf8');
      updated++;
    }
  }

  console.log(
    `Case study arricchiti: ${updated}/${files.length}${DRY_RUN ? ' (dry-run)' : ''}`
  );
  problems.forEach((p) => console.log(`  ⚠ ${p}`));

  if (!DRY_RUN) {
    const unsynced = files.filter((file) => {
      if (!CASE_EXTRA[file]) return false;
      const html = fs.readFileSync(path.join(DIR, file), 'utf8');
      return !/data-webnovis-case-extra/i.test(html);
    });
    if (unsynced.length) {
      console.error(`FAIL-CLOSED: blocchi mancanti in: ${unsynced.join(', ')}`);
      process.exit(1);
    }
  }
}

main();
