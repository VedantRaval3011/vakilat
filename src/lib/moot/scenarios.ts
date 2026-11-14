export type MootScenario = {
  key: string;
  title: string;
  area: string;
  forum: string;
  sides: [string, string];
  facts: string;
  issues: string[];
};

export type BenchMode = "lenient" | "balanced" | "strict";

export type CaseSource = "generate" | "own" | "library";

export type MootSetup = {
  source?: CaseSource;
  scenario: string;
  title: string;
  forum: string;
  caseType?: string;
  side: string;
  opponent: string;
  facts: string;
  issues: string[];
  bench: BenchMode;
};

export const courtLevels = ["Trial court / Civil Judge", "Sessions Court", "High Court", "Supreme Court of India"] as const;

export const roles = ["Petitioner", "Respondent", "Appellant", "State / Government", "Accused", "Prosecution", "Plaintiff", "Defendant"] as const;

/** The side the AI argues when the user takes `role`. */
export const opposingRole: Record<(typeof roles)[number], string> = {
  Petitioner: "Respondent",
  Respondent: "Petitioner",
  Appellant: "Respondent",
  "State / Government": "Petitioner",
  Accused: "Prosecution",
  Prosecution: "Accused",
  Plaintiff: "Defendant",
  Defendant: "Plaintiff",
};

export const caseTypeSuggestions = ["Regular bail", "Anticipatory bail", "Writ petition", "Cheque dishonour (Section 138 NI Act)", "Divorce petition", "Recovery suit", "Criminal appeal", "Consumer complaint"];

/** Speaker labels the model writes at the start of each part of its reply. */
export const SPEAKERS = { bench: "BENCH:", opponent: "OPPOSING COUNSEL:" } as const;

export const benchModes: { key: BenchMode; label: string; blurb: string }[] = [
  { key: "lenient", label: "Patient", blurb: "Lets you develop arguments, with gentle questions" },
  { key: "balanced", label: "Balanced", blurb: "Regular questions, like a typical hearing" },
  { key: "strict", label: "Hot bench", blurb: "Frequent interruptions and hard questions" },
];

export const CUSTOM_KEY = "custom";

export const scenarios: MootScenario[] = [
  {
    key: "bail-cheating",
    title: "State v. Arjun Mehra",
    area: "Criminal · Bail",
    forum: "Court of the Sessions Judge, Saket, New Delhi",
    sides: ["Applicant (accused)", "State (prosecution)"],
    facts:
      "Arjun Mehra, 31, a software engineer, was arrested on 2 August 2026 on a complaint that he collected ₹14 lakh from six investors for a crypto trading scheme and stopped returning calls. FIR registered under Sections 318(4) (cheating) and 316(2) (criminal breach of trust) BNS. The chargesheet was filed on 20 October 2026. He has no prior record, lives with his parents and has offered to deposit ₹5 lakh. The prosecution says two more complainants have come forward and he may influence them.",
    issues: [
      "Whether the applicant should be granted regular bail under Section 483 BNSS after the chargesheet has been filed.",
      "Whether the offer to deposit money is relevant to bail in a cheating case.",
      "Whether there is a real risk of influencing witnesses.",
    ],
  },
  {
    key: "internet-shutdown",
    title: "Digital Rights Forum v. State of Arunachal Pradesh",
    area: "Constitutional · Writ",
    forum: "Supreme Court of India (Article 32)",
    sides: ["Petitioner", "Respondent (State)"],
    facts:
      "After protests over a dam project, the State suspended mobile internet in three districts for 47 days using orders under the Temporary Suspension of Telecom Services Rules issued under the Telecommunications Act, 2023. The orders were not published, gave no reasons beyond 'law and order', and were renewed every 15 days without review committee minutes being made public. Students, traders and hospitals say they were badly affected.",
    issues: [
      "Whether the prolonged suspension violates Articles 19(1)(a), 19(1)(g) and 21.",
      "Whether unpublished, unreasoned suspension orders satisfy the requirement of proportionality.",
      "What safeguards the Court should direct for future suspensions.",
    ],
  },
  {
    key: "liquidated-damages",
    title: "Brightline Infra Pvt. Ltd. v. Kaveri Steels Ltd.",
    area: "Civil · Contract",
    forum: "High Court of Karnataka (Commercial Appeal)",
    sides: ["Appellant (Brightline)", "Respondent (Kaveri Steels)"],
    facts:
      "Kaveri Steels agreed to supply 4,000 tonnes of TMT bars to Brightline by 31 March 2025. The contract fixed liquidated damages at 1% of order value per week of delay, capped at 10%. Supplies were completed 9 weeks late. Brightline deducted ₹2.7 crore as liquidated damages without proving actual loss. The Commercial Court held Brightline must prove loss and directed refund. Brightline appeals.",
    issues: [
      "Whether a party claiming liquidated damages under Section 74 of the Indian Contract Act must prove actual loss.",
      "Whether the clause is a genuine pre-estimate of damages or a penalty.",
      "Whether Brightline could deduct the amount unilaterally.",
    ],
  },
  {
    key: "medical-negligence",
    title: "Meena Iyer v. Sunrise Multispeciality Hospital",
    area: "Consumer · Medical negligence",
    forum: "State Consumer Disputes Redressal Commission, Tamil Nadu",
    sides: ["Complainant", "Opposite party (hospital)"],
    facts:
      "Meena Iyer, 52, underwent a laparoscopic gall bladder removal. A bile duct injury was noticed only on day four after she developed jaundice, and she needed two corrective surgeries. The consent form was in English, which she cannot read well, and did not mention bile duct injury as a risk. The hospital says bile duct injury is a known complication and the surgeon followed standard practice.",
    issues: [
      "Whether the hospital was negligent under the Bolam standard as applied in India.",
      "Whether the consent obtained was informed consent.",
      "Quantum of compensation.",
    ],
  },
  {
    key: "electronic-evidence",
    title: "Rakesh Yadav v. State of Uttar Pradesh",
    area: "Criminal · Appeal",
    forum: "High Court of Judicature at Allahabad (Criminal Appeal)",
    sides: ["Appellant (convict)", "State"],
    facts:
      "Rakesh Yadav was convicted of murder under Section 103(1) BNS. The main evidence was CCTV footage from a shop, copied to a pen drive by a police constable, and call records. No certificate under Section 63 of the Bharatiya Sakshya Adhiniyam (formerly Section 65B of the Evidence Act) was produced for the footage at trial; the prosecution says one can be filed now. The only eyewitness turned hostile.",
    issues: [
      "Whether the CCTV footage is admissible without a Section 63 BSA certificate.",
      "Whether the prosecution can be permitted to produce the certificate at the appellate stage.",
      "Whether the conviction can be sustained on the remaining evidence.",
    ],
  },
];

export const scenarioByKey = (key: string) => scenarios.find((s) => s.key === key);
