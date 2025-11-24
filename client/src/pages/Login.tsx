import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import trainingFeedbackIllustration from "@assets/training-feedback-illustration.png";
import evaliaLogoWhite from "@assets/evalia-logo-white.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left side - Warmer backdrop with white logo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-amber-500/40 via-orange-400/30 to-evalia-teal-600">
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle warm background blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300/15 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-evalia-mint/15 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center">
          <img src={evaliaLogoWhite} alt="Evalia" className="h-24 w-auto mx-auto mb-12" />
          <img
            src={trainingFeedbackIllustration}
            alt="Training feedback illustration"
            className="w-full h-auto max-w-2xl object-contain"
          />
        </div>
      </div>
      {/* Right side - Login */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-12 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and title */}
          <div className="mb-12">
            <div className="mb-8">
              <img src={evaliaLogoWhite} alt="Evalia" className="h-12" />
            </div>

            <h1 className="text-4xl font-bold mb-3">
              Create engaging training surveys
            </h1>
            <p className="text-lg text-muted-foreground">
              Design and share surveys to gather valuable feedback from your training sessions
            </p>
          </div>

          {/* Auth card */}
          <Card>
            <CardHeader>
              <CardTitle>Get started</CardTitle>
              <CardDescription>
                Sign in with Google or email to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogin}
                className="w-full"
                size="lg"
                data-testid="button-sign-in"
              >
                Sign in
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                You'll be able to choose Google, Email, or other sign-in options
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
