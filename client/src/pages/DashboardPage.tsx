import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { DashboardOverview } from "@/components/DashboardOverview";

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  return (
    <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-8">
          <Button 
            size="lg" 
            onClick={() => setLocation("/builder")} 
            data-testid="button-new-survey"
            className="bg-evalia-lime hover:bg-evalia-lime/90 text-slate-900 border-0 font-semibold shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Survey
          </Button>
        </div>
        <DashboardOverview />
      </div>
    </main>
  );
}
