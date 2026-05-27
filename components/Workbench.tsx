"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PreviewSection from "./PreviewSection";
import ContentGenerator from "./ContentGenerator";
import SettingsSidebar from "./SettingsSidebar";
import { useTheme } from "./ThemeProvider";
import { DEFAULT_MOCK, type MockContent } from "@/lib/mock";
import { pickCoverGradient } from "@/lib/themes";

export default function Workbench() {
  const { themeId } = useTheme();
  const [content, setContent] = useState<MockContent>(DEFAULT_MOCK);
  const previewContent = useMemo(
    () => ({
      ...content,
      coverGradient: pickCoverGradient(themeId, content.song + content.mood),
    }),
    [content, themeId]
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora-bg pointer-events-none fixed inset-0" />
      <div className="u-scrim pointer-events-none fixed inset-0" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center lg:mb-8 lg:text-left"
        >
          <p className="t-accent-muted text-[10px] font-medium uppercase tracking-[0.25em]">
            小红书音乐创作台
          </p>
          <h1 className="t-title-gradient mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            音乐博主工作台
          </h1>
          <p className="u-text-muted mt-2 text-sm">
            黑胶视觉 · AI 文案 · 一键出片
          </p>
        </motion.header>

        <SettingsSidebar />

        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(420px,1.1fr)] lg:items-start lg:gap-10">
          <div className="order-2 lg:sticky lg:top-6 lg:order-1">
            <PreviewSection content={previewContent} compact />
          </div>
          <div className="order-1 lg:order-2">
            <ContentGenerator onContentChange={setContent} />
          </div>
        </div>

        <footer className="u-text-muted mt-12 text-center text-[10px] opacity-70">
          智能创作助手 · 默认展示《My Jinji》示例
        </footer>
      </div>
    </div>
  );
}
