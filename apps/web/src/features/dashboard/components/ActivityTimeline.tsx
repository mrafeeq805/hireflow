import {
  UserPlus,
  ArrowRight,
  Calendar,
  Star,
  Gift,
  Award,
  Clock,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatTimeAgo, getInitials } from '@/lib/utils';

interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  details?: string | null;
  createdAt: string;
  user?: {
    name: string;
    avatarUrl?: string | null;
  } | null;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No recent recruitment activity recorded yet.
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CANDIDATE_CREATED':
      case 'APPLICATION_SUBMITTED':
        return <UserPlus className="h-4 w-4 text-[#0F9D78]" />;
      case 'STAGE_CHANGED':
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      case 'INTERVIEW_SCHEDULED':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'FEEDBACK_SUBMITTED':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'OFFER_CREATED':
      case 'OFFER_SENT':
        return <Gift className="h-4 w-4 text-pink-500" />;
      case 'CANDIDATE_HIRED':
        return <Award className="h-4 w-4 text-emerald-500" />;
      case 'JOB_CREATED':
      case 'JOB_PUBLISHED':
        return <Briefcase className="h-4 w-4 text-[#0F9D78]" />;
      default:
        return <FileCheck className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatActivityText = (item: ActivityItem) => {
    let parsed: any = {};
    try {
      if (item.details) parsed = JSON.parse(item.details);
    } catch {
      // Ignore
    }

    switch (item.action) {
      case 'CANDIDATE_CREATED':
        return `New candidate profile created: ${parsed.name || 'Candidate'}`;
      case 'APPLICATION_SUBMITTED':
        return `${parsed.candidateName || 'Candidate'} applied for ${parsed.jobTitle || 'Job Opening'}`;
      case 'STAGE_CHANGED':
        return `Moved ${parsed.candidateName || 'candidate'} from ${parsed.fromStage} to ${parsed.toStage}`;
      case 'INTERVIEW_SCHEDULED':
        return `Scheduled ${parsed.type || 'interview'} with ${parsed.candidateName || 'candidate'}`;
      case 'FEEDBACK_SUBMITTED':
        return `Submitted evaluation for ${parsed.candidateName || 'candidate'} (${parsed.recommendation || 'Scorecard'})`;
      case 'OFFER_SENT':
        return `Sent offer letter to ${parsed.candidateName || 'candidate'}`;
      case 'CANDIDATE_HIRED':
        return `🎉 Successfully hired ${parsed.candidateName || 'candidate'} for ${parsed.jobTitle || 'role'}!`;
      case 'JOB_PUBLISHED':
        return `Published new job opening: ${parsed.title || 'Role'}`;
      default:
        return item.action.toLowerCase().replace(/_/g, ' ');
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {activities.map((item) => (
        <div key={item.id} className="relative group">
          {/* Dot / Icon */}
          <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-slate-200 dark:bg-[#142B3B] dark:ring-slate-700">
            {getActionIcon(item.action)}
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {formatActivityText(item)}
            </p>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
              <Clock className="h-2.5 w-2.5" />
              {formatTimeAgo(item.createdAt)}
            </span>
          </div>

          {item.user && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              by <span className="font-medium text-slate-600 dark:text-slate-300">{item.user.name}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

