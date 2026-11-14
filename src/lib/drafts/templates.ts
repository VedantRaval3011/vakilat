export type DraftField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "number";
  required?: boolean;
  placeholder?: string;
  wide?: boolean;
};

export type DraftCategory = "Criminal" | "Notices" | "Civil & consumer" | "Documents";

export type DraftTemplate = {
  key: string;
  name: string;
  category: DraftCategory;
  blurb: string;
  fields: DraftField[];
  guidance: string;
};

export const draftLanguages = [
  "English",
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Urdu",
  "Assamese",
] as const;

/** Free-form chat drafting (describe the document; Vidhi asks follow-ups). */
export const GUIDED_TEMPLATE_KEY = "guided";

export const guidedSuggestions = [
  "Rental agreement for a flat in Mumbai",
  "Non-disclosure agreement for a startup",
  "Employment offer letter",
  "Legal notice for recovery of money",
  "Regular bail application after chargesheet",
] as const;

export const draftTemplates: DraftTemplate[] = [
  {
    key: GUIDED_TEMPLATE_KEY,
    name: "Guided draft",
    category: "Documents",
    blurb: "Describe the document in plain language. Vidhi asks a few questions, then drafts it.",
    fields: [],
    guidance:
      "Interview the advocate briefly, then produce a complete first draft of the document they described. Follow Indian drafting conventions.",
  },
  {
    key: "regular-bail",
    name: "Regular bail application",
    category: "Criminal",
    blurb: "Bail for an accused in custody, under Section 483 BNSS.",
    fields: [
      { name: "court", label: "Court", required: true, placeholder: "Court of the Sessions Judge, Saket, New Delhi" },
      { name: "applicant", label: "Applicant (accused)", required: true, placeholder: "Rahul Sharma, S/o Mahesh Sharma, aged 28" },
      { name: "address", label: "Applicant's address", placeholder: "H. No. 12, Lajpat Nagar, New Delhi" },
      { name: "fir", label: "FIR number and date", required: true, placeholder: "FIR No. 245/2026 dated 12.09.2026" },
      { name: "policeStation", label: "Police station", required: true, placeholder: "PS Malviya Nagar" },
      { name: "sections", label: "Sections", required: true, placeholder: "Sections 318(4), 316(2) BNS" },
      { name: "arrestDate", label: "Date of arrest", type: "date" },
      { name: "facts", label: "Brief facts of the case", type: "textarea", required: true, wide: true },
      { name: "grounds", label: "Grounds for bail", type: "textarea", wide: true, placeholder: "No prior record, chargesheet filed, parity with co-accused, sole earning member…" },
    ],
    guidance:
      "Draft a regular bail application under Section 483 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (formerly Section 439 CrPC) before the Sessions Court or High Court as named. Include cause title, memo of parties, brief facts, numbered grounds, undertaking to abide by conditions, prayer, verification and advocate's block. Address the triple test: flight risk, tampering with evidence and influencing witnesses.",
  },
  {
    key: "anticipatory-bail",
    name: "Anticipatory bail application",
    category: "Criminal",
    blurb: "Pre-arrest bail, under Section 482 BNSS.",
    fields: [
      { name: "court", label: "Court", required: true, placeholder: "Court of the Sessions Judge, Pune" },
      { name: "applicant", label: "Applicant", required: true, placeholder: "Sunita Patil, W/o Rajesh Patil, aged 41" },
      { name: "address", label: "Applicant's address" },
      { name: "fir", label: "FIR number and date (if registered)", placeholder: "FIR No. 88/2026 dated 02.10.2026, or 'apprehension of FIR'" },
      { name: "policeStation", label: "Police station", required: true },
      { name: "sections", label: "Sections alleged", required: true, placeholder: "Sections 85, 115(2) BNS" },
      { name: "facts", label: "Brief facts and reason for apprehension", type: "textarea", required: true, wide: true },
      { name: "grounds", label: "Grounds", type: "textarea", wide: true, placeholder: "False implication, roots in society, willing to join investigation…" },
    ],
    guidance:
      "Draft an anticipatory bail application under Section 482 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (formerly Section 438 CrPC). Include cause title, facts, numbered grounds, willingness to cooperate with investigation and abide by conditions under Section 482(2) BNSS, interim protection prayer, main prayer, verification and advocate's block.",
  },
  {
    key: "legal-notice",
    name: "Legal notice",
    category: "Notices",
    blurb: "A formal demand before filing a case: recovery, breach, defamation and more.",
    fields: [
      { name: "advocate", label: "Advocate (sender's counsel)", required: true, placeholder: "Adv. Priya Mehta, Chamber 214, Delhi High Court" },
      { name: "client", label: "On behalf of (client)", required: true, placeholder: "M/s Mehta Traders, through its proprietor Anil Mehta" },
      { name: "recipient", label: "To (recipient with address)", required: true, wide: true },
      { name: "subject", label: "Subject", required: true, placeholder: "Recovery of ₹4,50,000 towards unpaid invoices" },
      { name: "facts", label: "Facts", type: "textarea", required: true, wide: true },
      { name: "demand", label: "Demand", type: "textarea", required: true, wide: true, placeholder: "Pay ₹4,50,000 with 18% interest…" },
      { name: "days", label: "Days to comply", type: "number", placeholder: "15" },
    ],
    guidance:
      "Draft a legal notice on the advocate's letterhead format: reference number, date, mode of delivery (Registered Post A.D. / Speed Post / email), recipient, subject, 'Under instructions from and on behalf of my client…', numbered paragraphs of facts, the legal basis, a clear demand with a compliance period, consequences of non-compliance (civil/criminal proceedings at the recipient's cost), and a line that a copy is retained for further action.",
  },
  {
    key: "cheque-bounce-notice",
    name: "Cheque bounce notice",
    category: "Notices",
    blurb: "Statutory demand notice under Section 138 of the Negotiable Instruments Act.",
    fields: [
      { name: "advocate", label: "Advocate", required: true },
      { name: "payee", label: "Payee (your client)", required: true },
      { name: "drawer", label: "Drawer (with address)", required: true, wide: true },
      { name: "cheque", label: "Cheque number and date", required: true, placeholder: "No. 004512 dated 05.09.2026" },
      { name: "amount", label: "Amount (₹)", required: true, placeholder: "2,00,000" },
      { name: "bank", label: "Drawn on (bank and branch)", required: true },
      { name: "returnMemo", label: "Return memo date and reason", required: true, placeholder: "18.09.2026, 'Funds Insufficient'" },
      { name: "liability", label: "Debt or liability the cheque was given for", type: "textarea", required: true, wide: true },
    ],
    guidance:
      "Draft a demand notice under Section 138(b) of the Negotiable Instruments Act, 1881. It must state the legally enforceable debt, cheque details, presentation, dishonour with the return memo reason and date, and demand payment of the cheque amount within 15 days of receipt of the notice, failing which a complaint under Section 138 read with Section 142 will be filed. Note that the notice must be sent within 30 days of receiving the return memo.",
  },
  {
    key: "notice-reply",
    name: "Reply to legal notice",
    category: "Notices",
    blurb: "Para-wise reply denying or answering a notice you received.",
    fields: [
      { name: "advocate", label: "Advocate", required: true },
      { name: "client", label: "On behalf of (your client)", required: true },
      { name: "sender", label: "Notice sent by (with counsel)", required: true, wide: true },
      { name: "noticeDate", label: "Date of the notice received", type: "date", required: true },
      { name: "allegations", label: "What the notice alleges", type: "textarea", required: true, wide: true },
      { name: "reply", label: "Your client's version", type: "textarea", required: true, wide: true },
    ],
    guidance:
      "Draft a reply to a legal notice: reference to the notice and date, a general denial of all allegations not specifically admitted, para-wise replies, the client's true version of facts, any counter-demand, and a statement that the client reserves the right to take legal action. Keep the tone firm and professional.",
  },
  {
    key: "consumer-complaint",
    name: "Consumer complaint",
    category: "Civil & consumer",
    blurb: "Complaint before a District Consumer Commission, under the Consumer Protection Act, 2019.",
    fields: [
      { name: "commission", label: "Commission", required: true, placeholder: "District Consumer Disputes Redressal Commission, Bengaluru Urban" },
      { name: "complainant", label: "Complainant (with address)", required: true, wide: true },
      { name: "opposite", label: "Opposite party (with address)", required: true, wide: true },
      { name: "product", label: "Goods or service", required: true, placeholder: "Washing machine, Model X200" },
      { name: "paid", label: "Amount paid and date", required: true, placeholder: "₹38,500 on 14.03.2026" },
      { name: "deficiency", label: "Defect or deficiency in service", type: "textarea", required: true, wide: true },
      { name: "relief", label: "Relief sought", type: "textarea", wide: true, placeholder: "Refund, compensation of ₹50,000 for harassment, costs…" },
    ],
    guidance:
      "Draft a consumer complaint under Section 35 of the Consumer Protection Act, 2019 before the District Commission (pecuniary jurisdiction up to ₹50 lakh as revised). Include cause title, parties, jurisdiction (pecuniary and territorial), facts, deficiency in service / unfair trade practice, cause of action, limitation (within two years under Section 69), reliefs, list of documents, verification and an affidavit-in-support placeholder.",
  },
  {
    key: "rent-agreement",
    name: "Rent agreement",
    category: "Documents",
    blurb: "Residential leave and licence or 11-month rent agreement.",
    fields: [
      { name: "landlord", label: "Landlord / licensor (with address)", required: true, wide: true },
      { name: "tenant", label: "Tenant / licensee (with address)", required: true, wide: true },
      { name: "property", label: "Property address", required: true, wide: true },
      { name: "rent", label: "Monthly rent (₹)", required: true },
      { name: "deposit", label: "Security deposit (₹)", required: true },
      { name: "start", label: "Start date", type: "date", required: true },
      { name: "months", label: "Term (months)", type: "number", placeholder: "11" },
      { name: "terms", label: "Special terms", type: "textarea", wide: true, placeholder: "Lock-in 6 months, 5% annual increase, no pets…" },
    ],
    guidance:
      "Draft a residential rent / leave and licence agreement: parties, recitals, property description, term, rent and due date, security deposit and refund, maintenance and utilities, permitted use, restrictions on sub-letting, lock-in and notice period, termination, handover, police verification, stamp duty and registration note (registration mandatory for terms over 11 months, and for leave and licence in Maharashtra), signatures and two witnesses.",
  },
  {
    key: "affidavit",
    name: "General affidavit",
    category: "Documents",
    blurb: "Sworn statement for name change, address proof, income and similar purposes.",
    fields: [
      { name: "deponent", label: "Deponent", required: true, placeholder: "Anjali Verma, D/o Suresh Verma, aged 34" },
      { name: "address", label: "Address", required: true, wide: true },
      { name: "purpose", label: "Purpose", required: true, placeholder: "Change of name after marriage" },
      { name: "statements", label: "Statements to be sworn", type: "textarea", required: true, wide: true },
      { name: "place", label: "Place", placeholder: "Lucknow" },
    ],
    guidance:
      "Draft a general affidavit on non-judicial stamp paper: title, deponent's particulars, 'I, the above-named deponent, do hereby solemnly affirm and declare as under', numbered statements, verification stating the contents are true to the best of knowledge and belief and nothing material has been concealed, place, date, and a block for the Notary / Oath Commissioner attestation.",
  },
  {
    key: "vakalatnama",
    name: "Vakalatnama",
    category: "Documents",
    blurb: "Authority for an advocate to appear and act for a client.",
    fields: [
      { name: "court", label: "Court", required: true },
      { name: "caseTitle", label: "Case title and number", required: true, placeholder: "State v. Rahul Sharma, Bail Appln. No. 412/2026" },
      { name: "client", label: "Client (executant)", required: true },
      { name: "advocates", label: "Advocate(s) with enrolment numbers", required: true, wide: true, placeholder: "Adv. Priya Mehta (D/1234/2015)" },
    ],
    guidance:
      "Draft a vakalatnama in the standard Indian format: court and case title, 'I/We… do hereby appoint and retain…', powers to appear, plead, act, file documents, withdraw, compromise (subject to instructions), receive money, and engage other counsel, the client's undertaking to pay fees and not hold the advocate responsible for non-appearance due to non-payment, acceptance by the advocate, signatures, date and place.",
  },
];

export const templateByKey = (key: string) => draftTemplates.find((t) => t.key === key);

export const MAX_FIELD_CHARS = 4000;
