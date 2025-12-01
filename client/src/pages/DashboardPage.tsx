import { DashboardOverview } from "@/components/DashboardOverview";
import { theme } from "@/theme";

export default function DashboardPage() {
  return (
    <main style={{ backgroundColor: theme.backgrounds.page }} className="flex-1 overflow-auto text-[#f7f9fc]">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <DashboardOverview />
      </div>
    </main>
  );
}
