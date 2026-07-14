import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ConfigureForm from "@/components/ConfigureForm";
import { MAX_REVIEWER_CHARS } from "@/lib/generateQuestions";

export default async function ConfigurePage({
  params,
}: {
  params: Promise<{ reviewerId: string }>;
}) {
  const { reviewerId } = await params;

  const reviewer = await prisma.reviewer.findUnique({
    where: { id: reviewerId },
    select: { title: true, content: true },
  });
  if (!reviewer) notFound();

  const willTruncate = reviewer.content.length > MAX_REVIEWER_CHARS;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 pb-20 flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="tag tag-accent2 self-start">Step 2 of 2 · Quiz setup</span>
        <h1 className="text-3xl sm:text-4xl">{reviewer.title}</h1>
        <p className="text-[15px] text-[var(--color-neutral-700)]">
          {reviewer.content.length.toLocaleString()} characters extracted.
          Choose how you want to be quizzed.
        </p>
        {willTruncate && (
          <p className="text-sm font-semibold text-[var(--color-accent-800)]">
            Your reviewer is long, so only the first ~{MAX_REVIEWER_CHARS.toLocaleString()}{" "}
            characters will be used to generate questions.
          </p>
        )}
      </div>
      <ConfigureForm reviewerId={reviewerId} />
    </main>
  );
}
