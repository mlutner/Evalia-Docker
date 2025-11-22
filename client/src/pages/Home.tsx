import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side Content */}
          <div className="space-y-8">
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{color: '#071A32'}}>
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
                className="bg-yellow-300 hover:bg-yellow-400 text-black font-semibold px-8 py-6 text-base"
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
