import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CandidateDetailDrawer } from '@/features/candidates/components/CandidateDetailDrawer';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Kanban,
  FileCheck2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { APPLICATION_STAGES, PRIORITIES } from '@hireflow/shared';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export function ApplicationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [jobId, setJobId] = useState('ALL');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch open jobs for filter dropdown
  const { data: jobs } = useQuery<any[]>({
    queryKey: ['jobsDropdown'],
    queryFn: () => apiClient('/jobs'),
  });

  // Fetch applications
  const { data: applications, isLoading } = useQuery<any[]>({
    queryKey: ['applications', { search, stage, priority, jobId }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (stage !== 'ALL') params.append('stage', stage);
      if (priority !== 'ALL') params.append('priority', priority);
      if (jobId !== 'ALL') params.append('jobId', jobId);
      return apiClient(`/applications?${params.toString()}`);
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ appId, newStage }: { appId: string; newStage: string }) =>
      apiClient(`/applications/${appId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });

  const handleOpenCandidate = (candId: string) => {
    setSelectedCandidateId(candId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Pipelines"
        description="Unified tracking of candidates actively moving through hiring stages"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Applications' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/kanban')}
              className="gap-1.5 font-medium shadow-xs"
            >
              <Kanban className="h-4 w-4 text-[#0F9D78]" />
              <span>Open Visual Kanban</span>
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        searchComponent={
          <SearchInput
            placeholder="Search applicants by name or email..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-72"
          />
        }
        filters={[
          {
            label: 'Job Opening',
            value: jobId,
            options: [
              { label: 'All Jobs', value: 'ALL' },
              ...(jobs?.map((j) => ({ label: j.title, value: j.id })) || []),
            ],
            onChange: setJobId,
          },
          {
            label: 'Stage',
            value: stage,
            options: [
              { label: 'All Stages', value: 'ALL' },
              { label: 'Applied', value: APPLICATION_STAGES.APPLIED },
              { label: 'Screening', value: APPLICATION_STAGES.SCREENING },
              { label: 'Shortlisted', value: APPLICATION_STAGES.SHORTLISTED },
              { label: 'Interview', value: APPLICATION_STAGES.INTERVIEW },
              { label: 'Assessment', value: APPLICATION_STAGES.ASSESSMENT },
              { label: 'Offer', value: APPLICATION_STAGES.OFFER },
              { label: 'Hired', value: APPLICATION_STAGES.HIRED },
              { label: 'Rejected', value: APPLICATION_STAGES.REJECTED },
            ],
            onChange: setStage,
          },
          {
            label: 'Priority',
            value: priority,
            options: [
              { label: 'All Priorities', value: 'ALL' },
              { label: 'Low', value: PRIORITIES.LOW },
              { label: 'Medium', value: PRIORITIES.MEDIUM },
              { label: 'High', value: PRIORITIES.HIGH },
              { label: 'Urgent', value: PRIORITIES.URGENT },
            ],
            onChange: setPriority,
          },
        ]}
        onClear={() => {
          setSearch('');
          setStage('ALL');
          setPriority('ALL');
          setJobId('ALL');
        }}
      />

      {/* Applications Table */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader count={6} className="h-16 rounded-xl" />
        </div>
      ) : applications && applications.length > 0 ? (
        <div className="bg-white dark:bg-[#142B3B] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Position</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Interviews</th>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleOpenCandidate(app.candidateId)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#0F9D78] transition-colors">
                        {app.candidate?.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.candidate?.email}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {app.job?.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.job?.department} • {app.job?.location}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <PriorityBadge priority={app.priority} />
                    </td>

                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142B3B] text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-[#0F9D78]"
                        value={app.stage}
                        onChange={(e) =>
                          updateStageMutation.mutate({
                            appId: app.id,
                            newStage: e.target.value,
                          })
                        }
                      >
                        <option value={APPLICATION_STAGES.APPLIED}>Applied</option>
                        <option value={APPLICATION_STAGES.SCREENING}>Screening</option>
                        <option value={APPLICATION_STAGES.SHORTLISTED}>Shortlisted</option>
                        <option value={APPLICATION_STAGES.INTERVIEW}>Interview</option>
                        <option value={APPLICATION_STAGES.ASSESSMENT}>Assessment</option>
                        <option value={APPLICATION_STAGES.OFFER}>Offer</option>
                        <option value={APPLICATION_STAGES.HIRED}>Hired</option>
                        <option value={APPLICATION_STAGES.REJECTED}>Rejected</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-[#0F9D78]" />
                        {app._count?.interviews || 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {formatTimeAgo(app.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/candidates/${app.candidateId}`)}
                        className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <span>Profile</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileCheck2}
          title="No applications match your criteria"
          description={
            search || stage !== 'ALL' || priority !== 'ALL' || jobId !== 'ALL'
              ? 'Try modifying your filter selections or clearing the search keyword.'
              : 'Candidates will appear here as soon as they submit applications or are manually linked to jobs.'
          }
        />
      )}

      {/* Candidate Profile Quick Drawer */}
      <CandidateDetailDrawer
        candidateId={selectedCandidateId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCandidateId(null);
        }}
      />
    </div>
  );
}

