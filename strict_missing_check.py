import re
import os
import glob

# 1. Parse index.html to find covers
with open('blog/index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()
    
# Extract all cards: <a href="SLUG" ... <img src="IMG" ...
cards = re.findall(r'<a[^>]*href=["\']([^"\']+\.html)["\'][^>]*class=["\']blog-card-image["\'][^>]*>.*?<img[^>]*src=["\']([^"\']+)["\'][^>]*>', idx_content, re.DOTALL | re.IGNORECASE)

if not cards:
    cards = re.findall(r'href=["\']([^"\']+\.html)["\'][^>]*class=["\']blog-card-image["\'][^>]*>.*?srcset=["\']([^"\']+)(?: [^"\']+)?["\']', idx_content, re.DOTALL | re.IGNORECASE)

missing_covers = {}

generic_keywords = ['placeholder', 'blog-cat-', 'og-image-social-graph', 'webnovis-logo']

def is_generic(img_path):
    for gk in generic_keywords:
        if gk in img_path: return True
    return False

for slug, img_src in cards:
    # clean img path
    img_path = img_src.split(',')[0].strip().split(' ')[0]
    actual_path = img_path.replace('../', '')
    
    if not os.path.exists(actual_path) or is_generic(actual_path):
        missing_covers[slug] = actual_path

# 2. Check the remaining 6 HTML files that are NOT in index.html
all_html = glob.glob('blog/*.html')
for f in all_html:
    if 'index.html' in f: continue
    slug = os.path.basename(f)
    if slug not in [s for s, _ in cards]:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        match_og = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', content)
        if match_og:
            img_url = match_og.group(1)
            path = img_url.split('webnovis.com/')[-1].lstrip('/')
            
            if not os.path.exists(path) or is_generic(path):
                missing_covers[slug] = path
        else:
            missing_covers[slug] = "NO_IMAGE_DEFINED"

print(f"Total definitely missing or generic: {len(missing_covers)}")
for k, v in missing_covers.items():
    print(f"{k} -> {v}")
