import re

def main():
    with open('blog/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    articles = re.split(r'<article class="blog-card"', content)[1:]
    missing = []
    for idx, a in enumerate(articles):
        if 'blog-cat-' in a:
            href_match = re.search(r'href="([^"]+)"', a)
            slug = href_match.group(1).replace('.html', '') if href_match else f'unknown-{idx}'
            
            title_match = re.search(r'<h2 class="blog-card-title"><a[^>]*>(.*?)</a></h2>', a)
            title = title_match.group(1) if title_match else f'Unknown Title {idx}'
            
            missing.append((slug, title))

    with open('missing_images_v2.txt', 'w', encoding='utf-8') as out:
        for m in missing:
            out.write(f"{m[0]}|{m[1]}\n")
            
if __name__ == '__main__':
    main()
