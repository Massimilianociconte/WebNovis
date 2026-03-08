"""
Script per aggiornare le card del blog/index.html con le immagini corrette.
Sostituisce ../Img/blog-cat-web.webp con l'immagine specifica per ogni articolo.
"""

import re

# Mappa: href dell'articolo -> nome dell'immagine (senza estensione)
ARTICLE_IMAGE_MAP = {
    'brand-audit.html': 'blog-brand-audit',
    'brand-awareness-strategie.html': 'blog-brand-awareness-strategie',
    'brand-consistency-multicanale.html': 'blog-brand-consistency-multicanale',
    'brand-loyalty-strategie.html': 'blog-brand-loyalty-strategie',
    'guida-stile-brand.html': 'blog-guida-stile-brand',
    'tone-of-voice-aziendale.html': 'blog-tone-of-voice-aziendale',
    'headless-cms-guida.html': 'blog-headless-cms',
    'cloud-hosting-vs-tradizionale.html': 'blog-cloud-hosting',
    'cyber-security-pmi.html': 'blog-cyber-security',
    'gdpr-sito-web-conformita.html': 'blog-gdpr-sito-web',
    'brand-positioning-strategia.html': 'blog-brand-positioning',
    'brand-storytelling.html': 'blog-brand-storytelling',
    # Articoli aggiuntivi con immagine propria
    'ab-testing-sito-web.html': 'blog_ab_testing',
    'above-the-fold-ottimizzazione.html': 'blog_above_the_fold',
    'api-rest-cosa-sono.html': 'blog_api_rest',
    'automazione-processi-aziendali.html': 'blog_automazione',
    'crawl-budget-ottimizzazione.html': 'blog_crawl_budget',
    'errori-404-gestione-seo.html': 'blog_errori_404',
    'hreflang-guida-seo-internazionale.html': 'blog_hreflang',
    'indicizzazione-google-problemi.html': 'blog_indicizzazione',
    'internal-linking-strategia.html': 'blog_internal_linking',
    'jamstack-architettura-web.html': 'blog_jamstack',
    'log-analysis-seo.html': 'blog_log_analysis',
    'navigazione-sito-web-struttura.html': 'blog_navigazione',
    'no-code-low-code-guida.html': 'blog_nocode',
    'redirect-301-302-guida.html': 'blog_redirect',
    'responsive-design-guida.html': 'blog_responsive',
    'robots-txt-sitemap-xml.html': 'blog_robots_sitemap',
    'tipografia-web-guida.html': 'blog_tipografia',
}

PLACEHOLDER = '../Img/blog-cat-web.webp'
INDEX_FILE = 'blog/index.html'

with open(INDEX_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

original_content = content
updates = 0

# Trova tutti i blocchi <article> con il loro href
# Pattern: da <article fino a </article>
article_pattern = re.compile(r'(<article\b[^>]*>.*?</article>)', re.DOTALL)

def replace_image_in_article(match):
    global updates
    article_html = match.group(1)
    
    # Controlla se ha il placeholder
    if PLACEHOLDER not in article_html:
        return article_html
    
    # Trova l'href del link
    href_match = re.search(r'href="([^"]+)"', article_html)
    if not href_match:
        return article_html
    
    href = href_match.group(1)
    # Prendi solo il nome del file dall'href
    filename = href.split('/')[-1]
    
    if filename not in ARTICLE_IMAGE_MAP:
        print(f"  [SKIP] Nessuna immagine per: {filename}")
        return article_html
    
    img_name = ARTICLE_IMAGE_MAP[filename]
    new_webp = f'../Img/blog/{img_name}.webp'
    new_png = f'../Img/blog/{img_name}.png'
    
    # Sostituisci: source srcset con placeholder -> nuova immagine webp
    updated = re.sub(
        r'<source srcset="../Img/blog-cat-web\.webp" type="image/webp">',
        f'<source srcset="{new_webp}" type="image/webp">',
        article_html
    )
    # Sostituisci: img src con placeholder -> nuova immagine png
    updated = re.sub(
        r'<img[^>]*src="../Img/blog-cat-web\.webp"[^>]*/?>',
        lambda m: re.sub(r'src="[^"]+"', f'src="{new_png}"', m.group(0)),
        updated
    )
    # Sostituisci anche loading="lazy" img con src del placeholder
    updated = re.sub(
        r'src="../Img/blog-cat-web\.webp"',
        f'src="{new_webp}"',
        updated
    )
    
    if updated != article_html:
        updates += 1
        print(f"  [OK] {filename} -> {img_name}.webp")
    
    return updated

new_content = article_pattern.sub(replace_image_in_article, content)

if new_content != original_content:
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"\nAGGIORNATO: {updates} card aggiornate in {INDEX_FILE}")
else:
    print("Nessuna modifica necessaria.")

# Verifica: conta quante occorrenze del placeholder rimangono
remaining = new_content.count(PLACEHOLDER)
print(f"Placeholder rimasti: {remaining}")
