import type { GeneratedContent } from "./types";

export type MockContent = GeneratedContent;

export const DEFAULT_MOCK: GeneratedContent = {
  song: "My Jinji",
  artist: "落日飞车 · Sunset Rollercoaster",
  mood: "霓虹晚风 · 复古浪漫",
  titles: [
    "🌆 听完这首，整座城市的霓虹都慢下来了",
    "💿 My Jinji｜落日飞车给的复古浪漫暴击",
    "🎧 私藏歌单｜适合深夜独处的灵魂 BGM",
    "✨ 前奏一响，就想把夜晚调成胶片色",
    "🌙 这首歌适合一个人慢慢循环到天亮",
  ],
  copy: `🌙 今晚循环的是落日飞车的《My Jinji》

🎵 前奏一响，整个人就被拉进 80 年代的霓虹胶片里
✨ 慵懒的贝斯 + 迷幻的合成器，像一杯加冰的紫色苏打

💜 适合场景：
▫️ 深夜开车窗吹风
▫️ 一个人整理房间
▫️ 写不出文案时的背景音

📌 收藏这首，下次发笔记直接抄作业
🔖 #落日飞车 #MyJinji #私藏歌单 #氛围感音乐 #小众宝藏

👇 评论区告诉我，你今晚在听什么？`,
  coverGradient:
    "linear-gradient(135deg, #c9a66b 0%, #e8d5b5 40%, #8b7355 100%)",
};

export function getMockForPrompt(prompt: string): MockContent {
  const trimmed = prompt.trim();
  if (!trimmed) return DEFAULT_MOCK;

  return {
    ...DEFAULT_MOCK,
    song: trimmed.includes("My Jinji") ? "My Jinji" : trimmed.slice(0, 24),
    mood: trimmed.length > 12 ? trimmed.slice(0, 20) + "…" : trimmed,
    titles: [
      `🎧 ${trimmed}｜今晚的氛围感被我拿捏了`,
      `✨ 关于「${trimmed.slice(0, 12)}」的小红书神仙标题`,
      `💿 音乐博主私藏｜${trimmed.slice(0, 10)} 这一遍就上头`,
      `🌙 ${trimmed.slice(0, 10)}｜适合深夜循环的宝藏歌`,
      `🫧 听完「${trimmed.slice(0, 10)}」整个人都安静了`,
    ],
    copy: `🌙 今日情绪关键词：${trimmed}

🎵 前奏一响，节奏慢下来，世界也安静了
✨ 适合一个人发呆、写字、整理相册的夜晚

💜 发笔记小 tips：
▫️ 封面用黑胶 + 霓虹紫最出片
▫️ 文案前 3 行决定完播率
▫️ 结尾留一个问题，互动率翻倍

🔖 #音乐分享 #氛围感 #私藏歌单 #小红书音乐博主

👇 你最近在单曲循环哪一首？`,
  };
}
