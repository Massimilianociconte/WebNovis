/**
 * Single source of truth for public list prices used by Weby fallbacks.
 * Keep aligned with chat-config.json / data/services.json.
 */
export const CATALOG = {
  web: {
    landing: { name: 'Landing Page', price: 'da €500' },
    vetrina: { name: 'Sito Vetrina', price: 'da €1.200' },
    ecommerce: { name: 'E-commerce', price: 'da €3.500' }
  },
  design: {
    logo: { name: 'Logo', price: 'da €250' },
    brand: { name: 'Brand Identity', price: 'da €500' },
    stampa: { name: 'Materiale Stampa', price: 'preventivo' }
  },
  social: {
    contenuti: { name: 'Contenuti Visual', price: 'da €300/mese' },
    ricerca: { name: 'Ricerca + Contenuti', price: 'da €600/mese' },
    ads: { name: 'Advertising Gestito', price: 'da €500/mese' }
  },
  photo: { from: 'da €150/sessione' },
  contacts: {
    email: 'hello@webnovis.com',
    whatsapp: 'https://wa.me/393802647367',
    phone: '+39 380 264 7367'
  }
};

export function pricingListText() {
  return [
    'Ecco i prezzi di catalogo (indicativi, IVA esclusa):',
    '',
    'Web:',
    `• ${CATALOG.web.landing.name}: ${CATALOG.web.landing.price}`,
    `• ${CATALOG.web.vetrina.name}: ${CATALOG.web.vetrina.price}`,
    `• ${CATALOG.web.ecommerce.name}: ${CATALOG.web.ecommerce.price}`,
    '',
    'Design:',
    `• ${CATALOG.design.logo.name}: ${CATALOG.design.logo.price}`,
    `• ${CATALOG.design.brand.name}: ${CATALOG.design.brand.price}`,
    `• ${CATALOG.design.stampa.name}: ${CATALOG.design.stampa.price}`,
    '',
    'Social:',
    `• ${CATALOG.social.contenuti.name}: ${CATALOG.social.contenuti.price}`,
    `• ${CATALOG.social.ads.name}: ${CATALOG.social.ads.price}`,
    '',
    'I preventivi finali sono personalizzati e gratuiti.',
    'Vuoi che ti indirizzi al form preventivo o a WhatsApp?'
  ].join('\n');
}

/** Italian pricing intent — includes "costa", not only "costo". */
export function isPricingIntent(message) {
  return /(prezz|cost|preventiv|budget|tariff|listin|quotazion|quanto\s+costa)/i.test(String(message || ''));
}

export function getLocalChatResponse(message) {
  const lower = String(message || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (/^(ciao|salve|buongiorno|buonasera|hey|hello|hi|hola|salut)[!.\s]*$/i.test(lower.trim())) {
    return "Ciao! Sono Weby, l'assistente AI di WebNovis.\nCi occupiamo di siti web, grafica e social media.\n\nCome posso aiutarti oggi?";
  }

  if (/^(grazie|thanks|ok grazie|grazie mille|perfetto grazie|ottimo grazie)[!.\s]*$/i.test(lower.trim())) {
    return 'Prego! Se hai altre domande sono qui.\nBuona giornata!';
  }

  if (isPricingIntent(lower)) {
    return pricingListText();
  }

  if (/(sito|web|ecommerce|e-commerce|landing|vetrina|wordpress|shopify)/i.test(lower)) {
    return [
      'Creiamo siti web su misura (niente template):',
      `• Landing: ${CATALOG.web.landing.price}`,
      `• Sito vetrina: ${CATALOG.web.vetrina.price}`,
      `• E-commerce: ${CATALOG.web.ecommerce.price}`,
      '',
      'Vuoi un preventivo gratuito o vedere il portfolio?'
    ].join('\n');
  }

  if (/(logo|grafica|brand|design|identit|visual|stampa|flyer|brochure)/i.test(lower)) {
    return [
      'Identità visiva da zero:',
      `• Logo: ${CATALOG.design.logo.price}`,
      `• Brand Identity: ${CATALOG.design.brand.price}`,
      `• Materiale stampa: ${CATALOG.design.stampa.price}`,
      '',
      'Vuoi vedere esempi o ricevere un preventivo?'
    ].join('\n');
  }

  if (/(social|instagram|facebook|tiktok|linkedin|ads|campagn|advertising)/i.test(lower)) {
    return [
      'Supporto social e advertising:',
      `• Contenuti visual: ${CATALOG.social.contenuti.price}`,
      `• Advertising Meta: ${CATALOG.social.ads.price}`,
      '',
      'Non gestiamo pubblicazioni quotidiane degli account.',
      'Ti interessa un pacchetto?'
    ].join('\n');
  }

  if (/(contatt|email|parlare|scrivere|chiamare|telefon|whatsapp|ricontatt)/i.test(lower)) {
    return [
      'Puoi contattarci così:',
      `• Email: ${CATALOG.contacts.email}`,
      `• WhatsApp: ${CATALOG.contacts.whatsapp}`,
      '• Form: /contatti.html o /preventivo.html',
      '',
      'Ti ricontattiamo attraverso i canali indicati.'
    ].join('\n');
  }

  if (/(chi siete|chi sei|chi e webnovis|di cosa vi occupate|cosa fate|presentati)/i.test(lower)) {
    return [
      "Sono Weby, l'assistente AI di WebNovis.",
      "WebNovis è un'agenzia digitale a Rho (MI): siti web, grafica, branding e social.",
      '',
      'Vuoi vedere il portfolio o un preventivo gratuito?'
    ].join('\n');
  }

  return [
    'Posso aiutarti con i servizi WebNovis:',
    '• Siti web ed e-commerce',
    '• Logo, grafica e branding',
    '• Social media e advertising',
    '',
    'Cosa ti interessa?'
  ].join('\n');
}
