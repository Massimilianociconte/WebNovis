"""Fix all remaining generic image references in blog/index.html.
Updates both srcset and src attributes for each article card to use the custom image."""
import re

html_path = r'C:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Complete mapping: article_slug -> custom image basename
# This includes ALL articles that should have custom images (both old batch and new batch)
image_map = {
    # Batch 1 (session 1) - already have srcset but need src fix
    'sito-web-per-ristoranti.html': 'blog-sito-ristoranti',
    'sito-web-per-avvocati.html': 'blog-sito-avvocati',
    'sito-web-per-dentisti.html': 'blog-sito-dentisti',
    'sito-web-per-startup.html': 'blog-sito-startup',
    'manutenzione-sito-web.html': 'blog-manutenzione-sito',
    'european-accessibility-act-siti-web.html': 'blog-european-accessibility-act',
    'seo-per-ai-overviews.html': 'blog-seo-ai-overviews',
    'chatbot-sito-web-guida.html': 'blog-chatbot-sito-web',
    'gdpr-sito-web-guida.html': 'blog-gdpr-sito-web',
    'normativa-accessibilita-web-2026.html': 'blog-normativa-accessibilita',
    'obblighi-legge-accessibilita-siti.html': 'blog-obblighi-accessibilita',
    'strumenti-test-accessibilita.html': 'blog-strumenti-accessibilita',
    'keyword-research-guida-2026.html': 'blog-keyword-research',
    'seo-on-page-checklist.html': 'blog-seo-on-page',
    'link-building-etica.html': 'blog-link-building',
    # Batch 2 (this session) - need both srcset and src
    'migrazione-sito-web-guida.html': 'blog-migrazione-sito-web',
    'progressive-web-app-pmi.html': 'blog-progressive-web-app',
    'checkout-ottimizzazione.html': 'blog-checkout-ottimizzazione',
    'seo-ecommerce-guida.html': 'blog-seo-ecommerce',
    'ecommerce-b2b-guida.html': 'blog-ecommerce-b2b',
    'gestione-resi-ecommerce.html': 'blog-gestione-resi',
    'fotografia-prodotto-ecommerce.html': 'blog-fotografia-prodotto',
    'marketplace-vs-ecommerce-proprio.html': 'blog-marketplace-vs-ecommerce',
    'email-marketing-ecommerce.html': 'blog-email-marketing-ecommerce',
    'pagamenti-online-ecommerce.html': 'blog-pagamenti-online',
    'come-scegliere-web-agency.html': 'blog-scegliere-web-agency',
    'seo-per-piccole-imprese.html': 'blog-seo-piccole-imprese',
    'ottimizzazione-tasso-conversione.html': 'blog-ottimizzazione-conversione',
    'ux-design-best-practice.html': 'blog-ux-design',
    'strategia-digitale-pmi.html': 'blog-strategia-digitale',
    'portare-attivita-online.html': 'blog-portare-attivita-online',
}

count = 0
for article_slug, img_basename in image_map.items():
    new_webp = f'../Img/blog/{img_basename}.webp'
    
    # Find ALL occurrences of this article (some may appear twice)
    search_start = 0
    while True:
        article_start = html.find(f'href="{article_slug}" class="blog-card-image"', search_start)
        if article_start == -1:
            break
        
        article_end = html.find('</article>', article_start)
        if article_end == -1:
            break
        
        block = html[article_start:article_end]
        
        # Replace ALL generic image patterns (both .webp and .png variants)
        new_block = block
        # Fix srcset
        new_block = re.sub(r'srcset="\.\.\/Img\/blog-cat-[^"]+\.(webp|png)"', f'srcset="{new_webp}"', new_block)
        # Fix src  
        new_block = re.sub(r'src="\.\.\/Img\/blog-cat-[^"]+\.(webp|png)"', f'src="{new_webp}"', new_block)
        
        if new_block != block:
            html = html[:article_start] + new_block + html[article_end:]
            count += 1
            print(f'FIXED: {article_slug} -> {new_webp}')
        
        search_start = article_start + len(new_block) + 20

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nTotal cards fixed: {count}')

# Verify: count remaining generic references
with open(html_path, 'r', encoding='utf-8') as f:
    html_check = f.read()

remaining = 0
for pat in ['blog-cat-web', 'blog-cat-seo', 'blog-cat-marketing', 'blog-cat-social']:
    c = html_check.count(pat)
    if c > 0:
        print(f'Remaining "{pat}": {c}')
        remaining += c

print(f'Total remaining generic refs: {remaining}')
