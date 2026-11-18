import { buildAntdTheme } from "./buildTheme";
import { DEFAULT_DARK, DEFAULT_LIGHT } from "./palette";

/** Theme sáng mặc định (Petrol) */
export const lightTheme = buildAntdTheme("light", DEFAULT_LIGHT);

/** Theme tối mặc định (Petrol) */
export const darkTheme = buildAntdTheme("dark", DEFAULT_DARK);

/** @deprecated dùng lightTheme hoặc buildAntdTheme */
export const appTheme = lightTheme;

export { buildAntdTheme } from "./buildTheme";
export {
  THEME_PRESETS,
  DEFAULT_LIGHT,
  DEFAULT_DARK,
  defaultPreferences,
} from "./palette";
