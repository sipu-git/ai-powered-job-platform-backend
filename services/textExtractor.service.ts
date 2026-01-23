import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import path from "path";

export async function extractTextFromFileBuffer(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();

  if (ext === ".pdf") {
    const pdfModule = await import("pdf-parse");
    const pdf = (pdfModule as any).default || pdfModule;
    const data = await pdf(buffer);
    return data.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    const {
      data: { text }
    } = await Tesseract.recognize(buffer, "eng");
    return text;
  }

  throw new Error("Unsupported file type");
}
