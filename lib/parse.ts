import type { GeneratedContent } from "./types";
import { DEFAULT_THEME_ID, pickCoverGradient } from "./themes";

const TITLE_COUNT = 5;

function pickGradient(seed: string): string {
  return pickCoverGradient(DEFAULT_THEME_ID, seed);
}

/** 去掉 markdown 代码块与前后说明文字 */
function stripMarkdown(raw: string): string {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) text = fenced[1].trim();
  return text;
}

/** 按括号平衡提取第一个完整 JSON 对象（避免 copy 里的符号干扰贪婪匹配） */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** 修复模型常见 JSON 笔误 */
function sanitizeJson(jsonStr: string): string {
  return jsonStr
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1");
}

function tryParseObject(jsonStr: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // continue
  }
  return null;
}

function normalizeTitles(titles: unknown, song: string): string[] {
  const list = Array.isArray(titles)
    ? titles.map((t) => String(t).trim()).filter(Boolean)
    : [];

  while (list.length < TITLE_COUNT) {
    const n = list.length + 1;
    list.push(`🎵 ${song || "今日单曲"}｜氛围感音乐分享 ${n}`);
  }
  return list.slice(0, TITLE_COUNT);
}

function toGeneratedContent(parsed: Record<string, unknown>): GeneratedContent {
  const song = String(parsed.song ?? parsed.title ?? "").trim();
  const artist = String(parsed.artist ?? parsed.singer ?? "").trim();
  const mood = String(parsed.mood ?? parsed.vibe ?? "").trim();
  const copy = String(
    parsed.copy ?? parsed.content ?? parsed.caption ?? parsed.text ?? ""
  ).trim();

  if (!song) throw new Error("缺少歌曲名");
  if (!copy) throw new Error("缺少文案正文");

  return {
    song,
    artist: artist || "独立音乐人",
    mood: mood || "氛围感 · 深夜循环",
    titles: normalizeTitles(parsed.titles, song),
    copy,
    coverGradient: pickGradient(song + mood),
  };
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const cleaned = stripMarkdown(raw);
  const candidates = [
    cleaned,
    extractJsonObject(cleaned),
    extractJsonObject(raw),
    raw.match(/\{[\s\S]*\}/)?.[0] ?? null,
  ].filter((c): c is string => Boolean(c));

  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);

    const direct = tryParseObject(candidate);
    if (direct) return direct;

    const sanitized = sanitizeJson(candidate);
    const repaired = tryParseObject(sanitized);
    if (repaired) return repaired;
  }

  throw new Error("无法解析 AI 返回的 JSON");
}

export function parseMetaTitles(
  raw: string
): Pick<GeneratedContent, "song" | "artist" | "mood" | "titles"> {
  const parsed = parseJsonObject(raw);
  const song = String(parsed.song ?? parsed.title ?? "").trim();
  if (!song) throw new Error("缺少歌曲名");

  return {
    song,
    artist: String(parsed.artist ?? parsed.singer ?? "").trim() || "独立音乐人",
    mood: String(parsed.mood ?? parsed.vibe ?? "").trim() || "氛围感 · 深夜循环",
    titles: normalizeTitles(parsed.titles, song),
  };
}

export function parseCopyOnly(raw: string): string {
  const parsed = parseJsonObject(raw);
  const copy = String(
    parsed.copy ?? parsed.content ?? parsed.caption ?? parsed.text ?? ""
  ).trim();
  if (!copy) throw new Error("缺少文案正文");
  return copy;
}

export function mergeGenerated(
  meta: Pick<GeneratedContent, "song" | "artist" | "mood" | "titles">,
  copy: string
): GeneratedContent {
  return {
    ...meta,
    copy,
    coverGradient: pickGradient(meta.song + meta.mood),
  };
}

export function parseGeneratedJson(raw: string): GeneratedContent {
  try {
    return toGeneratedContent(parseJsonObject(raw));
  } catch {
    throw new Error("无法解析 AI 返回的 JSON，请重试一次");
  }
}
