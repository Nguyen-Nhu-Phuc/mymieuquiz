"use client";

import {
  BookOutlined,
  HistoryOutlined,
  LogoutOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Spin, Tooltip } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

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
        <Spin size="large" description="Đang tải phiên đăng nhập…" />
      </div>
    );
  }

  const selected = pathname.startsWith("/history")
    ? "history"
    : pathname.startsWith("/upload")
      ? "upload"
      : "home";

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-header-inner">
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden>
              <BookOutlined />
            </span>
            QuizPractice
          </Link>
          <Menu
            className="header-nav"
            theme="dark"
            mode="horizontal"
            selectedKeys={[selected]}
            items={[
              { key: "home", label: <Link href="/">Bộ câu hỏi</Link> },
              {
                key: "upload",
                label: (
                  <Link href="/upload">
                    <UploadOutlined /> Tải lên
                  </Link>
                ),
              },
              {
                key: "history",
                label: (
                  <Link href="/history">
                    <HistoryOutlined /> Lịch sử
                  </Link>
                ),
              },
            ]}
          />
          <div className="header-user">
            <span className="header-user-name" title={user.name}>
              {user.name}
            </span>
            <Tooltip title="Đăng xuất">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                style={{ color: "#fff" }}
              >
                Thoát
              </Button>
            </Tooltip>
          </div>
        </div>
      </Header>
      <Content className="app-content page-enter">{children}</Content>
      <Footer className="app-footer">
        QuizPractice — ôn luyện theo tài liệu của bạn
      </Footer>
    </Layout>
  );
}
