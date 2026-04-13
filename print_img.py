with open('blog/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Find the card block for seo-blog-aziendale.html
match = re.search(r'(<a[^>]+href="seo-blog-aziendale\.html"[^>]*>[\s\S]*?</a\s*>)', content, re.IGNORECASE)
if match:
    # Print the img tag inside the card
    img_match = re.search(r'<img[^>]+>', match.group(1), re.IGNORECASE)
    if img_match:
        print(img_match.group(0))
