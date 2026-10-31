import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { InterviewCard } from '../components/InterviewCard';
import { InterviewCalendar } from '../components/InterviewCalendar';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import {
  Calendar as CalendarIcon,
  Plus,
  LayoutGrid,
  CalendarDays,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { INTERVIEW_STATUSES, INTERVIEW_TYPES } from '@hireflow/shared';

export function InterviewsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');
  const [statusTab, setStatusTab] = useState<'all' | 'scheduled' | 'completed'>('scheduled');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const { data: interviews, isLoading } = useQuery<any[]>({
    queryKey: ['interviews', { statusTab, typeFilter }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusTab === 'scheduled') params.append('status', INTERVIEW_STATUSES.SCHEDULED);
      else if (statusTab === 'completed') params.append('status', INTERVIEW_STATUSES.COMPLETED);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      return apiClient(`/interviews?${params.toString()}`);
    },
  });

  const handleOpenFeedback = (interview: any) => {
    navigate(`/interviews/${interview.id}/feedback`);
  };

  const handleSelectCalendarInterview = (interview: any) => {
    navigate(`/interviews/${interview.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews & Evaluations"
        description="Coordinate candidate conversations, manage interviewer assignments, and track scorecards"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Interviews' }]}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-white dark:bg-[#142B3B]">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-slate-100 text-[#0F9D78] dark:bg-slate-800 dark:text-[#0F9D78]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Cards list view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-slate-100 text-[#0F9D78] dark:bg-slate-800 dark:text-[#0F9D78]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Month calendar view"
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </div>

            <Button onClick={() => setIsScheduleOpen(true)} className="gap-1.5 font-medium shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Schedule Interview</span>
            </Button>
          </div>
        }
      />

      {/* View & Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setStatusTab('scheduled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusTab === 'scheduled'
                ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upcoming Scheduled
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusTab === 'completed'
                ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Completed & Evaluated
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusTab === 'all'
                ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Interviews
          </button>
        </div>

        <FilterBar
          filters={[
            {
              label: 'Round Type',
              value: typeFilter,
              options: [
                { label: 'All Interview Types', value: 'ALL' },
                { label: 'Phone Screen', value: INTERVIEW_TYPES.PHONE },
                { label: 'Video Call', value: INTERVIEW_TYPES.VIDEO },
                { label: 'Technical', value: INTERVIEW_TYPES.TECHNICAL },
                { label: 'HR Interview', value: INTERVIEW_TYPES.HR },
                { label: 'Final Round', value: INTERVIEW_TYPES.FINAL },
              ],
              onChange: setTypeFilter,
            },
          ]}
          onClear={() => setTypeFilter('ALL')}
        />
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader count={6} className="h-48 rounded-xl" />
        </div>
      ) : interviews && interviews.length > 0 ? (
        viewMode === 'calendar' ? (
          <InterviewCalendar
            interviews={interviews}
            onSelectInterview={handleSelectCalendarInterview}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onOpenFeedback={handleOpenFeedback}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={CalendarIcon}
          title={statusTab === 'scheduled' ? 'No upcoming interviews' : 'No interviews found'}
          description={
            statusTab === 'scheduled'
              ? 'Schedule your next candidate conversation to align with hiring team availability.'
              : 'Try changing your filters or check the upcoming scheduled tab.'
          }
          action={
            <Button onClick={() => setIsScheduleOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Schedule Interview</span>
            </Button>
          }
        />
      )}

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />
    </div>
  );
}

