export type Article = { number: string; heading: string; text?: string; repealed?: boolean };

export type Part = {
  number: string;
  title: string;
  range: string;
  repealed?: boolean;
  articles?: Article[];
};

export type Schedule = { number: number; title: string };

export const preamble = {
  opening: "WE, THE PEOPLE OF INDIA,",
  resolve:
    "having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens:",
  ideals: [
    { word: "JUSTICE", rest: "social, economic and political;" },
    { word: "LIBERTY", rest: "of thought, expression, belief, faith and worship;" },
    { word: "EQUALITY", rest: "of status and of opportunity;" },
  ],
  promote: "and to promote among them all",
  fraternity: { word: "FRATERNITY", rest: "assuring the dignity of the individual and the unity and integrity of the Nation;" },
  closing:
    "IN OUR CONSTITUENT ASSEMBLY this twenty-sixth day of November, 1949, do HEREBY ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION.",
};

const fundamentalRights: Article[] = [
  {
    number: "12",
    heading: "Definition",
    text: "In this Part, unless the context otherwise requires, “the State” includes the Government and Parliament of India and the Government and the Legislature of each of the States and all local or other authorities within the territory of India or under the control of the Government of India.",
  },
  { number: "13", heading: "Laws inconsistent with or in derogation of the fundamental rights" },
  {
    number: "14",
    heading: "Equality before law",
    text: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.",
  },
  {
    number: "15",
    heading: "Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth",
    text: "(1) The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them.",
  },
  { number: "16", heading: "Equality of opportunity in matters of public employment" },
  {
    number: "17",
    heading: "Abolition of Untouchability",
    text: "“Untouchability” is abolished and its practice in any form is forbidden. The enforcement of any disability arising out of “Untouchability” shall be an offence punishable in accordance with law.",
  },
  { number: "18", heading: "Abolition of titles" },
  {
    number: "19",
    heading: "Protection of certain rights regarding freedom of speech, etc.",
    text: "(1) All citizens shall have the right—\n(a) to freedom of speech and expression;\n(b) to assemble peaceably and without arms;\n(c) to form associations or unions or co-operative societies;\n(d) to move freely throughout the territory of India;\n(e) to reside and settle in any part of the territory of India; and\n(f) [omitted]\n(g) to practise any profession, or to carry on any occupation, trade or business.",
  },
  {
    number: "20",
    heading: "Protection in respect of conviction for offences",
    text: "(3) No person accused of any offence shall be compelled to be a witness against himself.",
  },
  {
    number: "21",
    heading: "Protection of life and personal liberty",
    text: "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
  },
  {
    number: "21A",
    heading: "Right to education",
    text: "The State shall provide free and compulsory education to all children of the age of six to fourteen years in such manner as the State may, by law, determine.",
  },
  { number: "22", heading: "Protection against arrest and detention in certain cases" },
  { number: "23", heading: "Prohibition of traffic in human beings and forced labour" },
  { number: "24", heading: "Prohibition of employment of children in factories, etc." },
  { number: "25", heading: "Freedom of conscience and free profession, practice and propagation of religion" },
  { number: "26", heading: "Freedom to manage religious affairs" },
  { number: "27", heading: "Freedom as to payment of taxes for promotion of any particular religion" },
  { number: "28", heading: "Freedom as to attendance at religious instruction or religious worship in certain educational institutions" },
  { number: "29", heading: "Protection of interests of minorities" },
  { number: "30", heading: "Right of minorities to establish and administer educational institutions" },
  { number: "31", heading: "Compulsory acquisition of property", repealed: true },
  { number: "31A", heading: "Saving of laws providing for acquisition of estates, etc." },
  { number: "31B", heading: "Validation of certain Acts and Regulations" },
  { number: "31C", heading: "Saving of laws giving effect to certain directive principles" },
  {
    number: "32",
    heading: "Remedies for enforcement of rights conferred by this Part",
    text: "(1) The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed.",
  },
  { number: "33", heading: "Power of Parliament to modify the rights conferred by this Part in their application to Forces, etc." },
  { number: "34", heading: "Restriction on rights conferred by this Part while martial law is in force in any area" },
  { number: "35", heading: "Legislation to give effect to the provisions of this Part" },
];

export const parts: Part[] = [
  { number: "I", title: "The Union and its Territory", range: "1–4" },
  { number: "II", title: "Citizenship", range: "5–11" },
  { number: "III", title: "Fundamental Rights", range: "12–35", articles: fundamentalRights },
  { number: "IV", title: "Directive Principles of State Policy", range: "36–51" },
  { number: "IVA", title: "Fundamental Duties", range: "51A" },
  { number: "V", title: "The Union", range: "52–151" },
  { number: "VI", title: "The States", range: "152–237" },
  { number: "VII", title: "The States in Part B of the First Schedule", range: "238", repealed: true },
  { number: "VIII", title: "The Union Territories", range: "239–242" },
  { number: "IX", title: "The Panchayats", range: "243–243O" },
  { number: "IXA", title: "The Municipalities", range: "243P–243ZG" },
  { number: "IXB", title: "The Co-operative Societies", range: "243ZH–243ZT" },
  { number: "X", title: "The Scheduled and Tribal Areas", range: "244–244A" },
  { number: "XI", title: "Relations between the Union and the States", range: "245–263" },
  { number: "XII", title: "Finance, Property, Contracts and Suits", range: "264–300A" },
  { number: "XIII", title: "Trade, Commerce and Intercourse within the Territory of India", range: "301–307" },
  { number: "XIV", title: "Services under the Union and the States", range: "308–323" },
  { number: "XIVA", title: "Tribunals", range: "323A–323B" },
  { number: "XV", title: "Elections", range: "324–329A" },
  { number: "XVI", title: "Special Provisions relating to certain Classes", range: "330–342A" },
  { number: "XVII", title: "Official Language", range: "343–351" },
  { number: "XVIII", title: "Emergency Provisions", range: "352–360" },
  { number: "XIX", title: "Miscellaneous", range: "361–367" },
  { number: "XX", title: "Amendment of the Constitution", range: "368" },
  { number: "XXI", title: "Temporary, Transitional and Special Provisions", range: "369–392" },
  { number: "XXII", title: "Short title, Commencement, Authoritative Text in Hindi and Repeals", range: "393–395" },
];

export const schedules: Schedule[] = [
  { number: 1, title: "The States and the Union Territories" },
  { number: 2, title: "Emoluments of the President, Governors, Judges, the Comptroller and Auditor-General and others" },
  { number: 3, title: "Forms of Oaths or Affirmations" },
  { number: 4, title: "Allocation of seats in the Council of States (Rajya Sabha)" },
  { number: 5, title: "Administration and control of Scheduled Areas and Scheduled Tribes" },
  { number: 6, title: "Administration of Tribal Areas in Assam, Meghalaya, Tripura and Mizoram" },
  { number: 7, title: "Union List, State List and Concurrent List" },
  { number: 8, title: "Languages (22 scheduled languages)" },
  { number: 9, title: "Validation of certain Acts and Regulations" },
  { number: 10, title: "Disqualification on the ground of defection" },
  { number: 11, title: "Powers, authority and responsibilities of Panchayats (29 subjects)" },
  { number: 12, title: "Powers, authority and responsibilities of Municipalities (18 subjects)" },
];
