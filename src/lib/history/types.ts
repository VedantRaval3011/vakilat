export type HistoryKind = "chat" | "draft" | "moot" | "translation";

export type HistoryItem = {
  id: string;
  kind: HistoryKind;
  title: string;
  subtitle: string;
  href: string;
  updatedAt: string;
};
