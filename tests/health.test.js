/**
 * Basic health and smoke tests for WebNovis
 * Run: npx vitest run tests/
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

describe('Build artifacts', () => {
    it('sitemap.xml exists and is valid XML', () => {
        const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf-8');
        expect(sitemap).toContain('<?xml');
        expect(sitemap).toContain('<urlset');
        expect(sitemap).toContain('https://www.webnovis.com');
    });

    it('sitemap does not contain excluded pages', () => {
        const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf-8');
        expect(sitemap).not.toContain('grazie.html');
        expect(sitemap).not.toContain('404.html');
    });

    it('robots.txt exists and references sitemap', () => {
        const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf-8');
        expect(robots).toContain('Sitemap:');
        expect(robots).toContain('https://www.webnovis.com/sitemap.xml');
    });

    it('manifest.json has distinct icon sizes', () => {
        const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf-8'));
        const icons = manifest.icons.filter(i => i.type === 'image/png');
        const srcs = icons.map(i => i.src);
        expect(new Set(srcs).size).toBe(srcs.length);
    });

    it('search-index.json exists and is valid JSON', () => {
        const raw = fs.readFileSync(path.join(ROOT, 'search-index.json'), 'utf-8');
        const data = JSON.parse(raw);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
    });
});

describe('HTML quality', () => {
    const mainPages = [
        'index.html', 'contatti.html', 'portfolio.html', 'chi-siamo.html',
        'come-lavoriamo.html', 'preventivo.html', 'privacy-policy.html'
    ];

    for (const page of mainPages) {
        it(`${page} has required meta tags`, () => {
            const html = fs.readFileSync(path.join(ROOT, page), 'utf-8');
            expect(html).toContain('<title>');
            expect(html).toContain('name="description"');
            expect(html).toContain('rel="canonical"');
            expect(html).toContain('charset="UTF-8"');
        });

        it(`${page} has no mojibake characters`, () => {
            const content = fs.readFileSync(path.join(ROOT, page), 'utf-8');
            // Check for common double-encoding artifacts
            expect(content).not.toMatch(/â€["\u201C\u201D\u0093\u0094]/);
        });

        it(`${page} has skip-to-content link`, () => {
            const html = fs.readFileSync(path.join(ROOT, page), 'utf-8');
            expect(html).toContain('skip-link');
        });

        it(`${page} uses /blog/ not /blog/index.html`, () => {
            const html = fs.readFileSync(path.join(ROOT, page), 'utf-8');
            expect(html).not.toContain('href="blog/index.html"');
            expect(html).not.toContain('href="/blog/index.html"');
        });
    }
});

describe('Security headers (static)', () => {
    it('_headers file has CSP', () => {
        const headers = fs.readFileSync(path.join(ROOT, '_headers'), 'utf-8');
        expect(headers).toContain('Content-Security-Policy');
    });

    it('_headers file has HSTS with preload', () => {
        const headers = fs.readFileSync(path.join(ROOT, '_headers'), 'utf-8');
        expect(headers).toContain('Strict-Transport-Security');
        expect(headers).toContain('preload');
    });
});

describe('Structured data', () => {
    it('index.html has Organization schema', () => {
        const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
        expect(html).toContain('"@type": "Organization"');
        expect(html).toContain('"@id": "https://www.webnovis.com/#organization"');
    });

    it('portfolio.html has no duplicate CollectionPage schema', () => {
        const html = fs.readFileSync(path.join(ROOT, 'portfolio.html'), 'utf-8');
        const matches = html.match(/"@type": "CollectionPage"/g);
        expect(matches).toHaveLength(1);
    });
});
