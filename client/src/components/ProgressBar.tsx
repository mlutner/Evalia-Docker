interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div className="h-2 bg-muted/20 backdrop-blur-sm">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-700 ease-out shadow-lg shadow-primary/20"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Percentage indicator (optional - subtle) */}
      <div className="px-4 sm:px-6 py-2 text-xs font-medium text-muted-foreground bg-background/50 backdrop-blur-sm">
        <span className="text-foreground">{percentage}%</span> complete
      </div>
    </div>
  );
}
