import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractFromFile } from "@/lib/extract";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 12;

export async function POST(request: Request) {
  const form = await request.formData();
  const title = (form.get("title") as string | null)?.trim();
  const pastedText = (form.get("text") as string | null)?.trim();

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const legacySingle = form.get("file");
  if (legacySingle instanceof File && legacySingle.size > 0) {
    files.push(legacySingle);
  }

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (files.length === 0 && !pastedText) {
    return NextResponse.json(
      { error: "Provide either pasted text or a file upload." },
      { status: 400 }
    );
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Too many files (${MAX_FILES} max).` },
      { status: 400 }
    );
  }
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File is too large (10MB max)." },
        { status: 413 }
      );
    }
  }

  let text: string;
  let sourceType: string;

  try {
    if (files.length > 0) {
      const parts: string[] = [];
      sourceType = "text";
      for (const file of files) {
        const result = await extractFromFile(file);
        if (result.text) parts.push(result.text);
        sourceType = result.sourceType;
      }
      text = parts.join("\n\n");
    } else {
      text = pastedText as string;
      sourceType = "text";
    }
  } catch (err) {
    console.error("Text extraction failed:", err);
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "The free AI tier hit its request limit while reading your photo. Wait a minute and try again.",
        },
        { status: 422 }
      );
    }
    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "The free AI model is overloaded right now. Wait a minute and try again.",
        },
        { status: 422 }
      );
    }
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
