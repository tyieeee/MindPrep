// Import the internal implementation directly instead of the package root
// ("pdf-parse") — the package root runs a debug harness on import under
// bundlers/Next.js that can throw ENOENT trying to read a test fixture PDF.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extractPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text;
}
