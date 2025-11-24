import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  showBorder?: boolean;
}

export function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  showBorder = true
}: KpiCardProps) {
  return (
    <Card className={`hover-elevate ${showBorder ? "border-l-2 border-l-[#1F8EFA]" : ""} h-full bg-[#FFFFFF] border-[#E7EBF0]`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[11px] text-[#6B7785] font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-[32px] font-bold mt-2 text-[#0D1B2A]">{value}</p>
            <p className="text-[13px] text-[#6B7785] mt-2">{subtext}</p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-4" style={{ backgroundColor: "rgba(31, 142, 250, 0.1)" }}>
            <Icon className="w-6 h-6" strokeWidth={2} style={{ color: "#1F8EFA" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
