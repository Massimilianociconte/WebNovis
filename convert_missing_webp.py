import subprocess, os, re

with open('blog/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all <source srcset="...webp"> references
sources = re.findall(r'<source srcset="([^"]+\.webp)"', content)

converted = 0
skipped = 0
failed = 0

for src in sources:
    webp_path = src.replace('../', '')
    if os.path.exists(webp_path):
        skipped += 1
        continue
    
    # Find corresponding PNG
    png_path = webp_path.replace('.webp', '.png')
    if not os.path.exists(png_path):
        # Try jpg
        jpg_path = webp_path.replace('.webp', '.jpg')
        jpeg_path = webp_path.replace('.webp', '.jpeg')
        if os.path.exists(jpg_path):
            png_path = jpg_path
        elif os.path.exists(jpeg_path):
            png_path = jpeg_path
        else:
            print(f"❌ NO SOURCE: {webp_path} (no png/jpg found)")
            failed += 1
            continue
    
    # Convert using sips
    try:
        result = subprocess.run(
            ['sips', '-s', 'format', 'webp', '-s', 'formatOptions', '85', png_path, '--out', webp_path],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0 and os.path.exists(webp_path):
            png_size = os.path.getsize(png_path) / 1024
            webp_size = os.path.getsize(webp_path) / 1024
            savings = (1 - webp_size/png_size) * 100 if png_size > 0 else 0
            print(f"✅ {webp_path} ({png_size:.0f}KB → {webp_size:.0f}KB, -{savings:.0f}%)")
            converted += 1
        else:
            print(f"❌ SIPS ERROR: {webp_path}: {result.stderr.strip()}")
            failed += 1
    except Exception as e:
        print(f"❌ EXCEPTION: {webp_path}: {e}")
        failed += 1

print(f"\nDone: {converted} converted, {skipped} already existed, {failed} failed")
