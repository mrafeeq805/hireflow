import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Search, Filter } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchInput } from '@/components/common/SearchInput';
import { JobCard } from '../components/JobCard';
import { CardGridSkeleton } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function JobsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const { data: jobs = [], isLoading } = useQuery<any[]>({
    queryKey: ['jobs', { department, status, search }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (department !== 'ALL') params.append('department', department);
      if (status !== 'ALL') params.append('status', status);
      if (search) params.append('search', search);
      return apiClient(`/jobs?${params.toString()}`);
    },
  });

  const departments = ['ALL', 'Engineering', 'Design & UX', 'Product', 'Talent Acquisition', 'Sales & Marketing'];
  const statuses = ['ALL', 'PUBLISHED', 'DRAFT', 'PAUSED', 'CLOSED'];

  return (
    <div>
      <PageHeader
        title="Job Openings"
        description="Create, manage, publish, and track recruitment pipelines across departments."
      >
        <Button onClick={() => navigate('/jobs/new')} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Post New Job</span>
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar
        hasActiveFilters={department !== 'ALL' || status !== 'ALL' || search !== ''}
        onReset={() => {
          setDepartment('ALL');
          setStatus('ALL');
          setSearch('');
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by job title or location..."
        />

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Department:</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-[#142B3B] dark:text-slate-200"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-[#142B3B] dark:text-slate-200"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {/* Grid of Job Cards */}
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No job openings found"
          description="Try adjusting your department or search filters, or create a new job opening."
          actionLabel="Post New Job"
          onAction={() => navigate('/jobs/new')}
        />
      )}
    </div>
  );
}

