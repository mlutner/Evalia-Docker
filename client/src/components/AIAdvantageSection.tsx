import { Zap, Brain, BarChart3, Sparkles } from "lucide-react";

export function AIAdvantageSection() {
  const advantages = [
    {
      icon: Zap,
      title: "AI Survey Generation",
      description: "Transform documents into polished surveys instantly. Let AI handle the heavy lifting while you focus on insights.",
      shortBenefit: "Generate surveys 10x faster",
    },
    {
      icon: Brain,
      title: "Question Quality Scoring",
      description: "AI validates every question for clarity and effectiveness. Eliminate ambiguous questions before respondents see them.",
      shortBenefit: "Ensure survey quality automatically",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "AI extracts themes, patterns, and sentiment from responses. Transform raw feedback into crystal-clear insights.",
      shortBenefit: "Understand feedback instantly",
    },
    {
      icon: Sparkles,
      title: "AI-Driven Recommendations",
      description: "Get specific, actionable recommendations based on your survey data. Stop guessing, start deciding.",
      shortBenefit: "Act on data with confidence",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgb(47, 143, 165) 0%, rgb(163, 192, 92) 50%, rgb(217, 70, 239) 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your unfair AI advantage
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Learn deeper, act faster, and improve like never before. With AI at every step, you'll create better surveys and understand your respondents like never before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div
                key={index}
                className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-[16px] p-6 hover:bg-slate-900/60 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-white/5"
              >
                {/* Icon container */}
                <div className="mb-4 inline-block p-3 bg-gradient-to-br from-teal-400/20 to-lime-400/20 rounded-lg">
                  <Icon className="w-6 h-6 text-teal-300" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {advantage.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/70 mb-4 leading-relaxed">
                  {advantage.description}
                </p>

                {/* Short benefit */}
                <div className="flex items-center text-teal-300 text-sm font-medium group-hover:text-teal-200 transition-colors">
                  <span>{advantage.shortBenefit}</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
