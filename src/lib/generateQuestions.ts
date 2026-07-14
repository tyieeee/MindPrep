import { anthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";
import {
  GenerateQuestionsResultSchema,
  QUESTION_TYPE_LABELS,
  type GeneratedQuestion,
  type QuestionType,
} from "@/lib/schemas";
import type Anthropic from "@anthropic-ai/sdk";

const RECORD_QUESTIONS_TOOL: Anthropic.Tool = {
  name: "record_questions",
  description: "Record the generated quiz questions.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["questions"],
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "prompt", "choices", "correctAnswer", "explanation"],
          properties: {
            type: {
              type: "string",
              enum: ["multiple_choice", "true_false", "fill_blank", "identification"],
            },
            prompt: { type: "string" },
            choices: {
              type: ["array", "null"],
              items: { type: "string" },
              description:
                "4 answer options for multiple_choice (must include correctAnswer verbatim); null for every other type.",
            },
            correctAnswer: {
              type: "string",
              description: 'For true_false, must be exactly "True" or "False".',
            },
            explanation: {
              type: "string",
              description: "1-2 sentence explanation of why the answer is correct.",
            },
          },
        },
      },
    },
  },
};

export const MAX_REVIEWER_CHARS = Number(process.env.MAX_REVIEWER_CHARS) || 60_000;

export function truncateReviewerText(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_REVIEWER_CHARS) return { text, truncated: false };
  const slice = text.slice(0, MAX_REVIEWER_CHARS);
  const lastBreak = slice.lastIndexOf("\n");
  return {
    text: lastBreak > 0 ? slice.slice(0, lastBreak) : slice,
    truncated: true,
  };
}

function buildPrompt(reviewerText: string, totalQuestions: number, types: QuestionType[]) {
  const typeList = types.map((t) => `- ${t} (${QUESTION_TYPE_LABELS[t]})`).join("\n");
  return `You are a study assistant helping a student create a self-quiz from their review notes ("reviewer").

Generate exactly ${totalQuestions} quiz questions based ONLY on the reviewer text below. Mix questions across these allowed types, distributing them reasonably evenly:
${typeList}

Rules per type:
- multiple_choice: include exactly 4 plausible choices in "choices", where "correctAnswer" is one of them verbatim.
- true_false: "choices" must be null, and "correctAnswer" must be exactly "True" or "False".
- fill_blank: "choices" must be null; "prompt" should contain a blank (e.g. using "____") for the student to fill in; "correctAnswer" is the missing word/phrase.
- identification: "choices" must be null; "prompt" asks the student to name/identify a term, person, or concept described in the reviewer.

Every question needs a concise "explanation" (1-2 sentences) of why the correct answer is right, grounded in the reviewer text.

Call the record_questions tool exactly once with all ${totalQuestions} questions.

Reviewer text:
"""
${reviewerText}
"""`;
}

export async function generateQuestions(
  reviewerText: string,
  totalQuestions: number,
  types: QuestionType[]
): Promise<GeneratedQuestion[]> {
  const maxTokens = Math.min(64000, 2000 + 400 * totalQuestions);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildPrompt(reviewerText, totalQuestions, types) },
  ];

  let response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    tools: [RECORD_QUESTIONS_TOOL],
    tool_choice: { type: "tool", name: "record_questions" },
    messages,
  });

  let questions = extractQuestionsFromResponse(response);

  if (questions.length !== totalQuestions) {
    messages.push({ role: "assistant", content: response.content });
    messages.push({
      role: "user",
      content: `You returned ${questions.length} questions; return exactly ${totalQuestions}. Call record_questions again with the corrected full set.`,
    });

    response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      tools: [RECORD_QUESTIONS_TOOL],
      tool_choice: { type: "tool", name: "record_questions" },
      messages,
    });
    questions = extractQuestionsFromResponse(response);
  }

  return questions;
}

function extractQuestionsFromResponse(
  response: Anthropic.Message
): GeneratedQuestion[] {
  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Claude did not call the record_questions tool");
  }

  const parsed = GenerateQuestionsResultSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Claude's response failed validation: ${parsed.error.message}`);
  }

  return parsed.data.questions;
}
