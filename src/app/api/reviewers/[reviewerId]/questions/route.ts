import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions, truncateReviewerText } from "@/lib/generateQuestions";
import { ConfigureRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

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
  const { totalQuestions, types } = parsedRequest.data;

  const { text, truncated } = truncateReviewerText(reviewer.content);
  if (truncated) {
    await prisma.reviewer.update({ where: { id: reviewerId }, data: { truncated: true } });
  }

  let generated;
  try {
    generated = await generateQuestions(text, totalQuestions, types);
  } catch (err) {
    console.error("Question generation failed:", err);
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
