import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { Logo } from '@/components/common/Logo';

export function ProtectedRoute() {
  const location = useLocation();
  const { user, accessToken, currentWorkspace, isAuthenticated, isLoading, setLoading } = useAuthStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (accessToken && currentWorkspace?.id) {
      connectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken, currentWorkspace?.id]);

  // Track elapsed time during loading to inform user if cloud backend is cold-starting
  useEffect(() => {
    if (!isLoading) {
      setElapsed(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsed((prev) => {
        // Auto-release after 10s if backend is taking too long
        if (prev >= 10) {
          clearInterval(timer);
          setLoading(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1822] px-4">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <Logo size="lg" />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0F9D78] border-t-transparent" />
          
          {elapsed < 3 ? (
            <p className="text-xs text-slate-400 font-medium">Securing session...</p>
          ) : (
            <div className="space-y-2 animate-fadeIn">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Waking up cloud server...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Free-tier hosting (Render) sleeps after inactivity and takes ~45s to boot.
              </p>
              <button
                type="button"
                onClick={() => setLoading(false)}
                className="mt-2 text-xs font-semibold text-[#0F9D78] hover:text-[#0B8063] underline cursor-pointer"
              >
                Skip waiting & go to Sign In →
              </button>
            </div>
          )}
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
