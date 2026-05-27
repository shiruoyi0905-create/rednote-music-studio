export type ThemeId = "champagne" | "ocean" | "sunset" | "silver";

export type Theme = {
  id: ThemeId;
  name: string;
  tagline: string;
  coverGradients: string[];
  canvas: {
    accent: string;
    accentSoft: string;
    border: string;
    glow: string;
    waveform: [string, string, string];
    coverStops: { c: string; p: number }[];
  };
};

export const THEMES: Theme[] = [
  {
    id: "champagne",
    name: "香槟深夜",
    tagline: "暖金 · 轻奢 · 适合爵士/复古",
    coverGradients: [
      "linear-gradient(135deg, #c9a66b 0%, #e8d5b5 40%, #8b7355 100%)",
      "linear-gradient(135deg, #d4a574 0%, #f5e6c8 50%, #a67c52 100%)",
    ],
    canvas: {
      accent: "#e8d5b5",
      accentSoft: "#9ca3af",
      border: "rgba(212, 165, 116, 0.35)",
      glow: "rgba(212, 165, 116, 0.4)",
      waveform: [
        "rgba(201, 166, 107, 0.5)",
        "rgba(232, 213, 181, 1)",
        "rgba(166, 124, 82, 1)",
      ],
      coverStops: [
        { c: "#c9a66b", p: 0 },
        { c: "#e8d5b5", p: 0.45 },
        { c: "#8b7355", p: 1 },
      ],
    },
  },
  {
    id: "ocean",
    name: "深海青泅",
    tagline: "青蓝 · 清冷 · 适合氛围电子",
    coverGradients: [
      "linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 50%, #0369a1 100%)",
      "linear-gradient(135deg, #38bdf8 0%, #14b8a6 45%, #1e3a5f 100%)",
    ],
    canvas: {
      accent: "#7dd3fc",
      accentSoft: "#94a3b8",
      border: "rgba(45, 212, 191, 0.35)",
      glow: "rgba(56, 189, 248, 0.35)",
      waveform: [
        "rgba(14, 165, 233, 0.45)",
        "rgba(45, 212, 191, 1)",
        "rgba(56, 189, 248, 1)",
      ],
      coverStops: [
        { c: "#0ea5e9", p: 0 },
        { c: "#2dd4bf", p: 0.5 },
        { c: "#0369a1", p: 1 },
      ],
    },
  },
  {
    id: "sunset",
    name: "落日胶片",
    tagline: "珊瑚橙 · 浪漫 · 适合 indie/pop",
    coverGradients: [
      "linear-gradient(135deg, #fb923c 0%, #f472b6 50%, #ef4444 100%)",
      "linear-gradient(135deg, #fdba74 0%, #f9a8d4 45%, #f97316 100%)",
    ],
    canvas: {
      accent: "#fed7aa",
      accentSoft: "#a8a29e",
      border: "rgba(251, 146, 60, 0.4)",
      glow: "rgba(249, 115, 22, 0.35)",
      waveform: [
        "rgba(251, 146, 60, 0.45)",
        "rgba(244, 114, 182, 1)",
        "rgba(253, 186, 116, 1)",
      ],
      coverStops: [
        { c: "#fb923c", p: 0 },
        { c: "#f472b6", p: 0.5 },
        { c: "#ea580c", p: 1 },
      ],
    },
  },
  {
    id: "silver",
    name: "银调极简",
    tagline: "黑白灰 · 克制 · 适合钢琴/古典",
    coverGradients: [
      "linear-gradient(135deg, #e5e7eb 0%, #9ca3af 50%, #4b5563 100%)",
      "linear-gradient(135deg, #f3f4f6 0%, #d1d5db 45%, #6b7280 100%)",
    ],
    canvas: {
      accent: "#e5e7eb",
      accentSoft: "#9ca3af",
      border: "rgba(229, 231, 235, 0.25)",
      glow: "rgba(255, 255, 255, 0.15)",
      waveform: [
        "rgba(156, 163, 175, 0.45)",
        "rgba(229, 231, 235, 1)",
        "rgba(107, 114, 128, 1)",
      ],
      coverStops: [
        { c: "#e5e7eb", p: 0 },
        { c: "#9ca3af", p: 0.5 },
        { c: "#4b5563", p: 1 },
      ],
    },
  },
];

export const DEFAULT_THEME_ID: ThemeId = "champagne";

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function pickCoverGradient(themeId: ThemeId, seed: string): string {
  const theme = getTheme(themeId);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % theme.coverGradients.length;
  }
  return theme.coverGradients[hash] ?? theme.coverGradients[0];
}
