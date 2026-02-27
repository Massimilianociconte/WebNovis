"""Deep duplicate analysis - find ALL articles sharing the same image file."""
import re, sys
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

html_path = r'C:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r'href="([^"]+\.html)" class="blog-card-image".*?srcset="([^"]+)".*?alt="([^"]+)"'
matches = re.findall(pattern, html, re.DOTALL)

image_usage = defaultdict(list)
seen = set()
for href, img, alt in matches:
    if href not in seen:
        seen.add(href)
        image_usage[img].append((href, alt[:60]))

print(f"TOTAL UNIQUE ARTICLES: {len(seen)}")
print(f"TOTAL UNIQUE IMAGES: {len(image_usage)}\n")

# Find ALL duplicates
dups = {k: v for k, v in image_usage.items() if len(v) > 1}
if dups:
    print(f"=== DUPLICATE GROUPS ({len(dups)}) ===\n")
    total_needing_new = 0
    for img, articles in sorted(dups.items()):
        print(f"IMAGE: {img}")
        print(f"  USED BY {len(articles)} ARTICLES:")
        for href, alt in articles:
            print(f"    - {href}")
            print(f"      {alt}")
        # First article keeps the image, rest need new ones
        print(f"  -> {len(articles)-1} need new unique image(s)")
        total_needing_new += len(articles) - 1
        print()
    print(f"TOTAL ARTICLES NEEDING NEW IMAGES DUE TO DUPLICATES: {total_needing_new}")
else:
    print("NO DUPLICATES FOUND")
