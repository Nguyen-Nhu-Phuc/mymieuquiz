import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { Be_Vietnam_Pro, Literata } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import { BRAND_TAGLINE, BRAND_TITLE } from "@/lib/brand";
import { AntdProvider } from "@/providers/AntdProvider";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});

const literata = Literata({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: BRAND_TITLE,
  description: `Tải tài liệu PDF/DOCX, tạo ngân hàng câu hỏi bằng Gemini. ${BRAND_TAGLINE}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${literata.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;["qp-theme-prefs","qp-theme-prefs-v2","qp-theme-prefs-v3"].forEach(function(k){try{localStorage.removeItem(k);}catch(_){}});var prefs=null;try{prefs=JSON.parse(localStorage.getItem("qp-theme-prefs-v4")||"null");}catch(_){}var mode=(prefs&&(prefs.mode==="dark"||prefs.mode==="light"))?prefs.mode:localStorage.getItem("qp-theme");if(mode!=="dark"&&mode!=="light")mode="dark";d.setAttribute("data-theme",mode);d.style.colorScheme=mode;}catch(e){}})();`,
          }}
        />
      </head>
      <body className={beVietnam.className}>
        <AntdRegistry>
          <AntdProvider>
            <AuthProvider>{children}</AuthProvider>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
