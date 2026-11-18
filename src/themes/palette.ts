import { isDarkHex, mix, normalizeHex, withAlpha } from "./color";

/** Seed colors the user can edit per mode */
export type ModeSeeds = {
  primary: string;
  accent: string;
  header: string;
  bg: string;
  surface: string;
  ink: string;
};

export type ThemePresetId =
  | "petrol"
  | "ocean"
  | "violet"
  | "amber"
  | "rose"
  | "slate"
  | "custom";

export type ThemePreferences = {
  mode: "light" | "dark";
  presetId: ThemePresetId;
  light: ModeSeeds;
  dark: ModeSeeds;
};

export type CssVarMap = Record<string, string>;

/** Brand Volt — tham chiếu: nền #030407, glow #1558C9, CTA #D4FF24 */
const BRAND = {
  black: "#030407",
  blue: "#1558C9",
  lime: "#D4FF24",
} as const;

/** Light: vẫn dùng bộ 3 màu, nền sáng dịu */
export const DEFAULT_LIGHT: ModeSeeds = {
  primary: BRAND.lime,
  accent: BRAND.blue,
  header: BRAND.black,
  bg: "#f3f5f8",
  surface: "#ffffff",
  ink: BRAND.black,
};

/** Dark (mặc định): đúng mood ảnh tham chiếu */
export const DEFAULT_DARK: ModeSeeds = {
  primary: BRAND.lime,
  accent: BRAND.blue,
  header: BRAND.black,
  bg: BRAND.black,
  surface: "#0b0e14",
  ink: "#f4f6fa",
};

export type ThemePreset = {
  id: Exclude<ThemePresetId, "custom">;
  label: string;
  light: ModeSeeds;
  dark: ModeSeeds;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "petrol",
    label: "Volt",
    light: DEFAULT_LIGHT,
    dark: DEFAULT_DARK,
  },
  {
    id: "ocean",
    label: "Biển",
    light: {
      primary: "#38bdf8",
      accent: "#0284c7",
      header: "#0c1924",
      bg: "#f0f9ff",
      surface: "#ffffff",
      ink: "#0c4a6e",
    },
    dark: {
      primary: "#38bdf8",
      accent: "#0284c7",
      header: "#030407",
      bg: "#030407",
      surface: "#0c1520",
      ink: "#e0f2fe",
    },
  },
  {
    id: "violet",
    label: "Tím",
    light: {
      primary: "#e9d5ff",
      accent: "#7c5cbf",
      header: "#1a1228",
      bg: "#f7f4fc",
      surface: "#ffffff",
      ink: "#3b2763",
    },
    dark: {
      primary: "#e9d5ff",
      accent: "#a78bdb",
      header: "#030407",
      bg: "#030407",
      surface: "#14101c",
      ink: "#f3eefc",
    },
  },
  {
    id: "amber",
    label: "Nắng",
    light: {
      primary: "#fbbf47",
      accent: "#ea8c1f",
      header: "#1c160e",
      bg: "#fffbf3",
      surface: "#ffffff",
      ink: "#5c3b0e",
    },
    dark: {
      primary: "#fbbf47",
      accent: "#ea8c1f",
      header: "#030407",
      bg: "#030407",
      surface: "#16120c",
      ink: "#fff7e8",
    },
  },
  {
    id: "rose",
    label: "Đào",
    light: {
      primary: "#fda4af",
      accent: "#e06b7a",
      header: "#1c1215",
      bg: "#fff5f6",
      surface: "#ffffff",
      ink: "#6b2430",
    },
    dark: {
      primary: "#fda4af",
      accent: "#e06b7a",
      header: "#030407",
      bg: "#030407",
      surface: "#161014",
      ink: "#fff0f2",
    },
  },
  {
    id: "slate",
    label: "Sky",
    light: {
      primary: "#cbd5e1",
      accent: "#5b7c99",
      header: "#121820",
      bg: "#f4f7fa",
      surface: "#ffffff",
      ink: "#243447",
    },
    dark: {
      primary: "#cbd5e1",
      accent: "#5b7c99",
      header: "#030407",
      bg: "#030407",
      surface: "#12161c",
      ink: "#eef3f7",
    },
  },
];

export function getPreset(id: ThemePresetId): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id);
}

export function defaultPreferences(): ThemePreferences {
  return {
    mode: "dark",
    presetId: "petrol",
    light: { ...DEFAULT_LIGHT },
    dark: { ...DEFAULT_DARK },
  };
}

export function normalizeSeeds(seeds: Partial<ModeSeeds>, fallback: ModeSeeds): ModeSeeds {
  return {
    primary: normalizeHex(seeds.primary ?? fallback.primary, fallback.primary),
    accent: normalizeHex(seeds.accent ?? fallback.accent, fallback.accent),
    header: normalizeHex(seeds.header ?? fallback.header, fallback.header),
    bg: normalizeHex(seeds.bg ?? fallback.bg, fallback.bg),
    surface: normalizeHex(seeds.surface ?? fallback.surface, fallback.surface),
    ink: normalizeHex(seeds.ink ?? fallback.ink, fallback.ink),
  };
}

/** Derive full CSS vars from seed colors for one mode */
export function deriveCssVars(seeds: ModeSeeds, mode: "light" | "dark"): CssVarMap {
  const primary = seeds.primary;
  const accent = seeds.accent;
  const header = seeds.header;
  const bg = seeds.bg;
  const surface = seeds.surface;
  const ink = seeds.ink;
  // Light: muted đậm hơn để chữ phụ dễ đọc trên nền sáng
  const inkMuted = mix(ink, bg, mode === "dark" ? 0.42 : 0.28);
  const white = "#ffffff";
  const black = "#000000";

  const primaryIsBright = !isDarkHex(primary);
  const primaryInk = primaryIsBright ? BRAND.black : white;
  // Chữ nhấn: tối → lime; sáng → xanh (lime trên trắng khó nhìn)
  const emphasis =
    mode === "light" && primaryIsBright
      ? mix(accent, black, 0.12)
      : primary;

  const primarySoft =
    mode === "dark" ? mix(accent, surface, 0.78) : mix(accent, white, 0.88);
  const surfaceSoft =
    mode === "dark" ? mix(surface, white, 0.05) : mix(surface, accent, 0.05);
  const border =
    mode === "dark" ? mix(surface, white, 0.12) : mix(accent, black, 0.18);
  const borderSoft =
    mode === "dark" ? mix(surface, white, 0.08) : mix(accent, white, 0.82);

  const glowA =
    mode === "dark" ? withAlpha(accent, 0.35) : mix(accent, white, 0.78);
  const glowB =
    mode === "dark" ? withAlpha(primary, 0.12) : mix(accent, white, 0.88);

  const bgMid = mode === "dark" ? mix(bg, accent, 0.04) : mix(bg, white, 0.4);
  const bgEnd = mode === "dark" ? bg : mix(bg, black, 0.02);

  const choiceBg = surface;
  const choiceHoverBg =
    mode === "dark" ? mix(surface, white, 0.05) : mix(accent, white, 0.94);
  const choiceHoverBorder = mix(accent, border, 0.45);
  const choiceCheckedBg =
    mode === "dark" ? mix(accent, surface, 0.7) : mix(accent, white, 0.88);

  const correctBase = "#16a34a";
  const wrongBase = "#dc2626";
  const correctBg =
    mode === "dark" ? mix(correctBase, surface, 0.72) : mix(correctBase, white, 0.78);
  const wrongBg =
    mode === "dark" ? mix(wrongBase, surface, 0.7) : mix(wrongBase, white, 0.78);
  const correctBorder =
    mode === "dark" ? mix(correctBase, white, 0.25) : mix(correctBase, black, 0.05);
  const wrongBorder =
    mode === "dark" ? mix(wrongBase, white, 0.2) : mix(wrongBase, black, 0.05);
  const correctInk =
    mode === "dark" ? mix(correctBase, white, 0.45) : mix(correctBase, black, 0.35);
  const wrongInk =
    mode === "dark" ? mix(wrongBase, white, 0.4) : mix(wrongBase, black, 0.3);

  const navEmpty = surfaceSoft;
  const navAnswered =
    mode === "dark" ? mix(primary, surface, 0.75) : mix(primary, white, 0.45);
  const navAnsweredInk = primaryIsBright ? BRAND.black : ink;

  return {
    "--qp-ink": ink,
    "--qp-ink-muted": inkMuted,
    "--qp-primary": primary,
    "--qp-primary-ink": primaryInk,
    "--qp-emphasis": emphasis,
    "--qp-accent": accent,
    "--qp-accent-ink": white,
    "--qp-primary-deep": header,
    "--qp-primary-soft": primarySoft,
    "--qp-bg": bg,
    "--qp-surface": surface,
    "--qp-surface-soft": surfaceSoft,
    "--qp-border": border,
    "--qp-border-soft": borderSoft,
    "--qp-shadow":
      mode === "dark"
        ? `0 1px 2px rgba(0,0,0,0.5), 0 16px 40px ${withAlpha(accent, 0.12)}`
        : `0 1px 2px ${withAlpha(header, 0.05)}, 0 10px 28px ${withAlpha(accent, 0.08)}`,
    "--qp-shadow-sm":
      mode === "dark"
        ? "0 1px 2px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.35)"
        : `0 1px 2px ${withAlpha(header, 0.04)}, 0 4px 14px ${withAlpha(accent, 0.06)}`,
    "--qp-glow-a": glowA,
    "--qp-glow-b": glowB,
    "--qp-bg-mid": bgMid,
    "--qp-bg-end": bgEnd,
    "--qp-choice-bg": choiceBg,
    "--qp-choice-hover-bg": choiceHoverBg,
    "--qp-choice-hover-border": choiceHoverBorder,
    "--qp-choice-checked-bg": choiceCheckedBg,
    "--qp-correct-bg": correctBg,
    "--qp-wrong-bg": wrongBg,
    "--qp-correct-border": correctBorder,
    "--qp-wrong-border": wrongBorder,
    "--qp-correct-ink": correctInk,
    "--qp-wrong-ink": wrongInk,
    "--qp-upload-steps-bg":
      mode === "dark" ? withAlpha(surface, 0.9) : "rgba(255, 255, 255, 0.78)",
    "--qp-drop-bg": `linear-gradient(180deg, ${mix(surface, white, mode === "dark" ? 0.02 : 0.02)} 0%, ${mix(surface, accent, mode === "dark" ? 0.12 : 0.05)} 100%)`,
    "--qp-nav-empty-bg": navEmpty,
    "--qp-nav-answered-bg": navAnswered,
    "--qp-nav-answered-ink": navAnsweredInk,
  };
}

export function applyCssVars(vars: CssVarMap) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function clearAppliedCssVars(keys: string[]) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  keys.forEach((key) => root.style.removeProperty(key));
}

export function seedsContrastOk(seeds: ModeSeeds): boolean {
  return isDarkHex(seeds.ink) !== isDarkHex(seeds.surface);
}
