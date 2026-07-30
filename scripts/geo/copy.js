/**
 * Local SEO copy builders for servizio / agenzia / realizzazione pages.
 */
const {
    formatPrice,
    formatCatalogPrice,
    getServicePrimaryUrl,
    getServicePrimaryLabel,
    getGeoSearchModifier
} = require('./data');
const { truncateText, formatSectorList } = require('./html-utils');

function isContinuousService(service) {
    return new Set([
        'seo-locale',
        'social-media',
        'email-marketing',
        'google-ads',
        'manutenzione-sito',
        'consulenza-digitale'
    ]).has(service.slug);
}

function getServiceLocalSeoCopy(service, city) {
    const price = formatPrice(service);
    const primaryUrl = getServicePrimaryUrl(service);
    const primaryLabel = getServicePrimaryLabel(service);

    const fallback = {
        title: `${service.shortName} a ${city.name}: da ${price} | WebNovis`,
        description: `${service.shortDesc} A ${city.name}, da ${price}. Gestione diretta da Rho (${city.distanzaSede}) e richiesta di preventivo gratuita.`,
        ogDescription: `${service.shortDesc} A ${city.name}, da ${price}.`,
        heroTag: `${service.shortName} per ${city.name} · ${price}`,
        heroH1: `${service.shortName} a ${city.name} per aziende e professionisti`,
        heroCapsule: `<strong>WebNovis</strong> offre ${service.shortName.toLowerCase()} a ${city.name} con un approccio su misura, tempi chiari e gestione diretta da Rho (${city.distanzaSede}). Investimento da <strong>${price}</strong> e richiesta di preventivo gratuita.`,
        heroHighlights: [
            { label: 'Investimento', value: `Da ${price}` },
            { label: 'Tempi', value: service.timeEstimate },
            { label: 'Focus', value: service.idealFor }
        ],
        sectionTitle: `${service.shortName} a ${city.name}: cosa serve per ottenere risultati`,
        sectionIntro: `${service.description} Lavoriamo con obiettivi chiari, deliverable definiti e una priorità costante: trasformare il servizio in richieste, appuntamenti o vendite.`,
        whyTitle: `Perché scegliere WebNovis per ${service.shortName.toLowerCase()} a ${city.name}?`,
        whyCards: isContinuousService(service)
            ? [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Operiamo da Rho, a ${city.distanzaSede} da ${city.name}. Confronto veloce, risposte rapide e nessun passaggio dispersivo.`
                },
                {
                    title: 'Piano operativo su misura',
                    text: `Ogni attività parte da audit, obiettivi e priorità reali: niente pacchetti standard uguali per tutti.`
                },
                {
                    title: 'Ottimizzazione continua',
                    text: `Monitoriamo risultati, correggiamo le leve che non funzionano e ti lasciamo sempre report leggibili.`
                }
            ]
            : [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Operiamo da Rho, a ${city.distanzaSede} da ${city.name}. Possiamo sentirci in video o incontrarci rapidamente sul territorio.`
                },
                {
                    title: 'Progetto costruito su misura',
                    text: `Struttura, copy e deliverable vengono adattati al tuo obiettivo e al contesto competitivo locale.`
                },
                {
                    title: 'Conversioni e chiarezza',
                    text: `Ogni pagina o asset nasce per rendere più chiara l'offerta e facilitare il contatto o la vendita.`
                }
            ],
        processTitle: `Come lavoriamo su ${service.shortName.toLowerCase()} a ${city.name}`,
        processIntro: isContinuousService(service)
            ? `Partiamo da audit e priorità, poi impostiamo il piano operativo e monitoriamo i risultati mese dopo mese.`
            : `Partiamo da obiettivo, contesto competitivo e materiali disponibili, poi progettiamo e rilasciamo una soluzione pronta a lavorare.`,
        processSteps: isContinuousService(service)
            ? [
                {
                    title: '1. Audit e priorità',
                    text: `Analizziamo obiettivi, punto di partenza e competitor di ${city.name} per capire dove intervenire prima.`
                },
                {
                    title: '2. Piano operativo',
                    text: `Definiamo attività, tempistiche, KPI e budget in una proposta chiara prima dell'avvio.`
                },
                {
                    title: '3. Monitoraggio e ottimizzazione',
                    text: `Attiviamo il lavoro, leggiamo i dati e correggiamo progressivamente ciò che non sta performando.`
                }
            ]
            : [
                {
                    title: '1. Analisi e brief',
                    text: `Raccogliamo obiettivi, offerta, competitor e priorità commerciali per il tuo progetto a ${city.name}.`
                },
                {
                    title: '2. Struttura e proposta',
                    text: `Ricevi una proposta chiara con deliverable, tempistiche (${service.timeEstimate}) e investimento da ${price}.`
                },
                {
                    title: '3. Produzione e rilascio',
                    text: `Realizziamo, testiamo e consegniamo con supporto iniziale incluso e un unico referente dedicato.`
                }
            ],
        decisionFrameworkTitle: '',
        decisionFrameworkIntro: '',
        decisionFrameworkCards: [],
        deliverablesTitle: '',
        deliverablesIntro: '',
        deliverablesCards: [],
        intentQueriesTitle: '',
        intentQueriesIntro: '',
        intentQueries: [],
        ctaTitle: `${service.shortName} per la tua attività a ${city.name}?`,
        ctaCopy: `Scrivici obiettivo, settore e tempistiche: riceverai un primo riscontro con i passaggi utili per definire il preventivo.`,
        primaryPageUrl: primaryUrl,
        primaryPageLabel: primaryLabel,
        schemaDescription: `${service.shortDesc} Per aziende e professionisti di ${city.name}, con gestione diretta da Rho (${city.distanzaSede}).`
    };

    const overrides = {
        'landing-page': {
            title: `Landing Page a ${city.name}: lead generation da ${price} | WebNovis`,
            description: `Landing page a ${city.name} per Google Ads, Meta Ads ed eventi: copy, design e tracking orientati ai lead. Da ${price}. Richiedi una valutazione.`,
            ogDescription: `Landing page a ${city.name} pensate per aumentare richieste e conversioni. Da ${price}.`,
            heroTag: `Landing Page · ${city.name} · ${price}`,
            heroH1: `Landing Page a ${city.name} per campagne che portano contatti`,
            heroCapsule: `<strong>WebNovis</strong> crea landing page a ${city.name} con copy, design e tracking pensati per aumentare richieste e conversioni. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Lead generation' }
            ],
            sectionTitle: `Landing page a ${city.name} per non sprecare budget ads`,
            sectionIntro: `Se investi in Google Ads, Meta Ads o campagne locali, la pagina conta quanto l'annuncio. Progettiamo strutture snelle, messaggi chiari e CTA pensate per trasformare clic in contatti.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Siamo a Rho, quindi possiamo coordinare rapidamente il lancio anche con team commerciali o agenzie media di ${city.name}.`
                },
                {
                    title: 'Copy, design e tracking',
                    text: `Non consegniamo solo una pagina: impostiamo messaggio, struttura, form, eventi e monitoraggio conversioni.`
                },
                {
                    title: 'Conversioni prima dei fronzoli',
                    text: `Ogni blocco della landing nasce per ridurre dispersione e aumentare richieste, demo o appuntamenti.`
                }
            ],
            processIntro: `Partiamo da offerta, pubblico e canale di traffico. Poi costruiamo una landing che renda la conversione più semplice e misurabile.`,
            ctaTitle: `Vuoi una landing page che trasformi clic in contatti a ${city.name}?`,
            ctaCopy: `Mandaci obiettivo, canale e offerta: riceverai un primo riscontro per definire struttura e preventivo.`,
            schemaDescription: `Landing page a ${city.name} per campagne Google Ads, Meta Ads ed eventi, con copy, design e tracking orientati ai lead.`
        },
        'sito-vetrina': {
            title: `Sito Vetrina a ${city.name}: sito professionale da ${price} | WebNovis`,
            description: `Sito vetrina a ${city.name} con design custom, SEO integrata e struttura orientata ai contatti. Da ${price}. Richiedi un preventivo gratuito.`,
            ogDescription: `Sito vetrina a ${city.name} con design custom e SEO integrata. Da ${price}.`,
            heroTag: `Sito Vetrina · ${city.name} · ${price}`,
            heroH1: `Sito Vetrina a ${city.name} per aziende che vogliono più richieste`,
            heroCapsule: `<strong>WebNovis</strong> realizza siti vetrina a ${city.name} con design su misura, SEO tecnica integrata e struttura pensata per facilitare il contatto. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Contatti qualificati' }
            ],
            sectionTitle: `Siti vetrina a ${city.name} per presentare bene l'offerta e farsi scegliere`,
            sectionIntro: `Un sito vetrina funziona quando rende chiari posizionamento, servizi e differenze rispetto ai competitor. Strutturiamo pagine, contenuti e CTA per aiutare le aziende di ${city.name} a generare richieste più qualificate.`,
            ctaTitle: `Vuoi un sito vetrina che faccia percepire meglio il tuo valore a ${city.name}?`,
            ctaCopy: `Possiamo aiutarti con struttura, copy e UX orientati ai contatti: richiedi un preventivo gratuito.`,
            schemaDescription: `Sito vetrina a ${city.name} con design personalizzato, SEO integrata e architettura orientata ai contatti.`
        },
        ecommerce: {
            title: `E-Commerce a ${city.name}: shop online da ${price} | WebNovis`,
            description: `E-commerce custom a ${city.name}: catalogo, pagamenti, checkout e SEO tecnica per vendere online senza commissioni piattaforma. Da ${price}.`,
            ogDescription: `E-commerce custom a ${city.name} per vendere online con catalogo, checkout e SEO tecnica. Da ${price}.`,
            heroTag: `E-Commerce · ${city.name} · ${price}`,
            heroH1: `E-Commerce a ${city.name} per vendere online senza vincoli`,
            heroCapsule: `<strong>WebNovis</strong> sviluppa e-commerce a ${city.name} con catalogo, checkout, pagamenti e SEO tecnica pensati per la vendita online. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Vendite online' }
            ],
            sectionTitle: `E-commerce a ${city.name} per trasformare catalogo e traffico in ordini`,
            sectionIntro: `Un negozio online deve essere facile da gestire, veloce da usare e solido lato SEO e checkout. Progettiamo e-commerce pensati per margini, conversione e crescita nel tempo.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Coordiniamo il progetto da Rho con confronto diretto e rapido anche per negozi, brand e PMI di ${city.name} che devono partire senza dispersione.`
                },
                {
                    title: 'Stack e-commerce senza lock-in inutile',
                    text: `Valutiamo caso per caso Shopify, WooCommerce o sviluppo custom in base a catalogo, margini, complessità operativa e autonomia richiesta dopo il lancio.`
                },
                {
                    title: 'SEO, UX e vendite nella stessa direzione',
                    text: `Non costruiamo uno shop solo “bello”: lavoriamo su categorie, schede prodotto, checkout e misurazione per rendere più facile vendere e ottimizzare.`
                }
            ],
            processIntro: `Un e-commerce regge nel tempo quando architettura, schede prodotto, pagamenti, logistica e misurazione vengono progettati insieme fin dall'inizio.`,
            processSteps: [
                {
                    title: '1. Catalogo, stack e requisiti',
                    text: `Analizziamo prodotti, varianti, modalità di vendita, pagamenti, spedizioni e strumenti già in uso per definire la soluzione più sensata.`
                },
                {
                    title: '2. UX di acquisto e struttura SEO',
                    text: `Costruiamo categorie, schede prodotto, filtri, contenuti e checkout in modo che il sito sia chiaro per utenti, motori di ricerca e team interno.`
                },
                {
                    title: '3. Setup operativo e rilascio',
                    text: `Configuriamo pagamenti, spedizioni, tracking, email essenziali e handoff operativo per arrivare online con una base già usabile e misurabile.`
                }
            ],
            decisionFrameworkTitle: `Cosa deve avere un e-commerce a ${city.name} per vendere davvero`,
            decisionFrameworkIntro: `Nelle SERP locali molti competitor presidiano la query “realizzazione e-commerce” con landing molto verticali. Per reggere davvero il confronto non basta pubblicare uno shop: servono fondamenta commerciali e operative chiare.`,
            decisionFrameworkCards: [
                {
                    title: 'Catalogo, categorie e filtri',
                    text: `La struttura deve aiutare persone e motori di ricerca a capire subito prodotti, collezioni e differenze, senza creare tassonomie confuse che disperdono traffico e conversione.`
                },
                {
                    title: 'Schede prodotto che chiariscono e convincono',
                    text: `Testi, immagini, varianti, policy e CTA devono ridurre dubbi prima del checkout, altrimenti il traffico arriva ma l'ordine non si chiude.`
                },
                {
                    title: 'Checkout, pagamenti e logistica',
                    text: `Uno shop funziona quando pagamenti, spedizioni, disponibilità e conferme ordine sono solidi quanto il design. Qui spesso si decide il vero tasso di conversione.`
                },
                {
                    title: 'Tracking, automazioni e riacquisto',
                    text: `Misurare funnel, ordini, carrelli abbandonati e performance per categoria permette di migliorare margini e processi, non solo il numero di visite.`
                }
            ],
            deliverablesTitle: `Cosa include un progetto e-commerce WebNovis a ${city.name}`,
            deliverablesIntro: `Il perimetro viene adattato al progetto, ma ci concentriamo sui blocchi che spostano davvero conversione, gestione e scalabilità.`,
            deliverablesCards: [
                {
                    title: 'Architettura shop e tassonomia',
                    text: `Mappatura categorie, menu, schede prodotto, filtri e gerarchia delle pagine per rendere il catalogo leggibile e sostenibile.`
                },
                {
                    title: 'Checkout e integrazioni essenziali',
                    text: `Setup di pagamenti, spedizioni, email transazionali, moduli e strumenti operativi necessari a non spezzare il flusso di vendita.`
                },
                {
                    title: 'SEO tecnica e contenuti chiave',
                    text: `Interveniamo su categorie, metadati, struttura URL, copy utile e performance percepita per evitare uno shop invisibile o dispersivo.`
                },
                {
                    title: 'Formazione e handoff operativo',
                    text: `Ti lasciamo una base che il team può gestire nel quotidiano: prodotti, ordini, promozioni e controlli ricorrenti senza dipendere sempre da noi.`
                }
            ],
            intentQueriesTitle: `Ricerche e-commerce che presidiamo a ${city.name}`,
            intentQueriesIntro: `Lavoriamo per intercettare query locali con intento commerciale reale, non solo keyword generiche senza probabilità di acquisto.`,
            intentQueries: [
                `realizzazione ecommerce ${city.name}`,
                `e-commerce ${city.name}`,
                `negozio online ${city.name}`,
                `sito ecommerce ${city.name}`,
                `creazione shop online ${city.name}`
            ],
            ctaTitle: `Vuoi un e-commerce più credibile e più facile da far crescere a ${city.name}?`,
            ctaCopy: `Scrivici catalogo, obiettivi e complessità operativa: riceverai un primo riscontro per definire perimetro e preventivo.`,
            schemaDescription: `E-commerce custom a ${city.name} con catalogo, checkout, pagamenti e SEO tecnica per aziende che vogliono vendere online.`
        },
        'social-media': {
            title: `Social Media a ${city.name}: gestione da ${price} | WebNovis`,
            description: `Gestione social a ${city.name}: piano editoriale, contenuti e campagne Meta per aumentare visibilità, lead e richieste. Da ${price}.`,
            ogDescription: `Gestione social a ${city.name} con piano editoriale, creatività e campagne Meta. Da ${price}.`,
            heroTag: `Social Media · ${city.name} · ${price}`,
            heroH1: `Social Media a ${city.name} per visibilità, contenuti e lead`,
            heroCapsule: `<strong>WebNovis</strong> segue la gestione social a ${city.name} con piano editoriale, creatività e campagne Meta orientate a risultati misurabili. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: 'Contenuti + ads' },
                { label: 'Metodo', value: 'Report mensili' }
            ],
            sectionTitle: `Social media a ${city.name} per smettere di pubblicare senza obiettivo`,
            sectionIntro: `Costruiamo un piano che collega rubriche, creatività, advertising e KPI commerciali, così i social smettono di essere solo presenza e iniziano a diventare un canale utile.`,
            ctaTitle: `Vuoi una gestione social più misurabile a ${city.name}?`,
            ctaCopy: `Possiamo aiutarti a definire format, KPI e frequenza di pubblicazione con un piano operativo chiaro.`,
            schemaDescription: `Gestione social media a ${city.name} con contenuti, creatività e campagne Meta orientate a visibilità e lead.`
        },
        accessibilita: {
            title: `Accessibilità Web a ${city.name}: audit EAA da ${price} | WebNovis`,
            description: `Accessibilità web a ${city.name}: audit WCAG, adeguamento EAA e supporto operativo per siti aziendali. Da ${price}. Richiedi una valutazione.`,
            ogDescription: `Audit accessibilità e adeguamento EAA/WCAG a ${city.name}. Da ${price}.`,
            heroTag: `Accessibilità Web · ${city.name} · ${price}`,
            heroH1: `Accessibilità Web a ${city.name}: audit WCAG e adeguamento EAA`,
            heroCapsule: `<strong>WebNovis</strong> aiuta aziende e professionisti di ${city.name} con audit accessibilità, remediation tecnica e supporto sull'adeguamento EAA. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'WCAG + EAA' }
            ],
            sectionTitle: `Accessibilità web a ${city.name} per ridurre rischi e blocchi operativi`,
            sectionIntro: `Lavoriamo su audit, priorità tecniche e adeguamenti concreti. L'obiettivo non è solo la checklist: è rendere il sito più usabile, più chiaro e più allineato alle richieste normative.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Siamo a Rho, quindi possiamo lavorare rapidamente con team interni, referenti IT o fornitori già coinvolti.`
                },
                {
                    title: 'Audit + remediation',
                    text: `Individuiamo criticità reali e ti aiutiamo a tradurle in interventi tecnici e contenutistici prioritizzati.`
                },
                {
                    title: 'Supporto operativo',
                    text: `Ti accompagniamo tra verifiche, adeguamento e monitoraggio, senza lasciarti con un report non eseguibile.`
                }
            ],
            ctaTitle: `Hai bisogno di capire se il tuo sito è davvero conforme a ${city.name}?`,
            ctaCopy: `Mandaci URL e contesto: ti aiutiamo a definire priorità tecniche e perimetro di adeguamento.`,
            schemaDescription: `Audit accessibilità e adeguamento EAA/WCAG a ${city.name} per siti aziendali e professionali.`
        },
        'seo-locale': {
            title: `SEO Locale a ${city.name}: Google Maps da ${price} | WebNovis`,
            description: `SEO locale a ${city.name}: Google Business Profile, pagine locali e ottimizzazione on-page per farti trovare su Maps e ricerche ad alta intenzione. Da ${price}.`,
            ogDescription: `SEO locale a ${city.name} per Google Maps e ricerche ad alta intenzione. Da ${price}.`,
            heroTag: `SEO Locale · ${city.name} · ${price}`,
            heroH1: `SEO Locale a ${city.name} per farti trovare su Google Maps`,
            heroCapsule: `<strong>WebNovis</strong> aiuta attività e professionisti di ${city.name} a comparire meglio su Google Maps e nelle ricerche locali che portano chiamate, richieste e visite in sede. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Leve', value: 'Maps + on-page' },
                { label: 'Metodo', value: 'Report mensili' }
            ],
            sectionTitle: `SEO locale a ${city.name} per intercettare ricerche con intento di contatto`,
            sectionIntro: `Lavoriamo su Google Business Profile, struttura locale delle pagine e ottimizzazione on-page per aumentare la visibilità sulle ricerche che contano davvero per chi opera sul territorio.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Seguiamo progetti locali da Rho e possiamo coordinare rapidamente priorità, materiali e verifiche anche con attività di ${city.name} che hanno poco tempo da perdere.`
                },
                {
                    title: 'Maps, sito e recensioni letti insieme',
                    text: `La SEO locale non si risolve con un solo intervento: lavoriamo su profilo Google, pagine locali, segnali di fiducia e struttura del sito come un unico sistema.`
                },
                {
                    title: 'Misurazione su query e contatti',
                    text: `Impostiamo il lavoro per leggere ricerche, chiamate, richieste e progressi sulle pagine locali, non solo posizioni astratte scollegate dal business.`
                }
            ],
            processIntro: `La SEO locale funziona quando priorità tecniche, profilo Google Business Profile e contenuti locali vengono ordinati in una sequenza concreta e misurabile.`,
            processSteps: [
                {
                    title: '1. Audit locale e baseline',
                    text: `Analizziamo profilo Google, pagine locali, competitor, NAP, query e asset già esistenti per capire dove si sta perdendo visibilità.`
                },
                {
                    title: '2. Interventi on-page e profilo GBP',
                    text: `Lavoriamo su title, H1, contenuti, schema, linking interno, categorie, servizi e materiali del profilo per chiarire meglio rilevanza locale e offerta.`
                },
                {
                    title: '3. Monitoraggio, review e ottimizzazione',
                    text: `Controlliamo segnali, richieste, andamento delle query e punti deboli ancora aperti per consolidare nel tempo Maps e organico locale.`
                }
            ],
            decisionFrameworkTitle: `Le leve che fanno muovere la SEO locale a ${city.name}`,
            decisionFrameworkIntro: `I competitor che presidiano meglio le query locali non vincono sempre con il contenuto più lungo: spesso vincono perché rendono chiarissimi i segnali locali fondamentali e li collegano bene tra profilo, sito e reputazione.`,
            decisionFrameworkCards: [
                {
                    title: 'Google Business Profile ordinato',
                    text: `Categorie, servizi, immagini, descrizioni e aggiornamenti devono raccontare chiaramente cosa fai e dove operi, senza informazioni contraddittorie.`
                },
                {
                    title: 'Pagine locali coerenti e indexabili',
                    text: `Le landing locali devono avere intent chiaro, title/H1 coerenti, contenuti utili e linking interno sufficiente per non restare invisibili.`
                },
                {
                    title: 'Recensioni e segnali di fiducia',
                    text: `Le review non sostituiscono il sito, ma aiutano Maps e il click-through quando sono raccolte e presidiate con continuità.`
                },
                {
                    title: 'NAP, citazioni e misurazione',
                    text: `Coerenza di contatti, dati di sede, richieste e query presidiate serve per capire cosa sta migliorando davvero e cosa no.`
                }
            ],
            deliverablesTitle: `Cosa include un lavoro SEO locale serio a ${city.name}`,
            deliverablesIntro: `Il lavoro cambia in base al punto di partenza, ma le aree che muoviamo più spesso sono queste.`,
            deliverablesCards: [
                {
                    title: 'Audit locale e priorità',
                    text: `Snapshot iniziale di pagina, profilo Google, query, segnali locali e criticità tecniche per decidere la sequenza giusta degli interventi.`
                },
                {
                    title: 'On-page, schema e pagine locali',
                    text: `Ottimizziamo i segnali on-page che aiutano Google a leggere meglio servizio, città, area servita e rilevanza locale.`
                },
                {
                    title: 'Profilo Google e review process',
                    text: `Supportiamo organizzazione del profilo, materiali essenziali e un processo più ordinato per richiesta e gestione delle recensioni.`
                },
                {
                    title: 'Report e lettura dei risultati',
                    text: `Ti lasciamo dati leggibili su query locali, richieste e attività eseguite per capire se il lavoro sta davvero portando visibilità utile.`
                }
            ],
            intentQueriesTitle: `Ricerche locali che presidiamo a ${city.name}`,
            intentQueriesIntro: `L'obiettivo è comparire meglio dove l'intento è vicino al contatto o alla visita, non inseguire keyword lontane dal bisogno reale.`,
            intentQueries: [
                `seo locale ${city.name}`,
                `agenzia seo ${city.name}`,
                `google maps ${city.name}`,
                `posizionamento locale ${city.name}`,
                `google business profile ${city.name}`
            ],
            ctaTitle: `Vuoi più richieste da Google Maps a ${city.name}?`,
            ctaCopy: `Possiamo partire con un audit locale e un piano operativo chiaro per query, pagine e profilo aziendale.`,
            schemaDescription: `SEO locale a ${city.name} con ottimizzazione Google Business Profile, pagine locali e attività on-page per ricerche ad alta intenzione.`
        },
        'email-marketing': {
            title: `Email Marketing a ${city.name}: automazioni da ${price} | WebNovis`,
            description: `Email marketing a ${city.name} per newsletter, automazioni e recupero clienti. Strategia, copy e setup operativo da ${price}.`,
            ogDescription: `Email marketing a ${city.name} con newsletter e automazioni per fidelizzazione e vendita. Da ${price}.`,
            heroTag: `Email Marketing · ${city.name} · ${price}`,
            heroH1: `Email Marketing a ${city.name} per newsletter e automazioni che vendono`,
            heroCapsule: `<strong>WebNovis</strong> imposta email marketing a ${city.name} con newsletter, automazioni e flussi di recupero pensati per aumentare riacquisti e richieste. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Leve', value: 'Newsletter + flow' },
                { label: 'Focus', value: 'Fidelizzazione' }
            ],
            sectionTitle: `Email marketing a ${city.name} per non lasciare clienti e lead inattivi`,
            sectionIntro: `Newsletter e automazioni funzionano quando segmentazione, offerta e frequenza sono coerenti. Ti aiutiamo a trasformare liste dormienti in un canale che riattiva clienti e opportunità.`,
            ctaTitle: `Vuoi usare newsletter e automazioni in modo più strategico a ${city.name}?`,
            ctaCopy: `Raccontaci database, obiettivi e stack attuale: ti proponiamo il setup più utile da cui partire.`,
            schemaDescription: `Email marketing a ${city.name} con newsletter, automazioni e flussi di recupero per fidelizzazione e vendita.`
        },
        'restyling-sito-web': {
            title: `Restyling Sito Web a ${city.name}: redesign con migrazione SEO da ${price} | WebNovis`,
            description: `Restyling sito web a ${city.name}: redesign, revisione contenuti, performance UX e migrazione SEO senza perdere visibilità. Da ${price}.`,
            ogDescription: `Restyling sito web a ${city.name} con redesign, UX e migrazione SEO. Da ${price}.`,
            heroTag: `Restyling Sito Web · ${city.name} · ${price}`,
            heroH1: `Restyling sito web a ${city.name} per aggiornare immagine e risultati`,
            heroCapsule: `<strong>WebNovis</strong> gestisce restyling siti web a ${city.name} quando serve migliorare percezione, usabilità e performance senza disperdere il lavoro SEO già fatto. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Redesign + migrazione SEO' }
            ],
            sectionTitle: `Restyling siti web a ${city.name} per uscire da layout vecchi e poco credibili`,
            sectionIntro: `Quando il sito appare datato o dispersivo, spesso il problema non è solo estetico: cala la fiducia, peggiora la navigazione e diventa più difficile convertire. Ridisegniamo struttura, contenuti e UI mantenendo sotto controllo redirect, SEO e continuità operativa.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Lavoriamo da Rho e possiamo coordinare rapidamente redesign, raccolta materiali e rilascio del nuovo sito anche con team interni di ${city.name}.`
                },
                {
                    title: 'Restyling senza perdere asset utili',
                    text: `Analizziamo cosa va conservato, cosa va riposizionato e cosa va eliminato per non buttare via contenuti, ranking e pagine già utili.`
                },
                {
                    title: 'Immagine più attuale, sito più efficace',
                    text: `Il redesign non si ferma ai colori: lavoriamo su gerarchia, messaggi, CTA e performance percepita per migliorare contatti e autorevolezza.`
                }
            ],
            processIntro: `Partiamo dal sito attuale, leggiamo limiti di design, UX e SEO, poi progettiamo un restyling che migliori immagine, chiarezza e continuità tecnica.`,
            processSteps: [
                {
                    title: '1. Audit del sito esistente',
                    text: `Rivediamo pagine, contenuti, performance e criticità SEO del progetto attuale per capire cosa proteggere e cosa cambiare.`
                },
                {
                    title: '2. Nuova struttura e nuovo design',
                    text: `Ridisegniamo architettura, blocchi pagina, tono visivo e CTA in base agli obiettivi commerciali e al posizionamento desiderato.`
                },
                {
                    title: '3. Migrazione e rilascio ordinato',
                    text: `Gestiamo redirect, QA, messa online e supporto iniziale per ridurre rischi, errori e perdite di visibilità dopo il lancio.`
                }
            ],
            ctaTitle: `Hai un sito da aggiornare seriamente a ${city.name}?`,
            ctaCopy: `Mandaci URL, obiettivo e urgenze: ti diciamo come impostare un restyling utile e non solo cosmetico.`,
            schemaDescription: `Restyling sito web a ${city.name} con redesign, revisione UX e migrazione SEO per siti obsoleti o poco efficaci.`
        },
        'web-app': {
            title: `Web App a ${city.name}: portali e gestionali custom da ${price} | WebNovis`,
            description: `Web app a ${city.name} per portali B2B, dashboard e gestionali su misura con integrazioni API e aree riservate. Da ${price}.`,
            ogDescription: `Web app custom a ${city.name} per portali, dashboard e workflow aziendali. Da ${price}.`,
            heroTag: `Web App · ${city.name} · ${price}`,
            heroH1: `Web app a ${city.name} per processi, portali e strumenti interni`,
            heroCapsule: `<strong>WebNovis</strong> sviluppa web app a ${city.name} per dashboard operative, aree riservate, portali clienti e workflow custom. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, sviluppo diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Portali e workflow' }
            ],
            sectionTitle: `Web app a ${city.name} quando il gestionale standard non basta`,
            sectionIntro: `Realizziamo applicazioni web su misura quando fogli condivisi, strumenti generici o flussi manuali non reggono più. L'obiettivo è costruire un ambiente operativo più ordinato, con permessi, dati e automazioni modellati sul tuo processo reale.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Da Rho seguiamo discovery, avanzamenti e review tecniche con tempi rapidi anche per aziende e team B2B di ${city.name}.`
                },
                {
                    title: 'Logica di business davvero custom',
                    text: `Non adattiamo a forza un template: mappiamo ruoli, permessi, flussi approvativi e integrazioni in base al tuo modo di lavorare.`
                },
                {
                    title: 'Scalabilità e manutenzione',
                    text: `Costruiamo una base leggibile e documentata, pensata per crescere con moduli, API e nuove esigenze senza diventare fragile.`
                }
            ],
            processIntro: `La web app parte sempre da processi, ruoli e dati. Solo dopo definiamo interfacce, logica applicativa, priorità del primo rilascio e roadmap.`,
            processSteps: [
                {
                    title: '1. Discovery funzionale',
                    text: `Analizziamo attori, casi d'uso, dati necessari e punti di attrito operativi per definire il perimetro più utile del progetto.`
                },
                {
                    title: '2. UX, architettura e backlog',
                    text: `Disegniamo schermate, flussi, integrazioni e priorità MVP con una proposta chiara su tempi, moduli e complessità tecnica.`
                },
                {
                    title: '3. Sviluppo iterativo e rilascio',
                    text: `Procediamo per milestone, QA e confronto continuo fino alla consegna dell'applicazione pronta all'uso e manutenibile.`
                }
            ],
            ctaTitle: `Vuoi capire se una web app custom ha senso per la tua azienda a ${city.name}?`,
            ctaCopy: `Descrivici processo, utenti e strumenti attuali: ti aiutiamo a stimare perimetro, priorità e investimento.`,
            schemaDescription: `Web app custom a ${city.name} per portali, dashboard, aree riservate e gestionali con integrazioni API.`
        },
        'fotografia-aziendale': {
            title: `Fotografia Aziendale a ${city.name}: shooting per brand e siti da ${price} | WebNovis`,
            description: `Fotografia aziendale a ${city.name} per team, prodotti, spazi e contenuti web/social. Shooting, selezione e post-produzione da ${price}.`,
            ogDescription: `Fotografia aziendale a ${city.name} per sito, social e materiali di brand. Da ${price}.`,
            heroTag: `Fotografia Aziendale · ${city.name} · ${price}`,
            heroH1: `Fotografia aziendale a ${city.name} per siti, social e materiali credibili`,
            heroCapsule: `<strong>WebNovis</strong> organizza shooting di fotografia aziendale a ${city.name} per ritratti team, ambienti, prodotti e contenuti digitali coerenti con il brand. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, coordinamento diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Sito + social + brand' }
            ],
            sectionTitle: `Fotografia aziendale a ${city.name} per non appoggiarsi a immagini deboli o anonime`,
            sectionIntro: `Molti siti e profili aziendali perdono fiducia perché mostrano foto generiche, stock incoerenti o scatti improvvisati. Costruiamo shooting utili davvero: materiali che migliorano sito, social, brochure e presentazioni con una direzione visiva coerente.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Partiamo da Rho ma possiamo coordinare rapidamente sopralluoghi, scaletta e produzione per aziende, showroom e studi di ${city.name}.`
                },
                {
                    title: 'Scatti pensati per gli usi reali',                    text: `Ogni sessione viene progettata in base ai punti di contatto in cui userai le immagini: homepage, team page, social, campagne o cataloghi.`
                },
                {
                    title: 'Brand consistency',
                    text: `Lavoriamo su inquadrature, tono, styling e selezione finale per evitare gallerie disomogenee che indeboliscono la percezione del marchio.`
                }
            ],
            processIntro: `La fotografia aziendale funziona quando pre-produzione, shooting e selezione vengono pensati sui canali dove le immagini dovranno vivere.`,
            processSteps: [
                {
                    title: '1. Brief e lista scatti',
                    text: `Definiamo uso delle immagini, persone da coinvolgere, ambienti, oggetti e mood complessivo per evitare produzione casuale.`
                },
                {
                    title: '2. Shooting in sede o location',
                    text: `Organizziamo sessione, tempi e inquadrature in modo efficiente per ottenere materiali spendibili da subito sul digitale.`
                },
                {
                    title: '3. Selezione e post-produzione',
                    text: `Consegniamo scatti ottimizzati, coerenti tra loro e pronti per sito, social, campagne o documenti commerciali.`
                }
            ],
            ctaTitle: `Ti servono foto aziendali davvero utili a ${city.name}?`,
            ctaCopy: `Scrivici che tipo di immagini ti mancano e dove le userai: impostiamo una produzione mirata, non uno shooting generico.`,
            schemaDescription: `Fotografia aziendale a ${city.name} per team, prodotti, spazi e contenuti digitali destinati a sito, social e materiali di brand.`
        },
        copywriting: {
            title: `Copywriting a ${city.name}: testi per siti e campagne da ${price} | WebNovis`,
            description: `Copywriting a ${city.name} per siti web, landing page e campagne: messaggi chiari, tono coerente e testi orientati alla conversione. Da ${price}.`,
            ogDescription: `Copywriting a ${city.name} per siti, landing e campagne con tono di voce e conversione. Da ${price}.`,
            heroTag: `Copywriting · ${city.name} · ${price}`,
            heroH1: `Copywriting a ${city.name} per farti capire e farti scegliere`,
            heroCapsule: `<strong>WebNovis</strong> scrive copy per aziende e professionisti di ${city.name} quando serve chiarire posizionamento, migliorare pagine e trasformare visite in richieste. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Messaggio + conversione' }
            ],
            sectionTitle: `Copywriting a ${city.name} per smettere di dire tutto e non dire nulla`,
            sectionIntro: `I testi sono spesso il collo di bottiglia: prodotti complessi spiegati male, servizi indistinti, CTA deboli e tono di voce incoerente. Lavoriamo per rendere più chiaro il valore dell'offerta e guidare il visitatore verso la scelta giusta.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Seguiamo i progetti da Rho con interviste, review e revisioni rapide anche con team commerciali o founder di ${city.name}.`
                },
                {
                    title: 'Copy che parte dalla strategia',
                    text: `Prima definiamo pubblico, obiettivo e messaggio principale. Solo dopo scriviamo headline, sezioni e CTA in modo coerente.`
                },
                {
                    title: 'SEO e leggibilità insieme',
                    text: `Ottimizziamo struttura e parole chiave senza trasformare i testi in pagine rigide o artificiali da leggere.`
                }
            ],
            processIntro: `Il copy migliore nasce da un buon brief, da priorità chiare e da una struttura pensata per chi legge, non per riempire spazi.`,
            processSteps: [
                {
                    title: '1. Analisi di tono e posizionamento',
                    text: `Raccogliamo contesto, obiettivi, competitor e obiezioni frequenti per capire come deve parlare davvero il brand.`
                },
                {
                    title: '2. Architettura dei messaggi',
                    text: `Definiamo priorità narrative, titoli, prove, CTA e flusso dei contenuti prima della stesura finale.`
                },
                {
                    title: '3. Scrittura e rifinitura',
                    text: `Consegniamo testi pronti per sito o campagna, con revisioni mirate e attenzione a chiarezza, ritmo e conversione.`
                }
            ],
            ctaTitle: `Hai pagine che non spiegano bene il tuo valore a ${city.name}?`,
            ctaCopy: `Mandaci URL o bozza: ti aiutiamo a capire cosa riscrivere, con quale tono e con quale priorità.`,
            schemaDescription: `Copywriting a ${city.name} per siti web, landing page e campagne con attenzione a tono di voce, chiarezza e conversione.`
        },
        'google-ads': {
            title: `Google Ads a ${city.name}: campagne search e lead da ${price} | WebNovis`,
            description: `Google Ads a ${city.name} per lead generation, e-commerce e servizi locali: struttura campagne, tracking e ottimizzazione continua. Da ${price}.`,
            ogDescription: `Google Ads a ${city.name} con campagne Search, tracking e ottimizzazione lead. Da ${price}.`,
            heroTag: `Google Ads · ${city.name} · ${price}`,
            heroH1: `Google Ads a ${city.name} per intercettare ricerche con intento reale`,
            heroCapsule: `<strong>WebNovis</strong> segue campagne Google Ads a ${city.name} per aziende, professionisti ed e-commerce che vogliono generare richieste o vendite da query già attive. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: 'Search + tracking' },
                { label: 'Metodo', value: 'Ottimizzazione continua' }
            ],
            sectionTitle: `Google Ads a ${city.name} per trasformare domanda esistente in lead o ordini`,
            sectionIntro: `Google Ads funziona bene quando struttura campagne, query, annunci e pagina di arrivo lavorano insieme. Gestiamo setup, misurazione e ottimizzazione per ridurre dispersione e concentrarci sulle ricerche che hanno più probabilità di convertire.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Operiamo da Rho e possiamo coordinare rapidamente campagne locali o B2B per attività e team commerciali di ${city.name}.`
                },
                {
                    title: 'Tracking prima della spesa',
                    text: `Non attiviamo campagne alla cieca: definiamo conversioni, eventi e pagine di atterraggio per leggere davvero il risultato.`
                },
                {
                    title: 'Ottimizzazione sulle query che contano',
                    text: `Lavoriamo su intenzione di ricerca, esclusioni, annunci e landing per concentrare budget sulle opportunità più utili.`
                }
            ],
            processIntro: `Le campagne Google Ads partono dal modo in cui le persone cercano, non da una lista casuale di keyword o da creatività improvvisate.`,
            processSteps: [
                {
                    title: '1. Audit, tracking e struttura',
                    text: `Definiamo obiettivi, conversioni, gruppi di annunci e pagine di destinazione su cui costruire il lavoro.`
                },
                {
                    title: '2. Attivazione e lettura dei primi dati',
                    text: `Lanciamo le campagne, leggiamo termini di ricerca, CTR, conversioni e costi per identificare subito gli aggiustamenti necessari.`
                },
                {
                    title: '3. Ottimizzazione continua',
                    text: `Aggiorniamo keyword, esclusioni, annunci, offerte e landing per migliorare qualità dei lead e sostenibilità del budget.`
                }
            ],
            ctaTitle: `Vuoi capire se Google Ads può funzionare meglio a ${city.name}?`,
            ctaCopy: `Scrivici settore, obiettivo e budget indicativo: ti aiutiamo a capire se hai margine per migliorare setup e rendimento.`,
            schemaDescription: `Google Ads a ${city.name} per lead generation, servizi locali ed e-commerce con tracking e ottimizzazione continua.`
        },
        'consulenza-digitale': {
            title: `Consulenza Digitale a ${city.name}: audit e roadmap da ${price} | WebNovis`,
            description: `Consulenza digitale a ${city.name} per audit della presenza online, priorità operative e roadmap di crescita. Da ${price}.`,
            ogDescription: `Consulenza digitale a ${city.name} con audit e piano d'azione operativo. Da ${price}.`,
            heroTag: `Consulenza Digitale · ${city.name} · ${price}`,
            heroH1: `Consulenza digitale a ${city.name} per capire cosa fare prima`,
            heroCapsule: `<strong>WebNovis</strong> offre consulenza digitale a ${city.name} quando servono audit, priorità e una roadmap realistica tra sito, contenuti, acquisizione e strumenti. Investimento da <strong>${price}</strong>, sessioni e supporto diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: service.timeEstimate },
                { label: 'Focus', value: 'Audit + roadmap' }
            ],
            sectionTitle: `Consulenza digitale a ${city.name} per uscire da decisioni confuse o scollegate`,
            sectionIntro: `Se il problema non è solo eseguire ma capire priorità, canali e sequenza giusta, lavoriamo su audit e direzione. L'obiettivo è arrivare a una vista più chiara su cosa migliorare, in che ordine e con quali metriche.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Da Rho organizziamo confronti agili con imprenditori, marketing manager e team operativi di ${city.name}.`
                },
                {
                    title: 'Visione trasversale',
                    text: `Mettiamo insieme sito, contenuti, advertising, SEO, automazioni e brand per evitare decisioni isolate che si pestano i piedi.`
                },
                {
                    title: 'Output utile, non teoria',
                    text: `La consulenza si traduce in priorità, check, opportunità e prossime mosse concrete, non in una lista astratta di idee.`
                }
            ],
            processIntro: `La consulenza digitale serve quando prima di investire devi capire bene dove stai perdendo valore e cosa conviene sistemare per primo.`,
            processSteps: [
                {
                    title: '1. Audit del contesto digitale',
                    text: `Raccogliamo dati, stack, canali attivi, criticità del sito e obiettivi commerciali per leggere il quadro reale.`
                },
                {
                    title: '2. Priorità e scenari',
                    text: `Mettiamo ordine tra urgenze, opportunità e costi di intervento per costruire una roadmap sostenibile e sensata.`
                },
                {
                    title: '3. Piano operativo o affiancamento',
                    text: `Chiudiamo con linee guida, azioni consigliate e, se serve, un percorso di supporto sull'esecuzione successiva.`
                }
            ],
            ctaTitle: `Ti serve più chiarezza strategica sul digitale a ${city.name}?`,
            ctaCopy: `Raccontaci dove sei bloccato: possiamo aiutarti a ordinare decisioni, budget e priorità con un audit mirato.`,
            schemaDescription: `Consulenza digitale a ${city.name} con audit della presenza online, definizione priorità e roadmap operativa.`
        },
        'manutenzione-sito': {
            title: `Manutenzione Sito a ${city.name}: supporto tecnico continuativo da ${price} | WebNovis`,
            description: `Manutenzione sito a ${city.name} con backup, aggiornamenti, monitoraggio e interventi prioritari per siti aziendali ed e-commerce. Da ${price}.`,
            ogDescription: `Manutenzione sito a ${city.name} con backup, update e monitoraggio. Da ${price}.`,
            heroTag: `Manutenzione Sito · ${city.name} · ${price}`,
            heroH1: `Manutenzione sito a ${city.name} per lavorare con più tranquillità`,
            heroCapsule: `<strong>WebNovis</strong> segue la manutenzione siti web a ${city.name} con controlli tecnici, backup, aggiornamenti e interventi prioritari quando qualcosa si rompe o rallenta. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: 'Continuativo' },
                { label: 'Focus', value: 'Stabilità e supporto' }
            ],
            sectionTitle: `Manutenzione siti a ${city.name} per evitare problemi silenziosi che diventano costosi`,
            sectionIntro: `Aggiornamenti trascurati, errori nascosti, rallentamenti e backup mancanti spesso emergono solo quando c'è già un danno. La manutenzione serve a presidiare stabilità, sicurezza e continuità del sito con un referente unico e tempi chiari.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Seguiamo il supporto da Rho con interventi rapidi e coordinamento semplice anche per attività e PMI di ${city.name}.`
                },
                {
                    title: 'Controlli regolari',
                    text: `Monitoriamo aggiornamenti, backup, errori evidenti e stato generale del sito per ridurre sorprese e disservizi.`
                },
                {
                    title: 'Supporto pratico',
                    text: `Quando serve un intervento, non devi ricostruire il contesto ogni volta: abbiamo storico, accessi e priorità già allineati.`
                }
            ],
            processIntro: `La manutenzione utile non è solo un aggiornamento sporadico: è un presidio tecnico leggero ma continuo su ciò che tiene in piedi il sito.`,
            processSteps: [
                {
                    title: '1. Presa in carico tecnica',
                    text: `Raccogliamo accessi, stack, backup e stato generale del progetto per capire rischi e priorità operative.`
                },
                {
                    title: '2. Monitoraggio e interventi programmati',
                    text: `Gestiamo update, controlli ricorrenti e piccoli fix per mantenere il sito affidabile nel tempo.`
                },
                {
                    title: '3. Assistenza su problemi urgenti',
                    text: `In caso di errori, rallentamenti o anomalie interveniamo con una lettura tecnica più rapida grazie al presidio continuativo.`
                }
            ],
            ctaTitle: `Hai un sito da tenere sotto controllo a ${city.name}?`,
            ctaCopy: `Se vuoi evitare emergenze e perdite di tempo, possiamo aiutarti a impostare una manutenzione più ordinata e affidabile.`,
            schemaDescription: `Manutenzione sito a ${city.name} con backup, aggiornamenti, monitoraggio e supporto tecnico continuativo.`
        },
        'sviluppo-app-mobile': {
            title: `App Mobile a ${city.name}: sviluppo iOS e Android da ${price} | WebNovis`,
            description: `Sviluppo app mobile a ${city.name} per iOS e Android: progettazione prodotto, UX mobile e sviluppo custom da ${price}.`,
            ogDescription: `Sviluppo app mobile a ${city.name} per iOS e Android con UX e logica prodotto. Da ${price}.`,
            heroTag: `App Mobile · ${city.name} · ${price}`,
            heroH1: `Sviluppo app mobile a ${city.name} per prodotti davvero usabili`,
            heroCapsule: `<strong>WebNovis</strong> sviluppa app mobile a ${city.name} per progetti che richiedono un'esperienza pensata per smartphone, flussi chiari e una base tecnica sostenibile. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, coordinamento diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'UX mobile + prodotto' }
            ],
            sectionTitle: `App mobile a ${city.name} per loyalty, booking e servizi digitali`,
            sectionIntro: `Un app ha senso quando semplifica un flusso ricorrente e offre un vantaggio reale rispetto al sito mobile. Lavoriamo su concept, UX, logica prodotto e roadmap per costruire un'esperienza utile e non un duplicato superfluo del web.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Possiamo seguire discovery, UX e sviluppo da Rho con review costanti insieme a founder o team di ${city.name}.`
                },
                {
                    title: 'Prima il prodotto, poi la tecnologia',
                    text: `Definiamo casi d'uso, frequenza d'utilizzo e priorità prima di parlare di feature, così il progetto resta sostenibile.`
                },
                {
                    title: 'Percorso chiaro verso il rilascio',
                    text: `Impostiamo un MVP concreto, testabile e pronto a crescere per fasi, evitando backlog infiniti e funzioni premature.`
                }
            ],
            processIntro: `Lo sviluppo mobile parte da frequenza d'uso, bisogni reali e livello di complessità del prodotto, non dal desiderio generico di avere un app.`,
            processSteps: [
                {
                    title: '1. Discovery e perimetro MVP',
                    text: `Definiamo pubblico, scenario d'uso, feature essenziali e metriche con cui giudicare il primo rilascio dell'app.`
                },
                {
                    title: '2. UX mobile e architettura',
                    text: `Disegniamo flussi, schermate e logica dati in modo coerente con iOS, Android e con l'esperienza che vuoi offrire.`
                },
                {
                    title: '3. Sviluppo, QA e rilascio',
                    text: `Procediamo per milestone, test e affinamenti fino a una consegna pronta per raccolta feedback e crescita successiva.`
                }
            ],
            ctaTitle: `Stai valutando un app mobile per il tuo business a ${city.name}?`,
            ctaCopy: `Raccontaci uso previsto, utenti e obiettivo: possiamo aiutarti a capire se conviene davvero e da dove partire.`,
            schemaDescription: `Sviluppo app mobile a ${city.name} per iOS e Android con attenzione a UX, MVP e logica prodotto.`
        },
        'automazione-business': {
            title: `Automazione Business a ${city.name}: workflow e integrazioni da ${price} | WebNovis`,
            description: `Automazione business a ${city.name} per CRM, email, processi interni e passaggi ripetitivi con workflow e integrazioni su misura. Da ${price}.`,
            ogDescription: `Automazione business a ${city.name} per workflow, CRM ed email. Da ${price}.`,
            heroTag: `Automazione Business · ${city.name} · ${price}`,
            heroH1: `Automazione business a ${city.name} per eliminare lavoro ripetitivo e colli di bottiglia`,
            heroCapsule: `<strong>WebNovis</strong> progetta automazioni business a ${city.name} quando CRM, email, richieste e passaggi interni generano perdita di tempo o errori evitabili. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, setup diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Workflow e integrazioni' }
            ],
            sectionTitle: `Automazione business a ${city.name} per far scorrere meglio il lavoro operativo`,
            sectionIntro: `Automatizziamo i punti in cui il processo si inceppa: passaggi manuali, doppie compilazioni, notifiche assenti, lead senza follow-up o dati che non circolano tra strumenti. L'obiettivo è liberare tempo utile e ridurre errori ripetitivi.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Operiamo da Rho e possiamo allinearci rapidamente con chi gestisce commerciale, operations o amministrazione a ${city.name}.`
                },
                {
                    title: 'Automazioni costruite sul processo reale',
                    text: `Prima mappiamo chi fa cosa, con quali strumenti e dove si blocca il flusso. Solo dopo scegliamo tool, regole e integrazioni.`
                },
                {
                    title: 'Risultato visibile sul lavoro quotidiano',
                    text: `Le automazioni hanno senso se riducono tempi, errori e passaggi inutili già dalla prima settimana di utilizzo.`
                }
            ],
            processIntro: `L'automazione funziona quando capiamo bene flusso, eccezioni e responsabilità. Non basta collegare due strumenti: serve progettare il percorso.`,
            processSteps: [
                {
                    title: '1. Mappatura del processo',
                    text: `Identifichiamo attori, strumenti, colli di bottiglia e passaggi ripetitivi su cui ha senso intervenire subito.`
                },
                {
                    title: '2. Setup di workflow e integrazioni',
                    text: `Costruiamo regole, trigger, notifiche e scambi dati tra piattaforme per alleggerire il lavoro manuale.`
                },
                {
                    title: '3. Test, correzioni e handoff',
                    text: `Verifichiamo casi reali, sistemiamo eccezioni e ti lasciamo un flusso più robusto, leggibile e facile da usare.`
                }
            ],
            ctaTitle: `Hai processi manuali che ti fanno perdere tempo a ${city.name}?`,
            ctaCopy: `Descrivici dove si inceppa il lavoro: valutiamo insieme quali automazioni possono creare impatto subito.`,
            schemaDescription: `Automazione business a ${city.name} per workflow, CRM, email e processi interni con integrazioni su misura.`
        },
        consulenze: {
            title: `Consulenze a ${city.name}: sessioni mirate su web, SEO e brand da ${price} | WebNovis`,
            description: `Consulenze a ${city.name} per siti web, SEO/GEO, branding e scelte digitali da chiarire con una seconda opinione operativa. Da ${price}.`,
            ogDescription: `Consulenze a ${city.name} per web, SEO, brand e decisioni digitali. Da ${price}.`,
            heroTag: `Consulenze · ${city.name} · ${price}`,
            heroH1: `Consulenze a ${city.name} per sbloccare una decisione digitale precisa`,
            heroCapsule: `<strong>WebNovis</strong> offre consulenze a ${city.name} quando hai bisogno di un confronto mirato su un sito, una pagina, una scelta SEO/GEO, un preventivo o un dubbio di posizionamento. Investimento da <strong>${price}</strong>, sessioni rapide da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: service.timeEstimate },
                { label: 'Focus', value: 'Second opinion operativa' }
            ],
            sectionTitle: `Consulenze a ${city.name} quando non ti serve un progetto intero ma una risposta buona adesso`,
            sectionIntro: `Ci sono momenti in cui non serve attivare subito un servizio completo: serve capire se un preventivo è sensato, se una pagina sta sbagliando direzione, se un rebrand ha senso o se una scelta SEO vale il budget. Qui lavoriamo come seconda opinione, molto concreta.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Da Rho possiamo organizzare confronti rapidi con professionisti, PMI e founder di ${city.name} che hanno bisogno di chiarezza subito.`
                },
                {
                    title: 'Confronto focalizzato',
                    text: `La sessione è costruita su una domanda precisa, non su un audit generico: così il tempo produce una risposta più utile.`
                },
                {
                    title: 'Indicazioni azionabili',
                    text: `Chiudiamo con decisioni, priorità e cose da fare o da evitare, non con una conversazione vaga che lascia tutto aperto.`
                }
            ],
            processIntro: `Le consulenze più utili nascono da una domanda chiara e da un perimetro ben definito: problema, materiali da vedere e decisione da prendere.`,
            processSteps: [
                {
                    title: '1. Raccolta del contesto',
                    text: `Prima della call capiamo obiettivo, materiali da analizzare e punto preciso su cui vuoi un confronto.`
                },
                {
                    title: '2. Sessione orientata alla decisione',
                    text: `Durante la consulenza entriamo nel merito di pagine, preventivi, posizionamento o opzioni strategiche con taglio pratico.`
                },
                {
                    title: '3. Sintesi delle prossime mosse',
                    text: `Ti lasciamo un riepilogo con priorità, rischi da evitare e passi successivi consigliati in base al tema affrontato.`
                }
            ],
            ctaTitle: `Hai una scelta digitale da chiarire a ${city.name}?`,
            ctaCopy: `Mandaci la domanda specifica e i materiali utili: impostiamo una consulenza breve ma davvero orientata alla decisione.`,
            schemaDescription: `Consulenze a ${city.name} su siti web, SEO/GEO, brand e decisioni digitali che richiedono una seconda opinione operativa.`
        }
    };

    return { ...fallback, ...(overrides[service.slug] || {}) };
}

function getRealizzazioneSeoCopy(city) {
    const landingPrice = formatCatalogPrice('landing-page');
    const websitePrice = formatCatalogPrice('sito-vetrina');
    const ecommercePrice = formatCatalogPrice('ecommerce');
    return {
        title: `Siti Web a ${city.name}: da ${websitePrice}, SEO integrata | WebNovis`,
        description: `Realizzazione siti web a ${city.name} per PMI e professionisti: landing da ${landingPrice}, siti vetrina da ${websitePrice}, e-commerce da ${ecommercePrice}. Richiedi un preventivo gratuito.`,
        ogTitle: `Realizzazione Siti Web a ${city.name}: richiedi un preventivo | WebNovis`,
        ogDescription: `Siti web custom a ${city.name} con SEO tecnica integrata, design orientato ai contatti e gestione diretta da Rho (${city.distanzaSede}).`,
        heroTag: `Siti Web ${city.name} · preventivo personalizzato`,
        heroH1: `Realizzazione Siti Web a ${city.name} per PMI e professionisti`,
        heroCapsule: `Cerchi una <strong>web agency a ${city.name}</strong> per creare un sito che trasmetta valore e porti richieste concrete? WebNovis realizza landing page da <strong>${landingPrice}</strong>, siti vetrina da <strong>${websitePrice}</strong> ed e-commerce da <strong>${ecommercePrice}</strong>, con <strong>codice 100% custom</strong>, SEO tecnica integrata e gestione diretta da Rho (${city.distanzaSede}).`
    };
}

function getAgenziaSeoCopy(city) {
    const searchModifier = getGeoSearchModifier(city);
    const sectorPhrase = formatSectorList((city.localContext?.settoriChiave || []).slice(0, 2));
    const firstHighlight = city.localContext?.highlights?.[0]
        ? truncateText(
            String(city.localContext.highlights[0])
                .split('—')[0]
                .split('(')[0]
                .replace(/\s+/g, ' ')
                .trim(),
            44
        )
        : '';
    const differentiator = sectorPhrase || firstHighlight || `${Number(city.population || 0).toLocaleString('it-IT')} abitanti`;

    if (city.isSede) {
        return {
            title: `Agenzia Web a ${city.name} (Milano) — WebNovis | Siti Web Custom, Grafica e Social`,
            description: `WebNovis è l'agenzia web con sede a Rho: siti custom per PMI tra Fiera Milano, servizi B2B e hinterland. Richiedi un preventivo gratuito.`,
            ogTitle: `Agenzia Web a ${city.name} — WebNovis | Siti Web Custom e Digital Marketing`,
            ogDescription: `WebNovis è l'agenzia web con sede a Rho per PMI, professionisti e attività dell'hinterland. Siti custom, grafica e social con gestione diretta.`,
            keywords: `agenzia web ${city.name}, web agency ${city.name} ${searchModifier}, sviluppo siti web ${city.name}, web designer ${city.name}, agenzia digitale ${city.name}, WebNovis ${city.name}`
        };
    }

    return {
        title: `Agenzia Web a ${city.name} (${city.province || 'MI'}) — WebNovis | Siti Web Custom, Grafica e Social`,
        description: `Agenzia web per ${city.name}: siti custom per ${differentiator}. Sede a Rho, ${city.distanzaSede}. Richiedi un preventivo gratuito.`,
        ogTitle: `Agenzia Web a ${city.name} — WebNovis | Siti Web Custom e Digital Marketing`,
        ogDescription: `WebNovis è l'agenzia web per ${city.name}: siti custom, grafica e social per realtà locali legate a ${differentiator}. Sede a Rho, ${city.distanzaSede}.`,
        keywords: `agenzia web ${city.name}, web agency ${city.name} ${searchModifier}, sviluppo siti web ${city.name}, web designer ${city.name}, agenzia digitale ${city.name}, WebNovis ${city.name}`
    };
}

module.exports = {
    isContinuousService,
    getServiceLocalSeoCopy,
    getRealizzazioneSeoCopy,
    getAgenziaSeoCopy
};
