const fs = require('fs');
const { articles, stubArticles } = require('./blog/build-articles.js');

const allArticles = [...articles, ...stubArticles];
const CATEGORY_MAP = {
  'Web Development': 'web',
  'E-Commerce': 'web',
  'Performance': 'seo',
  'SEO Tecnica': 'seo',
  'SEO': 'seo',
  'Tecnologia': 'web',
  'Best Practice': 'design',
  'Conversioni': 'marketing',
  'Branding': 'design',
  'Design': 'design',
  'Personal Brand': 'marketing',
  'Social Media': 'social',
  'Instagram': 'social',
  'Advertising': 'social',
  'Content Marketing': 'marketing',
  'Analytics': 'marketing',
  'Strategia': 'marketing'
};

let cardsHtml = '';
allArticles.forEach(a => {
  const cat = CATEGORY_MAP[a.tag] || 'web';
  const dateFormatted = a.date.replace(' Gennaio ', ' Gen ').replace(' Febbraio ', ' Feb ').replace(' Marzo ', ' Mar ').replace(' Aprile ', ' Apr ').replace(' Maggio ', ' Mag ').replace(' Giugno ', ' Giu ').replace(' Luglio ', ' Lug ').replace(' Agosto ', ' Ago ').replace(' Settembre ', ' Set ').replace(' Ottobre ', ' Ott ').replace(' Novembre ', ' Nov ').replace(' Dicembre ', ' Dic ');
  
  cardsHtml += `
        <article class="blog-card" data-category="${cat}">
            <div class="blog-card-body">
                <span class="blog-card-tag">${a.tag}</span>
                <h2 class="blog-card-title"><a href="${a.slug}.html">${a.title}</a></h2>
                <p class="blog-card-excerpt">${a.description}</p>
                <div class="blog-card-meta">
                    <span>${dateFormatted} · ${a.readTime}</span>
                    <a href="${a.slug}.html" class="blog-card-read">Leggi →</a>
                </div>
            </div>
        </article>`;
});

let html = fs.readFileSync('blog/index.html', 'utf8');
const startToken = '<div class="blog-grid" id="blogGrid">';
const endToken = '</div> </div> </section>';

const startIdx = html.indexOf(startToken);
const endIdx = html.indexOf(endToken, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx + startToken.length) + cardsHtml + '\n            ' + html.substring(endIdx);
  fs.writeFileSync('blog/index.html', html);
  console.log('Successfully updated blog/index.html with ' + allArticles.length + ' articles');
} else {
  console.log('Error: Could not find insertion points in blog/index.html');
}
