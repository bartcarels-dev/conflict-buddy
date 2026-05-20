export type DiffPart = {
  type: 'same' | 'remove' | 'add';
  text: string;
};

/** Tokenize keeping whitespace as separate tokens for readable diffs. */
function tokenize(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) ?? [];
}

function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

type Op = { type: 'same' | 'remove' | 'add'; text: string };

function buildOps(a: string[], b: string[]): Op[] {
  const dp = lcsTable(a, b);
  const ops: Op[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 'same', text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'add', text: b[j - 1] });
      j--;
    } else {
      ops.push({ type: 'remove', text: a[i - 1] });
      i--;
    }
  }

  ops.reverse();
  return ops;
}

function mergeOps(ops: Op[]): Op[] {
  const merged: Op[] = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) {
      last.text += op.text;
    } else {
      merged.push({ ...op });
    }
  }
  return merged;
}

/** Side-by-side word diff: left = original/current, right = proposed. */
export function diffTextSideBySide(
  leftText: string,
  rightText: string
): { left: DiffPart[]; right: DiffPart[] } {
  const a = tokenize(leftText);
  const b = tokenize(rightText);
  const ops = mergeOps(buildOps(a, b));

  const left: DiffPart[] = [];
  const right: DiffPart[] = [];

  for (const op of ops) {
    if (op.type === 'same') {
      left.push({ type: 'same', text: op.text });
      right.push({ type: 'same', text: op.text });
    } else if (op.type === 'remove') {
      left.push({ type: 'remove', text: op.text });
    } else {
      right.push({ type: 'add', text: op.text });
    }
  }

  return { left, right };
}

export function textsAreEqual(a: string, b: string): boolean {
  return a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim();
}
