import os
import re

mapping = {
    "quanto-costa-gestione-social-media.html": "Img/blog/blog-gestione-social.png",
    "web-agency-vs-freelance.html": "Img/blog/blog-agency-vs-freelance.png",
    "sito-web-fai-da-te-vs-professionale.html": "Img/blog/blog-fai-da-te-vs-pro.png",
    "serve-ancora-un-sito-web.html": "Img/blog/blog-serve-sito-web.png",
    "shopify-vs-sito-ecommerce-custom.html": "Img/blog/blog-shopify-vs-custom.png",
    "meta-ads-vs-google-ads.html": "Img/blog/blog-meta-vs-google-ads.png",
    "brand-identity-guida-completa.html": "Img/blog/blog-brand-identity-costi.png",
    "facebook-ads-guida-pratica.html": "Img/blog/blog-facebook-ads-costi.png",
    "scegliere-hosting-sito-web.html": "Img/blog/blog-hosting-sito-web.png",
    "accessibilita-web-guida.html": "Img/blog/blog-accessibilita-web.png",
    "sito-web-multilingua.html": "Img/blog/blog-sito-multilingua.png",
    "web-design-trends-2026.html": "Img/blog/blog-web-design-trends.png",
    "form-contatto-ottimizzazione.html": "Img/blog/blog-form-contatto.png",
    "piattaforme-ecommerce-confronto.html": "Img/blog/blog-ecommerce-confronto.png",
    "scheda-prodotto-perfetta.html": "Img/blog/blog-scheda-prodotto.png",
    "seo-blog-aziendale.html": "Img/seo-blog-aziendale.png",
    "aggiornamenti-algoritmo-google-2026.html": "Img/aggiornamenti-algoritmo-google-2026.png"
}

def update_meta_tags(filepath, correct_img_path):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    full_url = f"https://www.webnovis.com/{correct_img_path}"
    
    # Update or add og:image
    if re.search(r'<meta property="og:image"[^>]*>', content):
        content = re.sub(r'<meta property="og:image"[^>]*>', f'<meta content="{full_url}" property="og:image">', content)
    else:
        # Inject after og:description
        content = re.sub(r'(<meta property="og:description"[^>]*>)', f'\\1\n    <meta content="{full_url}" property="og:image">', content)

    # Update or add twitter:image  
    if re.search(r'<meta property="twitter:image"[^>]*>', content):
        content = re.sub(r'<meta property="twitter:image"[^>]*>', f'<meta content="{full_url}" property="twitter:image">', content)
    else:
        # Inject after twitter:description
        content = re.sub(r'(<meta property="twitter:description"[^>]*>)', f'\\1\n    <meta content="{full_url}" property="twitter:image">', content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for slug, img_path in mapping.items():
    filepath = os.path.join('blog', slug)
    if os.path.exists(filepath):
        update_meta_tags(filepath, img_path)
        print(f"Updated {slug}")
    else:
        print(f"Skipped {slug} - not found")
