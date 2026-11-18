"use client";

import {
  Alert,
  Button,
  Card,
  Collapse,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import { appMessage as message } from "@/lib/appMessage";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SessionDetail } from "@/@types/api";
import { getErrorMessage } from "@/api/client";
import {
  getSession,
  redoSession,
  retryWrong,
} from "@/api/session.api";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { choiceLabel } from "@/utils/format";

export default function ResultsPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSession(params.sessionId);
      setSession(data);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params.sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const answerMap = useMemo(
    () => new Map(session?.answers.map((a) => [a.questionId, a.selectedIndex]) ?? []),
    [session],
  );

  const unansweredCount = useMemo(() => {
    if (!session) return 0;
    return session.questions.filter((q) => !answerMap.has(q.id)).length;
  }, [session, answerMap]);

  if (loading || !session) {
    return (
      <div className="center-screen">
        <Spin size="large" description="Đang tải kết quả…" />
      </div>
    );
  }

  if (session.status === "in_progress") {
    return (
      <Alert
        type="info"
        showIcon
        title="Phiên vẫn đang làm"
        action={
          <Link
            href={
              session.kind === "practice"
                ? `/practice/${session.id}`
                : `/exam/${session.id}`
            }
          >
            <Button type="primary">Tiếp tục</Button>
          </Link>
        }
      />
    );
  }

  const onRetryWrong = async () => {
    setActing(true);
    try {
      const next = await retryWrong(session.id);
      router.push(`/practice/${next.id}`);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const onRedo = async () => {
    setActing(true);
    try {
      const next = await redoSession(session.id);
      router.push(
        next.kind === "practice"
          ? `/practice/${next.id}`
          : `/exam/${next.id}`,
      );
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  return (
    <div>
      <div className="page-hero">
        <span className="page-kicker">Kết quả</span>
        <Typography.Title level={2} className="page-title">
          Tổng kết {session.kind === "practice" ? "ôn luyện" : "phòng thi"}
        </Typography.Title>
        <Typography.Paragraph className="page-desc">
          {session.status === "expired" ? "Hết giờ — tự nộp" : "Đã nộp bài"}
        </Typography.Paragraph>
      </div>

      <div className="results-score">
        <div className="results-score-tile">
          <Statistic title="Điểm %" value={session.score?.percent ?? 0} suffix="%" />
        </div>
        <div className="results-score-tile">
          <Statistic
            title="Đúng / Tổng"
            value={`${session.score?.correct ?? 0}/${session.score?.total ?? 0}`}
          />
        </div>
        <div className="results-score-tile">
          <Statistic
            title="Câu sai"
            value={session.wrongQuestionIds?.length ?? 0}
          />
        </div>
        <div className="results-score-tile">
          <Statistic title="Chưa trả lời" value={unansweredCount} />
        </div>
      </div>

      <Space wrap style={{ marginBottom: 20 }}>
        <Button
          type="primary"
          loading={acting}
          disabled={!session.wrongQuestionIds?.length}
          onClick={() => void onRetryWrong()}
        >
          Ôn câu sai
        </Button>
        <Button loading={acting} onClick={() => void onRedo()}>
          Làm lại
        </Button>
        <Link href={`/quizzes/${session.quizSetId}`}>
          <Button>Về bộ câu hỏi</Button>
        </Link>
        <Link href="/library">
          <Button type="link">Thư viện</Button>
        </Link>
      </Space>

      <Card title="Xem lại đáp án" className="surface-card" variant="borderless">
        <Collapse
          items={session.questions.map((q, i) => {
            const selected = answerMap.get(q.id);
            const correct = selected === q.correctIndex;
            const status =
              selected == null ? "unanswered" : correct ? "correct" : "wrong";
            return {
              key: q.id,
              label: (
                <Space wrap>
                  <span>Câu {i + 1}</span>
                  {status === "unanswered" ? (
                    <Tag>Chưa trả lời</Tag>
                  ) : status === "correct" ? (
                    <Tag color="success">Đúng</Tag>
                  ) : (
                    <Tag color="error">Sai</Tag>
                  )}
                </Space>
              ),
              children: (
                <div>
                  <QuestionCard
                    index={i}
                    total={session.questions.length}
                    question={q}
                    selectedIndex={selected ?? null}
                    locked
                    showFeedback
                  />
                  {selected != null ? (
                    <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
                      Bạn chọn {choiceLabel(selected)}
                      {q.correctIndex != null
                        ? ` · Đáp án đúng ${choiceLabel(q.correctIndex)}`
                        : ""}
                    </Typography.Paragraph>
                  ) : (
                    <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
                      Bạn chưa chọn đáp án cho câu này.
                    </Typography.Paragraph>
                  )}
                </div>
              ),
            };
          })}
        />
      </Card>
    </div>
  );
}
