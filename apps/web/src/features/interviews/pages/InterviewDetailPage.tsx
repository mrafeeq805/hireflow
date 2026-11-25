import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Users,
  Award,
  Star,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  formatDateTime,
  formatDate,
  getInitials,
} from '@/lib/utils';
import {
  INTERVIEW_STATUSES,
  INTERVIEW_OUTCOMES,
} from '@hireflow/shared';

export function InterviewDetailPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>(INTERVIEW_OUTCOMES.PASSED);

  const { data: interview, isLoading, isError } = useQuery<any>({
    queryKey: ['interview', interviewId],
    queryFn: () => apiClient(`/interviews/${interviewId}`),
    enabled: !!interviewId,
  });

  const outcomeMutation = useMutation({
    mutationFn: ({ outcome, notes }: { outcome: string; notes?: string }) =>
      apiClient(`/interviews/${interviewId}/outcome`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome, notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) =>
      apiClient(`/interviews/${interviewId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F9D78] border-t-transparent" />
          <p className="text-xs text-slate-400">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (isError || !interview) {
    return (
      <EmptyState
        title="Interview not found"
        description="The scheduled session you requested could not be retrieved."
        action={
          <Button onClick={() => navigate('/interviews')} variant="outline">
            Return to Interviews
          </Button>
        }
      />
    );
  }

  const candidate = interview.application?.candidate;
  const job = interview.application?.job;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${interview.type} Interview`}
        description={`Scheduled with ${candidate?.fullName} for ${job?.title}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Interviews', href: '/interviews' },
          { label: `${interview.type} Round` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(`/interviews/${interview.id}/feedback`)}
              className="gap-1.5 font-medium shadow-xs"
            >
              <Star className="h-4 w-4" />
              <span>Submit Evaluation Scorecard</span>
            </Button>
          </div>
        }
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Scorecards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Overview Card */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Badge variant="navy" className="text-xs">
                  {interview.type}
                </Badge>
                {interview.status === INTERVIEW_STATUSES.COMPLETED ? (
                  <Badge variant={interview.outcome === INTERVIEW_OUTCOMES.PASSED ? 'success' : 'secondary'}>
                    {interview.outcome}
                  </Badge>
                ) : interview.status === INTERVIEW_STATUSES.CANCELLED ? (
                  <Badge variant="destructive">Cancelled</Badge>
                ) : (
                  <Badge variant="mint">Scheduled</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="h-4 w-4 text-[#0F9D78]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatDateTime(interview.scheduledAt)}
                </span>
                <span>({interview.durationMinutes} mins)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Candidate</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {candidate?.fullName}
                </p>
                <p className="text-slate-500">{candidate?.email}</p>
                <p className="text-slate-500">{candidate?.phone || 'No phone'}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Role / Department</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {job?.title}
                </p>
                <p className="text-slate-500">{job?.department} • {job?.location}</p>
              </div>
            </div>

            {/* Video Call or Location */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {interview.meetingLink ? (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#0F9D78]" />
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#0F9D78] hover:underline flex items-center gap-1"
                  >
                    <span>Join Video Meeting</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : interview.location ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{interview.location}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No meeting link provided</span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/candidates/${candidate?.id}`)}
                className="text-xs"
              >
                View Full Candidate Profile
              </Button>
            </div>

            {interview.instructions && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold block text-slate-700 dark:text-slate-200 mb-1">
                  Preparation Instructions:
                </span>
                <p>{interview.instructions}</p>
              </div>
            )}
          </Card>

          {/* Submitted Scorecards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-[#0F9D78]" />
                <span>Interviewer Evaluations ({interview.scorecards?.length || 0})</span>
              </h3>
            </div>

            {interview.scorecards?.length > 0 ? (
              <div className="space-y-4">
                {interview.scorecards.map((sc: any) => (
                  <Card key={sc.id} className="p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-[#142B3B] text-white">
                            {getInitials(sc.interviewer?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {sc.interviewer?.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Evaluated on {formatDate(sc.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          sc.recommendation?.includes('YES')
                            ? 'success'
                            : sc.recommendation?.includes('NO')
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-xs font-bold"
                      >
                        {sc.recommendation?.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Scores Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Technical</span>
                        <span className="text-base font-extrabold text-[#0F9D78]">{sc.technicalScore || '—'}/5</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Communication</span>
                        <span className="text-base font-extrabold text-[#0F9D78]">{sc.communicationScore || '—'}/5</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Problem Solving</span>
                        <span className="text-base font-extrabold text-[#0F9D78]">{sc.problemSolvingScore || '—'}/5</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Culture Fit</span>
                        <span className="text-base font-extrabold text-[#0F9D78]">{sc.cultureFitScore || '—'}/5</span>
                      </div>
                    </div>

                    {sc.summary && (
                      <div className="text-xs text-slate-700 dark:text-slate-300 mt-2">
                        <span className="font-bold block text-slate-800 dark:text-slate-200 mb-0.5">Written Evaluation:</span>
                        <p className="leading-relaxed bg-slate-50/50 dark:bg-slate-900/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          {sc.summary}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                <Star className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No scorecards submitted yet
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Assigned interviewers can submit their structured evaluations once the round has completed.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate(`/interviews/${interview.id}/feedback`)}
                  className="mt-3 text-xs"
                >
                  Submit Scorecard
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Assigned Panel & Decision Actions */}
        <div className="space-y-6">
          {/* Panel */}
          <Card className="p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Assigned Interview Panel</span>
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {interview.interviewers?.map((item: any) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-[#142B3B] text-white">
                      {getInitials(item.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {item.user?.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.user?.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Outcome Decision Card */}
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Final Session Outcome
            </h4>

            {interview.status !== INTERVIEW_STATUSES.COMPLETED ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      outcomeMutation.mutate({
                        outcome: INTERVIEW_OUTCOMES.PASSED,
                        notes: outcomeNotes,
                      })
                    }
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1 text-[#0F9D78]" />
                    <span>Pass Round</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      outcomeMutation.mutate({
                        outcome: INTERVIEW_OUTCOMES.FAILED,
                        notes: outcomeNotes,
                      })
                    }
                    className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                  >
                    <XCircle className="h-4 w-4 mr-1 text-red-500" />
                    <span>Fail Round</span>
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => cancelMutation.mutate('Cancelled by recruiter')}
                  className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Cancel Scheduled Interview
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg text-xs">
                <span className="text-slate-400 block text-[11px]">Outcome Finalized</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">
                  {interview.outcome?.toLowerCase()}
                </span>
                {interview.outcomeNotes && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    {interview.outcomeNotes}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

