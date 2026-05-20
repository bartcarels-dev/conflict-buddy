import { NextResponse } from 'next/server';
import type { SectionKey } from '@/lib/types';
import {
  detectLanguage,
  getErrorResponse,
  globalRules,
  parseAiJson,
  runCompletion,
} from '@/lib/ai';

type Pair = {
  sectionKey: SectionKey;
  original: string;
  edited: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pairs = (body.pairs ?? []) as Pair[];

    if (!Array.isArray(pairs) || pairs.length === 0) {
      return NextResponse.json({ accepted: [], rejected: [] });
    }

    const sample = pairs.map((p) => p.edited).join(' ');
    const lang = detectLanguage(sample);

    const systemPrompt = `
Je extraheert schrijfvoorkeuren uit handmatige gebruikersedits (co-ouderschap, NL of EN).

${globalRules(lang)}

LEER ALLEEN stijl/woordkeuze/structuur die de gebruiker bewust koos — geen nieuwe feiten verzinnen.

NIET leren (zet in "rejected" met korte reden):
- beledigingen, dreigementen, juridische kwalificaties
- feiten die niet in "edited" staan
- subjectieve escalatie ("altijd", "nooit" tenzij in edited)
- iets dat in strijd is met de veiligheidsregels hierboven

WEL leren (korte regels voor toekomstige generatie), bijv.:
- "Liever 'niet thuis' dan alleen 'deur niet op tijd' als de gebruiker dat zo formuleert"
- "Behoud 'deed toen open' na achterzijde"
- "Liever 'vol vlekken' dan 'vies'"

Return valid JSON only:
{ "accepted": ["string"], "rejected": ["string"] }
Max 3 accepted rules per request totaal, beknopt (één zin per regel).
`.trim();

    const userPrompt = pairs
      .map(
        (p, i) => `
--- Paar ${i + 1} (${p.sectionKey}) ---
AI-versie:
${p.original}

Gebruikersversie:
${p.edited}
`
      )
      .join('\n');

    const raw = await runCompletion(systemPrompt, userPrompt);
    let parsed: { accepted?: unknown; rejected?: unknown };

    try {
      parsed = parseAiJson(raw) as { accepted?: unknown; rejected?: unknown };
    } catch {
      return NextResponse.json({ accepted: [], rejected: ['Could not parse'] });
    }

    const accepted = Array.isArray(parsed.accepted)
      ? parsed.accepted.map(String).filter(Boolean).slice(0, 5)
      : [];
    const rejected = Array.isArray(parsed.rejected)
      ? parsed.rejected.map(String).filter(Boolean)
      : [];

    return NextResponse.json({ accepted, rejected });
  } catch (err) {
    console.error('Error in /api/learn-from-edit:', err);
    const { status, error } = getErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
