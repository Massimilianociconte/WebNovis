import glob
import re

html_files = glob.glob('blog/*.html')
html_files = [f for f in html_files if 'index.html' not in f]

with open('blog/index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

missing_in_index = []
for f in html_files:
    slug = f.replace('blog/', '')
    if slug not in index_html:
        missing_in_index.append(slug)

print(f"Total HTML files in blog/: {len(html_files)}")
print(f"Files not found in index.html: {len(missing_in_index)}")
for f in missing_in_index:
    print(f)
