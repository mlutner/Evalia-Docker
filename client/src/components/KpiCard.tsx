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
    <Card className={`hover-elevate ${showBorder ? "border-l-4" : ""} h-full`} style={{
      borderLeftColor: showBorder ? '#4CB4A0' : undefined,
      backgroundColor: '#FFFFFF',
      borderColor: '#E3E7EC',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      borderRadius: '12px',
    }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-neutral-text-secondary)' }}>{label}</p>
            <p className="text-[32px] font-bold mt-2" style={{ color: 'var(--color-neutral-text-primary)' }}>{value}</p>
            <p className="text-[13px] mt-2" style={{ color: 'var(--color-neutral-text-secondary)' }}>{subtext}</p>
          </div>
          <div className="flex items-center justify-center flex-shrink-0 ml-6 w-12 h-12 rounded-[12px]" style={{ backgroundColor: '#F7F9FA' }}>
            <Icon className="w-6 h-6" strokeWidth={2} style={{ color: 'rgba(14, 27, 44, 0.7)' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
