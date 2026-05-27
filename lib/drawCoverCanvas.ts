import type { MockContent } from "@/lib/mock";
import { getTheme, type ThemeId } from "./themes";

const W = 680;
const H = 920;
const VIRAL_W = 1080;
const VIRAL_H = 1440;

export type ViralCoverStyle = "song" | "bold" | "tutorial" | "lyric";

export const VIRAL_COVER_STYLES: {
  id: ViralCoverStyle;
  name: string;
  label: string;
}[] = [
  { id: "song", name: "曲名弹唱", label: "白字歌名款" },
  { id: "bold", name: "黄字爆点", label: "粗描边大字" },
  { id: "tutorial", name: "教程种草", label: "小白秒变达人" },
  { id: "lyric", name: "氛围歌词", label: "轻文字故事感" },
];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillTextCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y, maxWidth);
}

function stripEmoji(text: string) {
  return text
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function splitTitle(text: string) {
  const clean = stripEmoji(text)
    .replace(/^[0-9]+[.、]\s*/, "")
    .replace(/[｜|].*$/, "")
    .replace(/[，,。.!！?？].*$/, "")
    .trim();

  if (clean.length <= 10) return clean;
  return clean.slice(0, 10);
}

function wrapTextByChars(text: string, maxChars: number, maxLines: number) {
  const clean = text.trim();
  const lines: string[] = [];
  let i = 0;
  while (i < clean.length && lines.length < maxLines) {
    lines.push(clean.slice(i, i + maxChars));
    i += maxChars;
  }
  return lines;
}

function fillWrappedText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  maxWidth: number
) {
  lines.forEach((line, index) => {
    fillTextCenter(ctx, line, x, y + index * lineHeight, maxWidth);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
  });
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function getViralCopy(content: MockContent, style: ViralCoverStyle) {
  const title = splitTitle(content.titles[0] ?? content.song);
  const song = stripEmoji(content.song).slice(0, 18) || "这首歌";
  const mood = stripEmoji(content.mood).slice(0, 18);

  if (style === "bold") {
    return {
      kicker: "弹唱博主",
      headline: "录音设备分享",
      subline: `${song}｜弹唱封面`,
      stamp: "COVER NOTE",
    };
  }

  if (style === "tutorial") {
    return {
      kicker: "新手友好",
      headline: "小白秒变弹唱达人",
      subline: `${song} · ${mood || "练歌灵感"}`,
      stamp: "GUITAR TIPS",
    };
  }

  if (style === "lyric") {
    return {
      kicker: "今日弹唱",
      headline: title || song,
      subline: `${song}｜${mood || "氛围感弹唱"}`,
      stamp: "LIVE COVER",
    };
  }

  return {
    kicker: "弹唱片段",
    headline: `《${song}》`,
    subline: title || mood || "总有一首歌是你喜欢的",
    stamp: "ACOUSTIC COVER",
  };
}

function strokeTextCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(text, x, y, maxWidth);
  ctx.fillText(text, x, y, maxWidth);
}

function drawOutlinedLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  maxWidth: number,
  fill: string,
  stroke: string,
  strokeWidth: number
) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = "round";
  lines.forEach((line, index) => {
    strokeTextCenter(ctx, line, x, y + index * lineHeight, maxWidth);
  });
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  colors: [string, string, string]
) {
  const barW = 6;
  const gap = 5;
  const count = 28;
  const totalW = count * barW + (count - 1) * gap;
  let x = cx - totalW / 2;

  const grad = ctx.createLinearGradient(0, y - 40, 0, y);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.5, colors[1]);
  grad.addColorStop(1, colors[2]);
  ctx.fillStyle = grad;

  for (let i = 0; i < count; i++) {
    const h = 12 + ((i * 7) % 11) * 3 + (i % 3) * 4;
    roundRect(ctx, x, y - h, barW, h, 3);
    ctx.fill();
    x += barW + gap;
  }
}

function parseCoverStops(content: MockContent, themeId: ThemeId) {
  const fallback = getTheme(themeId).canvas.coverStops;
  const match = content.coverGradient.match(/#[0-9a-fA-F]{3,8}/g);
  if (match && match.length >= 2) {
    return match.slice(0, 3).map((c, i, arr) => ({
      c,
      p: i / Math.max(arr.length - 1, 1),
    }));
  }
  return fallback;
}

export function drawCoverToCanvas(
  content: MockContent,
  themeId: ThemeId
): HTMLCanvasElement {
  const theme = getTheme(themeId);
  const { canvas: c } = theme;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布");

  ctx.fillStyle = "#1a1a1a";
  roundRect(ctx, 40, 40, W - 80, H - 80, 48);
  ctx.fill();

  ctx.strokeStyle = c.border;
  ctx.lineWidth = 2;
  roundRect(ctx, 40, 40, W - 80, H - 80, 48);
  ctx.stroke();

  ctx.shadowColor = c.glow;
  ctx.shadowBlur = 48;
  roundRect(ctx, 40, 40, W - 80, H - 80, 48);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const cx = W / 2;

  ctx.fillStyle = c.accent;
  ctx.font = "500 20px system-ui, sans-serif";
  fillTextCenter(ctx, "VISUAL PREVIEW", cx, 100, W - 120);

  ctx.fillStyle = c.accentSoft;
  ctx.font = "400 24px system-ui, sans-serif";
  fillTextCenter(ctx, content.mood, cx, 140, W - 120);

  const vinylR = 110;
  const vinylY = 320;
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(cx, vinylY, vinylR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = c.border;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, vinylY, vinylR, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.04 + i * 0.02})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, vinylY, vinylR - 18 - i * 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  const labelR = 44;
  const coverGrad = ctx.createLinearGradient(
    cx - labelR,
    vinylY - labelR,
    cx + labelR,
    vinylY + labelR
  );
  parseCoverStops(content, themeId).forEach(({ c: color, p }) =>
    coverGrad.addColorStop(p, color)
  );
  ctx.fillStyle = coverGrad;
  ctx.beginPath();
  ctx.arc(cx, vinylY, labelR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px system-ui, sans-serif";
  const label = (content.song.slice(0, 6) || "MUSIC").toUpperCase();
  fillTextCenter(ctx, label, cx, vinylY, labelR * 2);

  ctx.fillStyle = "#121212";
  ctx.beginPath();
  ctx.arc(cx, vinylY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f5f5f5";
  ctx.font = "600 32px system-ui, sans-serif";
  fillTextCenter(ctx, content.song, cx, 470, W - 120);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "400 24px system-ui, sans-serif";
  fillTextCenter(ctx, content.artist, cx, 510, W - 120);

  drawWaveform(ctx, cx, 600, c.waveform);

  return canvas;
}

export async function drawViralCoverToCanvas(
  content: MockContent,
  themeId: ThemeId,
  style: ViralCoverStyle,
  sourceImageUrl?: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = VIRAL_W;
  canvas.height = VIRAL_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布");

  if (sourceImageUrl) {
    const sourceImage = await loadImage(sourceImageUrl);
    ctx.save();
    ctx.filter =
      style === "song" || style === "lyric"
        ? "saturate(1.12) contrast(1.04) brightness(0.86)"
        : "saturate(1.18) contrast(1.1) brightness(0.78)";
    drawImageCover(ctx, sourceImage, 0, 0, VIRAL_W, VIRAL_H);
    ctx.restore();
  } else {
    const bg = ctx.createLinearGradient(0, 0, VIRAL_W, VIRAL_H);
    parseCoverStops(content, themeId).forEach(({ c: color, p }) =>
      bg.addColorStop(p, color)
    );
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, VIRAL_W, VIRAL_H);
  }

  const colorWash = ctx.createLinearGradient(0, 0, VIRAL_W, VIRAL_H);
  parseCoverStops(content, themeId).forEach(({ c: color, p }) =>
    colorWash.addColorStop(p, color)
  );
  ctx.fillStyle = sourceImageUrl ? colorWash : "rgba(255,255,255,0)";
  ctx.globalAlpha = sourceImageUrl ? 0.28 : 1;
  ctx.fillRect(0, 0, VIRAL_W, VIRAL_H);
  ctx.globalAlpha = 1;

  const darkOverlay = style === "lyric" || style === "song" ? 0.18 : 0.3;
  ctx.fillStyle = `rgba(0,0,0,${darkOverlay})`;
  ctx.fillRect(0, 0, VIRAL_W, VIRAL_H);

  const cx = VIRAL_W / 2;
  const copy = getViralCopy(content, style);
  const headlineLines = wrapTextByChars(copy.headline, style === "tutorial" ? 5 : 7, 3);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (style === "bold" || style === "tutorial") {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    roundRect(ctx, 56, VIRAL_H - 370, VIRAL_W - 112, 290, 26);
    ctx.fill();

    ctx.font = "900 96px system-ui, sans-serif";
    drawOutlinedLines(
      ctx,
      headlineLines,
      cx,
      style === "tutorial" ? 780 : 845,
      108,
      VIRAL_W - 120,
      "#fff7a8",
      "#6b4a00",
      18
    );

    if (style === "bold") {
      ctx.font = "900 66px system-ui, sans-serif";
      drawOutlinedLines(ctx, ["弹唱", "博主"], 220, 560, 78, 320, "#ffffff", "#8a6412", 14);
    }

    ctx.font = "800 40px system-ui, sans-serif";
    drawOutlinedLines(ctx, [copy.subline], cx, 1192, 52, VIRAL_W - 180, "#ffffff", "#111111", 8);
  } else {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = style === "song" ? "500 68px serif" : "500 58px serif";
    fillWrappedText(ctx, headlineLines, cx, style === "song" ? 780 : 650, 88, VIRAL_W - 160);
    ctx.font = "400 38px serif";
    fillTextCenter(ctx, copy.subline, cx, style === "song" ? 900 : 770, VIRAL_W - 160);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  roundRect(ctx, 58, 76, 260, 70, 35);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 30px system-ui, sans-serif";
  fillTextCenter(ctx, copy.kicker, 188, 111, 210);

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.fillText(copy.stamp, VIRAL_W - 250, 112, 340);

  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fillRect(0, VIRAL_H - 150, VIRAL_W, 150);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 34px system-ui, sans-serif";
  fillTextCenter(ctx, "封面基于上传图片二创生成", cx, 1342, VIRAL_W - 160);

  return canvas;
}

export function downloadCoverCanvas(
  content: MockContent,
  themeId: ThemeId,
  fileName: string
): void {
  const canvas = drawCoverToCanvas(content, themeId);
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadViralCoverCanvas(
  content: MockContent,
  themeId: ThemeId,
  style: ViralCoverStyle,
  fileName: string,
  sourceImageUrl?: string
): Promise<void> {
  const canvas = await drawViralCoverToCanvas(
    content,
    themeId,
    style,
    sourceImageUrl
  );
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
