with open('blog/index.html', 'r', encoding='utf-8') as f:
    body_content = f.read().split('<script type="application/ld+json">')[0]

import re
matches = re.finditer(r'<[aA][^>]+href=["\']([^"\']*seo-blog-aziendale\.html)["\']', body_content, re.IGNORECASE)
for match in matches:
    print(match.group(0))
