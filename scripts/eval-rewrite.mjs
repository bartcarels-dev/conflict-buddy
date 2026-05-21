/**
 * Run with dev server: npm run dev
 * Then: npm run eval:rewrite
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(
  readFileSync(
    join(__dirname, '../lib/prompts/__fixtures__/nl-rewrite.json'),
    'utf8'
  )
);

const base = process.env.EVAL_URL ?? 'http://localhost:3000';

async function runFixture(f) {
  const res = await fetch(`${base}/api/improve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'rewrite',
      input: f.input,
      transformLevel: f.level ?? 'moderate',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  const out = String(data.output ?? '');
  const fails = [];

  for (const bad of f.mustNotContain ?? []) {
    if (out.toLowerCase().includes(bad.toLowerCase())) {
      fails.push(`still contains banned phrase: "${bad}"`);
    }
  }
  return { id: f.id, output: out, fails };
}

async function main() {
  console.log(`Evaluating ${fixtures.length} fixtures against ${base}\n`);
  let passed = 0;
  for (const f of fixtures) {
    try {
      const { id, output, fails } = await runFixture(f);
      if (fails.length === 0) {
        console.log(`✓ ${id}`);
        passed++;
      } else {
        console.log(`✗ ${id}`);
        fails.forEach((e) => console.log(`  - ${e}`));
        console.log(`  Output: ${output.slice(0, 200)}…\n`);
      }
    } catch (e) {
      console.log(`✗ ${f.id}: ${e.message}`);
    }
  }
  console.log(`\n${passed}/${fixtures.length} passed`);
  process.exit(passed === fixtures.length ? 0 : 1);
}

main();
