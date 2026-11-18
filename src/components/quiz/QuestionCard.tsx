"use client";

import { Radio, Space, Tag, Typography } from "antd";
import type { PublicQuestion } from "@/@types/api";
import { choiceLabel } from "@/utils/format";

interface Props {
  index: number;
  total: number;
  question: PublicQuestion;
  selectedIndex?: number | null;
  locked?: boolean;
  showFeedback?: boolean;
  onSelect?: (index: number) => void;
}

export function QuestionCard({
  index,
  total,
  question,
  selectedIndex,
  locked,
  showFeedback,
  onSelect,
}: Props) {
  const reveal = Boolean(
    showFeedback && selectedIndex != null && question.correctIndex != null,
  );
  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div className="question-card">
      <div className="question-meta">
        <Typography.Text type="secondary">
          Câu {index + 1}/{total}
        </Typography.Text>
        <span className="question-tags">
          {question.type === "tinh_huong" ? (
            <Tag color="purple">Tình huống</Tag>
          ) : question.type === "lam_sang" ? (
            <Tag color="gold">Lâm sàng</Tag>
          ) : (
            <Tag color="blue">Lý thuyết</Tag>
          )}
          {question.topic ? <Tag color="cyan">{question.topic}</Tag> : null}
        </span>
      </div>

      <p className="question-stem">
        {question.stem?.trim() ? (
          question.stem
        ) : (
          <em className="question-stem-missing">
            (Thiếu nội dung câu hỏi — stem trống)
          </em>
        )}
      </p>

      <Radio.Group
        value={selectedIndex ?? undefined}
        onChange={(e) => onSelect?.(e.target.value)}
        disabled={locked}
        style={{ width: "100%" }}
      >
        <Space orientation="vertical" style={{ width: "100%" }} size={8}>
          {question.choices.map((choice, i) => {
            let className = "choice-item";
            if (reveal) {
              if (i === question.correctIndex) className += " choice-correct";
              else if (i === selectedIndex) className += " choice-wrong";
            }
            return (
              <Radio key={i} value={i} className={className}>
                <strong>{choiceLabel(i)}.</strong> {choice}
              </Radio>
            );
          })}
        </Space>
      </Radio.Group>

      {reveal ? (
        <div
          className={`answer-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}
        >
          <div className="answer-feedback-title">
            {isCorrect ? "Chính xác" : "Chưa đúng"}
          </div>
          {question.explanation ? (
            <p className="answer-feedback-body">{question.explanation}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
