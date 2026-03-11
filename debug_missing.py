with open('blog/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

slugs = [
    'kpi-advertising-online','campagne-locali-google-ads','creative-fatigue-ads',
    'blog-aziendale-perche','content-calendar-guida','pillar-page-strategia',
    'video-marketing-pmi','storytelling-marketing-guida','content-repurposing',
    'podcast-aziendale-guida','social-proof-sito-web','pagina-prezzi-ottimizzazione',
    'copywriting-persuasivo-web','lead-magnet-guida','heatmap-analisi-comportamento',
    'exit-intent-popup','trust-signals-ecommerce','thank-you-page-ottimizzazione',
    'brand-positioning-strategia','brand-storytelling','infografiche-come-crearle',
    'presentazioni-aziendali-design','motion-design-marketing','teoria-colore-design-web',
    'design-thinking-business','biglietti-visita-design','linkedin-personal-branding',
    'sito-personale-freelancer','portfolio-digitale-guida','thought-leadership-strategia',
    'social-media-crisis-management','user-generated-content','social-commerce-guida',
    'influencer-marketing-pmi','social-media-automation-tool','tendenze-social-media-2026',
    'instagram-reels-strategia','instagram-stories-business','instagram-hashtag-strategia',
    'instagram-bio-ottimizzazione','instagram-carousel-guida','instagram-algoritmo-2026',
    'instagram-shop-guida','instagram-insights-guida','instagram-content-strategy',
    'instagram-collaborazioni-brand','budget-advertising-online','landing-page-ads',
    'copywriting-ads-tecniche'
]

missing = [s for s in slugs if f'../Img/blog/blog-{s}.png' not in html]
print('Still placeholder:', missing)

import re
for s in missing:
    card_in_html = (s + '.html') in html
    print(f'  {s}: card_in_html={card_in_html}')
    if card_in_html:
        # show the picture block context
        idx = html.find(s + '.html')
        print(f'  Context: {repr(html[idx:idx+400])}')
