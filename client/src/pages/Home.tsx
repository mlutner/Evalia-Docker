import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, BarChart3, Zap } from "lucide-react";
import evaliaLogo from "@assets/Heading (300 x 50 px) (1000 x 250 px) (2)_1762359727994.png";

import ChatGPT_Image_Nov_21__2025__06_18_52_PM from "@assets/ChatGPT Image Nov 21, 2025, 06_18_52 PM.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <main className="container mx-auto px-6 flex items-start justify-center -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 w-full max-w-7xl">
          {/* Left Side Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-bold text-5xl md:text-6xl lg:text-[72px] leading-tight text-foreground dark:text-white">
                Collect training feedback that actually improves training
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground dark:text-slate-300 leading-relaxed max-w-2xl">
                Evalia gives trainers ready-made templates, AI-powered question creation, and instant reporting – so you can design better sessions and measure what matters.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => setShowLoginModal(true)}
                data-testid="button-get-started"
              >
                Get started free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowLoginModal(true)}
                data-testid="button-browse-templates"
              >
                Browse templates
              </Button>
            </div>

            {/* Trust Statement */}
            <p className="text-sm md:text-base text-muted-foreground dark:text-slate-400">
              Trusted by trainers, facilitators, HR teams, and L&D professionals worldwide.
            </p>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:flex items-center justify-center h-full">
            <div className="relative w-full max-w-2xl">
              <img
                src={ChatGPT_Image_Nov_21__2025__06_18_52_PM}
                alt="Survey illustration"
                className="w-full h-auto object-contain dark:opacity-90"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="space-y-4 p-6 rounded-lg bg-card border border-border dark:bg-slate-800/50 dark:border-slate-700">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: '#071a32' }}>
              <Sparkles className="w-6 h-6" style={{ color: '#ccff00' }} />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white">AI-Powered Creation</h3>
            <p className="text-muted-foreground dark:text-slate-300">
              Generate survey questions instantly with AI. Upload documents, paste text, or describe your training topic.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4 p-6 rounded-lg bg-card border border-border dark:bg-slate-800/50 dark:border-slate-700">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: '#071a32' }}>
              <BarChart3 className="w-6 h-6" style={{ color: '#ccff00' }} />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white">Instant Analytics</h3>
            <p className="text-muted-foreground dark:text-slate-300">
              Get real-time insights on survey responses with beautiful visualizations and detailed reports.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4 p-6 rounded-lg bg-card border border-border dark:bg-slate-800/50 dark:border-slate-700">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: '#071a32' }}>
              <Zap className="w-6 h-6" style={{ color: '#ccff00' }} />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white">Fast & Simple</h3>
            <p className="text-muted-foreground dark:text-slate-300">
              Create, publish, and share surveys in minutes. No training needed. Mobile-friendly for all respondents.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 max-w-7xl text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white">
            Ready to improve your training?
          </h2>
          <p className="text-lg text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto">
            Start creating surveys with AI-powered suggestions and get actionable feedback from your trainees today.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setShowLoginModal(true)}
          data-testid="button-final-cta"
        >
          Get started free
        </Button>
      </section>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-4">
            <div className="flex justify-center mb-2">
              <img src={evaliaLogo} alt="Evalia" className="h-12" />
            </div>
            <DialogTitle>Get started with Evalia</DialogTitle>
            <DialogDescription>
              Sign in to create and manage your training surveys
            </DialogDescription>
          </DialogHeader>
          <Card className="border-0 shadow-none">
            <CardContent className="pt-6">
              <Button
                onClick={handleLogin}
                className="w-full"
                size="lg"
                data-testid="button-modal-sign-in"
              >
                Sign in
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                You'll be able to choose Google, Email, or other sign-in options
              </p>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border dark:border-slate-700 mt-20">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <p className="text-sm text-muted-foreground dark:text-slate-400 text-center">
            © 2025 Evalia. All rights reserved. Built for trainers, by trainers.
          </p>
        </div>
      </footer>
    </div>
  );
}
