"use client";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useThemeMode } from "@/hooks/useThemeMode";

export function ThemeToggle({
  lightOnDarkHeader = false,
}: {
  /** Nút trên header tối — icon trắng */
  lightOnDarkHeader?: boolean;
}) {
  const { isDark, toggle } = useThemeMode();

  return (
    <Tooltip title={isDark ? "Chế độ sáng" : "Chế độ tối"}>
      <Button
        type="text"
        aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggle}
        className="theme-toggle-btn"
        style={
          lightOnDarkHeader
            ? { color: "rgba(255,255,255,0.9)" }
            : undefined
        }
      />
    </Tooltip>
  );
}
