import re

with open('blog/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the full card block for seo-blog-aziendale
slugs = ["seo-blog-aziendale.html", "aggiornamenti-algoritmo-google-2026.html", "come-scegliere-web-agency.html", "lead-magnet-guida.html", "bounce-rate-ridurre.html"]

for slug in slugs:
    # Find the blog-card containing this slug
    # Cards likely have structure: <div class="blog-card" ...> ... <a href="slug" ...> ... <img ...> ... </div>
    pattern = rf'(<div[^>]*class="blog-card"[^>]*>[\s\S]*?href="{re.escape(slug)}"[\s\S]*?</div>\s*</div>)'
    match = re.search(pattern, content)
    if match:
        card = match.group(1)
        # Extract just the image-related part
        img_matches = re.findall(r'<(?:img|source|picture)[^>]*(?:src|srcset)="[^"]*"[^>]*>', card)
        print(f"=== {slug} ===")
        for im in img_matches:
            print(f"  {im}")
        print()
    else:
        print(f"=== {slug} === CARD NOT FOUND")
        # Try simpler match
        pattern2 = rf'href="{re.escape(slug)}"'
        matches2 = list(re.finditer(pattern2, content))
        print(f"  Found {len(matches2)} href references")
        # Get surrounding context
        for m in matches2[:1]:
            start = max(0, m.start() - 500)
            end = min(len(content), m.end() + 500)
            context = content[start:end]
            # Find img/source tags in context
            imgs = re.findall(r'<(?:img|source)[^>]*(?:src|srcset)="[^"]*"[^>]*>', context)
            for im in imgs:
                print(f"  {im}")
        print()
