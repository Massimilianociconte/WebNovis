import re

processed_slugs = [
    "quanto-costa-gestione-social-media.html",
    "web-agency-vs-freelance.html",
    "sito-web-fai-da-te-vs-professionale.html",
    "serve-ancora-un-sito-web.html",
    "shopify-vs-sito-ecommerce-custom.html",
    "meta-ads-vs-google-ads.html",
    "brand-identity-guida-completa.html",
    "facebook-ads-guida-pratica.html",
    "scegliere-hosting-sito-web.html",
    "accessibilita-web-guida.html",
    "sito-web-multilingua.html",
    "web-design-trends-2026.html",
    "form-contatto-ottimizzazione.html",
    "piattaforme-ecommerce-confronto.html",
    "scheda-prodotto-perfetta.html",
    "seo-blog-aziendale.html",
    "aggiornamenti-algoritmo-google-2026.html"
]

with open('blog/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Only keep the HTML body before the json-ld
body_content = content.split('<script type="application/ld+json">')[0]

missing_in_body = []
for slug in processed_slugs:
    if f'"{slug}"' not in body_content and f"'{slug}'" not in body_content:
        missing_in_body.append(slug)

print(f"Missing in body: {len(missing_in_body)} out of {len(processed_slugs)}")
