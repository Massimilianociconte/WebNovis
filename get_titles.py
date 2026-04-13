import re
import json

missing_list = [
    ("quanto-costa-gestione-social-media.html", "Img/blog/blog-gestione-social.png"),
    ("web-agency-vs-freelance.html", "Img/blog/blog-agency-vs-freelance.png"),
    ("sito-web-fai-da-te-vs-professionale.html", "Img/blog/blog-fai-da-te-vs-pro.png"),
    ("serve-ancora-un-sito-web.html", "Img/blog/blog-serve-sito-web.png"),
    ("shopify-vs-sito-ecommerce-custom.html", "Img/blog/blog-shopify-vs-custom.png"),
    ("meta-ads-vs-google-ads.html", "Img/blog/blog-meta-vs-google-ads.png"),
    ("brand-identity-guida-completa.html", "Img/blog/blog-brand-identity-costi.png"),
    ("facebook-ads-guida-pratica.html", "Img/blog/blog-facebook-ads-costi.png"),
    ("scegliere-hosting-sito-web.html", "Img/blog/blog-hosting-sito-web.png"),
    ("accessibilita-web-guida.html", "Img/blog/blog-accessibilita-web.png"),
    ("sito-web-multilingua.html", "Img/blog/blog-sito-multilingua.png"),
    ("web-design-trends-2026.html", "Img/blog/blog-web-design-trends.png"),
    ("form-contatto-ottimizzazione.html", "Img/blog/blog-form-contatto.png"),
    ("piattaforme-ecommerce-confronto.html", "Img/blog/blog-ecommerce-confronto.png"),
    ("scheda-prodotto-perfetta.html", "Img/blog/blog-scheda-prodotto.png"),
    ("seo-blog-aziendale.html", "Img/seo-blog-aziendale.png"),
    ("aggiornamenti-algoritmo-google-2026.html", "Img/aggiornamenti-algoritmo-google-2026.png"),
    ("seo-youtube-video.html", "Img/seo-youtube-video.png"),
    ("headless-cms-guida.html", "Img/headless-cms-guida.png"),
    ("cloud-hosting-vs-tradizionale.html", "Img/cloud-hosting-vs-tradizionale.png"),
    ("cyber-security-pmi.html", "Img/cyber-security-pmi.png"),
    ("gdpr-sito-web-conformita.html", "Img/gdpr-sito-web-conformita.png"),
]

html_path = 'blog/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

results = []
for slug, img_path in missing_list:
    # search for <a href="slug" ... alt="TITLE" or something similar
    idx = html.find(f'href="{slug}"')
    title = slug.replace(".html", "").replace("-", " ").title()
    if idx != -1:
        snippet = html[idx:idx+1000]
        # try to find <h3 class="blog-card-title">TITLE</h3>
        m = re.search(r'<h3[^>]*>(.*?)</h3>', snippet, re.IGNORECASE | re.DOTALL)
        if m:
            title = m.group(1).strip()
    
    results.append({
        "slug": slug,
        "img": img_path,
        "title": title
    })

for item in results:
    print(f"Slug: {item['slug']}")
    print(f"Title: {item['title']}\n")

