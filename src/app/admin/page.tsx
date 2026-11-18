"use client";

import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  adminLogin,
  adminLoginWithGoogle,
  getAdminSettings,
  getAdminToken,
  setAdminToken,
} from "@/api/admin.api";
import { getErrorMessage, getToken } from "@/api/client";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { appMessage as message } from "@/lib/appMessage";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifySession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await getAdminSettings();
      setAuthed(true);
    } catch (err) {
      setAuthed(false);
      setAdminToken(null);
      setError(getErrorMessage(err, "Phiên admin hết hạn. Đăng nhập lại."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Ưu tiên token admin; nếu chưa có thì dùng JWT app (role=admin) để vào thẳng.
    if (!getAdminToken()) {
      const appToken = getToken();
      if (appToken) setAdminToken(appToken);
    }
    if (getAdminToken()) {
      void verifySession();
    } else {
      setLoading(false);
      setAuthed(false);
    }
  }, [verifySession]);

  if (authed) {
    return (
      <AdminDashboard
        onLogout={() => {
          setAdminToken(null);
          setAuthed(false);
          setError(null);
        }}
      />
    );
  }

  return (
    <Card className="surface-card admin-card" variant="borderless">
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Đăng nhập Admin
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Dùng tài khoản hoặc Google có email nằm trong{" "}
        <code>ADMIN_EMAILS</code> (backend <code>.env</code>).
      </Typography.Paragraph>
      {error ? (
        <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />
      ) : null}

      <GoogleSignInButton
        disabled={loading}
        onAccessToken={async (accessToken) => {
          setError(null);
          setLoading(true);
          try {
            await adminLoginWithGoogle({ accessToken });
            message.success("Đăng nhập admin thành công");
            await verifySession();
          } catch (err) {
            setError(getErrorMessage(err, "Đăng nhập Google thất bại"));
            setLoading(false);
          }
        }}
      />

      <Form
        layout="vertical"
        onFinish={async (values) => {
          setLoading(true);
          setError(null);
          try {
            await adminLogin(values.email, values.password);
            message.success("Đăng nhập admin thành công");
            await verifySession();
          } catch (err) {
            setError(getErrorMessage(err, "Đăng nhập thất bại"));
            setLoading(false);
          }
        }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
        >
          <Input size="large" placeholder="admin@email.com" autoFocus />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Nhập mật khẩu" }]}
        >
          <Input.Password size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          Vào quản trị
        </Button>
      </Form>
    </Card>
  );
}
