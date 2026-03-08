with open('blog/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

articles = html.split('<article class="blog-card"')
count = 0
for text in articles[1:]:
    if 'blog-cat-' in text:
        href_start = text.find('href="') + 6
        href_end = text.find('"', href_start)
        slug = text[href_start:href_end] if href_start > 5 else 'Unknown'
        
        title_start = text.find('<h3 class="blog-card-title">')
        if title_start != -1:
            title_a_start = text.find('>', text.find('<a', title_start)) + 1
            title_a_end = text.find('</a>', title_a_start)
            title = text[title_a_start:title_a_end]
        else:
            title = 'Unknown'
            
        print(f'{slug} | {title}')
        count += 1
print(f'Total missing: {count}')
