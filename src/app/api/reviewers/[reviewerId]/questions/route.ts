import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions, truncateReviewerText } from "@/lib/generateQuestions";
import { ConfigureRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";
// Vercel: question generation regularly takes 30s+, plus one corrective retry.
export const maxDuration = 60;

type RouteParams = { params: Promise<{ reviewerId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { reviewerId } = await params;

  const reviewer = await prisma.reviewer.findUnique({ where: { id: reviewerId } });
  if (!reviewer) {
    return NextResponse.json({ error: "Reviewer not found." }, { status: 404 });
  }

  const body = await request.json();
  const parsedRequest = ConfigureRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.message },
      { status: 400 }
    );
  }
  const { totalQuestions, types, difficulty, mode, timeLimitMinutes, timeLimitSeconds } =
    parsedRequest.data;

  const { text, truncated } = truncateReviewerText(reviewer.content);
  await prisma.reviewer.update({
    where: { id: reviewerId },
    data: {
      difficulty,
      mode,
      timeLimitSeconds:
        timeLimitSeconds ??
        (timeLimitMinutes === null ? null : timeLimitMinutes * 60),
      ...(truncated ? { truncated: true } : {}),
    },
  });

  let generated;
  try {
    generated = await generateQuestions(text, totalQuestions, types, difficulty, mode);
  } catch (err) {
    console.error("Question generation failed:", err);
    const status = (err as { status?: number })?.status;
    const message = String(err);
    if (status === 401 || (status === 400 && message.includes("API key not valid"))) {
      return NextResponse.json(
        {
          error:
            "The AI API key is invalid or missing. Set GEMINI_API_KEY (or ANTHROPIC_API_KEY) in the .env file and restart the server.",
        },
        { status: 502 }
      );
    }
    if (status === 400 && message.includes("credit balance")) {
      return NextResponse.json(
        {
          error:
            "The Anthropic account has no API credits. Buy credits at console.anthropic.com → Billing, or set GEMINI_API_KEY in .env to use the free Gemini API instead.",
        },
        { status: 502 }
      );
    }
    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "The free AI model is overloaded right now. Wait a minute and try again.",
        },
        { status: 502 }
      );
    }
    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "The AI service hit its rate limit. Wait a minute and try again (free tiers allow a few requests per minute).",
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate questions from the reviewer text." },
      { status: 502 }
    );
  }

  if (generated.length === 0) {
    return NextResponse.json(
      { error: "No questions could be generated." },
      { status: 502 }
    );
  }

  await prisma.question.deleteMany({ where: { reviewerId } });
  await prisma.question.createMany({
    data: generated.map((q, i) => ({
      reviewerId,
      type: q.type,
      prompt: q.prompt,
      choices: q.choices ?? undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      order: i,
    })),
  });

  return NextResponse.json({ count: generated.length, truncated }, { status: 201 });
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { reviewerId } = await params;

  const questions = await prisma.question.findMany({
    where: { reviewerId },
    orderBy: { order: "asc" },
    select: { id: true, type: true, prompt: true, choices: true, order: true },
  });

  return NextResponse.json({ questions });
}
