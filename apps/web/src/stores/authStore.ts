import { create } from 'zustand';
import type { UserProfile, WorkspaceSummary } from '@hireflow/shared';

interface AuthState {
  user: UserProfile | null;
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary | null;
  currentWorkspace: WorkspaceSummary | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, workspaces: WorkspaceSummary[], accessToken: string, activeWorkspaceId?: string) => void;
  setUser: (user: UserProfile | null) => void;
  setAccessToken: (token: string) => void;
  setActiveWorkspace: (workspace: WorkspaceSummary) => void;
  setCurrentWorkspace: (workspace: WorkspaceSummary) => void;
  updateUserProfile: (user: Partial<UserProfile>) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  workspaces: [],
  activeWorkspace: null,
  currentWorkspace: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, workspaces, accessToken, activeWorkspaceId) => {
    let active = workspaces[0] || null;
    if (activeWorkspaceId) {
      const match = workspaces.find((w) => w.id === activeWorkspaceId);
      if (match) active = match;
    }
    set({
      user,
      workspaces,
      activeWorkspace: active,
      currentWorkspace: active,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user) => set({ user }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace, currentWorkspace: workspace }),

  setCurrentWorkspace: (workspace) => set({ activeWorkspace: workspace, currentWorkspace: workspace }),

  updateUserProfile: (updated) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null,
    })),

  logout: () => {
    set({
      user: null,
      workspaces: [],
      activeWorkspace: null,
      currentWorkspace: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
