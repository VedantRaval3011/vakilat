import { brand, indianStates } from "./content";
import { converterPairs } from "./data/code-map";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const highCourts = [
  "Allahabad", "Andhra Pradesh", "Bombay", "Calcutta", "Chhattisgarh", "Delhi", "Gauhati",
  "Gujarat", "Himachal Pradesh", "Jammu & Kashmir and Ladakh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Madras", "Manipur", "Meghalaya", "Orissa", "Patna", "Punjab & Haryana",
  "Rajasthan", "Sikkim", "Telangana", "Tripura", "Uttarakhand",
].map((name) => ({ name: `${name} High Court`, slug: slugify(name) }));

export const states = indianStates.map((name) => ({ name, slug: slugify(name) }));

export const codePairs = converterPairs.map(({ slug, from, to }) => ({ slug, from, to }));

export const routes = {
  dashboard: brand.appHref,
  supremeCourt: "/case-law/supreme-court",
  highCourts: "/case-law/high-courts",
  highCourt: (slug: string) => `/case-law/high-courts/${slug}`,
  centralActs: "/bare-acts/central",
  stateActs: "/bare-acts/state",
  stateAct: (slug: string) => `/bare-acts/state/${slug}`,
  codeConverter: (slug: string) => `/code-converter/${slug}`,
  codeConverterSection: (pair: string, section: string) => `/code-converter/${pair}/${section}`,
  constitution: "/constitution",
  glossary: "/glossary",
  vidhi: "/vidhi",
  draftStudio: "/draft-studio",
  mootPractice: "/moot-practice",
  translate: "/translate",
  history: "/history",
  notes: "/notes",
  saved: "/saved",
  hearings: "/hearings",
  settings: "/settings",
  plans: "/plans",
};

export const protectedPrefixes = [
  routes.dashboard, "/case-law", "/bare-acts", "/code-converter", routes.constitution,
  routes.glossary, routes.vidhi, routes.draftStudio, routes.mootPractice, routes.translate,
  routes.history, routes.notes, routes.saved, routes.hearings, routes.settings,
];
