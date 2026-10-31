import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { FollowUpCard } from '../components/FollowUpCard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CalendarCheck2,
  ListTodo,
} from 'lucide-react';
import { TASK_TYPES, PRIORITIES, TASK_STATUSES } from '@hireflow/shared';

export function TasksPage() {
  const [filterTab, setFilterTab] = useState<'all' | 'dueToday' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: tasks, isLoading } = useQuery<any[]>({
    queryKey: ['tasks', { filterTab, typeFilter, priorityFilter }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterTab === 'dueToday') params.append('filter', 'dueToday');
      else if (filterTab === 'upcoming') params.append('filter', 'upcoming');
      else if (filterTab === 'overdue') params.append('filter', 'overdue');
      else if (filterTab === 'completed') params.append('status', TASK_STATUSES.COMPLETED);

      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);

      return apiClient(`/tasks?${params.toString()}`);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups & Task Management"
        description="Stay on top of candidate outreach, interview prep, and hiring deadlines"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Tasks' }]}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 font-medium shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Add Action Item</span>
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-fit flex-wrap">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Open Tasks
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('dueToday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'dueToday'
                ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Due Today
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'upcoming'
                ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'overdue'
                ? 'bg-white dark:bg-[#142B3B] text-rose-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Overdue
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'completed'
                ? 'bg-white dark:bg-[#142B3B] text-slate-700 dark:text-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Completed
          </button>
        </div>

        <FilterBar
          filters={[
            {
              label: 'Task Type',
              value: typeFilter,
              options: [
                { label: 'All Types', value: 'ALL' },
                { label: 'Follow-up', value: TASK_TYPES.FOLLOW_UP },
                { label: 'Interview Prep', value: TASK_TYPES.INTERVIEW_PREP },
                { label: 'Offer Follow-up', value: TASK_TYPES.OFFER_FOLLOWUP },
                { label: 'Screening', value: TASK_TYPES.SCREENING },
                { label: 'General', value: TASK_TYPES.GENERAL },
              ],
              onChange: setTypeFilter,
            },
            {
              label: 'Priority',
              value: priorityFilter,
              options: [
                { label: 'All Priorities', value: 'ALL' },
                { label: 'Low', value: PRIORITIES.LOW },
                { label: 'Medium', value: PRIORITIES.MEDIUM },
                { label: 'High', value: PRIORITIES.HIGH },
                { label: 'Urgent', value: PRIORITIES.URGENT },
              ],
              onChange: setPriorityFilter,
            },
          ]}
          onClear={() => {
            setTypeFilter('ALL');
            setPriorityFilter('ALL');
          }}
        />
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader count={5} className="h-16 rounded-xl" />
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <FollowUpCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ListTodo}
          title={
            filterTab === 'overdue'
              ? 'No overdue tasks'
              : filterTab === 'dueToday'
              ? 'No tasks due today'
              : 'All caught up!'
          }
          description={
            filterTab === 'overdue'
              ? 'Great job keeping up with your candidate pipeline deadlines!'
              : 'Create a new reminder to stay organized with candidate follow-ups and offer letters.'
          }
          action={
            <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </Button>
          }
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

