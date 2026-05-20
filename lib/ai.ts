import OpenAI from 'openai';

export type Lang = 'nl' | 'en';

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('MISSING_API_KEY');
  return new OpenAI({ apiKey });
}

export function formatDate(dateString?: string) {
  const d = dateString ? new Date(dateString) : new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function detectLanguage(text: string): Lang {
  const lower = ` ${text.toLowerCase()} `;
  const nlHints = [
    ' de ', ' het ', ' een ', ' ik ', ' mijn ', ' niet ', ' was ', ' zijn ',
    ' moeder', ' vader', ' afspraak', ' kind',
  ];
  const enHints = [
    ' the ', ' my ', ' your ', ' not ', ' was ', ' mother', ' father',
    ' child', ' appointment',
  ];
  const nlScore = nlHints.filter((w) => lower.includes(w)).length;
  const enScore = enHints.filter((w) => lower.includes(w)).length;
  return nlScore >= enScore ? 'nl' : 'en';
}

export function parseAiJson(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(payload) as Record<string, unknown>;
}

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}

export function globalRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
ALGEMENE REGELS:
- Schrijfcoach voor co-ouderschap — geen juridisch advies of therapie.
- Beknopt, natuurlijk, realistisch; geen formele zakelijke brief.
- Herhaal ruwe invoer niet letterlijk; scheid feiten van interpretatie.
- Geen emotionele framing, labels, schuld of juridische dreigementen.
- Geen AI-clichés of escape clauses ("als dat mogelijk is", "tenzij anders besproken", "zodat we het makkelijker kunnen houden", "ik vind het belangrijk dat", "ik verwacht dat we", "dit roept vragen op").
- Nederlands bij Nederlandse invoer — spreektaal, geen vertaling of beleidstaal.
- Geen onnatuurlijke constructies: niet "open doen" (wel: "de deur openen", "de hoofdingang openen", "deur opendoen"); niet "aan de andere kant van de flat open doen".
- Behoud woorden uit de invoer voor locaties (bijv. "achterzijde") in plaats van vreemde parafrases.
- Acties in logische volgorde, korte zinnen: "Je kwam aanrijden, ging via de achterzijde naar binnen en opende daarna de hoofdingang."
- BEHOUD kernfeiten uit de invoer: tijd/plaats, wat er gebeurde, herhaling/patroon (bijv. "meerdere keren", "bijna elke overdracht") als de gebruiker dat noemt — niet weglaten om korter te zijn.
- OVERDRACHT-MECHANIEK: als de gebruiker uitlegt HOE de overdracht werkt (hoofdingang, deur, toegang tot flat, op tijd aan de deur staan): dat niet versimpelen tot alleen "was er niet". Formuleer wat de gebruiker bedoelt: overdracht op afgesproken tijd niet mogelijk / niet op tijd aan de deur — met de genoemde reden (toegang, deur, wachten).
- Verzin geen details die niet in de invoer staan (bijv. "pas om 10 aangekomen" als de gebruiker dat niet schreef).
- Geen vage meta-zinnen: "het lijkt alsof er inconsistentie is", "duidelijker over zijn", "makkelijker maken voor [kind]" zonder concrete inhoud.
- ROLEN EN HANDELINGEN: als de gebruiker beschrijft wie wat doet (openen, brengen, ophalen, toegang geven): die rollen niet omdraaien. Niet "ik kon X niet" als de gebruiker bedoelt "jij deed X niet / jij moet X doen zodat ik Y kan". Volg de invoer; bij twijfel neutraal: "zonder [door andere partij vereiste actie] kon ik [gevolg] niet".
- TIJDSKETEN: vroege aankomst + afgesproken tijdstip + doel (aan deur staan) gelden in ALLE outputvelden — niet alleen in de log.
- GEEN HERHALING IN ÉÉN VELD: elk feit maximaal één keer noemen. Niet opnieuw "vies terug" + "zelf wassen" als dat al in de kledingpassage staat; scheiden↔kleding in één korte koppelzin zonder dezelfde details te herhalen. Slotalinea = alleen vraag/verwachting, geen feiten herkauwen.
`.trim();
  }
  return `
GLOBAL RULES:
- Co-parenting writing coach — not legal advice or therapy.
- Concise, natural, realistic; not corporate/formal letters.
- Do not repeat raw input verbatim; separate facts from interpretation.
- No emotional framing, labels, blame or legal threats.
- No AI clichés or escape clauses ("if possible", "unless discussed otherwise", "so we can keep things easy", "I think it's important that", "I expect that we", "this raises questions about").
- English for English input — natural spoken phrasing, not translationese.
- No awkward calques; keep the user's location words; short sentences for action sequences.
- KEEP core facts from input: time/place, what happened, repetition/pattern (e.g. "several times", "almost every handover") when the user states it — do not drop to shorten.
- HANDOVER MECHANICS: if the user explains HOW handover works (main entrance, door access, being at the apartment door on time): do not collapse to only "was not there". State what the user means: handover at agreed time not possible / not at the door on time — with the reason they gave (access, door, waiting).
- Do not invent details not in the input (e.g. "arrived only at 10" if the user did not write that).
- No vague meta lines: "there seems to be inconsistency", "be clearer about", "make it easier for [child]" without concrete content.
- ROLES AND ACTIONS: when the user describes who does what (opens, brings, picks up, grants access): do not invert roles. Do not write "I could not X" when the user means "you did not do X / you must do X so I can Y". Follow the input; if unsure, stay neutral: "without [action required from other party] I could not [outcome]".
- TIME CHAIN: early arrival + agreed time + purpose (being at the door) apply in ALL output fields — not only in the log.
- NO REPETITION WITHIN ONE FIELD: state each fact once. Do not repeat "dirty return" + "wash it yourself" if already in the clothing paragraph; link separation↔clothing in one short bridge sentence without duplicating details. Closing = ask/expectation only, not restating facts.
`.trim();
}

export function processMechanicsRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
PROCES / TOEGANG (algemeen — niet alleen deuren):
- Bewaar de keten zoals de gebruiker die beschrijft: wie moet wat doen → wat kon de gebruiker daardoor wel/niet.
- Verschil: "niet aanwezig" vs "overdracht/ophaalmoment niet op tijd mogelijk" — volg de invoer, niet je eigen kortere versie.
- FOUT: handeling van de andere partij aan de gebruiker toeschrijven (bijv. invoer: "zij moet de hoofdingang openen" → output: "ik kon de deur niet openen").
- GOED: handeling bij de juiste partij ("jij moet / kon de hoofdingang openen zodat ik …", "zonder toegang kon ik niet op tijd overdragen").
- Algemeen toepasbaar: sleutels, intercom, schoolpoort, parkeerplaats, afspraaklocatie — altijd wie-wat-bewaren.
- Verzendbaar: liever "ik kon [kind] niet op tijd overdragen omdat [toegang/afspraak niet op tijd mogelijk was]" dan alleen "je was er niet", als de invoer dat zo bedoelt.
- VROEGE AANKOMST + AFSPREEKTIJD: als de gebruiker zegt dat hij vóór het afgesproken tijdstip er was om op dat tijdstip aan de deur/overdracht te kunnen zijn (bijv. "5 minuten voor 10 bij de flat zodat ik om 10 aan de deur sta"):
  • BEWAAR in elk veld (de-escalated, boundary, court-safe, log, key facts): vroege tijd + doel (om [tijd] aan deur) + wat de andere partij moet doen + gevolg.
  • FOUT: alles terugbrengen tot "om 10 uur was ik bij je flat / je was niet thuis" — dat negeert waarom de gebruiker eerder kwam.
  • GOED: "Ik was al rond [vroege tijd] bij je flat om om [afspraaktijd] aan je deur te staan; je opende de hoofdingang niet op tijd, waardoor ik [kind] niet om [afspraaktijd] kon overdragen."
  • "Niet thuis" alleen gebruiken als de gebruiker dat zo zegt; niet als vervanging voor "overdracht om [tijd] niet mogelijk".
- WACHTEN MET KIND: als de gebruiker aangeeft dat hij met het kind ter plaatse was en moest wachten omdat de andere partij niet thuis/niet beschikbaar was: dat is vaak de kern — niet alleen "deur niet op tijd".
  • BEWAAR: met [kind] bij flat/afspraakplek + andere partij niet thuis/niet bereikbaar + wachten + overdracht niet op tijd.
  • FOUT: alleen "deur niet op tijd geopend" als de gebruiker vooral bedoelt "zij was er niet terwijl wij daar stonden te wachten".
  • GOED: "ik stond met Joa bij je flat te wachten; je was (nog) niet thuis / we konden niet op tijd overdragen omdat …"
`.trim();
  }
  return `
PROCESS / ACCESS (general — not only doors):
- Keep the chain as the user describes it: who must do what → what the user could/could not do as a result.
- Distinguish "not present" vs "handover/pickup not possible on time" — follow the input, not your own shorter version.
- WRONG: attributing the other party's action to the user (e.g. input: "she must open the main entrance" → output: "I could not open the door").
- RIGHT: action with the right party ("you needed to / could open the entrance so I could …", "without access I could not hand over on time").
- Applies broadly: keys, intercom, school gate, meeting point — always preserve who-does-what.
- In sendable text: prefer "I could not hand over [child] on time because [access/agreed handover was not possible on time]" over only "you were not there" when that is what the input means.
- EARLY ARRIVAL + AGREED TIME: if the user says they arrived before the agreed time so they could be at the door/handover at that time (e.g. "5 minutes before 10 at the flat so I could be at her door at 10"):
  • KEEP in every field: early time + purpose (to be at door by [time]) + what the other party must do + outcome.
  • WRONG: collapsing to only "at 10 I was at your flat / you were not home" — that drops why they came early.
  • RIGHT: "I was already at your flat around [early time] to be at your door at [agreed time]; you did not open the main entrance in time, so I could not hand over [child] at [agreed time]."
- WAITING WITH CHILD: if the user was on site with the child and had to wait because the other party was not home/unavailable, that is often the core — not only "door not opened on time".
  • KEEP: with [child] at flat/meeting point + other party not home/unavailable + waiting + handover not on time.
  • WRONG: only "door not opened in time" when the user mainly means "she was not there while we waited".
`.trim();
}

/** @deprecated alias */
export const handoverMechanicsRules = processMechanicsRules;

export function separationClothingRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
SCHEIDEN ↔ KLEDING (verplicht in de-escalated + boundary als in invoer):
- Als de gebruiker schrijft dat de andere partij alles wil scheiden MAAR Joa in kleren loopt die de gebruiker koopt (en/of niet wast): dit NOOIT weglaten — het hoort bij het broek-incident, niet bij KGB.
- KGB / kindgebonden budget / financieel = apart patroon-voorbeeld → NIET in verzendbare berichten (tenzij gebruiker alleen daarover schrijft).
- Eerst kleding FEITELIJK in één korte passage: schoon meegebracht → vies terug → wat de andere partij zei (wassen zelf / gedragen). Daarna ÉÉN koppelzin scheiden↔kleding zonder vlekken/wassen opnieuw te noemen.
- GOED koppelzin: "Je geeft aan alles te willen scheiden, maar Joa loopt in kleren die ik voor hem koop."
- FOUT: dezelfde broek/vlekken/wassen-zin nogmaals in de scheiden-zin ("…en de broek kwam vies terug terwijl je zei dat ik hem zelf moest wassen") als dat al hierboven staat.
- Afsluiting "Wil je hier rekening mee houden …" = alleen vraag (overdracht + kleding); geen feiten uit de body herhalen.
`.trim();
  }
  return `
SEPARATION ↔ CLOTHING (required in de-escalated + boundary when in input):
- If the user says the other party wants to separate everything BUT the child wears clothes the user buys (and/or not washed): NEVER omit — tied to the pants incident, not child benefit.
- Child benefit / budget / financial = separate pattern example → omit from sendable messages unless that is the sole topic.
- First one short clothing paragraph: brought clean → returned dirty → what they said (wash yourself / worn). Then ONE bridge sentence on separation↔clothing without repeating stains/wash.
- GOOD bridge: "You say you want everything separate, but [child] wears clothes I buy for him."
- WRONG: repeat dirty pants / wash-yourself in the bridge if already stated above.
- Closing ask covers handover AND clothing only — no restating body facts.
`.trim();
}

export function deEscalatedRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
DE-ESCALATED (verzendbaar bericht — zachtst):
- Alle onderwerpen uit de invoer (overdracht + kleding/spullen + herhaling + scheiden/spullen-tegenstrijdigheid als genoemd).
- Compact: geen dubbele zinnen over hetzelfde (bijv. vlekken én "vies terug" én "zelf wassen" drie keer). Elk onderwerp één keer uitwerken, dan door naar het volgende.
- Patroon/herhaling: één korte rustige zin — niet weglaten.
- Start met "Hey [naam]," als de gebruiker de andere partij bij naam noemt of een informeel bericht bedoelt.
- Afsluiting: na de feiten één zachte, concrete vraag of verwachting (overdracht op tijd, toegang/deur, kleding schoon terug) — niet alleen klachten + kale groet.
- Natuurlijk Nederlands: "Wil je hier rekening mee houden bij de volgende overdracht?" / "Kun je erop letten dat …?" — NIET stijf: "Graag houd je hier rekening mee bij …".
- Vermijd uitnodiging tot eindeloos debat: liever geen "Laat me weten of we dat zo kunnen afspreken". Daarna: "Groet,".
- Geen "Dank je" na een reeks klachten (klinkt koud); geen "ik vind het belangrijk dat we samen werken".
- Geen preken, geen "ik verwacht dat", geen juridische toon.
${separationClothingRules(lang)}
${handoverMechanicsRules(lang)}
`.trim();
  }
  return `
DE-ESCALATED (sendable message — softest):
- All topics from input (handover + clothing/items + repetition + separation/items inconsistency if mentioned).
- Compact: no saying the same thing twice (e.g. stains, "came back dirty", and "wash it yourself" in three places). Each topic once, then move on.
- Pattern/repetition: one short calm sentence — do not omit.
- Open with "Hey [name]," when the user names the other party or intends an informal message.
- Closing: after the facts, one soft concrete ask or invitation (on-time handover, access/door, clean clothing back) — not only complaints then "Have a nice day" with no request.
- Example: "Could you keep this in mind for the next handover?" / "Please make sure …" — not stiff corporate phrasing. Avoid "Let me know if we can agree on that." Then: "Groet,".
- No bare "Thanks" after complaints; no "I think it's important we work together".
- No lecturing, no "I expect that", no legal tone.
${separationClothingRules(lang)}
${handoverMechanicsRules(lang)}
`.trim();
}

export function boundaryRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
BOUNDARY (verzendbaar — duidelijker, NIET harder of kouder dan de-escalated):
- Zelfde feiten als de-escalated: niets weglaten (herhaling, vieze broek, "zelf wassen", scheiden vs. spullen gebruiken).
- Zelfde toon: nog steeds een bericht aan de andere ouder, geen brief aan een rechter.
- Start met "Hey [naam]," tenzij de gebruiker expliciet formeel wil.
- Verschil met de-escalated: de grens/verwachting iets directer ("graag", "het zou helpen als", "ik reken erop dat") — NIET "ik verwacht dat we", NIET zonder begroeting, NIET korter door details te schrappen.
- Geen beschuldigende slotzinnen; wel duidelijke afspraak over overdracht én kleding/spullen in redelijke staat.
- Niet formeler maken door "jouw" → afstandelijker taalgebruik; blijf menselijk.
${separationClothingRules(lang)}
${handoverMechanicsRules(lang)}
`.trim();
  }
  return `
BOUNDARY (sendable — clearer, NOT harsher or colder than de-escalated):
- Same facts as de-escalated: do not drop repetition, dirty item, "wash it yourself", separation vs. using other's items.
- Same tone: still a message to the other parent, not a letter to a judge.
- Open with "Hey [name]," unless the user clearly wants formal.
- Difference from de-escalated: slightly clearer expectation ("please", "I'd appreciate if", "I need us to") — NOT "I expect that we", NOT no greeting, NOT shorter by cutting facts.
- No accusatory closing; clear agreement on handover AND items/clothing returned in reasonable condition.
- Do not sound colder by making language more formal or distant.
${separationClothingRules(lang)}
${handoverMechanicsRules(lang)}
`.trim();
}

export function documentationVoiceRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
STEM (log, court-safe, key facts):
- Schrijf vanuit de ouder die rapporteert: "ik" en de naam van de andere partij (bijv. Sasha) — NOOIT "de gebruiker", "de gebruiker was", "door de gebruiker".
- Geen robot-passief als het de leesbaarheid schaadt: liever "ik kon niet op tijd overdragen omdat Sasha de hoofdingang niet op tijd opende" dan alleen "de deur werd niet geopend" zonder wie.
- Court-safe: korte alinea of bullets in dezelfde stem (ik + naam), geen derde-persoons "de gebruiker"-rapport.
- Natuurlijk Nederlands, alsof de ouder zijn eigen dossier bijhoudt — niet een helpdesk-ticket.
`.trim();
  }
  return `
VOICE (log, court-safe, key facts):
- Write from the reporting parent: "I" and the other party's name — NEVER "the user", "the user was", "provided by the user".
- Avoid hollow passive voice when it hides who did what; prefer clear actors.
- Court-safe: short paragraph or bullets in the same voice (I + name), not third-person "the user" report.
- Natural language, like a parent keeping their own record — not a helpdesk ticket.
`.trim();
}

export function secondaryExamplesRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
ZIJLIJNEN / PATROON-VOORBEELDEN (bijv. kindgebonden budget):
- Herken signalen in de invoer: "een ander voorbeeld", "ook", "bijvoorbeeld", "zoals", "het komt selectief over" → dit zijn PATROON-ILLUSTRATIES, geen gebeurtenissen op de incidentdatum.
- Hoofdlijst log/court-safe: ALLEEN wat op de incidentdatum speelde (overdracht, broek, uitspraken die dag).
- KGB / budget / eerdere incidenten: NOOIT als gewone bullet naast "om 10:00 overdracht" — dat oogt random.
- Als je een patroon-voorbeeld toch opneemt: exact ÉÉN bullet, verplicht voorvoegsel:
  "Patroon (ander voorbeeld uit mijn invoer, niet op [incidentdatum]): …"
- Koppel aan het patroon dat de gebruiker noemt: bijv. scheiden willen ↔ niet delen van KGB terwijl ik de helft van de tijd zorg — niet los "budget" noemen zonder die koppeling.
- In de-escalated/boundary: geen KGB; WEL verplicht scheiden↔kleding als de gebruiker die koppeling maakt (zie separationClothingRules).
- Zet in omittedOrSoftened als je KGB niet in court-safe opneemt: "KGB genoemd als patroon-voorbeeld, niet als gebeurtenis op [datum]".
`.trim();
  }
  return `
SIDE ISSUES / PATTERN EXAMPLES (e.g. child benefit budget):
- Recognize input signals: "another example", "also", "for example", "such as", "comes across as selective" → PATTERN illustrations, not events on the incident date.
- Main log/court-safe list: ONLY what happened on the incident date (handover, clothing, statements that day).
- Benefits / budget / prior incidents: NEVER as a plain bullet next to "10:00 handover" — that looks random.
- If included: exactly ONE bullet, required prefix:
  "Pattern (other example from my input, not on [incident date]): …"
- Tie to the pattern the user stated — not a standalone budget bullet.
- In de-escalated/boundary: omit KGB unless the user made it the main point of THIS message.
- Note in omittedOrSoftened when KGB is excluded as a non-date pattern example.
`.trim();
}

export function courtSafeRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
COURT-SAFE (advocaat/mediator/hoorzitting):
- Alleen observeerbaar: wie, wanneer, waar, wat gebeurde, wat er gezegd werd (als de gebruiker dat rapporteert).
- Herhaling/patroon als feit: "Dit is herhaaldelijk / meerdere malen voorgekomen" als de gebruiker dat aangeeft.
- GEEN vage conclusies of psychologiseren: niet "dit roept vragen op", niet "zorg voor spullen", niet "onacceptabele staat" tenzij strikt beschrijvend (bijv. "niet schoon", "vies").
- Essentie bij tegenstrijdig gedrag: feitelijke reeks — partij wil scheiden; ik lever/wissel kleding; kleding vies terug; partij zegt dat ik moet wassen — zonder moraliserende slotzin.
- Geen juridische kwalificaties of diagnoses.
${documentationVoiceRules(lang)}
${secondaryExamplesRules(lang)}
${handoverMechanicsRules(lang)}
`.trim();
  }
  return `
COURT-SAFE (lawyer/mediator/hearing):
- Observable only: who, when, where, what happened, what was said (if user reported it).
- Repetition/pattern as fact when user states it: "This has occurred repeatedly / on multiple occasions".
- NO vague conclusions: not "this raises questions", not "care for belongings", avoid "unacceptable condition" unless purely descriptive ("not clean", "dirty").
- For inconsistent conduct: factual sequence — party wants separation; I provide clothing; returned dirty; party says I should wash — without a moralizing closing line.
- No legal labels or diagnoses.
${documentationVoiceRules(lang)}
${secondaryExamplesRules(lang)}
${handoverMechanicsRules(lang)}
`.trim();
}

export function logEntryRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
LOG ENTRY:
- Bullets: vroege aankomst (indien genoemd) + doel om op afgesproken tijd aan deur/overdracht te zijn; daarna overdracht/toegang (wie opende wat); herhaling; spullen/kleding; uitspraken andere partij.
- Minimaal twee tijd-bullets als de gebruiker vroeg én afspraaktijd noemt (bijv. 09:55 op locatie, 10:00 overdracht niet mogelijk).
- LAAT GEMELD / VERSCHOVEN AFSPRAAK: drie aparte feiten — (1) afgesproken tijd, (2) wanneer + wat de andere partij meldde over vertraging, (3) feitelijke tijd (bijv. gebracht om 19:20).
- FOUT: "Ik was om 17:40 op de hoogte dat de overdracht om 18:00 later zou zijn" — dat klinkt alsof 18:00 zelf "later" is; verwart melding met afspraak.
- GOED: "Afspraak: Joa om 18:00 brengen." / "Om 17:40 meldde Sasha dat ze later was en dat het waarschijnlijk rond 19:30 zou worden." / "Joa werd om 19:20 gebracht."
- Liever "Sasha meldde om …" dan "ik was op de hoogte dat …" tenzij de gebruiker expliciet schrijft dat hij iets al wist vóór het bericht.
${documentationVoiceRules(lang)}
${secondaryExamplesRules(lang)}
${handoverMechanicsRules(lang)}
`.trim();
  }
  return `
LOG ENTRY:
- Bullets: time, handover/access (who did what, on time yes/no), repetition if stated, items/clothing and condition, statements by the other party.
- LATE NOTICE / RESCHEDULE: three separate facts — (1) agreed time, (2) when + what the other party said about delay, (3) actual time (e.g. dropped off at 19:20).
- WRONG: "At 17:40 I was aware the 18:00 handover would be later" — conflates the message with the agreed slot.
- RIGHT: "Agreed: drop-off at 18:00." / "At 17:40 she messaged she would be late, probably around 19:30." / "Child was dropped off at 19:20."
- Prefer "She messaged at …" over "I was aware that …" unless the user explicitly had prior knowledge.
${documentationVoiceRules(lang)}
${secondaryExamplesRules(lang)}
${handoverMechanicsRules(lang)}
`.trim();
}

export function keyFactsRules(lang: Lang): string {
  if (lang === 'nl') {
    return `
KEY FACTS:
- Zelfde stem als log (ik + naam); geen "de gebruiker".
- Minstens één feit over vroege aankomst + doel (aan deur om [tijd]) als de gebruiker dat noemde — niet alleen "om 10:00 bij flat".
- Focus op incident-dag; patroon-voorbeelden (KGB e.d.) alleen als extra bullet indien genoemd, met patroon-context.
`.trim();
  }
  return `
KEY FACTS:
- Same voice as log (I + name); not "the user".
- Focus on incident day; pattern examples (benefits etc.) only as extra bullet if mentioned, with pattern context.
`.trim();
}

export function sectionFieldRules(
  lang: Lang,
  sectionKey: string
): string {
  switch (sectionKey) {
    case 'deEscalatedResponse':
      return deEscalatedRules(lang);
    case 'boundaryResponse':
      return boundaryRules(lang);
    case 'courtSafeVersion':
      return courtSafeRules(lang);
    case 'logEntry':
      return logEntryRules(lang);
    case 'keyFacts':
      return keyFactsRules(lang);
    default:
      return '';
  }
}

export async function runCompletion(systemPrompt: string, userPrompt: string) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.25,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  return completion.choices[0].message.content || '{}';
}

function missingApiKeyMessage(): string {
  if (process.env.NODE_ENV === 'development') {
    return (
      'OpenAI API key missing. Add OPENAI_API_KEY=sk-… to .env.local in the project root, then restart the dev server (npm run dev).'
    );
  }
  return (
    'OpenAI API key is not configured on the server. In Vercel: Project → Settings → Environment Variables → add OPENAI_API_KEY, then redeploy.'
  );
}

export function getErrorResponse(err: unknown) {
  if (err instanceof Error && err.message === 'MISSING_API_KEY') {
    return {
      status: 503,
      error: missingApiKeyMessage(),
    };
  }
  const cause =
    err instanceof Error && err.cause instanceof Error ? err.cause : null;
  const nestedCause =
    cause && 'cause' in cause && cause.cause instanceof Error
      ? cause.cause
      : null;
  const code =
    (nestedCause as { code?: string } | null)?.code ??
    (cause as { code?: string } | null)?.code;

  if (code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    return {
      status: 503,
      error: 'SSL error connecting to OpenAI. Restart with npm run dev.',
    };
  }

  if (err instanceof OpenAI.APIError) {
    if (err.status === 401) {
      return { status: 401, error: 'Invalid OpenAI API key.' };
    }
    if (err.status === 429) {
      return { status: 429, error: 'OpenAI rate limit reached. Try again shortly.' };
    }
    return {
      status: err.status ?? 502,
      error: err.message || 'OpenAI error.',
    };
  }

  if (err instanceof Error && err.message.includes('Connection error')) {
    return { status: 503, error: 'Could not connect to OpenAI.' };
  }

  return { status: 500, error: 'Something went wrong while generating.' };
}
