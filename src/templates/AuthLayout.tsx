"use client";

import { BookOutlined } from "@ant-design/icons";
import { Card, Typography } from "antd";
import type { ReactNode } from "react";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useThemeMode } from "@/hooks/useThemeMode";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { isDark } = useThemeMode();

  return (
    <div className="auth-shell">
      <div className="auth-orb auth-orb-a" aria-hidden />
      <div className="auth-orb auth-orb-b" aria-hidden />
      <div className="auth-theme-toggle">
        <ThemeCustomizer lightOnDarkHeader={isDark} />
        <ThemeToggle lightOnDarkHeader={isDark} />
      </div>
      <div className="auth-panel">
        <div className="auth-brand">
          <p className="auth-eyebrow">Ôn luyện thông minh</p>
          <div className="auth-brand-row">
            <span className="brand-mark" aria-hidden>
              <BookOutlined />
            </span>
            <Typography.Title level={2} className="auth-brand-name">
              <em className="display-accent">Mỹ Miều</em>
              <span className="display-glow"> Quiz</span>
            </Typography.Title>
          </div>
          <Typography.Paragraph className="auth-brand-tag">
            Cảm nhận từng câu hỏi — từ tài liệu của bạn
          </Typography.Paragraph>
        </div>
        <Card variant="borderless" className="auth-card">
          <Typography.Title level={4} className="auth-card-title">
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Paragraph type="secondary" className="auth-card-sub">
              {subtitle}
            </Typography.Paragraph>
          ) : null}
          {children}
        </Card>
      </div>
    </div>
  );
}
