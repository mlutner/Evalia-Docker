import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { FeatureCard } from '@/components/FeatureCard';
import { ArrowRightIcon, CheckCircle2Icon } from 'lucide-react';
import { SocialProofSection } from '@/components/home/SocialProofSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { Footer } from '@/components/home/Footer';

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
      <SocialProofSection />
      <HowItWorksSection />

      {/* Features section */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-evalia-navy mb-4 sm:mb-6 leading-tight" data-testid="text-features-heading">
              Everything you need for better training
            </h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              Powerful features that help you create, distribute, and analyze
              training feedback effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <FeatureCard accentColor="bg-evalia-teal-500" title="AI-Powered Creation" description="Generate survey questions instantly with AI. Upload documents, paste text, or describe your training topic." testId="card-feature-ai" />
            <FeatureCard accentColor="bg-evalia-teal-600" title="Instant Analytics" description="Get real-time insights on survey responses with beautiful visualizations and detailed reports." testId="card-feature-analytics" />
            <FeatureCard accentColor="bg-evalia-mint" title="Fast & Simple" description="Create, publish, and share surveys in minutes. No training needed. Mobile-friendly for all respondents." testId="card-feature-simple" />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-gradient-to-br from-evalia-teal-600 to-evalia-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight" data-testid="text-cta-heading">
            Ready to improve your training?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/90 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2" data-testid="text-cta-description">
            Join thousands of trainers who are creating better learning
            experiences with Evalia.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
            <button onClick={handleGetStarted} className="bg-white text-evalia-teal-600 px-6 sm:px-10 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-50 transition-all hover:shadow-xl flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base" data-testid="button-get-started-cta">
              <span>Get started free</span>
              <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <button className="border-2 border-white text-white px-6 sm:px-10 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-white/10 transition-colors text-sm sm:text-base" data-testid="button-schedule-demo">
              Schedule a demo
            </button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-8 text-white/90 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="w-4 sm:w-5 h-4 sm:h-5 text-evalia-yellow flex-shrink-0" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="w-4 sm:w-5 h-4 sm:h-5 text-evalia-yellow flex-shrink-0" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="w-4 sm:w-5 h-4 sm:h-5 text-evalia-yellow flex-shrink-0" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
