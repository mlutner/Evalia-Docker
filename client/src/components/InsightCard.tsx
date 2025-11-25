interface InsightCardProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  type?: "warning" | "info" | "neutral";
  iconColor?: string;
}

const typeStyles = {
  warning: {
    bgColor: "#F7F9FC",
    borderColor: "#A3D65C",
  },
  info: {
    bgColor: "#F7F9FC",
    borderColor: "#2F8FA5",
  },
  neutral: {
    bgColor: "#F7F9FC",
    borderColor: "#37C0A3",
  },
};

export function InsightCard({
  icon: Icon,
  title,
  description,
  type = "info",
  iconColor = "#6A7789"
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
      <Icon size={24} weight="bold" className="flex-shrink-0 mt-0.5" style={{ color: iconColor }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#0E1B2C' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-text-secondary)' }}>{description}</p>
      </div>
    </div>
  );
}
