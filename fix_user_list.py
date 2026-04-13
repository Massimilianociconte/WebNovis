import re
import os

user_list = [
    "come scegliere la web agency giusta",
    "SEO per blog aziendale",
    "aggiornamenti algoritmo google 2026",
    "SEO youtube",
    "Headless CMS",
    "Cloud hosting vs tradizionale",
    "Cyber security per PMI",
    "GDPR e sito web",
    "Lead magnet",
    "Heatmap sito web",
    "Exit intent popup",
    "Trust signals ecommerce",
    "Thank you page",
    "Personal Brand per consulenti",
    "Social commerce 2026",
    "Influencer marketing per PMI",
    "Automazione social media",
    "Tendenze social media 2026",
    "come ridurre il bounce rate del tuo sito",
    "Data-driven marketing",
    "Marketing Plan modello",
    "Customer Journey mappinh",
    "USP aziendale",
    "Strategia Omnichannel",
    "Growth Hacking per PMI",
    "Analisi competitor",
    "Trasformazione digitale PMI",
    "Marketing in-house vs outsourcing",
    "Retention marketing",
    "Marketing digitale per attività locali a Milano",
    "Email vs SMS marketing per PMI",
    "Creare un sito con l'intelligenza artificiale",
    "Tradurre un sito web",
    "URL strane in Google Search Console",
    "Engagement sito web",
    "Dati obbligatori sito web aziendale",
    "Alternativa a Linktree"
]

all_html = os.listdir('blog')
html_map = {}
for title in user_list:
    slug = None
    if "SEO per blog aziendale" in title: slug = "seo-blog-aziendale.html"
    elif "Headless CMS" in title: slug = "headless-cms-guida.html"
    elif "Cloud hosting vs" in title: slug = "cloud-hosting-vs-tradizionale.html"
    elif "web agency giusta" in title: slug = "come-scegliere-web-agency.html"
    elif "aggiornamenti algoritmo" in title: slug = "aggiornamenti-algoritmo-google-2026.html"
    elif "SEO youtube" in title: slug = "seo-youtube-video.html"
    elif "Cyber security" in title: slug = "cyber-security-pmi.html"
    elif "GDPR" in title: slug = "gdpr-sito-web-conformita.html"
    elif "Lead magnet" in title: slug = "lead-magnet-guida.html"
    elif "Heatmap" in title: slug = "heatmap-analisi-comportamento.html"
    elif "Exit intent" in title: slug = "exit-intent-popup.html"
    elif "Trust signals" in title: slug = "trust-signals-ecommerce.html"
    elif "Thank you page" in title: slug = "thank-you-page-ottimizzazione.html"
    elif "Personal Brand per consulenti" in title: slug = "personal-brand-consulente.html"
    elif "Social commerce" in title: slug = "social-commerce-guida.html"
    elif "Influencer marketing" in title: slug = "influencer-marketing-pmi.html"
    elif "Automazione social" in title: slug = "social-media-automation-tool.html"
    elif "Tendenze social" in title: slug = "tendenze-social-media-2026.html"
    elif "bounce rate" in title: slug = "bounce-rate-ridurre.html"
    elif "Data-driven" in title: slug = "data-driven-marketing.html"
    elif "Marketing Plan" in title: slug = "marketing-plan-modello.html"
    elif "Customer Journey" in title: slug = "customer-journey-mapping.html"
    elif "USP" in title: slug = "unique-selling-proposition.html"
    elif "Omnichannel" in title: slug = "omnichannel-strategia.html"
    elif "Growth Hacking" in title: slug = "growth-hacking-pmi.html"
    elif "Analisi competitor" in title: slug = "analisi-competitiva-online.html"
    elif "Trasformazione digitale" in title: slug = "digital-transformation-pmi.html"
    elif "in-house vs out" in title: slug = "outsourcing-vs-inhouse-marketing.html"
    elif "Retention" in title: slug = "retention-marketing-strategie.html"
    elif "attivita locali a Milano" in title: slug = "marketing-digitale-attivita-locali-milano.html"
    elif "Email vs SMS" in title: slug = "email-vs-sms-marketing.html"
    elif "intelligenza artificiale" in title: slug = "creare-sito-con-intelligenza-artificiale.html"
    elif "Tradurre" in title: slug = "tradurre-sito-web-guida.html"
    elif "URL strane" in title: slug = "url-strane-search-console.html"
    elif "Engagement" in title: slug = "engagement-sito-web-strategie.html"
    elif "Dati obbligatori" in title: slug = "dati-obbligatori-sito-web-aziendale.html"
    elif "Alternativa a Linktree" in title: slug = "alternativa-linktree-link-in-bio.html"
    
    if slug and slug in all_html:
        html_map[title] = slug
    else:
        print(f"Slug not found for: {title}")

print(f"Matched {len(html_map)} articles out of {len(user_list)}")

# Now let's check blog/index.html to see if these slugs are present
with open('blog/index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()

missing_in_idx = []
for title, slug in html_map.items():
    if slug not in idx_content:
        missing_in_idx.append(slug)

print(f"Missing in index: {len(missing_in_idx)}")
for m in missing_in_idx:
    print(m)

