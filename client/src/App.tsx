import { useEffect } from 'react';
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAuthStore } from './stores/authStore';
import { useLearningStore } from './stores/learningStore';

import LoginPage from './pages/LoginPage';
import LearningPage from './pages/LearningPage';
import LevelSelectPage from './pages/LevelSelectPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/not-found';

import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import { useState } from 'react';

function AuthenticatedApp() {
  const [activeSection, setActiveSection] = useState('learning');
  const { loadUserData } = useLearningStore();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  const renderContent = () => {
    switch (activeSection) {
      case 'learning':
        return <LearningPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return (
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        );
      default:
        return <LearningPage />;
    }
  };

  return (
    <div className="flex">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1 ml-64">
        {renderContent()}
      </main>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Switch>
      <Route path="/" component={AuthenticatedApp} />
      <Route path="/learning" component={AuthenticatedApp} />
      <Route path="/dashboard" component={AuthenticatedApp} />
      <Route path="/profile" component={AuthenticatedApp} />
      <Route path="/admin" component={AuthenticatedApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
