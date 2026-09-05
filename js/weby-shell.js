/**
 * Injects the Weby chat shell on pages that do not embed it (all except homepage).
 * Loads after DOM is ready; chat.min.js is loaded by noncritical-loader or here.
 */
(function injectWebyShell() {
  if (document.getElementById('chatButton') || document.querySelector('.weby-chat-container')) {
    return;
  }

  // Path assoluti: il sito e' sempre servito dalla radice del dominio, ma le
  // pagine vivono a profondita' diverse (blog/, servizi/, portfolio/case-study/).
  // Il prefix relativo "../" copriva solo la profondita' 1: nelle case study
  // l'avatar diventava /portfolio/Img/robot-112.webp -> 404 (HAR 2026-09-05).
  var privacyHref = '/privacy-policy.html#sistemi-ai';
  var robot = '/Img/robot-112.webp';
  var robotPng = '/Img/robot-112.webp';

  var aside = document.createElement('aside');
  aside.className = 'weby-chat-container';
  aside.setAttribute('aria-label', 'Assistente AI Weby di WebNovis');
  aside.setAttribute('data-nosnippet', '');
  aside.setAttribute('role', 'complementary');
  aside.innerHTML =
    '<div class="weby-speech" id="webyBubble">' +
      '<span class="weby-speech-text">Ciao, sono Weby — assistente AI. Chiedimi pure</span>' +
      '<button class="weby-speech-close" id="webyBubbleClose" aria-label="Chiudi" type="button">✕</button>' +
      '<div class="weby-speech-tail"></div>' +
    '</div>' +
    '<button class="weby-robot" id="chatButton" aria-label="Apri chat con Weby, assistente AI" type="button">' +
      '<picture>' +
        '<source srcset="' + robot + '" type="image/webp">' +
        '<img alt="Weby" height="56" src="' + robotPng + '" width="56" decoding="async" loading="lazy" class="weby-robot-img">' +
      '</picture>' +
    '</button>' +
    '<div class="chat-popup" id="chatPopup">' +
      '<div class="chat-header">' +
        '<div class="chat-header-info">' +
          '<div class="chat-avatar">' +
            '<picture>' +
              '<source srcset="' + robot + '" type="image/webp">' +
              '<img alt="Weby" height="112" src="' + robotPng + '" width="112" decoding="async" loading="lazy" class="bot-avatar-img">' +
            '</picture>' +
            '<span class="chat-status"></span>' +
          '</div>' +
          '<div class="chat-header-text">' +
            '<h3>Weby <span class="chat-ai-pill">AI</span></h3>' +
            '<p>Assistente AI · online</p>' +
          '</div>' +
        '</div>' +
        '<button class="chat-close" id="chatClose" aria-label="Chiudi chat" type="button">' +
          '<svg viewBox="0 0 24 24" fill="none" height="20" width="20" aria-hidden="true">' +
            '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<p class="chat-ai-notice" role="status">' +
        '<span class="chat-ai-notice-text">Stai chattando con un assistente automatico basato su intelligenza artificiale. Le risposte possono contenere imprecisioni.</span>' +
        '<span class="chat-ai-notice-links">' +
        '<a href="' + privacyHref + '" title="Informativa sui sistemi AI">Privacy</a>' +
        '<span class="chat-ai-notice-sep" aria-hidden="true">·</span>' +
        '<a href="https://wa.me/393802647367" rel="noopener noreferrer" target="_blank" title="Contatta il team su WhatsApp">Team umano</a>' +
        '</span></p>' +
      '<div class="chat-messages" id="chatMessages" role="log" aria-live="polite" aria-atomic="false" aria-label="Conversazione con l\'assistente Weby">' +
        '<div class="bot-message chat-message">' +
          '<div class="message-avatar">' +
            '<picture>' +
              '<source srcset="' + robot + '" type="image/webp">' +
              '<img alt="Weby" height="112" src="' + robotPng + '" width="112" decoding="async" loading="lazy" class="bot-avatar-img">' +
            '</picture>' +
          '</div>' +
          '<div class="message-content">' +
            '<p>Ciao! Sono Weby</p>' +
            '<p>Sono l\'assistente AI di WebNovis: posso aiutarti su servizi, prezzi e progetti. Per un confronto con il team usa email o WhatsApp.</p>' +
            '<span class="message-time">Ora</span>' +
          '</div>' +
        '</div>' +
        '<div class="chat-quick-replies">' +
          '<button class="quick-reply" type="button" data-message="Vorrei informazioni sui vostri servizi">Info Servizi</button>' +
          '<button class="quick-reply" type="button" data-message="Vorrei un preventivo">Preventivo</button>' +
          '<button class="quick-reply" type="button" data-message="Ho bisogno di supporto">Supporto</button>' +
        '</div>' +
      '</div>' +
      '<div class="chat-input-container">' +
        '<input id="chatInput" placeholder="Scrivi un messaggio..." aria-label="Scrivi un messaggio a Weby" class="chat-input" autocomplete="off">' +
        '<button class="chat-send" id="chatSend" aria-label="Invia messaggio" type="button">' +
          '<svg viewBox="0 0 24 24" fill="none" height="20" width="20" aria-hidden="true">' +
            '<path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(aside);
})();
