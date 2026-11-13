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
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { appMessage as message } from "@/lib/appMessage";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { QuizSummary } from "@/@types/api";
import { getErrorMessage } from "@/api/client";
import { deleteQuiz, listQuizzes } from "@/api/quiz.api";

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listQuizzes();
      setQuizzes(data);
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
          (res.deletedSessions
            ? ` · ${res.deletedSessions} phiên liên quan`
            : ""),
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
          <span className="page-kicker">Thư viện</span>
          <Typography.Title level={2} className="page-title">
            Bộ câu hỏi của bạn
          </Typography.Title>
          <Typography.Paragraph className="page-desc">
            Một ngân hàng dùng chung cho ôn luyện và phòng thi
          </Typography.Paragraph>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            Làm mới
          </Button>
          <Link href="/upload">
            <Button type="primary" icon={<PlusOutlined />}>
              Tải tài liệu mới
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

      <div className="table-panel">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={quizzes}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có bộ câu hỏi"
                style={{ padding: "40px 0" }}
              >
                <Link href="/upload">
                  <Button type="primary" icon={<BookOutlined />}>
                    Bắt đầu từ tài liệu
                  </Button>
                </Link>
              </Empty>
            ),
          }}
          columns={[
            {
              title: "Tiêu đề",
              dataIndex: "title",
              render: (title: string, row) => (
                <Link href={`/quizzes/${row.id}`}>
                  <Typography.Text strong style={{ color: "var(--qp-ink)" }}>
                    {title}
                  </Typography.Text>
                </Link>
              ),
            },
            {
              title: "Mode",
              dataIndex: "mode",
              width: 110,
              render: (mode: string) => (
                <Tag color={mode === "EXTRACT" ? "green" : "blue"}>{mode}</Tag>
              ),
            },
            {
              title: "Ngân hàng",
              dataIndex: "bankSize",
              width: 100,
              render: (n: number) => (
                <Typography.Text strong style={{ color: "var(--qp-primary)" }}>
                  {n}
                </Typography.Text>
              ),
            },
            {
              title: "Ôn / Thi",
              width: 120,
              render: (_, row) =>
                `${row.nOnLuyenHieuLuc} / ${row.nPhongThiHieuLuc}`,
            },
            {
              title: "Tạo lúc",
              dataIndex: "createdAt",
              width: 150,
              render: (v?: string) =>
                v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—",
            },
            {
              title: "",
              width: 150,
              render: (_, row) => (
                <Space size={0}>
                  <Link href={`/quizzes/${row.id}`}>
                    <Button type="link">Mở</Button>
                  </Link>
                  <Popconfirm
                    title="Xóa bộ câu hỏi?"
                    description="Sẽ xóa luôn các phiên ôn/thi liên quan. Không hoàn tác."
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => void onDelete(row.id, row.title)}
                  >
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      loading={deletingId === row.id}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </div>
  );
}
