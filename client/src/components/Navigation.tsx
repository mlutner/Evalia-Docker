import { MenuIcon } from 'lucide-react';
import evaliaLogo from '@assets/evalia-logo.png';

export function Navigation() {
  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-evalia-teal-600/80 to-transparent backdrop-blur-md transition-all duration-300 hover:from-evalia-teal-600/90">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <img src={evaliaLogo} alt="Evalia" className="h-10 w-auto" data-testid="img-evalia-logo" />
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-white/90 hover:text-white transition-colors text-base font-medium">
                Features
              </a>
              <a href="#pricing" className="text-white/90 hover:text-white transition-colors text-base font-medium">
                Pricing
              </a>
              <a href="#about" className="text-white/90 hover:text-white transition-colors text-base font-medium">
                About
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4 gap-2">
            <button onClick={handleGetStarted} className="hidden md:block text-white/90 hover:text-white transition-colors text-base font-medium" data-testid="button-log-in">
              Log in
            </button>
            <button onClick={handleGetStarted} className="bg-white text-evalia-teal-600 px-6 py-2 rounded-full hover:bg-gray-50 transition-all hover:shadow-md font-semibold text-base shadow-sm" data-testid="button-start-trial">
              Start free trial
            </button>
            <button className="md:hidden text-white hover:text-white/80 transition-colors" data-testid="button-menu">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
