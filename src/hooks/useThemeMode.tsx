"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ThemeConfig } from "antd";
import { buildAntdTheme } from "@/themes/buildTheme";
import {
  applyCssVars,
  defaultPreferences,
  deriveCssVars,
  getPreset,
  normalizeSeeds,
  type ModeSeeds,
  type ThemePreferences,
  type ThemePresetId,
} from "@/themes/palette";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "qp-theme";
/** v4 = Volt như ảnh: dark mặc định, CTA lime, glow xanh */
const PREFS_KEY = "qp-theme-prefs-v4";
const LEGACY_PREFS_KEYS = [
  "qp-theme-prefs",
  "qp-theme-prefs-v2",
  "qp-theme-prefs-v3",
];

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  preferences: ThemePreferences;
  presetId: ThemePresetId;
  seeds: ModeSeeds;
  antdTheme: ThemeConfig;
  applyPreset: (id: Exclude<ThemePresetId, "custom">) => void;
  updateSeeds: (mode: ThemeMode, patch: Partial<ModeSeeds>) => void;
  resetTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

function clearLegacyPrefs() {
  try {
    LEGACY_PREFS_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

function readStoredPrefs(): ThemePreferences {
  const base = defaultPreferences();
  if (typeof window === "undefined") return base;
  try {
    clearLegacyPrefs();
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...base, mode: readStoredMode() };
    const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
    const mode =
      parsed.mode === "dark" || parsed.mode === "light"
        ? parsed.mode
        : readStoredMode();
    const presetId =
      parsed.presetId &&
      (parsed.presetId === "custom" || getPreset(parsed.presetId))
        ? parsed.presetId
        : "petrol";
    // Preset có sẵn → luôn lấy màu mới nhất từ code
    if (presetId !== "custom") {
      const preset = getPreset(presetId) ?? getPreset("petrol")!;
      return {
        mode,
        presetId: preset.id,
        light: { ...preset.light },
        dark: { ...preset.dark },
      };
    }
    return {
      mode,
      presetId,
      light: normalizeSeeds(parsed.light ?? {}, base.light),
      dark: normalizeSeeds(parsed.dark ?? {}, base.dark),
    };
  } catch {
    return { ...base, mode: readStoredMode() };
  }
}

function persistPrefs(prefs: ThemePreferences) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    localStorage.setItem(STORAGE_KEY, prefs.mode);
  } catch {
    /* ignore */
  }
}

function applyDomTheme(prefs: ThemePreferences) {
  if (typeof document === "undefined") return;
  const { mode } = prefs;
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.style.colorScheme = mode;
  const seeds = mode === "dark" ? prefs.dark : prefs.light;
  applyCssVars(deriveCssVars(seeds, mode));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(
    defaultPreferences,
  );

  useEffect(() => {
    const initial = readStoredPrefs();
    setPreferences(initial);
    applyDomTheme(initial);
    // Ghi lại v3 để lần sau không kéo palette cũ
    persistPrefs(initial);
  }, []);

  const commit = useCallback(
    (updater: (prev: ThemePreferences) => ThemePreferences) => {
      setPreferences((prev) => {
        const next = updater(prev);
        applyDomTheme(next);
        persistPrefs(next);
        return next;
      });
    },
    [],
  );

  const setMode = useCallback(
    (mode: ThemeMode) => {
      commit((prev) => ({ ...prev, mode }));
    },
    [commit],
  );

  const toggle = useCallback(() => {
    commit((prev) => ({
      ...prev,
      mode: prev.mode === "dark" ? "light" : "dark",
    }));
  }, [commit]);

  const applyPreset = useCallback(
    (id: Exclude<ThemePresetId, "custom">) => {
      const preset = getPreset(id);
      if (!preset) return;
      commit((prev) => ({
        ...prev,
        presetId: id,
        light: { ...preset.light },
        dark: { ...preset.dark },
      }));
    },
    [commit],
  );

  const updateSeeds = useCallback(
    (mode: ThemeMode, patch: Partial<ModeSeeds>) => {
      commit((prev) => {
        const key = mode === "dark" ? "dark" : "light";
        const current = prev[key];
        return {
          ...prev,
          presetId: "custom",
          [key]: normalizeSeeds({ ...current, ...patch }, current),
        };
      });
    },
    [commit],
  );

  const resetTheme = useCallback(() => {
    commit((prev) => ({ ...defaultPreferences(), mode: prev.mode }));
  }, [commit]);

  const seeds =
    preferences.mode === "dark" ? preferences.dark : preferences.light;

  const antdTheme = useMemo(
    () => buildAntdTheme(preferences.mode, seeds),
    [preferences.mode, seeds],
  );

  const value = useMemo(
    () => ({
      mode: preferences.mode,
      isDark: preferences.mode === "dark",
      setMode,
      toggle,
      preferences,
      presetId: preferences.presetId,
      seeds,
      antdTheme,
      applyPreset,
      updateSeeds,
      resetTheme,
    }),
    [
      preferences,
      setMode,
      toggle,
      seeds,
      antdTheme,
      applyPreset,
      updateSeeds,
      resetTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeMode phải dùng trong ThemeProvider");
  }
  return ctx;
}
