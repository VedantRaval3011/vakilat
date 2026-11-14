import { converterPairs } from "@/lib/data/code-map";
import { parts } from "@/lib/data/constitution";
import { routes } from "@/lib/navigation";

export type Source =
  | { kind: "section"; key: string; code: string; section: string; title?: string; href?: string }
  | { kind: "article"; key: string; number: string; heading?: string; href: string }
  | { kind: "act"; key: string; name: string; href: string }
  | { kind: "case"; key: string; name: string; href: string };

const codes: { name: string; pattern: string; pair?: string; side?: "old" | "new" }[] = [
  { name: "BNSS", pattern: "BNSS|Bharatiya Nagarik Suraksha Sanhita(?:,? 2023)?", pair: "crpc-bnss", side: "new" },
  { name: "BNS", pattern: "BNS|Bharatiya Nyaya Sanhita(?:,? 2023)?", pair: "ipc-bns", side: "new" },
  { name: "BSA", pattern: "BSA|Bharatiya Sakshya Adhiniyam(?:,? 2023)?", pair: "iea-bsa", side: "new" },
  { name: "IPC", pattern: "IPC|I\\.P\\.C\\.?|Indian Penal Code(?:,? 1860)?", pair: "ipc-bns", side: "old" },
  { name: "CrPC", pattern: "Cr\\.?\\s?P\\.?\\s?C\\.?|Code of Criminal Procedure(?:,? 1973)?", pair: "crpc-bnss", side: "old" },
  { name: "Evidence Act", pattern: "(?:Indian )?Evidence Act(?:,? 1872)?|IEA", pair: "iea-bsa", side: "old" },
  { name: "CPC", pattern: "CPC|C\\.P\\.C\\.?|Code of Civil Procedure(?:,? 1908)?" },
  { name: "NI Act", pattern: "N\\.?I\\.? Act|Negotiable Instruments Act(?:,? 1881)?" },
];

const sectionNo = "\\d+[A-Z]{0,2}(?:\\(\\d+[a-z]?\\))*(?:\\([a-z]{1,4}\\))?";
const sectionPattern = new RegExp(
  `\\b(?:Sections?|Secs?\\.|S\\.|u/s\\.?)\\s*(${sectionNo}(?:\\s*(?:,|and|&|to|/)\\s*${sectionNo})*)\\s*(?:of\\s+(?:the\\s+)?)?(${codes.map((c) => c.pattern).join("|")})\\b`,
  "gi",
);
const articlePattern = /\bArt(?:icle|s?\.)s?\s*(\d{1,3}[A-Z]{0,2})(?:\(\d+\))*/g;
const actPattern = /\b((?:The\s+)?[A-Z][A-Za-z()&'.\- ]{3,80}?\s(?:Act|Code|Sanhita|Adhiniyam|Rules|Order))\s*,?\s((?:18|19|20)\d{2})\b/g;
const casePattern =
  /\b([A-Z][A-Za-z.&'\-]*(?:\s+(?:[A-Z][A-Za-z.&'\-]*|of|and|&|the|for)){0,7})\s+v(?:s)?\.?\s+([A-Z][A-Za-z.&'\-]*(?:\s+(?:[A-Z][A-Za-z.&'\-]*|of|and|&|the|for)){0,7})\s*[,(]\s*\(?((?:19|20)\d{2})\)?/g;

const articleHeadings = new Map(parts.flatMap((p) => p.articles ?? []).map((a) => [a.number.toLowerCase(), a.heading]));

const search = (q: string) => `https://indiankanoon.org/search/?formInput=${encodeURIComponent(q)}`;

function lookupSection(codeName: string, section: string) {
  const code = codes.find((c) => c.name === codeName)!;
  if (!code.pair || !code.side) return { href: search(`section ${section} ${codeName}`) };
  const pair = converterPairs.find((p) => p.slug === code.pair)!;
  const base = section.replace(/\(.*$/, "");
  const entry =
    pair.entries.find((e) => e[code.side!]?.toLowerCase() === section.toLowerCase()) ??
    pair.entries.find((e) => e[code.side!]?.toLowerCase().replace(/\(.*$/, "") === base.toLowerCase());
  return {
    title: entry?.title,
    href: `${routes.codeConverter(pair.slug)}?${code.side}=${encodeURIComponent(entry ? entry[code.side!]! : base)}`,
  };
}

function codeFromMatch(raw: string) {
  return codes.find((c) => new RegExp(`^(?:${c.pattern})$`, "i").test(raw.trim()))?.name ?? raw.trim();
}

const clean = (s: string) => s.replace(/\*\*|__|`/g, "");

const stripLead = (s: string) =>
  s.replace(/^(?:(?:Under|In|See|Also|The|And|As|Per|Of|With|By|From|Read|Cf\.?|Vide|Following|Unlike|Like|Both|Then|Here|This)\s+)+/i, "").trim();

/** Statutes, articles, Acts and judgments cited in an answer, in order of first mention. */
export function extractSources(markdown: string): Source[] {
  const text = clean(markdown);
  const found = new Map<string, { source: Source; at: number }>();
  const add = (source: Source, at: number) => {
    if (!found.has(source.key)) found.set(source.key, { source, at });
  };

  for (const m of text.matchAll(sectionPattern)) {
    const code = codeFromMatch(m[2]);
    for (const section of m[1].split(/\s*(?:,|and|&|to|\/)\s*/)) {
      if (!section) continue;
      add({ kind: "section", key: `s:${code}:${section.toLowerCase()}`, code, section, ...lookupSection(code, section) }, m.index);
    }
  }

  for (const m of text.matchAll(articlePattern)) {
    const number = m[1];
    const heading = articleHeadings.get(number.toLowerCase());
    add(
      { kind: "article", key: `a:${number.toLowerCase()}`, number, heading, href: `${routes.constitution}#article-${number.toLowerCase()}` },
      m.index,
    );
  }

  for (const m of text.matchAll(actPattern)) {
    const act = stripLead(m[1]);
    if (act.split(/\s+/).length < 2 || /Sanhita|Adhiniyam|Penal Code|Criminal Procedure|Evidence Act/.test(act)) continue;
    const name = `${act}, ${m[2]}`;
    add({ kind: "act", key: `act:${name.toLowerCase()}`, name, href: search(name) }, m.index);
  }

  for (const m of text.matchAll(casePattern)) {
    const first = stripLead(m[1]);
    const second = m[2].trim();
    if (!first || /^(?:Section|Article)\b/.test(first)) continue;
    const name = `${first} v. ${second} (${m[3]})`;
    add({ kind: "case", key: `c:${name.toLowerCase()}`, name, href: search(`${first} v. ${second}`) }, m.index);
  }

  return [...found.values()].sort((a, b) => a.at - b.at).map((f) => f.source);
}
