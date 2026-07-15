import { anthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";

const OCR_PROMPT =
  "Transcribe ALL text visible in this image exactly as written, preserving reading order and line breaks. It is a photo or scan of study notes. Output ONLY the transcribed text — no commentary, no markdown fences.";

// Transcription doesn't need the smart model — default to the lite model,
// which has a much larger free-tier quota, and keep the configured main
// model as a fallback. Overridable via GEMINI_OCR_MODEL.
const OCR_MODELS = [
  process.env.GEMINI_OCR_MODEL || "gemini-3.1-flash-lite",
  process.env.GEMINI_MODEL || "gemini-flash-latest",
];

export async function extractImage(
  buffer: Buffer,
  mimeType = "image/jpeg"
): Promise<string> {
  if (process.env.GEMINI_API_KEY) return extractWithGemini(buffer, mimeType);
  if (process.env.ANTHROPIC_API_KEY) return extractWithClaude(buffer, mimeType);
  return extractWithTesseract(buffer);
}

async function extractWithGemini(buffer: Buffer, mimeType: string): Promise<string> {
  let lastError: unknown;
  for (const model of OCR_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY as string,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: buffer.toString("base64"),
                  },
                },
                { text: OCR_PROMPT },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      return (
        data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? ""
      );
    }
    const body = await res.text();
    lastError = Object.assign(
      new Error(`Gemini OCR ${res.status}: ${body.slice(0, 400)}`),
      { status: res.status }
    );
    // 429 (quota) or 503 (overloaded): try the next model, which has its
    // own separate free-tier quota. Anything else is a real error.
    if (res.status !== 503 && res.status !== 429) throw lastError;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw lastError;
}

async function extractWithClaude(buffer: Buffer, mimeType: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: buffer.toString("base64"),
            },
          },
          { type: "text", text: OCR_PROMPT },
        ],
      },
    ],
  });
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

// No AI key configured: fall back to local tesseract OCR (slow on first run —
// it downloads language data). Imported lazily so the WASM worker is only
// loaded when actually needed.
async function extractWithTesseract(buffer: Buffer): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text;
  } finally {
    await worker.terminate();
  }
}
