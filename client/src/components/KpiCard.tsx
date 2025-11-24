import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  iconColor?: string;
  showBorder?: boolean;
}

export function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = "#1F8EFA",
  showBorder = true
}: KpiCardProps) {
  return (
    <Card className={`hover-elevate ${showBorder ? "border-l-2 border-l-[#1F8EFA]" : ""} h-full`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[11px] text-[#6B7785] font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-[32px] font-bold mt-2 text-[#0D1B2A]">{value}</p>
            <p className="text-[13px] text-[#6B7785] mt-2">{subtext}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#1F8EFA]/10 flex items-center justify-center flex-shrink-0 ml-4">
            <Icon className="w-6 h-6 text-[#1F8EFA]" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
