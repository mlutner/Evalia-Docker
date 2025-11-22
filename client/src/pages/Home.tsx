import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

import surveyImage from "@assets/image_1763774897410.png";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full">
              <img
                src={surveyImage}
                alt="Survey illustration"
                className="w-full h-auto object-contain scale-125"
              />
            </div>
          </div>

          {/* Right Side Content */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="md:text-6xl font-bold text-[69px]" style={{color: '#071A32'}}>
                Collect training feedback that actually improves training
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Evalia gives trainers ready-made templates, AI-powered question creation, and instant reporting – so you can design better sessions and measure what matters.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/login")}
                className="hover:bg-yellow-400 text-black font-semibold pt-[15px] pb-[15px] pl-[45px] pr-[45px] text-[19px] bg-[#abdd3a]"
                data-testid="button-get-started"
              >
                Get started
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setLocation("/login")}
                className="px-8 py-6 text-base font-semibold"
                data-testid="button-browse-templates"
              >
                Browse templates
              </Button>
            </div>

            {/* Trust Statement */}
            <p className="text-sm text-muted-foreground">
              Trusted by trainers, facilitators, HR teams, and L&D professionals.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
