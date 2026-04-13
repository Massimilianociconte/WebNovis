import re
import os

html_path = 'blog/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find all article cards: href + img src/srcset
pattern = r'<a[^>]*href=["\']([^"\']+\.html)["\'][^>]*class=["\']blog-card-image["\'][^>]*>.*?<img[^>]*src=["\']([^"\']+)["\'][^>]*>'
matches = re.findall(pattern, html, re.DOTALL | re.IGNORECASE)

if not matches:
    # try another pattern
    pattern = r'href=["\']([^"\']+\.html)["\'][^>]*class=["\']blog-card-image["\'][^>]*>.*?srcset=["\']([^"\']+)(?: [^"\']+)?["\']'
    matches = re.findall(pattern, html, re.DOTALL | re.IGNORECASE)

missing = []
for href, img_src in matches:
    # clean up img_src
    img_path = img_src.split(',')[0].strip().split(' ')[0]
    
    # img_path might be like '../Img/blog/something.png'
    # relative to 'blog/index.html', its actual path is 'Img/blog/something.png'
    # since we are running in root, it is exactly img_path with '../' replaced
    actual_path = img_path.replace('../', '')
    
    if not os.path.exists(actual_path):
        missing.append((href, img_path))

print(f"Total articles found: {len(matches)}")
print(f"Total images missing on disk: {len(missing)}")
for slug, img in missing:
    print(f"{slug} -> {img}")

