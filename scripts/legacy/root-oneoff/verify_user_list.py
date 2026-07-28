import re, os

user_articles = {
    "come scegliere la web agency giusta": "come-scegliere-web-agency.html",
    "SEO per blog aziendale": "seo-blog-aziendale.html",
    "aggiornamenti algoritmo google 2026": "aggiornamenti-algoritmo-google-2026.html",
    "SEO youtube": "seo-youtube-video.html",
    "Headless CMS": "headless-cms-guida.html",
    "Cloud hosting vs tradizionale": "cloud-hosting-vs-tradizionale.html",
    "Cyber security per PMI": "cyber-security-pmi.html",
    "GDPR e sito web": "gdpr-sito-web-conformita.html",
    "Lead magnet": "lead-magnet-guida.html",
    "Heatmap sito web": "heatmap-analisi-comportamento.html",
    "Exit intent popup": "exit-intent-popup.html",
    "Trust signals ecommerce": "trust-signals-ecommerce.html",
    "Thank you page": "thank-you-page-ottimizzazione.html",
    "Personal Brand per consulenti": "personal-brand-consulente.html",
    "Social commerce 2026": "social-commerce-guida.html",
    "Influencer marketing per PMI": "influencer-marketing-pmi.html",
    "Automazione social media": "social-media-automation-tool.html",
    "Tendenze social media 2026": "tendenze-social-media-2026.html",
    "come ridurre il bounce rate": "bounce-rate-ridurre.html",
    "Data-driven marketing": "data-driven-marketing.html",
    "Marketing Plan modello": "marketing-plan-modello.html",
    "Customer Journey mapping": "customer-journey-mapping.html",
    "USP aziendale": "unique-selling-proposition.html",
    "Strategia Omnichannel": "omnichannel-strategia.html",
    "Growth Hacking per PMI": "growth-hacking-pmi.html",
    "Analisi competitor": "analisi-competitiva-online.html",
    "Trasformazione digitale PMI": "digital-transformation-pmi.html",
    "Marketing in-house vs outsourcing": "outsourcing-vs-inhouse-marketing.html",
    "Retention marketing": "retention-marketing-strategie.html",
    "Marketing digitale attivita locali Milano": "marketing-digitale-attivita-locali-milano.html",
    "Email vs SMS marketing": "email-vs-sms-marketing.html",
    "Creare sito con intelligenza artificiale": "creare-sito-con-intelligenza-artificiale.html",
    "Tradurre un sito web": "tradurre-sito-web-guida.html",
    "URL strane in Google Search Console": "url-strane-search-console.html",
    "Engagement sito web": "engagement-sito-web-strategie.html",
    "Dati obbligatori sito web aziendale": "dati-obbligatori-sito-web-aziendale.html",
    "Alternativa a Linktree": "alternativa-linktree-link-in-bio.html",
}

with open('blog/index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

for title, slug in user_articles.items():
    # Find the img src used in blog/index.html for this article
    pattern = rf'<a[^>]+href="{re.escape(slug)}"[^>]*>[\s\S]*?</a\s*>'
    match = re.search(pattern, idx, re.IGNORECASE)
    img_src = "NOT IN INDEX"
    img_exists = False
    if match:
        card_html = match.group(0)
        img_match = re.search(r'<img[^>]+src="([^"]+)"', card_html)
        if img_match:
            img_src = img_match.group(1).replace('../', '')
            img_exists = os.path.exists(img_src)
    
    status = "✅" if img_exists else "❌"
    print(f"{status} {title}")
    print(f"   slug: {slug}")
    print(f"   img:  {img_src} (exists: {img_exists})")
    print()
