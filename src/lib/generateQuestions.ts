import { anthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";
import {
  GenerateQuestionsResultSchema,
  QUESTION_TYPE_LABELS,
  type Difficulty,
  type GeneratedQuestion,
  type QuestionType,
  type QuizMode,
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

const DIFFICULTY_GUIDANCE: Record<Difficulty, string> = {
  easy: "Target an EASY difficulty: test straightforward recall of the most prominent facts and definitions. For multiple_choice, make the wrong choices clearly distinguishable from the correct answer.",
  medium:
    "Target a MEDIUM difficulty: mix simple recall with questions that require understanding relationships between ideas in the reviewer. Wrong multiple_choice options should be plausible but distinguishable.",
  hard: "Target a HARD difficulty: favor questions about specific details, exceptions, and applications of the material, requiring careful reading to answer. For multiple_choice, make wrong choices subtly incorrect so the student must know the material precisely.",
};

const QUIZ_MODE_GUIDANCE: Record<QuizMode, string> = {
  content:
    "Base each question directly on facts, definitions, and details stated in the reviewer text — test recall and understanding of the material itself.",
  situational:
    "Frame EVERY question as a realistic scenario or case the student might actually encounter, requiring them to apply a concept from the reviewer to decide the correct action, judgment, or outcome — do not directly quote or ask the student to recall reviewer text verbatim. The correct answer and explanation must still be objectively grounded in and justified by the reviewer material, not general common sense.",
};

const TYPE_RULES: Record<QuestionType, string> = {
  multiple_choice:
    '- multiple_choice: include exactly 4 plausible choices in "choices", where "correctAnswer" is one of them verbatim.',
  true_false:
    '- true_false: "choices" must be null, and "correctAnswer" must be exactly "True" or "False".',
  fill_blank:
    '- fill_blank: "choices" must be null; "prompt" should contain a blank (e.g. using "____") for the student to fill in; "correctAnswer" is the missing word/phrase.',
  identification:
    '- identification: "choices" must be null; "prompt" asks the student to name/identify a term, person, or concept described in the reviewer.',
};

function buildPrompt(
  reviewerText: string,
  totalQuestions: number,
  types: QuestionType[],
  difficulty: Difficulty,
  mode: QuizMode,
  outputInstruction: string
) {
  const typeList = types.map((t) => `- ${t} (${QUESTION_TYPE_LABELS[t]})`).join("\n");
  const typeIntro =
    types.length === 1
      ? `Every single question's "type" must be exactly "${types[0]}" — the student chose only this type, so no other question type is allowed:`
      : `Mix questions across these allowed types, distributing them reasonably evenly. The student chose ONLY these types — never use a type that is not in this list:`;
  const typeRules = types.map((t) => TYPE_RULES[t]).join("\n");
  return `You are a study assistant helping a student create a self-quiz from their review notes ("reviewer").

Generate exactly ${totalQuestions} quiz questions based ONLY on the reviewer text below. ${typeIntro}
${typeList}

${DIFFICULTY_GUIDANCE[difficulty]}

${QUIZ_MODE_GUIDANCE[mode]}

Rules per type:
${typeRules}

Every question needs a concise "explanation" (1-2 sentences) of why the correct answer is right, grounded in the reviewer text.

${outputInstruction}

Reviewer text:
"""
${reviewerText}
"""`;
}

function allTypesAllowed(questions: GeneratedQuestion[], types: QuestionType[]) {
  return questions.every((q) => types.includes(q.type));
}

// Last-resort guard: drop any question of a type the student didn't pick.
function enforceTypes(
  questions: GeneratedQuestion[],
  types: QuestionType[]
): GeneratedQuestion[] {
  const kept = questions.filter((q) => types.includes(q.type));
  if (kept.length === 0) {
    throw new Error("The model only produced questions of disallowed types");
  }
  return kept;
}

export async function generateQuestions(
  reviewerText: string,
  totalQuestions: number,
  types: QuestionType[],
  difficulty: Difficulty = "medium",
  mode: QuizMode = "content"
): Promise<GeneratedQuestion[]> {
  if (process.env.GEMINI_API_KEY) {
    return generateWithGemini(reviewerText, totalQuestions, types, difficulty, mode);
  }
  return generateWithAnthropic(reviewerText, totalQuestions, types, difficulty, mode);
}

// — Gemini (free tier at https://aistudio.google.com/apikey) —

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const GEMINI_FALLBACK_MODEL = "gemini-3.1-flash-lite";

type GeminiContent = { role: "user" | "model"; parts: { text: string }[] };

// The free tier occasionally 503s under load and 429s when a model's daily
// quota runs out; retry 503s, and switch to the fallback model on either.
async function callGemini(contents: GeminiContent[], maxTokens: number): Promise<string> {
  let lastError: unknown;
  for (const model of [GEMINI_MODEL, GEMINI_FALLBACK_MODEL]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callGeminiModel(model, contents, maxTokens);
      } catch (err) {
        lastError = err;
        const status = (err as { status?: number })?.status;
        // Quota exhausted for this model — retrying it is pointless; move
        // straight to the next model, which has its own quota.
        if (status === 429) break;
        if (status !== 503) throw err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
  throw lastError;
}

async function callGeminiModel(
  model: string,
  contents: GeminiContent[],
  maxTokens: number
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY as string,
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: maxTokens,
        },
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    const error = new Error(`Gemini ${res.status}: ${body.slice(0, 400)}`) as Error & {
      status: number;
    };
    error.status = res.status;
    throw error;
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? ""
  );
}

function parseGeminiQuestions(text: string): GeneratedQuestion[] {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }
  const parsed = GenerateQuestionsResultSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Gemini's response failed validation: ${parsed.error.message}`);
  }
  return parsed.data.questions;
}

async function generateWithGemini(
  reviewerText: string,
  totalQuestions: number,
  types: QuestionType[],
  difficulty: Difficulty,
  mode: QuizMode
): Promise<GeneratedQuestion[]> {
  const maxTokens = Math.min(64000, 2000 + 400 * totalQuestions);
  const outputInstruction = `Respond with ONLY a JSON object of this exact shape, no markdown fences or commentary:
{"questions": [{"type": "...", "prompt": "...", "choices": [...] or null, "correctAnswer": "...", "explanation": "..."}]}
The "questions" array must contain exactly ${totalQuestions} items.`;

  const contents: GeminiContent[] = [
    {
      role: "user",
      parts: [
        {
          text: buildPrompt(
            reviewerText,
            totalQuestions,
            types,
            difficulty,
            mode,
            outputInstruction
          ),
        },
      ],
    },
  ];

  let text = await callGemini(contents, maxTokens);
  try {
    const questions = parseGeminiQuestions(text);
    if (questions.length === totalQuestions && allTypesAllowed(questions, types)) {
      return questions;
    }
  } catch {
    // fall through to one corrective retry
  }

  contents.push({ role: "model", parts: [{ text }] });
  contents.push({
    role: "user",
    parts: [
      {
        text: `That response was invalid, did not contain exactly ${totalQuestions} questions, or used a question type outside the allowed list (${types.join(
          ", "
        )}). Respond again with ONLY the JSON object, exactly ${totalQuestions} questions, using only the allowed types and following every rule.`,
      },
    ],
  });
  text = await callGemini(contents, maxTokens);
  return enforceTypes(parseGeminiQuestions(text), types);
}

// — Anthropic —

async function generateWithAnthropic(
  reviewerText: string,
  totalQuestions: number,
  types: QuestionType[],
  difficulty: Difficulty,
  mode: QuizMode
): Promise<GeneratedQuestion[]> {
  const maxTokens = Math.min(64000, 2000 + 400 * totalQuestions);

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: buildPrompt(
        reviewerText,
        totalQuestions,
        types,
        difficulty,
        mode,
        `Call the record_questions tool exactly once with all ${totalQuestions} questions.`
      ),
    },
  ];

  let response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    tools: [RECORD_QUESTIONS_TOOL],
    tool_choice: { type: "tool", name: "record_questions" },
    messages,
  });

  let questions = extractQuestionsFromResponse(response);

  if (questions.length !== totalQuestions || !allTypesAllowed(questions, types)) {
    messages.push({ role: "assistant", content: response.content });
    messages.push({
      role: "user",
      content: `You returned ${questions.length} questions; return exactly ${totalQuestions}, using ONLY these question types: ${types.join(
        ", "
      )}. Call record_questions again with the corrected full set.`,
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

  return enforceTypes(questions, types);
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
