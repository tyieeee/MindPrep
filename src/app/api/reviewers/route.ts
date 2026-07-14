import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractFromFile } from "@/lib/extract";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const form = await request.formData();
  const title = (form.get("title") as string | null)?.trim();
  const pastedText = (form.get("text") as string | null)?.trim();
  const file = form.get("file") as File | null;

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!file && !pastedText) {
    return NextResponse.json(
      { error: "Provide either pasted text or a file upload." },
      { status: 400 }
    );
  }
  if (file && file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File is too large (10MB max)." },
      { status: 413 }
    );
  }

  let text: string;
  let sourceType: string;

  try {
    if (file) {
      const result = await extractFromFile(file);
      text = result.text;
      sourceType = result.sourceType;
    } else {
      text = pastedText as string;
      sourceType = "text";
    }
  } catch (err) {
    console.error("Text extraction failed:", err);
    return NextResponse.json(
      { error: "Could not extract text from the uploaded file." },
      { status: 422 }
    );
  }

  if (!text) {
    return NextResponse.json(
      { error: "No text could be extracted from the provided input." },
      { status: 422 }
    );
  }

  const reviewer = await prisma.reviewer.create({
    data: { title, content: text, sourceType },
  });

  return NextResponse.json({ id: reviewer.id }, { status: 201 });
}
