"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_THEME_ID,
  getTheme,
  type Theme,
  type ThemeId,
} from "@/lib/themes";

const THEME_STORAGE_KEY = "music-workbench-theme";
const MODE_STORAGE_KEY = "music-workbench-color-mode";

export type ColorMode = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [colorMode, setColorModeState] = useState<ColorMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const savedTheme = localStorage.getItem(
        THEME_STORAGE_KEY
      ) as ThemeId | null;
      const savedMode = localStorage.getItem(
        MODE_STORAGE_KEY
      ) as ColorMode | null;
      if (savedTheme && getTheme(savedTheme)) setThemeIdState(savedTheme);
      if (savedMode === "light" || savedMode === "dark") {
        setColorModeState(savedMode);
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute("data-theme", themeId);
    document.documentElement.setAttribute("data-mode", colorMode);
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    localStorage.setItem(MODE_STORAGE_KEY, colorMode);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", colorMode === "light" ? "#f4f1ec" : "#121212");
    }
  }, [themeId, colorMode, ready]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorModeState((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      theme: getTheme(themeId),
      themeId,
      setThemeId,
      colorMode,
      setColorMode,
      toggleColorMode,
    }),
    [themeId, colorMode, setThemeId, setColorMode, toggleColorMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
