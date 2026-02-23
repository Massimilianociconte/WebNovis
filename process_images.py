import os
import glob
try:
    from PIL import Image
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

src_dir = r"C:\Users\Massi\.gemini\antigravity\brain\71bac73a-6090-4345-9c1b-0623c81204a6"
dest_dir = r"C:\Users\Massi\Documents\Webnovis_kiro - backup\Img"

mapping = {
    "cat_web": "blog-cat-web.webp",
    "cat_seo": "blog-cat-seo.webp",
    "cat_social": "blog-cat-social.webp",
    "cat_marketing": "blog-cat-marketing.webp",
    "cat_case_study": "blog-cat-case-study.webp",
    "cat_ai": "blog-cat-ai.webp"
}

for prefix, out_name in mapping.items():
    # Find the generated png
    files = glob.glob(os.path.join(src_dir, f"{prefix}_*.png"))
    if not files:
        print(f"File not found for {prefix}")
        continue
    file_path = files[0] # Take the first match
    
    img = Image.open(file_path)
    # Resize to 800x450, using LANCZOS for high quality
    img = img.resize((800, 450), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(dest_dir, out_name)
    img.save(out_path, "WEBP", quality=80)
    img.save(out_path.replace(".webp", ".png"), "PNG")
    print(f"Saved {out_path} and its PNG fallback")
