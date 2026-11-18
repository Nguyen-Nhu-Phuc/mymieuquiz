"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { useEffect, type ReactNode } from "react";
import { ThemeProvider, useThemeMode } from "@/hooks/useThemeMode";
import { setMessageApi } from "@/lib/appMessage";
import { setModalApi } from "@/lib/appModal";

function AppBridge() {
  const { message, modal } = App.useApp();
  useEffect(() => {
    setMessageApi(message);
    setModalApi(modal);
  }, [message, modal]);
  return null;
}

function ThemedConfig({ children }: { children: ReactNode }) {
  const { antdTheme } = useThemeMode();
  return (
    <ConfigProvider theme={antdTheme} locale={viVN}>
      <App>
        <AppBridge />
        {children}
      </App>
    </ConfigProvider>
  );
}

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemedConfig>{children}</ThemedConfig>
    </ThemeProvider>
  );
}
