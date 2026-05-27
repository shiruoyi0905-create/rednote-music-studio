"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ColorModeToggle from "./ColorModeToggle";
import ThemePicker from "./ThemePicker";

export default function SettingsSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className={`settings-fab u-sidebar fixed left-3 top-24 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
          open ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-label="打开创作设置"
      >
        <span className="text-base leading-none">☰</span>
        设置
      </motion.button>

      {open && (
        <button
          type="button"
          className="settings-backdrop fixed inset-0 z-30 cursor-default"
          aria-label="关闭创作设置"
          onClick={() => setOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : "-108%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="settings-sidebar u-sidebar fixed left-3 top-4 z-40 max-h-[calc(100vh-2rem)] w-[min(360px,calc(100vw-1.5rem))] overflow-y-auto"
        aria-label="工作台设置"
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="t-accent-muted text-[10px] font-medium uppercase tracking-[0.2em]">
              创作工具
            </p>
            <h2 className="u-text-primary mt-1 text-base font-semibold">
              创作设置
            </h2>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(false)}
            className="u-play-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none"
            aria-label="收起创作设置"
          >
            ×
          </motion.button>
        </div>

        <div className="settings-section">
          <p className="u-text-muted text-[11px]">显示模式</p>
          <ColorModeToggle />
        </div>

        <div className="settings-section">
          <ThemePicker layout="sidebar" />
        </div>
      </motion.aside>
    </>
  );
}
