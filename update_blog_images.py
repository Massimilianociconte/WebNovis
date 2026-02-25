"""
Script to update blog/index.html with correct cover images for each article card.
Maps each article slug to a unique image or the correct category fallback.
"""
import re

# Read the file
with open('blog/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define mapping: article slug -> image path (relative to blog/index.html)
# Priority 1: Unique AI-generated images (17 new + 6 existing category assigned to best match)
# Priority 2: Correct category fallback for remaining cards

# Unique image assignments (1 article = 1 unique image, no repetitions)
unique_images = {
    # 6 existing category images -> assigned to ONE best-matching article each
    'sviluppo-sito-web-da-zero.html': '../Img/blog-cat-web.webp',
    'seo-per-piccole-imprese.html': '../Img/blog-cat-seo.webp',
    'strategia-digitale-pmi.html': '../Img/blog-cat-marketing.webp',
    'social-media-strategy-2026.html': '../Img/blog-cat-social.webp',
    'intelligenza-artificiale-pmi.html': '../Img/blog-cat-ai.webp',
    'caffe-sempione-caso-studio-locale.html': '../Img/blog-cat-case-study.webp',
    
    # 17 newly generated unique images
    'scegliere-hosting-sito-web.html': '../Img/blog/blog-hosting-sito-web.webp',
    'accessibilita-web-guida.html': '../Img/blog/blog-accessibilita-web.webp',
    'sito-web-multilingua.html': '../Img/blog/blog-sito-multilingua.webp',
    'web-design-trends-2026.html': '../Img/blog/blog-web-design-trends.webp',
    'form-contatto-ottimizzazione.html': '../Img/blog/blog-form-contatto.webp',
    'piattaforme-ecommerce-confronto.html': '../Img/blog/blog-ecommerce-confronto.webp',
    'scheda-prodotto-perfetta.html': '../Img/blog/blog-scheda-prodotto.webp',
    'quanto-costa-un-logo.html': '../Img/blog/blog-costo-logo.webp',
    'quanto-costa-una-landing-page.html': '../Img/blog/blog-costo-landing-page.webp',
    'quanto-costa-gestione-social-media.html': '../Img/blog/blog-gestione-social.webp',
    'quanto-costa-campagna-facebook-ads.html': '../Img/blog/blog-facebook-ads-costi.webp',
    'quanto-costa-brand-identity.html': '../Img/blog/blog-brand-identity-costi.webp',
    'web-agency-vs-freelance.html': '../Img/blog/blog-agency-vs-freelance.webp',
    'sito-web-fai-da-te-vs-professionale.html': '../Img/blog/blog-fai-da-te-vs-pro.webp',
    'serve-ancora-un-sito-web.html': '../Img/blog/blog-serve-sito-web.webp',
    'shopify-vs-sito-ecommerce-custom.html': '../Img/blog/blog-shopify-vs-custom.webp',
    'meta-ads-vs-google-ads.html': '../Img/blog/blog-meta-vs-google-ads.webp',
}

# Category fallback mapping for remaining cards
category_fallbacks = {
    'web': '../Img/blog-cat-web.webp',
    'seo': '../Img/blog-cat-seo.webp',
    'marketing': '../Img/blog-cat-marketing.webp',
    'social': '../Img/blog-cat-social.webp',
    'design': '../Img/blog-cat-web.webp',  # No design-specific image, use web as fallback
    'case-study': '../Img/blog-cat-case-study.webp',
    'ai': '../Img/blog-cat-ai.webp',
}

# Find all article blocks and update their images
# Pattern: <article ... data-category="XXX"> ... <a href="SLUG" ... <source srcset="IMG" ... <img ... src="IMG" ...
# We need to update source srcset and img src within each article block

def update_article_image(match):
    full_block = match.group(0)
    
    # Extract the article slug from the href
    href_match = re.search(r'<a\s+href="([^"]+)"[^>]*class="blog-card-image"', full_block)
    if not href_match:
        return full_block
    
    slug = href_match.group(1)
    
    # Check if this slug has a unique image
    if slug in unique_images:
        new_img = unique_images[slug]
    else:
        # Use category fallback
        cat_match = re.search(r'data-category="([^"]+)"', full_block)
        if cat_match:
            category = cat_match.group(1)
            new_img = category_fallbacks.get(category, '../Img/blog-cat-web.webp')
        else:
            new_img = '../Img/blog-cat-web.webp'
    
    # Replace source srcset
    full_block = re.sub(
        r'(<source\s+srcset=")[^"]+(")',
        lambda m: m.group(1) + new_img + m.group(2),
        full_block
    )
    
    # Replace img src (use same webp since we don't have png fallbacks for new images)
    full_block = re.sub(
        r'(<img\s+[^>]*src=")[^"]+(")',
        lambda m: m.group(1) + new_img + m.group(2),
        full_block
    )
    
    return full_block

# Match each article block
updated_content = re.sub(
    r'<article\s+class="blog-card"[^>]*>.*?</article>',
    update_article_image,
    content,
    flags=re.DOTALL
)

# Count changes
original_count = content.count('blog-cat-web.webp') + content.count('blog-cat-seo.webp') + content.count('blog-cat-marketing.webp') + content.count('blog-cat-social.webp')
new_count = updated_content.count('blog/blog-')

print(f"Original category image references: {original_count}")
print(f"New unique image references: {new_count}")
print(f"Total article blocks found: {len(re.findall(r'<article', updated_content))}")

# Write the updated file
with open('blog/index.html', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("✅ blog/index.html updated successfully!")

# Verify the changes
for slug, img in unique_images.items():
    if img in updated_content:
        print(f"  ✓ {slug} -> {img}")
    else:
        print(f"  ✗ MISSING: {slug} -> {img}")
