export const CANONICAL_TAGS = [
  "engagement",
  "pulse",
  "feedback",
  "onboarding",
  "exit",
  "leadership",
  "wellbeing",
  "mental_health",
  "burnout",
  "psychological_safety",
  "public_sector",
  "self-assessment",
  "hybrid_work",
  "manager",
  "equity",
] as const;

export type CanonicalTag = (typeof CANONICAL_TAGS)[number];
