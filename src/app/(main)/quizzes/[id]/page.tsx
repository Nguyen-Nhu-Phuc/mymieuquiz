"use client";

import {
  Alert,
  Button,
  Collapse,
  InputNumber,
  Popconfirm,
  Spin,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { QuizSummary } from "@/@types/api";
import { getErrorMessage } from "@/api/client";
import { deleteQuiz, getQuizSummary } from "@/api/quiz.api";
import { createSession } from "@/api/session.api";
import { appMessage as message } from "@/lib/appMessage";

export default function QuizHomePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nOnLuyen, setNOnLuyen] = useState(15);
  const [nPhongThi, setNPhongThi] = useState(30);
  const [thoiGianPhut, setThoiGianPhut] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuizSummary(params.id);
      setQuiz(data);
      setNOnLuyen(data.nOnLuyenHieuLuc);
      setNPhongThi(data.nPhongThiHieuLuc);
      setThoiGianPhut(data.thoiGianPhut);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="center-screen">
        <Spin size="large" description="Đang tải…" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <Alert
        type="error"
        showIcon
        title={error || "Không tải được quiz"}
        action={
          <Button size="small" onClick={() => void load()}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (quiz.bankSize === 0) {
    return (
      <Alert
        type="warning"
        showIcon
        title="Ngân hàng trống"
        description="Hãy tạo lại từ tài liệu."
      />
    );
  }

  const start = async (kind: "practice" | "exam") => {
    setStarting(true);
    try {
      const nCau = Math.min(
        Math.max(1, Number(kind === "practice" ? nOnLuyen : nPhongThi) || 1),
        quiz.bankSize,
      );
      const session = await createSession({
        quizSetId: quiz.id,
        kind,
        nCau,
        thoiGianPhut:
          kind === "exam" ? Math.max(1, Number(thoiGianPhut) || 30) : undefined,
      });
      router.push(
        kind === "practice"
          ? `/practice/${session.id}`
          : `/exam/${session.id}`,
      );
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div>
      <div className="page-hero page-hero-row">
        <div>
          <Typography.Title level={2} className="page-title">
            {quiz.title}
          </Typography.Title>
          <Typography.Paragraph className="page-desc">
            <strong>{quiz.bankSize}</strong> câu trong ngân hàng — chọn cách luyện bên dưới
          </Typography.Paragraph>
        </div>
        <Popconfirm
          title="Xóa bộ câu hỏi?"
          description="Xóa luôn các phiên liên quan."
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await deleteQuiz(quiz.id);
              message.success("Đã xóa");
              router.replace("/library");
            } catch (err) {
              message.error(getErrorMessage(err, "Xóa thất bại"));
            } finally {
              setDeleting(false);
            }
          }}
        >
          <Button danger type="text" loading={deleting}>
            Xóa
          </Button>
        </Popconfirm>
      </div>

      {quiz.meta?.needsReview || quiz.meta?.lyDoBankNganHonTarget ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title={
            quiz.meta.lyDoBankNganHonTarget ||
            "Số câu có thể ít hơn mong đợi — vẫn luyện được."
          }
        />
      ) : null}

      <div className="action-split">
        <div className="action-panel action-panel-primary">
          <Typography.Title level={4} className="action-panel-title">
            Ôn luyện
          </Typography.Title>
          <Typography.Paragraph className="action-panel-desc">
            Biết đúng/sai ngay sau mỗi câu, có giải thích.
          </Typography.Paragraph>
          <div className="action-panel-fields">
            <div className="action-field">
              <label>Số câu</label>
              <InputNumber
                min={1}
                max={quiz.bankSize}
                value={nOnLuyen}
                onChange={(v) => setNOnLuyen(Number(v) || 1)}
                size="large"
              />
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            loading={starting}
            onClick={() => void start("practice")}
            block
          >
            Bắt đầu ôn
          </Button>
        </div>

        <div className="action-panel">
          <Typography.Title level={4} className="action-panel-title">
            Thi thử
          </Typography.Title>
          <Typography.Paragraph className="action-panel-desc">
            Có đồng hồ — chỉ xem điểm sau khi nộp bài.
          </Typography.Paragraph>
          <div className="action-panel-fields">
            <div className="action-field">
              <label>Số câu</label>
              <InputNumber
                min={1}
                max={quiz.bankSize}
                value={nPhongThi}
                onChange={(v) => setNPhongThi(Number(v) || 1)}
                size="large"
              />
            </div>
            <div className="action-field">
              <label>Phút</label>
              <InputNumber
                min={1}
                max={300}
                value={thoiGianPhut}
                onChange={(v) => setThoiGianPhut(Number(v) || 1)}
                size="large"
              />
            </div>
          </div>
          <Button
            size="large"
            loading={starting}
            onClick={() => void start("exam")}
            block
          >
            Vào phòng thi
          </Button>
        </div>
      </div>

      {quiz.meta?.soCauPhatHien != null ? (
        <Collapse
          ghost
          style={{ marginTop: 24 }}
          items={[
            {
              key: "report",
              label: "Chi tiết tạo ngân hàng",
              children: (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  Phát hiện {quiz.meta.soCauPhatHien ?? "—"} · Sau lọc trùng{" "}
                  {quiz.meta.soCauSauLocTrungStem ?? quiz.bankSize} · Bỏ trùng{" "}
                  {quiz.meta.soCauBoDoTrung ?? "—"}
                  {quiz.modeReason ? ` · ${quiz.modeReason}` : ""}
                </Typography.Paragraph>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
