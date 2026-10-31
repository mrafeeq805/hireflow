import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import {
  PartyPopper,
  Calendar,
  Building2,
  DollarSign,
  Briefcase,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { formatDate, formatCurrency, getInitials } from '@/lib/utils';
import { APPLICATION_STAGES } from '@hireflow/shared';

export function HiredCandidatesPage() {
  const navigate = useNavigate();

  const { data: hiredApplications, isLoading } = useQuery<any[]>({
    queryKey: ['hiredCandidates'],
    queryFn: () => apiClient(`/applications?stage=${APPLICATION_STAGES.HIRED}`),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hired Talent Roster"
        description="Celebrate and track candidates who successfully accepted offers and joined the team"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Offers', href: '/offers' },
          { label: 'Hired' },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/offers')}
            className="gap-1.5 text-xs font-medium"
          >
            <Briefcase className="h-4 w-4" />
            <span>Manage Offers</span>
          </Button>
        }
      />

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader count={6} className="h-48 rounded-xl" />
        </div>
      ) : hiredApplications && hiredApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hiredApplications.map((app) => {
            const candidate = app.candidate;
            const job = app.job;

            return (
              <Card
                key={app.id}
                className="p-5 relative overflow-hidden border-emerald-200/60 dark:border-emerald-950/60 hover:shadow-card transition-all"
              >
                {/* Emerald accent ribbon */}
                <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                  <div className="bg-[#0F9D78] text-white text-[9px] font-extrabold uppercase py-1 text-center w-36 absolute top-4 -right-10 rotate-45 shadow-xs">
                    Hired
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-emerald-500/30">
                    <AvatarFallback className="bg-[#142B3B] text-white font-bold text-sm">
                      {getInitials(candidate?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {candidate?.fullName}
                    </h3>
                    <p className="text-xs text-slate-400">{candidate?.email}</p>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-[#0F9D78]" />
                      <span>Role</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {job?.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#0F9D78]" />
                      <span>Department</span>
                    </span>
                    <Badge variant="mint" className="text-[10px]">
                      {job?.department}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#0F9D78]" />
                      <span>Hire Confirmed</span>
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {formatDate(app.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Offer Completed</span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/candidates/${candidate?.id}`)}
                    className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  >
                    <span>Dossier</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PartyPopper}
          title="No hires recorded yet"
          description="Candidates marked as Hired or who accept extended offers will appear here."
          action={
            <Button onClick={() => navigate('/applications')} className="gap-1.5">
              <span>View Open Pipelines</span>
            </Button>
          }
        />
      )}
    </div>
  );
}

