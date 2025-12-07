export interface Theme {
  headerImageUrl?: string | null;
  backgroundImageUrl?: string | null;
  [key: string]: unknown;
}

export function normalizeThemeImages(theme: any): Theme {
  if (!theme || typeof theme !== "object") {
    return {};
  }
  const headerImageUrl = theme.headerImageUrl ?? theme.headerImage?.url ?? theme.headerImage ?? null;
  const backgroundImageUrl = theme.backgroundImageUrl ?? theme.backgroundImage?.url ?? theme.backgroundImage ?? null;
  return {
    ...theme,
    headerImageUrl: headerImageUrl || null,
    backgroundImageUrl: backgroundImageUrl || null,
  };
}
