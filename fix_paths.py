import re

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Image replacement for the blog card
    content = content.replace('importanza_design_web_1.webp', 'rho-web-design-studio.webp')
    content = content.replace('importanza_design_web_1.jpg', 'rho-web-design-studio.png')

    # Fix absolute paths -> relative paths (since this is in /blog/)
    content = content.replace('"/manifest.json"', '"../manifest.json"')
    content = content.replace('"/favicon.ico"', '"../favicon.ico"')
    content = content.replace('"/Img/favicon.png"', '"../Img/favicon.png"')
    content = content.replace('"/search-index.json"', '"../search-index.json"')

    # Also check if fetch API calls absolute paths in js/search.min.js and search.js
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
fix_file('c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/index.html')
# We do the same for the individual post page because they likely share the same head template that uses `/manifest.json`
fix_file('c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/importanza-del-design-siti-web.html')
print("Paths fixed.")
