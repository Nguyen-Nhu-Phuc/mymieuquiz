"use client";

import type { ReactNode } from "react";
import { LandingShell } from "@/templates/LandingShell";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <LandingShell>{children}</LandingShell>;
}
