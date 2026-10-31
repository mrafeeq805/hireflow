import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { INTERVIEW_TYPES } from '@hireflow/shared';
import { AlertCircle } from 'lucide-react';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultApplicationId?: string;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  defaultApplicationId,
}: ScheduleInterviewModalProps) {
  const queryClient = useQueryClient();

  const [applicationId, setApplicationId] = useState(defaultApplicationId || '');
  const [type, setType] = useState<string>(INTERVIEW_TYPES.VIDEO);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load applications if not pre-provided
  const { data: applications } = useQuery<any[]>({
    queryKey: ['applicationsForSchedule'],
    queryFn: () => apiClient('/applications'),
    enabled: isOpen && !defaultApplicationId,
  });

  // Load workspace team members to assign interviewers
  const { data: members } = useQuery<any[]>({
    queryKey: ['workspaceMembers'],
    queryFn: () => apiClient('/workspaces/members'),
    enabled: isOpen,
  });

  useEffect(() => {
    if (defaultApplicationId) {
      setApplicationId(defaultApplicationId);
    }
  }, [defaultApplicationId]);

  // Set default schedule time to tomorrow at 10:00 AM
  useEffect(() => {
    if (isOpen && !scheduledAt) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const iso = tomorrow.toISOString().slice(0, 16);
      setScheduledAt(iso);
    }
  }, [isOpen]);

  const scheduleMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient('/interviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['candidate'] });
      queryClient.invalidateQueries({ queryKey: ['application'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      handleClose();
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to schedule interview.');
    },
  });

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleInterviewerToggle = (userId: string) => {
    setSelectedInterviewerIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!applicationId) {
      setError('Please select an applicant.');
      return;
    }

    if (!scheduledAt) {
      setError('Please select interview date and time.');
      return;
    }

    if (selectedInterviewerIds.length === 0) {
      setError('Please assign at least one interviewer.');
      return;
    }

    scheduleMutation.mutate({
      applicationId,
      type,
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMinutes: Number(durationMinutes),
      location: location.trim() || undefined,
      meetingLink: meetingLink.trim() || undefined,
      instructions: instructions.trim() || undefined,
      interviewerIds: selectedInterviewerIds,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!defaultApplicationId && (
            <FormField label="Candidate / Job Application *" required>
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                required
              >
                <option value="">Select candidate application...</option>
                {applications?.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.candidate?.fullName} — {app.job?.title} ({app.stage})
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Interview Stage / Type">
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value={INTERVIEW_TYPES.PHONE}>Phone Screen</option>
                <option value={INTERVIEW_TYPES.VIDEO}>Video Call</option>
                <option value={INTERVIEW_TYPES.TECHNICAL}>Technical Round</option>
                <option value={INTERVIEW_TYPES.HR}>HR Interview</option>
                <option value={INTERVIEW_TYPES.FINAL}>Final Executive Round</option>
              </select>
            </FormField>

            <FormField label="Duration (Minutes)">
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hr)</option>
                <option value={90}>90 minutes (1.5 hrs)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Date & Time *" required>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Meeting Video Link">
              <Input
                placeholder="https://meet.google.com/xyz"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </FormField>

            <FormField label="Physical Location (Optional)">
              <Input
                placeholder="Room 402 or Main HQ"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Assign Interviewers *" required>
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              {members?.map((m) => (
                <label
                  key={m.userId}
                  className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedInterviewerIds.includes(m.userId)}
                    onChange={() => handleInterviewerToggle(m.userId)}
                    className="rounded text-[#0F9D78] focus:ring-[#0F9D78]"
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {m.user?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">({m.role.toLowerCase()})</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Preparation Instructions">
            <Textarea
              placeholder="Candidate instructions, focus areas, scorecard guidelines..."
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </FormField>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={scheduleMutation.isPending}>
              {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

