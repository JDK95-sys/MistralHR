// ─── Document Parser ───────────────────────────────────────────────
// Extracts plain text from PDF, DOCX, TXT and XLSX files.
// Each parser returns a normalised string ready for chunking.

export type SupportedFileType = "pdf" | "docx" | "txt" | "xlsx";

export interface ParseResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  fileType: SupportedFileType;
}

// ─── Detect file type ──────────────────────────────────────────────
export function detectFileType(fileName: string): SupportedFileType | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map: Record<string, SupportedFileType> = {
    pdf: "pdf",
    docx: "docx",
    doc: "docx",
    txt: "txt",
    text: "txt",
    md: "txt",
    xlsx: "xlsx",
    xls: "xlsx",
  };
  return map[ext ?? ""] ?? null;
}

// ─── Main parse entry point ────────────────────────────────────────
export async function parseDocument(
  buffer: Buffer,
  fileName: string
): Promise<ParseResult> {
  const fileType = detectFileType(fileName);

  if (!fileType) {
    throw new Error(
      `Unsupported file type: ${fileName}. Supported: PDF, DOCX, TXT, XLSX`
    );
  }

  switch (fileType) {
    case "pdf":   return parsePDF(buffer);
    case "docx":  return parseDOCX(buffer);
    case "txt":   return parseTXT(buffer);
    case "xlsx":  return parseXLSX(buffer);
  }
}

// ─── PDF Parser ────────────────────────────────────────────────────
async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  // Dynamic import — pdf-parse is a large dependency
  const pdfParse = (await import("pdf-parse")).default;

  const data = await pdfParse(buffer, {
    // Don't run page render functions — just extract text
    pagerender: undefined,
  });

  const text = cleanText(data.text);

  return {
    text,
    pageCount: data.numpages,
    wordCount: countWords(text),
    fileType: "pdf",
  };
}

// ─── DOCX Parser ───────────────────────────────────────────────────
async function parseDOCX(buffer: Buffer): Promise<ParseResult> {
  const mammoth = await import("mammoth");

  const result = await mammoth.extractRawText({ buffer });

  if (result.messages.length > 0) {
    console.warn("DOCX parse warnings:", result.messages);
  }

  const text = cleanText(result.value);

  return {
    text,
    wordCount: countWords(text),
    fileType: "docx",
  };
}

// ─── TXT Parser ────────────────────────────────────────────────────
function parseTXT(buffer: Buffer): ParseResult {
  const text = cleanText(buffer.toString("utf-8"));

  return {
    text,
    wordCount: countWords(text),
    fileType: "txt",
  };
}

// ─── XLSX Parser ───────────────────────────────────────────────────
// For Excel, we extract text row by row from all sheets.
// Each row becomes a line; sheets are separated by headers.
// This works well for policy tables, benefits grids, etc.
async function parseXLSX(buffer: Buffer): Promise<ParseResult> {
  const XLSX = await import("xlsx");

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const textParts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    textParts.push(`\n## ${sheetName}\n`);

    // Convert sheet to CSV-style text
    const csv = XLSX.utils.sheet_to_csv(sheet, {
      blankrows: false,
      skipHidden: true,
    });

    // Convert CSV rows to readable text
    const rows = csv
      .split("\n")
      .map((row) =>
        row
          .split(",")
          .map((cell) => cell.replace(/^"|"$/g, "").trim())
          .filter((cell) => cell.length > 0)
          .join(" | ")
      )
      .filter((row) => row.trim().length > 0);

    textParts.push(rows.join("\n"));
  }

  const text = cleanText(textParts.join("\n\n"));

  return {
    text,
    wordCount: countWords(text),
    fileType: "xlsx",
  };
}

// ─── Text cleaning ─────────────────────────────────────────────────
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")          // Normalise line endings
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n\n")          // Form feeds → paragraph breaks
    .replace(/\t/g, " ")             // Tabs → spaces
    .replace(/[ \t]{2,}/g, " ")      // Multiple spaces → single
    .replace(/\n{4,}/g, "\n\n\n")    // Max 3 consecutive newlines
    .replace(/^\s+|\s+$/g, "")       // Trim
    // Remove common PDF artefacts
    .replace(/(\w)-\n(\w)/g, "$1$2") // Re-join hyphenated line breaks
    .replace(/\u0000/g, "")          // Null bytes
    .replace(/[\u0080-\u009f]/g, "") // Control characters
    .trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}
