#!/usr/bin/env node
/**
 * SEO Script: Enrich author schema in blog articles for E-E-A-T
 * 
 * Replaces the minimal author Person schema with a richer version
 * including @type, jobTitle, worksFor, description, and more sameAs links.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');

const OLD_AUTHOR = '"@id":"https://www.webnovis.com/#author-webnovis-editorial-team","name":"WebNovis Editorial Team","url":"https://www.webnovis.com/chi-siamo.html","image":"https://www.webnovis.com/Img/webnovis-logo-bianco.png","sameAs":["https://www.instagram.com/web.novis","https://www.facebook.com/share/1C7hNnkqEU/"],"knowsAbout":["SEO","Web Development","E-commerce","Brand Identity","Social Media Management","Core Web Vitals","Digital Marketing"]}';

const NEW_AUTHOR = '"@type":"Person","@id":"https://www.webnovis.com/#author-webnovis-editorial-team","name":"Massimiliano Ciconte","alternateName":"WebNovis Editorial Team","jobTitle":"Founder & Web Developer","description":"Fondatore di Web Novis, agenzia web a Milano (Rho). Esperto in sviluppo web custom, SEO tecnica e strategie digitali per PMI.","url":"https://www.webnovis.com/chi-siamo.html","image":"https://www.webnovis.com/Img/webnovis-logo-bianco.png","worksFor":{"@id":"https://www.webnovis.com/#organization"},"sameAs":["https://www.instagram.com/web.novis","https://www.facebook.com/share/1C7hNnkqEU/","https://www.linkedin.com/company/webnovis","https://www.behance.net/web-novis","https://gravatar.com/totallycowboy36ee3bef4c"],"knowsAbout":["SEO","SEO Tecnica","Core Web Vitals","Web Development","Sviluppo Siti Web","E-commerce","Brand Identity","Social Media Marketing","Digital Strategy","UI/UX Design","Accessibilità Web"]}';

let modified = 0;

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(OLD_AUTHOR)) {
    const updated = content.replace(OLD_AUTHOR, NEW_AUTHOR);
    fs.writeFileSync(filePath, updated, 'utf8');
    modified++;
    console.log(`✅ ${file}`);
  }
}

console.log(`\n📊 Summary: ${modified} blog articles updated with enriched author schema`);
