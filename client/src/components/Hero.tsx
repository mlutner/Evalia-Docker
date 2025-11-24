import { ArrowRightIcon } from 'lucide-react';
import heroIllustration from '@assets/hero-feedback-illustration.png';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-evalia-teal-600 via-evalia-teal-500 to-evalia-teal-700 overflow-hidden pt-4">
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

        {/* Decorative dots */}
        <div className="absolute top-20 left-12 w-4 h-4 bg-evalia-yellow/60 rounded-full animate-float"></div>
        <div className="absolute top-40 right-24 w-3 h-3 bg-evalia-coral/50 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 right-10 w-2 h-2 bg-evalia-mint/70 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-evalia-teal-300/40 rounded-full animate-float animation-delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-40 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="text-white space-y-8">
            <div className="inline-block">
              <span className="text-sm font-medium tracking-wide uppercase bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                Training Feedback Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
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

            <p className="text-xl text-white/90 leading-relaxed max-w-xl">
              Give trainers ready-made templates, AI-powered question creation,
              and instant reporting — so you can design better sessions and
              measure what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button className="bg-white text-evalia-teal-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 shadow-lg" data-testid="button-get-started-hero">
                <span>Get started free</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors" data-testid="button-browse-templates-hero">
                Browse templates
              </button>
            </div>

            <p className="text-sm text-white/70 pt-2">
              Trusted by trainers, facilitators, HR teams, and L&D professionals
              worldwide.
            </p>
          </div>

          {/* Right illustration with background */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-evalia-teal-100/15 to-evalia-mint/10 rounded-full blur-3xl" style={{ transform: 'scale(0.7)' }}></div>
            <img src={heroIllustration} alt="Training feedback and ratings illustration" className="relative w-full h-auto" data-testid="img-hero-illustration" />
          </div>
        </div>
      </div>

      {/* Straight line divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white translate-y-1/2"></div>
    </section>
  );
}
