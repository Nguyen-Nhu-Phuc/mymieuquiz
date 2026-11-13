"use client";

import {
  Alert,
  Button,
  Card,
  InputNumber,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { appMessage as message } from "@/lib/appMessage";
import { useCallback, useEffect, useState } from "react";
import type { QuizSummary } from "@/@types/api";
import { getErrorMessage } from "@/api/client";
import { deleteQuiz, getQuizSummary } from "@/api/quiz.api";
import { createSession } from "@/api/session.api";

export default function QuizHomePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nOnLuyen, setNOnLuyen] = useState(15);
  const [nPhongThi, setNPhongThi] = useState(60);
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
        <Spin size="large" description="Đang tải bộ câu hỏi…" />
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
        title="Ngân hàng câu hỏi trống"
        description="Hãy tạo lại quiz từ tài liệu."
      />
    );
  }

  const onDelete = async () => {
    if (!quiz) return;
    setDeleting(true);
    try {
      await deleteQuiz(quiz.id);
      message.success("Đã xóa bộ câu hỏi");
      router.replace("/");
    } catch (err) {
      message.error(getErrorMessage(err, "Xóa thất bại"));
    } finally {
      setDeleting(false);
    }
  };

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
          kind === "exam"
            ? Math.max(1, Number(thoiGianPhut) || 30)
            : undefined,
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
          <Space style={{ marginBottom: 8 }} wrap>
            <Tag color={quiz.mode === "EXTRACT" ? "green" : "blue"}>
              {quiz.mode}
            </Tag>
            {quiz.meta?.needsReview ? (
              <Tag color="orange">Cần xem lại bank</Tag>
            ) : null}
          </Space>
          <Typography.Title level={2} className="page-title">
            {quiz.title}
          </Typography.Title>
          <Typography.Paragraph className="page-desc">
            {quiz.modeReason}
          </Typography.Paragraph>
        </div>
        <Popconfirm
          title="Xóa bộ câu hỏi?"
          description="Sẽ xóa luôn các phiên ôn/thi liên quan. Không hoàn tác."
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => void onDelete()}
        >
          <Button danger loading={deleting}>
            Xóa bộ câu hỏi
          </Button>
        </Popconfirm>
      </div>

      {quiz.meta?.needsReview ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title="Bank có vẻ thấp bất thường so với số câu phát hiện trong tài liệu"
          description="Có thể chưa quét hết file hoặc lọc trùng quá tay. Nên generate lại hoặc kiểm tra tài liệu nguồn."
        />
      ) : null}

      <div className="quiz-meta-grid" style={{ marginBottom: 20 }}>
        <div className="meta-tile">
          <div className="label">Ngân hàng</div>
          <div className="value">{quiz.bankSize}</div>
        </div>
        <div className="meta-tile">
          <div className="label">Ôn luyện (hiệu lực)</div>
          <div className="value">{Math.min(nOnLuyen, quiz.bankSize)}</div>
        </div>
        <div className="meta-tile">
          <div className="label">Phòng thi (hiệu lực)</div>
          <div className="value">{Math.min(nPhongThi, quiz.bankSize)}</div>
        </div>
        <div className="meta-tile">
          <div className="label">Thời gian thi (phút)</div>
          <div className="value">{thoiGianPhut}</div>
        </div>
      </div>

      {quiz.meta ? (
        <Card
          size="small"
          title="Báo cáo sau generate"
          className="surface-card"
          variant="borderless"
          style={{ marginBottom: 20 }}
        >
          <Typography.Paragraph style={{ marginBottom: 8 }}>
            Phát hiện: <strong>{quiz.meta.soCauPhatHien ?? "—"}</strong> · Sau
            lọc trùng:{" "}
            <strong>{quiz.meta.soCauSauLocTrungStem ?? quiz.bankSize}</strong> ·
            Bỏ trùng: <strong>{quiz.meta.soCauBoDoTrung ?? "—"}</strong>
          </Typography.Paragraph>
          {quiz.meta.viDuStemBiLoaiTrung?.length ? (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Ví dụ stem loại trùng:{" "}
              {quiz.meta.viDuStemBiLoaiTrung.slice(0, 3).join(" · ")}
            </Typography.Paragraph>
          ) : null}
          {quiz.meta.lyDoBankNganHonTarget ? (
            <Alert
              style={{ marginTop: 12 }}
              type="info"
              showIcon
              title={quiz.meta.lyDoBankNganHonTarget}
            />
          ) : null}
        </Card>
      ) : null}

      <div className="action-split">
        <div className="action-panel">
          <Typography.Title level={5} className="action-panel-title">
            Ôn luyện
          </Typography.Title>
          <Typography.Paragraph className="action-panel-desc">
            Xem đáp án ngay sau mỗi câu — học theo nhịp của bạn.
          </Typography.Paragraph>
          <div className="action-panel-fields">
            <div className="action-field">
              <label>Số câu</label>
              <InputNumber
                min={1}
                max={quiz.bankSize}
                value={nOnLuyen}
                onChange={(v) => setNOnLuyen(Number(v) || 1)}
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
            Bắt đầu ôn luyện
          </Button>
        </div>

        <div className="action-panel">
          <Typography.Title level={5} className="action-panel-title">
            Phòng thi
          </Typography.Title>
          <Typography.Paragraph className="action-panel-desc">
            Chấm điểm sau khi nộp — có đồng hồ đếm ngược.
          </Typography.Paragraph>
          <div className="action-panel-fields">
            <div className="action-field">
              <label>Số câu</label>
              <InputNumber
                min={1}
                max={quiz.bankSize}
                value={nPhongThi}
                onChange={(v) => setNPhongThi(Number(v) || 1)}
              />
            </div>
            <div className="action-field">
              <label>Thời gian (phút)</label>
              <InputNumber
                min={1}
                max={300}
                value={thoiGianPhut}
                onChange={(v) => setThoiGianPhut(Number(v) || 1)}
              />
            </div>
          </div>
          <Button
            size="large"
            loading={starting}
            onClick={() => void start("exam")}
            block
          >
            Tạo phòng thi
          </Button>
        </div>
      </div>
    </div>
  );
}
