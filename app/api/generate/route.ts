import { NextRequest } from "next/server";
import { chatDeepSeek } from "@/lib/deepseek";
import {
  buildCopyContextPrompt,
  buildUserPrompt,
  COPY_PROMPT,
  META_TITLES_PROMPT,
} from "@/lib/prompt";
import {
  mergeGenerated,
  parseCopyOnly,
  parseMetaTitles,
} from "@/lib/parse";
import type {
  CreatorBrief,
  GenerateApiResponse,
  GeneratedContent,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GeneratePart = "all" | "titles" | "copy";

type RequestBody = {
  prompt?: string;
  part?: GeneratePart;
  brief?: CreatorBrief;
  current?: Pick<
    GeneratedContent,
    "song" | "artist" | "mood" | "titles" | "copy"
  >;
};

async function generateTitles(apiKey: string, userPrompt: string) {
  const metaRaw = await chatDeepSeek(apiKey, META_TITLES_PROMPT, userPrompt, {
    maxTokens: 380,
    temperature: 0.75,
  });
  return parseMetaTitles(metaRaw);
}

async function generateCopy(
  apiKey: string,
  rawInput: string,
  brief?: CreatorBrief,
  ctx?: { song: string; artist: string; mood: string }
) {
  const copyPrompt = ctx
    ? buildCopyContextPrompt(rawInput, ctx, brief)
    : buildUserPrompt(rawInput, brief);
  const copyRaw = await chatDeepSeek(apiKey, COPY_PROMPT, copyPrompt, {
    maxTokens: 650,
    temperature: 0.75,
  });
  return parseCopyOnly(copyRaw);
}

async function generateParallel(
  apiKey: string,
  rawInput: string,
  userPrompt: string,
  brief?: CreatorBrief
): Promise<GeneratedContent> {
  const [meta, copy] = await Promise.all([
    generateTitles(apiKey, userPrompt),
    generateCopy(apiKey, rawInput, brief),
  ]);
  return mergeGenerated(meta, copy);
}

async function generateWithRetry(
  apiKey: string,
  rawInput: string,
  userPrompt: string,
  brief?: CreatorBrief
): Promise<GeneratedContent> {
  try {
    return await generateParallel(apiKey, rawInput, userPrompt, brief);
  } catch {
    const meta = await generateTitles(apiKey, userPrompt);
    const copy = await generateCopy(apiKey, rawInput, brief);
    return mergeGenerated(meta, copy);
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI 服务未配置，请检查环境变量" } satisfies GenerateApiResponse,
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "请求格式错误" } satisfies GenerateApiResponse,
      { status: 400 }
    );
  }

  const userInput = body.prompt?.trim();
  if (!userInput) {
    return Response.json(
      { error: "请输入歌曲名或今日情绪" } satisfies GenerateApiResponse,
      { status: 400 }
    );
  }

  const part: GeneratePart = body.part ?? "all";
  const brief = body.brief;
  const userPrompt = buildUserPrompt(userInput, brief);

  try {
    if (part === "titles") {
      const meta = await generateTitles(apiKey, userPrompt);
      const copy = body.current?.copy ?? "";
      const data = mergeGenerated(meta, copy || "（请重新生成文案）");
      return Response.json({ data } satisfies GenerateApiResponse);
    }

    if (part === "copy") {
      const ctx = body.current;
      const copy = await generateCopy(
        apiKey,
        userInput,
        brief,
        ctx
          ? { song: ctx.song, artist: ctx.artist, mood: ctx.mood }
          : undefined
      );
      const data = mergeGenerated(
        {
          song: ctx?.song ?? userInput.slice(0, 24),
          artist: ctx?.artist ?? "独立音乐人",
          mood: ctx?.mood ?? "氛围感 · 深夜循环",
          titles: ctx?.titles ?? [],
        },
        copy
      );
      return Response.json({ data } satisfies GenerateApiResponse);
    }

    const data = await generateWithRetry(apiKey, userInput, userPrompt, brief);
    return Response.json({ data } satisfies GenerateApiResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "生成失败，请稍后重试";
    return Response.json(
      { error: message } satisfies GenerateApiResponse,
      { status: 502 }
    );
  }
}
