/**
 * Summarize rewrite-eval-report.json — offline only, no API calls.
 * Does NOT modify prompts automatically.
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportPath = join(
  __dirname,
  '../lib/prompts/__fixtures__/rewrite-eval-report.json'
);

if (!existsSync(reportPath)) {
  console.error('No report found. Run: npm run eval:rewrite:suite');
  process.exit(1);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const fails = report.filter((r) => r.status === 'FAIL');
const errs = report.filter((r) => r.status === 'ERR');
const passed = report.filter((r) => r.status === 'PASS');

const byReason = new Map();
for (const r of fails) {
  for (const f of r.fails ?? []) {
    const key = f.replace(/"[^"]+"/g, '"…"');
    byReason.set(key, (byReason.get(key) ?? 0) + 1);
  }
}

const byCase = new Map();
for (const r of fails) {
  const k = r.id;
  if (!byCase.has(k)) byCase.set(k, []);
  byCase.get(k).push(`${r.level}: ${(r.fails ?? []).join('; ')}`);
}

console.log(`\n=== Eval analysis ===`);
console.log(`PASS: ${passed.length}/${report.length} (${((100 * passed.length) / report.length).toFixed(1)}%)`);
console.log(`FAIL: ${fails.length}  ERR: ${errs.length}\n`);

if (byReason.size) {
  console.log('Top failure reasons:');
  [...byReason.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .forEach(([reason, n]) => console.log(`  ${n}×  ${reason}`));
}

if (byCase.size) {
  console.log('\nBy case:');
  for (const [id, lines] of byCase) {
    console.log(`  ${id}`);
    lines.forEach((l) => console.log(`    - ${l}`));
  }
}

const strict = report.filter((r) => r.level === 'moderate' || r.level === 'firm');
const strictPass = strict.filter((r) => r.status === 'PASS').length;
  console.log(
    `\nModerate+firm only: ${strictPass}/${strict.length} (${((100 * strictPass) / strict.length).toFixed(1)}%)`
  );

  const byLang = new Map();
  const byCat = new Map();
  for (const r of report) {
    const lang = r.lang ?? 'nl';
    if (!byLang.has(lang)) byLang.set(lang, { pass: 0, total: 0 });
    const L = byLang.get(lang);
    L.total++;
    if (r.status === 'PASS') L.pass++;

    const cat = r.category ?? r.id?.split('-')[0] ?? '?';
    if (!byCat.has(cat)) byCat.set(cat, { pass: 0, total: 0 });
    const C = byCat.get(cat);
    C.total++;
    if (r.status === 'PASS') C.pass++;
  }

  if (byLang.size > 1) {
    console.log('\nBy language:');
    for (const [lang, { pass, total }] of [...byLang.entries()].sort()) {
      console.log(`  ${lang}: ${pass}/${total} (${((100 * pass) / total).toFixed(1)}%)`);
    }
  }

  if (byCat.size > 1) {
    console.log('\nBy category:');
    for (const [cat, { pass, total }] of [...byCat.entries()].sort()) {
      console.log(`  ${cat}: ${pass}/${total} (${((100 * pass) / total).toFixed(1)}%)`);
    }
  }

  console.log('\nTuning: edit prompts/validation in repo, then re-run eval. No auto-apply from this script.\n');
