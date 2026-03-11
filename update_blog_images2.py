import re
import shutil
import os

SRC_DIR = r"C:\Users\Massi\.gemini\antigravity\brain\96161af9-a01f-428f-b975-940b32e1a9bb"
DEST_DIR = r"c:\Users\Massi\Documents\Webnovis_kiro - backup\Img\blog"
INDEX_HTML = r"c:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html"

# Only the new batch of 17 (linkedin-ads-b2b skipped — hit rate limit)
SLUG_TO_SOURCE = {
    "social-commerce-guida":          "social_commerce_guida",
    "influencer-marketing-pmi":       "influencer_marketing_pmi",
    "social-media-automation-tool":   "social_media_automation_tool",
    "tendenze-social-media-2026":     "tendenze_social_media_2026",
    "instagram-reels-strategia":      "instagram_reels_strategia",
    "instagram-stories-business":     "instagram_stories_business",
    "instagram-hashtag-strategia":    "instagram_hashtag_strategia",
    "instagram-bio-ottimizzazione":   "instagram_bio_ottimizzazione",
    "instagram-carousel-guida":       "instagram_carousel_guida",
    "instagram-algoritmo-2026":       "instagram_algoritmo_2026",
    "instagram-shop-guida":           "instagram_shop_guida",
    "instagram-insights-guida":       "instagram_insights_guida",
    "instagram-content-strategy":     "instagram_content_strategy",
    "instagram-collaborazioni-brand": "instagram_collaborazioni_brand",
    "budget-advertising-online":      "budget_advertising_online",
    "landing-page-ads":               "landing_page_ads",
    "copywriting-ads-tecniche":       "copywriting_ads_tecniche",
}

os.makedirs(DEST_DIR, exist_ok=True)

copied = {}
for slug, prefix in SLUG_TO_SOURCE.items():
    dest_name = f"blog-{slug}.png"
    dest_path = os.path.join(DEST_DIR, dest_name)

    candidates = [
        f for f in os.listdir(SRC_DIR)
        if f.startswith(prefix + "_") and f.endswith(".png")
    ]
    if not candidates:
        print(f"  [MISSING SRC] {prefix}_*.png — skipping")
        continue

    candidates.sort(key=lambda f: os.path.getmtime(os.path.join(SRC_DIR, f)), reverse=True)
    src_path = os.path.join(SRC_DIR, candidates[0])
    shutil.copy2(src_path, dest_path)
    copied[slug] = dest_name
    print(f"  [COPIED] {candidates[0]} -> Img/blog/{dest_name}")

print(f"\nCopied {len(copied)} images.\n")

# Update blog/index.html
with open(INDEX_HTML, "r", encoding="utf-8") as f:
    html = f.read()

replacements_done = 0
for slug, dest_name in copied.items():
    web_path_png = f"../Img/blog/{dest_name}"

    pattern = re.compile(
        r'(<a href="' + re.escape(slug) + r'\.html"[^>]*class="blog-card-image"[^>]*>)'
        r'(\s*<picture>\s*)'
        r'<source srcset="(?!\.\./Img/blog/)([^"]+)" type="image/webp">'
        r'(\s*)'
        r'<img ([^>]*?)src="(?!\.\./Img/blog/)([^"]+)"([^>]*?)>',
        re.DOTALL
    )

    def replacer(m):
        return (
            m.group(1) +
            m.group(2) +
            f'<source srcset="{web_path_png}" type="image/png">' +
            m.group(4) +
            f'<img {m.group(5)}src="{web_path_png}"{m.group(7)}>'
        )

    new_html, n = re.subn(pattern, replacer, html)
    if n > 0:
        html = new_html
        replacements_done += n
        print(f"  [UPDATED HTML] {slug} -> {web_path_png}")
    else:
        if slug + ".html" in html:
            print(f"  [SKIPPED / already custom?] {slug}")
        else:
            print(f"  [NOT FOUND in HTML] {slug}")

print(f"\nHTML replacements done: {replacements_done}")

with open(INDEX_HTML, "w", encoding="utf-8") as f:
    f.write(html)

print("blog/index.html updated successfully.")

# Final verification
with open(INDEX_HTML, "r", encoding="utf-8") as f:
    html_check = f.read()

ok = sum(1 for slug in SLUG_TO_SOURCE if f"../Img/blog/blog-{slug}.png" in html_check)
print(f"\nVerification: {ok}/{len(SLUG_TO_SOURCE)} slugs updated in HTML")
