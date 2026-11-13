"use client";

import { FlagFilled, FlagOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Modal,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { appMessage as message } from "@/lib/appMessage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SessionDetail } from "@/@types/api";
import { getErrorMessage } from "@/api/client";
import {
  answerQuestion,
  getSession,
  submitSession,
} from "@/api/session.api";
import { ExamNav } from "@/components/exam/ExamNav";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { useExamTimer } from "@/hooks/useExamTimer";

function flagStorageKey(sessionId: string) {
  return `qp:exam-flags:${sessionId}`;
}

function loadFlags(sessionId: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(flagStorageKey(sessionId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr.filter((n) => Number.isInteger(n) && n >= 0));
  } catch {
    return new Set();
  }
}

function saveFlags(sessionId: string, flags: Set<number>) {
  try {
    localStorage.setItem(
      flagStorageKey(sessionId),
      JSON.stringify([...flags].sort((a, b) => a - b)),
    );
  } catch {
    /* ignore quota */
  }
}

export default function ExamPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const submittingRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSession(params.sessionId);
      setSession(data);
      setFlagged(loadFlags(params.sessionId));
      if (data.status !== "in_progress") {
        router.replace(`/results/${data.id}`);
      }
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params.sessionId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const answersByQ = useMemo(() => {
    const m = new Map<string, number>();
    session?.answers.forEach((a) => m.set(a.questionId, a.selectedIndex));
    return m;
  }, [session]);

  const question = session?.questions[index];

  useEffect(() => {
    if (!question) return;
    setSelected(answersByQ.get(question.id) ?? null);
  }, [question, answersByQ]);

  const toggleFlag = useCallback(
    (i: number) => {
      setFlagged((prev) => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        saveFlags(params.sessionId, next);
        return next;
      });
    },
    [params.sessionId],
  );

  const doSubmit = useCallback(async () => {
    if (!session || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const done = await submitSession(session.id);
      try {
        localStorage.removeItem(flagStorageKey(session.id));
      } catch {
        /* ignore */
      }
      router.push(`/results/${done.id}`);
    } catch (err) {
      message.error(getErrorMessage(err));
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [session, router]);

  const onExpire = useCallback(() => {
    void doSubmit();
  }, [doSubmit]);

  const remaining = useExamTimer(session?.expiresAt, onExpire);

  if (loading || !session || !question) {
    return (
      <div className="center-screen">
        <Spin size="large" description="Đang tải phòng thi…" />
      </div>
    );
  }

  const answeredIndexes = new Set<number>();
  session.questions.forEach((q, i) => {
    if (answersByQ.has(q.id)) answeredIndexes.add(i);
  });

  const isCurrentFlagged = flagged.has(index);

  const saveAnswer = async (selectedIndex: number) => {
    const previous = answersByQ.get(question.id) ?? null;
    setSelected(selectedIndex);
    try {
      await answerQuestion(session.id, {
        questionId: question.id,
        selectedIndex,
      });
      setSession((prev) => {
        if (!prev) return prev;
        const answers = [
          ...prev.answers.filter((a) => a.questionId !== question.id),
          { questionId: question.id, selectedIndex },
        ];
        return { ...prev, answers };
      });
    } catch (err) {
      setSelected(previous);
      message.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
        <Col xs={24} md={16}>
          <div className="page-hero" style={{ marginBottom: 0 }}>
            <span className="page-kicker">Kiểm tra</span>
            <Typography.Title level={3} className="page-title" style={{ fontSize: 22 }}>
              Phòng thi
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              Không hiện đúng/sai khi đang làm · Có thể quay lại câu · Hết giờ tự nộp
            </Typography.Paragraph>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <ExamTimer remainingSeconds={remaining} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <QuestionCard
            index={index}
            total={session.questions.length}
            question={question}
            selectedIndex={selected}
            showFeedback={false}
            onSelect={(i) => void saveAnswer(i)}
          />
          <Space style={{ marginTop: 16 }} wrap>
            <Button disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              Câu trước
            </Button>
            <Button
              disabled={index >= session.questions.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              Câu sau
            </Button>
            <Button
              className={isCurrentFlagged ? "exam-flag-btn is-active" : "exam-flag-btn"}
              icon={isCurrentFlagged ? <FlagFilled /> : <FlagOutlined />}
              onClick={() => toggleFlag(index)}
            >
              {isCurrentFlagged ? "Bỏ cờ" : "Đặt cờ"}
            </Button>
            <Button
              type="primary"
              danger
              loading={submitting}
              onClick={() => {
                const unanswered = session.questions.length - answeredIndexes.size;
                const flagCount = flagged.size;
                Modal.confirm({
                  title: "Nộp bài?",
                  content: (
                    <div>
                      <p style={{ marginBottom: 8 }}>
                        Đã trả lời {answeredIndexes.size}/{session.questions.length} câu
                        {unanswered > 0 ? ` · còn ${unanswered} câu chưa chọn` : ""}.
                      </p>
                      {flagCount > 0 ? (
                        <p style={{ marginBottom: 0, color: "#b87500" }}>
                          Còn {flagCount} câu đang đặt cờ — bạn có muốn xem lại trước khi nộp?
                        </p>
                      ) : null}
                    </div>
                  ),
                  okText: "Nộp bài",
                  cancelText: "Tiếp tục làm",
                  onOk: () => doSubmit(),
                });
              }}
            >
              Nộp bài
            </Button>
          </Space>
        </Col>
        <Col xs={24} md={8}>
          <ExamNav
            total={session.questions.length}
            current={index}
            answered={answeredIndexes}
            flagged={flagged}
            onJump={setIndex}
            onToggleFlag={toggleFlag}
          />
        </Col>
      </Row>
    </div>
  );
}
