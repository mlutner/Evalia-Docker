import { useState } from 'react';
import { BarChart3Icon, Users2Icon, TrendingUpIcon, ArrowRightIcon } from 'lucide-react';
import dashboardAnalytics from '@assets/ChatGPT Image Nov 25, 2025, 10_59_56 AM_1764097220928.png';
import dashboardRespondents from '@assets/ChatGPT Image Nov 25, 2025, 11_05_22 AM_1764097552873.png';
import dashboardScoring from '@assets/ChatGPT Image Nov 25, 2025, 11_06_48 AM_1764097630621.png';

interface Insight {
  id: string;
  title: string;
  description: string;
  icon: typeof BarChart3Icon;
  iconBg: string;
  iconColor: string;
  mockupImage?: string;
}

const insights: Insight[] = [
  {
    id: 'analytics',
    title: 'Smart Analytics',
    description: 'Dig deeper into every response and metric to make smarter decisions with confidence.',
    icon: BarChart3Icon,
    iconBg: 'bg-evalia-teal/10',
    iconColor: 'text-evalia-teal',
    mockupImage: dashboardAnalytics,
  },
  {
    id: 'respondents',
    title: 'Respondent Tracking',
    description: 'Monitor who responded and when with complete visibility into your survey responses.',
    icon: Users2Icon,
    iconBg: 'bg-evalia-mint/10',
    iconColor: 'text-evalia-mint',
    mockupImage: dashboardRespondents,
  },
  {
    id: 'scoring',
    title: 'AI Question Scoring',
    description: 'Get AI-powered quality scores to optimize your questions and improve response rates.',
    icon: TrendingUpIcon,
    iconBg: 'bg-evalia-teal-dark/10',
    iconColor: 'text-evalia-teal-dark',
    mockupImage: dashboardScoring,
  }
];

export function InsightsSection() {
  const [activeId, setActiveId] = useState('analytics');
  const activeInsight = insights.find(i => i.id === activeId) || insights[0];

  return (
    <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-evalia-navy mb-4 sm:mb-6 leading-tight">
            Understand what your customers want—and give it to them
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Evalia gives you the self-serve tools and real-time data to make products and experiences that win no matter what.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Vertical Card Stack */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-evalia-navy mb-3">
                Clearer insights
              </h3>
              <p className="text-gray-600">
                Where others guess, get the quantitative and qualitative answers to all your user questions.
              </p>
            </div>

            {/* Cards Stack */}
            <div className="space-y-4">
              {insights.map((insight) => {
                const IconComponent = insight.icon;
                const isActive = activeId === insight.id;

                return (
                  <button
                    key={insight.id}
                    onClick={() => setActiveId(insight.id)}
                    className={`w-full text-left p-6 rounded-2xl transition-all ${
                      isActive
                        ? 'border-2 border-evalia-teal bg-white shadow-md hover-elevate'
                        : 'border border-gray-200 bg-gray-50 hover:bg-gray-100 hover-elevate'
                    }`}
                    data-testid={`button-insight-${insight.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${insight.iconBg}`}>
                          <IconComponent className={`h-6 w-6 ${insight.iconColor}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-evalia-navy mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {insight.description}
                        </p>
                        {isActive && (
                          <div className="flex items-center gap-2 text-evalia-teal font-medium text-sm group">
                            Learn more
                            <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="hidden lg:block sticky top-20">
            <div className="relative" style={{ aspectRatio: '1 / 1' }}>
              {/* Offset teal square background */}
              <div 
                className="absolute rounded-3xl pointer-events-none transition-all duration-300"
                style={{
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                  zIndex: 0,
                  background: 'linear-gradient(135deg, #2F8FA5 0%, #37C0A3 100%)'
                }} 
              />
              
              {/* Dashboard mockup card - White card inset to show teal square */}
              <div 
                className="absolute rounded-3xl overflow-hidden shadow-2xl bg-white transition-all duration-300" 
                style={{
                  top: '0',
                  left: '0',
                  right: '40px',
                  bottom: '40px',
                  zIndex: 10
                }}
                data-testid={`mockup-${activeId}`}
              >
                {activeInsight.mockupImage ? (
                  <img 
                    src={activeInsight.mockupImage} 
                    alt={activeInsight.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <div className="text-6xl mb-2">📊</div>
                      </div>
                      <p className="text-gray-600 font-medium">
                        Dashboard mockup for {activeInsight.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Add mockupImage to display
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
