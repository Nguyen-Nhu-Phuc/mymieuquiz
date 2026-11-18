"use client";

import {
  BookOutlined,
  HistoryOutlined,
  LogoutOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Layout, Spin } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const { Header, Content, Footer } = Layout;

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="center-screen">
        <Spin size="large" description="Đang tải…" />
      </div>
    );
  }

  const inPractice = pathname.startsWith("/practice/");
  const inExam = pathname.startsWith("/exam/");
  const inSession = inPractice || inExam;

  const nav = [
    {
      href: "/library",
      label: "Thư viện",
      match: (p: string) =>
        p === "/library" || p.startsWith("/quizzes/") || p.startsWith("/upload"),
    },
    {
      href: "/history",
      label: "Lịch sử",
      match: (p: string) => p.startsWith("/history"),
      icon: <HistoryOutlined />,
    },
  ];

  return (
    <Layout className={`app-shell${inSession ? " app-shell-focus" : ""}`}>
      <Header className="app-header">
        <div className="app-header-inner">
          <Link href="/library" className="brand">
            <span className="brand-mark" aria-hidden>
              <BookOutlined />
            </span>
            <span className="brand-text">
              Mỹ Miều<span className="brand-accent-lite"> Quiz</span>
            </span>
          </Link>

          {!inSession ? (
            <nav className="header-nav-pills" aria-label="Chính">
              {nav.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-pill${active ? " is-active" : ""}`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="header-focus-label">Đang làm bài</div>
          )}

          <div className="header-user">
            {!inSession ? (
              <Link href="/upload">
                <Button type="primary" icon={<PlusOutlined />} className="header-cta">
                  Tạo quiz
                </Button>
              </Link>
            ) : null}
            <ThemeCustomizer lightOnDarkHeader />
            <ThemeToggle lightOnDarkHeader />
            <span className="header-user-name" title={user.name}>
              {user.name}
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              aria-label="Đăng xuất"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              style={{ color: "#fff" }}
            />
          </div>
        </div>
      </Header>
      <Content
        className={`app-content page-enter${inPractice ? " app-content-narrow" : ""}${inExam ? " app-content-exam" : ""}`}
      >
        {children}
      </Content>
      {!inSession ? (
        <Footer className="app-footer">
          {BRAND_NAME} — {BRAND_TAGLINE}
        </Footer>
      ) : null}
    </Layout>
  );
}
