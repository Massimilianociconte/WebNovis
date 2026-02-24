import glob

count = 0
for f in glob.glob("**/*.html", recursive=True):
    with open(f, "r", encoding="utf-8") as fh:
        c = fh.read()
    o = c
    c = c.replace('href="../blog/index.html"', 'href="../blog/"')
    c = c.replace('href="/blog/index.html"', 'href="/blog/"')
    c = c.replace('href="blog/index.html"', 'href="blog/"')
    if c != o:
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(c)
        count += 1

print(f"Fixed {count} HTML files")
