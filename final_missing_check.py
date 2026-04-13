import os
import glob
import re

blog_files = glob.glob('blog/*.html')
blog_files = [f for f in blog_files if 'index.html' not in os.path.basename(f)]

generic_imgs = ['og-image-social-graph.jpeg', 'webnovis-logo-bianco.png', 'webnovis-logo-bianco-300.png', 'favicon', 'placeholder', 'blog-cat-']

def is_generic(path):
    for g in generic_imgs:
        if g in path:
            return True
    return False

missing_or_generic = []

for f in blog_files:
    slug = os.path.basename(f)
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Try to find og:image
    match_og = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', content)
    match_tw = re.search(r'<meta[^>]+property="twitter:image"[^>]+content="([^"]+)"', content)
    
    img_urls = []
    if match_og: img_urls.append(match_og.group(1))
    if match_tw: img_urls.append(match_tw.group(1))
    
    valid_custom_found = False
    
    for url in img_urls:
        if 'webnovis.eu/' in url:
            path = url.split('webnovis.eu/')[-1].lstrip('/')
        elif 'webnovis.com/' in url:
            path = url.split('webnovis.com/')[-1].lstrip('/')
        else:
            path = url.replace('../', '').lstrip('/')
        
        if is_generic(path):
            continue
            
        if os.path.exists(path):
            valid_custom_found = True
            break
            
    if not valid_custom_found:
        missing_or_generic.append(slug)

# Also cross reference with index.html missing links
with open('blog/index.html', 'r', encoding='utf-8') as file:
    index_content = file.read()

index_cards = re.findall(r'<a[^>]*href=["\']([^"\']+\.html)["\'][^>]*class=["\']blog-card-image["\'][^>]*>.*?<img[^>]*src=["\']([^"\']+)["\'][^>]*>', index_content, re.DOTALL | re.IGNORECASE)

if not index_cards:
    index_cards = re.findall(r'href=["\']([^"\']+\.html)["\'][^>]*class=["\']blog-card-image["\'][^>]*>.*?srcset=["\']([^"\']+)(?: [^"\']+)?["\']', index_content, re.DOTALL | re.IGNORECASE)

missing_in_index = []
for slug, img_src in index_cards:
    img_path = img_src.split(',')[0].strip().split(' ')[0]
    actual_path = img_path.replace('../', '')
    if not os.path.exists(actual_path) or is_generic(actual_path):
        missing_in_index.append(slug)

final_missing_set = set(missing_or_generic + missing_in_index)

print(f"Total articles: {len(blog_files)}")
print(f"Total missing/generic: {len(final_missing_set)}")
for item in sorted(final_missing_set):
    print(item)
