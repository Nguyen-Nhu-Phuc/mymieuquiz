"use client";

import {
  BookOutlined,
  HistoryOutlined,
  LogoutOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Layout, Spin } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { getToken } from "@/api/client";
import { setAdminToken } from "@/api/admin.api";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { appModal } from "@/lib/appModal";
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
  const isAdmin = user.role === "admin";

  const nav = [
    {
      href: "/library",
      label: "Thư viện",
      match: (p: string) =>
        p === "/library" || p.startsWith("/quizzes/") || p.startsWith("/upload"),
      icon: <BookOutlined />,
    },
    {
      href: "/history",
      label: "Lịch sử",
      match: (p: string) => p.startsWith("/history"),
      icon: <HistoryOutlined />,
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin",
            match: (p: string) => p.startsWith("/admin"),
            icon: <SettingOutlined />,
          },
        ]
      : []),
  ];

  const goAdmin = () => {
    const token = getToken();
    if (token) setAdminToken(token);
    router.push("/admin");
  };

  const exitSession = () => {
    appModal.confirm({
      title: "Thoát phiên làm bài?",
      content:
        "Tiến độ đã lưu sẽ giữ lại trong lịch sử. Bạn có thể quay lại thư viện.",
      okText: "Thoát",
      cancelText: "Ở lại",
      okButtonProps: { danger: true },
      onOk: () => router.push("/library"),
    });
  };

  return (
    <Layout
      className={`app-shell${inSession ? " app-shell-focus" : ""}${!inSession ? " has-mobile-nav" : ""}`}
    >
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
                if (item.href === "/admin") {
                  return (
                    <button
                      key={item.href}
                      type="button"
                      className={`nav-pill${active ? " is-active" : ""}`}
                      onClick={goAdmin}
                    >
                      {item.icon}
                      <span className="nav-pill-label">{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-pill${active ? " is-active" : ""}`}
                  >
                    {item.icon}
                    <span className="nav-pill-label">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="header-focus-row">
              <div className="header-focus-label">
                {inExam ? "Thi thử" : "Ôn luyện"} · Đang làm bài
              </div>
              <Button
                type="default"
                size="small"
                danger
                className="header-exit-btn"
                onClick={exitSession}
              >
                Thoát
              </Button>
            </div>
          )}

          <div className="header-user">
            {!inSession ? (
              <Link href="/upload" className="header-cta-link">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="header-cta"
                >
                  <span className="header-cta-label">Tạo quiz</span>
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

      {!inSession ? (
        <nav className="mobile-tabbar" aria-label="Điều hướng nhanh">
          {nav.map((item) => {
            const active = item.match(pathname);
            if (item.href === "/admin") {
              return (
                <button
                  key={item.href}
                  type="button"
                  className={`mobile-tab${active ? " is-active" : ""}`}
                  onClick={goAdmin}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-tab${active ? " is-active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/upload"
            className={`mobile-tab${pathname.startsWith("/upload") ? " is-active" : ""}`}
          >
            <PlusOutlined />
            <span>Tạo</span>
          </Link>
        </nav>
      ) : null}
    </Layout>
  );
}
