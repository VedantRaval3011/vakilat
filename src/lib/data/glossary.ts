export const glossaryCategories = [
  "Latin maxims",
  "Writs",
  "Criminal procedure",
  "Civil procedure",
  "Evidence",
  "Constitutional",
  "General",
] as const;

export type GlossaryCategory = (typeof glossaryCategories)[number];

export type GlossaryTerm = {
  term: string;
  literal?: string;
  meaning: string;
  category: GlossaryCategory;
  reference?: string;
};

export const glossary: GlossaryTerm[] = [
  // Latin maxims
  { term: "Actus non facit reum nisi mens sit rea", literal: "An act does not make one guilty unless the mind is also guilty", meaning: "A person is not criminally liable for an act alone; a guilty mental state (mens rea) must usually accompany it.", category: "Latin maxims" },
  { term: "Audi alteram partem", literal: "Hear the other side", meaning: "A rule of natural justice: no one should be condemned or have a decision made against them without a fair hearing.", category: "Latin maxims" },
  { term: "Nemo judex in causa sua", literal: "No one should be a judge in their own cause", meaning: "A rule of natural justice against bias. A decision-maker must not have a personal interest in the matter.", category: "Latin maxims" },
  { term: "Nemo debet bis vexari pro una et eadem causa", literal: "No one should be vexed twice for the same cause", meaning: "The basis of the rule against double jeopardy and of res judicata.", category: "Latin maxims", reference: "Article 20(2), Constitution of India" },
  { term: "Ubi jus ibi remedium", literal: "Where there is a right, there is a remedy", meaning: "The law provides a remedy for the violation of every legal right.", category: "Latin maxims" },
  { term: "Ignorantia juris non excusat", literal: "Ignorance of the law is no excuse", meaning: "A person cannot escape liability by claiming they did not know the law. Ignorance of fact may, in some cases, be a defence.", category: "Latin maxims" },
  { term: "Volenti non fit injuria", literal: "To a willing person, no injury is done", meaning: "A defence in tort: a person who knowingly and voluntarily accepts a risk cannot later claim damages for the resulting harm.", category: "Latin maxims" },
  { term: "Damnum sine injuria", literal: "Damage without legal injury", meaning: "Actual loss caused without the violation of a legal right. It is not actionable.", category: "Latin maxims" },
  { term: "Injuria sine damno", literal: "Legal injury without damage", meaning: "Violation of a legal right without actual loss. It is actionable, as in Ashby v. White.", category: "Latin maxims" },
  { term: "Caveat emptor", literal: "Let the buyer beware", meaning: "The buyer is responsible for checking the quality and suitability of goods before purchase, subject to statutory exceptions.", category: "Latin maxims" },
  { term: "Stare decisis", literal: "To stand by things decided", meaning: "The doctrine of precedent: courts follow earlier decisions on the same point of law.", category: "Latin maxims", reference: "Article 141, Constitution of India" },
  { term: "Ratio decidendi", literal: "The reason for the decision", meaning: "The legal principle on which a case is decided. It is the binding part of a judgment.", category: "Latin maxims" },
  { term: "Obiter dictum", literal: "Said by the way", meaning: "A judge's remark that is not necessary for the decision. It is persuasive, not binding.", category: "Latin maxims" },
  { term: "Per incuriam", literal: "Through lack of care", meaning: "A decision given in ignorance of a binding statute or precedent. It does not bind later courts.", category: "Latin maxims" },
  { term: "Res judicata", literal: "A matter already judged", meaning: "A matter finally decided between the same parties by a competent court cannot be litigated again.", category: "Latin maxims", reference: "Section 11, Code of Civil Procedure, 1908" },
  { term: "Res sub judice", literal: "A matter under judgment", meaning: "Where a matter is already pending before a competent court, a later suit on the same issue between the same parties is stayed.", category: "Latin maxims", reference: "Section 10, Code of Civil Procedure, 1908" },
  { term: "Lis pendens", literal: "A pending suit", meaning: "Property that is the subject of a pending suit cannot be transferred so as to affect the rights of the parties to that suit.", category: "Latin maxims", reference: "Section 52, Transfer of Property Act, 1882" },
  { term: "Ex post facto", literal: "From a thing done afterwards", meaning: "A law that operates retrospectively. Criminal laws cannot punish an act that was not an offence when it was done.", category: "Latin maxims", reference: "Article 20(1), Constitution of India" },
  { term: "Doli incapax", literal: "Incapable of crime", meaning: "The presumption that a very young child cannot form criminal intent. Nothing done by a child under seven is an offence.", category: "Latin maxims", reference: "Section 20, Bharatiya Nyaya Sanhita, 2023" },
  { term: "Corpus delicti", literal: "The body of the crime", meaning: "The facts that prove a crime has actually been committed, as distinct from who committed it.", category: "Latin maxims" },
  { term: "Ab initio", literal: "From the beginning", meaning: "Used to describe something treated as invalid from the outset, such as a contract void ab initio.", category: "Latin maxims" },
  { term: "Bona fide", literal: "In good faith", meaning: "Genuine and honest, without intent to deceive.", category: "Latin maxims" },
  { term: "Mala fide", literal: "In bad faith", meaning: "With dishonest intent or an ulterior motive.", category: "Latin maxims" },
  { term: "Prima facie", literal: "At first sight", meaning: "Evidence or a case that appears sufficient unless rebutted.", category: "Latin maxims" },
  { term: "Inter alia", literal: "Among other things", meaning: "Used to show that what follows is part of a longer list.", category: "Latin maxims" },
  { term: "De facto", literal: "In fact", meaning: "Existing in practice, whether or not it is legally recognised.", category: "Latin maxims" },
  { term: "De jure", literal: "By law", meaning: "Existing by right or according to law.", category: "Latin maxims" },
  { term: "Ultra vires", literal: "Beyond the powers", meaning: "An act done beyond the legal authority of the person or body that did it. Such an act is void.", category: "Latin maxims" },
  { term: "In pari materia", literal: "On the same subject", meaning: "Statutes dealing with the same subject are read together to interpret each other.", category: "Latin maxims" },
  { term: "Functus officio", literal: "Having performed the office", meaning: "An authority that has made its final decision has no further power to revisit it.", category: "Latin maxims" },
  { term: "Suo motu", literal: "On its own motion", meaning: "Action taken by a court or authority on its own initiative, without a formal application.", category: "Latin maxims" },
  { term: "Sine die", literal: "Without a day", meaning: "Adjourned indefinitely, with no date fixed for the next hearing or sitting.", category: "Latin maxims" },
  { term: "Status quo", literal: "The existing state", meaning: "An order to keep things as they are until the court decides otherwise.", category: "Latin maxims" },
  { term: "Ex parte", literal: "From one side", meaning: "A proceeding or order made in the absence of the other party.", category: "Latin maxims" },
  { term: "Amicus curiae", literal: "Friend of the court", meaning: "A person, usually a senior advocate, appointed to assist the court on a point of law. They are not a party to the case.", category: "Latin maxims" },
  { term: "Locus standi", literal: "A place to stand", meaning: "The right of a person to bring a case before a court.", category: "Latin maxims" },
  { term: "Pro bono", literal: "For the public good", meaning: "Legal work done free of charge.", category: "Latin maxims" },
  { term: "Alibi", literal: "Elsewhere", meaning: "A defence that the accused was somewhere else when the offence was committed.", category: "Latin maxims" },

  // Writs
  { term: "Habeas corpus", literal: "You may have the body", meaning: "A writ requiring a detained person to be produced before the court so the legality of the detention can be examined.", category: "Writs", reference: "Articles 32 and 226, Constitution of India" },
  { term: "Mandamus", literal: "We command", meaning: "A writ directing a public authority to perform a public duty it has failed to perform.", category: "Writs", reference: "Articles 32 and 226, Constitution of India" },
  { term: "Certiorari", literal: "To be certified", meaning: "A writ issued by a higher court to quash an order passed by a lower court or tribunal without jurisdiction or in breach of natural justice.", category: "Writs", reference: "Articles 32 and 226, Constitution of India" },
  { term: "Prohibition", meaning: "A writ issued to a lower court or tribunal to stop it from continuing a proceeding outside its jurisdiction.", category: "Writs", reference: "Articles 32 and 226, Constitution of India" },
  { term: "Quo warranto", literal: "By what authority", meaning: "A writ requiring a person holding a public office to show by what right they hold it.", category: "Writs", reference: "Articles 32 and 226, Constitution of India" },

  // Criminal procedure
  { term: "First Information Report (FIR)", meaning: "The information about a cognizable offence first recorded by the police. It sets the criminal law in motion.", category: "Criminal procedure", reference: "Section 173, BNSS (formerly Section 154, CrPC)" },
  { term: "Zero FIR", meaning: "An FIR registered at any police station regardless of where the offence took place, then transferred to the station with jurisdiction.", category: "Criminal procedure", reference: "Section 173, BNSS" },
  { term: "Cognizable offence", meaning: "An offence for which the police may arrest without a warrant and start investigating without a Magistrate's order.", category: "Criminal procedure" },
  { term: "Non-cognizable offence", meaning: "An offence for which the police cannot arrest without a warrant or investigate without a Magistrate's permission.", category: "Criminal procedure" },
  { term: "Bailable offence", meaning: "An offence in which bail is a matter of right for the accused.", category: "Criminal procedure", reference: "Section 478, BNSS (formerly Section 436, CrPC)" },
  { term: "Non-bailable offence", meaning: "An offence in which bail is not a right and is at the court's discretion.", category: "Criminal procedure", reference: "Section 480, BNSS (formerly Section 437, CrPC)" },
  { term: "Anticipatory bail", meaning: "A direction that a person who fears arrest for a non-bailable offence be released on bail if arrested.", category: "Criminal procedure", reference: "Section 482, BNSS (formerly Section 438, CrPC)" },
  { term: "Charge sheet", meaning: "The final police report filed before a Magistrate after investigation, setting out the evidence against the accused.", category: "Criminal procedure", reference: "Section 193, BNSS (formerly Section 173, CrPC)" },
  { term: "Police custody", meaning: "Detention of an accused by the police, usually for interrogation, under a Magistrate's order.", category: "Criminal procedure" },
  { term: "Judicial custody", meaning: "Detention of an accused in jail under the control of the Magistrate rather than the police.", category: "Criminal procedure" },
  { term: "Compoundable offence", meaning: "An offence that the victim may settle with the accused, with or without the court's permission, leading to acquittal.", category: "Criminal procedure", reference: "Section 359, BNSS (formerly Section 320, CrPC)" },
  { term: "Summons", meaning: "A court order requiring a person to appear before it on a given date.", category: "Criminal procedure" },
  { term: "Warrant", meaning: "A written order from a court authorising the police to arrest a person, or to search a place.", category: "Criminal procedure" },
  { term: "Proclaimed offender", meaning: "A person declared by a court to be absconding to avoid a warrant. Their property may be attached, and under the BNSS they may be tried in their absence.", category: "Criminal procedure", reference: "Section 356, BNSS" },

  // Civil procedure
  { term: "Plaint", meaning: "The written statement of claim with which a plaintiff starts a civil suit.", category: "Civil procedure" },
  { term: "Written statement", meaning: "The defendant's written reply to the plaint, admitting or denying the claims.", category: "Civil procedure" },
  { term: "Decree", meaning: "The formal expression of a court's adjudication that conclusively decides the rights of the parties in a suit.", category: "Civil procedure", reference: "Section 2(2), Code of Civil Procedure, 1908" },
  { term: "Injunction", meaning: "A court order directing a party to do, or more often to refrain from doing, a particular act.", category: "Civil procedure" },
  { term: "Caveat", meaning: "A notice lodged by a person who expects an application to be filed against them, asking to be heard before any order is passed.", category: "Civil procedure", reference: "Section 148A, Code of Civil Procedure, 1908" },
  { term: "Execution", meaning: "The process of enforcing a decree or order so that the successful party actually receives what the court awarded.", category: "Civil procedure" },
  { term: "Adjournment", meaning: "Postponement of a hearing to a later date.", category: "Civil procedure" },

  // Evidence
  { term: "Examination-in-chief", meaning: "The questioning of a witness by the party who called them.", category: "Evidence" },
  { term: "Cross-examination", meaning: "The questioning of a witness by the opposing party, to test their testimony.", category: "Evidence" },
  { term: "Hostile witness", meaning: "A witness who turns against the party that called them. The court may allow that party to cross-examine them.", category: "Evidence", reference: "Section 157, BSA (formerly Section 154, Evidence Act)" },
  { term: "Dying declaration", meaning: "A statement by a person about the cause or circumstances of their death. It is admissible even though the maker cannot be cross-examined.", category: "Evidence", reference: "Section 26, BSA (formerly Section 32, Evidence Act)" },
  { term: "Burden of proof", meaning: "The obligation to prove a fact. Whoever wants the court to believe a fact must prove it.", category: "Evidence", reference: "Section 104, BSA (formerly Section 101, Evidence Act)" },
  { term: "Circumstantial evidence", meaning: "Evidence of facts from which the court may infer the fact in issue, as opposed to direct evidence of it.", category: "Evidence" },

  // Constitutional
  { term: "Writ petition", meaning: "A petition to the Supreme Court or a High Court seeking a writ to enforce fundamental or other legal rights.", category: "Constitutional", reference: "Articles 32 and 226, Constitution of India" },
  { term: "Special Leave Petition (SLP)", meaning: "A petition asking the Supreme Court for permission to appeal against any judgment or order of any court or tribunal in India.", category: "Constitutional", reference: "Article 136, Constitution of India" },
  { term: "Review petition", meaning: "A request to a court to reconsider its own judgment, on limited grounds such as an error apparent on the face of the record.", category: "Constitutional", reference: "Article 137, Constitution of India" },
  { term: "Curative petition", meaning: "A last remedy after a review petition is dismissed, to correct a gross miscarriage of justice. It was recognised in Rupa Ashok Hurra v. Ashok Hurra (2002).", category: "Constitutional" },
  { term: "Public Interest Litigation (PIL)", meaning: "Litigation filed to protect the public interest, where the strict rule of locus standi is relaxed.", category: "Constitutional" },
  { term: "Basic structure doctrine", meaning: "Parliament may amend the Constitution but cannot alter its basic structure. It was laid down in Kesavananda Bharati v. State of Kerala (1973).", category: "Constitutional" },

  // General
  { term: "Vakalatnama", meaning: "The document by which a party authorises an advocate to appear and act for them in a case.", category: "General" },
  { term: "Affidavit", meaning: "A written statement of facts confirmed on oath or affirmation before an authorised officer.", category: "General" },
  { term: "Advocate-on-Record", meaning: "An advocate who has qualified under the Supreme Court's rules and alone may file matters and act for parties in the Supreme Court.", category: "General" },
];
