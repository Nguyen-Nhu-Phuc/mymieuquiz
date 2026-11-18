"use client";

import { BookOutlined, LoginOutlined, RocketOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useThemeMode } from "@/hooks/useThemeMode";

export function LandingShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isDark } = useThemeMode();
  const loggedIn = !loading && Boolean(user);

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="brand landing-brand">
            <span className="brand-mark" aria-hidden>
              <BookOutlined />
            </span>
            <span className="brand-text">
              Mỹ Miều<span className="brand-accent-lite"> Quiz</span>
            </span>
          </Link>

          <nav className="landing-nav" aria-label="Giới thiệu">
            <a href="#cach-lam">Cách làm</a>
            <a href="#tinh-nang">Tính năng</a>
          </nav>

          <div className="landing-header-actions">
            <ThemeCustomizer lightOnDarkHeader={isDark} />
            <ThemeToggle lightOnDarkHeader={isDark} />
            {loggedIn ? (
              <Link href="/library">
                <Button type="primary" icon={<BookOutlined />} className="header-cta">
                  <span className="header-cta-label">Vào thư viện</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="landing-link-quiet">
                  Đăng nhập
                </Link>
                <Link href="/login" className="landing-login-icon" aria-label="Đăng nhập">
                  <Button type="text" icon={<LoginOutlined />} style={{ color: "inherit" }} />
                </Link>
                <Link href="/register">
                  <Button type="primary" icon={<RocketOutlined />} className="header-cta">
                    <span className="header-cta-label">Bắt đầu</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
