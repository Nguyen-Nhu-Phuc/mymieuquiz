import axios, { type AxiosError } from "axios";

const TOKEN_KEY = "quizpractice_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** 30 phút — nhiều PDF + Gemini có thể rất lâu */
export const API_TIMEOUT_MS = 30 * 60_000;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  timeout: API_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Để axios tự set boundary khi body là FormData
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (config.headers && "Content-Type" in config.headers) {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorBody>) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      const onAuthPage =
        path.startsWith("/login") ||
        path.startsWith("/register") ||
        path.startsWith("/admin");
      // Không đụng token user khi đang ở /admin (admin dùng token riêng)
      if (!path.startsWith("/admin")) {
        setToken(null);
      }
      if (!onAuthPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

interface ApiErrorBody {
  error?: { message?: string; details?: unknown };
}

export function getErrorMessage(err: unknown, fallback = "Đã xảy ra lỗi."): string {
  const ax = err as AxiosError<ApiErrorBody>;
  if (ax.code === "ECONNABORTED" || /timeout/i.test(ax.message || "")) {
    return "Hết thời gian chờ Gemini (quá lâu). Thử ít file hơn hoặc thử lại.";
  }
  return ax.response?.data?.error?.message || ax.message || fallback;
}
