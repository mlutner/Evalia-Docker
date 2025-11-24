import { ArrowRightIcon } from 'lucide-react';
import heroIllustration from '@assets/hero-illustration.png';

export function Hero() {
  return (
    <section className="relative bg-evalia-teal-600 overflow-hidden pt-20">
      <div className="relative max-w-7xl mx-auto px-6 py-13">
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

          {/* Right illustration */}
          <div className="relative hidden lg:block">
            <img src={heroIllustration} alt="Training feedback and ratings illustration" className="w-full h-auto" data-testid="img-hero-illustration" />
          </div>
        </div>
      </div>
    </section>
  );
}
