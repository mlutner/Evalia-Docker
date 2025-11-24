import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  type?: "warning" | "info" | "neutral";
}

const typeStyles = {
  warning: {
    bgColor: "rgba(168, 224, 94, 0.08)",
    iconColor: "#A8E05E",
    borderColor: "#A8E05E",
  },
  info: {
    bgColor: "rgba(31, 142, 250, 0.08)",
    iconColor: "#1F8EFA",
    borderColor: "#1F8EFA",
  },
  neutral: {
    bgColor: "#F5F7FA",
    iconColor: "#0D1B2A",
    borderColor: "#0D1B2A",
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
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${styles.iconColor}15` }}>
        <Icon className="w-6 h-6" strokeWidth={2} style={{ color: styles.iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1C2B36]">{title}</p>
        <p className="text-xs text-[#6B7785] mt-1">{description}</p>
      </div>
    </div>
  );
}
