"use client";

import { useEffect, useRef, useState } from "react";

/** Đếm ngược đến expiresAt (ISO). Trả về seconds còn lại. Hết giờ gọi onExpire ngay. */
export function useExamTimer(
  expiresAt: string | undefined,
  onExpire?: () => void,
): number {
  const [remaining, setRemaining] = useState(() => calcRemaining(expiresAt));
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    const next = calcRemaining(expiresAt);
    setRemaining(next);
    if (!expiresAt) return;

    if (next <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }

    const id = window.setInterval(() => {
      const left = calcRemaining(expiresAt);
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpire?.();
        }
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [expiresAt, onExpire]);

  return remaining;
}

function calcRemaining(expiresAt?: string): number {
  if (!expiresAt) return 0;
  return Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
}
