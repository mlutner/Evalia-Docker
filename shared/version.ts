// Evalia Application Version
// Update this file with each release

export const APP_VERSION = "1.0.0";
export const BUILD_DATE = "2025-11-27";

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2025-11-27",
    changes: [
      "Initial stable release",
      "Survey creation with AI assistance",
      "NPS and multiple choice question types",
      "Analytics dashboard with response tracking",
      "Performance optimizations for surveys list",
      "Batch response counting for faster load times"
    ]
  }
];

// Helper to get latest version info
export function getVersionInfo() {
  return {
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    latestChanges: CHANGELOG[0]?.changes || []
  };
}
