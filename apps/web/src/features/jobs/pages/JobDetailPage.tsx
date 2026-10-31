import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  DollarSign,
  Users,
  Copy,
  Check,
  ExternalLink,
  Edit,
  Briefcase,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { JOB_STATUSES } from '@hireflow/shared';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: job, isLoading } = useQuery<any>({
    queryKey: ['job', jobId],
    queryFn: () => apiClient(`/jobs/${jobId}`),
  });

  const { data: jobApplications = [] } = useQuery<any[]>({
    queryKey: ['applications', { jobId }],
    queryFn: () => apiClient(`/applications?jobId=${jobId}`),
    enabled: Boolean(jobId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      apiClient(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  if (isLoading || !job) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading job details...</div>;
  }

  const publicUrl = `${window.location.origin}/jobs/${job.id}/public`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const salaryDisplay =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
      : job.salaryMin
      ? `From ${formatCurrency(job.salaryMin)}`
      : 'Competitive';

  return (
    <div>
      <PageHeader
        title={job.title}
        breadcrumbs={[
          { label: 'Jobs', href: '/jobs' },
          { label: job.title },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/jobs/${job.id}/edit`)}
        >
          <Edit className="h-3.5 w-3.5 mr-1" />
          Edit Job
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`/jobs/${job.id}/public`, '_blank')}
          className="text-[#0F9D78] border-[#0F9D78]/30"
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          View Public Page
        </Button>
      </PageHeader>

      {/* Overview Banner Card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {job.department}
              </span>
              <StatusBadge status={job.status} />
              <Badge variant="secondary" className="capitalize">
                {job.employmentType?.toLowerCase().replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {job.experienceLevel?.toLowerCase()} level
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                {salaryDisplay}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#0F9D78]" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {job.vacancies}
                </span>{' '}
                open vacancies
              </span>
              {job.publishedAt && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Published {formatDate(job.publishedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Quick status toggle dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={job.status}
              onChange={(e) => updateStatusMutation.mutate(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold shadow-xs dark:border-slate-800 dark:bg-[#142B3B]"
            >
              <option value={JOB_STATUSES.PUBLISHED}>Status: Published</option>
              <option value={JOB_STATUSES.DRAFT}>Status: Draft</option>
              <option value={JOB_STATUSES.PAUSED}>Status: Paused</option>
              <option value={JOB_STATUSES.CLOSED}>Status: Closed</option>
            </select>
          </div>
        </div>

        {/* Public Application Link Pill */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50 p-3 rounded-lg dark:bg-[#0B1822]/40">
          <div className="flex items-center gap-2 truncate text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-[#0F9D78]">Public Application URL:</span>
            <span className="truncate font-mono text-[11px] text-slate-400">{publicUrl}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="text-xs h-7 text-slate-600 dark:text-slate-300"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1 text-[#0F9D78]" />
                <span className="text-[#0F9D78]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="candidates">
            Candidates ({jobApplications.length})
          </TabsTrigger>
          <TabsTrigger value="description">Job Description</TabsTrigger>
          <TabsTrigger value="team">Hiring Team</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Applicants for {job.title}
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/pipeline')}
                className="text-xs"
              >
                <span>Recruitment Kanban</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] dark:border-slate-800">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Stage</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Applied</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {jobApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        <button
                          onClick={() => navigate(`/candidates/${app.candidateId}`)}
                          className="hover:text-[#0F9D78] text-left"
                        >
                          {app.candidate?.fullName}
                        </button>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={app.stage} />
                      </td>
                      <td className="py-3">
                        <span className="text-slate-500 capitalize">{app.priority?.toLowerCase()}</span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {formatDate(app.appliedAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/candidates/${app.candidateId}`)}
                          className="text-xs h-7 text-[#0F9D78]"
                        >
                          Review Profile →
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {jobApplications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No applications submitted for this job yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="description" className="space-y-6">
          <Card className="p-6 space-y-5 text-sm">
            <div>
              <h4 className="font-bold text-slate-900 mb-2 dark:text-slate-100">
                About the Role
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.responsibilities && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2 dark:text-slate-100">
                  Responsibilities & Deliverables
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-900 mb-2 dark:text-slate-100">
                Required & Preferred Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((s: any) => (
                  <Badge
                    key={s.id || s.name}
                    variant={s.isRequired ? 'default' : 'secondary'}
                  >
                    {s.name} {s.isRequired ? '(Required)' : '(Preferred)'}
                  </Badge>
                ))}
              </div>
            </div>

            {job.internalNotes && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 mb-1 text-xs text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Internal Hiring Notes
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {job.internalNotes}
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="p-6">
            <h4 className="font-bold text-sm text-slate-900 mb-4 dark:text-slate-100">
              Assigned Hiring Team
            </h4>
            <div className="space-y-3">
              {job.hiringManager && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {job.hiringManager.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{job.hiringManager.email}</p>
                  </div>
                  <Badge variant="navy">Hiring Manager</Badge>
                </div>
              )}

              {job.recruiters?.map((rec: any) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {rec.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{rec.email}</p>
                  </div>
                  <Badge variant="mint">Assigned Recruiter</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

