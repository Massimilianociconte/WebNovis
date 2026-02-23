import json
import re

file_path = 'c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', c, re.DOTALL)
for s in scripts:
    try:
        data = json.loads(s)
        print('Found Schema type:', data.get('@type'))
        if data.get('@type') == 'CollectionPage':
            pass
    except Exception as e:
        pass
