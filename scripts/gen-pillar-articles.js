/**
 * Generate 4 pillar blog articles from existing blog article template
 * Uses the same HTML/CSS/schema patterns as build-articles.js output
 * Run: node scripts/gen-pillar-articles.js
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const SITE = 'https://www.webnovis.com';
const TODAY_ISO = '2026-02-21';
const TODAY_HUMAN = '21 Febbraio 2026';

// Read an existing article to extract the head/nav/footer template
const existingArticle = fs.readFileSync(path.join(BLOG_DIR, 'come-scegliere-web-agency.html'), 'utf8');

// Extract head (up to </head>)
const headEnd = existingArticle.indexOf('</head>');
const templateHead = existingArticle.substring(0, headEnd);

// Extract nav (from <body> to <main>)
const bodyStart = existingArticle.indexOf('<body>');
const mainStart = existingArticle.indexOf('<main>');
const templateNav = existingArticle.substring(bodyStart, mainStart);

// Extract footer (from <footer to </footer>)
const footerStart = existingArticle.indexOf('<footer');
const footerEnd = existingArticle.indexOf('</footer>') + '</footer>'.length;
const templateFooter = existingArticle.substring(footerStart, footerEnd);

// Extract after-footer (scripts, speculation rules, closing tags)
const afterFooter = existingArticle.substring(footerEnd);
// Get just the scripts portion (before </body>)
const bodyEnd = afterFooter.indexOf('</body>');
const templateScripts = afterFooter.substring(0, bodyEnd);

const AUTHOR = {
    id: `${SITE}/#author-webnovis-editorial-team`,
    name: 'WebNovis Editorial Team',
    url: `${SITE}/chi-siamo.html`,
    image: `${SITE}/Img/webnovis-logo-bianco.png`,
    sameAs: ['https://www.instagram.com/web.novis', 'https://www.facebook.com/share/1C7hNnkqEU/'],
    knowsAbout: ['SEO', 'Web Development', 'E-commerce', 'Brand Identity', 'Social Media Management', 'Core Web Vitals', 'Digital Marketing']
};

const SOURCES = [
    { name: 'Google Search Central', url: 'https://developers.google.com/search' },
    { name: 'web.dev — Core Web Vitals', url: 'https://web.dev/vitals/' },
    { name: 'Google Business Profile Help', url: 'https://support.google.com/business' }
];

// ─── Article Definitions ─────────────────────────────────────────────

const articles = [
    {
        slug: 'sito-web-che-non-converte',
        title: 'Sito Web che Non Converte: 15 Cause e Come Risolverle',
        description: 'Il tuo sito ha traffico ma non genera contatti? Ecco le 15 cause più comuni e le soluzioni pratiche per trasformare i visitatori in clienti.',
        tag: 'Conversioni',
        readTime: '14 min',
        serviceLink: '../servizi/sviluppo-web.html',
        faq: [
            { q: 'Perché il mio sito web non genera contatti?', a: 'Le cause più comuni sono: CTA poco visibili, form troppo lunghi, tempi di caricamento lenti (LCP > 2.5s), assenza di social proof, navigazione confusa e mancanza di una proposta di valore chiara above the fold. Un audit CRO identifica i problemi specifici del tuo sito.' },
            { q: 'Qual è un buon tasso di conversione per un sito web?', a: 'Per un sito B2B di servizi, un buon tasso è 2-5%. Per e-commerce, 1-3%. Per landing page, 5-15%. Se sei sotto queste soglie, c\'è margine di miglioramento significativo con interventi mirati su UX, copy e performance.' },
            { q: 'Quanto costa ottimizzare un sito per le conversioni?', a: 'Un audit CRO professionale costa €500-1.500. Le correzioni variano: interventi UX minori (CTA, form, copy) costano €500-1.500, un restyling orientato alla conversione da €2.000-5.000. Il ROI è misurabile: anche +1% di conversione può valere migliaia di euro/anno.' }
        ],
        content: `
<p>Il tuo sito riceve visite ma non genera richieste di preventivo, contatti o vendite? Non sei solo: secondo uno studio di Unbounce (2024), il <strong>tasso di conversione medio dei siti web è solo il 2.35%</strong>. Significa che su 100 visitatori, meno di 3 compiono l'azione desiderata. Ma con gli interventi giusti, puoi migliorare drasticamente questo numero.</p>
<p>In questa guida analizziamo le <strong>15 cause più comuni</strong> per cui un sito non converte e le soluzioni pratiche per ognuna.</p>

<h2>1. Proposta di Valore Poco Chiara</h2>
<p>Il visitatore arriva sul tuo sito e in 3 secondi deve capire: <strong>cosa fai, per chi lo fai e perché dovrebbe sceglierti</strong>. Se la tua homepage apre con "Benvenuti nel nostro sito" invece di "Sviluppiamo siti web che generano clienti per PMI milanesi — da €1.200", hai perso il 60% dei visitatori.</p>
<p><strong>Soluzione</strong>: riscrivi l'hero section con una value proposition specifica, quantificata e rivolta al tuo target. Testa con persone esterne: se non capiscono cosa offri in 5 secondi, il copy non funziona.</p>

<h2>2. CTA (Call to Action) Invisibili o Generiche</h2>
<p>Bottoni con testo come "Clicca qui" o "Scopri di più" non comunicano valore. E se il bottone è dello stesso colore dello sfondo, nessuno lo vede.</p>
<p><strong>Soluzione</strong>: usa CTA specifiche e orientate al beneficio: <em>"Richiedi Preventivo Gratuito"</em>, <em>"Scarica la Checklist"</em>, <em>"Prenota la Call Gratuita"</em>. Il bottone deve avere contrasto elevato (≥4.5:1) e essere visibile above the fold.</p>

<h2>3. Velocità di Caricamento Lenta</h2>
<p>Google riporta che il <strong>53% degli utenti mobile abbandona un sito che impiega più di 3 secondi</strong> a caricarsi (fonte: Think with Google). Ogni secondo aggiuntivo di LCP riduce le conversioni del 7%.</p>
<p><strong>Soluzione</strong>: ottimizza le immagini (WebP/AVIF), minimizza CSS/JS, usa lazy loading, implementa un CDN. Target: LCP < 2.5 secondi. Verifica con <a href="https://pagespeed.web.dev" target="_blank" rel="noopener">PageSpeed Insights</a>.</p>

<h2>4. Form di Contatto Troppo Lungo</h2>
<p>Ogni campo aggiuntivo in un form riduce le conversioni del 4-7% (fonte: HubSpot, 2024). Un form con 10 campi ha un tasso di completamento del 15-20% — uno con 3 campi raggiunge il 60-70%.</p>
<p><strong>Soluzione</strong>: riduci i campi al minimo essenziale: nome, email, messaggio. Aggiungi campi opzionali solo se strettamente necessari. Usa placeholder chiari e validazione in tempo reale.</p>

<h2>5. Nessuna Social Proof</h2>
<p>Il 92% dei consumatori legge le recensioni online prima di acquistare (BrightLocal, 2024). Se il tuo sito non mostra testimonianze, recensioni, loghi clienti o numeri concreti, il visitatore non ha motivo di fidarsi.</p>
<p><strong>Soluzione</strong>: aggiungi testimonianze con nome, foto e risultati specifici. Integra badge Google Reviews, Trustpilot o DesignRush. Mostra numeri: "50+ progetti completati", "4.9/5 valutazione media".</p>

<h2>6. Design Non Responsive (Mobile)</h2>
<p>Il <strong>63% del traffico web italiano arriva da mobile</strong> (StatCounter, 2025). Se il tuo sito non è ottimizzato per smartphone — testo troppo piccolo, bottoni non cliccabili, layout rotto — perdi la maggioranza dei visitatori.</p>
<p><strong>Soluzione</strong>: design mobile-first. Testa il sito su dispositivi reali (non solo ridimensionando il browser). Bottoni almeno 44x44px, testo minimo 16px, layout a colonna singola su mobile.</p>

<h2>7. Navigazione Confusa</h2>
<p>Se il visitatore non trova la pagina che cerca in 2 click, se ne va. Menu con troppe voci, etichette ambigue ("Soluzioni" invece di "Servizi") e assenza di breadcrumb generano frustrazione.</p>
<p><strong>Soluzione</strong>: massimo 5-7 voci nel menu principale. Etichette chiare e comuni. Breadcrumb su tutte le pagine interne. Aggiungi una funzione di ricerca per siti con molti contenuti.</p>

<h2>8. Contenuto Generico e Non Differenziante</h2>
<p>Testi tipo "Siamo un'azienda leader nel settore con anni di esperienza" non dicono nulla e non ti distinguono dai 10.000 competitor che scrivono la stessa cosa.</p>
<p><strong>Soluzione</strong>: parla dei problemi specifici del tuo cliente target. Usa numeri, casi concreti, risultati misurabili. Invece di "Siamo i migliori", scrivi "Abbiamo aumentato le conversioni del 34% per FB Total Security in 90 giorni".</p>

<h2>9. Assenza di Urgenza o Scarcity</h2>
<p>"Lo faccio dopo" è il nemico della conversione. Senza un motivo per agire adesso, il visitatore rimanda — e non torna.</p>
<p><strong>Soluzione</strong>: aggiungi elementi di urgenza onesti: "Preventivo gratuito — risposta entro 24h", "Solo 3 slot disponibili questo mese", "Prezzo bloccato fino al [data]". Non inventare scarcity falsa — danneggia la credibilità.</p>

<h2>10. Pagina "Chi Siamo" che Non Costruisce Fiducia</h2>
<p>La pagina Chi Siamo è la 2ª più visitata dopo l'homepage (fonte: KoMarketing). Se è vuota, generica o senza foto reali, il visitatore percepisce il sito come poco affidabile.</p>
<p><strong>Soluzione</strong>: mostra il team reale (nomi, foto, ruoli), la storia dell'azienda, i valori concreti. Aggiungi certificazioni, premi, partnership. Collega ai profili LinkedIn per trasparenza.</p>

<h2>11. Nessuna Pagina di Servizio Dedicata</h2>
<p>Se tutti i tuoi servizi sono in una pagina unica con 3 righe ciascuno, Google non può posizionarti per nessuna keyword specifica. E il visitatore non trova le informazioni che cerca.</p>
<p><strong>Soluzione</strong>: crea una pagina dedicata per ogni servizio con 800+ parole di contenuto unico, pricing trasparente, FAQ, CTA e schema markup Service. Ogni pagina = una keyword target.</p>

<h2>12. Pop-up Aggressivi e Cookie Banner Invasivi</h2>
<p>Pop-up che coprono l'intero schermo nei primi 3 secondi generano un bounce rate del 70%+ (fonte: Sumo, 2023). Google penalizza anche i siti con interstitial invasivi su mobile.</p>
<p><strong>Soluzione</strong>: cookie banner minimale e non bloccante. Pop-up solo dopo 30-60 secondi di navigazione o al 50% di scroll. Exit-intent solo su desktop. Rispetta sempre il "No grazie".</p>

<h2>13. Assenza di Contenuto Educativo</h2>
<p>Un visitatore che arriva da Google con una ricerca informativa ("quanto costa un sito web") non è pronto a comprare subito. Se non trovi contenuti che lo educano e lo portano verso la decisione, lo perdi.</p>
<p><strong>Soluzione</strong>: crea un blog con articoli che rispondono alle domande del tuo pubblico target. Inserisci CTA morbide ("Vuoi saperne di più? Scarica la guida gratuita") che convertono il lettore in lead.</p>

<h2>14. Zero Tracking e Zero Dati</h2>
<p>Se non sai da dove arrivano i tuoi visitatori, cosa fanno sul sito e dove escono, stai ottimizzando alla cieca.</p>
<p><strong>Soluzione</strong>: installa Google Analytics 4 e Microsoft Clarity. Configura gli eventi di conversione (form submit, click CTA, scroll profondità). Analizza i dati mensilmente e agisci sui pattern.</p>

<h2>15. Sito Vecchio e Non Aggiornato</h2>
<p>Un sito con copyright "2019" e contenuti datati comunica abbandono. I visitatori (e Google) interpretano l'assenza di aggiornamenti come segnale di inaffidabilità.</p>
<p><strong>Soluzione</strong>: aggiorna il copyright, pubblica contenuti freschi regolarmente, aggiorna i prezzi e le testimonianze. Considera un <a href="../blog/restyling-sito-web-quando-farlo.html">restyling completo</a> se il design ha più di 3 anni.</p>

<h2>Checklist Rapida: Il Tuo Sito Converte?</h2>
<ol>
<li>La value proposition è chiara in 5 secondi?</li>
<li>La CTA principale è visibile above the fold?</li>
<li>Il sito si carica in meno di 2.5 secondi?</li>
<li>Il form ha massimo 3-4 campi?</li>
<li>Ci sono testimonianze e social proof?</li>
<li>Il sito è perfetto su mobile?</li>
<li>La navigazione è intuitiva (max 5-7 voci)?</li>
<li>I contenuti sono specifici e differenzianti?</li>
<li>C'è un motivo per agire adesso?</li>
<li>La pagina Chi Siamo costruisce fiducia?</li>
<li>Ogni servizio ha una pagina dedicata?</li>
<li>Nessun pop-up aggressivo nei primi 30 secondi?</li>
<li>Il blog educa e guida verso la conversione?</li>
<li>GA4 e Clarity sono configurati con eventi?</li>
<li>Il sito è aggiornato con contenuti freschi?</li>
</ol>

<p>Se hai risposto "no" a 3+ punti, il tuo sito ha margine di miglioramento significativo. In <a href="../chi-siamo.html">WebNovis</a> integriamo ogni ottimizzazione CRO fin dalla progettazione del sito. <a href="../servizi/sviluppo-web.html">Scopri i nostri servizi di sviluppo web →</a></p>`,
        relatedArticles: [
            { slug: 'ottimizzazione-tasso-conversione', title: 'CRO: Ottimizzare il Tasso di Conversione', desc: 'Strategie avanzate di conversion rate optimization.' },
            { slug: 'errori-comuni-siti-web', title: '10 Errori Comuni nei Siti Web', desc: 'Gli errori che ti fanno perdere clienti e posizionamento.' },
            { slug: 'call-to-action-efficaci', title: 'Call to Action Efficaci', desc: 'Come scrivere CTA che convertono davvero.' }
        ]
    },
    {
        slug: 'sanzioni-sito-non-accessibile-2026',
        title: 'Sanzioni Sito Non Accessibile nel 2026: Importi, Rischi e Come Adeguarsi',
        description: 'L\'European Accessibility Act è in vigore. Sanzioni da €5.000 a €40.000 per siti non conformi. Chi è obbligato, come adeguarsi e quanto costa.',
        tag: 'Web Development',
        readTime: '12 min',
        serviceLink: '../servizi/accessibilita.html',
        faq: [
            { q: 'Quanto costano le sanzioni per un sito non accessibile in Italia?', a: 'AgID (Agenzia per l\'Italia Digitale) può comminare sanzioni da €5.000 a €40.000 per violazione accertata dell\'European Accessibility Act (D.Lgs. 82/2022). Nei casi più gravi può ordinare la sospensione del servizio digitale.' },
            { q: 'Chi è obbligato a rendere il sito accessibile nel 2026?', a: 'Tutti i fornitori di servizi digitali e e-commerce con più di 10 dipendenti O fatturato superiore a €2 milioni. Le micro-imprese hanno esoneri parziali ma l\'accessibilità resta una best practice SEO e UX.' },
            { q: 'Quanto costa rendere un sito accessibile?', a: 'Un audit WCAG 2.1 AA professionale costa da €890. L\'adeguamento completo parte da €1.500 per un sito vetrina. Il monitoraggio continuo da €49/mese. L\'investimento si ripaga con +12% di traffico organico medio e zero rischio sanzioni.' }
        ],
        content: `
<p>Dal <strong>28 giugno 2025</strong> l'European Accessibility Act (EAA) è pienamente in vigore in tutta l'Unione Europea. In Italia è stato recepito con il <strong>D.Lgs. 82/2022</strong> e affida ad AgID (Agenzia per l'Italia Digitale) il compito di vigilare e sanzionare. Se il tuo sito web o e-commerce non è conforme allo standard WCAG 2.1 AA, rischi sanzioni fino a <strong>€40.000</strong>.</p>
<p>In questa guida facciamo chiarezza: chi è obbligato, quali sono le sanzioni concrete, i settori più a rischio e come adeguarsi rapidamente.</p>

<h2>Cos'è l'European Accessibility Act (EAA)?</h2>
<p>L'EAA (Direttiva UE 2019/882) è una direttiva europea che impone l'accessibilità di prodotti e servizi digitali per le persone con disabilità. Lo standard tecnico di riferimento è il <strong>WCAG 2.1 livello AA</strong> (Web Content Accessibility Guidelines del W3C).</p>
<p>L'obiettivo è garantire che oltre <strong>87 milioni di persone con disabilità</strong> nell'UE possano utilizzare siti web, e-commerce, app bancarie, servizi di trasporto e commercio elettronico senza barriere.</p>

<h2>Le Sanzioni in Italia: Importi e Meccanismo</h2>
<p>In Italia, l'ente di vigilanza è <strong>AgID</strong>, che può:</p>
<ul>
<li><strong>Sanzione pecuniaria</strong>: da €5.000 a €40.000 per violazione accertata</li>
<li><strong>Ordine di adeguamento</strong>: con termine perentorio per correggere le violazioni</li>
<li><strong>Sospensione del servizio</strong>: nei casi più gravi o di reiterazione</li>
<li><strong>Pubblicazione del provvedimento</strong>: danno reputazionale pubblico</li>
</ul>
<p>Le sanzioni sono <strong>per violazione</strong>, il che significa che un sito con 10 pagine non conformi può ricevere sanzioni cumulative. AgID può effettuare controlli d'ufficio o su segnalazione di utenti.</p>

<h2>Chi è Obbligato? I Soggetti della Normativa</h2>
<h3>Obbligati</h3>
<ul>
<li>E-commerce e negozi online</li>
<li>Servizi bancari e finanziari digitali</li>
<li>Servizi di trasporto (biglietterie online)</li>
<li>Servizi di telecomunicazione</li>
<li>Piattaforme SaaS e servizi digitali B2C</li>
<li>Pubbliche Amministrazioni (già obbligate dal D.Lgs. 106/2018)</li>
</ul>

<h3>Esoneri (parziali)</h3>
<p><strong>Micro-imprese</strong> con meno di 10 dipendenti E fatturato annuo inferiore a €2 milioni hanno esoneri parziali dalla normativa EAA. Tuttavia:</p>
<ul>
<li>Se il tuo sito vende online, l'esonero potrebbe non applicarsi integralmente</li>
<li>L'accessibilità migliora la SEO (+12% traffico organico medio, fonte: Deque Systems 2024)</li>
<li>Google considera l'accessibilità un segnale di qualità nell'algoritmo</li>
<li>Un sito accessibile ha migliore usabilità per tutti gli utenti, non solo disabili</li>
</ul>

<h2>I 4 Settori Più a Rischio nel 2026</h2>
<h3>1. E-commerce</h3>
<p>I negozi online sono il target primario dell'EAA. Problemi comuni: checkout non navigabile da tastiera, immagini prodotto senza alt text, filtri non accessibili, form di pagamento non compatibili con screen reader.</p>

<h3>2. Servizi Professionali (Studi, Consulenti)</h3>
<p>Siti di studi legali, commercialisti, medici con aree riservate o prenotazioni online. Spesso costruiti con template WordPress non accessibili.</p>

<h3>3. Hospitality e Ristorazione</h3>
<p>Sistemi di prenotazione online, menù digitali, booking engine. Particolarmente a rischio i siti con menù in PDF (inaccessibili agli screen reader) e form di prenotazione non etichettati.</p>

<h3>4. SaaS e Servizi Digitali</h3>
<p>Dashboard, pannelli utente, web app. La complessità dell'interfaccia moltiplica i punti di non conformità.</p>

<h2>Lo Stato dell'Accessibilità in Italia: I Numeri</h2>
<p>Secondo il rapporto <strong>WebAIM Million 2025</strong>:</p>
<ul>
<li>Il <strong>96.3%</strong> delle homepage analizzate ha almeno un errore WCAG rilevabile automaticamente</li>
<li>La media è di <strong>56.8 errori per homepage</strong></li>
<li>Gli errori più comuni: contrasto insufficiente (83%), immagini senza alt text (58%), link vuoti (50%), label mancanti nei form (46%)</li>
<li>L'Italia ha un punteggio di compliance tra i più bassi in Europa</li>
</ul>

<h2>Come Adeguarsi: Roadmap Pratica</h2>
<h3>Step 1: Audit Iniziale (Settimana 1)</h3>
<p>Esegui un audit completo del sito con strumenti automatici (axe DevTools, Lighthouse, WAVE) e verifica manuale con screen reader (NVDA su Windows, VoiceOver su Mac). Documenta tutte le violazioni per priorità.</p>

<h3>Step 2: Correzioni Critiche (Settimane 2-3)</h3>
<p>Inizia dalle violazioni ad alto impatto: contrasto colori, alt text per immagini, label dei form, navigazione da tastiera, struttura heading (H1-H6), lingua della pagina dichiarata.</p>

<h3>Step 3: Correzioni Avanzate (Settimane 3-6)</h3>
<p>Focus management, ARIA roles per componenti interattivi, tabelle accessibili, media con sottotitoli, gestione errori nei form con messaggi descrittivi.</p>

<h3>Step 4: Dichiarazione di Accessibilità (Settimana 6)</h3>
<p>Pubblica la Dichiarazione di Accessibilità conforme al modello AgID sul tuo sito. È obbligatoria e deve essere aggiornata annualmente.</p>

<h3>Step 5: Monitoraggio Continuo</h3>
<p>L'accessibilità non è un progetto una tantum. Ogni nuovo contenuto, prodotto o aggiornamento può introdurre nuove violazioni. Scansione automatica mensile + verifica manuale trimestrale.</p>

<h2>Quanto Costa l'Adeguamento?</h2>
<table style="width:100%;border-collapse:collapse;margin:1.5rem 0">
<thead><tr style="border-bottom:2px solid rgba(255,255,255,.1)">
<th style="text-align:left;padding:.75rem;color:var(--white)">Intervento</th>
<th style="text-align:left;padding:.75rem;color:var(--white)">Costo</th>
<th style="text-align:left;padding:.75rem;color:var(--white)">Tempistica</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid rgba(255,255,255,.06)"><td style="padding:.75rem">Audit WCAG 2.1 AA completo</td><td style="padding:.75rem">Da €890</td><td style="padding:.75rem">5-7 giorni</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,.06)"><td style="padding:.75rem">Adeguamento sito vetrina (5-10 pagine)</td><td style="padding:.75rem">€1.500-3.000</td><td style="padding:.75rem">1-2 settimane</td></tr>
<tr style="border-bottom:1px solid rgba(255,255,255,.06)"><td style="padding:.75rem">Adeguamento e-commerce</td><td style="padding:.75rem">€3.000-8.000</td><td style="padding:.75rem">4-8 settimane</td></tr>
<tr><td style="padding:.75rem">Monitoraggio continuo</td><td style="padding:.75rem">€49/mese</td><td style="padding:.75rem">Continuativo</td></tr>
</tbody></table>

<p><strong>Il costo dell'adeguamento è sempre inferiore alla sanzione minima (€5.000)</strong>. E il beneficio SEO (+12% traffico organico) rende l'investimento positivo anche senza considerare il rischio legale.</p>

<h2>Accessibilità e SEO: Il Bonus Nascosto</h2>
<p>L'accessibilità e la SEO condividono molte best practice:</p>
<ul>
<li><strong>Struttura heading</strong>: heading gerarchici H1-H6 aiutano sia screen reader che Google</li>
<li><strong>Alt text</strong>: descrizioni immagini utili per utenti non vedenti e per Google Images</li>
<li><strong>HTML semantico</strong>: tag corretti (nav, main, article, aside) migliorano comprensione per tutti</li>
<li><strong>Performance</strong>: siti veloci sono più accessibili e meglio posizionati</li>
<li><strong>Mobile-first</strong>: design responsive è sia accessibilità che ranking factor</li>
</ul>

<p>Investire nell'accessibilità è investire nella SEO. In <a href="../chi-siamo.html">WebNovis</a> integriamo l'accessibilità in ogni progetto web fin dalla fase di design. <a href="../servizi/accessibilita.html">Scopri il nostro servizio di compliance EAA →</a></p>`,
        relatedArticles: [
            { slug: 'european-accessibility-act-siti-web', title: 'European Accessibility Act e Siti Web', desc: 'Tutto quello che devi sapere sull\'EAA.' },
            { slug: 'normativa-accessibilita-web-2026', title: 'Normativa Accessibilità Web 2026', desc: 'Aggiornamenti normativi e scadenze.' },
            { slug: 'obblighi-legge-accessibilita-siti', title: 'Obblighi di Legge Accessibilità Siti', desc: 'Chi deve adeguarsi e come.' }
        ]
    }
];

// ─── Build each article ──────────────────────────────────────────────

function buildArticleHtml(article) {
    const canonical = `${SITE}/blog/${article.slug}.html`;
    
    // Adapt head
    let head = templateHead
        .replace(/<title>[^<]+<\/title>/, `<title>${article.title} | Blog WebNovis</title>`)
        .replace(/content="[^"]*" name="description"/, `content="${article.description}" name="description"`)
        .replace(/content="[^"]*" name="keywords"/, `content="${article.tag}, WebNovis, Agenzia Web, SEO, GEO" name="keywords"`)
        .replace(/href="https:\/\/www\.webnovis\.com\/blog\/[^"]*"/g, `href="${canonical}"`)
        .replace(/content="https:\/\/www\.webnovis\.com\/blog\/[^"]*"/g, `content="${canonical}"`)
        .replace(/content="[^"]*" property="og:title"/, `content="${article.title}" property="og:title"`)
        .replace(/content="[^"]*" property="og:description"/, `content="${article.description}" property="og:description"`);
    
    // Breadcrumb + main content
    const breadcrumb = `<main><div class="container breadcrumb"><a href="../">Home</a><span class="separator">/</span><a href="index.html">Blog</a><span class="separator">/</span><span class="current-page">${article.title.split(':')[0].trim()}</span></div>`;
    
    const heroSection = `<article class="blog-article"><div class="container"><div class="article-header"><span class="section-tag">${article.tag}</span><h1>${article.title}</h1><div class="article-meta"><time datetime="${TODAY_ISO}">${TODAY_HUMAN}</time><span class="separator">·</span><span>${article.readTime} di lettura</span></div></div><div class="article-content">${article.content}</div>`;
    
    // FAQ section
    const faqHtml = article.faq.map(f => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join(' ');
    const faqSection = `<div class="article-faq"><h2>Domande Frequenti</h2>${faqHtml}</div>`;
    
    // Related articles
    const relatedHtml = article.relatedArticles.map(r => 
        `<a href="${r.slug}.html" class="related-card"><h4>${r.title}</h4><p>${r.desc}</p></a>`
    ).join('');
    const relatedSection = `<div class="related-articles"><h3>Articoli Correlati</h3><div class="related-grid">${relatedHtml}</div></div>`;
    
    // CTA
    const ctaSection = `<div class="article-cta"><h3>Vuoi trasformare questi consigli in risultati concreti?</h3><p>Possiamo preparare una roadmap tecnica personalizzata sul tuo progetto.</p><a href="${article.serviceLink}" class="btn btn-primary">Scopri il servizio</a></div>`;
    
    // Close article
    const closeArticle = `</div></article></main>`;
    
    // JSON-LD schemas
    const schemas = [
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": SITE + "/blog/" },
            { "@type": "ListItem", "position": 3, "name": article.title.split(':')[0].trim(), "item": canonical }
        ]},
        { "@context": "https://schema.org", "@type": "Person", "@id": AUTHOR.id, "name": AUTHOR.name, "url": AUTHOR.url, "image": AUTHOR.image, "sameAs": AUTHOR.sameAs, "knowsAbout": AUTHOR.knowsAbout },
        { "@context": "https://schema.org", "@type": "BlogPosting", "headline": article.title, "description": article.description, "url": canonical, "mainEntityOfPage": canonical, "image": AUTHOR.image, "articleSection": article.tag, "keywords": [article.tag, "WebNovis", "Agenzia Web", "SEO", "GEO"], "citation": SOURCES.map(s => s.url), "mentions": SOURCES.map(s => ({ "@type": "WebPage", "name": s.name, "url": s.url })), "datePublished": TODAY_ISO, "dateModified": TODAY_ISO, "author": { "@id": AUTHOR.id }, "publisher": { "@type": "Organization", "@id": SITE + "/#organization", "name": "WebNovis", "url": SITE, "logo": { "@type": "ImageObject", "url": AUTHOR.image } }, "inLanguage": "it", "isPartOf": { "@type": "Blog", "name": "Blog WebNovis", "url": SITE + "/blog/" } },
        { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": article.faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) }
    ];
    const schemasHtml = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
    
    return head + '</head>' + templateNav + breadcrumb + heroSection + faqSection + relatedSection + ctaSection + closeArticle + ' ' + templateFooter + ' ' + schemasHtml + templateScripts + '</body></html>';
}

// Generate articles
for (const article of articles) {
    const html = buildArticleHtml(article);
    const outPath = path.join(BLOG_DIR, article.slug + '.html');
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`✅ Created blog/${article.slug}.html (${Math.round(html.length / 1024)}KB)`);
}

console.log('\n✅ All pillar blog articles generated!');
