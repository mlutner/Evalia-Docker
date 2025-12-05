import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateChecker } from "@/hooks/useUpdateChecker";
import UpdateNotification from "@/components/UpdateNotification";
import OnboardingTour from "@/components/OnboardingTour";
import { AppLayout } from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import DashboardPage from "@/pages/DashboardPage";
import SurveysPage from "@/pages/SurveysPage";
import TemplatesPage from "@/pages/TemplatesPage";
import AiAssistPage from "@/pages/AiAssistPage";
import AiSurveyGenerator from "@/pages/AiSurveyGenerator";
import SettingsPage from "@/pages/SettingsPage";
// Legacy wizard builder moved to src/legacy/builder/Builder.tsx
// Now using SurveyBuilderV2 (3-panel layout) for all builder routes
import SurveyBuilderV2 from "@/pages/SurveyBuilderV2";
import DesignV2 from "@/pages/DesignV2";
import PreviewV2 from "@/pages/PreviewV2";
import SurveyView from "@/pages/SurveyView";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AnalyticsListPage from "@/pages/AnalyticsListPage";
import HelpPage from "@/pages/HelpPage";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import DevInspector from "@/pages/DevInspector";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [isLoading, user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AppLayout><Component /></AppLayout>;
}

function Router() {
  const isDev = import.meta.env.DEV;
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/survey/:id" component={SurveyView} />
      <Route path="/" component={Home} />

      {/* Protected routes */}
      <Route path="/account">
        {() => <ProtectedRoute component={Account} />}
      </Route>
      <Route path="/help">
        {() => <ProtectedRoute component={HelpPage} />}
      </Route>
      {/* 3-Panel Builder (V2) - Primary builder */}
      <Route path="/builder/:id">
        {() => <ProtectedRoute component={SurveyBuilderV2} />}
      </Route>
      <Route path="/builder">
        {() => <ProtectedRoute component={SurveyBuilderV2} />}
      </Route>
      
      {/* Legacy builder routes - redirect to V2 */}
      <Route path="/builder-v2/:id">
        {() => <ProtectedRoute component={SurveyBuilderV2} />}
      </Route>
      <Route path="/builder-v2">
        {() => <ProtectedRoute component={SurveyBuilderV2} />}
      </Route>
      <Route path="/design-v2/:id">
        {() => <ProtectedRoute component={DesignV2} />}
      </Route>
      <Route path="/preview-v2/:id">
        {() => <ProtectedRoute component={PreviewV2} />}
      </Route>
      
      <Route path="/analytics/:id">
        {() => <ProtectedRoute component={AnalyticsPage} />}
      </Route>
      <Route path="/analytics">
        {() => <ProtectedRoute component={AnalyticsListPage} />}
      </Route>

      {/* Main app routes with sidebar */}
      {/* Dashboard redirects to Surveys (unified home) */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={SurveysPage} />}
      </Route>
      <Route path="/surveys">
        {() => <ProtectedRoute component={SurveysPage} />}
      </Route>
      <Route path="/templates">
        {() => <ProtectedRoute component={TemplatesPage} />}
      </Route>
      <Route path="/ai-assist">
        {() => <ProtectedRoute component={AiAssistPage} />}
      </Route>
      <Route path="/ai-generate">
        {() => <ProtectedRoute component={AiSurveyGenerator} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>

      {isDev && (
        <Route path="/dev/inspector">
          {() => <ProtectedRoute component={DevInspector} />}
        </Route>
      )}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { updateAvailable, dismissUpdate, reloadApp } = useUpdateChecker();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UpdateNotification
          visible={updateAvailable}
          onDismiss={dismissUpdate}
          onReload={reloadApp}
        />
        <OnboardingTour />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
