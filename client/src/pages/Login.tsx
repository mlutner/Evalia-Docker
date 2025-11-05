import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import trainerImage from "@assets/stock_images/confident_profession_89c4af22.jpg";
import evaliaLogo from "@assets/Heading (300 x 50 px) (1000 x 250 px) (2)_1762359727994.png";

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={trainerImage}
          alt="Professional trainer"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Right side - Login form */}
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

          {/* Login section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Get started
            </h2>

            {/* Google login button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 mb-4 text-base font-medium"
              onClick={handleGoogleLogin}
              data-testid="button-google-login"
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure authentication powered by your Google account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
