"use client";

import {
  FileTextOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export default function HomePage() {
  const { user, loading } = useAuth();
  const ctaHref = !loading && user ? "/library" : "/register";
  const ctaLabel = !loading && user ? "Vào thư viện" : "Bắt đầu ngay";

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-glow" aria-hidden />
        <div className="home-hero-glow home-hero-glow-b" aria-hidden />

        <div className="home-hero-copy">
          <p className="home-eyebrow">Ôn luyện đồng hành cùng bạn</p>
          <h1 className="home-title">
            <em className="display-accent">Cảm nhận</em>
            <span className="display-glow"> từng câu hỏi</span>
          </h1>
          <p className="home-lead">
            Tải tài liệu PDF/DOCX — Gemini tạo ngân hàng trắc nghiệm, bạn ôn luyện
            và thi thử trong một nhịp rõ ràng.
          </p>
          <div className="home-cta-row">
            <Link href={ctaHref}>
              <Button type="primary" size="large" className="home-cta">
                {ctaLabel}
              </Button>
            </Link>
            <a href="#cach-lam" className="home-cta-ghost">
              <PlayCircleOutlined />
              Xem cách làm
            </a>
          </div>
        </div>

        <div className="home-hero-visual" aria-hidden>
          <div className="home-bloom" />
          <div className="home-bloom home-bloom-2" />
          <div className="home-device">
            <div className="home-device-bar">
              <span />
              <span />
              <span />
            </div>
            <p className="home-device-q">
              Mục đích chính của giám sát sử dụng PPE là gì?
            </p>
            <div className="home-device-choice is-on">A. Đảm bảo tuân thủ đúng quy trình</div>
            <div className="home-device-choice">B. Tăng số lượng kiểm tra</div>
            <div className="home-device-choice">C. Thay thế đào tạo nhân viên</div>
            <div className="home-device-tag">Chính xác</div>
          </div>
        </div>
      </section>

      <section id="cach-lam" className="home-section">
        <p className="home-eyebrow">Ba bước</p>
        <h2 className="home-section-title">
          Từ tài liệu đến <em className="display-accent">sẵn sàng thi</em>
        </h2>
        <ol className="home-steps">
          <li>
            <span className="home-step-icon">
              <FileTextOutlined />
            </span>
            <strong>Tải lên</strong>
            <span>PDF hoặc DOCX môn bạn đang học</span>
          </li>
          <li>
            <span className="home-step-icon">
              <ThunderboltOutlined />
            </span>
            <strong>Tạo câu hỏi</strong>
            <span>Gemini dựng ngân hàng lý thuyết & tình huống</span>
          </li>
          <li>
            <span className="home-step-icon">
              <PlayCircleOutlined />
            </span>
            <strong>Ôn & thi</strong>
            <span>Luyện có giải thích, phòng thi có thời gian</span>
          </li>
        </ol>
      </section>

      <section id="tinh-nang" className="home-section home-section-end">
        <p className="home-eyebrow">Tập trung học</p>
        <h2 className="home-section-title">
          Giao diện tối, <span className="display-glow">nhấn rõ từng ý</span>
        </h2>
        <p className="home-section-lead">
          Mood Volt giúp bạn nhìn nhanh đáp án đúng/sai, tiến độ, và bước tiếp theo
          — ít nhiễu, nhiều tập trung.
        </p>
        <Link href={ctaHref}>
          <Button type="primary" size="large" className="home-cta">
            {ctaLabel}
          </Button>
        </Link>
      </section>

      <footer className="home-footer">
        {BRAND_NAME} — {BRAND_TAGLINE}
      </footer>
    </div>
  );
}
