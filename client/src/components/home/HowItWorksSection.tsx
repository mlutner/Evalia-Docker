import { Wand2, Share2, BarChart3 } from 'lucide-react';

const steps = [
  {
    number: "01",
    title: "Create with AI",
    description: "Upload your training materials or describe your session. Our AI generates relevant survey questions instantly.",
    icon: Wand2,
    gradient: "from-evalia-teal-500 to-evalia-teal-600",
    testId: "text-step-1-title",
  },
  {
    number: "02",
    title: "Share & Collect",
    description: "Send your survey via link, email, or QR code. Mobile-friendly design ensures high response rates.",
    icon: Share2,
    gradient: "from-evalia-teal-600 to-evalia-mint",
    testId: "text-step-2-title",
  },
  {
    number: "03",
    title: "Analyze & Improve",
    description: "Get instant insights with beautiful visualizations. Identify what works and what needs improvement.",
    icon: BarChart3,
    gradient: "from-evalia-mint to-evalia-teal-400",
    testId: "text-step-3-title",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-32 md:py-40 bg-evalia-teal-50 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-evalia-teal-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-evalia-mint/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="text-center mb-16 md:mb-20 opacity-0 animate-fade-in" style={{ animationDuration: '0.6s', animationFillMode: 'forwards' }}>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-evalia-navy to-evalia-teal-600 bg-clip-text text-transparent mb-6 leading-tight" data-testid="text-how-it-works">
            Create better training feedback in three steps
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From creation to insights, Evalia makes the entire process seamless and efficient.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16 max-w-6xl mx-auto relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-evalia-teal-200 via-evalia-teal-300 to-evalia-teal-200 pointer-events-none z-0" style={{ maxWidth: '90%', marginLeft: '5%' }}></div>

          {/* Steps */}
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number} 
                className="relative hover-elevate transition-all z-10 opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${idx * 0.15}s`,
                  animationDuration: '0.6s',
                  animationFillMode: 'forwards',
                }}
              >
                <div className="flex flex-col items-center mb-8">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-8 h-8 text-white transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  <div className="text-4xl font-bold text-evalia-teal-100/40 mt-3">{step.number}</div>
                </div>
                <h3 className="text-2xl font-bold text-evalia-navy mb-3 text-center" data-testid={step.testId}>
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base text-center">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
