import { useState } from 'react';
import { Star, CheckCircle, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { SCORECARD_RECOMMENDATIONS } from '@hireflow/shared';

interface InterviewScorecardProps {
  interview: any;
  isOpen: boolean;
  onClose: () => void;
}

export function InterviewScorecard({
  interview,
  isOpen,
  onClose,
}: InterviewScorecardProps) {
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

  const submitScorecardMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient(`/scorecards/interviews/${interview.id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to submit scorecard');
    },
  });

  const averageRating = (
    Object.values(ratings).reduce((a, b) => a + b, 0) / 5
  ).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryNotes.trim()) {
      setError('Please provide summary feedback and evaluation notes');
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

  const renderRatingStars = (
    category: keyof typeof ratings,
    label: string
  ) => {
    const val = ratings[category];
    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRatings({ ...ratings, [category]: star })}
              className="p-1 focus:outline-none transition-transform hover:scale-125"
            >
              <Star
                className={`h-4 w-4 ${
                  star <= val
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 w-4 text-xs font-bold text-slate-700 dark:text-slate-300">
            {val}
          </span>
        </div>
      </div>
    );
  };

  if (!interview) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle>Interview Evaluation Scorecard</DialogTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate: {interview.application?.candidate?.fullName} —{' '}
                  {interview.application?.job?.title}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Overall Score
                </span>
                <span className="text-lg font-bold text-[#0F9D78]">
                  {averageRating} / 5.0
                </span>
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-md">
              {error}
            </div>
          )}

          {/* Rating Matrix */}
          <div className="mt-4 rounded-lg border border-slate-200/80 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-[#0B1822]/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Structured Competency Ratings
            </h4>
            {renderRatingStars('technicalRating', 'Technical Skills & Proficiency')}
            {renderRatingStars('communicationRating', 'Communication & Articulation')}
            {renderRatingStars('problemSolvingRating', 'Problem Solving & Critical Thinking')}
            {renderRatingStars('experienceRating', 'Relevant Domain Experience')}
            {renderRatingStars('cultureFitRating', 'Role & Culture Alignment')}
          </div>

          {/* Recommendation Selector */}
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Overall Hiring Recommendation <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: SCORECARD_RECOMMENDATIONS.STRONG_YES, label: 'Strong Yes', color: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' },
                { val: SCORECARD_RECOMMENDATIONS.YES, label: 'Yes', color: 'border-[#0F9D78] text-[#0F9D78] bg-[#D9F5EA]/30' },
                { val: SCORECARD_RECOMMENDATIONS.MAYBE, label: 'Maybe', color: 'border-amber-500 text-amber-700 bg-amber-50' },
                { val: SCORECARD_RECOMMENDATIONS.NO, label: 'No', color: 'border-red-400 text-red-600 bg-red-50' },
                { val: SCORECARD_RECOMMENDATIONS.STRONG_NO, label: 'Strong No', color: 'border-red-600 text-red-700 bg-red-100 font-bold' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.val}
                  onClick={() => setRecommendation(item.val)}
                  className={`py-2 px-1 rounded-md text-xs font-medium border text-center transition-all ${
                    recommendation === item.val
                      ? `${item.color} ring-2 ring-[#0F9D78]`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text feedback */}
          <div className="mt-4 space-y-3">
            <FormField label="Summary Feedback & Notes" required>
              <Textarea
                rows={3}
                value={summaryNotes}
                onChange={(e) => setSummaryNotes(e.target.value)}
                placeholder="Synthesize overall candidate impression, technical depth, and specific feedback..."
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Notable Strengths">
                <Textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Key areas where candidate excelled..."
                />
              </FormField>

              <FormField label="Areas to Improve / Risks">
                <Textarea
                  rows={2}
                  value={areasToImprove}
                  onChange={(e) => setAreasToImprove(e.target.value)}
                  placeholder="Gaps or concerns identified..."
                />
              </FormField>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitScorecardMutation.isPending}>
              Submit Evaluation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

