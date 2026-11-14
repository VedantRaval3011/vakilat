export type ChangeKind = "mapped" | "amended" | "new" | "dropped";

export type Mapping = {
  old: string | null;
  new: string | null;
  title: string;
  /** Short subject label used in subject search (defaults to title). */
  subject?: string;
  note?: string;
  oldText?: string;
  newText?: string;
  change?: ChangeKind;
};

export type ConverterPair = {
  slug: string;
  from: string;
  to: string;
  fromFull: string;
  toFull: string;
  example: string;
  entries: Mapping[];
};

export const mappingSlug = (e: Pick<Mapping, "old" | "new">) =>
  `${e.old ?? "none"}-to-${e.new ?? "none"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function changeKind(e: Mapping): ChangeKind {
  if (e.change) return e.change;
  if (!e.old) return "new";
  if (!e.new) return "dropped";
  if (e.note) return "amended";
  return "mapped";
}

export const changeLabels: Record<ChangeKind, string> = {
  mapped: "Carried over",
  amended: "Amended",
  new: "New provision",
  dropped: "Not carried over",
};

export function findMapping(pair: ConverterPair, section: string) {
  return pair.entries.find((e) => mappingSlug(e) === section) ?? null;
}

export function findPair(slug: string) {
  return converterPairs.find((p) => p.slug === slug) ?? null;
}

const ipcBns: Mapping[] = [
  {
    old: "1",
    new: "1",
    title: "Title, commencement and application",
    subject: "Short title",
    oldText:
      "This Act shall be called the Indian Penal Code, and shall extend to the whole of India except the State of Jammu and Kashmir; and shall come into force on the first day of January, 1862.",
    newText:
      "This Act may be called the Bharatiya Nyaya Sanhita, 2023. It extends to the whole of India. It shall come into force on such date as the Central Government may, by notification in the Official Gazette, appoint.",
  },
  {
    old: "34",
    new: "3(5)",
    title: "Acts done by several persons in furtherance of common intention",
    subject: "Common intention",
    oldText:
      "When a criminal act is done by several persons in furtherance of the common intention of all, each of such persons is liable for that act in the same manner as if it were done by him alone.",
    newText:
      "When a criminal act is done by several persons in furtherance of the common intention of all, each of such persons is liable for that act in the same manner as if it were done by him alone.",
  },
  {
    old: "107",
    new: "45",
    title: "Abetment of a thing",
    subject: "Abetment",
    oldText:
      "A person abets the doing of a thing, who—\n(a) instigates any person to do that thing; or\n(b) engages with one or more other person or persons in any conspiracy for the doing of that thing, if an act or illegal omission takes place in pursuance of that conspiracy, and in order to the doing of that thing; or\n(c) intentionally aids, by any act or illegal omission, the doing of that thing.",
    newText:
      "A person abets the doing of a thing, who—\n(a) instigates any person to do that thing; or\n(b) engages with one or more other person or persons in any conspiracy for the doing of that thing, if an act or illegal omission takes place in pursuance of that conspiracy, and in order to the doing of that thing; or\n(c) intentionally aids, by any act or illegal omission, the doing of that thing.",
  },
  {
    old: "109",
    new: "49",
    title: "Punishment of abetment where the act abetted is committed",
    subject: "Punishment for abetment",
    oldText:
      "Whoever abets any offence shall, if the act abetted is committed in consequence of the abetment, and no express provision is made by this Code for the punishment of such abetment, be punished with the punishment provided for the offence.",
    newText:
      "Whoever abets any offence shall, if the act abetted is committed in consequence of the abetment, and no express provision is made by this Sanhita for the punishment of such abetment, be punished with the punishment provided for the offence.",
  },
  {
    old: "120A",
    new: "61(1)",
    title: "Definition of criminal conspiracy",
    subject: "Criminal conspiracy",
    oldText:
      "When two or more persons agree to do, or cause to be done,—\n(1) an illegal act, or\n(2) an act which is not illegal by illegal means,\nsuch an agreement is designated a criminal conspiracy.",
    newText:
      "When two or more persons agree to do, or cause to be done an illegal act, or an act which is not illegal by illegal means, such an agreement is designated a criminal conspiracy.",
  },
  {
    old: "120B",
    new: "61(2)",
    title: "Punishment of criminal conspiracy",
    subject: "Punishment for conspiracy",
    oldText:
      "Whoever is a party to a criminal conspiracy to commit an offence punishable with death, imprisonment for life or rigorous imprisonment for a term of two years or upwards, shall, where no express provision is made in this Code for the punishment of such a conspiracy, be punished in the same manner as if he had abetted such offence.",
    newText:
      "Whoever is a party to a criminal conspiracy to commit an offence punishable with death, imprisonment for life or rigorous imprisonment for a term of two years or upwards, shall, where no express provision is made in this Sanhita for the punishment of such a conspiracy, be punished in the same manner as if he had abetted such offence.",
  },
  {
    old: "124A",
    new: "152",
    title: "Sedition",
    subject: "Sovereignty and integrity",
    change: "amended",
    note: "Sedition is dropped. Section 152 instead covers acts endangering the sovereignty, unity and integrity of India.",
    oldText:
      "Whoever by words, either spoken or written, or by signs, or by visible representation, or otherwise, brings or attempts to bring into hatred or contempt, or excites or attempts to excite disaffection towards, the Government established by law in India, shall be punished with imprisonment for life, to which fine may be added, or with imprisonment which may extend to three years, to which fine may be added, or with fine.",
    newText:
      "Whoever, purposely or knowingly, by words, either spoken or written, or by signs, or by visible representation, or by electronic communication or by use of financial mean, or otherwise, excites or attempts to excite, secession or armed rebellion or subversive activities, or encourages feelings of separatist activities or endangers sovereignty or unity and integrity of India; or indulges in or commits any such act shall be punished with imprisonment for life, or with imprisonment which may extend to seven years, and shall also be liable to fine.",
  },
  {
    old: "141",
    new: "189(1)",
    title: "Unlawful assembly",
    subject: "Unlawful assembly",
    oldText:
      "An assembly of five or more persons is designated an “unlawful assembly”, if the common object of the persons composing that assembly is—\n(a) to overawe by criminal force, or show of criminal force, the Central or any State Government or Parliament or the Legislature of any State, or any public servant in the exercise of the lawful power of such public servant; or\n(b) to resist the execution of any law, or of any legal process; or\n(c) to commit any mischief or criminal trespass, or other offence; or\n(d) by means of criminal force, or show of criminal force, to any person, to take or obtain possession of any property, or to deprive any person of the enjoyment of a right of way, or of the use of water or other incorporeal right of which he is in possession or enjoyment, or to enforce any right or supposed right; or\n(e) by means of criminal force, or show of criminal force, to compel any person to do what he is not legally bound to do, or to omit to do what he is legally entitled to do.",
    newText:
      "An assembly of five or more persons is designated an “unlawful assembly”, if the common object of the persons composing that assembly is—\n(a) to overawe by criminal force, or show of criminal force, the Central Government or any State Government or Parliament or the Legislature of any State, or any public servant in the exercise of the lawful power of such public servant; or\n(b) to resist the execution of any law, or of any legal process; or\n(c) to commit any mischief or criminal trespass, or other offence; or\n(d) by means of criminal force, or show of criminal force, to any person, to take or obtain possession of any property, or to deprive any person of the enjoyment of a right of way, or of the use of water or other incorporeal right of which he is in possession or enjoyment, or to enforce any right or supposed right; or\n(e) by means of criminal force, or show of criminal force, to compel any person to do what he is not legally bound to do, or to omit to do what he is legally entitled to do.",
  },
  {
    old: "147",
    new: "191(2)",
    title: "Punishment for rioting",
    subject: "Rioting",
    oldText: "Whoever is guilty of rioting, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
    newText: "Whoever is guilty of rioting, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
  },
  {
    old: "149",
    new: "190",
    title: "Every member of unlawful assembly guilty of offence committed in prosecution of common object",
    subject: "Common object",
    oldText:
      "If an offence is committed by any member of an unlawful assembly in prosecution of the common object of that assembly, or such as the members of that assembly knew to be likely to be committed in prosecution of that object, every person who, at the time of the committing of that offence, is a member of the same assembly, is guilty of that offence.",
    newText:
      "If an offence is committed by any member of an unlawful assembly in prosecution of the common object of that assembly, or such as the members of that assembly knew to be likely to be committed in prosecution of that object, every person who, at the time of the committing of that offence, is a member of the same assembly, is guilty of that offence.",
  },
  {
    old: "191",
    new: "227",
    title: "Giving false evidence",
    subject: "False evidence",
    oldText:
      "Whoever, being legally bound by an oath or by an express provision of law to state the truth, or being bound by law to make a declaration upon any subject, makes any statement which is false, and which he either knows or believes to be false or does not believe to be true, is said to give false evidence.",
    newText:
      "Whoever, being legally bound by an oath or by an express provision of law to state the truth, or being bound by law to make a declaration upon any subject, makes any statement which is false, and which he either knows or believes to be false or does not believe to be true, is said to give false evidence.",
  },
  {
    old: "193",
    new: "229",
    title: "Punishment for false evidence",
    subject: "Punishment for false evidence",
    oldText:
      "Whoever intentionally gives false evidence in any stage of a judicial proceeding, or fabricates false evidence for the purpose of being used in any stage of a judicial proceeding, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    newText:
      "Whoever intentionally gives false evidence in any stage of a judicial proceeding, or fabricates false evidence for the purpose of being used in any stage of a judicial proceeding, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
  },
  {
    old: "279",
    new: "281",
    title: "Rash driving or riding on a public way",
    subject: "Rash driving",
    oldText:
      "Whoever drives any vehicle, or rides, on any public way in a manner so rash or negligent as to endanger human life, or to be likely to cause hurt or injury to any other person, shall be punished with imprisonment of either description for a term which may extend to six months, or with fine which may extend to one thousand rupees, or with both.",
    newText:
      "Whoever drives any vehicle, or rides, on any public way in a manner so rash or negligent as to endanger human life, or to be likely to cause hurt or injury to any other person, shall be punished with imprisonment of either description for a term which may extend to six months, or with fine of five thousand rupees, or with both.",
    change: "amended",
    note: "Fine raised to five thousand rupees.",
  },
  {
    old: "299",
    new: "100",
    title: "Culpable homicide",
    subject: "Culpable homicide",
    oldText:
      "Whoever causes death by doing an act with the intention of causing death, or with the intention of causing such bodily injury as is likely to cause death, or with the knowledge that he is likely by such act to cause death, commits the offence of culpable homicide.",
    newText:
      "Whoever causes death by doing an act with the intention of causing death, or with the intention of causing such bodily injury as is likely to cause death, or with the knowledge that he is likely by such act to cause death, commits the offence of culpable homicide.",
  },
  {
    old: "300",
    new: "101",
    title: "Murder",
    subject: "Murder",
    oldText:
      "Except in the cases hereinafter excepted, culpable homicide is murder, if the act by which the death is caused is done with the intention of causing death, or—\n2ndly.—If it is done with the intention of causing such bodily injury as the offender knows to be likely to cause the death of the person to whom the harm is caused, or—\n3rdly.—If it is done with the intention of causing bodily injury to any person and the bodily injury intended to be inflicted is sufficient in the ordinary course of nature to cause death, or—\n4thly.—If the person committing the act knows that it is so imminently dangerous that it must, in all probability, cause death, or such bodily injury as is likely to cause death, and commits such act without any excuse for incurring the risk of causing death or such injury as aforesaid.",
    newText:
      "Except in the cases hereinafter excepted, culpable homicide is murder,—\n(a) if the act by which the death is caused is done with the intention of causing death; or\n(b) if it is done with the intention of causing such bodily injury as the offender knows to be likely to cause the death of the person to whom the harm is caused; or\n(c) if it is done with the intention of causing bodily injury to any person and the bodily injury intended to be inflicted is sufficient in the ordinary course of nature to cause death; or\n(d) if the person committing the act knows that it is so imminently dangerous that it must, in all probability, cause death, or such bodily injury as is likely to cause death, and commits such act without any excuse for incurring the risk of causing death or such injury as aforesaid.",
  },
  {
    old: "302",
    new: "103",
    title: "Punishment for murder",
    subject: "Punishment for murder",
    change: "amended",
    note: "Section 103(2) adds murder by a group of five or more on grounds such as race, caste or community.",
    oldText: "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
    newText:
      "(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.\n(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine.",
  },
  {
    old: "304",
    new: "105",
    title: "Punishment for culpable homicide not amounting to murder",
    subject: "Culpable homicide punishment",
    oldText:
      "Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine, if the act by which the death is caused is done with the intention of causing death, or of causing such bodily injury as is likely to cause death; or with imprisonment of either description for a term which may extend to ten years, or with fine, or with both, if the act is done with the knowledge that it is likely to cause death, but without any intention to cause death, or to cause such bodily injury as is likely to cause death.",
    newText:
      "Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine, if the act by which the death is caused is done with the intention of causing death, or of causing such bodily injury as is likely to cause death; or with imprisonment of either description for a term which may extend to ten years, or with fine, or with both, if the act is done with the knowledge that it is likely to cause death, but without any intention to cause death, or to cause such bodily injury as is likely to cause death.",
  },
  {
    old: "304A",
    new: "106",
    title: "Causing death by negligence",
    subject: "Death by negligence",
    change: "amended",
    note: "Higher punishment, with a separate provision for hit-and-run cases.",
    oldText:
      "Whoever causes the death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
    newText:
      "(1) Whoever causes death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine; and if such act is done by a registered medical practitioner while performing medical procedure, he shall be punished with imprisonment of either description for a term which may extend to two years, and shall also be liable to fine.\n(2) Whoever causes death of any person by rash and negligent driving of vehicle not amounting to culpable homicide, and escapes without reporting it to a police officer or a Magistrate soon after the incident, shall be punished with imprisonment of either description of a term which may extend to ten years, and shall also be liable to fine.",
  },
  {
    old: "304B",
    new: "80",
    title: "Dowry death",
    subject: "Dowry death",
    oldText:
      "Where the death of a woman is caused by any burns or bodily injury or occurs otherwise than under normal circumstances within seven years of her marriage and it is shown that soon before her death she was subjected to cruelty or harassment by her husband or any relative of her husband for, or in connection with, any demand for dowry, such death shall be called “dowry death”, and such husband or relative shall be deemed to have caused her death.",
    newText:
      "Where the death of a woman is caused by any burns or bodily injury or occurs otherwise than under normal circumstances within seven years of her marriage and it is shown that soon before her death she was subjected to cruelty or harassment by her husband or any relative of her husband for, or in connection with, any demand for dowry, such death shall be called “dowry death”, and such husband or relative shall be deemed to have caused her death.",
  },
  {
    old: "306",
    new: "108",
    title: "Abetment of suicide",
    subject: "Abetment of suicide",
    oldText: "If any person commits suicide, whoever abets the commission of such suicide, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
    newText: "If any person commits suicide, whoever abets the commission of such suicide, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
  },
  {
    old: "307",
    new: "109",
    title: "Attempt to murder",
    subject: "Attempt to murder",
    oldText:
      "Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine; and if hurt is caused to any person by such act, the offender shall be liable either to imprisonment for life, or to such punishment as is hereinbefore mentioned.",
    newText:
      "Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine; and if hurt is caused to any person by such act, the offender shall be liable either to imprisonment for life, or to such punishment as is hereinbefore mentioned.",
  },
  {
    old: "309",
    new: null,
    title: "Attempt to commit suicide",
    subject: "Attempt to suicide",
    change: "dropped",
    note: "Not carried over as a general offence.",
    oldText: "Whoever attempts to commit suicide and does any act towards the commission of such offence, shall be punished with simple imprisonment for a term which may extend to one year or with fine, or with both.",
  },
  {
    old: "319",
    new: "114",
    title: "Hurt",
    subject: "Hurt",
    oldText: "Whoever causes bodily pain, disease or infirmity to any person is said to cause hurt.",
    newText: "Whoever causes bodily pain, disease or infirmity to any person is said to cause hurt.",
  },
  {
    old: "320",
    new: "116",
    title: "Grievous hurt",
    subject: "Grievous hurt",
    oldText:
      "The following kinds of hurt only are designated as “grievous”:—\nFirst— Emasculation.\nSecondly— Permanent privation of the sight of either eye.\nThirdly— Permanent privation of the hearing of either ear.\nFourthly— Privation of any member or joint.\nFifthly— Destruction or permanent impairing of the powers of any member or joint.\nSixthly— Permanent disfiguration of the head or face.\nSeventhly— Fracture or dislocation of a bone or tooth.\nEighthly— Any hurt which endangers life or which causes the sufferer to be during the space of twenty days in severe bodily pain, or unable to follow his ordinary pursuits.",
    newText:
      "The following kinds of hurt only are designated as “grievous”:—\n(a) Emasculation;\n(b) Permanent privation of the sight of either eye;\n(c) Permanent privation of the hearing of either ear;\n(d) Privation of any member or joint;\n(e) Destruction or permanent impairing of the powers of any member or joint;\n(f) Permanent disfiguration of the head or face;\n(g) Fracture or dislocation of a bone or tooth;\n(h) Any hurt which endangers life or which causes the sufferer to be during the space of fifteen days in severe bodily pain, or unable to follow his ordinary pursuits.",
    change: "amended",
    note: "The incapacity period is fifteen days under the BNS (twenty under the IPC).",
  },
  {
    old: "323",
    new: "115(2)",
    title: "Punishment for voluntarily causing hurt",
    subject: "Punishment for hurt",
    oldText: "Whoever, except in the case provided for by section 334, voluntarily causes hurt, shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.",
    newText: "Whoever, except in the case provided for by section 122, voluntarily causes hurt, shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to ten thousand rupees, or with both.",
  },
  {
    old: "324",
    new: "118(1)",
    title: "Voluntarily causing hurt by dangerous weapons or means",
    subject: "Hurt by dangerous weapons",
    oldText:
      "Whoever, except in the case provided for by section 334, voluntarily causes hurt by means of any instrument for shooting, stabbing or cutting, or any instrument which, used as a weapon of offence, is likely to cause death, or by means of fire or any heated substance, or by means of any poison or any corrosive substance, or by means of any explosive substance or by means of any substance which it is deleterious to the human body to inhale, to swallow, or to receive into the blood, or by means of any animal, shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
    newText:
      "Whoever causes hurt by means of any instrument for shooting, stabbing or cutting, or any instrument which, used as a weapon of offence, is likely to cause death, or by means of fire or any heated substance, or by means of any poison or any corrosive substance, or by means of any explosive substance, or by means of any substance which it is deleterious to the human body to inhale, to swallow, or to receive into the blood, or by means of any animal, shall be punished with imprisonment of either description for a term which may extend to three years, or with fine which may extend to twenty thousand rupees, or with both.",
  },
  {
    old: "325",
    new: "117(2)",
    title: "Punishment for voluntarily causing grievous hurt",
    subject: "Punishment for grievous hurt",
    oldText: "Whoever, except in the case provided for by section 335, voluntarily causes grievous hurt, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    newText: "Whoever, except in the case provided for by section 122, voluntarily causes grievous hurt, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
  },
  {
    old: "326",
    new: "118(2)",
    title: "Voluntarily causing grievous hurt by dangerous weapons or means",
    subject: "Grievous hurt by dangerous weapons",
    oldText:
      "Whoever, except in the case provided for by section 335, voluntarily causes grievous hurt by means of any instrument for shooting, stabbing or cutting, or any instrument which, used as a weapon of offence, is likely to cause death, or by means of fire or any heated substance, or by means of any poison or any corrosive substance, or by means of any explosive substance, or by means of any substance which it is deleterious to the human body to inhale, to swallow, or to receive into the blood, or by means of any animal, shall be punished with imprisonment for life, or with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
    newText:
      "Whoever causes grievous hurt by means of any instrument for shooting, stabbing or cutting, or any instrument which, used as a weapon of offence, is likely to cause death, or by means of fire or any heated substance, or by means of any poison or any corrosive substance, or by means of any explosive substance, or by means of any substance which it is deleterious to the human body to inhale, to swallow, or to receive into the blood, or by means of any animal, shall be punished with imprisonment for life, or with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
  },
  {
    old: "354",
    new: "74",
    title: "Assault or criminal force to woman with intent to outrage her modesty",
    subject: "Outrage of modesty",
    oldText:
      "Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and shall also be liable to fine.",
    newText:
      "Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and shall also be liable to fine.",
  },
  {
    old: "354A",
    new: "75",
    title: "Sexual harassment",
    subject: "Sexual harassment",
    oldText:
      "A man committing any of the following acts—(i) physical contact and advances involving unwelcome and explicit sexual overtures; or (ii) a demand or request for sexual favours; or (iii) showing pornography against the will of a woman; or (iv) making sexually coloured remarks, shall be guilty of the offence of sexual harassment.",
    newText:
      "A man committing any of the following acts—(i) physical contact and advances involving unwelcome and explicit sexual overtures; or (ii) a demand or request for sexual favours; or (iii) showing pornography against the will of a woman; or (iv) making sexually coloured remarks, shall be guilty of the offence of sexual harassment.",
  },
  {
    old: "354B",
    new: "76",
    title: "Assault or use of criminal force to woman with intent to disrobe",
    subject: "Disrobing",
    oldText:
      "Any man who assaults or uses criminal force to any woman or abets such act with the intention of disrobing or compelling her to be naked, shall be punished with imprisonment of either description for a term which shall not be less than three years but which may extend to seven years, and shall also be liable to fine.",
    newText:
      "Whoever assaults or uses criminal force to any woman or abets such act with the intention of disrobing or compelling her to be naked, shall be punished with imprisonment of either description for a term which shall not be less than three years but which may extend to seven years, and shall also be liable to fine.",
  },
  {
    old: "354C",
    new: "77",
    title: "Voyeurism",
    subject: "Voyeurism",
    oldText:
      "Any man who watches, or captures the image of a woman engaging in a private act in circumstances where she would usually have the expectation of not being observed either by the perpetrator or by any other person at the behest of the perpetrator or disseminates such image shall be punished on first conviction with imprisonment of either description for a term which shall not be less than one year, but which may extend to three years, and shall also be liable to fine.",
    newText:
      "Whoever watches, or captures the image of a woman engaging in a private act in circumstances where she would usually have the expectation of not being observed either by the perpetrator or by any other person at the behest of the perpetrator or disseminates such image shall be punished on first conviction with imprisonment of either description for a term which shall not be less than one year, but which may extend to three years, and shall also be liable to fine.",
  },
  {
    old: "354D",
    new: "78",
    title: "Stalking",
    subject: "Stalking",
    oldText:
      "Any man who—\n(i) follows a woman and contacts, or attempts to contact such woman to foster personal interaction repeatedly despite a clear indication of disinterest by such woman; or\n(ii) monitors the use by a woman of the internet, email or any other form of electronic communication,\ncommits the offence of stalking.",
    newText:
      "Any man who—\n(i) follows a woman and contacts, or attempts to contact such woman to foster personal interaction repeatedly despite a clear indication of disinterest by such woman; or\n(ii) monitors the use by a woman of the internet, email or any other form of electronic communication,\ncommits the offence of stalking.",
  },
  {
    old: "363",
    new: "137(2)",
    title: "Punishment for kidnapping",
    subject: "Kidnapping",
    oldText: "Whoever kidnaps any person from India or from lawful guardianship, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    newText: "Whoever kidnaps any person from India or from lawful guardianship, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
  },
  {
    old: "366",
    new: "87",
    title: "Kidnapping, abducting or inducing woman to compel her marriage",
    subject: "Kidnapping to compel marriage",
    oldText:
      "Whoever kidnaps or abducts any woman with intent that she may be compelled, or knowing it to be likely that she will be compelled, to marry any person against her will, or in order that she may be forced or seduced to illicit intercourse, or knowing it to be likely that she will be forced or seduced to illicit intercourse, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
    newText:
      "Whoever kidnaps or abducts any woman with intent that she may be compelled, or knowing it to be likely that she will be compelled, to marry any person against her will, or in order that she may be forced or seduced to illicit intercourse, or knowing it to be likely that she will be forced or seduced to illicit intercourse, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
  },
  {
    old: "375",
    new: "63",
    title: "Rape",
    subject: "Rape",
    oldText:
      "A man is said to commit “rape” if he—\n(a) penetrates his penis, to any extent, into the vagina, mouth, urethra or anus of a woman or makes her to do so with him or any other person; or\n(b) inserts, to any extent, any object or a part of the body, not being the penis, into the vagina, the urethra or anus of a woman or makes her to do so with him or any other person; or\n(c) manipulates any part of the body of a woman so as to cause penetration into the vagina, urethra, anus or any part of body of such woman or makes her to do so with him or any other person; or\n(d) applies his mouth to the vagina, anus, urethra of a woman or makes her to do so with him or any other person,\nunder the circumstances falling under any of the following seven descriptions…",
    newText:
      "A man is said to commit “rape” if he—\n(a) penetrates his penis, to any extent, into the vagina, mouth, urethra or anus of a woman or makes her to do so with him or any other person; or\n(b) inserts, to any extent, any object or a part of the body, not being the penis, into the vagina, the urethra or anus of a woman or makes her to do so with him or any other person; or\n(c) manipulates any part of the body of a woman so as to cause penetration into the vagina, urethra, anus or any part of body of such woman or makes her to do so with him or any other person; or\n(d) applies his mouth to the vagina, anus, urethra of a woman or makes her to do so with him or any other person,\nunder the circumstances falling under any of the following seven descriptions…",
  },
  {
    old: "376",
    new: "64",
    title: "Punishment for rape",
    subject: "Punishment for rape",
    oldText:
      "Whoever, except in the cases provided for in sub-section (2), commits rape, shall be punished with rigorous imprisonment of either description for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine.",
    newText:
      "Whoever, except in the cases provided for in sub-section (2), commits rape, shall be punished with rigorous imprisonment of either description for a term which shall not be less than ten years, but which may extend to imprisonment for life, and shall also be liable to fine.",
  },
  {
    old: "377",
    new: null,
    title: "Unnatural offences",
    subject: "Unnatural offences",
    change: "dropped",
    note: "No equivalent provision in the BNS.",
    oldText:
      "Whoever voluntarily has carnal intercourse against the order of nature with any man, woman or animal, shall be punished with imprisonment for life, or with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
  },
  {
    old: "378",
    new: "303(1)",
    title: "Theft",
    subject: "Theft",
    oldText:
      "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person’s consent, moves that property in order to such taking, is said to commit theft.",
    newText:
      "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person’s consent, moves that property in order to such taking, is said to commit theft.",
  },
  {
    old: "379",
    new: "303(2)",
    title: "Punishment for theft",
    subject: "Punishment for theft",
    oldText: "Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
    newText:
      "Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both, and in case of second or subsequent conviction of any person under this section, he shall be punished with rigorous imprisonment for a term which shall not be less than one year but which may extend to five years and with fine.",
    change: "amended",
  },
  {
    old: "383",
    new: "308(1)",
    title: "Extortion",
    subject: "Extortion",
    oldText:
      "Whoever intentionally puts any person in fear of any injury to that person, or to any other, and thereby dishonestly induces the person so put in fear to deliver to any person any property or valuable security, or anything signed or sealed which may be converted into a valuable security, commits “extortion”.",
    newText:
      "Whoever intentionally puts any person in fear of any injury to that person, or to any other, and thereby dishonestly induces the person so put in fear to deliver to any person any property or valuable security, or anything signed or sealed which may be converted into a valuable security, commits “extortion”.",
  },
  {
    old: "384",
    new: "308(2)",
    title: "Punishment for extortion",
    subject: "Punishment for extortion",
    oldText: "Whoever commits extortion shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
    newText: "Whoever commits extortion shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
  },
  {
    old: "390",
    new: "309(1)",
    title: "Robbery",
    subject: "Robbery",
    oldText: "In all robbery there is either theft or extortion. When theft is robbery… When extortion is robbery…",
    newText: "In all robbery there is either theft or extortion. Theft is “robbery” if, in order to the committing of the theft, or in committing the theft, or in carrying away or attempting to carry away property obtained by the theft, the offender, for that end, voluntarily causes or attempts to cause to any person death or hurt or wrongful restraint, or fear of instant death or of instant hurt, or of instant wrongful restraint.",
  },
  {
    old: "391",
    new: "310(1)",
    title: "Dacoity",
    subject: "Dacoity",
    oldText: "When five or more persons conjointly commit or attempt to commit a robbery, or where the whole number of persons conjointly committing or attempting to commit a robbery, and persons present and aiding such commission or attempt, amount to five or more, every person so committing, attempting or aiding, is said to commit “dacoity”.",
    newText: "When five or more persons conjointly commit or attempt to commit a robbery, or where the whole number of persons conjointly committing or attempting to commit a robbery, and persons present and aiding such commission or attempt, amount to five or more, every person so committing, attempting or aiding, is said to commit “dacoity”.",
  },
  {
    old: "392",
    new: "309(4)",
    title: "Punishment for robbery",
    subject: "Punishment for robbery",
    oldText: "Whoever commits robbery shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine; and, if the robbery be committed on the highway between sunset and sunrise, the imprisonment may be extended to fourteen years.",
    newText: "Whoever commits robbery shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine; and, if the robbery be committed on the highway between sunset and sunrise, the imprisonment may be extended to fourteen years.",
  },
  {
    old: "395",
    new: "310(2)",
    title: "Punishment for dacoity",
    subject: "Punishment for dacoity",
    oldText: "Whoever commits dacoity shall be punished with imprisonment for life, or with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.",
    newText: "Whoever commits dacoity shall be punished with imprisonment for life, or with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.",
  },
  {
    old: "405",
    new: "316(1)",
    title: "Criminal breach of trust",
    subject: "Criminal breach of trust",
    oldText:
      "Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, or of any legal contract, express or implied, which he has made touching the discharge of such trust, or wilfully suffers any other person so to do, commits “criminal breach of trust”.",
    newText:
      "Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, or of any legal contract, express or implied, which he has made touching the discharge of such trust, or wilfully suffers any other person so to do, commits “criminal breach of trust”.",
  },
  {
    old: "406",
    new: "316(2)",
    title: "Punishment for criminal breach of trust",
    subject: "Punishment for CBT",
    oldText: "Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
    newText: "Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to five years, or with fine, or with both.",
    change: "amended",
  },
  {
    old: "415",
    new: "318(1)",
    title: "Cheating",
    subject: "Cheating",
    oldText:
      "Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, and which act or omission causes or is likely to cause damage or harm to that person in body, mind, reputation or property, is said to “cheat”.",
    newText:
      "Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, and which act or omission causes or is likely to cause damage or harm to that person in body, mind, reputation or property, is said to “cheat”.",
  },
  {
    old: "417",
    new: "318(2)",
    title: "Punishment for cheating",
    subject: "Punishment for cheating",
    oldText: "Whoever cheats shall be punished with imprisonment of either description for a term which may extend to one year, or with fine, or with both.",
    newText: "Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
    change: "amended",
  },
  {
    old: "420",
    new: "318(4)",
    title: "Cheating and dishonestly inducing delivery of property",
    subject: "Cheating and inducing delivery",
    oldText:
      "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    newText:
      "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
  },
  {
    old: "425",
    new: "324(1)",
    title: "Mischief",
    subject: "Mischief",
    oldText:
      "Whoever with intent to cause, or knowing that he is likely to cause, wrongful loss or damage to the public or to any person, causes the destruction of any property, or any such change in any property or in the situation thereof as destroys or diminishes its value or utility, or affects it injuriously, commits “mischief”.",
    newText:
      "Whoever with intent to cause, or knowing that he is likely to cause, wrongful loss or damage to the public or to any person, causes the destruction of any property, or any such change in any property or in the situation thereof as destroys or diminishes its value or utility, or affects it injuriously, commits “mischief”.",
  },
  {
    old: "441",
    new: "329(1)",
    title: "Criminal trespass",
    subject: "Criminal trespass",
    oldText:
      "Whoever enters into or upon property in the possession of another with intent to commit an offence or to intimidate, insult or annoy any person in possession of such property, or having lawfully entered into or upon such property, unlawfully remains there with intent thereby to intimidate, insult or annoy any such person, or with intent to commit an offence, is said to commit “criminal trespass”.",
    newText:
      "Whoever enters into or upon property in the possession of another with intent to commit an offence or to intimidate, insult or annoy any person in possession of such property, or having lawfully entered into or upon such property, unlawfully remains there with intent thereby to intimidate, insult or annoy any such person, or with intent to commit an offence, is said to commit “criminal trespass”.",
  },
  {
    old: "463",
    new: "336(1)",
    title: "Forgery",
    subject: "Forgery",
    oldText:
      "Whoever makes any false documents or false electronic record or part of a document or electronic record, with intent to cause damage or injury, to the public or to any person, or to support any claim or title, or to cause any person to part with property, or to enter into any express or implied contract, or with intent to commit fraud or that fraud may be committed, commits forgery.",
    newText:
      "Whoever makes any false documents or false electronic record or part of a document or electronic record, with intent to cause damage or injury, to the public or to any person, or to support any claim or title, or to cause any person to part with property, or to enter into any express or implied contract, or with intent to commit fraud or that fraud may be committed, commits forgery.",
  },
  {
    old: "465",
    new: "336(2)",
    title: "Punishment for forgery",
    subject: "Punishment for forgery",
    oldText: "Whoever commits forgery shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
    newText: "Whoever commits forgery shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
  },
  {
    old: "467",
    new: "338",
    title: "Forgery of valuable security, will, etc.",
    subject: "Forgery of valuable security",
    oldText:
      "Whoever forges a document which purports to be a valuable security or a will, or an authority to adopt a son, or which purports to give authority to any person to make or transfer any valuable security, or to receive the principal, interest or dividends thereon, or to receive or deliver any money, movable property, or valuable security, or any document purporting to be an acquaintance or receipt acknowledging the payment of money, or an acquaintance or receipt for the delivery of any movable property or valuable security, shall be punished with imprisonment for life, or with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
    newText:
      "Whoever forges a document which purports to be a valuable security or a will, or an authority to adopt a son, or which purports to give authority to any person to make or transfer any valuable security, or to receive the principal, interest or dividends thereon, or to receive or deliver any money, movable property, or valuable security, or any document purporting to be an acquaintance or receipt acknowledging the payment of money, or an acquaintance or receipt for the delivery of any movable property or valuable security, shall be punished with imprisonment for life, or with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.",
  },
  {
    old: "468",
    new: "336(3)",
    title: "Forgery for purpose of cheating",
    subject: "Forgery for cheating",
    oldText: "Whoever commits forgery, intending that the document or electronic record forged shall be used for the purpose of cheating, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    newText: "Whoever commits forgery, intending that the document or electronic record forged shall be used for the purpose of cheating, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
  },
  {
    old: "471",
    new: "340(2)",
    title: "Using as genuine a forged document or electronic record",
    subject: "Using forged document",
    oldText:
      "Whoever fraudulently or dishonestly uses as genuine any document or electronic record which he knows or has reason to believe to be a forged document or electronic record, shall be punished in the same manner as if he had forged such document or electronic record.",
    newText:
      "Whoever fraudulently or dishonestly uses as genuine any document or electronic record which he knows or has reason to believe to be a forged document or electronic record, shall be punished in the same manner as if he had forged such document or electronic record.",
  },
  {
    old: "497",
    new: null,
    title: "Adultery",
    subject: "Adultery",
    change: "dropped",
    note: "Struck down in Joseph Shine v. Union of India (2018); not carried over.",
    oldText:
      "Whoever has sexual intercourse with a person who is and whom he knows or has reason to believe to be the wife of another man, without the consent or connivance of that man, such sexual intercourse not amounting to the offence of rape, is guilty of the offence of adultery, and shall be punished with imprisonment of either description for a term which may extend to five years, or with fine, or with both. In such case the wife shall not be punishable as an abettor.",
  },
  {
    old: "498A",
    new: "85",
    title: "Husband or relative of husband subjecting a woman to cruelty",
    subject: "Cruelty by husband or relatives",
    oldText:
      "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.",
    newText:
      "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.",
  },
  {
    old: "499",
    new: "356(1)",
    title: "Defamation",
    subject: "Defamation",
    oldText:
      "Whoever, by words either spoken or intended to be read, or by signs or by visible representations, makes or publishes any imputation concerning any person intending to harm, or knowing or having reason to believe that such imputation will harm, the reputation of such person, is said, except in the cases hereinafter excepted, to defame that person.",
    newText:
      "Whoever, by words either spoken or intended to be read, or by signs or by visible representations, makes or publishes any imputation concerning any person intending to harm, or knowing or having reason to believe that such imputation will harm, the reputation of such person, is said, except in the cases hereinafter excepted, to defame that person.",
  },
  {
    old: "500",
    new: "356(2)",
    title: "Punishment for defamation",
    subject: "Punishment for defamation",
    oldText: "Whoever defames another shall be punished with simple imprisonment for a term which may extend to two years, or with fine, or with both.",
    newText: "Whoever defames another shall be punished with simple imprisonment for a term which may extend to two years, or with fine, or with both, or with community service.",
    change: "amended",
    note: "Community service added as a sentencing option.",
  },
  {
    old: "503",
    new: "351(1)",
    title: "Criminal intimidation",
    subject: "Criminal intimidation",
    oldText:
      "Whoever threatens another with any injury to his person, reputation or property, or to the person or reputation of any one in whom that person is interested, with intent to cause alarm to that person, or to cause that person to do any act which he is not legally bound to do, or to omit to do any act which that person is legally entitled to do, as the means of avoiding the execution of such threat, commits criminal intimidation.",
    newText:
      "Whoever threatens another with any injury to his person, reputation or property, or to the person or reputation of any one in whom that person is interested, with intent to cause alarm to that person, or to cause that person to do any act which he is not legally bound to do, or to omit to do any act which that person is legally entitled to do, as the means of avoiding the execution of such threat, commits criminal intimidation.",
  },
  {
    old: "506",
    new: "351(2)",
    title: "Punishment for criminal intimidation",
    subject: "Punishment for intimidation",
    oldText: "Whoever commits the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
    newText: "Whoever commits the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
  },
  {
    old: "509",
    new: "79",
    title: "Word, gesture or act intended to insult the modesty of a woman",
    subject: "Insult to modesty",
    oldText:
      "Whoever, intending to insult the modesty of any woman, utters any word, makes any sound or gesture, or exhibits any object, intending that such word or sound shall be heard, or that such gesture or object shall be seen, by such woman, or intrudes upon the privacy of such woman, shall be punished with simple imprisonment for a term which may extend to three years, and also with fine.",
    newText:
      "Whoever, intending to insult the modesty of any woman, utters any word, makes any sound or gesture, or exhibits any object, intending that such word or sound shall be heard, or that such gesture or object shall be seen, by such woman, or intrudes upon the privacy of such woman, shall be punished with simple imprisonment for a term which may extend to three years, and also with fine.",
  },
  {
    old: "511",
    new: "62",
    title: "Punishment for attempting to commit offences",
    subject: "Attempt",
    oldText:
      "Whoever attempts to commit an offence punishable by this Code with imprisonment for life or imprisonment, or to cause such an offence to be committed, and in such attempt does any act towards the commission of the offence, shall, where no express provision is made by this Code for the punishment of such attempt, be punished with imprisonment of any description provided for the offence, for a term which may extend to one-half of the imprisonment for life or, as the case may be, one-half of the longest term of imprisonment provided for that offence, or with such fine as is provided for the offence, or with both.",
    newText:
      "Whoever attempts to commit an offence punishable by this Sanhita with imprisonment for life or imprisonment, or to cause such an offence to be committed, and in such attempt does any act towards the commission of the offence, shall, where no express provision is made by this Sanhita for the punishment of such attempt, be punished with imprisonment of any description provided for the offence, for a term which may extend to one-half of the imprisonment for life or, as the case may be, one-half of the longest term of imprisonment provided for that offence, or with such fine as is provided for the offence, or with both.",
  },
  {
    old: null,
    new: "69",
    title: "Sexual intercourse by employing deceitful means",
    subject: "Deceitful sexual intercourse",
    change: "new",
    newText:
      "Whoever, by deceitful means or by making promise to marry to a woman without any intention of fulfilling the same, has sexual intercourse with her, such sexual intercourse not amounting to the offence of rape, shall be punished with imprisonment of either description for a term which may extend to ten years and shall also be liable to fine.",
  },
  {
    old: null,
    new: "111",
    title: "Organised crime",
    subject: "Organised crime",
    change: "new",
    newText:
      "Any continuing unlawful activity including kidnapping, robbery, vehicle theft, extortion, land grabbing, contract killing, economic offences, cyber-crimes having severe consequences, trafficking of persons, drugs, weapons or illicit goods or services, human trafficking for prostitution or ransom, by any person or a group of persons acting in concert, singly or jointly, either as a member of an organised crime syndicate or on behalf of such syndicate, by use of violence, threat of violence, intimidation, coercion, or by any other unlawful means to obtain direct or indirect material benefit including a financial benefit, shall constitute organised crime.",
  },
  {
    old: null,
    new: "112",
    title: "Petty organised crime",
    subject: "Petty organised crime",
    change: "new",
    newText:
      "Whoever, being a member of a group or gang, either singly or jointly, commits any act of theft, snatching, cheating, unauthorised selling of tickets, unauthorised betting or gambling, selling of public examination question papers or any other similar criminal act, shall be punished with imprisonment for a term which shall not be less than one year but which may extend to seven years, and shall also be liable to fine.",
  },
  {
    old: null,
    new: "113",
    title: "Terrorist act",
    subject: "Terrorist act",
    change: "new",
    newText:
      "Whoever does any act with the intent to threaten or likely to threaten the unity, integrity, sovereignty, security, or economic security of India or with the intent to strike terror or likely to strike terror in the people or any section of the people in India or in any foreign country… commits a terrorist act.",
  },
  // Extra high-frequency mappings
  {
    old: "96",
    new: "34",
    title: "Things done in private defence",
    subject: "Private defence",
    oldText: "Nothing is an offence which is done in the exercise of the right of private defence.",
    newText: "Nothing is an offence which is done in the exercise of the right of private defence.",
  },
  {
    old: "97",
    new: "35",
    title: "Right of private defence of the body and of property",
    subject: "Private defence of body and property",
    oldText:
      "Every person has a right, subject to the restrictions contained in section 99, to defend—\nFirst— His own body, and the body of any other person, against any offence affecting the human body;\nSecondly— The property, whether movable or immovable, of himself or of any other person, against any act which is an offence falling under the definition of theft, robbery, mischief or criminal trespass, or which is an attempt to commit theft, robbery, mischief or criminal trespass.",
    newText:
      "Every person has a right, subject to the restrictions contained in section 37, to defend—\n(a) his own body, and the body of any other person, against any offence affecting the human body;\n(b) the property, whether movable or immovable, of himself or of any other person, against any act which is an offence falling under the definition of theft, robbery, mischief or criminal trespass, or which is an attempt to commit theft, robbery, mischief or criminal trespass.",
  },
  {
    old: "99",
    new: "37",
    title: "Acts against which there is no right of private defence",
    subject: "Limits of private defence",
    oldText:
      "There is no right of private defence against an act which does not reasonably cause the apprehension of death or of grievous hurt, if done, or attempted to be done, by a public servant acting in good faith under colour of his office…",
    newText:
      "There is no right of private defence against an act which does not reasonably cause the apprehension of death or of grievous hurt, if done, or attempted to be done, by a public servant acting in good faith under colour of his office…",
  },
  {
    old: "182",
    new: "217",
    title: "False information, with intent to cause public servant to use his lawful power to the injury of another person",
    subject: "False information to public servant",
    oldText:
      "Whoever gives to any public servant any information which he knows or believes to be false, intending thereby to cause, or knowing it to be likely that he will thereby cause, such public servant—\n(a) to do or omit anything which such public servant ought not to do or omit if the true state of facts respecting which such information is given were known by him, or\n(b) to use the lawful power of such public servant to the injury or annoyance of any person,\nshall be punished with imprisonment of either description for a term which may extend to six months, or with fine which may extend to one thousand rupees, or with both.",
    newText:
      "Whoever gives to any public servant any information which he knows or believes to be false, intending thereby to cause, or knowing it to be likely that he will thereby cause, such public servant—\n(a) to do or omit anything which such public servant ought not to do or omit if the true state of facts respecting which such information is given were known by him; or\n(b) to use the lawful power of such public servant to the injury or annoyance of any person,\nshall be punished with imprisonment of either description for a term which may extend to one year, or with fine, or with both.",
    change: "amended",
  },
  {
    old: "188",
    new: "223",
    title: "Disobedience to order duly promulgated by public servant",
    subject: "Disobedience to public order",
    oldText:
      "Whoever, knowing that, by an order promulgated by a public servant lawfully empowered to promulgate such order, he is directed to abstain from a certain act, or to take certain order with certain property in his possession or under his management, disobeys such direction…",
    newText:
      "Whoever, knowing that, by an order promulgated by a public servant lawfully empowered to promulgate such order, he is directed to abstain from a certain act, or to take certain order with certain property in his possession or under his management, disobeys such direction…",
  },
  {
    old: "201",
    new: "238",
    title: "Causing disappearance of evidence of offence, or giving false information to screen offender",
    subject: "Disappearance of evidence",
    oldText:
      "Whoever, knowing or having reason to believe that an offence has been committed, causes any evidence of the commission of that offence to disappear, with the intention of screening the offender from legal punishment, or with that intention gives any information respecting the offence which he knows or believes to be false…",
    newText:
      "Whoever, knowing or having reason to believe that an offence has been committed, causes any evidence of the commission of that offence to disappear, with the intention of screening the offender from legal punishment, or with that intention gives any information respecting the offence which he knows or believes to be false…",
  },
  {
    old: "294",
    new: "296",
    title: "Obscene acts and songs",
    subject: "Obscene acts",
    oldText:
      "Whoever, to the annoyance of others—(a) does any obscene act in any public place, or (b) sings, recites or utters any obscene song, ballad or words, in or near any public place, shall be punished with imprisonment of either description for a term which may extend to three months, or with fine, or with both.",
    newText:
      "Whoever, to the annoyance of others—(a) does any obscene act in any public place, or (b) sings, recites or utters any obscene song, ballad or words, in or near any public place, shall be punished with imprisonment of either description for a term which may extend to three months, or with fine which may extend to one thousand rupees, or with both.",
  },
  {
    old: "326A",
    new: "124(1)",
    title: "Voluntarily causing grievous hurt by use of acid, etc.",
    subject: "Acid attack",
    oldText:
      "Whoever causes permanent or partial damage or deformity to, or burns or maims or disfigures or disables, any part or parts of the body of a person or causes grievous hurt by throwing acid on or by administering acid to that person, or by using any other means with the intention of causing or with the knowledge that he is likely to cause such injury or hurt, shall be punished with imprisonment of either description for a term which shall not be less than ten years but which may extend to imprisonment for life, and with fine…",
    newText:
      "Whoever causes permanent or partial damage or deformity to, or burns or maims or disfigures or disables, any part or parts of the body of a person or causes grievous hurt by throwing acid on or by administering acid to that person, or by using any other means with the intention of causing or with the knowledge that he is likely to cause such injury or hurt, shall be punished with imprisonment of either description for a term which shall not be less than ten years but which may extend to imprisonment for life, and with fine…",
  },
  {
    old: "376A",
    new: "66",
    title: "Punishment for causing death or resulting in persistent vegetative state of victim",
    subject: "Rape causing death",
    oldText:
      "Whoever, commits an offence punishable under sub-section (1) or sub-section (2) of section 376 and in the course of such commission inflicts an injury which causes the death of the woman or causes the woman to be in a persistent vegetative state, shall be punished with rigorous imprisonment for a term which shall not be less than twenty years, but which may extend to imprisonment for life, which shall mean imprisonment for the remainder of that person’s natural life, or with death.",
    newText:
      "Whoever, commits an offence punishable under sub-section (1) or sub-section (2) of section 64 and in the course of such commission inflicts an injury which causes the death of the woman or causes the woman to be in a persistent vegetative state, shall be punished with rigorous imprisonment for a term which shall not be less than twenty years, but which may extend to imprisonment for life, which shall mean imprisonment for the remainder of that person’s natural life, or with death.",
  },
  {
    old: "376AB",
    new: "65(1)",
    title: "Punishment for rape on woman under twelve years of age",
    subject: "Rape of child under twelve",
    oldText:
      "Whoever, commits rape on a woman under twelve years of age shall be punished with rigorous imprisonment for a term which shall not be less than twenty years, but which may extend to imprisonment for life, which shall mean imprisonment for the remainder of that person’s natural life, and with fine or with death.",
    newText:
      "Whoever, commits rape on a woman under twelve years of age shall be punished with rigorous imprisonment for a term which shall not be less than twenty years, but which may extend to imprisonment for life, which shall mean imprisonment for the remainder of that person’s natural life, and with fine or with death.",
  },
  {
    old: "376D",
    new: "70(1)",
    title: "Gang rape",
    subject: "Gang rape",
    oldText:
      "Where a woman is raped by one or more persons constituting a group or acting in furtherance of a common intention, each of those persons shall be deemed to have committed the offence of rape and shall be punished with rigorous imprisonment for a term which shall not be less than twenty years, but which may extend to life which shall mean imprisonment for the remainder of that person’s natural life, and with fine.",
    newText:
      "Where a woman is raped by one or more persons constituting a group or acting in furtherance of a common intention, each of those persons shall be deemed to have committed the offence of rape and shall be punished with rigorous imprisonment for a term which shall not be less than twenty years, but which may extend to life which shall mean imprisonment for the remainder of that person’s natural life, and with fine.",
  },
  {
    old: "504",
    new: "352",
    title: "Intentional insult with intent to provoke breach of the peace",
    subject: "Intentional insult",
    oldText:
      "Whoever intentionally insults, and thereby gives provocation to any person, intending or knowing it to be likely that such provocation will cause him to break the public peace, or to commit any other offence, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
    newText:
      "Whoever intentionally insults, and thereby gives provocation to any person, intending or knowing it to be likely that such provocation will cause him to break the public peace, or to commit any other offence, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
  },
];

const crpcBnss: Mapping[] = [
  {
    old: "2",
    new: "2",
    title: "Definitions",
    subject: "Definitions",
    oldText: "In this Code, unless the context otherwise requires,— …",
    newText: "In this Sanhita, unless the context otherwise requires,— …",
  },
  {
    old: "41",
    new: "35",
    title: "When police may arrest without warrant",
    subject: "Arrest without warrant",
    oldText:
      "Any police officer may without an order from a Magistrate and without a warrant, arrest any person—\n(a) who commits, in the presence of a police officer, a cognizable offence; …",
    newText:
      "Any police officer may without an order from a Magistrate and without a warrant, arrest any person—\n(a) who commits, in the presence of a police officer, a cognizable offence; …",
  },
  {
    old: "41A",
    new: "35(3)",
    title: "Notice of appearance before police officer",
    subject: "Notice of appearance",
    change: "amended",
    oldText:
      "The police officer shall, in all cases where the arrest of a person is not required under the provisions of sub-section (1) of section 41, issue a notice directing the person against whom a reasonable complaint has been made, or credible information has been received, or a reasonable suspicion exists that he has committed a cognizable offence, to appear before him or at such other place as may be specified in the notice.",
    newText:
      "The police officer shall, in all cases where the arrest of a person is not required under the provisions of sub-section (1), issue a notice directing the person against whom a reasonable complaint has been made, or credible information has been received, or a reasonable suspicion exists that he has committed a cognizable offence, to appear before him or at such other place as may be specified in the notice.",
  },
  {
    old: "50",
    new: "47",
    title: "Person arrested to be informed of grounds of arrest and of right to bail",
    subject: "Grounds of arrest",
    oldText:
      "Every police officer or other person arresting any person without warrant shall forthwith communicate to him full particulars of the offence for which he is arrested or other grounds for such arrest, and where the arrest is for a bailable offence, shall inform the person arrested that he is entitled to be released on bail and that he may arrange for sureties on his behalf.",
    newText:
      "Every police officer or other person arresting any person without warrant shall forthwith communicate to him full particulars of the offence for which he is arrested or other grounds for such arrest, and where the arrest is for a bailable offence, shall inform the person arrested that he is entitled to be released on bail and that he may arrange for sureties on his behalf.",
  },
  {
    old: "57",
    new: "58",
    title: "Person arrested not to be detained more than twenty-four hours",
    subject: "Twenty-four hour rule",
    oldText:
      "No police officer shall detain in custody a person arrested without warrant for a longer period than under all the circumstances of the case is reasonable, and such period shall not, in the absence of a special order of a Magistrate under section 167, exceed twenty-four hours exclusive of the time necessary for the journey from the place of arrest to the Magistrate’s Court.",
    newText:
      "No police officer shall detain in custody a person arrested without warrant for a longer period than under all the circumstances of the case is reasonable, and such period shall not, in the absence of a special order of a Magistrate under section 187, exceed twenty-four hours exclusive of the time necessary for the journey from the place of arrest to the Magistrate’s Court.",
  },
  {
    old: "125",
    new: "144",
    title: "Order for maintenance of wives, children and parents",
    subject: "Maintenance",
    oldText:
      "If any person having sufficient means neglects or refuses to maintain—\n(a) his wife, unable to maintain herself, or\n(b) his legitimate or illegitimate minor child, whether married or not, unable to maintain itself, or\n(c) his legitimate or illegitimate child (not being a married daughter) who has attained majority, where such child is, by reason of any physical or mental abnormality or injury unable to maintain itself, or\n(d) his father or mother, unable to maintain himself or herself,\na Magistrate of the first class may, upon proof of such neglect or refusal, order such person to make a monthly allowance for the maintenance of his wife or such child, father or mother, at such monthly rate as such Magistrate thinks fit…",
    newText:
      "If any person having sufficient means neglects or refuses to maintain—\n(a) his wife, unable to maintain herself, or\n(b) his legitimate or illegitimate minor child, whether married or not, unable to maintain itself, or\n(c) his legitimate or illegitimate child (not being a married daughter) who has attained majority, where such child is, by reason of any physical or mental abnormality or injury unable to maintain itself, or\n(d) his father or mother, unable to maintain himself or herself,\na Magistrate of the first class may, upon proof of such neglect or refusal, order such person to make a monthly allowance for the maintenance of his wife or such child, father or mother, at such monthly rate as such Magistrate thinks fit…",
  },
  {
    old: "144",
    new: "163",
    title: "Power to issue order in urgent cases of nuisance or apprehended danger",
    subject: "Section 144 orders",
    oldText:
      "In cases where, in the opinion of a District Magistrate, a Sub-divisional Magistrate or any other Executive Magistrate specially empowered by the State Government in this behalf, there is sufficient ground for proceeding under this section and immediate prevention or speedy remedy is desirable…",
    newText:
      "In cases where, in the opinion of a District Magistrate, a Sub-divisional Magistrate or any other Executive Magistrate specially empowered by the State Government in this behalf, there is sufficient ground for proceeding under this section and immediate prevention or speedy remedy is desirable…",
  },
  {
    old: "154",
    new: "173",
    title: "Information in cognizable cases (FIR)",
    subject: "FIR",
    change: "amended",
    note: "Allows information to be given electronically (e-FIR) and adds a preliminary enquiry for certain offences.",
    oldText:
      "Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant; and every such information, whether given in writing or reduced to writing as aforesaid, shall be signed by the person giving it…",
    newText:
      "Every information relating to the commission of a cognizable offence, irrespective of the area where the offence is committed, may be given orally or by electronic communication to an officer in charge of a police station, and if given orally… Information relating to an offence of a cognizable nature against a woman may also be recorded by a woman police officer… Preliminary enquiry may be conducted for certain offences punishable with three years or more but less than seven years.",
  },
  {
    old: "156(3)",
    new: "175(3)",
    title: "Magistrate may order investigation",
    subject: "Magistrate-ordered investigation",
    oldText:
      "Any Magistrate empowered under section 190 may order such an investigation as above-mentioned.",
    newText:
      "Any Magistrate empowered under section 210 may order such an investigation as above-mentioned.",
  },
  {
    old: "161",
    new: "180",
    title: "Examination of witnesses by police",
    subject: "Police statements",
    oldText:
      "Any police officer making an investigation under this Chapter, or any police officer not below such rank as the State Government may, by general or special order, prescribe in this behalf, acting on the requisition of such officer, may examine orally any person supposed to be acquainted with the facts and circumstances of the case.",
    newText:
      "Any police officer making an investigation under this Chapter, or any police officer not below such rank as the State Government may, by general or special order, prescribe in this behalf, acting on the requisition of such officer, may examine orally any person supposed to be acquainted with the facts and circumstances of the case.",
  },
  {
    old: "164",
    new: "183",
    title: "Recording of confessions and statements",
    subject: "Section 164 statements",
    oldText:
      "Any Metropolitan Magistrate or Judicial Magistrate may, whether or not he has jurisdiction in the case, record any confession or statement made to him in the course of an investigation under this Chapter or under any other law for the time being in force, or at any time afterwards before the commencement of the inquiry or trial…",
    newText:
      "Any Metropolitan Magistrate or Judicial Magistrate may, whether or not he has jurisdiction in the case, record any confession or statement made to him in the course of an investigation under this Chapter or under any other law for the time being in force, or at any time afterwards before the commencement of the inquiry or trial…",
  },
  {
    old: "167",
    new: "187",
    title: "Procedure when investigation cannot be completed in twenty-four hours",
    subject: "Police remand / default bail clock",
    oldText:
      "Whenever any person is arrested and detained in custody, and it appears that the investigation cannot be completed within the period of twenty-four hours fixed by section 57, and there are grounds for believing that the accusation or information is well-founded, the officer in charge of the police station or the police officer making the investigation… shall forthwith transmit to the nearest Judicial Magistrate a copy of the entries in the diary relating to the case, and shall at the same time forward the accused to such Magistrate.",
    newText:
      "Whenever any person is arrested and detained in custody, and it appears that the investigation cannot be completed within the period of twenty-four hours fixed by section 58, and there are grounds for believing that the accusation or information is well-founded, the officer in charge of the police station or the police officer making the investigation… shall forthwith transmit to the nearest Judicial Magistrate a copy of the entries in the diary relating to the case, and shall at the same time forward the accused to such Magistrate.",
  },
  {
    old: "173",
    new: "193",
    title: "Report of police officer on completion of investigation",
    subject: "Charge-sheet",
    oldText:
      "Every investigation under this Chapter shall be completed without unnecessary delay. As soon as it is completed, the officer in charge of the police station shall forward to a Magistrate empowered to take cognizance of the offence on a police report, a report in the form prescribed by the State Government…",
    newText:
      "Every investigation under this Chapter shall be completed without unnecessary delay. As soon as it is completed, the officer in charge of the police station shall forward to a Magistrate empowered to take cognizance of the offence on a police report, a report in the form prescribed by the State Government…",
  },
  {
    old: "197",
    new: "218",
    title: "Prosecution of judges and public servants",
    subject: "Sanction to prosecute",
    oldText:
      "When any person who is or was a Judge or Magistrate or a public servant not removable from his office save by or with the sanction of the Government is accused of any offence alleged to have been committed by him while acting or purporting to act in the discharge of his official duty, no Court shall take cognizance of such offence except with the previous sanction…",
    newText:
      "When any person who is or was a Judge or Magistrate or a public servant not removable from his office save by or with the sanction of the Government is accused of any offence alleged to have been committed by him while acting or purporting to act in the discharge of his official duty, no Court shall take cognizance of such offence except with the previous sanction…",
  },
  {
    old: "200",
    new: "223",
    title: "Examination of complainant",
    subject: "Complaint examination",
    oldText:
      "A Magistrate taking cognizance of an offence on complaint shall examine upon oath the complainant and the witnesses present, if any, and the substance of such examination shall be reduced to writing and shall be signed by the complainant and the witnesses, and also by the Magistrate…",
    newText:
      "A Magistrate taking cognizance of an offence on complaint shall examine upon oath the complainant and the witnesses present, if any, and the substance of such examination shall be reduced to writing and shall be signed by the complainant and the witnesses, and also by the Magistrate…",
  },
  {
    old: "204",
    new: "227",
    title: "Issue of process",
    subject: "Issue of process",
    oldText:
      "If in the opinion of a Magistrate taking cognizance of an offence there is sufficient ground for proceeding, and the case appears to be—\n(a) a summons-case, he shall issue his summons for the attendance of the accused, or\n(b) a warrant-case, he may issue a warrant, or, if he thinks fit, a summons, for causing the accused to be brought or to appear at a certain time before such Magistrate or (if he has no jurisdiction himself) some other Magistrate having jurisdiction.",
    newText:
      "If in the opinion of a Magistrate taking cognizance of an offence there is sufficient ground for proceeding, and the case appears to be—\n(a) a summons-case, he shall issue his summons for the attendance of the accused, or\n(b) a warrant-case, he may issue a warrant, or, if he thinks fit, a summons, for causing the accused to be brought or to appear at a certain time before such Magistrate or (if he has no jurisdiction himself) some other Magistrate having jurisdiction.",
  },
  {
    old: "227",
    new: "250",
    title: "Discharge (trial before Court of Session)",
    subject: "Discharge",
    oldText:
      "If, upon consideration of the record of the case and the documents submitted therewith, and after hearing the submissions of the accused and the prosecution in this behalf, the Judge considers that there is not sufficient ground for proceeding against the accused, he shall discharge the accused and record his reasons for so doing.",
    newText:
      "If, upon consideration of the record of the case and the documents submitted therewith, and after hearing the submissions of the accused and the prosecution in this behalf, the Judge considers that there is not sufficient ground for proceeding against the accused, he shall discharge the accused and record his reasons for so doing.",
  },
  {
    old: "228",
    new: "251",
    title: "Framing of charge (trial before Court of Session)",
    subject: "Framing of charge",
    oldText:
      "If, after such consideration and hearing as aforesaid, the Judge is of opinion that there is ground for presuming that the accused has committed an offence which—\n(a) is not exclusively triable by the Court of Session, he may, frame a charge against the accused and, by order, transfer the case for trial to the Chief Judicial Magistrate…\n(b) is exclusively triable by the Court, he shall frame in writing a charge against the accused.",
    newText:
      "If, after such consideration and hearing as aforesaid, the Judge is of opinion that there is ground for presuming that the accused has committed an offence which—\n(a) is not exclusively triable by the Court of Session, he may, frame a charge against the accused and, by order, transfer the case for trial to the Chief Judicial Magistrate…\n(b) is exclusively triable by the Court, he shall frame in writing a charge against the accused.",
  },
  {
    old: "313",
    new: "351",
    title: "Power to examine the accused",
    subject: "Examination of accused",
    oldText:
      "In every inquiry or trial, for the purpose of enabling the accused personally to explain any circumstances appearing in the evidence against him, the Court—\n(a) may at any stage, without previously warning the accused, put such questions to him as the Court considers necessary;\n(b) shall, after the witnesses for the prosecution have been examined and before he is called on for his defence, question him generally on the case…",
    newText:
      "In every inquiry or trial, for the purpose of enabling the accused personally to explain any circumstances appearing in the evidence against him, the Court—\n(a) may at any stage, without previously warning the accused, put such questions to him as the Court considers necessary;\n(b) shall, after the witnesses for the prosecution have been examined and before he is called on for his defence, question him generally on the case…",
  },
  {
    old: "320",
    new: "359",
    title: "Compounding of offences",
    subject: "Compounding",
    oldText: "The offences punishable under the sections of the Indian Penal Code specified in the first two columns of the Table next following may be compounded by the persons mentioned in the third column of that Table…",
    newText: "The offences punishable under the sections of the Bharatiya Nyaya Sanhita, 2023 specified in the first two columns of the Table next following may be compounded by the persons mentioned in the third column of that Table…",
  },
  {
    old: "357",
    new: "395",
    title: "Order to pay compensation",
    subject: "Compensation",
    oldText:
      "When a Court imposes a sentence of fine or a sentence (including a sentence of death) of which fine forms a part, the Court may, when passing judgment, order the whole or any part of the fine recovered to be applied—\n(a) in defraying the expenses properly incurred in the prosecution;\n(b) in the payment to any person of compensation for any loss or injury caused by the offence…",
    newText:
      "When a Court imposes a sentence of fine or a sentence (including a sentence of death) of which fine forms a part, the Court may, when passing judgment, order the whole or any part of the fine recovered to be applied—\n(a) in defraying the expenses properly incurred in the prosecution;\n(b) in the payment to any person of compensation for any loss or injury caused by the offence…",
  },
  {
    old: "389",
    new: "430",
    title: "Suspension of sentence pending appeal; release of appellant on bail",
    subject: "Suspension of sentence",
    oldText:
      "Pending any appeal by a convicted person, the Appellate Court may, for reasons to be recorded by it in writing, order that the execution of the sentence or order appealed against be suspended and, also, if he is in confinement, that he be released on bail, or on his own bond…",
    newText:
      "Pending any appeal by a convicted person, the Appellate Court may, for reasons to be recorded by it in writing, order that the execution of the sentence or order appealed against be suspended and, also, if he is in confinement, that he be released on bail, or on his own bond…",
  },
  {
    old: "397",
    new: "438",
    title: "Calling for records to exercise powers of revision",
    subject: "Revision",
    oldText:
      "The High Court or any Sessions Judge may call for and examine the record of any proceeding before any inferior Criminal Court situate within its or his local jurisdiction for the purpose of satisfying itself or himself as to the correctness, legality or propriety of any finding, sentence or order…",
    newText:
      "The High Court or any Sessions Judge may call for and examine the record of any proceeding before any inferior Criminal Court situate within its or his local jurisdiction for the purpose of satisfying itself or himself as to the correctness, legality or propriety of any finding, sentence or order…",
  },
  {
    old: "436",
    new: "478",
    title: "In what cases bail to be taken",
    subject: "Bailable offences",
    oldText:
      "When any person other than a person accused of a non-bailable offence is arrested or detained without warrant by an officer in charge of a police station, or appears or is brought before a Court, and is prepared at any time while in the custody of such officer or at any stage of the proceeding before such Court to give bail, such person shall be released on bail…",
    newText:
      "When any person other than a person accused of a non-bailable offence is arrested or detained without warrant by an officer in charge of a police station, or appears or is brought before a Court, and is prepared at any time while in the custody of such officer or at any stage of the proceeding before such Court to give bail, such person shall be released on bail…",
  },
  {
    old: "437",
    new: "480",
    title: "When bail may be taken in case of non-bailable offence",
    subject: "Bail in non-bailable offences",
    oldText:
      "When any person accused of, or suspected of, the commission of any non-bailable offence is arrested or detained without warrant by an officer in charge of a police station or appears or is brought before a Court other than the High Court or Court of Session, he may be released on bail…",
    newText:
      "When any person accused of, or suspected of, the commission of any non-bailable offence is arrested or detained without warrant by an officer in charge of a police station or appears or is brought before a Court other than the High Court or Court of Session, he may be released on bail…",
  },
  {
    old: "438",
    new: "482",
    title: "Direction for grant of bail to person apprehending arrest (anticipatory bail)",
    subject: "Anticipatory bail",
    oldText:
      "Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section that in the event of such arrest he shall be released on bail; and that Court may, after taking into consideration… either reject the application forthwith or issue an interim order for the grant of anticipatory bail…",
    newText:
      "Where any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section that in the event of such arrest he shall be released on bail; and that Court may, after taking into consideration… either reject the application forthwith or issue an interim order for the grant of anticipatory bail…",
  },
  {
    old: "439",
    new: "483",
    title: "Special powers of High Court or Court of Session regarding bail",
    subject: "Special bail powers",
    oldText:
      "A High Court or Court of Session may direct—(a) that any person accused of an offence and in custody be released on bail, and if the offence is of the nature specified in subsection (3) of section 437, may impose any condition which it considers necessary…\n(b) that any condition imposed by a Magistrate when releasing any person on bail be set aside or modified…",
    newText:
      "A High Court or Court of Session may direct—(a) that any person accused of an offence and in custody be released on bail, and if the offence is of the nature specified in subsection (3) of section 480, may impose any condition which it considers necessary…\n(b) that any condition imposed by a Magistrate when releasing any person on bail be set aside or modified…",
  },
  {
    old: "482",
    new: "528",
    title: "Saving of inherent powers of High Court",
    subject: "Inherent powers",
    oldText:
      "Nothing in this Code shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Code, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.",
    newText:
      "Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.",
  },
  {
    old: null,
    new: "107",
    title: "Attachment, forfeiture or restoration of property (proceeds of crime)",
    subject: "Proceeds of crime",
    change: "new",
    newText:
      "Where a police officer making an investigation has reason to believe that any property is derived or obtained, directly or indirectly, as a result of a criminal activity or the commission of an offence, he may, with the approval of the Superintendent of Police or Commissioner of Police, make an application to the Court or Magistrate… for attachment of such property.",
  },
  {
    old: null,
    new: "356",
    title: "Inquiry, trial or judgment in absentia of proclaimed offender",
    subject: "Trial in absentia",
    change: "new",
    newText:
      "Where a person declared as a proclaimed offender absconds to evade trial and there is no immediate prospect of arresting him, the Court may proceed with trial after taking necessary steps including publishing a notice, and pronounce judgment in the absence of the accused.",
  },
  {
    old: null,
    new: "530",
    title: "Trial and proceedings to be held in electronic mode",
    subject: "Electronic proceedings",
    change: "new",
    newText:
      "All trials, inquiries and proceedings under this Sanhita, including examination of complainant and witnesses, recording of evidence, and pronouncement of judgments may be held in electronic mode, by use of electronic communication or use of audio-video electronic means.",
  },
];

const ieaBsa: Mapping[] = [
  {
    old: "1",
    new: "1",
    title: "Short title, application and commencement",
    subject: "Short title",
    oldText: "This Act may be called the Indian Evidence Act, 1872. It extends to the whole of India and applies to all judicial proceedings in or before any Court…",
    newText: "This Act may be called the Bharatiya Sakshya Adhiniyam, 2023. It extends to the whole of India and applies to all judicial proceedings in or before any Court…",
  },
  {
    old: "3",
    new: "2",
    title: "Interpretation clause (definitions)",
    subject: "Definitions",
    oldText: "In this Act the following words and expressions are used in the following senses, unless a contrary intention appears from the context:— …",
    newText: "In this Adhiniyam, unless the context otherwise requires,— …",
  },
  {
    old: "17",
    new: "15",
    title: "Admission defined",
    subject: "Admission",
    oldText:
      "An admission is a statement, oral or documentary or contained in electronic form, which suggests any inference as to any fact in issue or relevant fact, and which is made by any of the persons, and under the circumstances, hereinafter mentioned.",
    newText:
      "An admission is a statement, oral or documentary or contained in electronic form, which suggests any inference as to any fact in issue or relevant fact, and which is made by any of the persons, and under the circumstances, hereinafter mentioned.",
  },
  {
    old: "24",
    new: "22",
    title: "Confession caused by inducement, threat, coercion or promise",
    subject: "Induced confession",
    oldText:
      "A confession made by an accused person is irrelevant in a criminal proceeding, if the making of the confession appears to the Court to have been caused by any inducement, threat or promise having reference to the charge against the accused person, proceeding from a person in authority…",
    newText:
      "A confession made by an accused person is irrelevant in a criminal proceeding, if the making of the confession appears to the Court to have been caused by any inducement, threat, coercion or promise having reference to the charge against the accused person, proceeding from a person in authority…",
    change: "amended",
    note: "“Coercion” is expressly added.",
  },
  {
    old: "25",
    new: "23(1)",
    title: "Confession to police officer not to be proved",
    subject: "Confession to police",
    oldText: "No confession made to a police officer shall be proved as against a person accused of any offence.",
    newText: "No confession made to a police officer shall be proved as against a person accused of any offence.",
  },
  {
    old: "26",
    new: "23(2)",
    title: "Confession by accused while in custody of police",
    subject: "Confession in police custody",
    oldText: "No confession made by any person whilst he is in the custody of a police officer, unless it be made in the immediate presence of a Magistrate, shall be proved as against such person.",
    newText: "No confession made by any person whilst he is in the custody of a police officer, unless it be made in the immediate presence of a Magistrate, shall be proved as against such person.",
  },
  {
    old: "27",
    new: "23(2) proviso",
    title: "How much of information received from accused may be proved",
    subject: "Discovery under section 27",
    oldText:
      "Provided that, when any fact is deposed to as discovered in consequence of information received from a person accused of any offence, in the custody of a police officer, so much of such information, whether it amounts to a confession or not, as relates distinctly to the fact thereby discovered, may be proved.",
    newText:
      "Provided that, when any fact is deposed to as discovered in consequence of information received from a person accused of any offence, in the custody of a police officer, so much of such information, whether it amounts to a confession or not, as relates distinctly to the fact thereby discovered, may be proved.",
  },
  {
    old: "32",
    new: "26",
    title: "Statements by persons who cannot be called as witnesses (incl. dying declaration)",
    subject: "Dying declaration",
    oldText:
      "Statements, written or verbal, of relevant facts made by a person who is dead, or who cannot be found, or who has become incapable of giving evidence, or whose attendance cannot be procured without an amount of delay or expense which under the circumstances of the case appears to the Court unreasonable, are themselves relevant facts in the following cases…",
    newText:
      "Statements, written or verbal, of relevant facts made by a person who is dead, or who cannot be found, or who has become incapable of giving evidence, or whose attendance cannot be procured without an amount of delay or expense which under the circumstances of the case appears to the Court unreasonable, are themselves relevant facts in the following cases…",
  },
  {
    old: "45",
    new: "39",
    title: "Opinions of experts",
    subject: "Expert opinion",
    oldText:
      "When the Court has to form an opinion upon a point of foreign law or of science or art, or as to identity of handwriting or finger impressions, the opinions upon that point of persons specially skilled in such foreign law, science or art, or in questions as to identity of handwriting or finger impressions are relevant facts.",
    newText:
      "When the Court has to form an opinion upon a point of foreign law or of science or art, or as to identity of handwriting or finger impressions, the opinions upon that point of persons specially skilled in such foreign law, science or art, or in questions as to identity of handwriting or finger impressions, and such persons are called experts.",
  },
  {
    old: "65B",
    new: "63",
    title: "Admissibility of electronic records",
    subject: "Electronic records",
    change: "amended",
    note: "Requires a certificate in the prescribed format set out in the Schedule.",
    oldText:
      "Notwithstanding anything contained in this Act, any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media produced by a computer shall be deemed to be also a document… if the conditions mentioned in this section are satisfied in relation to the information and computer in question…",
    newText:
      "Notwithstanding anything contained in this Adhiniyam, any information contained in an electronic record which is printed on paper, stored, recorded or copied in optical or magnetic media or semiconductor memory which is produced by a computer or any communication device or otherwise stored, recorded or copied in any electronic form shall be deemed to be also a document… The certificate shall be submitted in the form specified in the Schedule.",
  },
  {
    old: "101",
    new: "104",
    title: "Burden of proof",
    subject: "Burden of proof",
    oldText: "Whoever desires any Court to give judgment as to any legal right or liability dependent on the existence of facts which he asserts, must prove that those facts exist.",
    newText: "Whoever desires any Court to give judgment as to any legal right or liability dependent on the existence of facts which he asserts, must prove that those facts exist.",
  },
  {
    old: "106",
    new: "109",
    title: "Burden of proving fact especially within knowledge",
    subject: "Special knowledge",
    oldText: "When any fact is especially within the knowledge of any person, the burden of proving that fact is upon him.",
    newText: "When any fact is especially within the knowledge of any person, the burden of proving that fact is upon him.",
  },
  {
    old: "113A",
    new: "117",
    title: "Presumption as to abetment of suicide by a married woman",
    subject: "Presumption — abetment of suicide",
    oldText:
      "When the question is whether the commission of suicide by a woman had been abetted by her husband or any relative of her husband and it is shown that she had committed suicide within a period of seven years from the date of her marriage and that her husband or such relative of her husband had subjected her to cruelty, the Court may presume, having regard to all the other circumstances of the case, that such suicide had been abetted by her husband or by such relative of her husband.",
    newText:
      "When the question is whether the commission of suicide by a woman had been abetted by her husband or any relative of her husband and it is shown that she had committed suicide within a period of seven years from the date of her marriage and that her husband or such relative of her husband had subjected her to cruelty, the Court may presume, having regard to all the other circumstances of the case, that such suicide had been abetted by her husband or by such relative of her husband.",
  },
  {
    old: "113B",
    new: "118",
    title: "Presumption as to dowry death",
    subject: "Presumption — dowry death",
    oldText:
      "When the question is whether a person has committed the dowry death of a woman and it is shown that soon before her death such woman had been subjected by such person to cruelty or harassment for, or in connection with, any demand for dowry, the Court shall presume that such person had caused the dowry death.",
    newText:
      "When the question is whether a person has committed the dowry death of a woman and it is shown that soon before her death such woman had been subjected by such person to cruelty or harassment for, or in connection with, any demand for dowry, the Court shall presume that such person had caused the dowry death.",
  },
  {
    old: "114",
    new: "119",
    title: "Court may presume existence of certain facts",
    subject: "Illustrative presumptions",
    oldText: "The Court may presume the existence of any fact which it thinks likely to have happened, regard being had to the common course of natural events, human conduct and public and private business, in their relation to the facts of the particular case.",
    newText: "The Court may presume the existence of any fact which it thinks likely to have happened, regard being had to the common course of natural events, human conduct and public and private business, in their relation to the facts of the particular case.",
  },
  {
    old: "118",
    new: "124",
    title: "Who may testify",
    subject: "Competency of witnesses",
    oldText:
      "All persons shall be competent to testify unless the Court considers that they are prevented from understanding the questions put to them, or from giving rational answers to those questions, by tender years, extreme old age, disease, whether of body or mind, or any other cause of the same kind.",
    newText:
      "All persons shall be competent to testify unless the Court considers that they are prevented from understanding the questions put to them, or from giving rational answers to those questions, by tender years, extreme old age, disease, whether of body or mind, or any other cause of the same kind.",
  },
  {
    old: "133",
    new: "138",
    title: "Accomplice",
    subject: "Accomplice",
    oldText:
      "An accomplice shall be a competent witness against an accused person; and a conviction is not illegal merely because it proceeds upon the uncorroborated testimony of an accomplice.",
    newText:
      "An accomplice shall be a competent witness against an accused person; and a conviction is not illegal merely because it proceeds upon the uncorroborated testimony of an accomplice.",
  },
  {
    old: "137",
    new: "142",
    title: "Examination-in-chief, cross-examination and re-examination",
    subject: "Examination of witnesses",
    oldText:
      "The examination of a witness by the party who calls him shall be called his examination-in-chief. The examination of a witness by the adverse party shall be called his cross-examination. The examination of a witness, subsequent to the cross-examination by the party who called him, shall be called his re-examination.",
    newText:
      "The examination of a witness by the party who calls him shall be called his examination-in-chief. The examination of a witness by the adverse party shall be called his cross-examination. The examination of a witness, subsequent to the cross-examination by the party who called him, shall be called his re-examination.",
  },
  {
    old: "145",
    new: "148",
    title: "Cross-examination as to previous statements in writing",
    subject: "Previous statements",
    oldText:
      "A witness may be cross-examined as to previous statements made by him in writing or reduced into writing, and relevant to matters in question, without such writing being shown to him, or being proved; but, if it is intended to contradict him by the writing, his attention must, before the writing can be proved, be called to those parts of it which are to be used for the purpose of contradicting him.",
    newText:
      "A witness may be cross-examined as to previous statements made by him in writing or reduced into writing, and relevant to matters in question, without such writing being shown to him, or being proved; but, if it is intended to contradict him by the writing, his attention must, before the writing can be proved, be called to those parts of it which are to be used for the purpose of contradicting him.",
  },
  {
    old: "154",
    new: "157",
    title: "Question by party to his own witness (hostile witness)",
    subject: "Hostile witness",
    oldText: "The Court may, in its discretion, permit the person who calls a witness to put any questions to him which might be put in cross-examination by the adverse party.",
    newText: "The Court may, in its discretion, permit the person who calls a witness to put any questions to him which might be put in cross-examination by the adverse party.",
  },
  {
    old: "165",
    new: "168",
    title: "Judge's power to put questions or order production",
    subject: "Judge’s questions",
    oldText:
      "The Judge may, in order to discover or to obtain proper proof of relevant facts, ask any question he pleases, in any form, at any time, of any witness, or of the parties about any fact relevant or irrelevant; and may order the production of any document or thing…",
    newText:
      "The Judge may, in order to discover or to obtain proper proof of relevant facts, ask any question he pleases, in any form, at any time, of any witness, or of the parties about any fact relevant or irrelevant; and may order the production of any document or thing…",
  },
];

export const converterPairs: ConverterPair[] = [
  {
    slug: "ipc-bns",
    from: "IPC",
    to: "BNS",
    fromFull: "Indian Penal Code, 1860",
    toFull: "Bharatiya Nyaya Sanhita, 2023",
    example: "302",
    entries: ipcBns,
  },
  {
    slug: "crpc-bnss",
    from: "CrPC",
    to: "BNSS",
    fromFull: "Code of Criminal Procedure, 1973",
    toFull: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    example: "438",
    entries: crpcBnss,
  },
  {
    slug: "iea-bsa",
    from: "Evidence Act",
    to: "BSA",
    fromFull: "Indian Evidence Act, 1872",
    toFull: "Bharatiya Sakshya Adhiniyam, 2023",
    example: "65B",
    entries: ieaBsa,
  },
];
