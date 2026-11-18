"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div>
            <Link href="/library" className="admin-back">
              ← Mỹ Miều Quiz
            </Link>
            <h1 className="admin-title">Admin · Quản lý hệ thống</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ThemeCustomizer />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="admin-main page-enter">{children}</main>
    </div>
  );
}
