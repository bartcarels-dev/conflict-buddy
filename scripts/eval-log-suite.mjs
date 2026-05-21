/**
 * Run: npm run dev (separate terminal)
 * Then: npm run eval:log:suite
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { genericLogChecks } from './eval-log-checks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = process.env.EVAL_URL ?? 'http://localhost:3000';
const fixtures = JSON.parse(
  readFileSync(
    join(__dirname, '../lib/prompts/__fixtures__/log-eval-suite.json'),
    'utf8'
  )
);

async function buildLog(input, eventDate) {
  const res = await fetch(`${base}/api/improve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'log', input, eventDate }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return String(data.output ?? '');
}

async function main() {
  const report = [];
  console.log(`Evaluating ${fixtures.length} log cases\n`);

  for (const f of fixtures) {
    console.log(`\n=== ${f.id} [${f.category}] ===`);
    try {
      const output = await buildLog(f.input, f.eventDate);
      const fails = genericLogChecks(f.input, output, f);
      const status = fails.length === 0 ? 'PASS' : 'FAIL';
      console.log(`  [${status}]`);
      fails.forEach((e) => console.log(`      - ${e}`));
      console.log(`      ${output.slice(0, 140).replace(/\n/g, ' ')}…`);
      report.push({ id: f.id, category: f.category, status, fails, output });
    } catch (e) {
      console.log(`  [ERR] ${e.message}`);
      report.push({ id: f.id, status: 'ERR', error: e.message });
    }
  }

  const outPath = join(__dirname, '../lib/prompts/__fixtures__/log-eval-report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  const passed = report.filter((r) => r.status === 'PASS').length;
  const pct = ((100 * passed) / report.length).toFixed(1);
  console.log(`\n${passed}/${report.length} passed (${pct}%)`);
  console.log(`Report: ${outPath}`);
  const target = Number(process.env.EVAL_TARGET_PCT ?? 75);
  process.exit(passed / report.length >= target / 100 ? 0 : 1);
}

main();
