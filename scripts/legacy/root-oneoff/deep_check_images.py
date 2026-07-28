import os
import re
import glob

blog_dir = 'blog'
img_dir = 'Img'
generic_patterns = [
    'blog-cat-', 'placeholder', 'default'
]

html_files = glob.glob(os.path.join(blog_dir, '*.html'))

missing_or_generic = []

# To avoid duplicates, keep track of slugs
checked_slugs = set()

for file_path in html_files:
    slug = os.path.basename(file_path)
    if slug == 'index.html': continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check og:image or hero image
    # Let's check <meta property="og:image" content="(.*?)">
    og_img_match = re.search(r'<meta property="og:image"\s+content="([^"]+)"', content)
    
    img_path = None
    if og_img_match:
        img_path = og_img_match.group(1)
        # extract just the path part if it's an absolute URL
        if 'webnovis.eu' in img_path:
            img_path = img_path.split('webnovis.eu/')[-1]
            img_path = img_path.lstrip('/')
    
    if not img_path:
        # Check hero image in article
        hero_match = re.search(r'<img[^>]+class="[^"]*hero-image[^"]*"[^>]+src="([^"]+)"', content)
        if hero_match:
            img_path = hero_match.group(1).lstrip('../').lstrip('/')
            
    if not img_path:
        # fallback: find first image in blog-article class or something
        img_match = re.search(r'<img[^>]+src="([^"]+Img/blog/[^"]+)"', content)
        if img_match:
            img_path = img_match.group(1).lstrip('../').lstrip('/')
            
    if img_path:
        actual_path = img_path
        # if path starts with Img/blog/ it's fine
        if not os.path.exists(actual_path):
            missing_or_generic.append({'slug': slug, 'img': actual_path, 'reason': 'Missing on disk'})
        elif any(g in actual_path for g in generic_patterns):
            missing_or_generic.append({'slug': slug, 'img': actual_path, 'reason': 'Generic pattern'})
    else:
        missing_or_generic.append({'slug': slug, 'img': 'None', 'reason': 'No image found'})

print(f"Total articles scanned: {len(html_files) - 1}")
print(f"Total articles needing images: {len(missing_or_generic)}")
for item in missing_or_generic:
    print(f"{item['slug']} -> {item['img']} ({item['reason']})")
