"use client";

import { motion } from "framer-motion";
import { THEMES } from "@/lib/themes";
import { useTheme } from "./ThemeProvider";

type ThemePickerProps = {
  layout?: "inline" | "sidebar";
};

export default function ThemePicker({ layout = "inline" }: ThemePickerProps) {
  const { themeId, setThemeId } = useTheme();
  const isSidebar = layout === "sidebar";

  return (
    <div className={isSidebar ? "w-full" : "flex-1"}>
      <p className="u-text-muted mb-2 text-[11px]">氛围配色</p>
      <div
        className={
          isSidebar
            ? "grid grid-cols-2 gap-2 lg:grid-cols-1"
            : "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        {THEMES.map((t) => {
          const active = t.id === themeId;
          return (
            <motion.button
              key={t.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setThemeId(t.id)}
              className={`theme-chip min-h-16 rounded-2xl border px-3 py-2 text-left transition ${
                isSidebar ? "w-full" : "shrink-0"
              } ${
                active ? "theme-chip-active" : "theme-chip-idle"
              }`}
              data-theme-preview={t.id}
            >
              <span className="u-text-primary block text-xs font-medium">
                {t.name}
              </span>
              <span className="u-text-muted mt-0.5 block text-[10px]">
                {t.tagline}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
