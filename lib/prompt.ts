import type { CreatorBrief, GeneratedContent } from "./types";

/** 元信息 + 标题（并行请求 1，短输出） */
export const META_TITLES_PROMPT = `你是小红书音乐内容策划。只输出 JSON，无 markdown：
{"song":"歌名","artist":"艺人","mood":"8-12字氛围·关键词","titles":["标题1","标题2","标题3","标题4","标题5"]}
titles 必须 5 个，各 15-26 字；风格有区分，避免标题党和无法验证的事实。`;

/** 正文（并行请求 2） */
export const COPY_PROMPT = `你是小红书音乐内容策划。只输出 JSON，无 markdown：
{"copy":"正文"}
copy 120-220 字，多行用 \\n；包含具体聆听场景、自然的互动结尾与 4-6 个相关话题。保持真诚，避免编造歌曲背景或艺人经历。`;

function briefText(brief?: CreatorBrief): string {
  if (!brief) return "";
  return `\n目标受众：${brief.audience}\n创作目标：${brief.goal}\n表达风格：${brief.tone}\n必须包含：${brief.keywords || "无"}\n避免表达：${brief.avoid || "无"}`;
}

export function buildUserPrompt(input: string, brief?: CreatorBrief): string {
  return `输入：${input.trim()}${briefText(brief)}`;
}

export function buildCopyContextPrompt(
  input: string,
  ctx: { song: string; artist: string; mood: string },
  brief?: CreatorBrief
): string {
  return `歌曲：${ctx.song}
艺人：${ctx.artist}
氛围：${ctx.mood}
补充：${input.trim() || "按上述信息写笔记正文"}${briefText(brief)}`;
}

export const EVALUATION_PROMPT = `你是小红书音乐内容主编。只输出 JSON，无 markdown：
{"overallScore":0,"dimensions":{"audienceFit":0,"authenticity":0,"readability":0,"publishReadiness":0},"strengths":[""],"risks":[""],"nextStep":""}
所有分数为 0-100 整数。结合目标受众、创作目标和表达风格判断，不因 emoji 或话题数量机械加分。risks 最多 3 条，nextStep 必须是一条可直接执行的修改建议。`;

export function buildEvaluationPrompt(
  content: GeneratedContent,
  brief: CreatorBrief
): string {
  return `歌曲：${content.song}\n艺人：${content.artist}\n候选标题：${content.titles.join("｜")}\n正文：${content.copy}${briefText(brief)}`;
}
