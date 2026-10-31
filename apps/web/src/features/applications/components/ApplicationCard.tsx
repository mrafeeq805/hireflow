import { useDraggable } from '@dnd-kit/core';
import { Star, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { formatTimeAgo, getInitials } from '@/lib/utils';

interface ApplicationCardProps {
  application: any;
  onClick?: () => void;
  isDraggable?: boolean;
}

export function ApplicationCard({
  application,
  onClick,
  isDraggable = true,
}: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: application.id,
    disabled: !isDraggable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(isDraggable ? listeners : {})}
      {...(isDraggable ? attributes : {})}
      className={`touch-none select-none transition-all ${
        isDragging ? 'opacity-40 scale-95 shadow-xl rotate-1 z-50' : ''
      }`}
    >
      <Card
        onClick={onClick}
        className="p-3.5 hover:border-[#0F9D78]/60 hover:shadow-card transition-all cursor-grab active:cursor-grabbing bg-white dark:bg-[#142B3B]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
              <AvatarFallback className="bg-[#D9F5EA] text-[#0F9D78] font-bold text-[10px]">
                {getInitials(application.candidate?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <h4 className="text-xs font-bold text-slate-900 truncate dark:text-slate-100 hover:text-[#0F9D78]">
                {application.candidate?.fullName}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {application.job?.title}
              </p>
            </div>
          </div>

          <PriorityBadge priority={application.priority} className="text-[9px] px-1 py-0" />
        </div>

        {/* Tags or skills */}
        {application.candidate?.skills && application.candidate.skills.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {application.candidate.skills.slice(0, 2).map((s: any) => (
              <span
                key={s.id || s.name}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {s.name}
              </span>
            ))}
          </div>
        )}

        {/* Bottom meta: scorecards rating + applied time */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            {application.latestScorecardAvg ? (
              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {application.latestScorecardAvg}
              </span>
            ) : (
              <span className="text-slate-300 dark:text-slate-600">No rating</span>
            )}
          </div>

          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {formatTimeAgo(application.appliedAt)}
          </span>
        </div>
      </Card>
    </div>
  );
}

