import axios, { type AxiosError } from "axios";
import type { ApiSuccess, AuthResponse } from "@/@types/api";
import { getErrorMessage } from "./client";

const ADMIN_TOKEN_KEY = "qp-admin-token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  timeout: 60_000,
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (
      err.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin")
    ) {
      setAdminToken(null);
    }
    return Promise.reject(err);
  },
);

export interface GeminiKeyQuotaRow {
  index: number;
  masked: string;
  fingerprint: string;
  status: "ok" | "exhausted" | "invalid" | "unknown";
  generateCallsToday: number;
  knownDailyLimit: number | null;
  remainingToday: number | null;
  exhaustedInProcess: boolean;
  retryAfterSec: number | null;
  lastQuotaMetric: string | null;
  lastMessage: string | null;
  lastProbeOk: boolean | null;
  lastProbeAt: string | null;
  dayPt: string;
  note: string;
}

export interface GeminiQuotaStatus {
  dayPt: string;
  keys: GeminiKeyQuotaRow[];
  summary: {
    total: number;
    available: number;
    exhausted: number;
  };
}

export interface AdminSettings {
  geminiApiKeyMasked: string;
  geminiApiKeysMasked: string[];
  geminiApiKeySet: boolean;
  geminiApiKeysCount: number;
  geminiModel: string;
  geminiQuota?: GeminiQuotaStatus;
  nOnLuyen: number;
  nPhongThi: number;
  thoiGianPhut: number;
  nNganHang: number;
  updatedAt: string | null;
  health: {
    mongo: string;
    geminiKeysAvailable: number;
    geminiKeysExhausted?: number;
    adminConfigured: boolean;
    adminEmailsCount?: number;
  };
}

export interface AdminOverview {
  counts: {
    users: number;
    admins: number;
    documents: number;
    documentsFailed: number;
    quizSets: number;
    quizFailed: number;
    sessions: number;
    sessionsActive: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    authProvider: string;
    createdAt?: string;
  }>;
  recentSessions: Array<{
    id: string;
    kind: string;
    status: string;
    score?: { correct: number; total: number; percent: number };
    startedAt?: string;
    user: { id: string; email?: string; name?: string } | null;
  }>;
}

export interface AdminListResult<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  authProvider: string;
  hasGoogle: boolean;
  lockedByEnv: boolean;
  createdAt?: string;
  counts: { documents: number; quizSets: number; sessions: number };
}

export interface AdminDocumentRow {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  errorMessage?: string;
  createdAt?: string;
  user: { id: string; email?: string; name?: string } | null;
}

export interface AdminQuizRow {
  id: string;
  title: string;
  mode: string;
  status: string;
  bankSize: number;
  needsReview: boolean;
  createdAt?: string;
  user: { id: string; email?: string; name?: string } | null;
}

export interface AdminSessionRow {
  id: string;
  kind: string;
  status: string;
  config: { nCau: number; thoiGianPhut?: number };
  score?: { correct: number; total: number; percent: number };
  startedAt?: string;
  submittedAt?: string;
  createdAt?: string;
  user: { id: string; email?: string; name?: string } | null;
  quizSet: { id: string; title?: string } | null;
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await adminApi.post<ApiSuccess<AuthResponse>>(
    "/admin/login",
    { email: email.trim(), password },
  );
  setAdminToken(data.data.token);
  return data.data;
}

export async function adminLoginWithGoogle(input: {
  credential?: string;
  accessToken?: string;
}): Promise<AuthResponse> {
  const { data } = await adminApi.post<ApiSuccess<AuthResponse>>(
    "/admin/google",
    input,
  );
  setAdminToken(data.data.token);
  return data.data;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const { data } = await adminApi.get<ApiSuccess<AdminSettings>>(
    "/admin/settings",
  );
  return data.data;
}

export async function updateAdminSettings(input: {
  geminiApiKey?: string;
  geminiApiKeys?: string;
  geminiModel?: string;
  nOnLuyen?: number;
  nPhongThi?: number;
  thoiGianPhut?: number;
  nNganHang?: number;
}): Promise<AdminSettings> {
  const { data } = await adminApi.put<ApiSuccess<AdminSettings>>(
    "/admin/settings",
    input,
  );
  return data.data;
}

export interface StoredGeminiKeyRow {
  index: number;
  masked: string;
  isPrimary: boolean;
}

export async function listGeminiKeys(): Promise<StoredGeminiKeyRow[]> {
  const { data } = await adminApi.get<
    ApiSuccess<{ items: StoredGeminiKeyRow[] }>
  >("/admin/gemini-keys");
  return data.data.items;
}

export async function addGeminiKey(key: string): Promise<StoredGeminiKeyRow[]> {
  const { data } = await adminApi.post<
    ApiSuccess<{ items: StoredGeminiKeyRow[] }>
  >("/admin/gemini-keys", { key });
  return data.data.items;
}

export async function updateGeminiKey(
  index: number,
  key: string,
): Promise<StoredGeminiKeyRow[]> {
  const { data } = await adminApi.put<
    ApiSuccess<{ items: StoredGeminiKeyRow[] }>
  >(`/admin/gemini-keys/${index}`, { key });
  return data.data.items;
}

export async function deleteGeminiKey(
  index: number,
): Promise<StoredGeminiKeyRow[]> {
  const { data } = await adminApi.delete<
    ApiSuccess<{ items: StoredGeminiKeyRow[] }>
  >(`/admin/gemini-keys/${index}`);
  return data.data.items;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const { data } = await adminApi.get<ApiSuccess<AdminOverview>>(
    "/admin/overview",
  );
  return data.data;
}

export async function getGeminiQuota(probe = false): Promise<GeminiQuotaStatus> {
  const { data } = await adminApi.get<ApiSuccess<GeminiQuotaStatus>>(
    "/admin/gemini-quota",
    { params: probe ? { probe: "1" } : undefined },
  );
  return data.data;
}

export async function resetGeminiExhausted(): Promise<GeminiQuotaStatus> {
  const { data } = await adminApi.post<
    ApiSuccess<{ status: GeminiQuotaStatus }>
  >("/admin/gemini-quota/reset-exhausted");
  return data.data.status;
}

export async function listAdminUsers(params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<AdminListResult<AdminUserRow>> {
  const { data } = await adminApi.get<ApiSuccess<AdminListResult<AdminUserRow>>>(
    "/admin/users",
    { params },
  );
  return data.data;
}

export async function setAdminUserRole(
  id: string,
  role: "user" | "admin",
): Promise<{ id: string; email: string; name: string; role: string }> {
  const { data } = await adminApi.patch<
    ApiSuccess<{ id: string; email: string; name: string; role: string }>
  >(`/admin/users/${id}/role`, { role });
  return data.data;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await adminApi.delete(`/admin/users/${id}`);
}

export async function listAdminDocuments(params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<AdminListResult<AdminDocumentRow>> {
  const { data } = await adminApi.get<
    ApiSuccess<AdminListResult<AdminDocumentRow>>
  >("/admin/documents", { params });
  return data.data;
}

export async function deleteAdminDocument(id: string): Promise<void> {
  await adminApi.delete(`/admin/documents/${id}`);
}

export async function listAdminQuizzes(params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<AdminListResult<AdminQuizRow>> {
  const { data } = await adminApi.get<ApiSuccess<AdminListResult<AdminQuizRow>>>(
    "/admin/quizzes",
    { params },
  );
  return data.data;
}

export async function deleteAdminQuiz(id: string): Promise<void> {
  await adminApi.delete(`/admin/quizzes/${id}`);
}

export async function listAdminSessions(params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<AdminListResult<AdminSessionRow>> {
  const { data } = await adminApi.get<
    ApiSuccess<AdminListResult<AdminSessionRow>>
  >("/admin/sessions", { params });
  return data.data;
}

export async function deleteAdminSession(id: string): Promise<void> {
  await adminApi.delete(`/admin/sessions/${id}`);
}

export { getErrorMessage };
