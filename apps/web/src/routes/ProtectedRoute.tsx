import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { Logo } from '@/components/common/Logo';

export function ProtectedRoute() {
  const location = useLocation();
  const { user, accessToken, currentWorkspace, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (accessToken && currentWorkspace?.id) {
      connectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken, currentWorkspace?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1822]">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0F9D78] border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has no workspaces, route them to onboarding
  if (!currentWorkspace && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
