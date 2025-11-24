import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  type?: "warning" | "info" | "neutral";
}

const typeStyles = {
  warning: {
    bgColor: "rgba(163, 214, 92, 0.08)",
    iconColor: "var(--color-accent-lime)",
    borderColor: "var(--color-accent-lime)",
    iconBgColor: "rgba(163, 214, 92, 0.1)",
  },
  info: {
    bgColor: "rgba(47, 143, 165, 0.08)",
    iconColor: "var(--color-primary)",
    borderColor: "var(--color-primary)",
    iconBgColor: "rgba(47, 143, 165, 0.1)",
  },
  neutral: {
    bgColor: "var(--color-bg-light)",
    iconColor: "var(--color-text-primary)",
    borderColor: "var(--color-text-primary)",
    iconBgColor: "rgba(28, 38, 53, 0.1)",
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
      className="flex gap-4 p-4 rounded-lg hover-elevate cursor-pointer border-l-3 transition-all"
      style={{
        backgroundColor: styles.bgColor,
        borderLeftColor: styles.borderColor,
      }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: styles.iconBgColor }}>
        <Icon className="w-6 h-6" strokeWidth={2} style={{ color: styles.iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-neutral-text-primary)' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-text-secondary)' }}>{description}</p>
      </div>
    </div>
  );
}
