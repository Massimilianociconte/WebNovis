import re
import shutil
import os

# Source artifact dir where generated images are stored
SRC_DIR = r"C:\Users\Massi\.gemini\antigravity\brain\96161af9-a01f-428f-b975-940b32e1a9bb"
# Destination for blog images
DEST_DIR = r"c:\Users\Massi\Documents\Webnovis_kiro - backup\Img\blog"
INDEX_HTML = r"c:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html"

# Map: slug -> (source filename prefix, dest filename)
# Format: "slug": "source_prefix_in_artifacts"
SLUG_TO_SOURCE = {
    "kpi-advertising-online":          "kpi_advertising_online",
    "campagne-locali-google-ads":      "campagne_locali_google_ads",
    "creative-fatigue-ads":            "creative_fatigue_ads",
    "blog-aziendale-perche":           "blog_aziendale_perche",
    "content-calendar-guida":          "content_calendar_guida",
    "pillar-page-strategia":           "pillar_page_strategia",
    "video-marketing-pmi":             "video_marketing_pmi",
    "storytelling-marketing-guida":    "storytelling_marketing_guida",
    "content-repurposing":             "content_repurposing",
    "podcast-aziendale-guida":         "podcast_aziendale_guida",
    "social-proof-sito-web":           "social_proof_sito_web",
    "pagina-prezzi-ottimizzazione":    "pagina_prezzi_ottimizzazione",
    "copywriting-persuasivo-web":      "copywriting_persuasivo_web",
    "lead-magnet-guida":               "lead_magnet_guida",
    "heatmap-analisi-comportamento":   "heatmap_analisi_comportamento",
    "exit-intent-popup":               "exit_intent_popup",
    "trust-signals-ecommerce":         "trust_signals_ecommerce",
    "thank-you-page-ottimizzazione":   "thank_you_page_ottimizzazione",
    "brand-positioning-strategia":     "brand_positioning_strategia",
    "brand-storytelling":              "brand_storytelling",
    "infografiche-come-crearle":       "infografiche_come_crearle",
    "presentazioni-aziendali-design":  "presentazioni_aziendali_design",
    "motion-design-marketing":         "motion_design_marketing",
    "teoria-colore-design-web":        "teoria_colore_design_web",
    "design-thinking-business":        "design_thinking_business",
    "biglietti-visita-design":         "biglietti_visita_design",
    "linkedin-personal-branding":      "linkedin_personal_branding",
    "sito-personale-freelancer":       "sito_personale_freelancer",
    "portfolio-digitale-guida":        "portfolio_digitale_guida",
    "thought-leadership-strategia":    "thought_leadership_strategia",
    "social-media-crisis-management":  "social_media_crisis_management",
    "user-generated-content":          "user_generated_content",
}

os.makedirs(DEST_DIR, exist_ok=True)

# Step 1: Find and copy each generated image
copied = {}
for slug, prefix in SLUG_TO_SOURCE.items():
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

# Step 2: Update blog/index.html
with open(INDEX_HTML, "r", encoding="utf-8") as f:
    html = f.read()

replacements_done = 0

for slug, dest_name in copied.items():
    web_path_png  = f"../Img/blog/{dest_name}"
    # We will replace the entire <picture> block for this article.
    # Pattern: find the <a href="SLUG"> block and replace the <source>/<img> inside it.
    # The placeholder follows the pattern: blog-cat-CATEGORY.webp / .png
    
    # Build the new picture block
    new_source = f'<source srcset="{web_path_png}" type="image/png">'
    new_img    = f'<img alt="{slug}" height="450" src="{web_path_png}" width="800" loading="lazy" fetchpriority="auto">'
    
    # We target the <picture> block inside the <a href="SLUG.html"> card link.
    # Strategy: replace the pair of source+img lines for this specific card.
    # The block looks like:
    #   <a href="SLUG.html" class="blog-card-image" ...>
    #       <picture>
    #           <source srcset="...blog-cat-CATEGORY.webp" type="image/webp">
    #           <img alt="..." ... src="...blog-cat-CATEGORY.png" ...>
    #       </picture>
    #   </a>
    
    # We'll use a regex that captures the source+img inside the picture block
    # right after the href for this slug, replacing only the placeholder paths
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
        # Maybe already using a custom image or pattern mismatch — try simpler approach
        # Check if the card even exists (it might already have been updated)
        if slug + ".html" in html:
            print(f"  [SKIPPED / already custom?] {slug}")
        else:
            print(f"  [NOT FOUND in HTML] {slug}")

print(f"\nHTML replacements done: {replacements_done}")

# Step 3: Write updated HTML
with open(INDEX_HTML, "w", encoding="utf-8") as f:
    f.write(html)

print("blog/index.html updated successfully.")
