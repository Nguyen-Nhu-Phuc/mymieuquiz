"use client";

import {
  Alert,
  Button,
  Collapse,
  Form,
  Input,
  InputNumber,
  Segmented,
  Spin,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getErrorMessage } from "@/api/client";
import { uploadDocuments } from "@/api/document.api";
import { generateQuiz } from "@/api/quiz.api";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { appMessage as message } from "@/lib/appMessage";

type WizardStep = "files" | "setup" | "working";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [wizard, setWizard] = useState<WizardStep>("files");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const goSetup = () => {
    if (files.length === 0) {
      message.warning("Chọn ít nhất một file PDF hoặc DOCX");
      return;
    }
    setError(null);
    setWizard("setup");
  };

  return (
    <div className="upload-page">
      <div className="page-hero">
        <Typography.Title level={2} className="page-title">
          Tạo quiz từ tài liệu
        </Typography.Title>
        <Typography.Paragraph className="page-desc">
          {wizard === "files"
            ? "Bước 1/2 — Chọn file PDF hoặc DOCX"
            : wizard === "setup"
              ? "Bước 2/2 — Số câu, độ khó, rồi tạo"
              : "Đang tạo ngân hàng câu hỏi…"}
        </Typography.Paragraph>
      </div>

      <div className="wizard-track" aria-hidden>
        <span className={`wizard-dot${wizard !== "files" ? " is-done" : " is-active"}`} />
        <span className="wizard-line" />
        <span
          className={`wizard-dot${
            wizard === "setup" ? " is-active" : wizard === "working" ? " is-done" : ""
          }`}
        />
      </div>

      {error ? (
        <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />
      ) : null}

      {wizard === "working" || loading ? (
        <div className="working-panel">
          <Spin size="large" />
          <Typography.Title level={4} style={{ marginTop: 20, marginBottom: 8 }}>
            {phase || "Đang xử lý…"}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 420 }}>
            Giữ tab này mở. File lớn hoặc nhiều trang có thể mất vài phút.
          </Typography.Paragraph>
        </div>
      ) : null}

      <Form
        form={form}
        layout="vertical"
        disabled={loading}
        requiredMark={false}
        initialValues={{
          nNganHang: 40,
          nOnLuyen: 15,
          nPhongThi: 30,
          thoiGianPhut: 30,
          difficulty: "trung_binh",
          topicHint: "",
        }}
        onFinish={async (values) => {
          if (files.length === 0) {
            message.warning("Chọn ít nhất một file");
            return;
          }
          setLoading(true);
          setError(null);
          setWizard("working");
          try {
            setPhase(
              files.length === 1
                ? "Đang tải tài liệu…"
                : `Đang tải ${files.length} tài liệu…`,
            );
            const docs = await uploadDocuments(files);
            if (docs.length === 0) {
              throw new Error("Upload thất bại.");
            }

            const nNganHang = Number(values.nNganHang) || 40;
            setPhase(`Đang tạo khoảng ${nNganHang} câu hỏi…`);

            const quiz = await generateQuiz({
              documentIds: docs.map((d) => d.id),
              title: values.title?.trim() || undefined,
              nNganHang,
              nOnLuyen: Number(values.nOnLuyen) || 15,
              nPhongThi: Number(values.nPhongThi) || 30,
              thoiGianPhut: Number(values.thoiGianPhut) || 30,
              includeSituational: true,
              difficulty: values.difficulty || "trung_binh",
              topicHint: values.topicHint?.trim() || undefined,
            });

            message.success(`Xong — ${quiz.bankSize} câu sẵn sàng`);
            router.push(`/quizzes/${quiz.id}`);
          } catch (err) {
            setWizard("setup");
            setError(getErrorMessage(err, "Tạo quiz thất bại"));
            setLoading(false);
            setPhase("");
          }
        }}
        style={{ display: wizard === "working" || loading ? "none" : undefined }}
      >
        {wizard === "files" ? (
          <div className="wizard-panel">
            <UploadDropzone
              files={files}
              onFiles={setFiles}
              disabled={loading}
            />
            <Form.Item
              label="Tên bộ câu hỏi (tuỳ chọn)"
              name="title"
              style={{ marginTop: 20 }}
            >
              <Input
                size="large"
                placeholder="Để trống sẽ lấy tên file"
              />
            </Form.Item>
            <Button
              type="primary"
              size="large"
              block
              onClick={goSetup}
              disabled={files.length === 0}
            >
              Tiếp tục
            </Button>
          </div>
        ) : null}

        {wizard === "setup" ? (
          <div className="wizard-panel">
            <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
              {files.length} file đã chọn
              {" · "}
              <Button type="link" size="small" onClick={() => setWizard("files")} style={{ padding: 0 }}>
                Đổi file
              </Button>
            </Typography.Paragraph>

            <Form.Item
              label="Bạn muốn khoảng bao nhiêu câu?"
              name="nNganHang"
              rules={[{ required: true, message: "Nhập số câu" }]}
              extra="Nên 30–60 câu để nhanh hơn (free tier Gemini hạn chế)."
            >
              <InputNumber min={1} max={500} size="large" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Độ khó" name="difficulty">
              <Segmented
                block
                options={[
                  { label: "Dễ", value: "de" },
                  { label: "Trung bình", value: "trung_binh" },
                  { label: "Khó", value: "kho" },
                ]}
              />
            </Form.Item>

            <Collapse
              ghost
              className="upload-advanced"
              items={[
                {
                  key: "more",
                  label: "Tuỳ chọn thêm",
                  children: (
                    <>
                      <Form.Item
                        label="Chủ đề nên tập trung (tuỳ chọn)"
                        name="topicHint"
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="Ví dụ: triệu chứng nguy cơ cao…"
                          maxLength={500}
                          showCount
                        />
                      </Form.Item>
                      <div className="config-grid">
                        <Form.Item label="Câu mỗi lần ôn" name="nOnLuyen">
                          <InputNumber min={1} max={500} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item label="Câu mỗi đề thi" name="nPhongThi">
                          <InputNumber min={1} max={500} style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item label="Phút thi" name="thoiGianPhut">
                          <InputNumber min={1} max={300} style={{ width: "100%" }} />
                        </Form.Item>
                      </div>
                      <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13 }}>
                        Ngân hàng luôn gồm cả lý thuyết và tình huống.
                      </Typography.Paragraph>
                    </>
                  ),
                },
              ]}
            />

            <div className="wizard-footer">
              <Button size="large" onClick={() => setWizard("files")}>
                Quay lại
              </Button>
              <Button type="primary" htmlType="submit" size="large" block>
                Tạo ngân hàng câu hỏi
              </Button>
            </div>
          </div>
        ) : null}
      </Form>
    </div>
  );
}
