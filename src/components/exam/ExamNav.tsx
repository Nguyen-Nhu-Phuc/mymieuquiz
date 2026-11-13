"use client";

import { FlagFilled } from "@ant-design/icons";
import { Typography } from "antd";

export function ExamNav({
  total,
  current,
  answered,
  flagged,
  onJump,
  onToggleFlag,
}: {
  total: number;
  current: number;
  answered: Set<number>;
  flagged: Set<number>;
  onJump: (index: number) => void;
  onToggleFlag?: (index: number) => void;
}) {
  return (
    <div className="exam-nav">
      <Typography.Text strong>Danh sách câu</Typography.Text>

      <div className="exam-nav-legend">
        <span className="exam-nav-legend-item">
          <i className="exam-nav-dot exam-nav-dot--current" /> Đang xem
        </span>
        <span className="exam-nav-legend-item">
          <i className="exam-nav-dot exam-nav-dot--answered" /> Đã chọn
        </span>
        <span className="exam-nav-legend-item">
          <i className="exam-nav-dot exam-nav-dot--empty" /> Chưa chọn
        </span>
        <span className="exam-nav-legend-item">
          <i className="exam-nav-dot exam-nav-dot--flagged" /> Có cờ
        </span>
      </div>

      <div className="exam-nav-grid">
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === current;
          const isAnswered = answered.has(i);
          const isFlagged = flagged.has(i);
          const classes = [
            "exam-nav-item",
            isCurrent ? "is-current" : "",
            isAnswered ? "is-answered" : "is-empty",
            isFlagged ? "is-flagged" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={i}
              type="button"
              className={classes}
              onClick={() => onJump(i)}
              onContextMenu={(e) => {
                if (!onToggleFlag) return;
                e.preventDefault();
                onToggleFlag(i);
              }}
              title={
                isFlagged
                  ? `Câu ${i + 1} · đã đặt cờ (chuột phải để bỏ)`
                  : `Câu ${i + 1}${isAnswered ? " · đã chọn" : " · chưa chọn"}`
              }
              aria-current={isCurrent ? "true" : undefined}
              aria-label={`Câu ${i + 1}${isAnswered ? ", đã chọn" : ", chưa chọn"}${isFlagged ? ", có cờ" : ""}`}
            >
              <span className="exam-nav-num">{i + 1}</span>
              {isFlagged ? (
                <FlagFilled className="exam-nav-flag" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>

      <Typography.Paragraph type="secondary" className="exam-nav-hint">
        Chuột phải ô số để đặt / bỏ cờ nhanh
      </Typography.Paragraph>
    </div>
  );
}
