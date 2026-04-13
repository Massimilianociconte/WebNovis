with open('blog/index.html', 'r', encoding='utf-8') as f:
    content = f.read()
import re
match = re.search(r'(<a[^>]+href="aggiornamenti-algoritmo-google-2026\.html"[^>]*>[\s\S]*?</a\s*>)', content, re.IGNORECASE)
if match:
    img_match = re.search(r'<img[^>]+>', match.group(1), re.IGNORECASE)
    if img_match:
        print(img_match.group(0))
