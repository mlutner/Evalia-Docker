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
  currentApiKey: string;
  apiKeyRotated: string | null;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<AIUsageStats>({
    queryKey: ["/api/admin/ai-usage-stats"],
  });

  const { data: settings } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return apiRequest("POST", "/api/admin/api-key", { apiKey });
    },
    onSuccess: () => {
      toast({
        title: "API key updated",
        description: "Your Mistral API key has been rotated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setNewApiKey("");
      setShowKeyDialog(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const maskApiKey = (key: string) => {
    if (!key) return "Not set";
    return key.substring(0, 8) + "..." + key.substring(key.length - 4);
  };

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
                API Key Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mistral API Key</label>
                <div className="mt-2 p-3 bg-muted rounded-lg flex items-center justify-between" data-testid="display-current-key">
                  <code className="text-xs text-muted-foreground font-mono">
                    {maskApiKey(settings?.currentApiKey || "")}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(settings?.currentApiKey || "")}
                    disabled={!settings?.currentApiKey}
                    data-testid="button-copy-key"
                  >
                    {copiedKey ? "Copied!" : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {settings?.apiKeyRotated && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Key rotated</p>
                    <p>{new Date(settings.apiKeyRotated).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setShowKeyDialog(true)}
                variant="outline"
                className="w-full"
                data-testid="button-rotate-key"
              >
                Rotate API Key
              </Button>

              <p className="text-xs text-muted-foreground">
                Update your Mistral API key to continue using AI features
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

      {/* API Key Rotation Dialog */}
      <AlertDialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate Mistral API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your new API key. This will replace the current key and all AI features will use the new key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Input
              type="password"
              placeholder="sk-..."
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              data-testid="input-new-api-key"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-rotate">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateApiKeyMutation.mutate(newApiKey)}
              disabled={!newApiKey || updateApiKeyMutation.isPending}
              data-testid="button-confirm-rotate"
            >
              {updateApiKeyMutation.isPending ? "Rotating..." : "Rotate Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
