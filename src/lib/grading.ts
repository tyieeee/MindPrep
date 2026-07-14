import type { QuestionType } from "@/lib/schemas";

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

export function gradeAnswer(
  type: QuestionType,
  userAnswer: string,
  correctAnswer: string
): boolean {
  if (type === "multiple_choice" || type === "true_false") {
    return userAnswer === correctAnswer;
  }
  return normalizeText(userAnswer) === normalizeText(correctAnswer);
}
