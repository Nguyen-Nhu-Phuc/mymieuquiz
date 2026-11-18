"use client";

import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import {
  addGeminiKey,
  deleteAdminDocument,
  deleteAdminQuiz,
  deleteAdminSession,
  deleteAdminUser,
  deleteGeminiKey,
  getAdminOverview,
  getAdminSettings,
  getGeminiQuota,
  listAdminDocuments,
  listAdminQuizzes,
  listAdminSessions,
  listAdminUsers,
  listGeminiKeys,
  resetGeminiExhausted,
  setAdminUserRole,
  updateAdminSettings,
  updateGeminiKey,
  type AdminDocumentRow,
  type AdminOverview,
  type AdminQuizRow,
  type AdminSessionRow,
  type AdminSettings,
  type AdminUserRow,
  type GeminiQuotaStatus,
  type StoredGeminiKeyRow,
} from "@/api/admin.api";
import { getErrorMessage } from "@/api/client";
import { appMessage as message } from "@/lib/appMessage";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(v?: string): string {
  if (!v) return "—";
  return new Date(v).toLocaleString("vi-VN");
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
      {hint ? <div className="admin-stat-hint">{hint}</div> : null}
    </div>
  );
}

function formatRetry(sec: number | null): string {
  if (sec == null || sec <= 0) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `~${h}h${m}m`;
  if (m > 0) return `~${m} phút`;
  return `~${sec}s`;
}

function GeminiQuotaPanel({
  initial,
  compact,
}: {
  initial?: GeminiQuotaStatus | null;
  compact?: boolean;
}) {
  const [quota, setQuota] = useState<GeminiQuotaStatus | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (probe = false) => {
    if (probe) setProbing(true);
    else setLoading(true);
    setError(null);
    try {
      setQuota(await getGeminiQuota(probe));
    } catch (err) {
      setError(getErrorMessage(err, "Không tải được quota Gemini"));
    } finally {
      setLoading(false);
      setProbing(false);
    }
  }, []);

  useEffect(() => {
    if (!initial) void load(false);
  }, [initial, load]);

  useEffect(() => {
    if (initial) setQuota(initial);
  }, [initial]);

  return (
    <Card
      size="small"
      variant="borderless"
      className="surface-card"
      title="Gemini API key — còn bao nhiêu?"
      extra={
        <Space wrap>
          <Button size="small" loading={loading && !probing} onClick={() => void load(false)}>
            Tải lại
          </Button>
          <Button size="small" loading={probing} onClick={() => void load(true)}>
            Kiểm tra key
          </Button>
          <Button
            size="small"
            onClick={async () => {
              try {
                setQuota(await resetGeminiExhausted());
                message.success("Đã bỏ đánh dấu hết quota trong process");
              } catch (err) {
                message.error(getErrorMessage(err, "Reset thất bại"));
              }
            }}
          >
            Reset exhausted
          </Button>
        </Space>
      }
      loading={loading && !quota}
      style={{ marginBottom: compact ? 16 : 20 }}
    >
      {error ? (
        <Alert type="error" showIcon title={error} style={{ marginBottom: 12 }} />
      ) : null}
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Ngày PT (reset RPD): <strong>{quota?.dayPt ?? "—"}</strong>
        {" · "}
        Còn dùng được:{" "}
        <strong>
          {quota?.summary.available ?? 0}/{quota?.summary.total ?? 0}
        </strong>
        . Google không trả số dư trực tiếp — app đếm request và đọc limit từ lỗi 429.
      </Typography.Paragraph>
      <Table
        size="small"
        rowKey="fingerprint"
        pagination={false}
        dataSource={quota?.keys ?? []}
        columns={[
          { title: "#", dataIndex: "index", width: 48 },
          { title: "Key", dataIndex: "masked", width: 140 },
          {
            title: "Trạng thái",
            dataIndex: "status",
            width: 110,
            render: (s: string) => (
              <Tag
                color={
                  s === "ok"
                    ? "green"
                    : s === "exhausted"
                      ? "red"
                      : s === "invalid"
                        ? "magenta"
                        : "default"
                }
              >
                {s}
              </Tag>
            ),
          },
          {
            title: "Đã dùng hôm nay",
            dataIndex: "generateCallsToday",
            width: 120,
          },
          {
            title: "Còn lại / Limit",
            width: 140,
            render: (_, r) =>
              r.knownDailyLimit != null
                ? `${r.remainingToday ?? "—"} / ${r.knownDailyLimit}`
                : "?— / chưa biết",
          },
          {
            title: "Retry",
            width: 90,
            render: (_, r) => formatRetry(r.retryAfterSec) || "—",
          },
          {
            title: "Ghi chú",
            dataIndex: "note",
            ellipsis: true,
          },
        ]}
      />
    </Card>
  );
}

function OverviewTab() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminOverview());
    } catch (err) {
      setError(getErrorMessage(err, "Không tải được tổng quan"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return <Alert type="error" showIcon title={error} />;
  }

  const c = data?.counts;

  return (
    <div>
      <GeminiQuotaPanel compact />
      <div className="admin-stat-grid" style={{ opacity: loading ? 0.6 : 1 }}>
        <StatCard label="Người dùng" value={c?.users ?? 0} hint={`${c?.admins ?? 0} admin`} />
        <StatCard
          label="Tài liệu"
          value={c?.documents ?? 0}
          hint={c?.documentsFailed ? `${c.documentsFailed} lỗi` : undefined}
        />
        <StatCard
          label="Bộ câu hỏi"
          value={c?.quizSets ?? 0}
          hint={c?.quizFailed ? `${c.quizFailed} lỗi` : undefined}
        />
        <StatCard
          label="Phiên ôn/thi"
          value={c?.sessions ?? 0}
          hint={`${c?.sessionsActive ?? 0} đang làm`}
        />
      </div>

      <div className="admin-overview-split">
        <Card size="small" title="User mới" variant="borderless" className="surface-card">
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            loading={loading}
            dataSource={data?.recentUsers ?? []}
            columns={[
              { title: "Tên", dataIndex: "name" },
              { title: "Email", dataIndex: "email" },
              {
                title: "Role",
                dataIndex: "role",
                render: (r: string) => (
                  <Tag color={r === "admin" ? "gold" : "default"}>{r}</Tag>
                ),
              },
              {
                title: "Tạo",
                dataIndex: "createdAt",
                render: formatDate,
              },
            ]}
          />
        </Card>
        <Card size="small" title="Phiên gần đây" variant="borderless" className="surface-card">
          <Table
            size="small"
            pagination={false}
            rowKey="id"
            loading={loading}
            dataSource={data?.recentSessions ?? []}
            columns={[
              {
                title: "User",
                render: (_, r) => r.user?.email ?? "—",
              },
              {
                title: "Loại",
                dataIndex: "kind",
                render: (k: string) => (
                  <Tag color={k === "exam" ? "blue" : "green"}>
                    {k === "exam" ? "Thi" : "Ôn"}
                  </Tag>
                ),
              },
              { title: "Trạng thái", dataIndex: "status" },
              {
                title: "Điểm",
                render: (_, r) =>
                  r.score
                    ? `${r.score.correct}/${r.score.total} (${r.score.percent}%)`
                    : "—",
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

function usePagedList<T>(
  fetcher: (p: {
    page: number;
    limit: number;
    q?: string;
  }) => Promise<{ items: T[]; total: number; page: number; limit: number }>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher({
        page,
        limit,
        q: search || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(getErrorMessage(err, "Không tải được danh sách"));
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, limit, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize: limit,
    total,
    showSizeChanger: false,
    onChange: (p) => setPage(p),
  };

  return {
    items,
    loading,
    error,
    q,
    setQ,
    pagination,
    reload: load,
    applySearch: () => {
      setPage(1);
      setSearch(q.trim());
    },
  };
}

function UsersTab() {
  const fetcher = useCallback(
    (p: { page: number; limit: number; q?: string }) => listAdminUsers(p),
    [],
  );
  const list = usePagedList<AdminUserRow>(fetcher);

  const columns: ColumnsType<AdminUserRow> = [
    { title: "Tên", dataIndex: "name", width: 140 },
    { title: "Email", dataIndex: "email" },
    {
      title: "Role",
      dataIndex: "role",
      width: 120,
      render: (role, row) => (
        <Select
          size="small"
          value={role}
          style={{ width: 100 }}
          disabled={row.lockedByEnv}
          options={[
            { value: "user", label: "user" },
            { value: "admin", label: "admin" },
          ]}
          onChange={async (next) => {
            try {
              await setAdminUserRole(row.id, next);
              message.success("Đã cập nhật quyền");
              await list.reload();
            } catch (err) {
              message.error(getErrorMessage(err, "Không đổi được quyền"));
            }
          }}
        />
      ),
    },
    {
      title: "Auth",
      width: 100,
      render: (_, r) => (
        <Space size={4}>
          <Tag>{r.authProvider}</Tag>
          {r.hasGoogle ? <Tag color="blue">G</Tag> : null}
        </Space>
      ),
    },
    {
      title: "Dữ liệu",
      width: 140,
      render: (_, r) =>
        `${r.counts.documents} TL · ${r.counts.quizSets} BCH · ${r.counts.sessions} phiên`,
    },
    {
      title: "Tạo",
      dataIndex: "createdAt",
      width: 150,
      render: formatDate,
    },
    {
      title: "",
      width: 80,
      render: (_, row) => (
        <Popconfirm
          title="Xóa user và toàn bộ dữ liệu?"
          disabled={row.lockedByEnv}
          onConfirm={async () => {
            try {
              await deleteAdminUser(row.id);
              message.success("Đã xóa user");
              await list.reload();
            } catch (err) {
              message.error(getErrorMessage(err, "Xóa thất bại"));
            }
          }}
        >
          <Button danger size="small" type="link" disabled={row.lockedByEnv}>
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="Tìm email / tên"
          value={list.q}
          onChange={(e) => list.setQ(e.target.value)}
          onSearch={() => list.applySearch()}
          style={{ width: 280 }}
          allowClear
        />
        <Button onClick={() => void list.reload()}>Tải lại</Button>
      </Space>
      {list.error ? (
        <Alert type="error" showIcon title={list.error} style={{ marginBottom: 12 }} />
      ) : null}
      <Table
        rowKey="id"
        size="middle"
        loading={list.loading}
        columns={columns}
        dataSource={list.items}
        pagination={list.pagination}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

function DocumentsTab() {
  const fetcher = useCallback(
    (p: { page: number; limit: number; q?: string }) => listAdminDocuments(p),
    [],
  );
  const list = usePagedList<AdminDocumentRow>(fetcher);

  const columns: ColumnsType<AdminDocumentRow> = [
    { title: "Tên file", dataIndex: "originalName", ellipsis: true },
    {
      title: "User",
      render: (_, r) => r.user?.email ?? "—",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Size",
      dataIndex: "size",
      width: 90,
      render: formatBytes,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 110,
      render: (s: string) => (
        <Tag
          color={
            s === "ready" ? "green" : s === "failed" ? "red" : s === "processing" ? "blue" : "default"
          }
        >
          {s}
        </Tag>
      ),
    },
    {
      title: "Tạo",
      dataIndex: "createdAt",
      width: 150,
      render: formatDate,
    },
    {
      title: "",
      width: 80,
      render: (_, row) => (
        <Popconfirm
          title="Xóa tài liệu (cascade quiz + session)?"
          onConfirm={async () => {
            try {
              await deleteAdminDocument(row.id);
              message.success("Đã xóa tài liệu");
              await list.reload();
            } catch (err) {
              message.error(getErrorMessage(err, "Xóa thất bại"));
            }
          }}
        >
          <Button danger size="small" type="link">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="Tìm tên file"
          value={list.q}
          onChange={(e) => list.setQ(e.target.value)}
          onSearch={() => list.applySearch()}
          style={{ width: 280 }}
          allowClear
        />
        <Button onClick={() => void list.reload()}>Tải lại</Button>
      </Space>
      {list.error ? (
        <Alert type="error" showIcon title={list.error} style={{ marginBottom: 12 }} />
      ) : null}
      <Table
        rowKey="id"
        size="middle"
        loading={list.loading}
        columns={columns}
        dataSource={list.items}
        pagination={list.pagination}
        scroll={{ x: 800 }}
      />
    </div>
  );
}

function QuizzesTab() {
  const fetcher = useCallback(
    (p: { page: number; limit: number; q?: string }) => listAdminQuizzes(p),
    [],
  );
  const list = usePagedList<AdminQuizRow>(fetcher);

  const columns: ColumnsType<AdminQuizRow> = [
    { title: "Tiêu đề", dataIndex: "title", ellipsis: true },
    {
      title: "User",
      render: (_, r) => r.user?.email ?? "—",
      width: 200,
      ellipsis: true,
    },
    { title: "Mode", dataIndex: "mode", width: 100 },
    {
      title: "Câu",
      dataIndex: "bankSize",
      width: 70,
    },
    {
      title: "Trạng thái",
      width: 120,
      render: (_, r) => (
        <Space size={4}>
          <Tag color={r.status === "ready" ? "green" : "red"}>{r.status}</Tag>
          {r.needsReview ? <Tag color="orange">review</Tag> : null}
        </Space>
      ),
    },
    {
      title: "Tạo",
      dataIndex: "createdAt",
      width: 150,
      render: formatDate,
    },
    {
      title: "",
      width: 80,
      render: (_, row) => (
        <Popconfirm
          title="Xóa bộ câu hỏi và các phiên liên quan?"
          onConfirm={async () => {
            try {
              await deleteAdminQuiz(row.id);
              message.success("Đã xóa bộ câu hỏi");
              await list.reload();
            } catch (err) {
              message.error(getErrorMessage(err, "Xóa thất bại"));
            }
          }}
        >
          <Button danger size="small" type="link">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="Tìm tiêu đề"
          value={list.q}
          onChange={(e) => list.setQ(e.target.value)}
          onSearch={() => list.applySearch()}
          style={{ width: 280 }}
          allowClear
        />
        <Button onClick={() => void list.reload()}>Tải lại</Button>
      </Space>
      {list.error ? (
        <Alert type="error" showIcon title={list.error} style={{ marginBottom: 12 }} />
      ) : null}
      <Table
        rowKey="id"
        size="middle"
        loading={list.loading}
        columns={columns}
        dataSource={list.items}
        pagination={list.pagination}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

function SessionsTab() {
  const [kindFilter, setKindFilter] = useState<string | undefined>();
  const fetcher = useCallback(
    (p: { page: number; limit: number; q?: string }) =>
      listAdminSessions({ ...p, q: kindFilter || p.q }),
    [kindFilter],
  );
  const list = usePagedList<AdminSessionRow>(fetcher);

  const columns: ColumnsType<AdminSessionRow> = [
    {
      title: "User",
      render: (_, r) => r.user?.email ?? "—",
      ellipsis: true,
    },
    {
      title: "Bộ câu hỏi",
      render: (_, r) => r.quizSet?.title ?? "—",
      ellipsis: true,
    },
    {
      title: "Loại",
      dataIndex: "kind",
      width: 80,
      render: (k: string) => (k === "exam" ? "Thi" : "Ôn"),
    },
    { title: "Trạng thái", dataIndex: "status", width: 110 },
    {
      title: "Cấu hình",
      width: 110,
      render: (_, r) =>
        `${r.config.nCau} câu` +
        (r.config.thoiGianPhut ? ` · ${r.config.thoiGianPhut}p` : ""),
    },
    {
      title: "Điểm",
      width: 120,
      render: (_, r) =>
        r.score ? `${r.score.correct}/${r.score.total}` : "—",
    },
    {
      title: "Bắt đầu",
      dataIndex: "startedAt",
      width: 150,
      render: formatDate,
    },
    {
      title: "",
      width: 80,
      render: (_, row) => (
        <Popconfirm
          title="Xóa phiên này?"
          onConfirm={async () => {
            try {
              await deleteAdminSession(row.id);
              message.success("Đã xóa phiên");
              await list.reload();
            } catch (err) {
              message.error(getErrorMessage(err, "Xóa thất bại"));
            }
          }}
        >
          <Button danger size="small" type="link">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          allowClear
          placeholder="Lọc loại"
          style={{ width: 140 }}
          value={kindFilter}
          options={[
            { value: "practice", label: "Ôn luyện" },
            { value: "exam", label: "Thi" },
          ]}
          onChange={(v) => setKindFilter(v)}
        />
        <Button onClick={() => void list.reload()}>Tải lại</Button>
      </Space>
      {list.error ? (
        <Alert type="error" showIcon title={list.error} style={{ marginBottom: 12 }} />
      ) : null}
      <Table
        rowKey="id"
        size="middle"
        loading={list.loading}
        columns={columns}
        dataSource={list.items}
        pagination={list.pagination}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

function GeminiKeysManager({ onChanged }: { onChanged?: () => void }) {
  const [keys, setKeys] = useState<StoredGeminiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StoredGeminiKeyRow | null>(null);
  const [keyValue, setKeyValue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setKeys(await listGeminiKeys());
    } catch (err) {
      message.error(getErrorMessage(err, "Không tải danh sách API key"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setKeyValue("");
    setModalOpen(true);
  };

  const openEdit = (row: StoredGeminiKeyRow) => {
    setEditing(row);
    setKeyValue("");
    setModalOpen(true);
  };

  const saveKey = async () => {
    const trimmed = keyValue.trim();
    if (!trimmed) {
      message.warning("Nhập API key");
      return;
    }
    setBusy(true);
    try {
      const items = editing
        ? await updateGeminiKey(editing.index, trimmed)
        : await addGeminiKey(trimmed);
      setKeys(items);
      setModalOpen(false);
      setKeyValue("");
      setEditing(null);
      message.success(editing ? "Đã cập nhật API key" : "Đã thêm API key");
      onChanged?.();
    } catch (err) {
      message.error(getErrorMessage(err, "Không lưu được API key"));
    } finally {
      setBusy(false);
    }
  };

  const removeKey = async (index: number) => {
    setBusy(true);
    try {
      setKeys(await deleteGeminiKey(index));
      message.success("Đã xoá API key");
      onChanged?.();
    } catch (err) {
      message.error(getErrorMessage(err, "Không xoá được API key"));
    } finally {
      setBusy(false);
    }
  };

  const columns: ColumnsType<StoredGeminiKeyRow> = [
    {
      title: "#",
      dataIndex: "index",
      width: 56,
      render: (v: number) => v + 1,
    },
    {
      title: "Key (đã che)",
      dataIndex: "masked",
      render: (v: string, row) => (
        <Space wrap>
          <Typography.Text code>{v || "(trống)"}</Typography.Text>
          {row.isPrimary ? <Tag color="blue">Chính</Tag> : <Tag>Phụ</Tag>}
        </Space>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEdit(row)} disabled={busy}>
            Sửa
          </Button>
          <Popconfirm
            title="Xoá API key này?"
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={() => void removeKey(row.index)}
          >
            <Button size="small" danger disabled={busy}>
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Typography.Text strong>Gemini API keys</Typography.Text>
          <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0" }}>
            Thêm / sửa / xoá key lưu trên DB. Key đầu danh sách là key chính;
            nếu trống DB sẽ fallback sang biến môi trường.
          </Typography.Paragraph>
        </div>
        <Button type="primary" onClick={openAdd}>
          Thêm key
        </Button>
      </div>

      <Table
        rowKey={(r) => `${r.index}-${r.masked}`}
        size="small"
        loading={loading || busy}
        pagination={false}
        columns={columns}
        dataSource={keys}
        locale={{ emptyText: "Chưa có key trong DB" }}
      />

      <Modal
        title={editing ? `Sửa API key #${editing.index + 1}` : "Thêm API key"}
        open={modalOpen}
        onCancel={() => {
          if (busy) return;
          setModalOpen(false);
        }}
        onOk={() => void saveKey()}
        okText={editing ? "Cập nhật" : "Thêm"}
        confirmLoading={busy}
        destroyOnHidden
      >
        {editing ? (
          <Typography.Paragraph type="secondary">
            Key hiện tại: <code>{editing.masked}</code> — dán key mới để thay.
          </Typography.Paragraph>
        ) : null}
        <Input.Password
          value={keyValue}
          onChange={(e) => setKeyValue(e.target.value)}
          placeholder="Dán Gemini API key…"
          autoFocus
        />
      </Modal>
    </div>
  );
}

function SettingsTab() {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSettings();
      setSettings(data);
      form.setFieldsValue({
        geminiModel: data.geminiModel,
        nOnLuyen: data.nOnLuyen,
        nPhongThi: data.nPhongThi,
        thoiGianPhut: data.thoiGianPhut,
        nNganHang: data.nNganHang,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Không tải cấu hình"));
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card
      className="surface-card admin-card"
      variant="borderless"
      loading={loading}
      title="Cấu hình Gemini & mặc định"
    >
      {settings?.health ? (
        <Space wrap style={{ marginBottom: 16 }}>
          <Tag color={settings.health.mongo === "ok" ? "green" : "red"}>
            Mongo: {settings.health.mongo}
          </Tag>
          <Tag color="blue">
            Gemini keys OK: {settings.health.geminiKeysAvailable}
          </Tag>
          {(settings.health.geminiKeysExhausted ?? 0) > 0 ? (
            <Tag color="red">
              Hết quota: {settings.health.geminiKeysExhausted}
            </Tag>
          ) : null}
          {settings.updatedAt ? (
            <Tag>Cập nhật: {formatDate(settings.updatedAt)}</Tag>
          ) : (
            <Tag>Chưa lưu DB — đang dùng .env</Tag>
          )}
        </Space>
      ) : null}

      <GeminiQuotaPanel initial={settings?.geminiQuota} />

      {error ? (
        <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />
      ) : null}

      <GeminiKeysManager onChanged={() => void load()} />

      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          setSaving(true);
          setError(null);
          try {
            const data = await updateAdminSettings({
              geminiModel: values.geminiModel?.trim() || undefined,
              nOnLuyen: Number(values.nOnLuyen),
              nPhongThi: Number(values.nPhongThi),
              thoiGianPhut: Number(values.thoiGianPhut),
              nNganHang: Number(values.nNganHang),
            });
            setSettings(data);
            message.success("Đã lưu cấu hình");
          } catch (err) {
            setError(getErrorMessage(err, "Lưu thất bại"));
          } finally {
            setSaving(false);
          }
        }}
      >
        <Form.Item
          label="Gemini model"
          name="geminiModel"
          rules={[{ required: true, message: "Nhập model" }]}
        >
          <Input placeholder="gemini-3.5-flash" />
        </Form.Item>

        <div className="config-grid" style={{ marginBottom: 8 }}>
          <Form.Item label="Số câu ngân hàng mặc định" name="nNganHang">
            <InputNumber min={1} max={500} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Câu mỗi phiên ôn" name="nOnLuyen">
            <InputNumber min={1} max={500} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Câu mỗi đề thi" name="nPhongThi">
            <InputNumber min={1} max={500} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Thời gian thi (phút)" name="thoiGianPhut">
            <InputNumber min={1} max={300} style={{ width: "100%" }} />
          </Form.Item>
        </div>

        <Button type="primary" htmlType="submit" size="large" loading={saving}>
          Lưu cấu hình
        </Button>
      </Form>
    </Card>
  );
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-bar">
        <Typography.Text type="secondary">
          Quản lý toàn bộ người dùng, tài liệu, bộ câu hỏi, phiên và cấu hình.
        </Typography.Text>
        <Button type="link" danger onClick={onLogout}>
          Đăng xuất admin
        </Button>
      </div>
      <Tabs
        defaultActiveKey="overview"
        items={[
          { key: "overview", label: "Tổng quan", children: <OverviewTab /> },
          { key: "users", label: "Người dùng", children: <UsersTab /> },
          { key: "documents", label: "Tài liệu", children: <DocumentsTab /> },
          { key: "quizzes", label: "Bộ câu hỏi", children: <QuizzesTab /> },
          { key: "sessions", label: "Phiên ôn/thi", children: <SessionsTab /> },
          { key: "settings", label: "Cấu hình", children: <SettingsTab /> },
        ]}
      />
    </div>
  );
}
