import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import trainerImage from "@assets/ChatGPT Image Nov 6, 2025, 03_45_09 PM_1762472718165.png";
import evaliaLogo from "@assets/Heading (300 x 50 px) (1000 x 250 px) (2)_1762359727994.png";

import ChatGPT_Image_Nov_21__2025__12_41_07_PM from "@assets/ChatGPT Image Nov 21, 2025, 12_41_07 PM.png";

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
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={ChatGPT_Image_Nov_21__2025__12_41_07_PM}
          alt="Professional trainer"
          className="w-full h-full object-cover object-center ml-[40px] mr-[40px] mt-[20px] mb-[20px] pl-[20px] pr-[20px] pt-[20px] pb-[20px]"
        />
      </div>
      {/* Right side - Login */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-12 lg:px-24 bg-background">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and title */}
          <div className="mb-12">
            <div className="mb-8">
              <img src={evaliaLogo} alt="Evalia" className="h-16" />
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
