export const brand = {
  name: "Vakilat",
  assistant: "Vidhi AI",
  appHref: "/dashboard",
  signInHref: "/sign-in",
  signUpHref: "/sign-up",
};

export const products = {
  caseLaw: { name: "Case Law Search", href: "/case-law/supreme-court" },
  bareActs: { name: "Bare Acts", href: "/bare-acts/central" },
  codeConverter: { name: "Code Converter", href: "/code-converter/ipc-bns" },
  draftStudio: { name: "Draft Studio", href: "/draft-studio" },
  glossary: { name: "Legal Glossary", href: "/glossary" },
  askJudgment: { name: "Ask a Judgment", href: "/vidhi" },
  translate: { name: "Translate", href: "/translate" },
  mootPractice: { name: "Moot Practice", href: "/moot-practice" },
  assistant: { name: brand.assistant, href: "/vidhi" },
};

export const tickerItems = [
  `Meet ${brand.assistant}, your research partner`,
  "Read any judgment in minutes",
  "Ask questions in plain language",
  "Every answer cites its source",
  "Draft filings from smart templates",
  "Practise arguments before a virtual bench",
];

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Plans", href: "/plans" },
];

export const moreItems = [
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Join Us", href: "/join-us" },
  { label: "Help Centre", href: "/help" },
];

export const languages = [
  { code: "EN", native: "English" },
  { code: "HI", native: "हिंदी" },
  { code: "TA", native: "தமிழ்" },
  { code: "TE", native: "తెలుగు" },
  { code: "BN", native: "বাংলা" },
  { code: "GU", native: "ગુજરાતી" },
  { code: "MR", native: "मराठी" },
  { code: "KN", native: "ಕನ್ನಡ" },
  { code: "ML", native: "മലയാളം" },
  { code: "PA", native: "ਪੰਜਾਬੀ" },
  { code: "OR", native: "ଓଡ଼ିଆ" },
  { code: "AS", native: "অসমীয়া" },
];

// Placeholder figures: replace with real corpus counts before launch.
export const stats = [
  { value: 15, suffix: "M+", label: "Judgments indexed" },
  { value: 10, suffix: "K+", label: "Central & State Acts" },
  { value: 12, suffix: "+", label: "AI tools" },
  { value: 12, suffix: "", label: "Indian languages" },
];

// Placeholder testimonials: replace with real, consented quotes before launch.
export const testimonials = [
  {
    quote:
      "Research that used to eat my whole evening now takes a coffee break. The summaries are sharp enough to brief a client from.",
    name: "Advocate",
    role: "District Court, Pune",
  },
  {
    quote:
      "I ask Vidhi in Hindi, get the relevant precedents in English, and the citations check out. That is the whole job, done faster.",
    name: "Litigation Associate",
    role: "Delhi High Court",
  },
  {
    quote:
      "The BNS to IPC mapping alone saved our chambers days of cross-referencing after the new criminal laws came in.",
    name: "Senior Counsel",
    role: "Criminal Practice, Ahmedabad",
  },
  {
    quote:
      "Drafting templates give my juniors a solid first version, so review time goes into strategy instead of formatting.",
    name: "Managing Partner",
    role: "Boutique Law Firm, Bengaluru",
  },
  {
    quote:
      "Translation of regional-language orders is accurate enough that I rarely need to send them out anymore.",
    name: "Government Pleader",
    role: "Gujarat",
  },
  {
    quote:
      "Moot Practice is the closest thing to a real hearing without needing a bench. My students love it.",
    name: "Assistant Professor",
    role: "National Law University",
  },
];

export const whyPoints = [
  {
    title: "Instant Research",
    body: "Find judgments and sections in one to three clicks.",
  },
  {
    title: "Research in Your Language",
    body: "Speak or type your query in any major Indian language.",
  },
  {
    title: "Judgment Summaries",
    body: "The holding, the ratio and the facts in a few lines.",
  },
];

export const journalPosts = [
  {
    slug: "ai-legal-research-india-guide",
    category: "AI & Legal Tech",
    title: "A practical guide to AI-assisted legal research in India",
    excerpt:
      "How to search across Supreme Court and High Court judgments, verify citations and fold AI into your daily practice safely.",
    date: "Oct 2026",
  },
  {
    slug: "bns-bnss-bsa-transition",
    category: "Criminal Law",
    title: "BNS, BNSS and BSA: mapping the old codes to the new",
    excerpt:
      "A section-by-section way to think about the transition from IPC, CrPC and the Evidence Act, with the traps to watch for.",
    date: "Sep 2026",
  },
  {
    slug: "dpdp-act-for-lawyers",
    category: "Data Privacy",
    title: "The DPDP Act and your client files",
    excerpt:
      "What the Digital Personal Data Protection Act means for chambers that store, share or process client data with software.",
    date: "Aug 2026",
  },
  {
    slug: "ai-ethics-for-advocates",
    category: "Professional Ethics",
    title: "Using AI without outsourcing your judgment",
    excerpt:
      "Competence, confidentiality and candour to the court: a checklist for advocates adopting AI tools.",
    date: "Jul 2026",
  },
  {
    slug: "drafting-with-templates",
    category: "Legal Drafting",
    title: "Faster first drafts with structured templates",
    excerpt:
      "Why starting from a clause library beats starting from a blank page, and how to keep drafts consistent across a team.",
    date: "Jun 2026",
  },
  {
    slug: "regional-language-research",
    category: "Access to Justice",
    title: "Legal research beyond English",
    excerpt:
      "How multilingual search and translation open up case law for practitioners working in regional languages.",
    date: "May 2026",
  },
];

export const faqs = [
  {
    q: "What is Vakilat?",
    a: "Vakilat is an AI research desk for Indian law. It brings judgments, bare Acts, drafting, translation and an AI research assistant into one place so you can go from question to cited answer quickly.",
  },
  {
    q: "Who is Vakilat for?",
    a: "Advocates, law firms, in-house teams, government counsel, judges' clerks, law students and anyone who needs reliable access to Indian legal material.",
  },
  {
    q: "Is Vakilat free to use?",
    a: "Yes, you can start on the free plan with core research features. Paid plans unlock higher AI limits, drafting and team features.",
  },
  {
    q: "Is my data secure?",
    a: "Your documents and chats are encrypted in transit and at rest, are never used to train public models, and can be deleted from your account at any time.",
  },
  {
    q: "Which languages are supported?",
    a: "You can search, chat and translate in English and major Indian languages including Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi, Odia and Assamese.",
  },
  {
    q: `What is ${brand.assistant}?`,
    a: `${brand.assistant} is the built-in research partner. Ask questions in plain language and it answers with references to the judgments and sections it relied on, so you can verify every point.`,
  },
];

const link = (p: { name: string; href: string }) => ({ label: p.name, href: p.href });

export const footerColumns = [
  {
    title: "Research",
    links: [products.caseLaw, products.bareActs, products.codeConverter, products.glossary].map(link),
  },
  {
    title: "AI Tools",
    links: [
      products.assistant,
      products.askJudgment,
      products.draftStudio,
      products.translate,
      products.mootPractice,
    ].map(link),
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Join Us", href: "/join-us" },
      { label: "Journal", href: "/journal" },
      { label: "Help Centre", href: "/help" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms of Use", href: "/legal/terms" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Refunds", href: "/legal/refunds" },
    ],
  },
];

export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const professions = [
  "Advocate",
  "Law firm partner or associate",
  "In-house counsel",
  "Government counsel or prosecutor",
  "Judicial officer or law clerk",
  "Law student",
  "Academic or researcher",
  "Legal professional (other)",
  "Not a legal professional",
];

export const accountTypes = [
  "Legal professional",
  "Law student",
  "Academic institution",
  "Individual / other",
];
