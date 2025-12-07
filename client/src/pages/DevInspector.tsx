import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scoringEngines, activeScoringEngineId } from "@/core/scoring/strategies";
import { defaultLogicEngineId, logicEngines } from "@/core/logic/engines";
import { surveyTemplates } from "@shared/templates";

type Endpoint = {
  path: string;
  description: string;
  enabled: boolean;
};

const aiEndpoints: Endpoint[] = [
  { path: "/api/generate-survey", description: "Prompt/document to survey generator", enabled: true },
  { path: "/api/generate-scoring-config", description: "AI-generated scoring config", enabled: true },
  { path: "/api/parse-document", description: "PDF/DOCX/PPTX ingestion", enabled: true },
  { path: "/api/generate-text", description: "Generate welcome/thank-you text", enabled: true },
  { path: "/api/enhance-prompt", description: "Prompt enhancer", enabled: true },
  { path: "/api/questions/analyze", description: "Question quality analyzer", enabled: true },
  { path: "/api/chat", description: "Builder AI assistant", enabled: true },
  { path: "/api/ai-chat", description: "General AI chat endpoint", enabled: true },
  { path: "/api/adjust-tone", description: "Tone adjustment for questions", enabled: true },
];

// Heuristic-only tag keywords for dev stats (not the canonical tag vocabulary)
const canonicalTagKeywords: Record<string, string[]> = {
  pulse: ["pulse"],
  engagement: ["engagement"],
  exit: ["exit", "offboarding"],
  training: ["training", "course"],
  feedback: ["feedback"],
  assessment: ["assessment", "evaluation"],
  manager: ["manager", "leadership"],
  roi: ["roi", "impact"],
};

function deriveTemplateTags(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();
  return Object.entries(canonicalTagKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([tag]) => tag);
}

function buildTemplateStats() {
  const counts: Record<string, number> = {};

  surveyTemplates.forEach((template) => {
    const tags = deriveTemplateTags(template.title, template.description);
    tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  return {
    total: surveyTemplates.length,
    counts,
  };
}

export default function DevInspector() {
  const templateStats = buildTemplateStats();

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase text-muted-foreground">Development-only</p>
        <h1 className="text-2xl font-semibold">Inspector</h1>
        <p className="text-muted-foreground text-sm">
          Quick visibility into engines, endpoints, and catalog stats. This page is not exposed to end users
          and is only wired in development builds.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scoring Engines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">Active: {activeScoringEngineId}</div>
            <div className="space-y-2">
              {scoringEngines.map((engine) => (
                <div key={engine.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium">{engine.name}</div>
                  <div className="text-muted-foreground">ID: {engine.id}</div>
                  <div className="text-muted-foreground">Status: {engine.status}</div>
                  <div className="text-muted-foreground">{engine.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logic Engines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">Default: {defaultLogicEngineId}</div>
            <div className="space-y-2">
              {logicEngines.map((engine) => (
                <div key={engine.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium">{engine.name}</div>
                  <div className="text-muted-foreground">ID: {engine.id}</div>
                  <div className="text-muted-foreground">Status: {engine.status}</div>
                  {engine.notes && <div className="text-muted-foreground">{engine.notes}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {aiEndpoints.map((endpoint) => (
            <div key={endpoint.path} className="rounded-lg border p-3">
              <div className="font-medium">{endpoint.path}</div>
              <div className="text-muted-foreground">{endpoint.description}</div>
              <div className="text-muted-foreground">Enabled: {endpoint.enabled ? "yes" : "no"}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>Total templates: {templateStats.total}</div>
          <div className="space-y-1">
            {Object.keys(templateStats.counts).length === 0 && (
              <div className="text-muted-foreground">No canonical tags detected.</div>
            )}
            {Object.entries(templateStats.counts).map(([tag, count]) => (
              <div key={tag} className="flex items-center justify-between rounded border p-2">
                <span className="font-medium">{tag}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
