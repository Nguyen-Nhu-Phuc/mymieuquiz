"use client";

import { Progress } from "antd";

export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <Progress
      percent={percent}
      format={() => `${current}/${total}`}
      strokeColor="#0F6B5C"
    />
  );
}
