/** Browser-side helpers to pull plain text from an uploaded file. */

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Minimal ZIP reader that returns the inflated bytes for one entry path. */
async function zipEntry(buf: ArrayBuffer, path: string): Promise<Uint8Array | null> {
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length - 30; i++) {
    if (bytes[i] !== 0x50 || bytes[i + 1] !== 0x4b || bytes[i + 2] !== 0x03 || bytes[i + 3] !== 0x04) continue;
    const view = new DataView(buf, i);
    const method = view.getUint16(8, true);
    const compSize = view.getUint32(18, true);
    const nameLen = view.getUint16(26, true);
    const extraLen = view.getUint16(28, true);
    const nameStart = i + 30;
    const entryName = new TextDecoder().decode(bytes.subarray(nameStart, nameStart + nameLen));
    if (entryName !== path) continue;
    const dataStart = nameStart + nameLen + extraLen;
    const compressed = bytes.subarray(dataStart, dataStart + compSize);
    if (method === 0) return compressed;
    if (method === 8) return inflateRaw(compressed);
    return null;
  }
  return null;
}

function stripXml(xml: string) {
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractUploadText(file: File): Promise<{ text: string; note?: string }> {
  const lower = file.name.toLowerCase();
  if (file.type === "text/plain" || lower.endsWith(".txt")) {
    return { text: await file.text() };
  }

  if (lower.endsWith(".docx") || file.type.includes("wordprocessingml")) {
    try {
      const xml = await zipEntry(await file.arrayBuffer(), "word/document.xml");
      if (!xml) return { text: "", note: "Could not read that Word file." };
      const text = stripXml(new TextDecoder().decode(xml));
      if (!text) return { text: "", note: "That Word file had no readable text." };
      return { text };
    } catch {
      return { text: "", note: "Could not read that Word file." };
    }
  }

  if (lower.endsWith(".doc")) {
    return {
      text: "",
      note: "Old .doc files aren't supported. Save as .docx or paste the text.",
    };
  }

  if (lower.endsWith(".pdf") || file.type === "application/pdf") {
    // Lightweight PDF text scrape: pull printable strings between BT/ET blocks when present.
    const buf = await file.arrayBuffer();
    const raw = new TextDecoder("latin1").decode(new Uint8Array(buf));
    const chunks: string[] = [];
    const re = /\((?:\\.|[^\\)]){2,}\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) && chunks.length < 4000) {
      const s = m[0]
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\");
      if (/[A-Za-z\u0900-\u097F]{3,}/.test(s)) chunks.push(s);
    }
    const text = chunks.join(" ").replace(/\s+/g, " ").trim();
    if (text.length > 80) return { text: text.slice(0, 40_000) };
    return {
      text: `[PDF uploaded: ${file.name}]\n\nThis PDF looks scanned or encoded in a way we can't read in the browser. Paste the text, or use a text-based PDF.`,
      note: "Limited PDF text extraction — paste the text if the result looks wrong.",
    };
  }

  return { text: "", note: "Use a PDF, Word (.docx) or text file." };
}
