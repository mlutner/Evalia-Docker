import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ComponentType<any>;
  showBorder?: boolean;
  borderColor?: string;
  iconColor?: string;
}

export function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  showBorder = true,
  borderColor = '#2F8FA5',
  iconColor
}: KpiCardProps) {
  return (
    <Card className="evalia-kpi-card" style={{ borderLeftColor: showBorder ? borderColor : undefined }}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="evalia-kpi-label">{label}</p>
            <p className="evalia-kpi-value">{value}</p>
            <p className="evalia-kpi-subtext">{subtext}</p>
          </div>
          <div className="evalia-kpi-icon-wrapper" style={{ backgroundColor: borderColor ? `${borderColor}15` : undefined }}>
            <Icon size={24} weight="bold" className="evalia-icon" style={{ color: iconColor || borderColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
