import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TemplatesPage() {
  return (
    <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Templates</h1>
            <p className="text-muted-foreground">Browse and manage survey templates</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Survey Templates</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Browse pre-built templates to jumpstart your surveys or save templates for reuse across your organization.
            </p>
            <Button variant="outline" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
