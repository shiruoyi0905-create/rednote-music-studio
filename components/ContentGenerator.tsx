"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CopyButton from "./CopyButton";
import RegenerateButton from "./RegenerateButton";
import { DEFAULT_MOCK, getMockForPrompt, type MockContent } from "@/lib/mock";
import { pickCoverGradient } from "@/lib/themes";
import type {
  ContentEvaluation,
  CreatorBrief,
  EvaluateApiResponse,
  GenerateApiResponse,
  GeneratedContent,
} from "@/lib/types";
import { useTheme } from "./ThemeProvider";

type ContentGeneratorProps = {
  onContentChange: (content: MockContent) => void;
};

type GeneratePart = "all" | "titles" | "copy";

const DEFAULT_BRIEF: CreatorBrief = {
  audience: "喜欢氛围感音乐的20-30岁城市用户",
  goal: "提升收藏与评论",
  tone: "真诚、克制、有具体场景",
  keywords: "",
  avoid: "夸张标题党、虚构经历",
};

export default function ContentGenerator({
  onContentChange,
}: ContentGeneratorProps) {
  const { themeId } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [brief, setBrief] = useState<CreatorBrief>(DEFAULT_BRIEF);
  const [content, setContent] = useState<MockContent>(DEFAULT_MOCK);
  const [evaluation, setEvaluation] = useState<ContentEvaluation | null>(null);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [regeneratingTitles, setRegeneratingTitles] = useState(false);
  const [regeneratingCopy, setRegeneratingCopy] = useState(false);
  const [error, setError] = useState("");

  const isBusy =
    generating || regeneratingTitles || regeneratingCopy || evaluating;

  const applyContent = (next: MockContent) => {
    const merged = {
      ...next,
      coverGradient: pickCoverGradient(themeId, next.song + next.mood),
    };
    setContent(merged);
    onContentChange(merged);
    setEvaluation(null);
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
        brief,
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

  const handleEvaluate = async () => {
    if (isBusy) return;
    setEvaluating(true);
    setError("");
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, brief }),
      });
      const json = (await response.json()) as EvaluateApiResponse;
      if (!response.ok || json.error || !json.data) {
        throw new Error(json.error ?? "质检失败");
      }
      setEvaluation(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "质检失败，请稍后重试");
    } finally {
      setEvaluating(false);
    }
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
          先定义创作策略，再生成、质检与优化
        </p>
      </div>

      <div className="u-card rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="u-text-primary text-sm font-semibold">创作 Brief</h3>
            <p className="u-text-muted mt-1 text-xs">
              明确受众和目标，减少“看起来都对”的泛化文案
            </p>
          </div>
          <span className="rounded-full border border-[var(--accent-border)] px-2.5 py-1 text-[10px] text-[var(--accent-soft)]">
            策略输入
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <BriefField
            label="目标受众"
            value={brief.audience}
            onChange={(audience) => setBrief((item) => ({ ...item, audience }))}
          />
          <BriefField
            label="创作目标"
            value={brief.goal}
            onChange={(goal) => setBrief((item) => ({ ...item, goal }))}
          />
          <BriefField
            label="表达风格"
            value={brief.tone}
            onChange={(tone) => setBrief((item) => ({ ...item, tone }))}
          />
          <BriefField
            label="必须包含"
            value={brief.keywords}
            placeholder="如：通勤、耳机、夏夜"
            onChange={(keywords) => setBrief((item) => ({ ...item, keywords }))}
          />
          <div className="sm:col-span-2">
            <BriefField
              label="避免表达"
              value={brief.avoid}
              onChange={(avoid) => setBrief((item) => ({ ...item, avoid }))}
            />
          </div>
        </div>
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
            title="场景化正文 · 可发布初稿"
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

          <ResultCard
            title="AI 内容质检"
            icon="◎"
            headerAction={
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={isBusy}
                onClick={handleEvaluate}
                className="rounded-xl border border-[var(--accent-border)] bg-[var(--chip-active-bg)] px-3 py-2 text-xs font-medium text-[var(--accent-soft)] disabled:opacity-50"
              >
                {evaluating ? "质检中…" : evaluation ? "重新质检" : "开始质检"}
              </motion.button>
            }
          >
            {evaluation ? (
              <EvaluationPanel evaluation={evaluation} />
            ) : (
              <div className="u-text-muted rounded-xl border border-dashed border-[var(--border-medium)] px-4 py-5 text-center text-xs leading-relaxed">
                从受众匹配、真实感、可读性和发布就绪度四个维度检查内容，输出风险与下一步修改建议。
              </div>
            )}
          </ResultCard>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function BriefField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="u-text-muted mb-1.5 block text-[11px]">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="u-input w-full rounded-xl px-3 py-2.5 text-xs outline-none transition"
      />
    </label>
  );
}

function EvaluationPanel({ evaluation }: { evaluation: ContentEvaluation }) {
  const dimensions = [
    ["受众匹配", evaluation.dimensions.audienceFit],
    ["真实感", evaluation.dimensions.authenticity],
    ["可读性", evaluation.dimensions.readability],
    ["发布就绪", evaluation.dimensions.publishReadiness],
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="u-text-muted text-[11px]">综合评分</p>
          <p className="u-text-primary mt-1 text-3xl font-bold">
            {evaluation.overallScore}
            <span className="u-text-muted ml-1 text-xs font-normal">/ 100</span>
          </p>
        </div>
        <span className="u-text-muted text-[10px]">
          {evaluation.source === "ai" ? "AI语义评测" : "本地规则评测"}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {dimensions.map(([label, score]) => (
          <div key={label} className="u-list-item rounded-xl px-3 py-2.5">
            <div className="mb-2 flex justify-between text-[11px]">
              <span className="u-text-secondary">{label}</span>
              <span className="u-text-primary font-semibold">{score}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--card-inset)]">
              <div
                className="h-full rounded-full bg-[var(--accent-primary)]"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <EvaluationList title="做得好的" items={evaluation.strengths} />
        <EvaluationList title="发布风险" items={evaluation.risks} />
      </div>
      <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--chip-active-bg)] px-3 py-3">
        <p className="text-[10px] font-semibold text-[var(--accent-soft)]">下一步建议</p>
        <p className="u-text-secondary mt-1 text-xs leading-relaxed">
          {evaluation.nextStep}
        </p>
      </div>
    </div>
  );
}

function EvaluationList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="u-list-item rounded-xl p-3">
      <p className="u-text-primary text-xs font-semibold">{title}</p>
      <ul className="u-text-secondary mt-2 space-y-1.5 text-[11px] leading-relaxed">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
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
