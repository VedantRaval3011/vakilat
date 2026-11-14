import type { UIMessage } from "ai";

export type ResearchMode = "normal" | "deep";

export const researchModes: Record<ResearchMode, { label: string; hint: string }> = {
  normal: { label: "Quick answer", hint: "Fast, focused answers" },
  deep: { label: "Deep research", hint: "Structured research memo with issues, law, analysis and next steps" },
};

export type VidhiMetadata = { mode?: ResearchMode };
export type VidhiMessage = UIMessage<VidhiMetadata>;

export const MAX_QUESTION_CHARS = 8000;

export const attachmentRules = {
  document: { types: ["application/pdf", "text/plain"], accept: ".pdf,.txt", maxBytes: 10 * 1024 * 1024, max: 1 },
  image: { types: ["image/png", "image/jpeg", "image/webp"], accept: "image/png,image/jpeg,image/webp", maxBytes: 5 * 1024 * 1024, max: 4 },
} as const;

export type AttachmentKind = keyof typeof attachmentRules;

export const attachmentKind = (mediaType: string): AttachmentKind | null =>
  (attachmentRules.document.types as readonly string[]).includes(mediaType)
    ? "document"
    : (attachmentRules.image.types as readonly string[]).includes(mediaType)
      ? "image"
      : null;

/** Size in bytes of a base64 data URL's payload. */
export function dataUrlBytes(url: string) {
  const comma = url.indexOf(",");
  if (!url.startsWith("data:") || comma < 0) return Infinity;
  const b64 = url.length - comma - 1;
  return Math.floor((b64 * 3) / 4) - (url.endsWith("==") ? 2 : url.endsWith("=") ? 1 : 0);
}

export const profileFields = [
  { name: "nickname", label: "What should Vidhi call you?", placeholder: "e.g. Advocate Mehta, Priya", max: 30, multiline: false },
  { name: "role", label: "Your role", placeholder: "e.g. Public Prosecutor, Law student, Corporate counsel", max: 60, multiline: false },
  { name: "practice", label: "Practice areas", placeholder: "e.g. Criminal trials, bail, NDPS, cheque bounce", max: 500, multiline: true },
  { name: "jurisdiction", label: "Where you practise", placeholder: "e.g. Sessions Court Ahmedabad, Gujarat High Court", max: 100, multiline: false },
  {
    name: "preferences",
    label: "How should answers be written?",
    placeholder: "e.g. Keep answers short. Cite the BNSS section first. Answer in Gujarati when I write in Gujarati.",
    max: 2000,
    multiline: true,
  },
] as const;

export type VidhiProfile = Record<(typeof profileFields)[number]["name"], string>;

export const emptyProfile: VidhiProfile = { nickname: "", role: "", practice: "", jurisdiction: "", preferences: "" };

export const dictationLanguages = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "gu-IN", label: "ગુજરાતી" },
  { code: "mr-IN", label: "मराठी" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "മലയാളം" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
] as const;
