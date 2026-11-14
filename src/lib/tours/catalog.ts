export type TourKey = "dashboard" | "vidhi" | "draft-studio" | "moot-practice" | "translate" | "hearings" | "code-converter";

export type TourStep = { title: string; body: string };

export const tours: Record<TourKey, { label: string; steps: TourStep[] }> = {
  dashboard: {
    label: "Dashboard",
    steps: [
      { title: "Your research desk", body: "This home screen gathers Case Law, AI tools and My Desk. Use the search bar to jump into Vidhi AI with a question." },
      { title: "Sidebar and quick bar", body: "Open any tool from the left sidebar or the icon row above. Go Pro and Help sit at the bottom of the sidebar." },
      { title: "Your account", body: "The avatar menu opens Settings, History and plans. You can change your photo and password under Settings." },
    ],
  },
  vidhi: {
    label: "Vidhi AI",
    steps: [
      { title: "Ask in plain language", body: "Type or speak a legal question. Switch Quick answer and Deep research from the composer." },
      { title: "Attach files", body: "Add a PDF or a photo of an order when the provider supports files. Demo mode pretends to read them." },
      { title: "Sources and history", body: "Open Sources on an answer, pin chats in the left list, and personalise how Vidhi writes for your practice." },
    ],
  },
  "draft-studio": {
    label: "Draft Studio",
    steps: [
      {
        title: "Templates or guided chat",
        body: "Fill a form template, or choose “Describe what you need” so Vidhi asks follow-ups and drafts in your language.",
      },
      { title: "Edit and export", body: "Tweak the text in the editor, then download Word or print to PDF. Drafts are saved in the sidebar and in History." },
    ],
  },
  "moot-practice": {
    label: "Moot Practice",
    steps: [
      { title: "Set up the hearing", body: "Pick a problem or describe your own matter, choose your side and how tough the bench should be." },
      { title: "Argue and get scored", body: "Submit rounds of oral argument. When you close the hearing, Vidhi returns a scorecard you can export." },
    ],
  },
  translate: {
    label: "Translate",
    steps: [
      { title: "Paste or upload", body: "Paste text, or upload a PDF or Word file up to 20 MB. Pick one of 13 Indian languages." },
      { title: "Download and rate", body: "Export the result as PDF or Word, leave a thumbs rating, and reopen past translations from the side list." },
    ],
  },
  hearings: {
    label: "Hearings",
    steps: [
      { title: "Month calendar", body: "Dots mark days with events. Filter by hearing, deadline, training and other types." },
      { title: "Reminders", body: "Set a reminder when you add an event. Due reminders appear above the Upcoming list." },
    ],
  },
  "code-converter": {
    label: "Code Converter",
    steps: [
      { title: "Old law to new", body: "Browse IPC→BNS, CrPC→BNSS or Evidence Act→BSA mappings. Search by section number or subject." },
      { title: "Save what you need", body: "Bookmark a section to find it again under Saved." },
    ],
  },
};
