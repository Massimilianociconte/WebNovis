import glob
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

count = 0
for f in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    real_f = os.path.realpath(f)
    if not real_f.startswith(ROOT + os.sep):
        continue
    with open(real_f, "r", encoding="utf-8") as fh:
        c = fh.read()
    o = c
    c = c.replace('href="../blog/index.html"', 'href="../blog/"')
    c = c.replace('href="/blog/index.html"', 'href="/blog/"')
    c = c.replace('href="blog/index.html"', 'href="blog/"')
    if c != o:
        with open(real_f, "w", encoding="utf-8") as fh:
            fh.write(c)
        count += 1

print(f"Fixed {count} HTML files")
