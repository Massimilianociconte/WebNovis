import re, os

with open('blog/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find ALL source srcset references
sources = re.findall(r'<source srcset="([^"]+\.webp)"', content)
print(f"Total <source> webp references: {len(sources)}")

missing = []
for src in sources:
    path = src.replace('../', '')
    if not os.path.exists(path):
        missing.append(path)

print(f"Missing webp files: {len(missing)}")
for m in missing:
    print(f"  ❌ {m}")

# Also check: how many of those have a corresponding .png
print(f"\nCorresponding .png status:")
for m in missing:
    png_path = m.replace('.webp', '.png')
    exists = os.path.exists(png_path)
    print(f"  {'✅' if exists else '❌'} {png_path}")
