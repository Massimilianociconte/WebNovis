import json
import re

file_path = 'c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', c, re.DOTALL)
for ix, s in enumerate(scripts):
    data = json.loads(s)
    if data.get('@type') == 'CollectionPage':
        # Add to hasPart or similar? Or maybe it's Blog that has blogPosts?
        print('CollectionPage keys:', data.keys())
    elif data.get('@type') == 'Blog':
        print('Blog keys:', data.keys())
        if 'blogPost' in data:
            print('BlogPost titles:', [p.get('headline') for p in data['blogPost']])
