import { DashboardOverview } from "@/components/DashboardOverview";

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <DashboardOverview />
      </div>
    </main>
  );
}
