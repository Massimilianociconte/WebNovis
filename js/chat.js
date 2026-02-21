// ===== WEBY CHATBOT SYSTEM v4.0 =====
// Mobile-optimized, token-efficient, secure
// v4.0: retry logic, localStorage persistence, lead intent detection, adaptive typing, char counter

const _isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Configuration
const CHAT_CONFIG = {
    apiEndpoint: _isLocal ? 'http://localhost:3000/api/chat' : 'https://webnovis-chat.onrender.com/api/chat',
    leadEndpoint: _isLocal ? 'http://localhost:3000/api/chat-lead' : 'https://webnovis-chat.onrender.com/api/chat-lead',
    healthCheckUrl: _isLocal ? 'http://localhost:3000/api/health' : 'https://webnovis-chat.onrender.com/api/health',
    maxMessageLength: 500,
    maxHistoryLength: 8,
    minTypingTime: 600,
    maxTypingTime: 2200,
    keepAliveInterval: 5 * 60 * 1000,
    maxRetries: 2,
    retryDelay: 1200,
    storageKey: 'weby_chat_session',
    storageExpiry: 30 * 60 * 1000  // 30 minutes
};

// Lead intent patterns (Italian + English)
const LEAD_INTENT_PATTERNS = [
    /preventiv|quotazion|offerta/i,
    /voglio (un sito|un logo|un ecommerce|iniziare|parlare|essere contattato)/i,
    /contatt(ami|atemi|armi)|chiamat(emi|ami)|ricontatt/i,
    /interessat[oa]|vorrei (sapere|un|una|iniziare)|ho bisogno|mi serve/i,
    /quando possiamo|come si inizia|come faccio a iniziare|mandate un preventivo/i
];

// Mobile detection (renamed to avoid conflict with main.js)
const isMobileChat = window.innerWidth <= 768 || 'ontouchstart' in window;

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const elements = {
        button: document.getElementById('chatButton'),
        popup: document.getElementById('chatPopup'),
        close: document.getElementById('chatClose'),
        input: document.getElementById('chatInput'),
        send: document.getElementById('chatSend'),
        messages: document.getElementById('chatMessages'),
        bubble: document.getElementById('webyBubble'),
        bubbleClose: document.getElementById('webyBubbleClose')
    };

    // Check for critical elements
    if (!elements.button || !elements.popup) return;

    // State
    let state = {
        isOpen: false,
        isTyping: false,
        history: [],
        hasInteracted: false,
        scrollLocked: false,
        leadCaptured: false,
        messageCount: 0,
        sessionId: Date.now().toString(36)
    };

    // Char counter element (injected after input is found)
    let charCounter = null;

    // Store original viewport for mobile keyboard handling
    const originalViewportHeight = window.innerHeight;

    // Restore previous session from localStorage (if recent)
    restoreSession();

    // --- EVENT LISTENERS ---

    // Toggle Chat
    elements.button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleChat();
    });

    // Close Chat
    if (elements.close) {
        elements.close.addEventListener('click', () => closeChat());
    }

    // Close Bubble
    if (elements.bubbleClose) {
        elements.bubbleClose.addEventListener('click', (e) => {
            e.stopPropagation();
            if (elements.bubble) elements.bubble.classList.add('hidden');
        });
    }

    // Input Handling
    if (elements.input) {
        elements.input.setAttribute('maxlength', CHAT_CONFIG.maxMessageLength);

        // Inject character counter
        const inputWrapper = elements.input.parentElement;
        charCounter = document.createElement('span');
        charCounter.className = 'chat-char-counter';
        charCounter.style.cssText = 'position:absolute;bottom:28px;right:60px;font-size:0.65rem;color:rgba(255,255,255,0.25);pointer-events:none;transition:color 0.2s;';
        if (inputWrapper) {
            inputWrapper.style.position = 'relative';
            inputWrapper.appendChild(charCounter);
        }

        elements.input.addEventListener('input', () => {
            const remaining = CHAT_CONFIG.maxMessageLength - elements.input.value.length;
            if (remaining <= 80) {
                charCounter.textContent = remaining;
                charCounter.style.color = remaining <= 20 ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.35)';
            } else {
                charCounter.textContent = '';
            }
        });

        elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Mobile keyboard handling
        elements.input.addEventListener('focus', handleMobileFocus);
        elements.input.addEventListener('blur', handleMobileBlur);
    }

    if (elements.send) {
        elements.send.addEventListener('click', sendMessage);
    }

    // Quick Replies
    document.querySelectorAll('.quick-reply').forEach(btn => {
        btn.addEventListener('click', function () {
            const msg = this.dataset.message;
            if (msg) {
                elements.input.value = msg;
                sendMessage();
                // Fade out quick replies
                const container = this.parentElement;
                container.style.opacity = '0';
                setTimeout(() => container.remove(), 300);
            }
        });
    });

    // Close on outside click (desktop only)
    if (!isMobileChat) {
        document.addEventListener('click', (e) => {
            if (state.isOpen &&
                !elements.popup.contains(e.target) &&
                !elements.button.contains(e.target)) {
                closeChat();
            }
        });
    }

    // --- MOBILE UX FUNCTIONS ---

    function handleMobileFocus() {
        if (!isMobileChat) return;

        state.scrollLocked = true;

        // Wait for keyboard to appear
        setTimeout(() => {
            // Scroll chat to bottom
            scrollToBottom();

            // Ensure popup is fully visible
            if (elements.popup) {
                elements.popup.style.bottom = '0';
                elements.popup.style.height = '100%';
                elements.popup.style.maxHeight = '100vh';
                elements.popup.style.borderRadius = '0';
            }
        }, 300);
    }

    function handleMobileBlur() {
        if (!isMobileChat) return;

        state.scrollLocked = false;

        // Reset popup styles
        setTimeout(() => {
            if (elements.popup && state.isOpen) {
                elements.popup.style.bottom = '';
                elements.popup.style.height = '';
                elements.popup.style.maxHeight = '';
                elements.popup.style.borderRadius = '';
            }
        }, 100);
    }

    // --- CORE FUNCTIONS ---

    function toggleChat() {
        state.isOpen = !state.isOpen;
        elements.popup.classList.toggle('active', state.isOpen);

        if (state.isOpen) {
            // Hide notification bubble
            if (elements.bubble) elements.bubble.classList.add('hidden');

            // Mobile: prevent background scroll
            if (isMobileChat) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            }

            // Focus input (delayed on mobile)
            setTimeout(() => elements.input?.focus(), isMobileChat ? 300 : 100);

            scrollToBottom();
        } else {
            // Restore scroll on mobile
            if (isMobileChat) {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        }
    }

    function closeChat() {
        state.isOpen = false;
        elements.popup.classList.remove('active');

        // Restore mobile scroll
        if (isMobileChat) {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    }

    const ICONS = {
        sparkles: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
        globe: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
        palette: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
        smartphone: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
        search: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
        rocket: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
        camera: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
        calendar: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
        zap: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
        target: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        mail: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
        tool: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        smile: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>',
        info: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        chevronDown: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
    };

    function appendMessage(content, type = 'bot') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${type === 'user' ? 'user-message' : 'bot-message'}`;

        const botAvatar = `<picture><source srcset="Img/robot.webp" type="image/webp"><img alt="Weby" src="Img/robot-112.webp" class="bot-avatar-img"></picture>`;
        const userAvatar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        const avatar = type === 'user' ? userAvatar : botAvatar;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Format bot messages: escape HTML, linkify, preserve line breaks
        let formattedContent = escapeHtml(content);
        if (type === 'bot') {
            formattedContent = formattedContent
                .replace(/\n/g, '<br>')
                .replace(/(hello@webnovis\.com)/g, '<a href="mailto:$1" style="color:#a8b4f8;text-decoration:underline;">$1</a>')
                .replace(/wa\.me\/(\S+)/g, '<a href="https://wa.me/$1" target="_blank" rel="noopener noreferrer" style="color:#a8b4f8;text-decoration:underline;">WhatsApp</a>')
                .replace(/(https?:\/\/(?!wa\.me)[^\s<"]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#a8b4f8;text-decoration:underline;">$1</a>')
                .replace(/\[icon:([a-zA-Z]+)\]/g, (match, iconName) => ICONS[iconName] || '')
                .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''); // Remove any lingering emojis
        }

        msgDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${formattedContent}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        elements.messages.appendChild(msgDiv);
        scrollToBottom();
    }

    async function sendMessage() {
        if (state.isTyping) return;

        let message = elements.input.value.trim();
        if (!message) return;

        if (message.length > CHAT_CONFIG.maxMessageLength) {
            message = message.substring(0, CHAT_CONFIG.maxMessageLength);
        }

        elements.input.value = '';
        if (charCounter) charCounter.textContent = '';
        state.hasInteracted = true;
        state.messageCount++;

        // Disable send button while processing
        if (elements.send) elements.send.disabled = true;

        appendMessage(message, 'user');
        showTyping();

        // Detect lead intent and notify backend (fire-and-forget, never blocks UX)
        if (!state.leadCaptured && isLeadIntent(message)) {
            state.leadCaptured = true;
            notifyLeadIntent(message);
        }

        try {
            const response = await fetchResponseWithRetry(message);
            hideTyping();
            appendMessage(response, 'bot');

            state.history.push({ role: 'user', content: message });
            state.history.push({ role: 'assistant', content: response });

            if (state.history.length > CHAT_CONFIG.maxHistoryLength * 2) {
                state.history = state.history.slice(-CHAT_CONFIG.maxHistoryLength * 2);
            }

            saveSession();

        } catch (error) {
            hideTyping();
            appendMessage('Ops, qualcosa non ha funzionato. Riprova tra un momento o scrivici a hello@webnovis.com [icon:info]', 'bot');
        } finally {
            if (elements.send) elements.send.disabled = false;
            elements.input?.focus();
        }
    }

    async function fetchResponseWithRetry(message) {
        for (let attempt = 0; attempt <= CHAT_CONFIG.maxRetries; attempt++) {
            try {
                return await fetchResponse(message, attempt);
            } catch (err) {
                if (attempt < CHAT_CONFIG.maxRetries) {
                    // Exponential backoff: 1.2s, 2.4s
                    await new Promise(r => setTimeout(r, CHAT_CONFIG.retryDelay * (attempt + 1)));
                }
            }
        }
        // All retries exhausted — use local fallback silently
        return getLocalFallback(message);
    }

    async function fetchResponse(message, attempt = 0) {
        const startTime = Date.now();

        // Adaptive timeout: longer on retries
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000 + attempt * 2000);

        try {
            const res = await fetch(CHAT_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: state.history,
                    sessionId: state.sessionId
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!res.ok) throw new Error(`API Error: ${res.status}`);

            const data = await res.json();
            const responseText = data.response || data.fallback || '';

            // Adaptive typing delay: proportional to response length, capped
            const elapsed = Date.now() - startTime;
            const targetDelay = Math.min(
                CHAT_CONFIG.maxTypingTime,
                Math.max(CHAT_CONFIG.minTypingTime, responseText.length * 10)
            );
            if (elapsed < targetDelay) {
                await new Promise(r => setTimeout(r, targetDelay - elapsed));
            }

            return responseText || getLocalFallback(message);

        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }

    // --- LEAD INTENT DETECTION ---

    function isLeadIntent(message) {
        return LEAD_INTENT_PATTERNS.some(p => p.test(message));
    }

    function notifyLeadIntent(message) {
        try {
            fetch(CHAT_CONFIG.leadEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message.substring(0, 300),
                    sessionId: state.sessionId,
                    page: window.location.pathname,
                    messageCount: state.messageCount
                })
            }).catch(() => {}); // Fire-and-forget, never block UX
        } catch (e) {}
    }

    // --- SESSION PERSISTENCE ---

    function saveSession() {
        try {
            localStorage.setItem(CHAT_CONFIG.storageKey, JSON.stringify({
                history: state.history,
                sessionId: state.sessionId,
                savedAt: Date.now()
            }));
        } catch (e) {}
    }

    function restoreSession() {
        try {
            const raw = localStorage.getItem(CHAT_CONFIG.storageKey);
            if (!raw) return;
            const session = JSON.parse(raw);
            if (Date.now() - session.savedAt > CHAT_CONFIG.storageExpiry) {
                localStorage.removeItem(CHAT_CONFIG.storageKey);
                return;
            }
            if (!Array.isArray(session.history) || session.history.length === 0) return;

            state.history = session.history;
            state.sessionId = session.sessionId || state.sessionId;

            // Re-render last 4 messages + separator after DOM is ready
            setTimeout(() => {
                if (!elements.messages) return;
                const sep = document.createElement('div');
                sep.style.cssText = 'text-align:center;font-size:0.65rem;color:rgba(255,255,255,0.22);padding:4px 0 8px;letter-spacing:0.04em;';
                sep.textContent = '— conversazione precedente —';
                elements.messages.appendChild(sep);
                state.history.slice(-4).forEach(msg => {
                    appendMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
                });
                scrollToBottom();
            }, 150);
        } catch (e) {
            localStorage.removeItem(CHAT_CONFIG.storageKey);
        }
    }

    // --- LOCAL FALLBACK RESPONSES ---

    function getLocalFallback(message) {
        const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Greetings
        if (lower.match(/^(ciao|salve|buongiorno|buonasera|hey|hello|hi|hola|salut)/)) {
            return "Ciao! [icon:sparkles] Sono Weby, l'assistente di WebNovis.\nLavoriamo su siti web, grafica e social media.\n\nCosa posso fare per te oggi?";
        }

        // Thanks
        if (lower.match(/(grazie|thanks|ok perfetto|ottimo|grande|fantastico|perfetto)/)) {
            return "Prego! [icon:smile] Se hai altre domande sono qui.\nBuona giornata!";
        }

        // Prices / Budget
        if (lower.match(/(prezz|cost|quanto|tariff|listino|budget|preventiv)/)) {
            return "Ecco i prezzi di partenza [icon:chevronDown]\n\n[icon:globe] Web:\n• Landing Page: da €500\n• Sito Vetrina: da €1.200\n• E-commerce: da €3.500\n\n[icon:palette] Design:\n• Logo: da €150\n• Brand Identity: da €450\n\n[icon:smartphone] Social Media: da €300/mese\n\nI preventivi sono sempre gratuiti e su misura.\nVuoi che ti prepariamo uno personalizzato?";
        }

        // Objection: too expensive
        if (lower.match(/(caro|costoso|troppo|non ho budget|poco budget|economico|conveniente|scontare)/)) {
            return "Capisco! [icon:zap]\nUn sito professionale lavora per te 24/7 — è un investimento, non una spesa.\n\nPossiamo strutturare il progetto in fasi per distribuire il costo.\n\nVuoi un preventivo gratuito su misura per il tuo budget?";
        }

        // Objection: need to think
        if (lower.match(/(devo pensare|ci penso|non sono sicuro|forse|magari|vedremo|non so)/)) {
            return "Assolutamente, prenditi il tempo che ti serve! [icon:smile]\n\nPosso inviarti un preventivo dettagliato via email così hai tutto nero su bianco.\n\nQual è la tua email? Rispondo entro 24 ore, senza impegno.";
        }

        // Already have a site
        if (lower.match(/(ho gia|ho gi|sito esistente|restyling|rifacimento|aggiornare il sito|migliorare il sito)/)) {
            return "Ottimo punto di partenza! [icon:search]\nSpesso un restyling o un'ottimizzazione SEO del sito esistente fa la differenza.\n\nPossiamo analizzare gratuitamente il tuo sito attuale.\nManda l'URL a hello@webnovis.com — ti diciamo cosa migliorare!";
        }

        // Web / E-commerce
        if (lower.match(/(sito|web|ecommerce|e-commerce|landing|pagina|app|wordpress|shopify|negozio online)/)) {
            return "Creiamo siti web professionali e performanti! [icon:rocket]\n\n• Design su misura (zero template)\n• Responsive su ogni dispositivo\n• SEO tecnica inclusa\n• E-commerce scalabili\n\nPrezzi da €500 per una landing page.\n\nVuoi vedere il portfolio o ricevere un preventivo gratuito?";
        }

        // Social
        if (lower.match(/(social|instagram|facebook|tiktok|linkedin|post|content|ads|campagn|advertising)/)) {
            return "Supportiamo la tua presenza social! [icon:smartphone]\n\n• Analisi competitor e ricerche di marketing\n• Contenuti grafici pronti per la pubblicazione\n• Campagne Meta Ads gestite\n\nNota: non gestiamo profili o pubblicazioni quotidiane.\n\nPacchetti da €300/mese.\nVuoi sapere quale fa per te?";
        }

        // Design / Logo / Brand
        if (lower.match(/(logo|grafica|brand|design|identit|visual|stampa|flyer|brochure|packaging|coordinato)/)) {
            return "Creiamo identità visive memorabili! [icon:sparkles]\n\n• Logo professionale: da €150\n• Brand Identity completa: da €450\n• Materiale stampa: preventivo\n• Packaging: preventivo\n\nTutto disegnato da zero, nessun template!\n\nVuoi vedere esempi nel portfolio?";
        }

        // Photo / Video
        if (lower.match(/(foto|video|shooting|fotografic|ripres|editing|post-produzion)/)) {
            return "Offriamo servizi foto e video professionali! [icon:camera]\n\n• Shooting prodotto\n• Ritratti aziendali\n• Video promo\n• Editing avanzato\n\nDa €150/sessione.\n\nVuoi maggiori dettagli o un preventivo?";
        }

        // Timeline / How long
        if (lower.match(/(tempo|quanto ci vuole|tempi|consegna|settiman|giorni|veloce|urgent|scadenza)/)) {
            return "I tempi variano in base alla complessità [icon:calendar]\n\n• Landing Page: 1-2 settimane\n• Sito Vetrina: 3-4 settimane\n• E-commerce: 6-8 settimane\n• Logo: 1-2 settimane\n• Brand Identity: 2-4 settimane\n• Social: attivazione in 5 giorni\n\nHai una data di lancio in mente?";
        }

        // Process / How it works
        if (lower.match(/(come funzion|processo|come lavora|metodo|step|fasi|procedur|come si inizia)/)) {
            return "Il nostro processo in 5 step [icon:zap]\n\n1️⃣ Analisi gratuita delle tue esigenze\n2️⃣ Mockup su misura\n3️⃣ Revisione condivisa\n4️⃣ Sviluppo tecnico\n5️⃣ Lancio + supporto continuo\n\nVuoi iniziare con una consulenza gratuita?";
        }

        // Portfolio
        if (lower.match(/(portfolio|esemp|lavori|progett|client|referenz)/)) {
            return "Puoi vedere i nostri lavori su webnovis.com/portfolio.html [icon:target]\n\nAlcuni progetti: Mikuna, FB Total Security, QuickSEO, DreamSense, Mimmo Fratelli e altri.\n\nVuoi info su un progetto specifico?";
        }

        // Contact
        if (lower.match(/(contatt|email|parlare|scrivere|chiamare|telefon|whatsapp|ricontatt)/)) {
            return "Puoi contattarci così [icon:mail]\n\n• Email: hello@webnovis.com\n• WhatsApp: wa.me/393802647367\n• Form contatti: qui sotto nella pagina\n\nRispondiamo entro 24 ore!";
        }

        // Support / Maintenance
        if (lower.match(/(support|aiuto|problema|assist|manutenzione|aggiornament)/)) {
            return "Offriamo supporto dedicato! [icon:tool]\n\n• Chatbot (io!)\n• WhatsApp\n• Email: hello@webnovis.com\n\nAssistenza continua anche dopo il lancio.\n\nCome posso aiutarti?";
        }

        // SEO
        if (lower.match(/(seo|posizionamento|google|indicizzazione|ranking)/)) {
            return "Ottimizziamo i siti per Google! [icon:search]\n\n• SEO tecnica on-page\n• Struttura ottimizzata per i motori di ricerca\n• Performance e velocità\n• Schema.org e dati strutturati\n\nL'ottimizzazione SEO è inclusa in tutti i nostri siti web!\n\nVuoi saperne di più?";
        }

        // Chi siete / About
        if (lower.match(/(chi siete|chi sei|chi e webnovis|di cosa vi occupate|cosa fate|presentati)/)) {
            return "Sono Weby, l'assistente di Web Novis! [icon:sparkles]\n\nWebNovis è un'agenzia digitale italiana con sede a Rho (MI).\nCi occupiamo di siti web, grafica, branding e social media.\n\nFilosofia: design 100% su misura, zero template, SEO inclusa.\n\nVuoi vedere il portfolio o ricevere un preventivo gratuito?";
        }

        // Default
        return "Posso aiutarti con i servizi WebNovis:\n\n[icon:globe] Siti web ed e-commerce\n[icon:palette] Logo, grafica e branding\n[icon:smartphone] Social media e advertising\n[icon:camera] Foto e video\n\nCosa ti interessa? [icon:smile]";
    }

    function showTyping() {
        state.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <picture><source srcset="Img/robot.webp" type="image/webp"><img alt="Weby" src="Img/robot-112.webp" class="bot-avatar-img"></picture>
            </div>
            <div class="message-content">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        elements.messages.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTyping() {
        state.isTyping = false;
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            if (elements.messages) {
                elements.messages.scrollTop = elements.messages.scrollHeight;
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- INITIALIZATION ---

    // Show bubble after delay
    setTimeout(() => {
        if (!state.isOpen && !state.hasInteracted && elements.bubble) {
            elements.bubble.classList.add('visible');
        }
    }, isMobileChat ? 5000 : 3000); // Longer delay on mobile

    // Keep-Alive Heartbeat (production only)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setInterval(() => {
            fetch(CHAT_CONFIG.healthCheckUrl).catch(() => { });
        }, CHAT_CONFIG.keepAliveInterval);

        // Wake up server on load
        fetch(CHAT_CONFIG.healthCheckUrl).catch(() => { });
    }
});
