"use client";

import {
  BgColorsOutlined,
  MoonOutlined,
  RedoOutlined,
  SunOutlined,
} from "@ant-design/icons";
import {
  Button,
  ColorPicker,
  Divider,
  Drawer,
  Segmented,
  Space,
  Tooltip,
  Typography,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { useState } from "react";
import { useThemeMode, type ThemeMode } from "@/hooks/useThemeMode";
import { THEME_PRESETS, type ModeSeeds } from "@/themes/palette";
import { normalizeHex } from "@/themes/color";

const SEED_FIELDS: { key: keyof ModeSeeds; label: string; hint: string }[] = [
  { key: "primary", label: "CTA", hint: "Nút chính (#D4FF24)" },
  { key: "accent", label: "Glow", hint: "Xanh nhấn (#1558C9)" },
  { key: "header", label: "Header", hint: "Thanh trên (#030407)" },
  { key: "bg", label: "Nền trang", hint: "Background tổng" },
  { key: "surface", label: "Bề mặt", hint: "Card, panel, ô đáp án" },
  { key: "ink", label: "Chữ", hint: "Màu chữ chính" },
];

function toHex(color: Color | string): string {
  if (typeof color === "string") return normalizeHex(color);
  return normalizeHex(color.toHexString());
}

export function ThemeCustomizer({
  lightOnDarkHeader = false,
}: {
  lightOnDarkHeader?: boolean;
}) {
  const {
    isDark,
    mode,
    setMode,
    preferences,
    presetId,
    applyPreset,
    updateSeeds,
    resetTheme,
  } = useThemeMode();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState<ThemeMode>(mode);

  const seeds = editMode === "dark" ? preferences.dark : preferences.light;

  return (
    <>
      <Tooltip title="Tuỳ chỉnh giao diện">
        <Button
          type="text"
          aria-label="Tuỳ chỉnh giao diện"
          icon={<BgColorsOutlined />}
          onClick={() => {
            setEditMode(mode);
            setOpen(true);
          }}
          className="theme-toggle-btn"
          style={
            lightOnDarkHeader ? { color: "rgba(255,255,255,0.9)" } : undefined
          }
        />
      </Tooltip>

      <Drawer
        title="Giao diện & màu sắc"
        placement="right"
        size={360}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnHidden
        extra={
          <Button
            type="text"
            icon={<RedoOutlined />}
            onClick={resetTheme}
            aria-label="Khôi phục mặc định"
          >
            Mặc định
          </Button>
        }
      >
        <div className="theme-customizer">
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Chế độ hiển thị
          </Typography.Text>
          <Segmented
            block
            style={{ marginTop: 8, marginBottom: 20 }}
            value={mode}
            onChange={(v) => setMode(v as ThemeMode)}
            options={[
              {
                value: "light",
                icon: <SunOutlined />,
                label: "Sáng",
              },
              {
                value: "dark",
                icon: <MoonOutlined />,
                label: "Tối",
              },
            ]}
          />

          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Bộ màu sẵn
          </Typography.Text>
          <div className="theme-preset-grid">
            {THEME_PRESETS.map((preset) => {
              const swatch =
                mode === "dark" ? preset.dark.primary : preset.light.primary;
              const active = presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`theme-preset-chip${active ? " is-active" : ""}`}
                  onClick={() => applyPreset(preset.id)}
                >
                  <span
                    className="theme-preset-swatch"
                    style={{ background: swatch }}
                  />
                  <span>{preset.label}</span>
                </button>
              );
            })}
            {presetId === "custom" ? (
              <div className="theme-preset-chip is-active is-custom">
                <span
                  className="theme-preset-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${preferences.light.primary}, ${preferences.dark.primary})`,
                  }}
                />
                <span>Tuỳ chỉnh</span>
              </div>
            ) : null}
          </div>

          <Divider style={{ margin: "18px 0 14px" }} />

          <div className="theme-edit-mode-row">
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Chỉnh màu cho
            </Typography.Text>
            <Segmented
              size="small"
              value={editMode}
              onChange={(v) => setEditMode(v as ThemeMode)}
              options={[
                { value: "light", label: "Sáng" },
                { value: "dark", label: "Tối" },
              ]}
            />
          </div>

          <Space orientation="vertical" size={14} style={{ width: "100%", marginTop: 14 }}>
            {SEED_FIELDS.map((field) => (
              <div key={field.key} className="theme-color-row">
                <div className="theme-color-meta">
                  <Typography.Text strong style={{ fontSize: 14 }}>
                    {field.label}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {field.hint}
                  </Typography.Text>
                </div>
                <ColorPicker
                  value={seeds[field.key]}
                  showText
                  format="hex"
                  disabledAlpha
                  onChangeComplete={(c) => {
                    updateSeeds(editMode, { [field.key]: toHex(c) });
                  }}
                />
              </div>
            ))}
          </Space>

          <div
            className="theme-preview"
            style={{
              marginTop: 20,
              background: seeds.bg,
              color: seeds.ink,
              borderColor: seeds.primary,
            }}
          >
            <div
              className="theme-preview-bar"
              style={{ background: seeds.header }}
            />
            <div className="theme-preview-body">
              <div
                className="theme-preview-card"
                style={{ background: seeds.surface }}
              >
                <span style={{ fontWeight: 600 }}>Xem trước</span>
                <span style={{ display: "inline-flex", gap: 6 }}>
                  <button
                    type="button"
                    className="theme-preview-btn"
                    style={{ background: seeds.primary, color: "#030407" }}
                  >
                    CTA
                  </button>
                  <button
                    type="button"
                    className="theme-preview-btn"
                    style={{
                      background: seeds.accent,
                      color: "#fff",
                    }}
                  >
                    Glow
                  </button>
                </span>
              </div>
            </div>
          </div>

          <Typography.Paragraph
            type="secondary"
            style={{ marginTop: 16, marginBottom: 0, fontSize: 12 }}
          >
            {isDark ? "Đang dùng chế độ tối" : "Đang dùng chế độ sáng"}
            {presetId === "custom" ? " · màu tuỳ chỉnh" : ` · ${THEME_PRESETS.find((p) => p.id === presetId)?.label ?? ""}`}
            . Lưu trên trình duyệt này.
          </Typography.Paragraph>
        </div>
      </Drawer>
    </>
  );
}
