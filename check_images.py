"""Check current image references for specific articles and fix if needed."""
import re

html_path = r'C:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Check what images these articles are currently using
test_slugs = [
    'migrazione-sito-web-guida.html',
    'progressive-web-app-pmi.html',
    'checkout-ottimizzazione.html',
    'seo-ecommerce-guida.html',
    'come-scegliere-web-agency.html',
    'portare-attivita-online.html',
]

for slug in test_slugs:
    idx = html.find(f'href="{slug}" class="blog-card-image"')
    if idx >= 0:
        # Find srcset and src in the next 500 chars
        snippet = html[idx:idx+500]
        srcset_match = re.search(r'srcset="([^"]+)"', snippet)
        src_match = re.search(r'src="([^"]+)"', snippet)
        if srcset_match:
            print(f'{slug}')
            print(f'  srcset: {srcset_match.group(1)}')
        if src_match:
            print(f'  src:    {src_match.group(1)}')
        print()
    else:
        print(f'NOT FOUND: {slug}\n')

# Now look at how many still use generic images
generic_patterns = ['blog-cat-web', 'blog-cat-seo', 'blog-cat-marketing', 'blog-cat-social', 'blog-cat-case-study', 'blog-cat-ai']
generic_count = 0
for pat in generic_patterns:
    occurrences = html.count(pat)
    if occurrences > 0:
        print(f'Pattern "{pat}" found {occurrences} times')
        generic_count += occurrences

print(f'\nTotal generic image references: {generic_count}')
