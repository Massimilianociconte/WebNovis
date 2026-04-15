#!/usr/bin/env node

const DEFAULT_URL = 'https://www.webnovis.com/';

function parseArgs(argv) {
  const options = {
    url: DEFAULT_URL,
    strategy: 'mobile',
    locale: 'it',
    output: 'table'
  };

  argv.forEach((arg) => {
    if (arg.startsWith('--url=')) options.url = arg.slice('--url='.length);
    if (arg.startsWith('--strategy=')) options.strategy = arg.slice('--strategy='.length);
    if (arg.startsWith('--locale=')) options.locale = arg.slice('--locale='.length);
    if (arg.startsWith('--output=')) options.output = arg.slice('--output='.length);
  });

  return options;
}

function pickApiKey() {
  return (
    process.env.PAGESPEED_API_KEY ||
    process.env.GOOGLE_PAGESPEED_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ''
  ).trim();
}

function summarize(data) {
  const audits = data.lighthouseResult?.audits || {};
  const loadingExperience = data.loadingExperience || {};
  const metrics = loadingExperience.metrics || {};

  return {
    analyzedUrl: data.id || data.lighthouseResult?.finalDisplayedUrl || data.lighthouseResult?.requestedUrl || '',
    strategy: data.configSettings?.emulatedFormFactor || '',
    performanceScore: typeof data.lighthouseResult?.categories?.performance?.score === 'number'
      ? Math.round(data.lighthouseResult.categories.performance.score * 100)
      : null,
    lab: {
      fcp: audits['first-contentful-paint']?.displayValue || null,
      lcp: audits['largest-contentful-paint']?.displayValue || null,
      speedIndex: audits['speed-index']?.displayValue || null,
      tbt: audits['total-blocking-time']?.displayValue || null,
      cls: audits['cumulative-layout-shift']?.displayValue || null
    },
    field: {
      overall: loadingExperience.overall_category || null,
      fcp: metrics.FIRST_CONTENTFUL_PAINT_MS?.percentile || null,
      lcp: metrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile || null,
      cls: metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile || null,
      inp: metrics.INTERACTION_TO_NEXT_PAINT?.percentile || null
    }
  };
}

function formatPercentile(metricName, value) {
  if (value == null) return '-';
  if (metricName === 'cls') return String(value / 100);
  return `${(value / 1000).toFixed(2)} s`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apiKey = pickApiKey();

  if (!apiKey) {
    console.error('Missing API key. Set PAGESPEED_API_KEY or GOOGLE_PAGESPEED_API_KEY and retry.');
    process.exit(1);
  }

  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', options.url);
  endpoint.searchParams.set('strategy', options.strategy);
  endpoint.searchParams.set('category', 'performance');
  endpoint.searchParams.set('locale', options.locale);
  endpoint.searchParams.set('key', apiKey);

  const response = await fetch(endpoint);
  const payload = await response.json();

  if (!response.ok || payload.error) {
    const error = payload.error || {};
    const details = error.details || [];
    const activation = details.find((item) => item['@type'] === 'type.googleapis.com/google.rpc.Help')
      ?.links?.[0]?.url;

    console.error(`PageSpeed API error ${error.code || response.status}: ${error.message || response.statusText}`);
    if (activation) {
      console.error(`Activation / quota help: ${activation}`);
    }
    process.exit(1);
  }

  const summary = summarize(payload);

  if (options.output === 'json') {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`URL: ${summary.analyzedUrl}`);
  console.log(`Strategy: ${options.strategy}`);
  console.log(`Performance score: ${summary.performanceScore ?? '-'}`);
  console.log('');
  console.log('Lab data');
  console.log(`- FCP: ${summary.lab.fcp || '-'}`);
  console.log(`- LCP: ${summary.lab.lcp || '-'}`);
  console.log(`- Speed Index: ${summary.lab.speedIndex || '-'}`);
  console.log(`- TBT: ${summary.lab.tbt || '-'}`);
  console.log(`- CLS: ${summary.lab.cls || '-'}`);
  console.log('');
  console.log('Field data');
  console.log(`- Overall: ${summary.field.overall || '-'}`);
  console.log(`- FCP p75: ${formatPercentile('fcp', summary.field.fcp)}`);
  console.log(`- LCP p75: ${formatPercentile('lcp', summary.field.lcp)}`);
  console.log(`- INP p75: ${formatPercentile('inp', summary.field.inp)}`);
  console.log(`- CLS p75: ${formatPercentile('cls', summary.field.cls)}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
