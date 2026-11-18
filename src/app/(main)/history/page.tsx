"use client";

import { Alert, Button, Empty, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { SessionListItem } from "@/@types/api";
import { getErrorMessage } from "@/api/client";
import { listSessions } from "@/api/session.api";

export default function HistoryPage() {
  const [rows, setRows] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listSessions());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="page-hero">
        <Typography.Title level={2} className="page-title">
          Lịch sử
        </Typography.Title>
        <Typography.Paragraph className="page-desc">
          Các lần ôn luyện và thi thử gần đây
        </Typography.Paragraph>
      </div>

      {error ? (
        <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />
      ) : null}

      <div className="table-panel">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có phiên ôn luyện hoặc phòng thi"
                style={{ padding: "40px 0" }}
              >
                <Link href="/library">
                  <Button type="primary">Về bộ câu hỏi</Button>
                </Link>
              </Empty>
            ),
          }}
          columns={[
            {
              title: "Loại",
              dataIndex: "kind",
              width: 120,
              render: (k: string) => (
                <Tag color={k === "practice" ? "cyan" : "geekblue"}>
                  {k === "practice" ? "Ôn luyện" : "Phòng thi"}
                </Tag>
              ),
            },
            {
              title: "Số câu",
              width: 90,
              render: (_, r) => r.config?.nCau ?? "—",
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (s: string) => {
                const map: Record<string, string> = {
                  in_progress: "Đang làm",
                  submitted: "Đã nộp",
                  expired: "Hết giờ",
                };
                return map[s] || s;
              },
            },
            {
              title: "Điểm",
              render: (_, r) =>
                r.score
                  ? `${r.score.correct}/${r.score.total} (${r.score.percent}%)`
                  : "—",
            },
            {
              title: "Bắt đầu",
              dataIndex: "startedAt",
              render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
            },
            {
              title: "",
              width: 130,
              render: (_, r) => (
                <Link
                  href={
                    r.status === "in_progress"
                      ? r.kind === "practice"
                        ? `/practice/${r.id}`
                        : `/exam/${r.id}`
                      : `/results/${r.id}`
                  }
                >
                  <Button type="link">
                    {r.status === "in_progress" ? "Tiếp tục" : "Xem kết quả"}
                  </Button>
                </Link>
              ),
            },
          ]}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </div>
  );
}
