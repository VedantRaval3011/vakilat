import "server-only";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { AiTask } from "./model";

const answer = `**Demo mode.** No AI provider key is configured, so this is a sample answer that shows how replies are formatted.

### Section 103, Bharatiya Nyaya Sanhita, 2023
- **Offence:** murder (formerly Section 302 IPC).
- **Punishment:** death or imprisonment for life, and fine.
- **Section 103(2):** murder by a group of five or more persons on grounds of race, caste, community, sex, place of birth, language or personal belief.

| | Old law | New law |
|---|---|---|
| Murder | Section 302 IPC | Section 103 BNS |

Bail for this offence is governed by Section 480 BNSS (formerly Section 437 CrPC), and the right to life and liberty under Article 21 applies. On arrest guidelines, see Arnesh Kumar v. State of Bihar (2014).

Verify against the official Gazette text before relying on it.`;

const deepMemo = `**Demo mode: deep research.** No AI provider key is configured, so this sample shows how a research memo is laid out.

### Question presented
Whether an accused charged under Section 318(4) BNS (formerly Section 420 IPC) can get regular bail after the chargesheet is filed. *Assumption: trial before a Magistrate in Gujarat.*

### Short answer
Usually yes. Once the investigation is complete and the chargesheet is filed, continued custody needs strong reasons such as a risk of absconding or tampering with witnesses.

### Applicable law
- **Section 318(4) BNS** (formerly Section 420 IPC): cheating and dishonestly inducing delivery of property; up to 7 years and fine.
- **Section 480 BNSS** (formerly Section 437 CrPC): bail in non-bailable offences by a Magistrate.
- **Section 483 BNSS** (formerly Section 439 CrPC): special powers of the Sessions Court and High Court.
- **Article 21**: personal liberty.

### Case law
- Satender Kumar Antil v. CBI (2022): guidelines on bail for offences punishable up to 7 years.
- Arnesh Kumar v. State of Bihar (2014): arrest only when necessary for offences up to 7 years.

### Analysis
The prosecution will stress the amount involved and the risk of pressure on witnesses. The defence should stress completed investigation, documentary evidence already seized, and roots in society.

### Procedure and practice
Apply first before the Magistrate under Section 480 BNSS; if rejected, move the Sessions Court under Section 483 BNSS. Attach the chargesheet, the arrest memo and proof of residence.

### Points to verify
- The exact charges in the chargesheet.
- Any later Supreme Court directions on bail under the BNSS.`;

const improved =
  "Under the Bharatiya Nagarik Suraksha Sanhita, 2023, what are the conditions and procedure for getting regular bail for an accused charged under Section 318(4) BNS (cheating) after the chargesheet has been filed in [state]? Please cite the relevant BNSS sections, the corresponding old CrPC sections, and leading Supreme Court judgments. (Demo mode: this is a sample rewrite.)";

const draft = `IN THE COURT OF [COURT NAME]

BAIL APPLICATION NO. ____ OF 2026

IN THE MATTER OF:
[Applicant name]                                        ... Applicant

VERSUS

State                                                   ... Respondent

APPLICATION UNDER SECTION 483 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 FOR GRANT OF REGULAR BAIL

MOST RESPECTFULLY SHOWETH:

1. This is a DEMO DRAFT. No AI provider key is configured, so this sample shows how drafts appear in the editor.

2. That the Applicant has been in judicial custody since [date of arrest] in connection with FIR No. [number] registered at [police station].

3. That the Applicant has no criminal antecedents and has deep roots in society, and there is no likelihood of his absconding or tampering with evidence.

PRAYER

In view of the above, it is most respectfully prayed that this Hon'ble Court may be pleased to release the Applicant on bail on such terms and conditions as it deems fit.

APPLICANT
THROUGH

[Advocate name]
[Enrolment number]

VERIFICATION
Verified at [place] on [date] that the contents of the above application are true and correct to my knowledge and belief.`;

const usage = {
  inputTokens: { total: 0, noCache: 0, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 0, text: 0, reasoning: undefined },
};

const benchReplies = [
  "OPPOSING COUNSEL: My Lord, my learned friend makes a sweeping submission without a single authority. I object to it being taken on record as settled law.\n\nBENCH: *(Demo bench — no AI key is configured.)* Counsel, the objection has some force. What is the single strongest authority for your proposition, and how are the facts here different?",
  "BENCH: That's a broad submission. Take me to the specific provision. What exactly does it say, and why does it apply on these facts?",
  "OPPOSING COUNSEL: This ground was never raised before the court below, My Lord. It cannot be urged for the first time now.\n\nBENCH: Counsel, what do you say to that?",
  "BENCH: Suppose I accept everything you have said. What precise relief are you asking this Court to grant, and on what terms?",
  "OPPOSING COUNSEL: Nothing further, My Lord.\n\nBENCH: Thank you, Counsel. You have two minutes left. Please sum up.",
];

const feedback = JSON.stringify({
  overall: 6.5,
  summary:
    "Demo feedback: no AI key is configured, so this is a sample scorecard. Your submissions were clear, but answers to the bench were sometimes indirect.",
  criteria: [
    { name: "Legal reasoning", score: 7, comment: "Correct provisions identified; cite the exact sub-section." },
    { name: "Use of authorities", score: 6, comment: "Name the case, year and the specific holding you rely on." },
    { name: "Procedural grasp", score: 7, comment: "You knew the stage of proceedings; mention limitation where relevant." },
    { name: "Handling questions", score: 6, comment: "Answer the question first, then explain." },
    { name: "Persuasion", score: 6, comment: "Lead with your strongest point instead of building up to it." },
    { name: "Consistency", score: 7, comment: "Your position on custody stayed consistent across rounds." },
    { name: "Court manners & ethics", score: 8, comment: "Courteous throughout; avoid reading out long passages." },
  ],
  strengths: ["Clear statement of facts", "Calm under questioning"],
  improvements: ["Lead with the answer when the bench asks a question", "Prepare a one-line response for each likely counter-argument"],
});

const scene = JSON.stringify({
  title: "Ramesh Patel v. State of Gujarat",
  forum: "Court of the Principal Sessions Judge, Ahmedabad",
  facts:
    "Demo scenario (no AI key is configured). Ramesh Patel, 42, a textile trader, was arrested on 3 September 2026 under Section 318(4) BNS after a supplier alleged that cheques worth ₹22 lakh given for fabric deliveries were part of a plan to cheat. Two of the cheques were dishonoured; the rest were honoured. Patel says the dispute is a civil one about short supply. The chargesheet was filed on 25 October 2026. His regular bail application was rejected by the Magistrate, who noted that the complainant fears pressure from Patel's associates.",
  issues: [
    "Whether the dispute is essentially civil in nature.",
    "Whether the applicant is entitled to regular bail after the chargesheet has been filed.",
    "Whether conditions can address the apprehension of witness pressure.",
  ],
});

const translateDemo = `यह एक डेमो अनुवाद है। कोई AI कुंजी कॉन्फ़िगर नहीं है, इसलिए यह नमूना दिखाता है कि अनुवाद परिणाम कैसे दिखते हैं।

मूल दस्तावेज़ का सार:
यह विधिक पाठ का नकली अनुवाद है। वास्तविक प्रदाता कुंजी जोड़ने पर पूरा अनुवाद यहाँ आएगा। आधिकारिक राजपत्र और मूल अंग्रेज़ी पाठ से सत्यापित करें।

(Demo mode: sample Hindi translation. Add an AI provider key for real output.)`;

const draftChatAsk = `Understood — I can prepare a first draft of that document.

To keep placeholders to a minimum, please answer these briefly:
1. Full names (and addresses, if useful) of the parties.
2. Key dates, amounts or subject matter.
3. Any clause or forum you specifically want included.

Or reply “proceed with placeholders” and I will draft now. (Demo mode: sample follow-up.)`;

const draftChatReady = `Here is a first draft — edit names and dates before filing.

<<<DRAFT>>>
${draft}
<<<END>>>`;

function draftChatReply(prompt: unknown) {
  const raw = JSON.stringify(prompt);
  const userTurns = (raw.match(/"role"\s*:\s*"user"/g) ?? []).length;
  return userTurns <= 1 ? draftChatAsk : draftChatReady;
}

function streamTextFor(task: AiTask, prompt: unknown) {
  if (task === "moot") return benchReplies[Math.floor(JSON.stringify(prompt).length / 2) % benchReplies.length];
  if (task === "draft-chat") return draftChatReply(prompt);
  if (task === "draft") return draft;
  if (task === "vidhi-deep") return deepMemo;
  if (task === "translate") return translateDemo;
  return answer;
}

function generateTextFor(task: AiTask) {
  if (task === "moot-scene") return scene;
  if (task === "vidhi-improve") return improved;
  if (task === "moot-feedback") return feedback;
  if (task === "translate") return translateDemo;
  if (task === "draft" || task === "draft-chat") return draft;
  return feedback;
}

export function demoModel(task: AiTask) {
  return new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: "text", text: generateTextFor(task) }],
      finishReason: { unified: "stop", raw: undefined },
      usage,
      warnings: [],
    }),
    doStream: async ({ prompt }) => {
      const text = streamTextFor(task, prompt);
      return {
        stream: simulateReadableStream({
          initialDelayInMs: 400,
          chunkDelayInMs: 25,
          chunks: [
            { type: "text-start", id: "t" },
            ...text.split(/(?<=\s)/).map((delta) => ({ type: "text-delta" as const, id: "t", delta })),
            { type: "text-end", id: "t" },
            { type: "finish", finishReason: { unified: "stop", raw: undefined }, usage },
          ],
        }),
      };
    },
  });
}
