export type ScoringEngine = {
  id: string;
  name: string;
  status: "active" | "available" | "deprecated";
  description: string;
};

export const scoringEngines: ScoringEngine[] = [
  {
    id: "engagement_v1",
    name: "Engagement Scoring v1",
    status: "active",
    description: "Default engagement-weighted scorer for current surveys and templates.",
  },
];

export const activeScoringEngineId = "engagement_v1";
