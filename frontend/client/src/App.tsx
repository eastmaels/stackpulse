import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StacksProvider } from "@/context/stacks-context";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import RoleSelectionPage from "@/pages/role-selection";
import CreatorProjects from "@/pages/creator/projects";
import CreatorQuests from "@/pages/creator/quests";
import ParticipantDashboard from "@/pages/participant/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/role-selection" component={RoleSelectionPage} />
      
      {/* Creator Routes */}
      <Route path="/creator/projects" component={CreatorProjects} />
      <Route path="/creator/quests" component={CreatorQuests} />
      
      {/* Participant Routes */}
      <Route path="/participant/dashboard" component={ParticipantDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <StacksProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </StacksProvider>
  );
}

export default App;
