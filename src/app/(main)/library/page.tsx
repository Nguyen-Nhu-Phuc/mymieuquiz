"use client";

import {
  BookOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Empty,
  Popconfirm,
  Skeleton,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { QuizSummary } from "@/@types/api";
import { getErrorMessage } from "@/api/client";
import { deleteQuiz, listQuizzes } from "@/api/quiz.api";
import { appMessage as message } from "@/lib/appMessage";

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuizzes(await listQuizzes());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async (id: string, title: string) => {
    setDeletingId(id);
    try {
      const res = await deleteQuiz(id);
      message.success(
        `Đã xóa “${title}”` +
          (res.deletedSessions ? ` · ${res.deletedSessions} phiên` : ""),
      );
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      message.error(getErrorMessage(err, "Xóa thất bại"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-hero page-hero-row">
        <div>
          <p className="page-eyebrow">Thư viện ôn luyện</p>
          <Typography.Title level={2} className="page-title">
            <em className="display-accent">Cảm nhận</em>{" "}
            <span className="display-glow">từng câu hỏi</span>
          </Typography.Title>
          <Typography.Paragraph className="page-desc">
            Chọn bộ câu hỏi để ôn luyện hoặc thi thử — rõ ràng, tập trung, đúng nhịp học.
          </Typography.Paragraph>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            Làm mới
          </Button>
          <Link href="/upload">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Tạo từ tài liệu
            </Button>
          </Link>
        </Space>
      </div>

      {error ? (
        <Alert
          type="error"
          showIcon
          title={error}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={() => void load()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      {loading ? (
        <div className="quiz-card-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="quiz-card">
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="empty-hero">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Chưa có bộ câu hỏi nào.
                <br />
                Tải PDF/DOCX để Gemini tạo ngân hàng giúp bạn.
              </span>
            }
          >
            <Link href="/upload">
              <Button type="primary" size="large" icon={<BookOutlined />}>
                Bắt đầu ngay
              </Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="quiz-card-grid">
          {quizzes.map((q) => (
            <article key={q.id} className="quiz-card">
              <Link href={`/quizzes/${q.id}`} className="quiz-card-main">
                <h3 className="quiz-card-title">{q.title}</h3>
                <p className="quiz-card-meta">
                  <strong>{q.bankSize}</strong> câu
                  <span className="dot">·</span>
                  Ôn {q.nOnLuyenHieuLuc} / Thi {q.nPhongThiHieuLuc}
                </p>
                <p className="quiz-card-date">
                  {q.createdAt
                    ? dayjs(q.createdAt).format("DD/MM/YYYY HH:mm")
                    : "—"}
                </p>
              </Link>
              <div className="quiz-card-actions">
                <Link href={`/quizzes/${q.id}`}>
                  <Button type="primary">Mở</Button>
                </Link>
                <Popconfirm
                  title="Xóa bộ câu hỏi?"
                  description="Xóa luôn các phiên liên quan. Không hoàn tác."
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => void onDelete(q.id, q.title)}
                >
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    loading={deletingId === q.id}
                    aria-label="Xóa"
                  />
                </Popconfirm>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
