import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import { AntdProvider } from "@/providers/AntdProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizPractice — Ôn luyện trắc nghiệm",
  description:
    "Tải tài liệu PDF/DOCX, tạo ngân hàng câu hỏi bằng Gemini, ôn luyện và phòng thi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <AntdProvider>
            <AuthProvider>{children}</AuthProvider>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
