"use client";

import {
  GoogleOAuthProvider,
  useGoogleLogin,
} from "@react-oauth/google";
import { Alert, Button, Divider, Spin } from "antd";
import { useEffect, useState } from "react";
import { getGoogleConfig } from "@/api/auth.api";
import { getErrorMessage } from "@/api/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function GoogleAuthButton({
  onAccessToken,
  disabled,
}: {
  onAccessToken: (accessToken: string) => Promise<void> | void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse.access_token || disabled || busy) return;
      setBusy(true);
      setError(null);
      try {
        await onAccessToken(tokenResponse.access_token);
      } catch (err) {
        setError(getErrorMessage(err, "Đăng nhập Google thất bại"));
      } finally {
        setBusy(false);
      }
    },
    onError: () => {
      setError("Google đăng nhập bị hủy hoặc lỗi.");
    },
  });

  return (
    <>
      {error ? (
        <Alert
          type="error"
          showIcon
          title={error}
          style={{ marginBottom: 12 }}
        />
      ) : null}
      <Button
        block
        size="large"
        className="google-auth-btn"
        disabled={disabled || busy}
        loading={busy}
        icon={!busy ? <GoogleIcon /> : undefined}
        onClick={() => login()}
      >
        Tiếp tục với Google
      </Button>
    </>
  );
}

export function GoogleSignInButton({
  onAccessToken,
  disabled,
  showDivider = true,
}: {
  onAccessToken: (accessToken: string) => Promise<void> | void;
  disabled?: boolean;
  showDivider?: boolean;
}) {
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
        const cfg = await getGoogleConfig();
        if (cancelled) return;
        setClientId((cfg.clientId || fromEnv).trim());
      } catch {
        if (!cancelled) {
          setClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <>
      {configError ? (
        <Alert
          type="error"
          showIcon
          title={configError}
          style={{ marginBottom: 12 }}
        />
      ) : null}

      {clientId ? (
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleAuthButton
            disabled={disabled}
            onAccessToken={onAccessToken}
          />
        </GoogleOAuthProvider>
      ) : (
        <Button
          block
          size="large"
          className="google-auth-btn"
          disabled={disabled}
          icon={<GoogleIcon />}
          onClick={() =>
            setConfigError(
              "Chưa cấu hình Google. Thêm GOOGLE_CLIENT_ID vào backend/.env rồi restart API.",
            )
          }
        >
          Tiếp tục với Google
        </Button>
      )}

      {showDivider ? (
        <Divider plain style={{ margin: "20px 0" }}>
          hoặc email
        </Divider>
      ) : null}
    </>
  );
}
