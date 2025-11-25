import { BarChart3Icon, Users2Icon, TrendingUpIcon, ArrowRightIcon } from 'lucide-react';

export function InsightsSection() {
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
          {/* Left: Cards */}
          <div className="space-y-5">
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-evalia-navy mb-3">
                Clearer insights
              </h3>
              <p className="text-gray-600">
                Where others guess, get the quantitative and qualitative answers to all your user questions.
              </p>
            </div>

            {/* Card 1: Featured */}
            <div className="border-2 border-evalia-teal rounded-2xl p-6 bg-white hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-evalia-teal/10">
                    <BarChart3Icon className="h-6 w-6 text-evalia-teal" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-evalia-navy mb-2">
                    Smart Analytics
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Dig deeper into every response and metric to make smarter decisions with confidence.
                  </p>
                  <button className="text-evalia-teal font-medium text-sm hover:text-evalia-teal-dark flex items-center gap-2 group" data-testid="button-learn-more-analytics">
                    Learn more
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl p-6 bg-gray-50 hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-evalia-mint/10">
                    <Users2Icon className="h-6 w-6 text-evalia-mint" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-evalia-navy mb-1">
                    Respondent Tracking
                  </h4>
                  <p className="text-sm text-gray-600">
                    Monitor who responded and when with complete visibility into your survey responses.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl p-6 bg-gray-50 hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-evalia-teal-dark/10">
                    <TrendingUpIcon className="h-6 w-6 text-evalia-teal-dark" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-evalia-navy mb-1">
                    AI Question Scoring
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get AI-powered quality scores to optimize your questions and improve response rates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Offset square background */}
              <div 
                className="absolute rounded-3xl bg-gradient-to-br from-evalia-teal-500 to-evalia-teal-dark pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                  bottom: '-30px',
                  right: '-30px',
                  zIndex: 0
                }} 
              />
              
              {/* Dashboard mockup card */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl bg-white">
                {/* Dashboard header */}
                <div className="bg-gradient-to-r from-evalia-teal-dark to-evalia-teal-600 px-8 py-6 text-white">
                  <h3 className="text-xl font-semibold mb-4">Response Analytics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm opacity-90 mb-1">Total Responses</div>
                      <div className="text-3xl font-bold">12.3k</div>
                      <div className="text-xs opacity-75 mt-1">↑ 24%</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-90 mb-1">Avg Completion</div>
                      <div className="text-3xl font-bold">87%</div>
                      <div className="text-xs opacity-75 mt-1">↑ 12%</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-90 mb-1">Response Time</div>
                      <div className="text-3xl font-bold">3.2m</div>
                      <div className="text-xs opacity-75 mt-1">↓ 18%</div>
                    </div>
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
                        <div className="text-xs font-semibold text-gray-500 mb-2">TOP QUESTIONS</div>
                        <div className="space-y-2 text-sm">
                          <div className="text-gray-700">Q1: Product fit</div>
                          <div className="text-gray-700">Q2: Usability</div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-2">SATISFACTION</div>
                        <div className="text-3xl font-bold text-evalia-teal">9.2/10</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
