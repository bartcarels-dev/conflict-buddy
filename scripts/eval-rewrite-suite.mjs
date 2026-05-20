/**
 * Run: npm run dev (separate terminal)
 * Then: npm run eval:rewrite:suite
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = process.env.EVAL_URL ?? 'http://localhost:3000';
const levels = ['minimal', 'moderate', 'firm'];
function loadFixtures(name) {
  return JSON.parse(
    readFileSync(join(__dirname, `../lib/prompts/__fixtures__/${name}`), 'utf8')
  );
}

const only = process.env.EVAL_ONLY;
const includeI18n = process.env.EVAL_I18N !== '0';
const fixtures =
  only === 'i18n'
    ? loadFixtures('rewrite-eval-i18n-suite.json')
    : only === 'nl'
      ? loadFixtures('rewrite-eval-suite.json')
      : [
          ...loadFixtures('rewrite-eval-suite.json'),
          ...(includeI18n ? loadFixtures('rewrite-eval-i18n-suite.json') : []),
        ];

function check(text, patterns, level) {
  const lower = text.toLowerCase();
  const fails = [];
  const strict = level === 'moderate' || level === 'firm';
  if (strict) {
    for (const p of patterns.mustNotContain ?? []) {
      if (lower.includes(p.toLowerCase())) fails.push(`contains banned: "${p}"`);
    }
  }
  const should = strict
    ? [...(patterns.shouldContainModerate ?? []), ...(patterns.shouldContain ?? [])]
    : [...(patterns.shouldContain ?? [])];
  const seen = new Set();
  const shouldUnique = should.filter((p) => {
    const k = p.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  for (const p of shouldUnique) {
    if (!lower.includes(p.toLowerCase())) fails.push(`missing: "${p}"`);
  }
  const any = strict ? (patterns.shouldContainAny ?? []) : [];
  if (any.length && !any.some((p) => lower.includes(p.toLowerCase()))) {
    fails.push(`missing any of: ${any.map((p) => `"${p}"`).join(', ')}`);
  }
  return fails;
}

async function rewrite(input, transformLevel) {
  const res = await fetch(`${base}/api/improve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'rewrite', input, transformLevel }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return String(data.output ?? '');
}

async function main() {
  const report = [];
  console.log(
    `Evaluating ${fixtures.length} cases × ${levels.length} modes${includeI18n ? ' (incl. i18n)' : ''}\n`
  );

  for (const f of fixtures) {
    const tag = f.lang ? ` [${f.lang}]` : '';
    console.log(`\n=== ${f.id}${tag} ===`);
    for (const level of levels) {
      try {
        const output = await rewrite(f.input, level);
        const fails = check(output, f, level);
        const status = fails.length === 0 ? 'PASS' : 'FAIL';
        console.log(`  [${status}] ${level}`);
        if (fails.length) fails.forEach((e) => console.log(`      - ${e}`));
        console.log(`      ${output.slice(0, 120).replace(/\n/g, ' ')}…`);
        report.push({
          id: f.id,
          lang: f.lang,
          category: f.category,
          level,
          status,
          fails,
          output,
        });
      } catch (e) {
        console.log(`  [ERR] ${level}: ${e.message}`);
        report.push({ id: f.id, level, status: 'ERR', error: e.message });
      }
    }
  }

  const outPath = join(__dirname, '../lib/prompts/__fixtures__/rewrite-eval-report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  const passed = report.filter((r) => r.status === 'PASS').length;
  const strict = report.filter((r) => r.level === 'moderate' || r.level === 'firm');
  const strictPass = strict.filter((r) => r.status === 'PASS').length;
  const strictPct = ((100 * strictPass) / strict.length).toFixed(1);
  console.log(`\n${passed}/${report.length} checks passed (all modes)`);
  console.log(`Moderate+firm: ${strictPass}/${strict.length} (${strictPct}%)`);
  console.log(`Report: ${outPath}`);
  const target = Number(process.env.EVAL_TARGET_PCT ?? 95);
  const ok =
    passed === report.length ||
    (strictPass / strict.length) * 100 >= target;
  process.exit(ok ? 0 : 1);
}

main();
