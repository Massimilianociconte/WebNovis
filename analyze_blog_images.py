"""Analyze blog/index.html to find articles still using generic placeholder images."""
import re

html_path = r'C:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find all article cards: href + srcset
pattern = r'href="([^"]+\.html)" class="blog-card-image".*?srcset="([^"]+)"'
matches = re.findall(pattern, html, re.DOTALL)

generic_imgs = ['blog-cat-web.webp', 'blog-cat-seo.webp', 'blog-cat-marketing.webp', 
                'blog-cat-social.webp', 'blog-cat-case-study.webp', 'blog-cat-ai.webp']

# Also find the alt text for each article
alt_pattern = r'href="([^"]+\.html)" class="blog-card-image".*?alt="([^"]+)"'
alt_matches = dict(re.findall(alt_pattern, html, re.DOTALL))

print('=== ARTICLES STILL USING GENERIC PLACEHOLDER IMAGES ===\n')
count = 0
for href, img in matches:
    is_generic = any(g in img for g in generic_imgs)
    if is_generic:
        count += 1
        alt = alt_matches.get(href, 'N/A')
        print(f'{count}. SLUG: {href}')
        print(f'   IMG: {img}')
        print(f'   ALT: {alt}')
        print()

print(f'Total articles needing custom images: {count}')
print('\n' + '='*60)
print('\n=== ARTICLES WITH CUSTOM IMAGES (already done) ===\n')
count2 = 0
for href, img in matches:
    is_generic = any(g in img for g in generic_imgs)
    if not is_generic:
        count2 += 1
        print(f'{count2}. {href} -> {img}')

print(f'\nTotal with custom images: {count2}')
