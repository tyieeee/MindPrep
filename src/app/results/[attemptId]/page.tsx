import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResultsSummary from "@/components/ResultsSummary";
import QuestionResultCard, {
  type QuestionResult,
} from "@/components/QuestionResultCard";
import type { QuestionType } from "@/lib/schemas";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      reviewer: { select: { id: true, title: true } },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              type: true,
              prompt: true,
              choices: true,
              correctAnswer: true,
              explanation: true,
              order: true,
            },
          },
        },
      },
    },
  });
  if (!attempt) notFound();

  const results: QuestionResult[] = attempt.answers
    .slice()
    .sort((a, b) => a.question.order - b.question.order)
    .map((a) => ({
      questionId: a.question.id,
      type: a.question.type as QuestionType,
      prompt: a.question.prompt,
      choices: (a.question.choices as string[] | null) ?? null,
      userAnswer: a.userAnswer,
      correctAnswer: a.question.correctAnswer,
      explanation: a.question.explanation,
      isCorrect: a.isCorrect,
    }));

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 pb-20 flex flex-col gap-10">
      <ResultsSummary
        reviewerId={attempt.reviewer.id}
        reviewerTitle={attempt.reviewer.title}
        score={attempt.score}
        total={attempt.total}
      />
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Answer review</h2>
        <div className="flex flex-col gap-4">
          {results.map((result, i) => (
            <QuestionResultCard key={result.questionId} index={i} result={result} />
          ))}
        </div>
      </div>
    </main>
  );
}
