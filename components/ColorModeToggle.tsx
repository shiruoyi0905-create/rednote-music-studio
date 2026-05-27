"use client";

import { motion } from "framer-motion";
import { useTheme, type ColorMode } from "./ThemeProvider";

export default function ColorModeToggle() {
  const { colorMode, setColorMode } = useTheme();
  const options: { mode: ColorMode; label: string; icon: string }[] = [
    { mode: "dark", label: "深色", icon: "☾" },
    { mode: "light", label: "浅色", icon: "☼" },
  ];

  return (
    <div
      className="mode-toggle grid grid-cols-2 gap-1 rounded-2xl p-1"
      role="radiogroup"
      aria-label="选择深浅色模式"
    >
      {options.map((option) => {
        const active = option.mode === colorMode;
        return (
          <motion.button
            key={option.mode}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setColorMode(option.mode)}
            className={`mode-option rounded-xl px-3 py-2 text-xs font-medium transition ${
              active ? "mode-option-active" : "mode-option-idle"
            }`}
            role="radio"
            aria-checked={active}
          >
            <span className="mr-1.5 text-sm leading-none">{option.icon}</span>
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
