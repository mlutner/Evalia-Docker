import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateChecker } from "@/hooks/useUpdateChecker";
import UpdateNotification from "@/components/UpdateNotification";
import { AppLayout } from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import DashboardPage from "@/pages/DashboardPage";
import SurveysPage from "@/pages/SurveysPage";
import RespondentsListPage from "@/pages/RespondentsListPage";
import TemplatesPage from "@/pages/TemplatesPage";
import ScoringPage from "@/pages/ScoringPage";
import AiAssistPage from "@/pages/AiAssistPage";
import SettingsPage from "@/pages/SettingsPage";
import Builder from "@/pages/Builder";
import SurveyView from "@/pages/SurveyView";
import AnalyticsPage from "@/pages/AnalyticsPage";
import RespondentsPage from "@/pages/RespondentsPage";
import HelpPage from "@/pages/HelpPage";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

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
      <Route path="/builder/:id">
        {() => <ProtectedRoute component={Builder} />}
      </Route>
      <Route path="/builder">
        {() => <ProtectedRoute component={Builder} />}
      </Route>
      <Route path="/analytics/:id">
        {() => <ProtectedRoute component={AnalyticsPage} />}
      </Route>
      <Route path="/respondents/:surveyId">
        {() => <ProtectedRoute component={RespondentsPage} />}
      </Route>

      {/* Main app routes with sidebar */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route path="/surveys">
        {() => <ProtectedRoute component={SurveysPage} />}
      </Route>
      <Route path="/respondents">
        {() => <ProtectedRoute component={RespondentsListPage} />}
      </Route>
      <Route path="/templates">
        {() => <ProtectedRoute component={TemplatesPage} />}
      </Route>
      <Route path="/scoring">
        {() => <ProtectedRoute component={ScoringPage} />}
      </Route>
      <Route path="/ai-assist">
        {() => <ProtectedRoute component={AiAssistPage} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>

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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
