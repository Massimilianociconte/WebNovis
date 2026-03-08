import os
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

for slug in articles:
    filepath = f'blog/{slug}.html'
    if not os.path.exists(filepath):
        print(f'File not found: {filepath}')
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Replace og:image
    html = re.sub(r'<meta property="og:image" content="https://www\.webnovis\.com/Img/blog/blog-cat-[^\.]+\.(png|webp)">',
                  f'<meta property="og:image" content="https://www.webnovis.com/Img/blog/{slug}.png">', html)
    
    # Replace twitter:image
    html = re.sub(r'<meta property="twitter:image" content="https://www\.webnovis\.com/Img/blog/blog-cat-[^\.]+\.(png|webp)">',
                  f'<meta property="twitter:image" content="https://www.webnovis.com/Img/blog/{slug}.png">', html)
                  
    # Replace inside <picture> block inside body
    html = re.sub(r'Img/blog/blog-cat-[a-z-]+\.webp', f'Img/blog/{slug}.webp', html)
    html = re.sub(r'Img/blog/blog-cat-[a-z-]+\.png', f'Img/blog/{slug}.png', html)

    res_url = html.find(f'{slug}.webp')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print(f'Updated {filepath} correctly. Found webp occurrences: {res_url != -1}')
