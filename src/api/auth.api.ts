import type { ApiSuccess, AuthResponse, User } from "@/@types/api";
import { api } from "./client";

/** Khớp registerSchema: email, password min 6, name */
export async function register(input: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<ApiSuccess<AuthResponse>>("/auth/register", {
    email: input.email.trim(),
    password: input.password,
    name: input.name.trim(),
  });
  return data.data;
}

/** Khớp loginSchema */
export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<ApiSuccess<AuthResponse>>("/auth/login", {
    email: input.email.trim(),
    password: input.password,
  });
  return data.data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<ApiSuccess<User>>("/auth/me");
  return data.data;
}
