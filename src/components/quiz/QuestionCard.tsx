"use client";

import { Alert, Card, Radio, Space, Tag, Typography } from "antd";
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
  const reveal = Boolean(showFeedback && selectedIndex != null && question.correctIndex != null);

  return (
    <Card className="question-card">
      <div className="question-meta">
        <Typography.Text type="secondary">
          Câu {index + 1}/{total}
        </Typography.Text>
        <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
          {question.type === "lam_sang" ? (
            <Tag color="gold">Lâm sàng</Tag>
          ) : null}
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
        <Space orientation="vertical" style={{ width: "100%" }} size={10}>
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

      {reveal && question.explanation ? (
        <Alert
          style={{ marginTop: 16 }}
          type={selectedIndex === question.correctIndex ? "success" : "error"}
          showIcon
          title={
            selectedIndex === question.correctIndex ? "Chính xác" : "Chưa đúng"
          }
          description={question.explanation}
        />
      ) : null}
    </Card>
  );
}
