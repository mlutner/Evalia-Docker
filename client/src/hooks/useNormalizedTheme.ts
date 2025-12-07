import { useMemo } from "react";
import { normalizeThemeImages, type Theme } from "@shared/theme";

export function useNormalizedTheme(theme?: unknown): Theme {
  return useMemo(() => normalizeThemeImages(theme || {}), [theme]);
}
