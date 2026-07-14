import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubmitAttemptSchema } from "@/lib/schemas";
import { gradeAnswer } from "@/lib/grading";
import type { QuestionType } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SubmitAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { reviewerId, answers } = parsed.data;

  const questions = await prisma.question.findMany({
    where: { reviewerId },
  });
  const questionsById = new Map(questions.map((q) => [q.id, q]));

  const gradedAnswers = answers
    .filter((a) => questionsById.has(a.questionId))
    .map((a) => {
      const question = questionsById.get(a.questionId)!;
      const isCorrect = gradeAnswer(
        question.type as QuestionType,
        a.userAnswer,
        question.correctAnswer
      );
      return { questionId: a.questionId, userAnswer: a.userAnswer, isCorrect };
    });

  if (gradedAnswers.length === 0) {
    return NextResponse.json(
      { error: "None of the submitted answers matched questions for this reviewer." },
      { status: 400 }
    );
  }

  const score = gradedAnswers.filter((a) => a.isCorrect).length;

  const attempt = await prisma.attempt.create({
    data: {
      reviewerId,
      score,
      total: gradedAnswers.length,
      answers: { create: gradedAnswers },
    },
  });

  return NextResponse.json({ id: attempt.id }, { status: 201 });
}
