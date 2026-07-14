import { extractText } from "@/lib/extract/text";
import { extractPdf } from "@/lib/extract/pdf";
import { extractDocx } from "@/lib/extract/docx";
import { extractImage } from "@/lib/extract/image";

export type SourceType = "text" | "pdf" | "docx" | "image";

export function detectSourceType(file: File): SourceType {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  )
    return "docx";
  if (type.startsWith("image/")) return "image";
  return "text";
}

export async function extractFromFile(
  file: File
): Promise<{ text: string; sourceType: SourceType }> {
  const sourceType = detectSourceType(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  switch (sourceType) {
    case "pdf":
      text = await extractPdf(buffer);
      break;
    case "docx":
      text = await extractDocx(buffer);
      break;
    case "image":
      text = await extractImage(buffer);
      break;
    default:
      text = await extractText(buffer);
  }

  return { text: text.trim(), sourceType };
}
