import type { LearnedPreference } from '@/lib/types';

const STORAGE_KEY = 'conflict-buddy-style-preferences';
const MAX_RULES = 24;

export function loadLearnedPreferences(): LearnedPreference[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LearnedPreference[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLearnedPreferences(rules: LearnedPreference[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules.slice(0, MAX_RULES)));
}

export function addLearnedPreferences(
  incoming: LearnedPreference[]
): LearnedPreference[] {
  if (incoming.length === 0) return loadLearnedPreferences();

  const existing = loadLearnedPreferences();
  const merged = [...incoming, ...existing];
  const seen = new Set<string>();
  const deduped: LearnedPreference[] = [];

  for (const rule of merged) {
    const key = rule.text.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(rule);
    if (deduped.length >= MAX_RULES) break;
  }

  saveLearnedPreferences(deduped);
  return deduped;
}

export function clearLearnedPreferences(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function formatPreferencesForPrompt(rules: LearnedPreference[]): string[] {
  if (rules.length === 0) return [];
  return rules.map((r) => r.text);
}

export function appendLearnedPreferencesBlock(
  userPrompt: string,
  rules: string[],
  lang: 'nl' | 'en'
): string {
  if (!rules.length) return userPrompt;
  const header =
    lang === 'nl'
      ? '\n\nGeleerde schrijfvoorkeuren van deze gebruiker (volg tenzij in strijd met de regels hierboven):\n'
      : '\n\nLearned style preferences from this user (follow unless they conflict with rules above):\n';
  const lines = rules.map((r) => `• ${r}`).join('\n');
  return `${userPrompt}${header}${lines}`;
}
