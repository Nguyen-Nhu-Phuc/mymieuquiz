import { theme, type ThemeConfig } from "antd";
import { isDarkHex, mix, withAlpha } from "./color";
import type { ModeSeeds } from "./palette";

const shared = {
  borderRadius: 14,
  borderRadiusLG: 18,
  controlHeight: 42,
  controlHeightLG: 48,
  fontFamily:
    'var(--font-be-vietnam), "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif',
  fontSize: 15,
  lineHeight: 1.55,
  colorSuccess: "#22C55E",
  colorWarning: "#F59E0B",
  colorError: "#EF4444",
} as const;

export function buildAntdTheme(
  mode: "light" | "dark",
  seeds: ModeSeeds,
): ThemeConfig {
  const primary = seeds.primary;
  const accent = seeds.accent;
  const header = seeds.header;
  const bg = seeds.bg;
  const surface = seeds.surface;
  const ink = seeds.ink;
  const primaryBright = !isDarkHex(primary);
  const primaryInk = primaryBright ? "#030407" : "#ffffff";
  const inkMuted = mix(ink, bg, mode === "dark" ? 0.42 : 0.45);
  const border =
    mode === "dark"
      ? mix(surface, "#ffffff", 0.12)
      : mix(accent, "#ffffff", 0.78);
  const borderSoft =
    mode === "dark"
      ? mix(surface, "#ffffff", 0.08)
      : mix(accent, "#ffffff", 0.88);
  const elevated =
    mode === "dark" ? mix(surface, "#ffffff", 0.05) : surface;
  const tableHeader =
    mode === "dark" ? mix(surface, "#ffffff", 0.04) : mix(surface, accent, 0.04);
  const hoverBorder = mix(accent, "#ffffff", mode === "dark" ? 0.25 : 0.35);

  return {
    algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      ...shared,
      colorPrimary: primary,
      colorInfo: accent,
      colorText: ink,
      colorTextSecondary: inkMuted,
      colorTextLightSolid: primaryInk,
      colorLink: accent,
      colorBorder: border,
      colorBorderSecondary: borderSoft,
      colorBgLayout: bg,
      colorBgContainer: surface,
      colorBgElevated: elevated,
      boxShadow:
        mode === "dark"
          ? `0 1px 2px rgba(0,0,0,0.5), 0 16px 40px ${withAlpha(accent, 0.14)}`
          : `0 1px 2px ${withAlpha(header, 0.04)}, 0 8px 24px ${withAlpha(accent, 0.08)}`,
      boxShadowSecondary:
        mode === "dark"
          ? "0 1px 2px rgba(0,0,0,0.3), 0 4px 14px rgba(0,0,0,0.35)"
          : `0 1px 2px ${withAlpha(header, 0.03)}, 0 4px 14px ${withAlpha(accent, 0.06)}`,
    },
    components: {
      Layout: {
        headerBg: header,
        headerColor: "#FFFFFF",
        bodyBg: "transparent",
        footerBg: "transparent",
      },
      Button: {
        controlHeight: 42,
        fontWeight: 700,
        primaryShadow: `0 8px 24px ${withAlpha(primary, mode === "dark" ? 0.35 : 0.28)}`,
        primaryColor: primaryInk,
        borderRadius: 999,
        defaultBorderColor: border,
        defaultColor: ink,
      },
      Card: {
        borderRadiusLG: 18,
        paddingLG: 24,
      },
      Input: {
        controlHeight: 42,
        activeBorderColor: accent,
        hoverBorderColor: hoverBorder,
        borderRadius: 12,
      },
      InputNumber: {
        controlHeight: 42,
      },
      Table: {
        headerBg: tableHeader,
        headerColor: inkMuted,
        rowHoverBg: mode === "dark" ? mix(surface, "#ffffff", 0.04) : mix(surface, accent, 0.03),
        borderColor: borderSoft,
      },
      Menu: {
        darkItemBg: "transparent",
        darkItemSelectedBg: withAlpha(accent, 0.22),
        darkItemHoverBg: "rgba(255,255,255,0.06)",
        itemBorderRadius: 8,
        horizontalItemBorderRadius: 8,
      },
      Steps: {
        colorPrimary: accent,
      },
      Tag: {
        borderRadiusSM: 6,
      },
    },
  };
}
