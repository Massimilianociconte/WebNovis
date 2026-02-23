import json
import re

file_path = 'c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', c, re.DOTALL)
for ix, s in enumerate(scripts):
    data = json.loads(s)
    if data.get('@type') == 'CollectionPage':
        main_ent = data.get('mainEntity', [])
        print('CollectionPage mainEntity type:', type(main_ent))
        if isinstance(main_ent, list):
            for e in main_ent:
                print('Item:', e.get('@type'), e.get('headline') or e.get('name'))
