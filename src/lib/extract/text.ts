export async function extractText(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}
