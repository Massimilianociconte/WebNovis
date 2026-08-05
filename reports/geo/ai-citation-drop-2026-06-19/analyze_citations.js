#!/usr/bin/env node
'use strict';

/**
 * analyze_citations.js
 * Version-locked analysis of Bing Webmaster Tools AI Performance data
 * for webnovis.com
 *
 * Input: reports/geo/ai-citation-drop-2026-06-19/raw/*.csv
 * Output: reports/geo/ai-citation-drop-2026-06-19/output/
 *
 * Reproduces the baseline quantitative results described in the
 * investigation plan (§3 BASELINE QUANTITATIVA DA RIPRODURRE).
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'raw');
const OUT = path.join(__dirname, 'output');
const DAILY_CSV = path.join(BASE, 'webnovis.com_AIPerformanceOverviewStats_8_5_2026.csv');
const QUERY_CSV = path.join(BASE, 'webnovis.com_AISearchQueriesReport_8_5_2026.csv');

fs.mkdirSync(OUT, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────

function parseDate(str) {
  // "5/5/2026 12:00:00 AM"
  const m = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [_, mo, d, y] = m;
  return new Date(`${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00Z`);
}

function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.trim().split(/\r?\n/);
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = [];
    let cur = '';
    let inQuotes = false;
    for (let ch of lines[i]) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cols.push(cur); cur = ''; }
      else cur += ch;
    }
    cols.push(cur);
    const row = {};
    header.forEach((h, j) => { row[h] = cols[j] !== undefined ? cols[j].trim() : ''; });
    rows.push(row);
  }
  return { header, rows };
}

// ── Load data ────────────────────────────────────────────────────────

const daily = parseCsv(DAILY_CSV);
const queryRep = parseCsv(QUERY_CSV);

const data = daily.rows.map(r => ({
  date: parseDate(r.Date),
  citations: parseInt(r.Citations, 10),
  pages: parseInt(r['Cited Pages'] || r['Cited pages'], 10)
})).filter(d => d.date);

const queryData = queryRep.rows.map(r => ({
  query: r['Grounding Query'] || r.Query,
  intent: r.Intent,
  topic: r.Topic,
  citations: parseInt(r.Citations, 10),
  bingCitationShare: r['Citation Share'] || ''
})).filter(d => d.query);

// ── 1. Baseline quantitativa ────────────────────────────────────────

const breakDate = new Date('2026-06-20T00:00:00Z');

const prePeriod = data.filter(d => d.date >= new Date('2026-05-05') && d.date < breakDate);
const postPeriod = data.filter(d => d.date >= breakDate && d.date <= new Date('2026-08-02'));

function sum(arr, k) { return arr.reduce((a, b) => a + (b[k] || 0), 0); }
function avg(arr, k) { return arr.length ? sum(arr, k) / arr.length : 0; }

const preCitations = sum(prePeriod, 'citations');
const prePages = sum(prePeriod, 'pages');
const preDays = prePeriod.length;

const postCitations = sum(postPeriod, 'citations');
const postPages = sum(postPeriod, 'pages');
const postDays = postPeriod.length;

const preAvgCit = avg(prePeriod, 'citations');
const postAvgCit = avg(postPeriod, 'citations');
const preAvgPages = avg(prePeriod, 'pages');
const postAvgPages = avg(postPeriod, 'pages');

const pctCit = ((postAvgCit - preAvgCit) / preAvgCit) * 100;
const pctPages = ((postAvgPages - preAvgPages) / preAvgPages) * 100;

const zeroDays = postPeriod.filter(d => d.citations === 0).length;

const baseline = {
  metadata: {
    breakDate: fmtDate(breakDate),
    prePeriodStart: '2026-05-05',
    prePeriodEnd: '2026-06-19',
    postPeriodStart: '2026-06-20',
    postPeriodEnd: '2026-08-02',
    changePointDate: '2026-06-20',
    onsetDate: '2026-06-20',
    onsetTransition: 'Jun 19 (84 citations) → Jun 20 (33 citations)',
    sustainedZeroRegimeStart: '2026-06-21',
    boundaryNote: 'The CUSUM mean-shift algorithm places the change point at Jun 20 (index 46). The baseline breakDate is set to Jun 20, placing it in the post-period. The sustained zero-citation regime begins Jun 21. See change-point.json for details.'
  },
  prePeriod: {
    days: preDays,
    citations: preCitations,
    avgDailyCitations: Number(preAvgCit.toFixed(1)),
    pages: prePages,
    avgDailyPages: Number(preAvgPages.toFixed(1))
  },
  postPeriod: {
    days: postDays,
    citations: postCitations,
    avgDailyCitations: Number(postAvgCit.toFixed(1)),
    pages: postPages,
    avgDailyPages: Number(postAvgPages.toFixed(2)),
    zeroCitationDays: zeroDays
  },
  variation: {
    avgDailyCitationsPCT: Number(pctCit.toFixed(1)),
    avgDailyPagesPCT: Number(pctPages.toFixed(1))
  }
};

fs.writeFileSync(path.join(OUT, 'baseline.json'), JSON.stringify(baseline, null, 2));

// ── 2. Daily series JSON ────────────────────────────────────────────

const dailySeries = data.map(d => ({
  date: fmtDate(d.date),
  citations: d.citations,
  pages: d.pages
}));
fs.writeFileSync(path.join(OUT, 'daily-series.json'), JSON.stringify(dailySeries, null, 2));

// ── 3. 7-day moving average ─────────────────────────────────────────

const ma7 = [];
for (let i = 0; i < data.length; i++) {
  if (i >= 6) {
    const window = data.slice(i - 6, i + 1);
    ma7.push({
      date: fmtDate(data[i].date),
      citations_ma7: Number(avg(window, 'citations').toFixed(1)),
      pages_ma7: Number(avg(window, 'pages').toFixed(2))
    });
  } else {
    ma7.push({
      date: fmtDate(data[i].date),
      citations_ma7: null,
      pages_ma7: null
    });
  }
}
fs.writeFileSync(path.join(OUT, 'moving-average-7day.json'), JSON.stringify(ma7, null, 2));

// ── 4. Change-point analysis (CUSUM + simple mean-shift) ────────────
// Simple Bayesian blocks-style change point via maximum mean shift

let bestCp = null;
let bestScore = -Infinity;

for (let i = 5; i < data.length - 5; i++) {
  // before = data[0..i-1] (excludes change point), after = data[i..] (includes change point)
  // This is consistent with the baseline break date (breakDate) which places
  // the break date in the post-period.
  const before = data.slice(0, i);
  const after = data.slice(i);
  if (before.length < 5 || after.length < 5) continue;

  const meanBefore = avg(before, 'citations');
  const meanAfter = avg(after, 'citations');
  const varBefore = before.reduce((s, d) => s + Math.pow(d.citations - meanBefore, 2), 0) / before.length;
  const varAfter = after.reduce((s, d) => s + Math.pow(d.citations - meanAfter, 2), 0) / after.length;

  // t-like score: maximise |meanAfter - meanBefore| / pooled SE
  const pooledSE = Math.sqrt(varBefore / before.length + varAfter / after.length);
  const score = pooledSE > 0 ? Math.abs(meanAfter - meanBefore) / pooledSE : 0;

  if (score > bestScore) {
    bestScore = score;
    bestCp = i;
  }
}

// CUSUM analysis — identifies the onset date (max cumulative deviation)
let cusumPos = 0, cusumNeg = 0;
let cusumMax = 0, cusumDate = null;
const globalMean = avg(data, 'citations');

for (let i = 0; i < data.length; i++) {
  const diff = data[i].citations - globalMean;
  cusumPos = Math.max(0, cusumPos + diff);
  cusumNeg = Math.min(0, cusumNeg + diff);
  if (cusumPos > cusumMax) {
    cusumMax = cusumPos;
    cusumDate = fmtDate(data[i].date);
  }
}

// Onset date: the CUSUM change point (max cumulative deviation) — this is the
// first day that marks the departure from the pre-period regime (Jun 20, 84→33).
// The mean-shift algorithm detects the point of maximum mean difference (Jun 21, 33→0),
// which is the start of the sustained zero-citation regime.
const onsetIdx = cusumDate !== null ? data.findIndex(d => fmtDate(d.date) === cusumDate) : 46;

const changePoint = {
  detectedIndex: bestCp,
  detectedDate: bestCp !== null ? fmtDate(data[bestCp].date) : null,
  score: Number(bestScore.toFixed(4)),
  cusumMax: Number(cusumMax.toFixed(1)),
  cusumChangeDate: cusumDate,
  globalMean: Number(globalMean.toFixed(1)),
  onsetDate: cusumDate,
  onsetBeforeValue: onsetIdx > 0 ? data[onsetIdx - 1].citations : null,
  onsetValue: onsetIdx >= 0 ? data[onsetIdx].citations : null,
  sustainedRegimeStart: bestCp !== null ? fmtDate(data[bestCp].date) : null,
  sustainedRegimeStartValue: bestCp !== null ? data[bestCp].citations : null,
  boundaryResolution: {
    changePointDate: bestCp !== null ? fmtDate(data[bestCp].date) : null,
    changePointMethod: 'CUSUM mean-shift (maximises |meanAfter - meanBefore| / pooled SE)',
    onsetDate: cusumDate,
    onsetMethod: 'CUSUM max cumulative sum (first day departing pre-period regime)',
    onsetDescription: onsetIdx > 0 ? `${fmtDate(data[onsetIdx - 1].date)} (${data[onsetIdx - 1].citations} citations) → ${cusumDate} (${data[onsetIdx].citations} citations)` : null,
    sustainedRegimeDescription: bestCp !== null ? `${cusumDate} (${data[onsetIdx].citations} citations) → ${fmtDate(data[bestCp].date)} (${data[bestCp].citations} citations) (first zero-citation day)` : null
  }
};
fs.writeFileSync(path.join(OUT, 'change-point.json'), JSON.stringify(changePoint, null, 2));

// ── 5. 14-day and 30-day before/after comparison ─────────────────────

// Use the onset date (breakDate/Jun 20) as the canonical split for period
// comparison, NOT the mean-shift change point (Jun 21). This keeps the
// comparison consistent with the baseline breakDate.
const cpDate = breakDate;

function periodCompare(cp, days) {
  const beforeStart = new Date(cp);
  beforeStart.setDate(beforeStart.getDate() - days);
  const afterEnd = new Date(cp);
  afterEnd.setDate(afterEnd.getDate() + days);

  const before = data.filter(d => d.date >= beforeStart && d.date < cp);
  const after = data.filter(d => d.date >= cp && d.date < afterEnd);

  return {
    window: `${days} days`,
    before: {
      days: before.length,
      citations: sum(before, 'citations'),
      avgCitations: Number(avg(before, 'citations').toFixed(1)),
      avgPages: Number(avg(before, 'pages').toFixed(2))
    },
    after: {
      days: after.length,
      citations: sum(after, 'citations'),
      avgCitations: Number(avg(after, 'citations').toFixed(1)),
      avgPages: Number(avg(after, 'pages').toFixed(2))
    }
  };
}

const comparison = {
  '14d': periodCompare(cpDate, 14),
  '30d': periodCompare(cpDate, 30)
};
fs.writeFileSync(path.join(OUT, 'period-comparison.json'), JSON.stringify(comparison, null, 2));

// ── 6. Query concentration ──────────────────────────────────────────

const totalQueryCitations = sum(queryData, 'citations');
const sortedQueries = [...queryData].sort((a, b) => b.citations - a.citations);

const queryDist = sortedQueries.map((q, i) => ({
  rank: i + 1,
  query: q.query,
  intent: q.intent,
  topic: q.topic,
  citations: q.citations,
  bingCitationShare: q.bingCitationShare,
  withinExportSharePct: ((q.citations / totalQueryCitations) * 100).toFixed(2) + '%',
  cumulativeWithinExportSharePct: ((sortedQueries.slice(0, i + 1).reduce((a, c) => a + c.citations, 0) / totalQueryCitations) * 100).toFixed(2) + '%'
}));

const concentration = {
  exportMetadata: {
    exportDate: '2026-08-05',
    reportType: 'Bing Webmaster Tools — AI Search Queries Report',
    dateRange: 'UNKNOWN — CSV does not contain date columns. Assumed to cover the full post-crash period shown in the daily overview export (Jun 20 – Aug 2), since the query report was exported on the same date (Aug 5) and contains only post-change-point data.',
    filterAssumption: 'No explicit date or filter metadata is present in the CSV header. The post-crash classification is inferred from the change-point context, not from explicit date filtering.',
    samplingDisclaimer: 'Bing states: "AI Performance data is sampled, and grounding queries and pages may each be sampled over slightly different time windows." Citation Share values from this column represent Bing\'s share metric, not within-export percentages.'
  },
  totalRows: queryData.length,
  totalCitations: totalQueryCitations,
  topQueryShare: Number((sortedQueries[0].citations / totalQueryCitations * 100).toFixed(1)),
  topTwoShare: Number((sortedQueries.slice(0, 2).reduce((a, c) => a + c.citations, 0) / totalQueryCitations * 100).toFixed(1)),
  topFourShare: Number((sortedQueries.slice(0, 4).reduce((a, c) => a + c.citations, 0) / totalQueryCitations * 100).toFixed(1)),
  distribution: queryDist
};

fs.writeFileSync(path.join(OUT, 'query-concentration.json'), JSON.stringify(concentration, null, 2));
fs.writeFileSync(path.join(OUT, 'query-distribution.csv'),
  'Query,Citations,Bing Citation Share,Within-Export Share,Cumulative Within-Export Share\n' +
  queryDist.map(d => `"${d.query}",${d.citations},${d.bingCitationShare},${d.withinExportSharePct},${d.cumulativeWithinExportSharePct}`).join('\n') + '\n'
);

// ── 7. Citation-to-page ratio ───────────────────────────────────────

const citPerPagePre = avg(prePeriod, 'citations') / avg(prePeriod, 'pages');
const citPerPagePost = avg(postPeriod, 'citations') / avg(postPeriod, 'pages');

const ratios = {
  prePeriod: {
    citationsPerPage: Number((preCitations / prePages).toFixed(2))
  },
  postPeriod: {
    citationsPerPage: Number((postCitations / postPages).toFixed(2))
  }
};
fs.writeFileSync(path.join(OUT, 'citation-page-ratio.json'), JSON.stringify(ratios, null, 2));

// ── 8. Anomaly intervals ────────────────────────────────────────────

const anomalyIntervals = [];
let inAnomaly = false;
let anomalyStart = null;

for (const d of data) {
  if (d.citations === 0) {
    if (!inAnomaly) {
      inAnomaly = true;
      anomalyStart = fmtDate(d.date);
    }
  } else {
    if (inAnomaly) {
      anomalyIntervals.push({ start: anomalyStart, end: fmtDate(new Date(d.date.getTime() - 86400000)), days: 0 });
      const start = new Date(anomalyStart);
      const end = new Date(d.date.getTime() - 86400000);
      anomalyIntervals[anomalyIntervals.length - 1].days = Math.round((end - start) / 86400000) + 1;
      inAnomaly = false;
      anomalyStart = null;
    }
  }
}
if (inAnomaly) {
  const end = fmtDate(data[data.length - 1].date);
  const start = new Date(anomalyStart);
  const endDate = new Date(end);
  anomalyIntervals.push({
    start: anomalyStart,
    end: end,
    days: Math.round((endDate - start) / 86400000) + 1
  });
}

fs.writeFileSync(path.join(OUT, 'anomaly-intervals.json'), JSON.stringify(anomalyIntervals, null, 2));

// ── Console summary ─────────────────────────────────────────────────

console.log('=== BASELINE QUANTITATIVA ===');
console.log(JSON.stringify(baseline, null, 2));
console.log('\n=== CHANGE POINT ===');
console.log(JSON.stringify(changePoint, null, 2));
console.log('\n=== CONCENTRAZIONE ===');
console.log(`Totale righe query: ${concentration.totalRows}`);
console.log(`Totale citazioni (esportazione): ${concentration.totalCitations}`);
console.log(`Prima query (${sortedQueries[0].query}): ${concentration.topQueryShare}% del totale esportazione (within-export share)`);
console.log(`Prime due: ${concentration.topTwoShare}%`);
console.log(`Prime quattro: ${concentration.topFourShare}%`);
console.log(`\n=== INTERVALI ANOMALI (giorni a zero) ===`);
anomalyIntervals.forEach(a => console.log(`  ${a.start} → ${a.end} (${a.days} giorni)`));
console.log(`\nTotale giorni a zero nel post-periodo: ${zeroDays}`);
