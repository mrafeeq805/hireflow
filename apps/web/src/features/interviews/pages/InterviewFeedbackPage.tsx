import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { SCORECARD_RECOMMENDATIONS } from '@hireflow/shared';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export function InterviewFeedbackPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [ratings, setRatings] = useState({
    technicalRating: 4,
    communicationRating: 4,
    problemSolvingRating: 4,
    experienceRating: 4,
    cultureFitRating: 4,
  });

  const [recommendation, setRecommendation] = useState<string>(
    SCORECARD_RECOMMENDATIONS.YES
  );
  const [summaryNotes, setSummaryNotes] = useState('');
  const [strengths, setStrengths] = useState('');
  const [areasToImprove, setAreasToImprove] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: interview, isLoading, isError } = useQuery<any>({
    queryKey: ['interview', interviewId],
    queryFn: () => apiClient(`/interviews/${interviewId}`),
    enabled: !!interviewId,
  });

  const submitScorecardMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient(`/scorecards/interviews/${interviewId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      navigate(`/interviews/${interviewId}`);
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to submit scorecard.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F9D78] border-t-transparent" />
          <p className="text-xs text-slate-400">Loading interview scorecard...</p>
        </div>
      </div>
    );
  }

  if (isError || !interview) {
    return (
      <EmptyState
        title="Interview not found"
        description="The interview you are attempting to evaluate could not be loaded."
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

  const handleRatingChange = (key: keyof typeof ratings, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!summaryNotes.trim() || summaryNotes.trim().length < 5) {
      setError('Please provide detailed summary feedback (minimum 5 characters).');
      return;
    }

    submitScorecardMutation.mutate({
      ...ratings,
      recommendation,
      summaryNotes: summaryNotes.trim(),
      strengths: strengths.trim() || undefined,
      areasToImprove: areasToImprove.trim() || undefined,
    });
  };

  const categories = [
    { key: 'technicalRating' as const, label: 'Technical Competence & Execution', desc: 'Domain depth, coding quality, tool fluency' },
    { key: 'communicationRating' as const, label: 'Communication & Articulation', desc: 'Clarity, listening skills, structured thoughts' },
    { key: 'problemSolvingRating' as const, label: 'Problem Solving & Critical Thinking', desc: 'Analytical approach, handling ambiguity' },
    { key: 'experienceRating' as const, label: 'Relevant Domain Experience', desc: 'Past projects, leadership, architectural decisions' },
    { key: 'cultureFitRating' as const, label: 'Company Values & Culture Fit', desc: 'Collaboration, ownership mindset, growth drive' },
  ];

  const recommendations = [
    { value: SCORECARD_RECOMMENDATIONS.STRONG_YES, label: 'Strong Yes', color: 'bg-emerald-600 text-white' },
    { value: SCORECARD_RECOMMENDATIONS.YES, label: 'Yes', color: 'bg-emerald-500 text-white' },
    { value: SCORECARD_RECOMMENDATIONS.MAYBE, label: 'Maybe / Neutral', color: 'bg-amber-500 text-white' },
    { value: SCORECARD_RECOMMENDATIONS.NO, label: 'No', color: 'bg-rose-500 text-white' },
    { value: SCORECARD_RECOMMENDATIONS.STRONG_NO, label: 'Strong No', color: 'bg-rose-700 text-white' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Structured Interview Scorecard"
        description={`Submit your standardized evaluation for ${candidate?.fullName}`}
        breadcrumbs={[
          { label: 'Interviews', href: '/interviews' },
          { label: `${interview.type} Round`, href: `/interviews/${interview.id}` },
          { label: 'Submit Scorecard' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/interviews/${interview.id}`)}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Session</span>
          </Button>
        }
      />

      {/* Candidate Brief Info */}
      <Card className="p-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#142B3B] text-white flex items-center justify-center font-bold text-sm">
            {candidate?.fullName?.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {candidate?.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              Applying for <span className="font-semibold text-slate-700 dark:text-slate-300">{job?.title}</span>
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#0F9D78]" />
          <span>{formatDateTime(interview.scheduledAt)}</span>
        </div>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Competencies Rating Matrix */}
        <Card className="p-4 sm:p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Core Competency Ratings (1 to 5)
          </h3>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#142B3B]"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {cat.label}
                  </h4>
                  <p className="text-[11px] text-slate-400">{cat.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleRatingChange(cat.key, val)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                        ratings[cat.key] === val
                          ? 'bg-[#0F9D78] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendation */}
        <Card className="p-4 sm:p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Overall Recommendation
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {recommendations.map((rec) => (
              <button
                key={rec.value}
                type="button"
                onClick={() => setRecommendation(rec.value)}
                className={`py-2 px-3 rounded-lg text-xs font-bold text-center border transition-all ${
                  recommendation === rec.value
                    ? `${rec.color} border-transparent shadow-xs`
                    : 'bg-white dark:bg-[#142B3B] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {rec.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Written Notes */}
        <Card className="p-4 sm:p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            3. Qualitative Feedback
          </h3>

          <FormField label="Summary & Final Thoughts *" required>
            <Textarea
              placeholder="Synthesize your overall assessment, key takeaways, and reasons for your recommendation..."
              rows={4}
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Key Strengths Observed">
              <Textarea
                placeholder="What impressed you most about the candidate?"
                rows={3}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
              />
            </FormField>

            <FormField label="Areas for Growth / Concerns">
              <Textarea
                placeholder="What risks or areas of improvement did you identify?"
                rows={3}
                value={areasToImprove}
                onChange={(e) => setAreasToImprove(e.target.value)}
              />
            </FormField>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/interviews/${interview.id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitScorecardMutation.isPending}
            className="px-6 font-semibold shadow-xs"
          >
            {submitScorecardMutation.isPending ? 'Submitting Scorecard...' : 'Submit Scorecard'}
          </Button>
        </div>
      </form>
    </div>
  );
}

