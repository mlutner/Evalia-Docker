import { useState } from 'react';
import { BarChart3Icon, Users2Icon, TrendingUpIcon, ArrowRightIcon } from 'lucide-react';

// Import dashboard mockup images here
// Example: import dashboardImage1 from '@assets/dashboard-mockup-1.png';
// Then add to insights array below

interface Insight {
  id: string;
  title: string;
  description: string;
  icon: typeof BarChart3Icon;
  iconBg: string;
  iconColor: string;
  mockupTitle: string;
  mockupImage?: string;
  stats: {
    label: string;
    value: string;
    change: string;
  }[];
}

const insights: Insight[] = [
  {
    id: 'analytics',
    title: 'Smart Analytics',
    description: 'Dig deeper into every response and metric to make smarter decisions with confidence.',
    icon: BarChart3Icon,
    iconBg: 'bg-evalia-teal/10',
    iconColor: 'text-evalia-teal',
    mockupTitle: 'Response Analytics',
    // mockupImage: dashboardImage1, // Add image here
    stats: [
      { label: 'Total Responses', value: '12.3k', change: '↑ 24%' },
      { label: 'Avg Completion', value: '87%', change: '↑ 12%' },
      { label: 'Response Time', value: '3.2m', change: '↓ 18%' }
    ]
  },
  {
    id: 'respondents',
    title: 'Respondent Tracking',
    description: 'Monitor who responded and when with complete visibility into your survey responses.',
    icon: Users2Icon,
    iconBg: 'bg-evalia-mint/10',
    iconColor: 'text-evalia-mint',
    mockupTitle: 'Response Tracking',
    // mockupImage: dashboardImage2, // Add image here
    stats: [
      { label: 'Total Respondents', value: '8.7k', change: '↑ 32%' },
      { label: 'Response Rate', value: '76%', change: '↑ 18%' },
      { label: 'Avg Response Time', value: '4.1m', change: '↓ 8%' }
    ]
  },
  {
    id: 'scoring',
    title: 'AI Question Scoring',
    description: 'Get AI-powered quality scores to optimize your questions and improve response rates.',
    icon: TrendingUpIcon,
    iconBg: 'bg-evalia-teal-dark/10',
    iconColor: 'text-evalia-teal-dark',
    mockupTitle: 'Question Quality Score',
    // mockupImage: dashboardImage3, // Add image here
    stats: [
      { label: 'Avg Score', value: '8.9/10', change: '↑ 14%' },
      { label: 'Questions Reviewed', value: '156', change: '↑ 28%' },
      { label: 'Improvement Rate', value: '62%', change: '↑ 22%' }
    ]
  }
];

export function InsightsSection() {
  const [activeId, setActiveId] = useState('analytics');
  const activeInsight = insights.find(i => i.id === activeId) || insights[0];
  const ActiveIcon = activeInsight.icon;

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Cards with tabs */}
          <div className="space-y-5">
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-evalia-navy mb-3">
                Clearer insights
              </h3>
              <p className="text-gray-600">
                Where others guess, get the quantitative and qualitative answers to all your user questions.
              </p>
            </div>

            {/* Tab buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {insights.map((insight) => (
                <button
                  key={insight.id}
                  onClick={() => setActiveId(insight.id)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    activeId === insight.id
                      ? 'bg-evalia-teal text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`button-insight-${insight.id}`}
                >
                  {insight.title}
                </button>
              ))}
            </div>

            {/* Active card: Featured */}
            <div className="border-2 border-evalia-teal rounded-2xl p-6 bg-white hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${activeInsight.iconBg}`}>
                    <ActiveIcon className={`h-6 w-6 ${activeInsight.iconColor}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-evalia-navy mb-2">
                    {activeInsight.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {activeInsight.description}
                  </p>
                  <button className="text-evalia-teal font-medium text-sm hover:text-evalia-teal-dark flex items-center gap-2 group" data-testid="button-learn-more">
                    Learn more
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Other cards (non-featured) */}
            {insights.map((insight) => 
              insight.id !== activeId ? (
                <div key={insight.id} className="rounded-2xl p-6 bg-gray-50 hover-elevate transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${insight.iconBg}`}>
                        <insight.icon className={`h-6 w-6 ${insight.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-evalia-navy mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>

          {/* Right: Dashboard Mockup Slider */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Offset square background */}
              <div 
                className="absolute rounded-3xl bg-gradient-to-br from-evalia-teal-500 to-evalia-teal-dark pointer-events-none transition-all duration-300"
                style={{
                  width: '100%',
                  height: '100%',
                  bottom: '-30px',
                  right: '-30px',
                  zIndex: 0
                }} 
              />
              
              {/* Dashboard mockup card */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl bg-white transition-all duration-300" data-testid={`mockup-${activeId}`}>
                {/* If custom image is provided, show it */}
                {activeInsight.mockupImage ? (
                  <img 
                    src={activeInsight.mockupImage} 
                    alt={activeInsight.mockupTitle}
                    className="w-full h-auto"
                  />
                ) : (
                  <>
                    {/* Dashboard header */}
                    <div className="bg-gradient-to-r from-evalia-teal-dark to-evalia-teal-600 px-8 py-6 text-white">
                      <h3 className="text-xl font-semibold mb-4">{activeInsight.mockupTitle}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {activeInsight.stats.map((stat, idx) => (
                          <div key={idx}>
                            <div className="text-sm opacity-90 mb-1">{stat.label}</div>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <div className="text-xs opacity-75 mt-1">{stat.change}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dashboard content */}
                    <div className="p-8">
                      <div className="space-y-6">
                        {/* Chart placeholder */}
                        <div className="h-40 bg-gray-50 rounded-lg border border-gray-200 flex items-end justify-end gap-2 p-4">
                          <div className="w-12 h-20 bg-evalia-mint rounded-md"></div>
                          <div className="w-12 h-32 bg-evalia-teal rounded-md"></div>
                          <div className="w-12 h-24 bg-evalia-teal-dark rounded-md"></div>
                          <div className="w-12 h-28 bg-evalia-mint rounded-md"></div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 mb-2">TOP INSIGHTS</div>
                            <div className="space-y-2 text-sm">
                              <div className="text-gray-700">Feature A: 94%</div>
                              <div className="text-gray-700">Feature B: 87%</div>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 mb-2">SCORE</div>
                            <div className="text-3xl font-bold text-evalia-teal">9.2/10</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
