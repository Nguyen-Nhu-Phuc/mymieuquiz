"use client";

import { Alert, Button, Form, Input, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/api/client";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/templates/AuthLayout";

export default function RegisterPage() {
  const { register, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/library");
  }, [loading, user, router]);

  return (
    <AuthLayout
      title="Đăng ký"
      subtitle="Tạo tài khoản để lưu bộ câu hỏi và lịch sử ôn luyện"
    >
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
            await register(values.name, values.email, values.password);
            router.replace("/library");
          } catch (err) {
            setError(getErrorMessage(err, "Đăng ký thất bại"));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form.Item
          label="Họ tên"
          name="name"
          rules={[{ required: true, message: "Nhập họ tên" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, min: 6, message: "Tối thiểu 6 ký tự" }]}
        >
          <Input.Password size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
          Tạo tài khoản
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        Đã có tài khoản?{" "}
        <Link href="/login" className="auth-link">
          Đăng nhập
        </Link>
      </Typography.Paragraph>
    </AuthLayout>
  );
}
