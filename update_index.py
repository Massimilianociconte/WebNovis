import re

articles = [
    'seo-blog-aziendale',
    'aggiornamenti-algoritmo-google-2026',
    'seo-youtube-video',
    'headless-cms-guida',
    'cloud-hosting-vs-tradizionale',
    'cyber-security-pmi',
    'gdpr-sito-web-conformita'
]

with open('blog/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

for slug in articles:
    # Need to match the article tag for this specific slug
    pattern = r'<article class="blog-card".*?href="' + re.escape(slug) + r'\.html".*?</article>'
    match = re.search(pattern, html, re.DOTALL)
    
    if match:
        block = match.group(0)
        # replace the generic names with the new slug
        new_block = re.sub(r'blog-cat-[a-z-]+', slug, block)
        html = html.replace(block, new_block)
        print(f'Updated index.html for {slug}')
    else:
        print(f'Match not found for {slug}')

with open('blog/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
