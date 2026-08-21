import { chatDeepSeek } from "@/lib/deepseek";
import { evaluateLocally, parseEvaluation } from "@/lib/evaluation";
import { buildEvaluationPrompt, EVALUATION_PROMPT } from "@/lib/prompt";
import type {
  CreatorBrief,
  EvaluateApiResponse,
  GeneratedContent,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  content?: GeneratedContent;
  brief?: CreatorBrief;
};

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json(
      { error: "请求格式错误" } satisfies EvaluateApiResponse,
      { status: 400 }
    );
  }

  if (!body.content || !body.brief) {
    return Response.json(
      { error: "缺少待评内容或创作Brief" } satisfies EvaluateApiResponse,
      { status: 400 }
    );
  }

  const localResult = evaluateLocally(body.content, body.brief);
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ data: localResult } satisfies EvaluateApiResponse);
  }

  try {
    const raw = await chatDeepSeek(
      apiKey,
      EVALUATION_PROMPT,
      buildEvaluationPrompt(body.content, body.brief),
      { maxTokens: 600, temperature: 0.2 }
    );
    return Response.json({ data: parseEvaluation(raw) } satisfies EvaluateApiResponse);
  } catch {
    return Response.json({ data: localResult } satisfies EvaluateApiResponse);
  }
}
