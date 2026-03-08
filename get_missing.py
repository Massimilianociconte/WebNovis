import re
import json

with open('blog/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

articles = html.split('<article class="blog-card"')
missing = []

for text in articles[1:]:
    if 'blog-cat-' in text:
        href_match = re.search(r'href="([^"]+)"', text)
        slug = href_match.group(1) if href_match else 'Unknown'
        if slug.endswith('.html'):
            slug = slug[:-5]
            
        title_match = re.search(r'<h2 class="blog-card-title"><a[^>]*>(.*?)</a></h2>', text)
        title = title_match.group(1) if title_match else 'Unknown'
        
        excerpt_match = re.search(r'<p class="blog-card-excerpt">(.*?)</p>', text)
        excerpt = excerpt_match.group(1) if excerpt_match else 'Unknown'
        
        cat_match = re.search(r'data-category="([^"]+)"', text)
        cat = cat_match.group(1) if cat_match else 'Unknown'

        missing.append({
            'slug': slug,
            'title': title,
            'excerpt': excerpt,
            'category': cat
        })

with open('missing_articles.json', 'w', encoding='utf-8') as f:
    json.dump(missing, f, indent=4, ensure_ascii=False)

print(f"Saved {len(missing)} missing articles to missing_articles.json")
