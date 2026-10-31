import { useState } from 'react';
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
import { TASK_TYPES, PRIORITIES } from '@hireflow/shared';
import { AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCandidateId?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  defaultCandidateId,
}: CreateTaskModalProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>(TASK_TYPES.FOLLOW_UP);
  const [priority, setPriority] = useState<string>(PRIORITIES.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [candidateId, setCandidateId] = useState(defaultCandidateId || '');
  const [error, setError] = useState<string | null>(null);

  // Load workspace members
  const { data: members } = useQuery<any[]>({
    queryKey: ['workspaceMembers'],
    queryFn: () => apiClient('/workspaces/members'),
    enabled: isOpen,
  });

  // Load candidates for linking
  const { data: candidates } = useQuery<any[]>({
    queryKey: ['candidatesSimple'],
    queryFn: () => apiClient('/candidates'),
    enabled: isOpen && !defaultCandidateId,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['candidate'] });
      handleClose();
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to create task.');
    },
  });

  const handleClose = () => {
    setError(null);
    setTitle('');
    setDescription('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      priority,
      dueDate: new Date(dueDate).toISOString(),
      assigneeId: assigneeId || undefined,
      candidateId: candidateId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Action Item or Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <FormField label="Task Title *" required>
            <Input
              placeholder="e.g. Follow up on reference check / Send interview prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Task Type">
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value={TASK_TYPES.FOLLOW_UP}>Candidate Follow-up</option>
                <option value={TASK_TYPES.INTERVIEW_PREP}>Interview Prep</option>
                <option value={TASK_TYPES.OFFER_FOLLOWUP}>Offer Follow-up</option>
                <option value={TASK_TYPES.SCREENING}>Resume Screening</option>
                <option value={TASK_TYPES.GENERAL}>General</option>
              </select>
            </FormField>

            <FormField label="Priority">
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value={PRIORITIES.LOW}>Low</option>
                <option value={PRIORITIES.MEDIUM}>Medium</option>
                <option value={PRIORITIES.HIGH}>High</option>
                <option value={PRIORITIES.URGENT}>Urgent</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Due Date *" required>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Assignee">
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Assigned to Me</option>
                {members?.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {!defaultCandidateId && (
            <FormField label="Related Candidate (Optional)">
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
              >
                <option value="">None (General recruitment task)</option>
                {candidates?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.email})
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <FormField label="Description / Context">
            <Textarea
              placeholder="Action items, specific questions to ask or notes..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

