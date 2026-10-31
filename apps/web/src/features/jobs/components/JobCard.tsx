import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  DollarSign,
  Users,
  MoreVertical,
  ExternalLink,
  Eye,
  CheckCircle,
  PauseCircle,
  Archive,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { JOB_STATUSES } from '@hireflow/shared';

interface JobCardProps {
  job: any;
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      apiClient(`/jobs/${job.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const salaryDisplay =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
      : job.salaryMin
      ? `From ${formatCurrency(job.salaryMin)}`
      : 'Competitive';

  return (
    <Card className="p-5 hover:border-[#0F9D78]/50 hover:shadow-md transition-all group relative cursor-pointer flex flex-col justify-between">
      <div onClick={() => navigate(`/jobs/${job.id}`)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {job.department}
              </span>
              <StatusBadge status={job.status} />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F9D78] transition-colors dark:text-slate-100">
              {job.title}
            </h3>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 outline-none">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(`/jobs/${job.id}/public`, '_blank')}
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5 text-[#0F9D78]" />
                  <span>Public Job Page</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {job.status !== JOB_STATUSES.PUBLISHED && (
                  <DropdownMenuItem
                    onClick={() => updateStatusMutation.mutate(JOB_STATUSES.PUBLISHED)}
                  >
                    <CheckCircle className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                    <span>Publish Job</span>
                  </DropdownMenuItem>
                )}
                {job.status === JOB_STATUSES.PUBLISHED && (
                  <DropdownMenuItem
                    onClick={() => updateStatusMutation.mutate(JOB_STATUSES.PAUSED)}
                  >
                    <PauseCircle className="mr-2 h-3.5 w-3.5 text-amber-600" />
                    <span>Pause Job</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate(JOB_STATUSES.CLOSED)}
                >
                  <Archive className="mr-2 h-3.5 w-3.5 text-slate-400" />
                  <span>Close Job</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            <span>{salaryDisplay}</span>
          </div>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((s: any) => (
              <span
                key={s.id || s.name}
                className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {s.name}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 dark:bg-slate-800/40">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#0F9D78]" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {job.applicationsCount || 0}
          </span>
          <span>applicants</span>
        </div>

        <span className="text-[11px] text-slate-400">
          {job.vacancies} {job.vacancies === 1 ? 'vacancy' : 'vacancies'}
        </span>
      </div>
    </Card>
  );
}

