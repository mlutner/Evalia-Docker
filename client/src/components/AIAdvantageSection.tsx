import { useState } from "react";
import { Zap, Brain, BarChart3, Sparkles, MessageCircle, Settings, TrendingUp, Eye, Upload, X } from "lucide-react";
import surveyGenerationFull from "@assets/survey-generation-full.png";
import qualityCheckMockup from "@assets/quality-check-mockup.png";

export function AIAdvantageSection() {
  const [cardImages, setCardImages] = useState<{ [key: number]: string | null }>({
    0: surveyGenerationFull,
    1: qualityCheckMockup,
    2: null,
    3: null,
  });

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCardImages((prev) => ({ ...prev, [index]: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setCardImages((prev) => ({ ...prev, [index]: null }));
  };
  const advantages = [
    {
      icon: Zap,
      title: "Instant Survey Creation",
      description: "Generate professional surveys from training materials, documents, or descriptions. Skip the drafting—let AI do the work in seconds.",
      cardColor: "from-blue-50 to-blue-50/50",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      imagePlaceholderId: "survey-creation-placeholder",
      accentIcon: MessageCircle,
    },
    {
      icon: Brain,
      title: "AI Question Quality Check",
      description: "Every question is validated for clarity, bias, and effectiveness. Ensure your surveys measure what you actually want to know.",
      cardColor: "from-emerald-50 to-emerald-50/50",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      imagePlaceholderId: "quality-check-placeholder",
      accentIcon: Settings,
    },
    {
      icon: BarChart3,
      title: "Intelligent Response Analysis",
      description: "AI automatically extracts themes, sentiment, and patterns from open-ended feedback. Understand respondent insights in minutes, not hours.",
      cardColor: "from-teal-50 to-teal-50/50",
      borderColor: "border-teal-200",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      imagePlaceholderId: "response-analysis-placeholder",
      accentIcon: TrendingUp,
    },
    {
      icon: Sparkles,
      title: "Actionable Insights & Reports",
      description: "Get AI-powered recommendations and professional PDF exports. Transform training feedback into concrete improvement actions.",
      cardColor: "from-purple-50 to-purple-50/50",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      imagePlaceholderId: "insights-reports-placeholder",
      accentIcon: Eye,
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Sophisticated SVG background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ filter: "url(#smoothFilter)" }}
      >
        <defs>
          {/* Smooth filter for refined appearance */}
          <filter id="smoothFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
          </filter>

          {/* Primary radial gradient - teal to lime */}
          <radialGradient id="radialGrad1" cx="25%" cy="30%">
            <stop offset="0%" stopColor="#37C0A3" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#2F8FA5" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#A3D65C" stopOpacity="0.10" />
          </radialGradient>

          {/* Secondary radial gradient - accent */}
          <radialGradient id="radialGrad2" cx="75%" cy="70%">
            <stop offset="0%" stopColor="#2F8FA5" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#37C0A3" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#1F6F78" stopOpacity="0.08" />
          </radialGradient>

          {/* Smooth linear gradient for wave */}
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2F8FA5" stopOpacity="0.18" />
            <stop offset="30%" stopColor="#37C0A3" stopOpacity="0.26" />
            <stop offset="60%" stopColor="#A3D65C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2F8FA5" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Background circles - large blurred shapes */}
        <circle cx="20%" cy="25%" r="400" fill="url(#radialGrad1)" />
        <circle cx="85%" cy="75%" r="350" fill="url(#radialGrad2)" />

        {/* Organic wave shapes */}
        <path
          d="M 0,200 Q 180,150 360,180 T 720,200 T 1080,180 T 1440,200 L 1440,0 L 0,0 Z"
          fill="url(#waveGrad)"
          opacity="0.75"
        />

        <path
          d="M 0,600 Q 180,550 360,580 T 720,600 T 1080,580 T 1440,600 L 1440,800 L 0,800 Z"
          fill="url(#waveGrad)"
          opacity="0.65"
        />

        {/* Accent curved line */}
        <path
          d="M 0,450 Q 360,420 720,450 T 1440,450"
          stroke="#37C0A3"
          strokeWidth="1.5"
          fill="none"
          opacity="0.22"
        />

        {/* Subtle gradient mesh rectangles for depth */}
        <rect x="0" y="0" width="480" height="800" fill="url(#radialGrad1)" opacity="0.6" />
        <rect x="960" y="0" width="480" height="800" fill="url(#radialGrad2)" opacity="0.55" />
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Your unfair AI advantage
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Build better surveys faster. Understand your training effectiveness like never before. From creation to insights, AI handles the heavy lifting so you can focus on improving outcomes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            const AccentIcon = advantage.accentIcon;
            return (
              <div
                key={index}
                className="group flex flex-col h-full"
                data-testid={`card-ai-advantage-${index}`}
              >
                {/* Card Container */}
                <div
                  className={`relative bg-gray-50 border ${advantage.borderColor} rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-opacity-100 flex flex-col h-full hover:scale-105`}
                >
                  {/* Top colored accent bar */}
                  <div
                    className={`h-1 bg-gradient-to-r ${advantage.cardColor.replace("from-", "from-").replace("to-", "to-")}`}
                  />

                  {/* Image Container */}
                  <div className="relative w-full bg-gray-50 flex items-center justify-center overflow-hidden group p-4" style={{ aspectRatio: "3 / 1.4" }}>
                    {cardImages[index] ? (
                      <>
                        {/* Display uploaded image - taller with rounded borders */}
                        <div className="relative w-full h-full border-2 border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                          <img 
                            src={cardImages[index]} 
                            alt={advantage.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Remove image button on hover */}
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Placeholder with upload option */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-colors">
                          <div className="text-center">
                            <div className={`inline-block p-3 ${advantage.iconBg} rounded-lg mb-3`}>
                              <Upload className={`w-6 h-6 ${advantage.iconColor}`} />
                            </div>
                            <p className="text-sm text-slate-600 font-medium">Click to upload image</p>
                            <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                          </div>
                        </div>
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          data-testid={`input-image-${index}`}
                        />
                      </>
                    )}
                  </div>

                  {/* Header area with title */}
                  <div className="p-6 pb-4">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                      {advantage.title}
                    </h3>
                  </div>

                  {/* Divider */}
                  <div className="px-6 py-2">
                    <div className="h-px bg-gradient-to-r from-slate-200 to-transparent" />
                  </div>

                  {/* Description and footer */}
                  <div className="flex-1 px-6 py-4 flex flex-col">
                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed flex-1">
                      {advantage.description}
                    </p>

                    {/* Learn more link */}
                    <div className="flex items-center text-sm font-semibold group-hover:text-opacity-100 transition-colors">
                      <span className="text-slate-700 group-hover:text-slate-900">Learn more</span>
                      <span className="ml-2 text-slate-700 group-hover:text-slate-900 transform group-hover:translate-x-1 transition-transform">→</span>
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
