import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizForm from "@/components/QuizForm";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ reviewerId: string }>;
}) {
  const { reviewerId } = await params;

  const reviewer = await prisma.reviewer.findUnique({
    where: { id: reviewerId },
    select: { title: true, _count: { select: { questions: true } } },
  });
  if (!reviewer || reviewer._count.questions === 0) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 pb-20 flex flex-col gap-8">
      <h1 className="text-3xl sm:text-4xl">{reviewer.title}</h1>
      <QuizForm reviewerId={reviewerId} />
    </main>
  );
}
