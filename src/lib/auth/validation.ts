export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[6-9]\d{9}$/;

export const passwordRules = [
  { label: "8+ characters", test: (pw: string) => pw.length >= 8 },
  { label: "A letter", test: (pw: string) => /[a-zA-Z]/.test(pw) },
  { label: "A number", test: (pw: string) => /\d/.test(pw) },
];

export function passwordIssue(pw: string) {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (!/[a-zA-Z]/.test(pw)) return "Include at least one letter.";
  if (!/\d/.test(pw)) return "Include at least one number.";
  return null;
}
