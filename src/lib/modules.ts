import {
  ArrowLeftRight,
  BookMarked,
  BookOpenText,
  CalendarClock,
  Gavel,
  History,
  Landmark,
  Languages,
  LayoutGrid,
  Library,
  NotebookPen,
  PenLine,
  Scale,
  Sparkles,
  SpellCheck2,
  type LucideIcon,
} from "lucide-react";
import { brand } from "./content";
import { routes } from "./navigation";

export type Module = {
  key: string;
  name: string;
  blurb: string;
  href: string;
  icon: LucideIcon;
};

export const researchModules: Module[] = [
  { key: "supreme-court", name: "Supreme Court", blurb: "Judgments of the apex court", href: routes.supremeCourt, icon: Landmark },
  { key: "high-courts", name: "High Courts", blurb: "All 25 High Courts", href: routes.highCourts, icon: Landmark },
  { key: "central-acts", name: "Central Acts", blurb: "Laws passed by Parliament", href: routes.centralActs, icon: BookOpenText },
  { key: "state-acts", name: "State Acts", blurb: "State and UT legislation", href: routes.stateActs, icon: Library },
  { key: "code-converter", name: "Code Converter", blurb: "IPC, CrPC, Evidence Act to the new codes", href: routes.codeConverter("ipc-bns"), icon: ArrowLeftRight },
  { key: "glossary", name: "Legal Glossary", blurb: "Maxims, terms and phrases", href: routes.glossary, icon: SpellCheck2 },
  { key: "constitution", name: "Constitution", blurb: "Preamble, Parts and Schedules", href: routes.constitution, icon: Scale },
];

export const aiModules: Module[] = [
  { key: "vidhi", name: brand.assistant, blurb: "Ask anything, get cited answers", href: routes.vidhi, icon: Sparkles },
  { key: "draft-studio", name: "Draft Studio", blurb: "Notices, petitions and agreements", href: routes.draftStudio, icon: PenLine },
  { key: "moot-practice", name: "Moot Practice", blurb: "Argue before a virtual bench", href: routes.mootPractice, icon: Gavel },
  { key: "translate", name: "Translate", blurb: "Legal documents across 12 languages", href: routes.translate, icon: Languages },
];

export const deskModules: Module[] = [
  { key: "notes", name: "Notes", blurb: "Your research notes", href: routes.notes, icon: NotebookPen },
  { key: "saved", name: "Saved", blurb: "Judgments and sections you saved", href: routes.saved, icon: BookMarked },
  { key: "hearings", name: "Hearings", blurb: "Your upcoming dates", href: routes.hearings, icon: CalendarClock },
];

export const historyModule: Module = {
  key: "history", name: "History", blurb: "Your recent searches and chats", href: routes.history, icon: History,
};

export const homeModule: Module = {
  key: "home", name: "Dashboard", blurb: "", href: routes.dashboard, icon: LayoutGrid,
};

export const quickBar: Module[] = [
  homeModule,
  aiModules[0],
  aiModules[1],
  aiModules[2],
  researchModules[5],
  aiModules[3],
  historyModule,
  ...deskModules,
];

export const allModules: Module[] = [...researchModules, ...aiModules, ...deskModules, historyModule];
