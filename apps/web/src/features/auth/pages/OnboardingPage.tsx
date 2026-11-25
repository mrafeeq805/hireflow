import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/common/FormField';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const [step, setStep] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('RECRUITER');
  const [invitedList, setInvitedList] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !activeWorkspace) return;

    setIsInviting(true);
    try {
      await apiClient(`/workspaces/${activeWorkspace.id}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setInvitedList([...invitedList, `${inviteEmail} (${inviteRole})`]);
      setInviteEmail('');
    } catch (err: any) {
      alert(err.message || 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0B1822]">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center mb-6">
        <div className="flex justify-center mb-4">
          <Logo size="lg" clickable={false} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome to HireFlow
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Your workspace <span className="font-semibold text-[#0F9D78]">{activeWorkspace?.name}</span> is ready.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-6 px-4 shadow-card rounded-xl border border-slate-200/80 sm:py-8 sm:px-10 dark:bg-[#142B3B] dark:border-slate-800">
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9F5EA] text-[#0F9D78]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Workspace Overview
                  </h3>
                  <p className="text-xs text-slate-500">
                    Default hiring pipeline stages have been configured.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 text-xs space-y-2 dark:bg-[#0B1822]/40 dark:border-slate-800">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Included Pipeline Stages:
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                  <span>✓ 1. Applied</span>
                  <span>✓ 2. Screening</span>
                  <span>✓ 3. Shortlisted</span>
                  <span>✓ 4. Interview</span>
                  <span>✓ 5. Assessment</span>
                  <span>✓ 6. Offer</span>
                  <span>✓ 7. Hired</span>
                  <span>✓ 8. Rejected</span>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                <span>Continue: Invite Your Hiring Team</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9F5EA] text-[#0F9D78]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Invite Collaborators
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add recruiters, interviewers, and hiring managers.
                  </p>
                </div>
              </div>

              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="text-xs"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="RECRUITER">Recruiter</option>
                  <option value="HIRING_MANAGER">Hiring Manager</option>
                  <option value="INTERVIEWER">Interviewer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                <Button type="submit" size="sm" isLoading={isInviting}>
                  Invite
                </Button>
              </form>

              {invitedList.length > 0 && (
                <div className="rounded-lg border border-slate-200 p-3 text-xs space-y-1 dark:border-slate-800">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Pending invitations:
                  </p>
                  {invitedList.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-3 w-3 text-[#0F9D78]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={() => navigate('/dashboard')} className="w-full">
                <span>Enter Recruitment Dashboard</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

