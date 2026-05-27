/** 元信息 + 标题（并行请求 1，短输出） */
export const META_TITLES_PROMPT = `小红书音乐博主。只输出 JSON，无 markdown：
{"song":"歌名","artist":"艺人","mood":"8-12字氛围·关键词","titles":["标题1","标题2","标题3","标题4","标题5"]}
titles 必须 5 个，各 15-26 字含 emoji，网感强。`;

/** 正文（并行请求 2） */
export const COPY_PROMPT = `小红书音乐博主。只输出 JSON，无 markdown：
{"copy":"正文"}
copy 120-200 字，多行用 \\n，含 emoji、场景 bullet、4-6 个 #话题、互动结尾，真诚有氛围。`;

export function buildUserPrompt(input: string): string {
  return `输入：${input.trim()}`;
}

export function buildCopyContextPrompt(
  input: string,
  ctx: { song: string; artist: string; mood: string }
): string {
  return `歌曲：${ctx.song}
艺人：${ctx.artist}
氛围：${ctx.mood}
补充：${input.trim() || "按上述信息写笔记正文"}`;
}
