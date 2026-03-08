const DEFAULT_CORS_ORIGINS = [
  'https://www.webnovis.com',
  'https://webnovis.com',
  'https://webnovis-chat.onrender.com'
];

const CONTENT_SECURITY_POLICY_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://widget.trustpilot.com https://connect.facebook.net https://www.clarity.ms https://scripts.clarity.ms https://cdn.jsdelivr.net https://web3forms.com https://esm.sh https://www.designrush.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.designrush.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com https://www.designrush.com",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.clarity.ms https://scripts.clarity.ms https://api.web3forms.com https://www.facebook.com https://www.designrush.com https://widget.trustpilot.com",
  "frame-src https://widget.trustpilot.com https://www.facebook.com https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://api.web3forms.com",
  'upgrade-insecure-requests'
];

const CONTENT_SECURITY_POLICY = CONTENT_SECURITY_POLICY_DIRECTIVES.join('; ');

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '0'
};

function parseCorsOrigins(rawOrigins) {
  return String(rawOrigins || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

function getAllowedCorsOrigins(env = process.env) {
  return new Set([
    ...DEFAULT_CORS_ORIGINS,
    ...parseCorsOrigins(env.CORS_ORIGINS)
  ]);
}

function buildStaticHeadersFile() {
  const lines = [
    '# AUTO-GENERATED: run npm run sync:headers after editing config/security-headers.js',
    '# Static host header rules for platforms that support _headers (Netlify/Cloudflare Pages).',
    '',
    '/*'
  ];

  for (const [headerName, value] of Object.entries(SECURITY_HEADERS)) {
    lines.push(`  ${headerName}: ${value}`);
  }

  lines.push(
    '*/',
    '',
    '/css/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/js/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/Img/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/fonts/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/*.html',
    '  Cache-Control: public, max-age=300, stale-while-revalidate=3600',
    '',
    '/api/*',
    '  X-Robots-Tag: noindex, nofollow'
  );

  return lines.join('\n');
}

module.exports = {
  CONTENT_SECURITY_POLICY,
  CONTENT_SECURITY_POLICY_DIRECTIVES,
  DEFAULT_CORS_ORIGINS,
  SECURITY_HEADERS,
  buildStaticHeadersFile,
  getAllowedCorsOrigins,
  parseCorsOrigins
};
