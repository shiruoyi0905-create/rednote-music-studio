"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import VinylRecord from "./VinylRecord";
import Waveform from "./Waveform";
import { exportViralCoverPng } from "@/lib/exportCover";
import {
  VIRAL_COVER_STYLES,
  drawViralCoverToCanvas,
  type ViralCoverStyle,
} from "@/lib/drawCoverCanvas";
import type { MockContent } from "@/lib/mock";
import { useTheme } from "./ThemeProvider";

type PreviewSectionProps = {
  content: MockContent;
  compact?: boolean;
};

export default function PreviewSection({
  content,
  compact = false,
}: PreviewSectionProps) {
  const { themeId } = useTheme();
  const previewRef = useRef<HTMLElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [exportingViral, setExportingViral] = useState(false);
  const [downloadingViral, setDownloadingViral] = useState(false);
  const [viralStyle, setViralStyle] = useState<ViralCoverStyle>("song");
  const [viralPreviewUrl, setViralPreviewUrl] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState("");
  const [sourceImageName, setSourceImageName] = useState("");
  const [previewMode, setPreviewMode] = useState<"vinyl" | "viral">("viral");
  const [exportMsg, setExportMsg] = useState("");

  const handleSourceImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setExportMsg("请上传图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setSourceImageUrl(result);
      setSourceImageName(file.name);
      setViralPreviewUrl("");
      setPreviewMode("viral");
      setExportMsg("底图已上传，可以生成爆款封面");
    };
    reader.onerror = () => setExportMsg("图片读取失败，请重试");
    reader.readAsDataURL(file);
  };

  const handleExportViral = async () => {
    if (exportingViral) return;
    if (!sourceImageUrl) {
      setPreviewMode("viral");
      setExportMsg("请先上传一张图片作为二创底图");
      return;
    }
    setExportingViral(true);
    setExportMsg("");

    const wasPlaying = isPlaying;
    setIsPlaying(false);

    try {
      const canvas = await drawViralCoverToCanvas(
        content,
        themeId,
        viralStyle,
        sourceImageUrl
      );
      setViralPreviewUrl(canvas.toDataURL("image/png"));
      setPreviewMode("viral");
      setExportMsg("爆款封面已生成，可预览或下载");
      window.setTimeout(() => {
        previewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      setExportMsg(
        detail ? `导出失败：${detail.slice(0, 48)}` : "导出失败，请重试"
      );
    } finally {
      setIsPlaying(wasPlaying);
      setExportingViral(false);
      setTimeout(() => setExportMsg(""), 3000);
    }
  };

  const handleDownloadViral = async () => {
    if (downloadingViral) return;
    setDownloadingViral(true);
    setExportMsg("");

    try {
      const safeName = content.song
        .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
        .slice(0, 40);
      await exportViralCoverPng(
        content,
        themeId,
        viralStyle,
        `viral-cover-${safeName || "music"}.png`,
        sourceImageUrl
      );
      setExportMsg("爆款封面已下载（1080×1440）");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      setExportMsg(
        detail ? `下载失败：${detail.slice(0, 48)}` : "下载失败，请重试"
      );
    } finally {
      setDownloadingViral(false);
      setTimeout(() => setExportMsg(""), 3000);
    }
  };

  return (
    <section ref={previewRef} className="flex w-full flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`preview-glow u-card relative w-full rounded-3xl p-6 backdrop-blur-xl sm:p-8 ${
          compact ? "max-w-sm lg:p-6" : "max-w-sm sm:max-w-md"
        }`}
      >
        <div className="glow-orb-a pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-3xl" />
        <div className="glow-orb-b pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full blur-3xl" />

        <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="t-accent-muted text-[10px] font-medium uppercase tracking-[0.2em]">
              {previewMode === "viral" ? "爆款封面预览" : "黑胶氛围预览"}
            </p>
            <p className="u-text-muted mt-1 text-xs">
              {previewMode === "viral" ? "上传参考图后生成结果" : content.mood}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {previewMode === "vinyl" && (
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="u-play-btn rounded-full px-3 py-1.5 text-[11px] font-medium transition"
                aria-pressed={isPlaying}
              >
                动效{isPlaying ? "开" : "关"}
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                setPreviewMode((mode) => (mode === "viral" ? "vinyl" : "viral"))
              }
              className="mode-toggle rounded-full px-3 py-1.5 text-[11px] font-medium transition"
            >
              {previewMode === "viral" ? "黑胶氛围" : "返回封面"}
            </button>
          </div>
        </div>

        {previewMode === "viral" ? (
          viralPreviewUrl ? (
            <div className="viral-preview-frame relative z-10 mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viralPreviewUrl}
                alt="生成的爆款封面预览"
                className="block aspect-[3/4] w-full object-cover"
              />
            </div>
          ) : (
            <div className="viral-preview-empty relative z-10 flex aspect-[3/4] w-full max-w-[280px] flex-col items-center justify-center rounded-2xl px-6 text-center">
              <p className="u-text-primary text-sm font-semibold">
                先上传图片，再生成封面
              </p>
              <p className="u-text-muted mt-2 text-xs leading-relaxed">
                AI 二创会基于你的底图做裁切、调色和爆款标题排版。
              </p>
            </div>
          )
        ) : (
          <>
            <VinylRecord
              isPlaying={isPlaying}
              coverGradient={content.coverGradient}
              song={content.song}
              artist={content.artist}
            />

            <div className="mt-8">
              <Waveform isPlaying={isPlaying} />
            </div>
          </>
        )}
      </motion.div>

      <div
        className={`mt-6 flex w-full flex-col gap-3 ${
          compact ? "max-w-sm" : "max-w-sm sm:max-w-md"
        }`}
      >
        <div className="u-card rounded-3xl p-3">
          <div className="mb-4">
            <p className="u-text-primary text-sm font-semibold">爆款封面</p>
            <p className="u-text-muted mt-0.5 text-[11px]">
              上传底图 · 选择风格 · 生成 3:4 封面
            </p>
          </div>

          <div className="cover-flow-step">
            <span className="cover-flow-index">1</span>
            <label className="upload-dropzone flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-3 transition">
              <div className="min-w-0">
                <p className="u-text-primary text-xs font-medium">上传参考图</p>
                <p className="u-text-muted mt-0.5 truncate text-[10px]">
                  {sourceImageName || "选择一张照片/截图作为二创底图"}
                </p>
              </div>
              <span className="copy-btn shrink-0 rounded-md px-2 py-1 text-[10px]">
                选择图片
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSourceImageChange}
                className="sr-only"
              />
            </label>
          </div>

          <div className="cover-flow-step mt-3">
            <span className="cover-flow-index">2</span>
            <div className="min-w-0 flex-1">
              <p className="u-text-primary mb-2 text-xs font-medium">
                选择封面风格
              </p>
              <div className="grid grid-cols-2 gap-2">
                {VIRAL_COVER_STYLES.map((style) => {
                  const active = style.id === viralStyle;
                  return (
                    <motion.button
                      key={style.id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setViralStyle(style.id)}
                      className={`theme-chip min-h-16 rounded-2xl border px-3 py-2 text-left transition ${
                        active ? "theme-chip-active" : "theme-chip-idle"
                      }`}
                    >
                      <span className="u-text-primary block text-xs font-medium">
                        {style.name}
                      </span>
                      <span className="u-text-muted mt-0.5 block text-[10px]">
                        {style.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="cover-flow-step mt-3">
            <span className="cover-flow-index">3</span>
            <div className="min-w-0 flex-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={exportingViral || !sourceImageUrl}
                onClick={handleExportViral}
                className="btn-accent flex w-full items-center justify-center rounded-2xl py-3 text-sm font-semibold transition disabled:opacity-60"
              >
                {exportingViral ? "生成中…" : "生成爆款封面"}
              </motion.button>
              {!sourceImageUrl && (
                <p className="u-text-muted mt-2 text-center text-[10px]">
                  先上传参考图后即可生成
                </p>
              )}
              {viralPreviewUrl && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  disabled={downloadingViral}
                  onClick={handleDownloadViral}
                  className="u-play-btn mt-3 flex w-full items-center justify-center rounded-2xl py-3 text-sm font-medium transition disabled:opacity-60"
                >
                  {downloadingViral ? "下载中…" : "下载 1080×1440 PNG"}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {exportMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center text-xs ${
              exportMsg.includes("失败")
                ? "text-amber-300/90"
                : "text-emerald-400/90"
            }`}
          >
            {exportMsg}
          </motion.p>
        )}
      </div>
    </section>
  );
}
