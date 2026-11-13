import type { MessageInstance } from "antd/es/message/interface";

/** Gán từ <App> — dùng thay message static của antd. */
let api: MessageInstance | null = null;

export function setMessageApi(instance: MessageInstance) {
  api = instance;
}

export const appMessage = {
  success: (...args: Parameters<MessageInstance["success"]>) =>
    api?.success(...args),
  error: (...args: Parameters<MessageInstance["error"]>) => api?.error(...args),
  warning: (...args: Parameters<MessageInstance["warning"]>) =>
    api?.warning(...args),
  info: (...args: Parameters<MessageInstance["info"]>) => api?.info(...args),
  loading: (...args: Parameters<MessageInstance["loading"]>) =>
    api?.loading(...args),
  destroy: (...args: Parameters<MessageInstance["destroy"]>) =>
    api?.destroy(...args),
};
