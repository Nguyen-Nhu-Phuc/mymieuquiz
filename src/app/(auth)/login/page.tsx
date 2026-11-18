"use client";

import { Alert, Button, Form, Input, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/api/client";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/templates/AuthLayout";

export default function LoginPage() {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/library");
  }, [loading, user, router]);

  return (
    <AuthLayout title="Đăng nhập" subtitle="Tiếp tục ôn luyện với tài liệu của bạn">
      {error ? (
        <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />
      ) : null}

      <GoogleSignInButton
        disabled={submitting}
        onAccessToken={async (accessToken) => {
          setError(null);
          await loginWithGoogle({ accessToken });
          router.replace("/library");
        }}
      />

      <Form
        layout="vertical"
        onFinish={async (values) => {
          setSubmitting(true);
          setError(null);
          try {
            await login(values.email, values.password);
            router.replace("/library");
          } catch (err) {
            setError(getErrorMessage(err, "Đăng nhập thất bại"));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
        >
          <Input size="large" placeholder="ban@email.com" />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Nhập mật khẩu" }]}
        >
          <Input.Password size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
          Đăng nhập
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        Chưa có tài khoản?{" "}
        <Link href="/register" className="auth-link">
          Đăng ký
        </Link>
      </Typography.Paragraph>
    </AuthLayout>
  );
}
