# Pending

## Dev work remaining (compared with Salhakar, Nov 2026)

### Pages still showing "being built"
- [ ] **Supreme Court and High Court judgments**: list with search and filters (case title, judge, CNR or citation, exact date, year, year and month), and a page for each High Court. Needs the legal data source.
- [ ] **Judgment reader**: PDF viewer with zoom, search, fullscreen and download; Original or Translated view; Notes and Bookmark; share link with QR code; AI summary; ask Vidhi AI about this judgment.
- [ ] **Compare judgments**: two judgments side by side with an AI comparison.
- [ ] **Central and State Acts**: list with search and filters (Act ID, ministry, department, year, active or repealed), plus state pages. Needs the legal data source.
- [ ] **Act reader**: Act details (ministry, enactment and enforcement dates, Act ID), PDF viewer, Original or Translated view, Notes, Bookmark, share and download.
- [x] **Translate**: upload a PDF or DOCX (up to 20 MB), or paste text, into 13 Indian languages; download as PDF or DOCX; translation history and feedback.
- [x] **History**: one list of all chats, drafts, moot sessions, comparisons and translations, with search, type tabs, newest or oldest sort, and PDF or DOCX export.
- [x] **Settings and Profile**: edit profile and photo; professional details (state, occupation, account type); Usage tab with quota bars; Billing tab with invoices; Security tab (change password with an email code, delete account).

### Existing features that need expanding
- [x] **Code Converter**: expanded mappings with old/new section text, subject and full-text search, and a comparison page per section with Notes, share and bookmark (Gazette review still under "Content review").
- [ ] **Constitution**: all articles (currently about 69) and reading in 15 languages.
- [ ] **Glossary**: grow from 80 terms toward Salhakar's 18,800; A–Z browsing, search by meaning, Listen, and a detail page per term.
- [x] **Draft Studio**: guided chat mode (describe → follow-ups → draft), draft history sidebar, PDF/Word upload into the brief, and drafting in 13 languages.
- [x] **Hearings**: full month calendar with event types (general, hearing, deadline, notification, training), reminders and an Upcoming list.
- [x] **Notes and Saved**: folders (judgment/Act reader bookmark buttons wait on those readers).
- [x] **Header language picker**: UI chrome (sidebar, quick bar, account menu, theme/fullscreen labels) translates across the 12 listed languages; page body copy still mostly English.

### Platform features not started
- [x] **Plans and quotas**: Free, Basic, Pro and Ultimate with monthly, semi-annual and yearly billing; per-feature monthly limits (Deep research, summaries, ask-in-judgment, compare, moot, translation, drafting, uploads, downloads, calendar events, bookmarks, notes); coupon codes; Razorpay checkout stub; invoices empty state. Full paid-plan enforcement and Razorpay still pending your merchant account.
- [ ] **Notifications**: alerts for hearings, deadlines and reminders.
- [x] **Guided tours**: short first-visit walkthroughs on each tool (dismissed per user).
- [x] **Support page**: contact details and a message form.
- [x] **Help Centre** (`/help`): FAQs and tool links (sidebar "Help & resources").
- [ ] **Blog and Careers** pages (optional).
- [ ] **Email**: verification on sign-up, password reset, and the email code for changing passwords.
- [ ] **Google sign-in**.

## Pending on your side

Things only you can do (accounts, keys, payments, decisions).

### Needed now

- [ ] **AI API key** (unlocks Vidhi AI, Draft Studio, Moot Practice, Translate)
  - Get one key: Google Gemini (https://aistudio.google.com/apikey, free tier), OpenAI or Anthropic.
  - In `.env.local`, uncomment the matching `..._API_KEY=` line, paste the key, and **delete the `AI_PROVIDER=demo` line**. Restart `npm run dev`.
- [ ] **Daily limits**: how many AI questions/drafts per day for free users vs Vakilat Pro (currently 30/day for everyone, set by `AI_DAILY_LIMIT`; Vidhi AI Deep research is 5/day, set by `AI_DEEP_DAILY_LIMIT`).
- [ ] **Deep research model** (optional): set `AI_DEEP_MODEL` to a stronger model for Deep research answers; otherwise it uses the normal model.
- [ ] **Reading PDFs and photos** in Vidhi AI needs a provider that accepts files (Gemini, OpenAI GPT-4o class or Anthropic Claude all do). Demo mode only pretends to read them.
- [ ] **Legal data source** for Case Law search and Bare Acts. Pick one:
  - Indian Kanoon API (paid, judgments + acts, easiest)
  - India Code (indiacode.nic.in, official bare acts, free but needs importing)
  - eCourts / court websites (free, harder to collect)

### Content review (needs a practising advocate)

- [ ] Check the IPC→BNS, CrPC→BNSS and Evidence Act→BSA mappings in `src/lib/data/code-map.ts` against the Gazette.
- [ ] Check the Constitution article text in `src/lib/data/constitution.ts`.
- [ ] Review the Draft Studio templates (`src/lib/drafts/templates.ts`) and the AI instructions in `src/lib/ai/prompts.ts`.
- [ ] Review the five Moot Practice problems (`src/lib/moot/scenarios.ts`): facts, issues and section numbers. Add more if you like.

### Before launch

- [ ] **Domain name** and **hosting** account (e.g. Vercel).
- [ ] **Hosted database** (e.g. Neon Postgres or Turso). The app currently uses a local SQLite file.
- [ ] **File storage** (e.g. Cloudflare R2 or S3) for Vidhi AI attachments. They are currently saved inside the chat in the database, which won't scale.
- [ ] **Google sign-in**: create an OAuth client in Google Cloud Console and share the Client ID and Secret.
- [ ] **Email delivery** (password reset, verification): an account with Resend or similar, plus DNS access for your domain.
- [ ] **Payments for Vakilat Pro**: Razorpay account (needs business KYC) and final pricing.
- [ ] **Legal pages**: Privacy Policy, Terms of Use and disclaimer reviewed by a lawyer (DPDP Act, 2023 compliance).
- [ ] Final **logo / favicon** if you want to replace the current one.

### Housekeeping

- [ ] **Change the passwords** shared in chat (the Salhakar account and the `jjbarotpatan@gmail.com` account).
- [ ] Optional: upgrade Node.js to 24.22.1 or later if you still want the REA setup.
