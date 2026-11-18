"use client";

import { Statistic } from "antd";
import { formatDuration } from "@/utils/format";

export function ExamTimer({ remainingSeconds }: { remainingSeconds: number }) {
  const danger = remainingSeconds <= 60;
  return (
    <div className={`exam-timer ${danger ? "exam-timer-danger" : ""}`}>
      <Statistic
        title="Thời gian còn lại"
        value={formatDuration(remainingSeconds)}
        styles={{
          content: {
            color: danger ? "#ef4444" : "var(--qp-primary)",
            fontVariantNumeric: "tabular-nums",
          },
        }}
      />
    </div>
  );
}
