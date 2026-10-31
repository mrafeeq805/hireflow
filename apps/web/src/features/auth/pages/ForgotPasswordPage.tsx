import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/common/FormField';
import { apiClient } from '@/lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res: any = await apiClient('/auth/forgot-password', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ email }),
      });
      setIsSubmitted(true);
      if (res.devToken) {
        setDevToken(res.devToken);
      }
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0B1822]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" clickable={false} />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Reset your password
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your registered email address and we'll dispatch reset instructions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-xl border border-slate-200/80 sm:px-10 dark:bg-[#142B3B] dark:border-slate-800">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-[#0F9D78] mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Check your email inbox
              </h3>
              <p className="text-xs text-slate-500">
                If an account exists with <span className="font-semibold">{email}</span>, we have dispatched instructions.
              </p>

              {devToken && (
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded text-left text-xs">
                  <p className="font-mono text-[11px] text-slate-500 mb-1">Development Reset Token:</p>
                  <code className="text-[#0F9D78] break-all font-mono">{devToken}</code>
                  <div className="mt-2 text-right">
                    <Link
                      to={`/reset-password?email=${encodeURIComponent(email)}&token=${devToken}`}
                      className="text-xs font-semibold text-[#0F9D78] hover:underline"
                    >
                      Proceed to Reset Form →
                    </Link>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-semibold text-[#0F9D78] hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
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

              <Button type="submit" className="w-full" isLoading={isLoading}>
                <span>Send Reset Link</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

