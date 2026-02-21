// js/web-vitals-reporter.js
// Real User Monitoring — Core Web Vitals → GA4
// Ref: SEO-playbook §1 (Core Web Vitals), §5 (Performance budgets)
(function () {
  'use strict';

  // Only run if GA4 is configured and consent is granted
  if (!window.gtag || !window.__gaConfigured) return;

  function sendToGA4(metric) {
    gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_rating: metric.rating // 'good' | 'needs-improvement' | 'poor'
    });
  }

  // Dynamically load web-vitals from CDN (v4 — smallest footprint)
  var script = document.createElement('script');
  script.src = '/js/web-vitals.iife.js';
  script.onload = function () {
    if (window.webVitals) {
      webVitals.onCLS(sendToGA4);
      webVitals.onINP(sendToGA4);
      webVitals.onLCP(sendToGA4);
      webVitals.onFCP(sendToGA4);
      webVitals.onTTFB(sendToGA4);
    }
  };
  document.head.appendChild(script);
})();
