import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function RespondentsListPage() {
  return (
    <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Respondents</h1>
            <p className="text-muted-foreground">Manage survey respondents and track responses</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Respondents Management</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              This feature is coming soon. You'll be able to manage survey respondents, track responses, and send invitations.
            </p>
            <Button variant="outline" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
