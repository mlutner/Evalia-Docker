import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { theme } from "@/theme";

export default function AiAssistPage() {
  return (
    <main style={{ backgroundColor: theme.backgrounds.page }} className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">AI Assist</h1>
            <p className="text-muted-foreground">Generate surveys and analyze responses with AI</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Tools</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Leverage AI to generate survey questions, analyze responses, and extract actionable insights from your data.
            </p>
            <Button variant="outline" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
