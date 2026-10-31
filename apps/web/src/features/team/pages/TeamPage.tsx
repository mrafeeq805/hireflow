import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ROLES } from '@hireflow/shared';
import { formatDate, getInitials } from '@/lib/utils';

export function TeamPage() {
  const queryClient = useQueryClient();
  const { currentWorkspace, user: currentUser } = useAuthStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);

  const { data: members, isLoading } = useQuery<any[]>({
    queryKey: ['workspaceMembers', currentWorkspace?.id],
    queryFn: () => apiClient(`/workspaces/${currentWorkspace?.id}/members`),
    enabled: !!currentWorkspace?.id,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      apiClient(`/workspaces/${currentWorkspace?.id}/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      apiClient(`/workspaces/${currentWorkspace?.id}/members/${memberId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] });
      setMemberToRemove(null);
    },
  });

  const isOwnerOrAdmin =
    currentWorkspace?.role === ROLES.OWNER || currentWorkspace?.role === ROLES.ADMIN;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case ROLES.OWNER:
        return 'navy';
      case ROLES.ADMIN:
        return 'default';
      case ROLES.RECRUITER:
        return 'mint';
      case ROLES.HIRING_MANAGER:
        return 'warning';
      case ROLES.INTERVIEWER:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Team Management"
        description="Collaborate with hiring managers, recruiters, and interviewers across your organization"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Team Members' }]}
        actions={
          isOwnerOrAdmin && (
            <Button onClick={() => setIsInviteOpen(true)} className="gap-1.5 font-medium shadow-xs">
              <UserPlus className="h-4 w-4" />
              <span>Invite Team Member</span>
            </Button>
          )
        }
      />

      {/* Role Explainer Card */}
      <Card className="p-5 bg-slate-50/60 dark:bg-slate-900/30 border-dashed">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-[#0F9D78]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Role-Based Access Control (RBAC)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 bg-white dark:bg-[#142B3B] rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Admin</span>
            <span>Full administrative control over pipelines, settings, and team roles.</span>
          </div>
          <div className="p-3 bg-white dark:bg-[#142B3B] rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Recruiter</span>
            <span>Full candidate sourcing, pipeline stages, interview scheduling, and offer creation.</span>
          </div>
          <div className="p-3 bg-white dark:bg-[#142B3B] rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Hiring Manager</span>
            <span>Review candidate profiles, evaluate scorecards, and make department decisions.</span>
          </div>
          <div className="p-3 bg-white dark:bg-[#142B3B] rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Interviewer</span>
            <span>Restricted view limited to assigned interviews and scorecard submissions.</span>
          </div>
        </div>
      </Card>

      {/* Members Table */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader count={5} className="h-16 rounded-xl" />
        </div>
      ) : members && members.length > 0 ? (
        <div className="bg-white dark:bg-[#142B3B] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Member Since</th>
                  {isOwnerOrAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {members.map((member) => {
                  const isCurrent = member.userId === currentUser?.id;
                  const isOwner = member.role === ROLES.OWNER;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-[#142B3B] text-white">
                              {getInitials(member.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {member.user?.name}
                            </span>
                            {isCurrent && (
                              <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {member.user?.email}
                      </td>

                      <td className="py-3.5 px-4">
                        {isOwnerOrAdmin && !isOwner && !isCurrent ? (
                          <select
                            className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142B3B] text-slate-800 dark:text-slate-200"
                            value={member.role}
                            onChange={(e) =>
                              updateRoleMutation.mutate({
                                memberId: member.id,
                                role: e.target.value,
                              })
                            }
                          >
                            <option value={ROLES.ADMIN}>ADMIN</option>
                            <option value={ROLES.RECRUITER}>RECRUITER</option>
                            <option value={ROLES.HIRING_MANAGER}>HIRING_MANAGER</option>
                            <option value={ROLES.INTERVIEWER}>INTERVIEWER</option>
                          </select>
                        ) : (
                          <Badge variant={getRoleBadgeVariant(member.role) as any} className="text-[11px] uppercase">
                            {member.role.replace('_', ' ')}
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {formatDate(member.joinedAt)}
                      </td>

                      {isOwnerOrAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          {!isOwner && !isCurrent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setMemberToRemove(member)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No team members found"
          description="Invite your hiring team to start collaborating on candidates and interviews."
          action={
            <Button onClick={() => setIsInviteOpen(true)} className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              <span>Invite First Member</span>
            </Button>
          }
        />
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={() => memberToRemove && removeMemberMutation.mutate(memberToRemove.id)}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${memberToRemove?.user?.name} from this workspace? They will immediately lose access to all candidate records, scorecards, and pipelines.`}
        confirmText="Remove Member"
        variant="destructive"
      />
    </div>
  );
}

