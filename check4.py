import json
import re

file_path = 'c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', c, re.DOTALL)
for ix, s in enumerate(scripts):
    data = json.loads(s)
    if data.get('@type') == 'CollectionPage':
        main_ent = data.get('mainEntity', {})
        print('CollectionPage mainEntity @type:', main_ent.get('@type'))
        if main_ent.get('@type') == 'ItemList':
            items = main_ent.get('itemListElement', [])
            print('Items count:', len(items))
            if items:
                print('First item:', items[0])
