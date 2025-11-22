import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

import surveyImage from "@assets/ChatGPT Image Nov 21, 2025, 05_34_39 PM_1763775306037.png";

import ChatGPT_Image_Nov_21__2025__05_52_04_PM from "@assets/ChatGPT Image Nov 21, 2025, 05_52_04 PM.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex flex-col">
      <Header />
      <main className="container mx-auto px-6 flex items-start justify-center -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full max-w-7xl">
          {/* Left Side Content */}
          <div className="space-y-6">
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="font-bold text-[84px]" style={{color: '#071A32', lineHeight: '1.0'}}>
                Collect training feedback that actually improves training
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Evalia gives trainers ready-made templates, AI-powered question creation, and instant reporting – so you can design better sessions and measure what matters.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 pt-2">
              <Button
                size="lg"
                onClick={() => setLocation("/login")}
                className="hover:bg-yellow-400 font-semibold pt-[18px] pb-[18px] pl-[48px] pr-[48px] text-xl h-auto rounded-lg bg-[#022643] text-[#ccff03]"
                data-testid="button-get-started"
              >
                Get started
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setLocation("/login")}
                className="px-10 py-[18px] text-lg font-semibold"
                data-testid="button-browse-templates"
              >
                Browse templates
              </Button>
            </div>

            {/* Trust Statement */}
            <p className="text-xl text-muted-foreground pt-4">
              Trusted by trainers, facilitators, HR teams, and L&D professionals.
            </p>
          </div>

          {/* Right Side - Image */}
          <div className="flex items-center justify-center h-full min-h-screen">
            <div className="relative w-full max-w-2xl scale-150">
              <img
                src={ChatGPT_Image_Nov_21__2025__05_52_04_PM}
                alt="Survey illustration"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
