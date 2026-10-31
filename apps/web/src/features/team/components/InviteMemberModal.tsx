import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/common/FormField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { ROLES } from '@hireflow/shared';
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useAuthStore();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(ROLES.RECRUITER);
  const [error, setError] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient(`/workspaces/${currentWorkspace?.id}/members/invite`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] });
      if (res?.data?.token) {
        const link = `${window.location.origin}/invite/${res.data.token}`;
        setInvitationLink(link);
      } else {
        handleClose();
      }
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to send invitation.');
    },
  });

  const handleClose = () => {
    setError(null);
    setEmail('');
    setInvitationLink(null);
    setCopied(false);
    onClose();
  };

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    inviteMutation.mutate({
      email: email.trim().toLowerCase(),
      role,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>

        {invitationLink ? (
          <div className="space-y-4 py-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F9D78]" />
              <span>Invitation generated successfully for <strong>{email}</strong>!</span>
            </div>

            <FormField label="Shareable Invitation Link">
              <div className="flex gap-2">
                <Input value={invitationLink} readOnly className="text-xs font-mono" />
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  {copied ? 'Copied' : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </FormField>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <FormField label="Colleague Email Address *" required>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Workspace Role *" required>
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value={ROLES.ADMIN}>Admin — Full workspace administrative access</option>
                <option value={ROLES.RECRUITER}>Recruiter — Manage jobs, candidates, pipelines, offers</option>
                <option value={ROLES.HIRING_MANAGER}>Hiring Manager — Review candidates, manage team jobs</option>
                <option value={ROLES.INTERVIEWER}>Interviewer — View assigned interviews and submit scorecards</option>
              </select>
            </FormField>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Permissions Summary:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong>Admin</strong>: Manage workspace settings, members, and all hiring pipelines.</li>
                <li><strong>Recruiter</strong>: Source candidates, advance pipeline stages, generate offers.</li>
                <li><strong>Hiring Manager</strong>: Approve candidates, review evaluations, participate in hiring decisions.</li>
                <li><strong>Interviewer</strong>: Restricted to their assigned interviews and submitting evaluations.</li>
              </ul>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

