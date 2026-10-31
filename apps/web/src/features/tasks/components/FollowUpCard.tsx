import { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, User, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { TASK_STATUSES } from '@hireflow/shared';

interface FollowUpCardProps {
  task: any;
}

export function FollowUpCard({ task }: FollowUpCardProps) {
  const queryClient = useQueryClient();
  const isCompleted = task.status === TASK_STATUSES.COMPLETED || task.isCompleted;

  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      apiClient(`/tasks/${task.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleToggle = () => {
    const next = isCompleted ? TASK_STATUSES.TODO : TASK_STATUSES.COMPLETED;
    toggleStatusMutation.mutate(next);
  };

  const isDueToday = () => {
    const due = new Date(task.dueDate);
    const now = new Date();
    return (
      due.getDate() === now.getDate() &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear()
    );
  };

  const isOverdue = () => {
    return new Date(task.dueDate) < new Date() && !isCompleted && !isDueToday();
  };

  return (
    <Card
      className={`p-4 transition-all flex items-start gap-3.5 ${
        isCompleted
          ? 'bg-slate-50/50 opacity-60 dark:bg-slate-900/30'
          : 'bg-white hover:border-[#0F9D78]/50 hover:shadow-xs dark:bg-[#142B3B]'
      }`}
    >
      <button
        onClick={handleToggle}
        className="mt-0.5 text-slate-400 hover:text-[#0F9D78] transition-colors focus:outline-none shrink-0"
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-[#0F9D78] fill-[#D9F5EA] dark:fill-[#0F9D78]/20" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-sm font-semibold truncate ${
              isCompleted
                ? 'line-through text-slate-400'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {task.title}
          </h4>

          <div className="flex items-center gap-1.5 shrink-0">
            <PriorityBadge priority={task.priority} className="text-[9px] px-1 py-0" />
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">
              {task.type?.toLowerCase().replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        {task.description && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[11px] text-slate-400">
          <span
            className={`flex items-center gap-1 font-medium ${
              isOverdue()
                ? 'text-red-500 font-semibold'
                : isDueToday()
                ? 'text-amber-600 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calendar className="h-3 w-3" />
            {isDueToday() ? 'Due Today' : isOverdue() ? `Overdue (${formatDate(task.dueDate)})` : formatDate(task.dueDate)}
          </span>

          {task.candidate && (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <User className="h-3 w-3 text-slate-400" />
              {task.candidate.fullName}
            </span>
          )}

          {task.job && (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
              <Briefcase className="h-3 w-3 text-slate-400" />
              {task.job.title}
            </span>
          )}

          {task.assignee && (
            <div className="flex items-center gap-1 ml-auto">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px]">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              <span>{task.assignee.name}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

