import type { ThemeConfig } from "antd";

/** Theme học tập trung tính — xanh petrol, bề mặt giấy dịu */
export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#0F6B5C",
    colorInfo: "#1F6F8B",
    colorSuccess: "#2F7D4A",
    colorWarning: "#C47A12",
    colorError: "#C23B3B",
    colorText: "#12352F",
    colorTextSecondary: "#5A6F6A",
    colorBorder: "#D5E3DE",
    colorBorderSecondary: "#E4EEEA",
    colorBgLayout: "#EEF4F2",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    borderRadius: 12,
    borderRadiusLG: 16,
    controlHeight: 40,
    controlHeightLG: 44,
    fontFamily:
      '"Be Vietnam Pro", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 15,
    lineHeight: 1.55,
    boxShadow:
      "0 1px 2px rgba(11, 61, 54, 0.04), 0 8px 24px rgba(11, 61, 54, 0.06)",
    boxShadowSecondary:
      "0 1px 2px rgba(11, 61, 54, 0.03), 0 4px 14px rgba(11, 61, 54, 0.05)",
  },
  components: {
    Layout: {
      headerBg: "#0B3D36",
      headerColor: "#FFFFFF",
      bodyBg: "transparent",
      footerBg: "transparent",
    },
    Button: {
      controlHeight: 40,
      fontWeight: 600,
      primaryShadow: "0 6px 16px rgba(15, 107, 92, 0.22)",
    },
    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
    },
    Input: {
      controlHeight: 40,
      activeBorderColor: "#0F6B5C",
      hoverBorderColor: "#3D8F80",
    },
    InputNumber: {
      controlHeight: 40,
    },
    Table: {
      headerBg: "#F4FAF8",
      headerColor: "#3D524D",
      rowHoverBg: "#F7FBFA",
      borderColor: "#E4EEEA",
    },
    Menu: {
      darkItemBg: "transparent",
      darkItemSelectedBg: "rgba(255,255,255,0.12)",
      darkItemHoverBg: "rgba(255,255,255,0.08)",
      itemBorderRadius: 8,
      horizontalItemBorderRadius: 8,
    },
    Steps: {
      colorPrimary: "#0F6B5C",
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};
