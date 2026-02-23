import re

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix absolute paths -> relative paths (matching with query strings)
    # We look for href="/... or src="/...
    content = content.replace('href="/manifest.json"', 'href="../manifest.json"')
    
    content = re.sub(r'href="/favicon\.ico', 'href="../favicon.ico', content)
    content = re.sub(r'href="/Img/favicon\.png', 'href="../Img/favicon.png', content)
    content = re.sub(r'href="/search-index\.json', 'href="../search-index.json', content)

    # Note that 'importanza_design_web_1.png' etc is already replaced from our previous script, it's just CORS issue now.

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
fix_file('c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/index.html')
# Same for the individual post page 
fix_file('c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/importanza-del-design-siti-web.html')
print('Paths fixed.')
