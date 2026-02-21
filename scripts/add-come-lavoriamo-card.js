const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');
let content = fs.readFileSync(filePath, 'utf8');

// The card HTML to inject — inserted as a new section before cta-section
const cardHTML = ` <section class="come-lavoriamo-card-section reveal"> <div class="container"> <div class="come-lavoriamo-glass-card"> <div class="clg-left"> <span class="clg-tag">Il Nostro Metodo</span> <h2 class="clg-title">Come Trasformiamo<br>la Tua Idea in Realtà</h2> <p class="clg-desc">Ogni progetto segue un processo collaudato in 5 fasi: dal brief iniziale al lancio. Trasparenza totale, tempi certi, codice 100% custom. Nessuna sorpresa — solo risultati.</p> <div class="clg-steps"> <div class="clg-step"><span class="clg-step-num">01</span><span class="clg-step-label">Brief &amp; Analisi</span></div> <div class="clg-step"><span class="clg-step-num">02</span><span class="clg-step-label">Wireframe</span></div> <div class="clg-step"><span class="clg-step-num">03</span><span class="clg-step-label">Design</span></div> <div class="clg-step"><span class="clg-step-num">04</span><span class="clg-step-label">Sviluppo</span></div> <div class="clg-step"><span class="clg-step-num">05</span><span class="clg-step-label">Lancio</span></div> </div> <div class="clg-actions"> <a href="come-lavoriamo.html" class="clg-btn-primary">Scopri il Processo <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a> <a href="preventivo.html" class="clg-btn-secondary">Richiedi Preventivo</a> </div> </div> <div class="clg-right" aria-hidden="true"> <div class="clg-visual"> <div class="clg-orb clg-orb-1"></div> <div class="clg-orb clg-orb-2"></div> <div class="clg-timeline-visual"> <div class="clg-tl-item clg-tl-active"><div class="clg-tl-dot"></div><div class="clg-tl-content"><span class="clg-tl-phase">Fase 1</span><span class="clg-tl-name">Brief &amp; Analisi</span><span class="clg-tl-time">1–2 giorni</span></div></div> <div class="clg-tl-item"><div class="clg-tl-dot"></div><div class="clg-tl-content"><span class="clg-tl-phase">Fase 2</span><span class="clg-tl-name">Wireframe</span><span class="clg-tl-time">3–5 giorni</span></div></div> <div class="clg-tl-item"><div class="clg-tl-dot"></div><div class="clg-tl-content"><span class="clg-tl-phase">Fase 3</span><span class="clg-tl-name">Design</span><span class="clg-tl-time">5–7 giorni</span></div></div> <div class="clg-tl-item"><div class="clg-tl-dot"></div><div class="clg-tl-content"><span class="clg-tl-phase">Fase 4</span><span class="clg-tl-name">Sviluppo</span><span class="clg-tl-time">7–14 giorni</span></div></div> <div class="clg-tl-item"><div class="clg-tl-dot"></div><div class="clg-tl-content"><span class="clg-tl-phase">Fase 5</span><span class="clg-tl-name">Lancio</span><span class="clg-tl-time">1–2 giorni</span></div></div> </div> <div class="clg-avail-badge"><span class="clg-pulse"></span><span>Disponibilità limitata — nuovi slot mensili</span></div> </div> </div> </div> </div> </section>`;

// The CSS to inject into the existing <style> block in <head>
// We'll append it just before the closing </style> of the last inline style block
const cardCSS = `
.come-lavoriamo-card-section{padding:5rem 0}
.come-lavoriamo-glass-card{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;background:rgba(255,255,255,.04);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:3rem 3.5rem;position:relative;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.08)}
.come-lavoriamo-glass-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),rgba(91,106,174,.3),rgba(255,255,255,.15),transparent)}
.come-lavoriamo-glass-card::after{content:'';position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(91,106,174,.12) 0,transparent 70%);pointer-events:none}
@media(max-width:900px){.come-lavoriamo-glass-card{grid-template-columns:1fr;padding:2rem 1.75rem;gap:2rem}}
.clg-tag{display:inline-block;padding:.3rem .9rem;background:rgba(91,106,174,.15);border:1px solid rgba(91,106,174,.25);border-radius:50px;font-size:.78rem;font-weight:600;color:var(--primary-light);letter-spacing:.06em;text-transform:uppercase;margin-bottom:1rem}
.clg-title{font-family:Syne,sans-serif;font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:800;color:var(--white);line-height:1.1;margin-bottom:1rem}
.clg-desc{font-size:.97rem;color:var(--gray-light);line-height:1.75;margin-bottom:1.75rem;max-width:420px}
.clg-steps{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem}
.clg-step{display:flex;align-items:center;gap:.4rem;padding:.35rem .75rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;transition:border-color .25s,background .25s}
.clg-step:hover{border-color:rgba(91,106,174,.3);background:rgba(91,106,174,.08)}
.clg-step-num{font-family:Syne,sans-serif;font-size:.7rem;font-weight:800;color:var(--primary-light)}
.clg-step-label{font-size:.8rem;color:var(--gray-light)}
.clg-actions{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center}
.clg-btn-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:var(--gradient-brand);color:#fff;border-radius:12px;font-family:Syne,sans-serif;font-size:.95rem;font-weight:700;text-decoration:none;transition:transform .2s,box-shadow .2s}
.clg-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(91,106,174,.35)}
.clg-btn-primary svg{flex-shrink:0}
.clg-btn-secondary{display:inline-flex;align-items:center;padding:.75rem 1.5rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:var(--white);border-radius:12px;font-family:Syne,sans-serif;font-size:.95rem;font-weight:600;text-decoration:none;transition:all .2s;backdrop-filter:blur(8px)}
.clg-btn-secondary:hover{border-color:rgba(91,106,174,.4);background:rgba(91,106,174,.1)}
.clg-right{position:relative}
.clg-visual{position:relative;padding:1.5rem}
.clg-orb{position:absolute;border-radius:50%;pointer-events:none}
.clg-orb-1{width:200px;height:200px;top:-40px;right:-40px;background:radial-gradient(circle,rgba(91,106,174,.18) 0,transparent 70%)}
.clg-orb-2{width:140px;height:140px;bottom:-20px;left:-20px;background:radial-gradient(circle,rgba(37,99,235,.12) 0,transparent 70%)}
.clg-timeline-visual{display:flex;flex-direction:column;gap:.6rem;position:relative;z-index:1}
.clg-tl-item{display:flex;align-items:center;gap:.75rem;padding:.6rem 1rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;transition:all .3s;backdrop-filter:blur(8px)}
.clg-tl-item:hover,.clg-tl-active{background:rgba(91,106,174,.08);border-color:rgba(91,106,174,.2)}
.clg-tl-dot{width:10px;height:10px;min-width:10px;border-radius:50%;background:rgba(91,106,174,.3);border:2px solid rgba(91,106,174,.4);flex-shrink:0}
.clg-tl-active .clg-tl-dot{background:var(--primary-light);border-color:var(--primary-light);box-shadow:0 0 8px rgba(91,106,174,.5)}
.clg-tl-content{display:flex;align-items:center;gap:.5rem;flex:1;min-width:0}
.clg-tl-phase{font-size:.7rem;font-weight:700;color:var(--primary-light);white-space:nowrap}
.clg-tl-name{font-size:.85rem;font-weight:600;color:var(--white);flex:1}
.clg-tl-time{font-size:.72rem;color:var(--gray-light);white-space:nowrap}
.clg-avail-badge{display:inline-flex;align-items:center;gap:.5rem;margin-top:1rem;padding:.4rem 1rem;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:50px;font-size:.78rem;color:#4ade80;backdrop-filter:blur(8px)}
.clg-pulse{width:8px;height:8px;min-width:8px;border-radius:50%;background:#22c55e;animation:clg-pulse 2s ease-out infinite;flex-shrink:0}
@keyframes clg-pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
@media(max-width:600px){.clg-right{display:none}}
`;

// 1. Insert the card section before <section class="cta-section">
const ctaAnchor = '<section class="cta-section">';
if (!content.includes(ctaAnchor)) {
    console.error('ERROR: cta-section anchor not found in index.html');
    process.exit(1);
}
content = content.replace(ctaAnchor, cardHTML + ' ' + ctaAnchor);

// 2. Inject CSS into the last </style> before </head>
// Find the last </style> in the <head> section
const headEnd = content.indexOf('</head>');
const lastStyleClose = content.lastIndexOf('</style>', headEnd);
if (lastStyleClose === -1) {
    console.error('ERROR: </style> not found before </head>');
    process.exit(1);
}
content = content.substring(0, lastStyleClose) + cardCSS + '</style>' + content.substring(lastStyleClose + 8);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. Card + CSS injected into index.html');
