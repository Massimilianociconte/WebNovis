import re

with open('blog/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = re.finditer(r'<article class="blog-card".*?<a href="([^"]+)".*?<picture>.*?<img src="\.\./Img/blog/([^"]+)".*?<h3 class="blog-card-title"><a[^>]*>(.*?)</a>', html, re.DOTALL)

for m in matches:
    slug = m.group(1)
    img = m.group(2)
    title = m.group(3)
    if 'blog-cat-' in img:
        print(f"{slug} | {title.strip()}")
