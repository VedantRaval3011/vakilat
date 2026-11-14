const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A printable HTML document from plain text (paragraphs separated by blank lines). */
export function documentHtml(title: string, body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.6;margin:2.5cm;white-space:normal}
    p{margin:0 0 12pt;text-align:justify}
  </style></head><body>${paragraphs}</body></html>`;
}

const fileName = (title: string) => `${title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "document"}.doc`;

/** Downloads the text as a Word-compatible .doc file. */
export function downloadWord(title: string, body: string) {
  const url = URL.createObjectURL(new Blob([documentHtml(title, body)], { type: "application/msword" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: fileName(title) });
  a.click();
  URL.revokeObjectURL(url);
}

/** Opens the browser print dialog, from which the user can also save a PDF. */
export function printDocument(title: string, body: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(documentHtml(title, body));
  w.document.close();
  w.focus();
  w.print();
}
