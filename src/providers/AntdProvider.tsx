"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { useEffect, type ReactNode } from "react";
import { setMessageApi } from "@/lib/appMessage";
import { appTheme } from "@/themes/theme";

function MessageBridge() {
  const { message } = App.useApp();
  useEffect(() => {
    setMessageApi(message);
  }, [message]);
  return null;
}

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={appTheme} locale={viVN}>
      <App>
        <MessageBridge />
        {children}
      </App>
    </ConfigProvider>
  );
}
