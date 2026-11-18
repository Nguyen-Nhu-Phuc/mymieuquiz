"use client";

import { Button, Spin, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isPracticeAnswerResult,
  type PublicQuestion,
  type SessionDetail,
} from "@/@types/api";
import { getErrorMessage } from "@/api/client";
import {
  answerQuestion,
  getSession,
  submitSession,
} from "@/api/session.api";
import { ProgressBar } from "@/components/quiz/ProgressBar";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { appMessage as message } from "@/lib/appMessage";

export default function PracticePage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const actionsRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [localSelected, setLocalSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    correctIndex: number;
    explanation: string;
    isCorrect: boolean;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSession(params.sessionId);
      setSession(data);
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

  const question: PublicQuestion | undefined = session?.questions[index];
  const answeredMap = useMemo(() => {
    const m = new Map<string, number>();
    session?.answers.forEach((a) => m.set(a.questionId, a.selectedIndex));
    return m;
  }, [session]);

  useEffect(() => {
    if (!question) return;
    const prev = answeredMap.get(question.id);
    setLocalSelected(prev ?? null);
    if (prev != null && question.correctIndex != null) {
      setFeedback({
        correctIndex: question.correctIndex,
        explanation: question.explanation || "",
        isCorrect: prev === question.correctIndex,
      });
    } else {
      setFeedback(null);
    }
  }, [question, answeredMap]);

  // Sau khi có đáp án → giữ nút "Câu tiếp" trong tầm nhìn, không bắt kéo hết giải thích
  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => {
      actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [feedback, index]);

  const applyAnswer = useCallback(
    async (selectedIndex: number) => {
      if (!session || !question || answering || feedback) return;
      setLocalSelected(selectedIndex);
      setAnswering(true);
      try {
        const res = await answerQuestion(session.id, {
          questionId: question.id,
          selectedIndex,
        });
        if (isPracticeAnswerResult(res)) {
          setFeedback({
            correctIndex: res.correctIndex,
            explanation: res.explanation,
            isCorrect: res.isCorrect,
          });
          setSession((prev) => {
            if (!prev) return prev;
            const questions = prev.questions.map((q) =>
              q.id === question.id
                ? {
                    ...q,
                    correctIndex: res.correctIndex,
                    explanation: res.explanation,
                  }
                : q,
            );
            const answers = [
              ...prev.answers.filter((a) => a.questionId !== question.id),
              {
                questionId: question.id,
                selectedIndex,
                isCorrect: res.isCorrect,
              },
            ];
            return { ...prev, questions, answers };
          });
        }
      } catch (err) {
        setLocalSelected(null);
        message.error(getErrorMessage(err));
      } finally {
        setAnswering(false);
      }
    },
    [session, question, answering, feedback],
  );

  if (loading || !session || !question) {
    return (
      <div className="center-screen">
        <Spin size="large" description="Đang tải…" />
      </div>
    );
  }

  const total = session.questions.length;
  const locked = feedback != null;

  const goNext = async () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try {
      const done = await submitSession(session.id);
      router.push(`/results/${done.id}`);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <div className="session-focus practice-session">
      <div className="session-topbar">
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Ôn luyện · Câu {index + 1}/{total}
        </Typography.Text>
        <div style={{ marginTop: 8 }}>
          <ProgressBar current={index + (locked ? 1 : 0)} total={total} />
        </div>
      </div>

      <QuestionCard
        index={index}
        total={total}
        question={{
          ...question,
          correctIndex: feedback?.correctIndex ?? question.correctIndex,
          explanation: feedback?.explanation ?? question.explanation,
        }}
        selectedIndex={localSelected}
        locked={locked || answering}
        showFeedback={Boolean(feedback)}
        onSelect={(i) => {
          if (!locked && !answering) void applyAnswer(i);
        }}
      />

      <div
        ref={actionsRef}
        className={`session-actions-bar${locked ? " is-ready" : ""}`}
      >
        <div className="session-actions-left">
          <Button
            type="text"
            disabled={index === 0}
            onClick={() => {
              setIndex((i) => i - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            ← Trước
          </Button>
        </div>
        <div className="session-actions-right">
          {locked ? (
            <Button type="primary" size="large" onClick={() => void goNext()}>
              {index + 1 < total ? "Câu tiếp →" : "Xem kết quả"}
            </Button>
          ) : (
            <Typography.Text type="secondary">
              {answering ? "Đang chấm…" : "Chọn A–D để trả lời"}
            </Typography.Text>
          )}
        </div>
      </div>
    </div>
  );
}
