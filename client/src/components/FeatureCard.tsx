interface FeatureCardProps {
  accentColor: string;
  title: string;
  description: string;
  testId: string;
}

export function FeatureCard({
  accentColor,
  title,
  description,
  testId,
}: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 relative overflow-hidden" data-testid={testId}>
      {/* Subtle decorative accent */}
      <div className={`absolute top-0 left-0 w-1 h-16 ${accentColor} rounded-r-full`}></div>

      <div className="relative">
        <h3 className="text-2xl font-bold text-evalia-navy mb-4 leading-tight">
          {title}
        </h3>

        <p className="text-gray-600 leading-relaxed text-base">{description}</p>
      </div>
    </div>
  );
}
