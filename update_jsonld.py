import json
import re

file_path = 'c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def replace_script(match):
    s = match.group(1)
    try:
        data = json.loads(s)
        if data.get('@type') == 'CollectionPage':
            main_ent = data.get('mainEntity', {})
            if main_ent.get('@type') == 'ItemList':
                items = main_ent.get('itemListElement', [])
                # Shift positions
                for item in items:
                    item['position'] = item.get('position', 0) + 1
                
                new_item = {
                    "@type": "ListItem",
                    "position": 1,
                    "url": "https://www.webnovis.com/blog/importanza-del-design-siti-web.html",
                    "name": "L'Importanza del Design nel 2026: UX, Web e Conversioni"
                }
                items.insert(0, new_item)
                main_ent['itemListElement'] = items
                data['mainEntity'] = main_ent
                
        # Return updated JSON
        return f'<script type="application/ld+json">\n{json.dumps(data, ensure_ascii=False, separators=(",", ":"))}\n</script>'
    except Exception as e:
        return match.group(0)

new_content = re.sub(r'<script type="application/ld\+json">(.*?)</script>', replace_script, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated structured data in blog/index.html")
