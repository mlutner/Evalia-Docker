import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Palette, Bell, Shield, HelpCircle } from "lucide-react";

export default function Account() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const typedUser = user as any;

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
