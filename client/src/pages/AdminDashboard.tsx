import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BarChart3, DollarSign, Zap, TrendingUp, Key, Copy, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIUsageStats {
  totalTokens: number;
  totalCost: string;
  operationCount: number;
  byOperation: Record<string, { tokens: number; cost: string; count: number }>;
  byModel: Record<string, { tokens: number; cost: string }>;
  last24h: { tokens: number; cost: string };
}

interface AdminSettings {
  apiKeys: Record<string, { key: string; rotated?: string | null }>;
  models: Record<string, string>;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [showKeyDialog, setShowKeyDialog] = useState<string | null>(null);
  const [showModelDialog, setShowModelDialog] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState("");
  const [newModel, setNewModel] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<AIUsageStats>({
    queryKey: ["/api/admin/ai-usage-stats"],
  });

  const { data: settings } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: async (data: { provider: string; apiKey: string }) => {
      return apiRequest("POST", "/api/admin/api-key", data);
    },
    onSuccess: (_, { provider }) => {
      toast({
        title: "API key updated",
        description: `Your ${provider} API key has been rotated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setNewApiKey("");
      setShowKeyDialog(null);
    },
    onError: (error: any) => {
      const msg = error?.message || "Failed to update API key";
      toast({
        title: "Couldn't update key",
        description: msg,
        variant: "destructive",
      });
    },
  });

  const updateModelMutation = useMutation({
    mutationFn: async (data: { provider: string; model: string }) => {
      return apiRequest("POST", "/api/admin/model", data);
    },
    onSuccess: (_, { provider }) => {
      toast({
        title: "Model updated",
        description: `Model for ${provider} has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setNewModel("");
      setShowModelDialog(null);
    },
    onError: (error: any) => {
      const msg = error?.message || "Failed to update model";
      toast({
        title: "Couldn't update model",
        description: msg,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const maskApiKey = (key: string) => {
    if (!key) return "Not set";
    return key.substring(0, 8) + "..." + key.substring(key.length - 4);
  };

  const functionLabels: Record<string, string> = {
    survey_generation: "Survey Generation",
    survey_refinement: "Survey Refinement",
    document_parsing: "Document Parsing",
    response_scoring: "Response Scoring",
    quick_suggestions: "Quick Text Generation",
    response_analysis: "Response Analysis",
  };

  const aiTiers = [
    {
      tier: "high_complexity",
      name: "High-Complexity AI",
      icon: "🧠",
      description: "For complex reasoning tasks requiring advanced models",
      functions: [
        { id: "survey_generation", name: "Survey Generation", description: "Create surveys from prompts" },
        { id: "survey_refinement", name: "Survey Refinement", description: "Improve existing surveys" },
      ],
    },
    {
      tier: "vision",
      name: "Vision/OCR AI",
      icon: "👁️",
      description: "For document parsing and image understanding",
      functions: [
        { id: "document_parsing", name: "Document Parsing", description: "Extract text from PDFs & images" },
      ],
    },
    {
      tier: "medium",
      name: "Medium-Complexity AI",
      icon: "⚙️",
      description: "For moderate reasoning tasks",
      functions: [
        { id: "response_scoring", name: "Response Scoring", description: "Score survey responses" },
        { id: "response_analysis", name: "Response Analysis", description: "Analyze response patterns" },
      ],
    },
    {
      tier: "fast_cheap",
      name: "Fast/Low-Cost AI",
      icon: "⚡",
      description: "For quick tasks and UI enhancements",
      functions: [
        { id: "quick_suggestions", name: "Quick Text Generation", description: "Suggestions, hints, completions" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform-wide AI usage and manage API keys</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Cost */}
          <Card data-testid="card-total-cost">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Platform Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary" data-testid="text-total-cost">
                  ${stats?.totalCost || "0.00"}
                </span>
                <DollarSign className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">All-time usage</p>
            </CardContent>
          </Card>

          {/* Total Tokens */}
          <Card data-testid="card-total-tokens">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" data-testid="text-total-tokens">
                  {stats?.totalTokens?.toLocaleString() || "0"}
                </span>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Across all operations</p>
            </CardContent>
          </Card>

          {/* Operations */}
          <Card data-testid="card-operation-count">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" data-testid="text-operation-count">
                  {stats?.operationCount || "0"}
                </span>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">AI requests</p>
            </CardContent>
          </Card>

          {/* Last 24h */}
          <Card data-testid="card-24h-cost">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last 24 Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-teal-600" data-testid="text-24h-cost">
                  ${stats?.last24h?.cost || "0.00"}
                </span>
                <TrendingUp className="w-5 h-5 text-teal-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stats?.last24h?.tokens?.toLocaleString() || "0"} tokens</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Persistence Notice */}
        <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30" data-testid="card-data-notice">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>ℹ️ Token tracking started today:</strong> All AI operations going forward will be tracked for cost analysis. Historical operations before this feature was enabled won't show cost data.
            </p>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage by Operation */}
          <Card className="lg:col-span-2" data-testid="card-usage-by-operation">
            <CardHeader>
              <CardTitle>Usage by Operation Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.byOperation && Object.entries(stats.byOperation).map(([op, data]) => (
                  <div key={op} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-sm capitalize" data-testid={`text-operation-${op}`}>{op.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">{data.count} operations</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" data-testid={`text-tokens-${op}`}>{data.tokens.toLocaleString()} tokens</p>
                      <p className="text-xs text-primary" data-testid={`text-cost-${op}`}>${data.cost}</p>
                    </div>
                  </div>
                ))}
                {!stats?.byOperation || Object.keys(stats.byOperation).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No usage data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Key Management */}
          <Card data-testid="card-api-key-management">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Keys by Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiTiers.map((category) => (
                <div key={category.tier} className="space-y-2 pb-4 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  {category.functions.map((func) => (
                    <div key={func.id} className="ml-6 space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium">{func.name}</p>
                        <p className="text-xs text-muted-foreground">{func.description}</p>
                      </div>
                      
                      {/* Model Configuration */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Model:</label>
                        <div className="p-2 bg-background rounded border border-input flex items-center justify-between" data-testid={`display-model-${func.id}`}>
                          <code className="text-xs font-mono truncate">
                            {settings?.models?.[func.id] || "Not configured"}
                          </code>
                          <Button
                            onClick={() => {
                              setNewModel(settings?.models?.[func.id] || "");
                              setShowModelDialog(func.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            data-testid={`button-edit-model-${func.id}`}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* API Key Configuration */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">API Key:</label>
                        <div className="p-2 bg-background rounded border border-input flex items-center justify-between" data-testid={`display-key-${func.id}`}>
                          <code className="text-xs text-muted-foreground font-mono">
                            {maskApiKey(settings?.apiKeys?.[func.id]?.key || "")}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(settings?.apiKeys?.[func.id]?.key || "")}
                            disabled={!settings?.apiKeys?.[func.id]?.key}
                            data-testid={`button-copy-key-${func.id}`}
                            className="h-6 px-2"
                          >
                            {copiedKey ? "Copied!" : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setShowKeyDialog(func.id)}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        data-testid={`button-rotate-key-${func.id}`}
                      >
                        Update Key
                      </Button>
                    </div>
                  ))}
                </div>
              ))}

              <p className="text-xs text-muted-foreground">
                Separate API keys for each task type allow independent provider testing and rate limit management.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Models Usage */}
        <Card className="mt-6" data-testid="card-models-usage">
          <CardHeader>
            <CardTitle>Token Usage by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.byModel && Object.entries(stats.byModel).map(([model, data]) => (
                <div key={model} className="p-4 border rounded-lg">
                  <p className="font-medium text-sm mb-2" data-testid={`text-model-${model}`}>{model}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Tokens: <span className="font-semibold" data-testid={`text-model-tokens-${model}`}>{data.tokens.toLocaleString()}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Cost: <span className="font-semibold text-primary" data-testid={`text-model-cost-${model}`}>${data.cost}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Key Update Dialog */}
      <AlertDialog open={!!showKeyDialog} onOpenChange={(open) => !open && setShowKeyDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your new API key for {showKeyDialog ? functionLabels[showKeyDialog] : "task"}. This will replace the current key immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="sk-..."
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              data-testid="input-new-api-key"
            />
            <p className="text-xs text-muted-foreground">
              The system will use this key for all {showKeyDialog?.includes("ocr") ? "document parsing" : "survey generation"} operations.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-rotate">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateApiKeyMutation.mutate({ provider: showKeyDialog || "survey_generation", apiKey: newApiKey })}
              disabled={!newApiKey || updateApiKeyMutation.isPending}
              data-testid="button-confirm-rotate"
            >
              {updateApiKeyMutation.isPending ? "Updating..." : "Update Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Model Update Dialog */}
      <AlertDialog open={!!showModelDialog} onOpenChange={(open) => !open && setShowModelDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Model</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the model name/ID for {showModelDialog ? functionLabels[showModelDialog] : "task"}. Examples: gpt-4o, claude-3-5-sonnet, mistral-large, etc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="e.g., gpt-4o, mistral-large, claude-3-5-sonnet"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              data-testid="input-new-model"
            />
            <p className="text-xs text-muted-foreground">
              Update the model name to test different providers or model versions. Changes take effect on next restart.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-model">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateModelMutation.mutate({ provider: showModelDialog || "survey_generation", model: newModel })}
              disabled={!newModel || updateModelMutation.isPending}
              data-testid="button-confirm-model"
            >
              {updateModelMutation.isPending ? "Updating..." : "Update Model"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
