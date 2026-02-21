module.exports = {
  ci: {
    collect: {
      url: [
        'https://www.webnovis.com/',
        'https://www.webnovis.com/servizi/sviluppo-web.html',
        'https://www.webnovis.com/servizi/graphic-design.html',
        'https://www.webnovis.com/servizi/social-media.html',
        'https://www.webnovis.com/chi-siamo.html',
        'https://www.webnovis.com/contatti.html',
        'https://www.webnovis.com/portfolio.html',
        'https://www.webnovis.com/blog/index.html'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'categories:accessibility': ['warn', { minScore: 0.85 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
