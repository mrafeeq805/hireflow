import { useAuthStore } from '@/stores/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

interface FetchOptions extends RequestInit {
  workspaceId?: string;
  skipAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { workspaceId, skipAuth, headers = {}, ...restOptions } = options;
  const store = useAuthStore.getState();

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth && store.accessToken) {
    reqHeaders['Authorization'] = `Bearer ${store.accessToken}`;
  }

  const activeWorkspaceId = workspaceId || store.activeWorkspace?.id;
  if (activeWorkspaceId) {
    reqHeaders['x-workspace-id'] = activeWorkspaceId;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers: reqHeaders,
    credentials: 'include', // Sends HttpOnly cookie
  });

  // Handle 401 Unauthorized with token refresh
  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async (newToken: string) => {
            reqHeaders['Authorization'] = `Bearer ${newToken}`;
            const retryRes = await fetch(url, { ...restOptions, headers: reqHeaders, credentials: 'include' });
            resolve(await handleResponse<T>(retryRes));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!refreshRes.ok) {
        store.logout();
        throw new Error('Session expired. Please log in again.');
      }

      const refreshData = await refreshRes.json();
      const newAccessToken = refreshData.data.accessToken;
      store.setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      reqHeaders['Authorization'] = `Bearer ${newAccessToken}`;
      const retryResponse = await fetch(url, {
        ...restOptions,
        headers: reqHeaders,
        credentials: 'include',
      });

      return await handleResponse<T>(retryResponse);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      store.logout();
      throw refreshErr;
    } finally {
      isRefreshing = false;
    }
  }

  return await handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const errorJson = await response.json();
      const message = errorJson.error?.message || errorJson.error || errorJson.message || 'Request failed';
      const err = new Error(message) as Error & { details?: unknown };
      err.details = errorJson.details;
      throw err;
    }
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  if (isJson) {
    const json = await response.json();
    return json.data !== undefined ? json.data : json;
  }

  return (await response.text()) as unknown as T;
}

