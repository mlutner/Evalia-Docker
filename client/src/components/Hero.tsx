import { ArrowRightIcon } from 'lucide-react';
import heroIllustration from '@assets/hero-feedback-illustration.png';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-evalia-teal-600 via-evalia-teal-500 to-evalia-teal-700 overflow-hidden -mt-20 pt-20">
      {/* Decorative blobs - background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blob 1 - Top right */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-evalia-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        
        {/* Blob 2 - Bottom left */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-evalia-mint/15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        
        {/* Blob 3 - Top left */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-evalia-yellow/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

        {/* Blob 4 - Middle right (subtle) */}
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-evalia-teal-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-3000"></div>

        {/* Decorative dots - subtle and spread throughout */}
        <div className="absolute top-8 left-8 w-2 h-2 bg-evalia-yellow/30 rounded-full animate-float"></div>
        <div className="absolute top-16 right-20 w-2.5 h-2.5 bg-evalia-coral/25 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-24 left-1/3 w-2 h-2 bg-evalia-teal-300/20 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-32 right-1/4 w-1.5 h-1.5 bg-evalia-mint/25 rounded-full animate-float animation-delay-3000"></div>
        
        <div className="absolute top-40 left-12 w-2 h-2 bg-evalia-yellow/20 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-48 right-1/3 w-2.5 h-2.5 bg-evalia-coral/20 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-56 left-1/4 w-2 h-2 bg-evalia-teal-300/25 rounded-full animate-float animation-delay-3000"></div>
        <div className="absolute top-64 right-12 w-1.5 h-1.5 bg-evalia-mint/20 rounded-full animate-float animation-delay-1000"></div>
        
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-evalia-yellow/15 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-3/4 right-1/4 w-2.5 h-2.5 bg-evalia-coral/15 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-evalia-teal-300/20 rounded-full animate-float animation-delay-3000"></div>
        <div className="absolute bottom-32 right-20 w-1.5 h-1.5 bg-evalia-mint/25 rounded-full animate-float animation-delay-2000"></div>
      </div>
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32 lg:py-40 z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-white space-y-6 sm:space-y-8">
            <div className="inline-block animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="text-xs sm:text-sm font-medium tracking-wide uppercase bg-white/20 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors">AI Training Feedback Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight" style={{ animationDelay: '0.2s' }}>
              Collect{' '}
              <span className="relative inline-block">
                <span className="relative z-10">training feedback</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-evalia-yellow opacity-40 -rotate-1 rounded-full"></span>
              </span>{' '}
              that actually{' '}
              <span className="relative inline-block">
                <span className="relative z-10">improves training</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-evalia-yellow opacity-40 rotate-1 rounded-full"></span>
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl" style={{ animationDelay: '0.3s' }}>Get ready-made templates, AI-generated questions, and instant insights so you can design better sessions and measure what actually matters.</p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6" style={{ animationDelay: '0.4s' }}>
              <button className="bg-white text-evalia-teal-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all hover:shadow-xl flex items-center justify-center space-x-2 shadow-lg" data-testid="button-get-started-hero">
                <span>Get started free</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors" data-testid="button-browse-templates-hero">
                Browse templates
              </button>
            </div>

            <p className="text-sm text-white/70 pt-4 max-w-md">
              ✓ No credit card required  ✓ Free 14-day trial  ✓ Cancel anytime
            </p>
          </div>

          {/* Right illustration with background */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-evalia-teal-100/15 to-evalia-mint/10 rounded-full blur-3xl" style={{ transform: 'scale(0.7)' }}></div>
            <img src={heroIllustration} alt="Training feedback and ratings illustration" className="relative w-full h-auto scale-110" data-testid="img-hero-illustration" />
          </div>
        </div>
      </div>
      {/* Straight line divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white translate-y-1/2"></div>
    </section>
  );
}
