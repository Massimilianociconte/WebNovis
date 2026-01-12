// ===== WEBY CHATBOT SYSTEM v3.0 =====
// Mobile-optimized, token-efficient, secure

// Configuration
const CHAT_CONFIG = {
    apiEndpoint: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api/chat'
        : 'https://webnovis-chat.onrender.com/api/chat',
    healthCheckUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api/health'
        : 'https://webnovis-chat.onrender.com/api/health',
    maxMessageLength: 500,      // Prevent token abuse
    maxHistoryLength: 6,        // Keep context tight
    minTypingTime: 800,         // Natural feel
    keepAliveInterval: 5 * 60 * 1000 // 5 minutes
};

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
        scrollLocked: false
    };

    // Store original viewport for mobile keyboard handling
    let originalViewportHeight = window.innerHeight;

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
        // Character limit enforcement
        elements.input.setAttribute('maxlength', CHAT_CONFIG.maxMessageLength);

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

    function appendMessage(content, type = 'bot') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${type === 'user' ? 'user-message' : 'bot-message'}`;

        const avatar = type === 'user' ? 'TU' : 'WN';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Format bot messages (preserve line breaks, escape HTML)
        let formattedContent = escapeHtml(content);
        if (type === 'bot') {
            formattedContent = formattedContent.replace(/\n/g, '<br>');
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

        // Enforce message length limit
        if (message.length > CHAT_CONFIG.maxMessageLength) {
            message = message.substring(0, CHAT_CONFIG.maxMessageLength);
        }

        elements.input.value = '';
        state.hasInteracted = true;

        // Add User Message
        appendMessage(message, 'user');

        // Show Typing Indicator
        showTyping();

        try {
            const response = await fetchResponse(message);
            hideTyping();
            appendMessage(response, 'bot');

            // Update History (keep it tight for token efficiency)
            state.history.push({ role: 'user', content: message });
            state.history.push({ role: 'assistant', content: response });

            // Limit history strictly
            if (state.history.length > CHAT_CONFIG.maxHistoryLength * 2) {
                state.history = state.history.slice(-CHAT_CONFIG.maxHistoryLength * 2);
            }

        } catch (error) {
            hideTyping();
            appendMessage('Si è verificato un errore. Riprova tra poco! 😔', 'bot');
        }
    }

    async function fetchResponse(message) {
        const startTime = Date.now();

        try {
            const res = await fetch(CHAT_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: state.history
                })
            });

            if (!res.ok) throw new Error(`API Error: ${res.status}`);

            const data = await res.json();

            // Ensure minimum typing time for natural feel
            const elapsed = Date.now() - startTime;
            if (elapsed < CHAT_CONFIG.minTypingTime) {
                await new Promise(r => setTimeout(r, CHAT_CONFIG.minTypingTime - elapsed));
            }

            return data.response || data.fallback || getLocalFallback(message);

        } catch (error) {
            await new Promise(r => setTimeout(r, 800));
            return getLocalFallback(message);
        }
    }

    function getLocalFallback(message) {
        const lower = message.toLowerCase();

        // Greetings
        if (lower.match(/^(ciao|salve|buongiorno|buonasera|hey|hello|hi)/)) {
            return "Ciao! 👋 Come posso aiutarti oggi?\n\nMi occupo di siti web, grafica e social media!";
        }

        // Prices
        if (lower.includes('prezz') || lower.includes('cost') || lower.includes('quanto')) {
            return "Ecco i nostri prezzi 👇\n\n👉 Landing Page: da €500\n👉 Sito Vetrina: da €1.200\n👉 E-commerce: da €3.500\n👉 Logo: da €150\n👉 Social: da €300/mese\n\nVuoi un preventivo gratuito?";
        }

        // Web
        if (lower.includes('sito') || lower.includes('web') || lower.includes('ecommerce')) {
            return "Creiamo siti web moderni e ultra-veloci! 🚀\n\nDal design allo sviluppo, ci occupiamo di tutto.\n\nVuoi vedere il nostro portfolio?";
        }

        // Social
        if (lower.includes('social') || lower.includes('instagram') || lower.includes('facebook')) {
            return "Gestiamo i tuoi social a 360°! 📱\n\n👉 Piano editoriale\n👉 Creazione contenuti\n👉 Community management\n\nPiani da €300/mese.";
        }

        // Design
        if (lower.includes('logo') || lower.includes('grafica') || lower.includes('brand')) {
            return "Creiamo identità visive memorabili! ✨\n\n👉 Logo: da €150\n👉 Brand completo: da €450\n\nVuoi vedere esempi?";
        }

        // Contact
        if (lower.includes('contatt') || lower.includes('email') || lower.includes('parlare')) {
            return "Scrivici! 📧\n\n👉 Email: webnovis.info@gmail.com\n👉 Oppure compila il form qui sotto!\n\nTi rispondiamo in giornata.";
        }

        // Thanks
        if (lower.match(/(grazie|thanks|ok|perfetto|ottimo)/)) {
            return "Prego! 😊 Sono qui se hai altre domande.";
        }

        // Default
        return "Posso aiutarti con:\n\n👉 Siti web ed e-commerce\n👉 Loghi e grafica\n👉 Gestione social media\n\nCosa ti interessa?";
    }

    function showTyping() {
        state.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">WN</div>
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
