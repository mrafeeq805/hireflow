import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Star,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDateTime, getInitials } from '@/lib/utils';
import { INTERVIEW_STATUSES, INTERVIEW_OUTCOMES } from '@hireflow/shared';

interface InterviewCardProps {
  interview: any;
  onOpenFeedback?: (interview: any) => void;
}

export function InterviewCard({ interview, onOpenFeedback }: InterviewCardProps) {
  const navigate = useNavigate();

  const isCompleted = interview.status === INTERVIEW_STATUSES.COMPLETED;
  const isCancelled = interview.status === INTERVIEW_STATUSES.CANCELLED;

  return (
    <Card className="p-5 hover:border-[#0F9D78]/50 hover:shadow-card transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="navy" className="text-[10px]">
                {interview.type}
              </Badge>
              {isCompleted ? (
                <Badge variant={interview.outcome === INTERVIEW_OUTCOMES.PASSED ? 'success' : 'secondary'}>
                  {interview.outcome || 'Completed'}
                </Badge>
              ) : isCancelled ? (
                <Badge variant="destructive">Cancelled</Badge>
              ) : (
                <Badge variant="mint">Scheduled</Badge>
              )}
            </div>

            <h3
              onClick={() => navigate(`/interviews/${interview.id}`)}
              className="text-base font-bold text-slate-900 hover:text-[#0F9D78] cursor-pointer transition-colors dark:text-slate-100"
            >
              {interview.application?.candidate?.fullName || 'Candidate'}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {interview.application?.job?.title || 'Job Opening'}
            </p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-[#0F9D78]" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDateTime(interview.scheduledAt)}
            </span>
            <span className="text-slate-400">({interview.durationMinutes} mins)</span>
          </div>

          {interview.meetingLink && (
            <div className="flex items-center gap-2">
              <Video className="h-3.5 w-3.5 text-slate-400" />
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-[#0F9D78] font-medium hover:underline flex items-center gap-1"
              >
                Join Video Meeting
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {interview.location && !interview.meetingLink && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{interview.location}</span>
            </div>
          )}
        </div>

        {/* Interviewers */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Interviewers
          </p>
          <div className="flex items-center gap-2">
            {interview.interviewers?.map((i: any) => (
              <div
                key={i.id}
                className="flex items-center gap-1.5 rounded-full bg-slate-100 py-0.5 px-2 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[9px]">
                    {getInitials(i.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{i.user?.name || 'Interviewer'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Scorecard button */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          {interview.scorecards?.length || 0} scorecard submitted
        </span>

        {onOpenFeedback && !isCancelled && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenFeedback(interview)}
            className="text-xs font-semibold text-[#0F9D78] border-[#0F9D78]/40 hover:bg-[#D9F5EA]/30"
          >
            <Star className="h-3.5 w-3.5 mr-1 text-[#0F9D78]" />
            Evaluate / Scorecard
          </Button>
        )}
      </div>
    </Card>
  );
}

