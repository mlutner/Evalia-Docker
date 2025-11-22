import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

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
          {/* Left Side Content */}
          <div className="space-y-8">
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="md:text-6xl font-bold text-[70px]" style={{color: '#071A32'}}>
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

          {/* Right Side - Image Placeholder */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <img
                src="/attached_assets/Heading_1763750607423.png"
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
