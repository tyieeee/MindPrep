import { z } from "zod";

export const QUESTION_TYPES = [
  "multiple_choice",
  "true_false",
  "fill_blank",
  "identification",
] as const;

export const QuestionType = z.enum(QUESTION_TYPES);
export type QuestionType = z.infer<typeof QuestionType>;

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True or False",
  fill_blank: "Fill in the Blank",
  identification: "Identification",
};

export const QuestionSchema = z
  .object({
    type: QuestionType,
    prompt: z.string().min(1),
    choices: z.array(z.string()).nullable(),
    correctAnswer: z.string().min(1),
    explanation: z.string().min(1),
  })
  .refine(
    (q) => {
      if (q.type === "multiple_choice") {
        return (
          Array.isArray(q.choices) &&
          q.choices.length >= 2 &&
          q.choices.includes(q.correctAnswer)
        );
      }
      if (q.type === "true_false") {
        return ["True", "False"].includes(q.correctAnswer);
      }
      return q.choices === null;
    },
    { message: "Question shape invalid for its type" }
  );

export const GenerateQuestionsResultSchema = z.object({
  questions: z.array(QuestionSchema),
});
export type GeneratedQuestion = z.infer<typeof QuestionSchema>;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const Difficulty = z.enum(DIFFICULTIES);
export type Difficulty = z.infer<typeof Difficulty>;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const QUIZ_MODES = ["content", "situational"] as const;

export const QuizMode = z.enum(QUIZ_MODES);
export type QuizMode = z.infer<typeof QuizMode>;

export const QUIZ_MODE_LABELS: Record<QuizMode, string> = {
  content: "From my reviewer",
  situational: "Situational",
};

// Minutes offered on the configure screen; null = no limit.
export const TIME_LIMIT_OPTIONS = [null, 5, 10, 15, 30] as const;

export const ConfigureRequestSchema = z.object({
  totalQuestions: z.number().int().min(1).max(50),
  types: z.array(QuestionType).min(1),
  difficulty: Difficulty.default("medium"),
  mode: QuizMode.default("content"),
  timeLimitMinutes: z.number().int().min(1).max(180).nullable().default(null),
  // Exact custom limit (hours:minutes:seconds picker); wins over timeLimitMinutes.
  timeLimitSeconds: z.number().int().min(1).max(10800).nullable().default(null),
});
export type ConfigureRequest = z.infer<typeof ConfigureRequestSchema>;

export const SubmitAttemptSchema = z.object({
  reviewerId: z.string().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        userAnswer: z.string(),
      })
    )
    .min(1),
});
export type SubmitAttemptRequest = z.infer<typeof SubmitAttemptSchema>;
