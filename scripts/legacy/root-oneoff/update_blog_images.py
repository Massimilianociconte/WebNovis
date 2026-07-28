import re
import shutil
import os

# Source artifact dir where generated images are stored
SRC_DIR = r"C:\Users\Massi\.gemini\antigravity\brain\b4ebe127-a9d0-4ee3-ad46-0ee56a3befed"
# Destination for blog images
DEST_DIR = r"c:\Users\Massi\Documents\Webnovis_kiro - backup\Img\blog"
INDEX_HTML = r"c:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html"
MISSING_IMAGES_TXT = r"c:\Users\Massi\Documents\Webnovis_kiro - backup\missing_images_v2.txt"

os.makedirs(DEST_DIR, exist_ok=True)

# Step 1: Read slugs from missing_images_v2.txt
slugs = []
if os.path.exists(MISSING_IMAGES_TXT):
    with open(MISSING_IMAGES_TXT, "r", encoding="utf-8") as f:
        for line in f:
            if "|" in line:
                slug = line.split("|")[0].strip()
                if slug:
                    slugs.append(slug)

print(f"Found {len(slugs)} slugs in mapping file.")

# Step 2: Find and copy each generated image
copied = {}
for slug in slugs:
    prefix = slug.replace("-", "_")
    dest_name = f"blog-{slug}.png"
    dest_path = os.path.join(DEST_DIR, dest_name)
    
    # Find the most recent generated file with this prefix
    candidates = [
        f for f in os.listdir(SRC_DIR)
        if f.startswith(prefix + "_") and f.endswith(".png")
    ]
    if not candidates:
        print(f"  [MISSING SRC] {prefix}_*.png — skipping")
        continue
    
    # Pick the most recently modified one
    candidates.sort(key=lambda f: os.path.getmtime(os.path.join(SRC_DIR, f)), reverse=True)
    src_path = os.path.join(SRC_DIR, candidates[0])
    
    shutil.copy2(src_path, dest_path)
    copied[slug] = dest_name
    print(f"  [COPIED] {candidates[0]} -> Img/blog/{dest_name}")

print(f"\nCopied {len(copied)} images.\n")

if len(copied) == 0:
    print("No images to update in HTML.")
    exit(0)

# Step 3: Update blog/index.html
with open(INDEX_HTML, "r", encoding="utf-8") as f:
    html = f.read()

replacements_done = 0

for slug, dest_name in copied.items():
    web_path_png  = f"../Img/blog/{dest_name}"
    
    # Pattern to match the <picture> block and inner <source>/<img> tags
    # The image is wrapped in `<a href="slug.html" class="blog-card-image">`
    pattern = re.compile(
        r'(<a href="' + re.escape(slug) + r'\.html"[^>]*class="blog-card-image"[^>]*>)'
        r'(\s*<picture>\s*)'
        r'(?:<source[^>]*>\s*)?'
        r'<img([^>]*?)src="[^"]*"([^>]*?)>',
        re.DOTALL | re.IGNORECASE
    )
    
    def replacer(m):
        return (
            m.group(1) +
            m.group(2) +
            f'<source srcset="{web_path_png}" type="image/png">\n' +
            f'        <img{m.group(3)}src="{web_path_png}"{m.group(4)}>'
        )
    
    new_html, n = re.subn(pattern, replacer, html)
    if n > 0:
        html = new_html
        replacements_done += n
        print(f"  [UPDATED HTML] {slug} -> {web_path_png}")
    else:
        # Check if it was already updated or exists
        if f'src="{web_path_png}"' in html:
             print(f"  [ALREADY CUSTOM] {slug}")
        elif slug + ".html" in html:
            # Let's try to match ANY img tag inside that a block
            pattern2 = re.compile(
                r'(<a href="' + re.escape(slug) + r'\.html"[^>]*>.*?<img[^>]*?)src="[^"]*"([^>]*?>)',
                re.DOTALL | re.IGNORECASE
            )
            new_html2, n2 = re.subn(pattern2, r'\1src="' + web_path_png + r'"\2', html)
            if n2 > 0:
                 html = new_html2
                 replacements_done += n2
                 print(f"  [UPDATED HTML (simple)] {slug} -> {web_path_png}")
            else:
                 print(f"  [FAILED TO UPDATE] {slug} (pattern mismatch)")
        else:
            print(f"  [NOT FOUND in HTML] {slug}")

print(f"\nHTML replacements done: {replacements_done}")

# Step 4: Write updated HTML
with open(INDEX_HTML, "w", encoding="utf-8") as f:
    f.write(html)

print("blog/index.html updated successfully.")
