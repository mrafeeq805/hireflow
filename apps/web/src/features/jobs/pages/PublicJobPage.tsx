import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  ArrowRight,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function PublicJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading, isError } = useQuery<any>({
    queryKey: ['publicJob', jobId],
    queryFn: () =>
      apiClient(`/jobs/public/${jobId}`, {
        skipAuth: true,
      }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1822]">
        <p className="text-xs text-slate-500">Loading career opening...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#0B1822]">
        <Briefcase className="h-12 w-12 text-slate-400 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Job Opening Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          This position may have been closed or the link is invalid.
        </p>
      </div>
    );
  }

  const salaryDisplay =
    job.salaryMin && job.salaryMax
      ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
      : job.salaryMin
      ? `From ${formatCurrency(job.salaryMin)}`
      : 'Competitive Salary';

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#0B1822] text-slate-800 dark:text-slate-100">
      {/* Public Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 dark:border-slate-800 dark:bg-[#142B3B]/80 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {job.workspace?.logoUrl ? (
              <img
                src={job.workspace.logoUrl}
                alt="Logo"
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-[#142B3B] flex items-center justify-center text-white font-bold text-sm">
                {job.workspace?.name?.charAt(0) || 'H'}
              </div>
            )}
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {job.workspace?.name || 'Company'}
              </span>
              <span className="text-[11px] text-slate-400 block leading-none">
                Careers & Opportunities
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
            size="sm"
            className="font-semibold shadow-xs"
          >
            <span>Apply for this Job</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 py-10 space-y-8">
        {/* Banner */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-8 shadow-xs dark:border-slate-800 dark:bg-[#142B3B]">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="mint" className="text-xs uppercase font-bold tracking-wide">
              {job.department}
            </Badge>
            <Badge variant="secondary" className="capitalize text-xs">
              {job.employmentType?.toLowerCase().replace('_', ' ')}
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {job.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#0F9D78]" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              <DollarSign className="h-4 w-4 text-[#0F9D78]" />
              {salaryDisplay}
            </span>
            {job.publishedAt && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="h-4 w-4" />
                Posted {formatDate(job.publishedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Description & Responsibilities */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-8 shadow-xs dark:border-slate-800 dark:bg-[#142B3B] space-y-8 text-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              Role Description
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
              {job.description}
            </p>
          </div>

          {job.responsibilities && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                Key Responsibilities
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                {job.responsibilities}
              </p>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                Desired Skills & Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s: any) => (
                  <Badge
                    key={s.id || s.name}
                    variant={s.isRequired ? 'default' : 'secondary'}
                    className="text-xs px-2.5 py-1"
                  >
                    {s.name} {s.isRequired ? '(Required)' : '(Nice to have)'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Ready to build the future with us?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Submit your profile and our recruiting team will review your application within 48 hours.
            </p>
            <Button
              onClick={() => navigate(`/jobs/${job.id}/apply`)}
              size="lg"
              className="font-bold"
            >
              <span>Apply for this Position</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        Powered by{' '}
        <span className="font-bold text-[#142B3B] dark:text-slate-200">
          Hire<span className="text-[#0F9D78]">Flow</span>
        </span>{' '}
        Recruitment ATS
      </footer>
    </div>
  );
}

