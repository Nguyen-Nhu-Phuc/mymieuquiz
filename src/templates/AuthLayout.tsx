"use client";

import { BookOutlined } from "@ant-design/icons";
import { Card, Typography } from "antd";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-brand">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span className="brand-mark" aria-hidden>
              <BookOutlined style={{ color: "#fff" }} />
            </span>
            <Typography.Title level={2} className="auth-brand-name">
              QuizPractice
            </Typography.Title>
          </div>
          <Typography.Paragraph className="auth-brand-tag">
            Ôn luyện trắc nghiệm từ tài liệu của bạn
          </Typography.Paragraph>
        </div>
        <Card variant="borderless" className="auth-card">
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 20 }}>
              {subtitle}
            </Typography.Paragraph>
          ) : null}
          {children}
        </Card>
      </div>
    </div>
  );
}
