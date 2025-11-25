import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface CaseStudy {
  id: string;
  tab: string;
  role: string;
  headline: string;
  description: string;
  quote: string;
  author: string;
  title: string;
  company: string;
  imagePlaceholderId: string;
}

export function CaseStudiesSection() {
  const caseStudies: CaseStudy[] = [
    {
      id: 'learning',
      tab: 'Measure effectiveness',
      role: 'L&D Teams',
      headline: 'Understand training impact with real data insights.',
      description: 'Capture feedback immediately after training sessions. Our AI analyzes responses to show what resonated and what needs improvement.',
      quote: 'We went from guessing at training effectiveness to having clear metrics. Evalia helped us prove ROI to leadership.',
      author: 'Sarah Chen',
      title: 'Training Manager',
      company: 'TechCorp Learning',
      imagePlaceholderId: 'case-learning',
    },
    {
      id: 'hr',
      tab: 'Engage your workforce',
      role: 'HR Teams',
      headline: 'Build better employee experiences through listening.',
      description: 'Collect pulse feedback continuously. Get instant insights on engagement, satisfaction, and areas for improvement across your organization.',
      quote: 'Our employee engagement scores improved 34% after using Evalia to regularly survey staff and act on their feedback.',
      author: 'Michael Torres',
      title: 'Head of People Operations',
      company: 'NextGen Corp',
      imagePlaceholderId: 'case-hr',
    },
    {
      id: 'sales',
      tab: 'Close faster with insights',
      role: 'Sales Teams',
      headline: 'Understand customer needs to accelerate deals.',
      description: 'Quick surveys help identify buyer pain points and objections. Use real feedback to refine pitches and build customer relationships.',
      quote: 'By understanding what matters most to prospects, we shortened sales cycles and increased win rates significantly.',
      author: 'Jennifer Walsh',
      title: 'VP of Sales',
      company: 'Growth Innovations',
      imagePlaceholderId: 'case-sales',
    },
    {
      id: 'product',
      tab: 'Ship smarter features',
      role: 'Product Teams',
      headline: 'Validate ideas before you build them.',
      description: 'Survey users on feature ideas and improvements. Get quantified feedback that informs your roadmap and reduces development waste.',
      quote: 'Evalia surveys helped us validate our top 3 features before launch. We avoided building the wrong thing.',
      author: 'David Kim',
      title: 'Senior Product Manager',
      company: 'Digital Ventures',
      imagePlaceholderId: 'case-product',
    },
  ];

  const [activeCase, setActiveCase] = useState(0);
  const currentCase = caseStudies[activeCase];

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-14">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Win together
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            See how teams across your organization use Evalia to make smarter decisions. From learning and development to sales and product, get better insights.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {caseStudies.map((caseStudy, index) => (
            <button
              key={caseStudy.id}
              onClick={() => setActiveCase(index)}
              className={`px-5 py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeCase === index
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              data-testid={`button-case-study-${caseStudy.id}`}
            >
              {caseStudy.tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Role badge */}
            <div className="inline-block px-4 py-2 bg-slate-100 rounded-full">
              <span className="text-sm font-semibold text-slate-700">{currentCase.role}</span>
            </div>

            {/* Main headline */}
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {currentCase.headline}
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {currentCase.description}
              </p>
            </div>

            {/* Learn more link */}
            <div className="flex items-center gap-2 text-slate-900 font-semibold hover:gap-3 transition-all cursor-pointer group">
              <span>Learn more</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Testimonial */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-base text-slate-700 italic mb-4 leading-relaxed">
                "{currentCase.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{currentCase.author}</p>
                  <p className="text-xs text-slate-600">
                    {currentCase.title} at {currentCase.company}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Container */}
          <div className="relative" style={{ aspectRatio: '1' }}>
            {/* Offset gradient square behind */}
            <div className="absolute rounded-3xl bg-gradient-to-br from-teal-400 to-blue-500" style={{
              width: '100%',
              height: '100%',
              transform: 'translate(32px, 32px)',
              zIndex: -1
            }} />
            
            {/* Main image container */}
            <div
              className="relative w-full h-full rounded-3xl overflow-hidden bg-blue-50 flex items-center justify-center shadow-lg"
              data-testid={`image-container-${currentCase.id}`}
            >
              <div className="text-center space-y-3">
                <div className="text-6xl">📸</div>
                <p className="text-slate-500 font-medium text-sm">
                  Case study image<br />{currentCase.tab.toLowerCase()}
                </p>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex gap-2 justify-center mt-8">
              {caseStudies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCase(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeCase === index
                      ? 'bg-slate-900 w-6'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  data-testid={`dot-case-study-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
