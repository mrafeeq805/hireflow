import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/common/FormField';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res: any = await apiClient('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ email, password }),
      });

      setAuth(res.user, res.workspaces, res.accessToken, res.activeWorkspaceId);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0B1822]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" clickable={false} />
        </div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sign in to your recruitment workspace
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage pipelines, candidates, scorecards, and hiring offers.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-card rounded-xl border border-slate-200/80 sm:py-8 sm:px-10 dark:bg-[#142B3B] dark:border-slate-800">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-lg dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </FormField>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-[#0F9D78] focus:ring-[#0F9D78] mr-2"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-[#0F9D78] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full font-semibold shadow-xs"
              isLoading={isLoading}
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          {/* Seed demo quick-switch pills */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3 text-[#0F9D78]" />
              <span>One-Click Demo Roles</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex.morgan@hireflow.io')}
                className="text-left p-2 rounded border border-slate-200 hover:border-[#0F9D78] hover:bg-[#D9F5EA]/20 transition-all dark:border-slate-800 dark:hover:bg-[#0F9D78]/10"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-200">Alex Morgan</p>
                <p className="text-[10px] text-[#0F9D78]">Workspace Owner</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sarah.jenkins@hireflow.io')}
                className="text-left p-2 rounded border border-slate-200 hover:border-[#0F9D78] hover:bg-[#D9F5EA]/20 transition-all dark:border-slate-800 dark:hover:bg-[#0F9D78]/10"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-200">Sarah Jenkins</p>
                <p className="text-[10px] text-[#0F9D78]">Lead Recruiter</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('david.chen@hireflow.io')}
                className="text-left p-2 rounded border border-slate-200 hover:border-[#0F9D78] hover:bg-[#D9F5EA]/20 transition-all dark:border-slate-800 dark:hover:bg-[#0F9D78]/10"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-200">David Chen</p>
                <p className="text-[10px] text-blue-500">Hiring Manager</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('elena.rostova@hireflow.io')}
                className="text-left p-2 rounded border border-slate-200 hover:border-[#0F9D78] hover:bg-[#D9F5EA]/20 transition-all dark:border-slate-800 dark:hover:bg-[#0F9D78]/10"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-200">Elena Rostova</p>
                <p className="text-[10px] text-purple-500">Technical Interviewer</p>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an organization account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#0F9D78] hover:underline"
            >
              Sign up for HireFlow
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

