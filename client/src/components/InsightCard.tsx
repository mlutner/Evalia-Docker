import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  type?: "warning" | "info" | "neutral";
}

const typeStyles = {
  warning: {
    bgColor: "#F7F9FC",
    iconColor: "#2F8FA5",
    borderColor: "#2F8FA5",
    iconBgColor: "transparent",
  },
  info: {
    bgColor: "#F7F9FC",
    iconColor: "#2F8FA5",
    borderColor: "#2F8FA5",
    iconBgColor: "transparent",
  },
  neutral: {
    bgColor: "#F7F9FC",
    iconColor: "#2F8FA5",
    borderColor: "#2F8FA5",
    iconBgColor: "transparent",
  },
};

export function InsightCard({
  icon: Icon,
  title,
  description,
  type = "info"
}: InsightCardProps) {
  const styles = typeStyles[type];

  return (
    <div 
      className="flex gap-4 p-4 rounded-[12px] hover-elevate cursor-pointer border-l-3 transition-all"
      style={{
        backgroundColor: styles.bgColor,
        borderLeftColor: styles.borderColor,
      }}
    >
      <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" strokeWidth={2} style={{ color: styles.iconColor }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#0E1B2C' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-text-secondary)' }}>{description}</p>
      </div>
    </div>
  );
}
