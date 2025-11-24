import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { theme } from "@/theme";

export default function ScoringPage() {
  return (
    <main style={{ backgroundColor: theme.backgrounds.page }} className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Scoring Models</h1>
            <p className="text-muted-foreground">Configure rating scales and scoring rules</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Scoring Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create custom scoring models and rating scales for your surveys to analyze responses with precision.
            </p>
            <Button variant="outline" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
