import glob
import re
import os

blog_files = glob.glob('blog/*.html')
blog_files = [f for f in blog_files if 'index.html' not in f]

missing_or_generic = []

for f in blog_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    slug = os.path.basename(f)
    
    # Try to find the og:image
    match = re.search(r'<meta property="og:image" content="(.*?)"', content)
    img_path = None
    if match:
        img_url = match.group(1)
        if 'webnovis.eu/' in img_url:
            img_path = img_url.split('webnovis.eu/')[-1]
            if img_path.startswith('/'):
                img_path = img_path[1:]
        elif img_url.startswith('../'):
            img_path = img_url.replace('../', '')
        elif img_url.startswith('/'):
            img_path = img_url[1:]
        else:
            img_path = img_url
            
    if img_path:
        actual_path = img_path
        if not os.path.exists(actual_path):
            missing_or_generic.append((slug, actual_path, 'Missing on disk'))
        elif 'placeholder' in actual_path or 'cat-web' in actual_path or 'cat-seo' in actual_path or 'cat-social' in actual_path or 'cat-marketing' in actual_path:
            missing_or_generic.append((slug, actual_path, 'Generic image'))
    else:
        missing_or_generic.append((slug, 'None', 'No og:image found'))

print(f"Total checked: {len(blog_files)}")
print(f"Total missing or generic/og:image: {len(missing_or_generic)}")
for item in missing_or_generic:
    print(f"{item[0]} -> {item[1]} ({item[2]})")
