"use client";

import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Spin,
  Steps,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { appMessage as message } from "@/lib/appMessage";
import { useState } from "react";
import { getErrorMessage } from "@/api/client";
import { uploadDocuments } from "@/api/document.api";
import { generateQuiz } from "@/api/quiz.api";
import { UploadDropzone } from "@/components/upload/UploadDropzone";

const STEP_HINTS = [
  "Chọn một hoặc nhiều file PDF/DOCX (tối đa 10)",
  "Chỉnh số câu ngân hàng và cấu hình ôn/thi",
  "Đang tải file → Gemini tạo câu unique + case lâm sàng từ tài liệu. Số lớn có thể mất lâu — đừng đóng tab.",
  "Hoàn tất — chuyển sang màn quiz",
];

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="page-hero">
        <span className="page-kicker">Tạo ngân hàng</span>
        <Typography.Title level={2} className="page-title">
          Tải tài liệu & tạo quiz
        </Typography.Title>
        <Typography.Paragraph className="page-desc">
          Upload PDF/DOCX → Gemini tạo câu hỏi + case lâm sàng → ôn luyện hoặc thi
        </Typography.Paragraph>
      </div>

      <div className="upload-steps">
        <Steps
          current={step}
          size="small"
          items={[
            { title: "Tải lên" },
            { title: "Cấu hình" },
            { title: "Xử lý" },
            { title: "Sẵn sàng" },
          ]}
        />
      </div>
      <Typography.Paragraph className="upload-step-hint">
        {STEP_HINTS[step]}
      </Typography.Paragraph>

      {error ? (
        <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />
      ) : null}

      {loading ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title={phase || "Đang xử lý…"}
          description="Vui lòng không đóng tab. Nhiều PDF scan có thể mất tới ~25 phút."
        />
      ) : null}

      <Card className="surface-card" variant="borderless">
        <Spin spinning={loading} description={phase || "Đang xử lý…"}>
          <Form
            layout="vertical"
            disabled={loading}
            requiredMark="optional"
            initialValues={{
              nNganHang: 100,
              nOnLuyen: 15,
              nPhongThi: 60,
              thoiGianPhut: 30,
            }}
            onFinish={async (values) => {
              if (files.length === 0) {
                message.warning("Hãy chọn ít nhất một file PDF hoặc DOCX");
                return;
              }
              if (loading) return;
              setLoading(true);
              setError(null);
              setStep(2);
              try {
                setPhase(
                  files.length === 1
                    ? "Đang tải tài liệu lên máy chủ…"
                    : `Đang tải ${files.length} tài liệu lên máy chủ…`,
                );
                const docs = await uploadDocuments(files);
                if (docs.length === 0) {
                  throw new Error("Upload thất bại — không nhận được tài liệu.");
                }

                const nNganHang = Number(values.nNganHang) || 100;
                setPhase(
                  `Gemini đang tạo ~${nNganHang} câu (gồm case lâm sàng) từ ${docs.length} tài liệu…`,
                );

                const quiz = await generateQuiz({
                  documentIds: docs.map((d) => d.id),
                  title: values.title?.trim() || undefined,
                  nNganHang,
                  nOnLuyen: Number(values.nOnLuyen) || 15,
                  nPhongThi: Number(values.nPhongThi) || 60,
                  thoiGianPhut: Number(values.thoiGianPhut) || 30,
                });

                setStep(3);
                setPhase("Hoàn tất");
                const shortNote =
                  quiz.bankSize < nNganHang
                    ? ` · chỉ đủ ${quiz.bankSize}/${nNganHang} câu unique từ tài liệu`
                    : "";
                message.success(
                  `Tạo xong · mode ${quiz.mode} · ${quiz.bankSize} câu` +
                    shortNote +
                    (docs.length > 1 ? ` · ${docs.length} tài liệu` : "") +
                    (quiz.meta?.needsReview ? " · cần xem lại bank" : ""),
                );
                router.push(`/quizzes/${quiz.id}`);
              } catch (err) {
                setStep(files.length ? 1 : 0);
                setError(getErrorMessage(err, "Tạo quiz thất bại"));
              } finally {
                setLoading(false);
                setPhase("");
              }
            }}
          >
            <div className="section-block">
              <div className="section-label">1. Tài liệu</div>
              <Form.Item
                name="__files"
                required
                extra={
                  files.length
                    ? `Đã chọn ${files.length} file`
                    : "Chấp nhận .pdf và .docx"
                }
              >
                <UploadDropzone
                  files={files}
                  onFiles={(next) => {
                    setFiles(next);
                    setStep(next.length ? 1 : 0);
                  }}
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item
                label="Tiêu đề bộ câu hỏi"
                name="title"
                style={{ marginTop: 8, marginBottom: 0 }}
              >
                <Input
                  size="large"
                  placeholder={
                    files.length > 1
                      ? "Để trống → Bộ câu hỏi (N tài liệu)"
                      : "Để trống sẽ lấy tên file"
                  }
                />
              </Form.Item>
            </div>

            <div className="section-block">
              <div className="section-label">2. Số câu muốn tạo</div>
              <p className="section-hint">
                Gemini trích/sinh đến đủ số câu unique (gồm ~15–25% case lâm sàng
                tự tạo từ tài liệu).
              </p>
              <div className="field-cluster">
                <Form.Item
                  label="Số câu ngân hàng"
                  name="nNganHang"
                  rules={[{ required: true, message: "Nhập số câu muốn tạo" }]}
                  style={{ marginBottom: 0, maxWidth: 220 }}
                >
                  <InputNumber min={1} max={500} style={{ width: "100%" }} size="large" />
                </Form.Item>
              </div>
            </div>

            <div className="section-block" style={{ marginBottom: 0 }}>
              <div className="section-label">3. Cấu hình phiên mặc định</div>
              <p className="section-hint">
                Dùng khi bắt đầu ôn luyện / phòng thi (có thể đổi sau).
              </p>
              <div className="field-cluster">
                <div className="config-grid">
                  <Form.Item
                    label="Câu mỗi phiên ôn"
                    name="nOnLuyen"
                    extra="≤ số câu ngân hàng"
                  >
                    <InputNumber min={1} max={500} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    label="Câu mỗi đề thi"
                    name="nPhongThi"
                    extra="≤ số câu ngân hàng"
                  >
                    <InputNumber min={1} max={500} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item label="Thời gian thi (phút)" name="thoiGianPhut">
                    <InputNumber min={1} max={300} style={{ width: "100%" }} />
                  </Form.Item>
                </div>
              </div>
            </div>

            <div className="upload-form-footer">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
              >
                {loading
                  ? "Đang tạo ngân hàng câu hỏi…"
                  : files.length > 1
                    ? `Tạo ngân hàng từ ${files.length} tài liệu`
                    : "Tạo ngân hàng câu hỏi"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}
