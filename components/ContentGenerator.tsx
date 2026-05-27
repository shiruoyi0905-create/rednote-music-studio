"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CopyButton from "./CopyButton";
import RegenerateButton from "./RegenerateButton";
import { DEFAULT_MOCK, getMockForPrompt, type MockContent } from "@/lib/mock";
import { pickCoverGradient } from "@/lib/themes";
import type { GenerateApiResponse, GeneratedContent } from "@/lib/types";
import { useTheme } from "./ThemeProvider";

type ContentGeneratorProps = {
  onContentChange: (content: MockContent) => void;
};

type GeneratePart = "all" | "titles" | "copy";

export default function ContentGenerator({
  onContentChange,
}: ContentGeneratorProps) {
  const { themeId } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState<MockContent>(DEFAULT_MOCK);
  const [generating, setGenerating] = useState(false);
  const [regeneratingTitles, setRegeneratingTitles] = useState(false);
  const [regeneratingCopy, setRegeneratingCopy] = useState(false);
  const [error, setError] = useState("");

  const isBusy = generating || regeneratingTitles || regeneratingCopy;

  const applyContent = (next: MockContent) => {
    const merged = {
      ...next,
      coverGradient: pickCoverGradient(themeId, next.song + next.mood),
    };
    setContent(merged);
    onContentChange(merged);
  };

  const resolveInput = () => prompt.trim() || "落日飞车 My Jinji 霓虹浪漫";

  const callGenerate = async (
    part: GeneratePart
  ): Promise<GeneratedContent | null> => {
    const input = resolveInput();
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: input,
        part,
        current:
          part === "copy" || part === "titles"
            ? {
                song: content.song,
                artist: content.artist,
                mood: content.mood,
                titles: content.titles,
                copy: content.copy,
              }
            : undefined,
      }),
    });

    const json = (await res.json()) as GenerateApiResponse;
    if (!res.ok || json.error) {
      throw new Error(json.error ?? `请求失败 (${res.status})`);
    }
    return json.data ?? null;
  };

  const handleGenerate = async () => {
    if (isBusy) return;
    setGenerating(true);
    setError("");

    try {
      const data = await callGenerate("all");
      if (data) applyContent(data);
      else throw new Error("未收到生成内容");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "生成失败，已使用本地示例";
      setError(message);
      applyContent(getMockForPrompt(resolveInput()));
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateTitles = async () => {
    if (isBusy) return;
    setRegeneratingTitles(true);
    setError("");

    try {
      const data = await callGenerate("titles");
      if (data) {
        applyContent({
          ...content,
          song: data.song,
          artist: data.artist,
          mood: data.mood,
          titles: data.titles,
          coverGradient: pickCoverGradient(themeId, data.song + data.mood),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "标题生成失败");
    } finally {
      setRegeneratingTitles(false);
    }
  };

  const handleRegenerateCopy = async () => {
    if (isBusy) return;
    setRegeneratingCopy(true);
    setError("");

    try {
      const data = await callGenerate("copy");
      if (data) {
        applyContent({
          ...content,
          copy: data.copy,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "文案生成失败");
    } finally {
      setRegeneratingCopy(false);
    }
  };

  const titlesText = content.titles.map((t, i) => `${i + 1}. ${t}`).join("\n");

  return (
    <section className="flex w-full flex-col gap-5">
      <div>
        <h2 className="u-text-primary text-lg font-semibold">内容生成区</h2>
        <p className="u-text-muted mt-1 text-xs">
          智能灵感 · 小红书标题 & 神仙文案
        </p>
      </div>

      <div className="flex items-stretch gap-2 sm:gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isBusy && handleGenerate()}
          placeholder="输入歌曲名或今日情绪..."
          className="input-glow u-input min-w-0 flex-1 rounded-2xl px-4 py-3.5 text-sm outline-none transition"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={isBusy}
          onClick={handleGenerate}
          className="ai-trigger relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl px-4 text-sm font-semibold disabled:cursor-not-allowed sm:px-6"
        >
          <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
            {generating ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                生成中
              </>
            ) : (
              <>✨ 生成</>
            )}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4"
        >
          <ResultCard
            title="AI 生成 · 5 个小红书标题"
            icon="📝"
            headerAction={
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <RegenerateButton
                  label="重生成标题"
                  loading={regeneratingTitles}
                  disabled={isBusy && !regeneratingTitles}
                  onClick={handleRegenerateTitles}
                />
                <CopyButton text={titlesText} />
              </div>
            }
          >
            <ul
              className={`space-y-3 transition-opacity ${
                regeneratingTitles ? "pointer-events-none opacity-40" : ""
              }`}
            >
              {content.titles.map((title, i) => (
                <li
                  key={`${i}-${title.slice(0, 12)}`}
                  className="u-list-item group flex items-start justify-between gap-3 rounded-xl p-3 transition"
                >
                  <span className="u-text-secondary text-sm leading-relaxed">
                    <span className="list-index mr-2">{i + 1}.</span>
                    {title}
                  </span>
                  <CopyButton text={title} />
                </li>
              ))}
            </ul>
          </ResultCard>

          <ResultCard
            title="带 Emoji 排版 · 神仙文案"
            icon="💬"
            headerAction={
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <RegenerateButton
                  label="重生成文案"
                  loading={regeneratingCopy}
                  disabled={isBusy && !regeneratingCopy}
                  onClick={handleRegenerateCopy}
                />
                <CopyButton text={content.copy} />
              </div>
            }
          >
            <pre
              className={`u-text-secondary whitespace-pre-wrap font-sans text-sm leading-relaxed transition-opacity ${
                regeneratingCopy ? "opacity-40" : ""
              }`}
            >
              {content.copy}
            </pre>
          </ResultCard>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function ResultCard({
  title,
  icon,
  headerAction,
  children,
}: {
  title: string;
  icon: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="result-card u-card rounded-2xl p-4 backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="u-text-primary text-sm font-medium">{title}</h3>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  );
}
