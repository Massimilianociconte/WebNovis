import re
import os

INDEX_HTML = r"c:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html"

# The 3 slugs still using placeholder
REMAINING = [
    "kpi-advertising-online",
    "campagne-locali-google-ads",
    "infografiche-come-crearle",
]

with open(INDEX_HTML, "r", encoding="utf-8") as f:
    html = f.read()

for slug in REMAINING:
    web_path_png = f"../Img/blog/blog-{slug}.png"
    
    # Check if already updated
    if web_path_png in html:
        print(f"  [ALREADY UPDATED] {slug}")
        continue
    
    # More flexible pattern: find <a ...href="SLUG.html"... class="blog-card-image"...>
    # OR <a class="blog-card-image"...href="SLUG.html"...>
    pattern = re.compile(
        r'(<a\b[^>]*\bhref="' + re.escape(slug) + r'\.html"[^>]*>)'
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
        print(f"  [FIXED] {slug}")
    else:
        # Fallback: directly replace the placeholder paths in the vicinity of this slug
        # Find the card block for this slug and replace placeholder paths
        card_start = html.find(f'href="{slug}.html"')
        if card_start == -1:
            card_start = html.find(f'{slug}.html')
        if card_start == -1:
            print(f"  [NOT FOUND] {slug}")
            continue
        
        # Get surrounding context (the whole card ~600 chars)
        block_start = max(0, card_start - 200)
        block_end = min(len(html), card_start + 800)
        block = html[block_start:block_end]
        
        print(f"  [DEBUG] Context for {slug}:")
        print(repr(block[:500]))
        
        # Replace placeholder src patterns in the block
        new_block = re.sub(
            r'srcset="\.\.\/Img\/blog-cat-[^"]+\.webp"',
            f'srcset="{web_path_png}"',
            block
        )
        new_block = re.sub(
            r'src="\.\.\/Img\/blog-cat-[^"]+\.png"',
            f'src="{web_path_png}"',
            new_block
        )
        
        if new_block != block:
            html = html[:block_start] + new_block + html[block_end:]
            print(f"  [FALLBACK FIXED] {slug}")
        else:
            print(f"  [FALLBACK FAILED] {slug}")

with open(INDEX_HTML, "w", encoding="utf-8") as f:
    f.write(html)

# Final verification
with open(INDEX_HTML, "r", encoding="utf-8") as f:
    html_check = f.read()

all_slugs = ['kpi-advertising-online','campagne-locali-google-ads','creative-fatigue-ads','blog-aziendale-perche','content-calendar-guida','pillar-page-strategia','video-marketing-pmi','storytelling-marketing-guida','content-repurposing','podcast-aziendale-guida','social-proof-sito-web','pagina-prezzi-ottimizzazione','copywriting-persuasivo-web','lead-magnet-guida','heatmap-analisi-comportamento','exit-intent-popup','trust-signals-ecommerce','thank-you-page-ottimizzazione','brand-positioning-strategia','brand-storytelling','infografiche-come-crearle','presentazioni-aziendali-design','motion-design-marketing','teoria-colore-design-web','design-thinking-business','biglietti-visita-design','linkedin-personal-branding','sito-personale-freelancer','portfolio-digitale-guida','thought-leadership-strategia','social-media-crisis-management','user-generated-content','social-commerce-guida','influencer-marketing-pmi','social-media-automation-tool','tendenze-social-media-2026','instagram-reels-strategia','instagram-stories-business','instagram-hashtag-strategia','instagram-bio-ottimizzazione','instagram-carousel-guida','instagram-algoritmo-2026','instagram-shop-guida','instagram-insights-guida','instagram-content-strategy','instagram-collaborazioni-brand','budget-advertising-online','landing-page-ads','copywriting-ads-tecniche']

ok = sum(1 for s in all_slugs if f'../Img/blog/blog-{s}.png' in html_check)
missing = [s for s in all_slugs if f'../Img/blog/blog-{s}.png' not in html_check]
print(f"\nFinal: {ok}/{len(all_slugs)} updated")
if missing:
    print("Still missing:", missing)
