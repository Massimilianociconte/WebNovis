"""Copy new blog images to Img/blog (native dimensions) and update blog/index.html."""
import shutil
import os
import re

try:
    from PIL import Image
except ImportError:
    pass

src_dir = r'C:\Users\Massi\.gemini\antigravity\brain\95f5929e-cf2b-4f99-85d3-754a01829f5c'
dest_dir = r'C:\Users\Massi\Documents\Webnovis_kiro - backup\Img\blog'
html_path = r'C:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html'

# Map: (src_prefix, dest_basename, article_slug)
mapping = [
    ('blog_migrazione_sito', 'blog-migrazione-sito-web', 'migrazione-sito-web-guida.html'),
    ('blog_pwa', 'blog-progressive-web-app', 'progressive-web-app-pmi.html'),
    ('blog_checkout', 'blog-checkout-ottimizzazione', 'checkout-ottimizzazione.html'),
    ('blog_seo_ecommerce', 'blog-seo-ecommerce', 'seo-ecommerce-guida.html'),
    ('blog_ecommerce_b2b', 'blog-ecommerce-b2b', 'ecommerce-b2b-guida.html'),
    ('blog_gestione_resi', 'blog-gestione-resi', 'gestione-resi-ecommerce.html'),
    ('blog_foto_prodotto', 'blog-fotografia-prodotto', 'fotografia-prodotto-ecommerce.html'),
    ('blog_marketplace_vs', 'blog-marketplace-vs-ecommerce', 'marketplace-vs-ecommerce-proprio.html'),
    ('blog_email_ecommerce', 'blog-email-marketing-ecommerce', 'email-marketing-ecommerce.html'),
    ('blog_pagamenti_online', 'blog-pagamenti-online', 'pagamenti-online-ecommerce.html'),
    ('blog_scegliere_agency', 'blog-scegliere-web-agency', 'come-scegliere-web-agency.html'),
    ('blog_seo_piccole', 'blog-seo-piccole-imprese', 'seo-per-piccole-imprese.html'),
    ('blog_cro', 'blog-ottimizzazione-conversione', 'ottimizzazione-tasso-conversione.html'),
    ('blog_ux_design', 'blog-ux-design', 'ux-design-best-practice.html'),
    ('blog_strategia_digitale', 'blog-strategia-digitale', 'strategia-digitale-pmi.html'),
    ('blog_portare_online', 'blog-portare-attivita-online', 'portare-attivita-online.html'),
]

# Step 1: Copy images (native dimensions, just convert to WebP)
print("=== STEP 1: Copying and converting images ===\n")
for src_prefix, dest_name, _ in mapping:
    # Find the source PNG
    src_file = None
    for f in os.listdir(src_dir):
        if f.startswith(src_prefix + '_') and f.endswith('.png'):
            src_file = os.path.join(src_dir, f)
            break
    if not src_file:
        for f in os.listdir(src_dir):
            if f.startswith(src_prefix) and f.endswith('.png'):
                src_file = os.path.join(src_dir, f)
                break
    if not src_file:
        print(f'NOT FOUND: {src_prefix}')
        continue

    img = Image.open(src_file)
    w, h = img.size

    # Save WebP at native size
    webp_path = os.path.join(dest_dir, dest_name + '.webp')
    img.save(webp_path, 'WEBP', quality=82)

    # Also save PNG fallback at native size
    png_path = os.path.join(dest_dir, dest_name + '.png')
    img.save(png_path, 'PNG')

    print(f'OK: {src_prefix} -> {dest_name}.webp ({w}x{h}, {os.path.getsize(webp_path)//1024}KB)')

# Step 2: Update blog/index.html
print("\n=== STEP 2: Updating blog/index.html ===\n")
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

count = 0
for _, dest_name, article_slug in mapping:
    new_img = f'../Img/blog/{dest_name}.webp'

    # Find the card with this article slug
    article_start = html.find(f'href="{article_slug}" class="blog-card-image"')
    if article_start == -1:
        print(f'NOT FOUND in HTML: {article_slug}')
        continue

    article_end = html.find('</article>', article_start)
    if article_end == -1:
        continue

    block = html[article_start:article_end]

    # Replace any blog-cat-*.webp with new image
    new_block = re.sub(r'src="\.\.\/Img\/blog-cat-[^"]+\.webp"', f'src="{new_img}"', block)
    new_block = re.sub(r'srcset="\.\.\/Img\/blog-cat-[^"]+\.webp"', f'srcset="{new_img}"', new_block)

    if new_block != block:
        html = html[:article_start] + new_block + html[article_end:]
        count += 1
        print(f'OK: {article_slug} -> {new_img}')
    else:
        print(f'NO CHANGE: {article_slug}')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nTotal HTML updates: {count}')
print(f'Total images copied: {len(mapping)}')
