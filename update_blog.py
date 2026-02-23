import sys
import re

file_path = 'c:/Users/Massi/Documents/Webnovis_kiro - backup/blog/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_article = '''<article class="blog-card" data-category="design"><div class="blog-card-image"><picture><source srcset="../Img/importanza_design_web_1.webp" type="image/webp"><img src="../Img/importanza_design_web_1.jpg" alt="Importanza del Design Web" loading="lazy" fetchpriority="low"></picture><div class="blog-card-category">Design</div></div><div class="blog-card-body"><div class="blog-card-meta"><time datetime="2026-02-23">23 Feb 2026</time> <span class="read-time">4 min read</span></div><h3 class="blog-card-title"><a href="importanza-del-design-siti-web.html" title="L'Importanza del Design nel 2026">L'Importanza del Design nel 2026: UX, Web e Conversioni</a></h3><p class="blog-card-excerpt">Scopri come il design influenza le conversioni e la fiducia degli utenti. L'impatto della UX/UI nel successo del tuo sito web.</p><a href="importanza-del-design-siti-web.html" class="blog-card-read" title="Leggi l'articolo sull'importanza del design" aria-label="Leggi: L'Importanza del Design nel 2026">Leggi Articolo →</a></div></article>'''

# Let's see if <div class="blog-grid" id="blogGrid"> exists
match = re.search(r'(<div class="blog-grid" id="blogGrid">)', content)
if match:
    new_content = content[:match.end()] + new_article + content[match.end():]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully inserted the article.')
else:
    print('Error: Could not find blogGrid snippet in the file.')
