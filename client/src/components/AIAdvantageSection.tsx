import { Zap, Brain, BarChart3, Sparkles, MessageCircle, Settings, TrendingUp, Eye } from "lucide-react";

export function AIAdvantageSection() {
  const advantages = [
    {
      icon: Zap,
      title: "AI Survey Generation",
      description: "Transform documents into perfectly structured surveys instantly. Let AI handle the heavy lifting.",
      gradient: "from-blue-600 to-blue-800",
      accentIcon: MessageCircle,
    },
    {
      icon: Brain,
      title: "Question Quality Scoring",
      description: "Prompt new Anthropic models in Claude. Ensure every question is clear and effective.",
      gradient: "from-amber-600 to-amber-800",
      accentIcon: Settings,
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Transform your respondents into action. Unlock deeper insights from feedback data.",
      gradient: "from-purple-600 to-purple-800",
      accentIcon: TrendingUp,
    },
    {
      icon: Sparkles,
      title: "AI-Driven Recommendations",
      description: "Reveal how LLMs talk about your brand across every touchpoint. Act with confidence.",
      gradient: "from-slate-700 to-slate-900",
      accentIcon: Eye,
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Gradient background - more vibrant and prominent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, #2563eb 0%, #0ea5e9 25%, #a78bfa 50%, #ec4899 75%, #f97316 100%)",
        }}
      />

      {/* Content overlay with slight transparency */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your unfair AI advantage
          </h2>
          <p className="text-xl text-white/95 max-w-2xl mx-auto font-light">
            Learn deeper, act faster, and grow like never before. With AI analytics off you have to do is ask.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            const AccentIcon = advantage.accentIcon;
            return (
              <div
                key={index}
                className="group flex flex-col h-full"
              >
                {/* Card Container */}
                <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:bg-slate-900/70 transition-all duration-300 hover:border-white/40 hover:shadow-2xl hover:shadow-white/10 flex flex-col h-full">
                  {/* Mockup/Preview area at top */}
                  <div className={`relative h-40 bg-gradient-to-br ${advantage.gradient} p-6 flex items-center justify-center overflow-hidden`}>
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full" />
                      <div className="absolute top-4 right-4 w-3 h-3 bg-white/60 rounded-full" />
                      <div className="absolute bottom-3 left-1/3 w-1 h-1 bg-white/40 rounded-full" />
                      <div className="absolute bottom-4 right-1/4 w-2 h-2 bg-white/50 rounded-full" />
                    </div>

                    {/* Icon and visual indicator */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <AccentIcon className="w-6 h-6 text-white/70" />
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 p-6 flex flex-col">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-3 leading-snug">
                      {advantage.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/75 mb-6 leading-relaxed flex-1">
                      {advantage.description}
                    </p>

                    {/* Learn more link */}
                    <div className="flex items-center text-white font-semibold text-sm group-hover:text-white/90 transition-colors">
                      <span>Learn more</span>
                      <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
