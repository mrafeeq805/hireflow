import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  User,
  Building2,
  Plug,
  Shield,
  Palette,
  CheckCircle2,
  AlertCircle,
  Mail,
  Calendar,
  Lock,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { ROLES } from '@hireflow/shared';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { user, currentWorkspace, setUser, setCurrentWorkspace } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState('profile');

  // User Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Workspace Form State
  const [wsName, setWsName] = useState(currentWorkspace?.name || '');
  const [wsSlug, setWsSlug] = useState(currentWorkspace?.slug || '');
  const [wsDescription, setWsDescription] = useState(currentWorkspace?.description || '');
  const [wsSuccess, setWsSuccess] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);

  // Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; avatarUrl?: string }) =>
      apiClient('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (res: any) => {
      setUser(res.data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (err: any) => {
      setProfileError(err?.message || 'Failed to update profile.');
    },
  });

  // Workspace Mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient(`/workspaces/${currentWorkspace?.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (res: any) => {
      setCurrentWorkspace({ ...currentWorkspace, ...res.data });
      setWsSuccess(true);
      setTimeout(() => setWsSuccess(false), 3000);
    },
    onError: (err: any) => {
      setWsError(err?.message || 'Failed to update organization details.');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    updateProfileMutation.mutate({
      name: profileName.trim(),
      avatarUrl: profileAvatarUrl.trim() || undefined,
    });
  };

  const handleWorkspaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWsError(null);
    updateWorkspaceMutation.mutate({
      name: wsName.trim(),
      slug: wsSlug.trim(),
      description: wsDescription.trim() || undefined,
    });
  };

  const isOwnerOrAdmin =
    currentWorkspace?.role === ROLES.OWNER || currentWorkspace?.role === ROLES.ADMIN;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Settings & Workspace Preferences"
        description="Manage your user identity, workspace parameters, theme, and external service connections"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Settings' }]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-[#142B3B] border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="profile" className="gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" />
            <span>User Profile</span>
          </TabsTrigger>
          <TabsTrigger value="workspace" className="gap-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5" />
            <span>Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5 text-xs">
            <Plug className="h-3.5 w-3.5" />
            <span>Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            <span>Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Update your account details visible to colleagues and applicants across interviews.
            </p>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-[#0F9D78]" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
              <FormField label="Full Name *" required>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Email Address">
                <Input value={user?.email || ''} disabled className="opacity-60 cursor-not-allowed" />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email cannot be modified directly. Contact your workspace owner to change authentication identity.
                </span>
              </FormField>

              <FormField label="Avatar Image URL">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={profileAvatarUrl}
                  onChange={(e) => setProfileAvatarUrl(e.target.value)}
                />
              </FormField>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="mt-2 font-medium"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Workspace */}
        <TabsContent value="workspace" className="mt-4 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Organization Settings
                </h3>
                <p className="text-xs text-slate-500">
                  Configure company branding and public careers portal details.
                </p>
              </div>
              <Badge variant="navy" className="text-xs uppercase">
                {currentWorkspace?.role}
              </Badge>
            </div>

            {wsSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-[#0F9D78]" />
                <span>Workspace settings saved!</span>
              </div>
            )}

            {wsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{wsError}</span>
              </div>
            )}

            {isOwnerOrAdmin ? (
              <form onSubmit={handleWorkspaceSubmit} className="space-y-4 max-w-lg">
                <FormField label="Company / Workspace Name *" required>
                  <Input
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Workspace URL Slug *" required>
                  <Input
                    value={wsSlug}
                    onChange={(e) => setWsSlug(e.target.value)}
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Public careers link: {window.location.origin}/c/{wsSlug || 'org'}
                  </span>
                </FormField>

                <FormField label="About Company / Description">
                  <Textarea
                    placeholder="Short description featured on public job openings..."
                    rows={3}
                    value={wsDescription}
                    onChange={(e) => setWsDescription(e.target.value)}
                  />
                </FormField>

                <Button
                  type="submit"
                  disabled={updateWorkspaceMutation.isPending}
                  className="mt-2 font-medium"
                >
                  {updateWorkspaceMutation.isPending ? 'Updating...' : 'Save Organization Settings'}
                </Button>
              </form>
            ) : (
              <p className="text-xs text-slate-400">
                You do not have administrative permissions to modify workspace details.
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Tab 3: Integrations Setup Points */}
        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              External Integrations Setup Point
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Connect external communication channels and scheduling providers.
            </p>

            <div className="space-y-4">
              {/* Email Provider Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Email Service Provider (SMTP / SendGrid / Resend)
                      </h4>
                      <Badge variant="secondary" className="text-[10px]">
                        Not Connected
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure your company's transactional email credentials to send automated candidate interview reminders and offer confirmation letters.
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="text-xs shrink-0">
                  Configure SMTP
                </Button>
              </div>

              {/* Calendar Provider Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Calendar Synchronization (Google Workspace / Outlook)
                      </h4>
                      <Badge variant="secondary" className="text-[10px]">
                        Not Connected
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Connect external calendars to automatically synchronize interview appointments with interviewer Google Calendar or Microsoft 365 schedules.
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="text-xs shrink-0">
                  Connect Calendar
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Appearance */}
        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Visual Appearance
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Select your interface theme preference between Light and Deep Navy Dark Mode.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <button
                type="button"
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`p-4 rounded-xl border text-center transition-all ${
                  theme === 'light'
                    ? 'border-[#0F9D78] bg-emerald-50/30 text-slate-900 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Sun className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <span className="text-xs font-bold block">Light Theme</span>
                <span className="text-[11px] text-slate-400">Clean emerald and crisp whites</span>
              </button>

              <button
                type="button"
                onClick={() => theme === 'light' && toggleTheme()}
                className={`p-4 rounded-xl border text-center transition-all ${
                  theme === 'dark'
                    ? 'border-[#0F9D78] bg-[#142B3B] text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Moon className="h-6 w-6 mx-auto mb-2 text-[#0F9D78]" />
                <span className="text-xs font-bold block">Deep Navy Dark</span>
                <span className="text-[11px] text-slate-400">Low-glare navy surfaces</span>
              </button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

