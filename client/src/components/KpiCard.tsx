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
    <Card className={`hover-elevate ${showBorder ? "border-l-2" : ""} h-full`} style={{
      borderLeftColor: showBorder ? 'var(--color-primary)' : undefined,
      backgroundColor: 'var(--color-neutral-surface)',
      borderColor: 'var(--color-neutral-border)',
    }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-neutral-text-secondary)' }}>{label}</p>
            <p className="text-[32px] font-bold mt-2" style={{ color: 'var(--color-neutral-text-primary)' }}>{value}</p>
            <p className="text-[13px] mt-2" style={{ color: 'var(--color-neutral-text-secondary)' }}>{subtext}</p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-4" style={{ backgroundColor: 'rgba(47, 143, 165, 0.1)' }}>
            <Icon className="w-6 h-6" strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
