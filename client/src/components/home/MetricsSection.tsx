import { useEffect, useState } from 'react';

const metrics = [
  { label: "Training professionals", value: 5000, suffix: "+" },
  { label: "Surveys created", value: 50000, suffix: "+" },
  { label: "Responses collected", value: 500000, suffix: "+" },
  { label: "Satisfaction rate", value: 95, suffix: "%" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-evalia-teal-600 to-evalia-mint bg-clip-text text-transparent">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function MetricsSection() {
  return (
    <section className="py-24 md:py-32 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 max-w-6xl mx-auto">
          {metrics.map((metric, idx) => (
            <div
              key={metric.label}
              className="text-center opacity-0 animate-fade-in"
              style={{
                animationDelay: `${idx * 0.1}s`,
                animationDuration: '0.6s',
                animationFillMode: 'forwards',
              }}
            >
              <div className="mb-4">
                <AnimatedCounter target={metric.value} suffix={metric.suffix} />
              </div>
              <p className="text-gray-600 font-medium text-sm md:text-base">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
