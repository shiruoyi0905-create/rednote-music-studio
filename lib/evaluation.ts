import type {
  ContentEvaluation,
  CreatorBrief,
  GeneratedContent,
} from "./types";

function clampScore(value: unknown, fallback = 70): number {
  const score = Math.round(Number(value));
  return Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : fallback;
}

function stringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const list = value.map(String).map((item) => item.trim()).filter(Boolean);
  return list.length ? list.slice(0, 3) : fallback;
}

export function parseEvaluation(raw: string): ContentEvaluation {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? raw;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("无法解析质检结果");

  const parsed = JSON.parse(fenced.slice(start, end + 1)) as Record<string, unknown>;
  const dimensions = (parsed.dimensions ?? {}) as Record<string, unknown>;
  const normalized = {
    audienceFit: clampScore(dimensions.audienceFit),
    authenticity: clampScore(dimensions.authenticity),
    readability: clampScore(dimensions.readability),
    publishReadiness: clampScore(dimensions.publishReadiness),
  };
  const average = Math.round(
    Object.values(normalized).reduce((sum, score) => sum + score, 0) / 4
  );

  return {
    overallScore: clampScore(parsed.overallScore, average),
    dimensions: normalized,
    strengths: stringList(parsed.strengths, ["内容结构完整"]),
    risks: stringList(parsed.risks, ["建议发布前再次核对事实信息"]),
    nextStep:
      String(parsed.nextStep ?? "补充一个更具体的个人聆听场景后再发布").trim() ||
      "补充一个更具体的个人聆听场景后再发布",
    source: "ai",
  };
}

export function evaluateLocally(
  content: GeneratedContent,
  brief: CreatorBrief
): ContentEvaluation {
  const fullText = `${content.titles.join(" ")} ${content.copy}`;
  const hashtags = content.copy.match(/#[^#\s]+/g) ?? [];
  const hasScene = /深夜|通勤|耳机|雨天|夜晚|散步|开车|独处|咖啡|周末/.test(
    content.copy
  );
  const hasInteraction = /你会|你们|评论|告诉我|单曲循环|收藏/.test(content.copy);
  const requestedKeywords = brief.keywords
    .split(/[，,、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const keywordHits = requestedKeywords.filter((item) => fullText.includes(item));
  const avoidedWords = brief.avoid
    .split(/[，,、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => fullText.includes(item));

  const dimensions = {
    audienceFit: clampScore(72 + Math.min(12, keywordHits.length * 4)),
    authenticity: clampScore(68 + (hasScene ? 12 : 0) - avoidedWords.length * 8),
    readability: clampScore(
      70 + (content.copy.length >= 120 && content.copy.length <= 260 ? 12 : 0)
    ),
    publishReadiness: clampScore(
      66 + (hashtags.length >= 4 && hashtags.length <= 6 ? 10 : 0) + (hasInteraction ? 8 : 0)
    ),
  };
  const overallScore = Math.round(
    Object.values(dimensions).reduce((sum, score) => sum + score, 0) / 4
  );

  const strengths = [
    content.titles.length === 5 ? "提供5个差异化标题，便于发布前选择" : "已生成候选标题",
    hasScene ? "正文包含具体聆听场景" : "正文主题与歌曲氛围一致",
  ];
  const risks = [
    ...(!hasScene ? ["缺少具体使用场景，内容容易显得泛化"] : []),
    ...(hashtags.length < 4 || hashtags.length > 6
      ? ["话题数量不在4至6个的建议范围内"]
      : []),
    ...(!hasInteraction ? ["结尾缺少自然的互动引导"] : []),
    ...(avoidedWords.length ? [`出现了需避免的表达：${avoidedWords.join("、")}`] : []),
  ].slice(0, 3);

  return {
    overallScore,
    dimensions,
    strengths,
    risks: risks.length ? risks : ["事实信息仍需发布者最终核对"],
    nextStep: !hasScene
      ? "补充一个与目标受众相关的真实聆听场景，再定向重写正文。"
      : "从5个标题中选择最贴近目标受众的一条，并核对歌曲与艺人信息。",
    source: "local",
  };
}
