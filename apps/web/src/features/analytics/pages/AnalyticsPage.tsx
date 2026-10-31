import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  BarChart3,
} from 'lucide-react';

const COLORS = ['#0F9D78', '#142B3B', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#DC5B62'];

export function AnalyticsPage() {
  const [selectedJobId, setSelectedJobId] = useState('ALL');

  // Load jobs for filtering
  const { data: jobs } = useQuery<any[]>({
    queryKey: ['jobsDropdown'],
    queryFn: () => apiClient('/jobs'),
  });

  // Load DB analytics
  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ['analyticsData', selectedJobId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedJobId !== 'ALL') params.append('jobId', selectedJobId);
      return apiClient(`/analytics?${params.toString()}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Recruitment Analytics"
          description="Comprehensive hiring funnel metrics and performance insights"
          breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Analytics' }]}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonLoader count={4} className="h-28 rounded-xl" />
        </div>
        <SkeletonLoader count={2} className="h-80 rounded-xl" />
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const pipeline = analytics?.pipelineDistribution || [];
  const sources = (analytics?.sourcesBreakdown || []).filter((s: any) => s.count > 0);
  const monthly = analytics?.monthlyTrends || [];
  const recruiters = analytics?.recruiterPerformance || [];
  const jobProgress = analytics?.jobProgress || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Analytics & Insights"
        description="Real-time conversion funnels, sourcing efficiency, and hiring velocity"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Analytics' }]}
        actions={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142B3B] text-slate-800 dark:text-slate-200 focus:outline-hidden"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="ALL">All Active Openings</option>
              {jobs?.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="h-4 w-4 text-[#0F9D78]" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.activeJobs ?? 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Candidates</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.totalCandidates ?? 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Interviews</span>
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.interviewsScheduled ?? 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Offers Sent</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.offersSent ?? 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hires Made</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {overview.candidatesHired ?? 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Time to Hire</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.avgTimeToHireDays ?? 18}d
          </p>
        </Card>
      </div>

      {/* Conversion Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Application → Interview
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {overview.appToInterviewRate ?? 0}%
            </p>
            <p className="text-[11px] text-slate-400">Screening qualification rate</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Interview → Offer
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {overview.interviewToOfferRate ?? 0}%
            </p>
            <p className="text-[11px] text-slate-400">Interview evaluation pass rate</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
            <Award className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Offer Acceptance Rate
            </p>
            <p className="text-2xl font-black text-[#0F9D78] mt-1">
              {overview.offerAcceptanceRate ?? 0}%
            </p>
            <p className="text-[11px] text-slate-400">Candidate offer closing rate</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0F9D78] flex items-center justify-center font-bold">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Stage Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Application Pipeline Stage Volume
            </h3>
            <span className="text-xs text-slate-400">Current active funnel</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142B3B',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {pipeline.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Hiring & Applications Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              6-Month Hiring & Volume Velocity
            </h3>
            <span className="text-xs text-slate-400">Month-over-month trajectory</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F9D78" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F9D78" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#142B3B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#142B3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142B3B',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#0F9D78"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorApps)"
                  name="Applications"
                />
                <Area
                  type="monotone"
                  dataKey="hires"
                  stroke="#142B3B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHires)"
                  name="Hires Closed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Sourcing Channel Performance & Recruiter Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sourcing Channels */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Candidate Sourcing Channels
            </h3>
            <span className="text-xs text-slate-400">Total volume vs Hires</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {sources.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sources} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#142B3B',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#0F9D78" name="Sourced Candidates" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="hiredCount" fill="#142B3B" name="Successful Hires" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No channel data recorded yet.</p>
            )}
          </div>
        </Card>

        {/* Recruiter Performance Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hiring Team Performance
            </h3>
            <span className="text-xs text-slate-400">Pipeline activity by recruiter</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="pb-2.5">Recruiter</th>
                  <th className="pb-2.5 text-center">Active Apps</th>
                  <th className="pb-2.5 text-center">Interviews</th>
                  <th className="pb-2.5 text-center">Offers</th>
                  <th className="pb-2.5 text-right">Hires Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recruiters.map((rec: any) => (
                  <tr key={rec.recruiterId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      {rec.recruiterName}
                    </td>
                    <td className="py-2.5 text-center text-slate-600 dark:text-slate-300">
                      {rec.activeApplications}
                    </td>
                    <td className="py-2.5 text-center text-slate-600 dark:text-slate-300">
                      {rec.interviewsConducted}
                    </td>
                    <td className="py-2.5 text-center text-slate-600 dark:text-slate-300">
                      {rec.offersSent}
                    </td>
                    <td className="py-2.5 text-right font-black text-[#0F9D78]">
                      {rec.hiresCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Job-wise Pipeline Table */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Job Position Fulfillment Progress
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Job Title & Department</th>
                <th className="pb-3 text-center">Vacancies</th>
                <th className="pb-3 text-center">Applications</th>
                <th className="pb-3 text-center">Interviews</th>
                <th className="pb-3 text-center">Offers</th>
                <th className="pb-3 text-center">Hired</th>
                <th className="pb-3 text-right">Fill Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobProgress.map((jp: any) => {
                const fillRate = Math.min(100, Math.round((jp.hiredCount / (jp.vacancies || 1)) * 100));

                return (
                  <tr key={jp.jobId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {jp.title}
                      </span>
                      <span className="text-[11px] text-slate-400">{jp.department}</span>
                    </td>
                    <td className="py-3 text-center text-slate-600 dark:text-slate-300">
                      {jp.vacancies}
                    </td>
                    <td className="py-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {jp.appliedCount}
                    </td>
                    <td className="py-3 text-center text-slate-600 dark:text-slate-300">
                      {jp.interviewCount}
                    </td>
                    <td className="py-3 text-center text-slate-600 dark:text-slate-300">
                      {jp.offerCount}
                    </td>
                    <td className="py-3 text-center font-bold text-[#0F9D78]">
                      {jp.hiredCount}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0F9D78] rounded-full"
                            style={{ width: `${fillRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-300 w-8 text-right">
                          {fillRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

