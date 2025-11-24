import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Palette, Bell, Shield, HelpCircle, Mail, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Account() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const typedUser = user as any;
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      resendApiKey: "",
    },
  });

  const { data: emailSettings } = useQuery({
    queryKey: ["/api/user/email-settings"],
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (data: { resendApiKey: string }) => {
      return apiRequest("PATCH", "/api/user/email-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/email-settings"] });
      toast({
        title: "Success",
        description: "Email settings saved successfully",
      });
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save email settings",
        variant: "destructive",
      });
    },
  });

  const apiKeyValue = watch("resendApiKey");
  const hasApiKey = emailSettings?.hasResendApiKey || false;
  const isConnected = hasApiKey || apiKeyValue.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header showActions={false} />
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Account Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your account and customize your survey experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base mt-1" data-testid="text-user-email">
                  {typedUser?.email || 'Not available'}
                </p>
              </div>
              {(typedUser?.firstName || typedUser?.lastName) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-base mt-1">
                    {`${typedUser.firstName || ''} ${typedUser.lastName || ''}`.trim()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Configure your email service for sending survey invitations</CardDescription>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasApiKey && (
                <div className="bg-secondary dark:bg-secondary border border-border dark:border-border rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-primary-teal dark:text-icon-teal flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-neutral-text-primary dark:text-neutral-surface">
                      <p className="font-medium mb-2">How to Set Up Resend Email Service</p>
                      <ol className="space-y-2 list-decimal list-inside">
                        <li>Visit <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:no-underline">resend.com</a></li>
                        <li>Click "Sign Up" and create your free account</li>
                        <li>Go to "API Keys" in your dashboard</li>
                        <li>Click "Create API Key" and give it a name (e.g., "Evalia")</li>
                        <li>Copy the API key (starts with "re_")</li>
                        <li>Paste it below and click "Save"</li>
                      </ol>
                      <p className="text-xs mt-3 opacity-75">Free tier includes 100 emails per day - perfect for testing!</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit((data) => updateEmailMutation.mutate(data))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resend-api-key">Resend API Key</Label>
                  <div className="relative">
                    <Input
                      id="resend-api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                      {...register("resendApiKey")}
                      data-testid="input-resend-api-key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      data-testid="button-toggle-api-key-visibility"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored securely and never shared. Only used to send survey invitations on your behalf.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={updateEmailMutation.isPending || apiKeyValue.length === 0}
                  data-testid="button-save-email-settings"
                >
                  {updateEmailMutation.isPending ? "Saving..." : "Save Email Settings"}
                </Button>

                {hasApiKey && !apiKeyValue && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ✓ Resend API key is configured. Survey invitations will be sent automatically.
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Branding Section - Coming Soon */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Survey Branding</CardTitle>
                  <CardDescription>Customize the look and feel of your surveys</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Customize colors, logos, and branding for your surveys
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications - Coming Soon */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about new survey responses
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security - Coming Soon */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Security & Privacy</CardTitle>
                  <CardDescription>Manage your security settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication and privacy controls
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help & Documentation */}
          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Help & Documentation</CardTitle>
                  <CardDescription>Learn how to use Evalia</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access comprehensive guides on surveys, respondent management, analytics, and more.
              </p>
              <Button onClick={() => setLocation("/help")} data-testid="button-help-docs">
                Browse Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
