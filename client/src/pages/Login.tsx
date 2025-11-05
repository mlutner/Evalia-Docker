import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import trainerImage from "@assets/stock_images/confident_profession_89c4af22.jpg";
import evaliaLogo from "@assets/Heading (300 x 50 px) (1000 x 250 px) (2)_1762359727994.png";

const loginSchema = z.object({
  username: z.string().min(1, "Email address is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const endpoint = isRegister ? "/api/register" : "/api/login";
      const res = await apiRequest("POST", endpoint, data);
      return await res.json();
    },
    onSuccess: (userData) => {
      // Set the user data in cache immediately to avoid redirect loop
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: isRegister ? "Account created!" : "Welcome back!",
        description: isRegister ? "You can now create surveys" : "Successfully logged in",
      });
      
      // Small delay to ensure cache is updated
      setTimeout(() => {
        setLocation("/");
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: isRegister ? "Registration failed" : "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
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
      <div className="flex flex-col w-full lg:w-1/2 px-8 sm:px-12 lg:px-24 bg-background">
        <div className="w-full max-w-md mx-auto py-12">
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

          {/* Login form */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              {isRegister ? "Create account" : "Log in"}
            </h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter your email"
                          data-testid="input-username"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          data-testid="input-password"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isRegister && (
                  <div className="text-sm">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="link-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit"
                >
                  {loginMutation.isPending
                    ? isRegister
                      ? "Creating account..."
                      : "Logging in..."
                    : isRegister
                    ? "Create account"
                    : "Log in"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  {isRegister ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      form.reset();
                    }}
                    className="text-primary hover:underline font-medium"
                    data-testid="link-toggle-mode"
                  >
                    {isRegister ? "Log in" : "Sign up"}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
