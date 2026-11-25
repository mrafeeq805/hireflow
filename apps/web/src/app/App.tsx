import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { apiClient } from '@/lib/api';
import { AppRoutes } from '@/routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

export function App() {
  const { setAuth, setLoading } = useAuthStore();
  const { theme } = useThemeStore();

  // Sync theme class to document root element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Bootstrap user session from secure HttpOnly cookie on page load
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      // 1. Fast path: If the user has never signed in or has explicitly logged out,
      // skip waiting for sleeping cloud backends (Render cold start can take 50s)
      const hasSessionHint = localStorage.getItem('hireflow_session_active') === '1';

      if (!hasSessionHint) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      // 2. Bound the bootstrap request with an AbortController timeout (12s max)
      // so the user is never stuck indefinitely on the startup screen
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 12000);

      try {
        const res = await apiClient<any>('/auth/refresh', {
          method: 'POST',
          skipAuth: true,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (isMounted && res?.data?.accessToken && res?.data?.user) {
          setAuth(
            res.data.user,
            res.data.workspaces || [],
            res.data.accessToken
          );
        } else if (isMounted) {
          try {
            localStorage.removeItem('hireflow_session_active');
          } catch {}
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (isMounted) {
          try {
            localStorage.removeItem('hireflow_session_active');
          } catch {}
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [setAuth, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

