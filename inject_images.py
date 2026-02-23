import re

html_file = r"C:\Users\Massi\Documents\Webnovis_kiro - backup\blog\index.html"
with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add CSS
css_to_add = """
.blog-card-image{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.05);display:block}
.blog-card-image img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease;display:block}
.blog-card:hover .blog-card-image img{transform:scale(1.05)}
"""
if ".blog-card-image{" not in html:
    html = html.replace("</style>", css_to_add + "\n</style>", 1)

# Mapping configurations
cat_images = {
    "web": "../Img/blog-cat-web.webp",
    "seo": "../Img/blog-cat-seo.webp",
    "social": "../Img/blog-cat-social.webp",
    "marketing": "../Img/blog-cat-marketing.webp",
    "case-study": "../Img/blog-cat-case-study.webp",
    "ai": "../Img/blog-cat-ai.webp",
    "design": "../Img/rho-web-design-studio.webp"
}

tag_names = {
    "web": "Siti Web",
    "seo": "SEO & Performance",
    "social": "Social Media",
    "marketing": "Digital Marketing",
    "case-study": "Case Study Locali",
    "ai": "AI & Health",
    "design": "Design"
}

# The block processing logic:
cards = []
for match in re.finditer(r'<article class="blog-card"[^>]*>(.*?)</article>', html, flags=re.DOTALL):
    cards.append((match.start(), match.end(), match.group(0)))

new_html = ""
last_end = 0

for i, (start, end, card_content) in enumerate(cards):
    new_html += html[last_end:start]
    
    # Find category
    cat_match = re.search(r'data-category="([^"]+)"', card_content)
    cat = cat_match.group(1) if cat_match else "web"
    
    img_src = cat_images.get(cat, "../Img/blog-cat-web.webp")
    
    # Try to find title
    title_match = re.search(r'<h[23][^>]*>(.*?)</h[23]>', card_content, flags=re.DOTALL)
    alt_text = "Articolo Blog"
    if title_match:
        inner_html = title_match.group(1)
        alt_text = re.sub(r'<[^>]+>', '', inner_html).strip().replace('"', '&quot;')
        
    if i < 3:
        loading = "eager"
        fetchpriority = "high"
    else:
        loading = "lazy"
        fetchpriority = "auto"

    href_match = re.search(r'href="([^"]+)"', card_content)
    href = href_match.group(1) if href_match else "#"
    
    img_html = f'''
  <a href="{href}" class="blog-card-image" style="display:block" tabindex="-1" aria-hidden="true">
    <picture>
      <source srcset="{img_src}" type="image/webp">
      <img src="{img_src.replace('.webp', '.png')}" alt="{alt_text}" loading="{loading}" fetchpriority="{fetchpriority}" width="800" height="450">
    </picture>
  </a>
'''
    
    # Strip existing blog-card-image completely safely
    article_open = re.search(r'<article[^>]*>', card_content).group(0)
    body_idx = card_content.find('<div class="blog-card-body"')
    
    if body_idx != -1:
        stripped_card = article_open + img_html + card_content[body_idx:]
    else:
        stripped_card = card_content
        
    # Add <span class="blog-card-tag"> if missing
    if '<span class="blog-card-tag"' not in stripped_card:
        tag_text = tag_names.get(cat, "Blog")
        tag_html = f'\n    <span class="blog-card-tag">{tag_text}</span>'
        stripped_card = stripped_card.replace('<div class="blog-card-body">', f'<div class="blog-card-body">{tag_html}')
        
    # Remove any stray <div class="blog-card-category">
    stripped_card = re.sub(r'<div class="blog-card-category">.*?</div>', '', stripped_card, flags=re.DOTALL)
    
    new_html += stripped_card
    last_end = end
    
new_html += html[last_end:]

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("HTML injection completed successfully.")
