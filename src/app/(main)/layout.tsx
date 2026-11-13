"use client";

import type { ReactNode } from "react";
import { MainLayout } from "@/templates/MainLayout";

export default function MainGroupLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
