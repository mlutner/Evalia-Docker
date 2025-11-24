import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { FeatureCard } from '@/components/FeatureCard';
import { ArrowRightIcon, CheckCircle2Icon, Wand2, Share2, BarChart3 } from 'lucide-react';
import evaliaLogo from '@assets/evalia-logo.png';

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/dashboard');
    }
  }, [user, isLoading, setLocation]);

  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />

      {/* Social Proof Section */}
      <section className="py-24 bg-gradient-to-b from-white via-evalia-teal-50/30 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-3xl lg:text-4xl font-bold text-evalia-navy mb-12" data-testid="text-trusted-by">
            Loved by L&D professionals worldwide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="group hover-elevate transition-all">
              <div className="bg-gradient-to-br from-white to-evalia-teal-50/20 border border-gray-200 hover:border-evalia-teal-300 rounded-xl p-8 min-h-32 flex flex-col items-center justify-center text-center transition-all">
                <p className="text-gray-800 font-bold text-base leading-relaxed group-hover:text-evalia-navy transition-colors">Learning & Development Teams</p>
              </div>
            </div>
            <div className="group hover-elevate transition-all">
              <div className="bg-gradient-to-br from-white to-evalia-mint/10 border border-gray-200 hover:border-evalia-teal-300 rounded-xl p-8 min-h-32 flex flex-col items-center justify-center text-center transition-all">
                <p className="text-gray-800 font-bold text-base leading-relaxed group-hover:text-evalia-navy transition-colors">Corporate Trainers</p>
              </div>
            </div>
            <div className="group hover-elevate transition-all">
              <div className="bg-gradient-to-br from-white to-evalia-teal-50/20 border border-gray-200 hover:border-evalia-teal-300 rounded-xl p-8 min-h-32 flex flex-col items-center justify-center text-center transition-all">
                <p className="text-gray-800 font-bold text-base leading-relaxed group-hover:text-evalia-navy transition-colors">HR Professionals</p>
              </div>
            </div>
            <div className="group hover-elevate transition-all">
              <div className="bg-gradient-to-br from-white to-evalia-mint/10 border border-gray-200 hover:border-evalia-teal-300 rounded-xl p-8 min-h-32 flex flex-col items-center justify-center text-center transition-all">
                <p className="text-gray-800 font-bold text-base leading-relaxed group-hover:text-evalia-navy transition-colors">Training Facilitators</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 md:py-40 bg-evalia-teal-50 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Blob 1 - Top left */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-evalia-teal-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          
          {/* Blob 2 - Bottom right */}
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-evalia-mint/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-evalia-navy mb-6 leading-tight" data-testid="text-how-it-works">
              Create better training feedback in three steps
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              From creation to insights, Evalia makes the entire process
              seamless and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-16 max-w-6xl mx-auto relative">
            {/* Connectors for desktop - positioned to align with icons */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-evalia-teal-200 via-evalia-teal-300 to-evalia-teal-200 pointer-events-none z-0" style={{ maxWidth: '90%', marginLeft: '5%' }}></div>
            {/* Step 1 */}
            <div className="relative hover-elevate transition-all z-10">
              <div className="flex flex-col items-center mb-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-evalia-teal-500 to-evalia-teal-600 flex items-center justify-center shadow-lg">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-evalia-teal-100/40 mt-3">01</div>
              </div>
              <h3 className="text-2xl font-bold text-evalia-navy mb-3 text-center" data-testid="text-step-1-title">
                Create with AI
              </h3>
              <p className="text-gray-600 leading-relaxed text-base text-center">
                Upload your training materials or describe your session. Our AI
                generates relevant survey questions instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative hover-elevate transition-all z-10">
              <div className="flex flex-col items-center mb-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-evalia-teal-600 to-evalia-mint flex items-center justify-center shadow-lg">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-evalia-teal-100/40 mt-3">02</div>
              </div>
              <h3 className="text-2xl font-bold text-evalia-navy mb-3 text-center" data-testid="text-step-2-title">
                Share & Collect
              </h3>
              <p className="text-gray-600 leading-relaxed text-base text-center">
                Send your survey via link, email, or QR code. Mobile-friendly
                design ensures high response rates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative hover-elevate transition-all z-10">
              <div className="flex flex-col items-center mb-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-evalia-mint to-evalia-teal-400 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-evalia-teal-100/40 mt-3">03</div>
              </div>
              <h3 className="text-2xl font-bold text-evalia-navy mb-3 text-center" data-testid="text-step-3-title">
                Analyze & Improve
              </h3>
              <p className="text-gray-600 leading-relaxed text-base text-center">
                Get instant insights with beautiful visualizations. Identify
                what works and what needs improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-evalia-navy mb-6 leading-tight" data-testid="text-features-heading">
              Everything you need for better training
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powerful features that help you create, distribute, and analyze
              training feedback effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard accentColor="bg-evalia-teal-500" title="AI-Powered Creation" description="Generate survey questions instantly with AI. Upload documents, paste text, or describe your training topic." testId="card-feature-ai" />
            <FeatureCard accentColor="bg-evalia-teal-600" title="Instant Analytics" description="Get real-time insights on survey responses with beautiful visualizations and detailed reports." testId="card-feature-analytics" />
            <FeatureCard accentColor="bg-evalia-mint" title="Fast & Simple" description="Create, publish, and share surveys in minutes. No training needed. Mobile-friendly for all respondents." testId="card-feature-simple" />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-32 md:py-40 bg-gradient-to-br from-evalia-teal-600 to-evalia-teal-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight" data-testid="text-cta-heading">
            Ready to improve your training?
          </h2>
          <p className="text-lg lg:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed" data-testid="text-cta-description">
            Join thousands of trainers who are creating better learning
            experiences with Evalia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={handleGetStarted} className="bg-white text-evalia-teal-600 px-10 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all hover:shadow-xl flex items-center justify-center space-x-2 shadow-lg" data-testid="button-get-started-cta">
              <span>Get started free</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-10 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors" data-testid="button-schedule-demo">
              Schedule a demo
            </button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/90 text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="w-5 h-5 text-evalia-yellow" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="w-5 h-5 text-evalia-yellow" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="w-5 h-5 text-evalia-yellow" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-evalia-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <img src={evaliaLogo} alt="Evalia" className="h-8 w-auto mb-4" data-testid="img-footer-logo" />
              <p className="text-gray-400 text-sm leading-relaxed">
                Better training feedback for better learning outcomes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Templates
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2024 Evalia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
