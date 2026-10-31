import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Calendar,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { CardGridSkeleton } from '@/components/common/SkeletonLoader';

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery<any>({
    queryKey: ['analytics'],
    queryFn: () => apiClient('/analytics'),
  });

  const { data: recentApps = [] } = useQuery<any[]>({
    queryKey: ['applications'],
    queryFn: () => apiClient('/applications'),
  });

  const { data: upcomingInterviews = [] } = useQuery<any[]>({
    queryKey: ['interviews', 'upcoming'],
    queryFn: () => apiClient('/interviews?status=SCHEDULED'),
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ['tasks', 'dueToday'],
    queryFn: () => apiClient('/tasks?filter=dueToday'),
  });

  const stats = analytics?.overview || {
    activeJobs: 0,
    totalCandidates: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    offersSent: 0,
    candidatesHired: 0,
    offerAcceptanceRate: 0,
    avgTimeToHireDays: 0,
  };

  return (
    <div>
      <PageHeader
        title="Recruitment Overview"
        description="Monitor hiring pipelines, upcoming candidate evaluations, and conversion metrics."
      >
        <Button onClick={() => navigate('/jobs')} variant="outline" size="sm">
          <Briefcase className="h-3.5 w-3.5 mr-1 text-[#0F9D78]" />
          Browse Jobs
        </Button>
        <Button onClick={() => navigate('/pipeline')} size="sm">
          <span>Open Kanban Pipeline</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </PageHeader>

      {/* Top Metrics Cards */}
      {isAnalyticsLoading ? (
        <CardGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Job Openings
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 dark:text-slate-100">
                {stats.activeJobs}
              </h3>
              <p className="text-[11px] text-[#0F9D78] flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="h-3 w-3" />
                Live on career portals
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-[#D9F5EA] flex items-center justify-center text-[#0F9D78] dark:bg-[#0F9D78]/20 dark:text-[#34D399]">
              <Briefcase className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Candidates
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 dark:text-slate-100">
                {stats.totalCandidates}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {stats.newApplications} active applications
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Interviews Scheduled
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 dark:text-slate-100">
                {stats.interviewsScheduled}
              </h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium">
                {upcomingInterviews.length} sessions upcoming
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Calendar className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Candidates Hired
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 dark:text-slate-100">
                {stats.candidatesHired}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                {stats.offerAcceptanceRate}% offer acceptance
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
          </Card>
        </div>
      )}

      {/* Main Grid: Pipeline Breakdown & Recent Applications + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: Pipeline Distribution & Recent Applicants */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Stage Funnel Bar */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Active Hiring Funnel Distribution
              </h3>
              <span className="text-xs font-medium text-[#0F9D78] hover:underline cursor-pointer" onClick={() => navigate('/pipeline')}>
                View Kanban Board →
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
              {analytics?.pipelineDistribution?.map((p: any) => (
                <div
                  key={p.stage}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-[#0B1822]/40"
                >
                  <p className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                    {p.count}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate uppercase mt-0.5 font-semibold">
                    {p.stage}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Candidate Applications */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Recent Applications
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#0F9D78]"
                onClick={() => navigate('/applications')}
              >
                View all ({recentApps.length})
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px] dark:border-slate-800">
                    <th className="pb-2">Candidate</th>
                    <th className="pb-2">Target Job</th>
                    <th className="pb-2">Stage</th>
                    <th className="pb-2">Recruiter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentApps.slice(0, 5).map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => navigate(`/candidates/${app.candidateId}`)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                        {app.candidate?.fullName}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                        {app.job?.title}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={app.stage} />
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {app.assignedRecruiter?.name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Upcoming Interviews & Follow-up Tasks */}
        <div className="space-y-6">
          {/* Upcoming Interviews Widget */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Upcoming Interviews
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#0F9D78]"
                onClick={() => navigate('/interviews')}
              >
                Calendar
              </Button>
            </div>

            <div className="space-y-3">
              {upcomingInterviews.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/interviews/${item.id}`)}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:border-[#0F9D78]/50 cursor-pointer transition-colors dark:border-slate-800 dark:bg-[#0B1822]/40"
                >
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {item.application?.candidate?.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {item.application?.job?.title}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-[#0F9D78]">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(item.scheduledAt)}
                    </span>
                    <span className="capitalize">{item.type}</span>
                  </div>
                </div>
              ))}

              {upcomingInterviews.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  No upcoming interviews scheduled.
                </p>
              )}
            </div>
          </Card>

          {/* Due Today Tasks */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Tasks Due Today
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#0F9D78]"
                onClick={() => navigate('/tasks')}
              >
                View all ({tasks.length})
              </Button>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate dark:text-slate-200">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {task.type?.toLowerCase().replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  All tasks up to date for today!
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

