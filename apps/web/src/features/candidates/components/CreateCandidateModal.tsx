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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { CANDIDATE_SOURCES } from '@hireflow/shared';

interface CreateCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultJobId?: string;
}

export function CreateCandidateModal({
  isOpen,
  onClose,
  defaultJobId,
}: CreateCandidateModalProps) {
  const queryClient = useQueryClient();

  // Load published jobs for connecting candidate
  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ['jobs'],
    queryFn: () => apiClient('/jobs'),
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    currentCompany: '',
    expectedSalary: '',
    noticePeriodDays: '',
    source: CANDIDATE_SOURCES.DIRECT,
    skillsText: '',
    tagsText: '',
    selectedJobId: defaultJobId || '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  const createCandidateMutation = useMutation({
    mutationFn: async (data: any) => {
      const candidateRes: any = await apiClient('/candidates', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // If user selected a job to connect, create application
      if (formData.selectedJobId) {
        await apiClient('/applications', {
          method: 'POST',
          body: JSON.stringify({
            jobId: formData.selectedJobId,
            candidateId: candidateRes.id,
            stage: 'APPLIED',
          }),
        });
      }

      return candidateRes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      onClose();
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        currentCompany: '',
        expectedSalary: '',
        noticePeriodDays: '',
        source: CANDIDATE_SOURCES.DIRECT,
        skillsText: '',
        tagsText: '',
        selectedJobId: '',
        notes: '',
      });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create candidate profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Full Name and Email are required');
      return;
    }

    const skills = formData.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = formData.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createCandidateMutation.mutate({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      location: formData.location.trim() || undefined,
      currentCompany: formData.currentCompany.trim() || undefined,
      expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : undefined,
      noticePeriodDays: formData.noticePeriodDays ? Number(formData.noticePeriodDays) : undefined,
      source: formData.source,
      skills,
      tags,
      internalNotes: formData.notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Candidate Profile</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField label="Full Name" required>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Jane Doe"
                autoFocus
              />
            </FormField>

            <FormField label="Email Address" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@example.com"
              />
            </FormField>

            <FormField label="Phone Number">
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 012-3456"
              />
            </FormField>

            <FormField label="Current Location">
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Austin, TX"
              />
            </FormField>

            <FormField label="Current Company">
              <Input
                value={formData.currentCompany}
                onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                placeholder="e.g. Stripe, Google, Freelance"
              />
            </FormField>

            <FormField label="Expected Salary ($ USD)">
              <Input
                type="number"
                value={formData.expectedSalary}
                onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                placeholder="e.g. 150000"
              />
            </FormField>

            <FormField label="Notice Period (Days)">
              <Input
                type="number"
                value={formData.noticePeriodDays}
                onChange={(e) => setFormData({ ...formData, noticePeriodDays: e.target.value })}
                placeholder="e.g. 30"
              />
            </FormField>

            <FormField label="Candidate Source">
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F9D78] dark:border-slate-800 dark:bg-slate-900"
              >
                <option value={CANDIDATE_SOURCES.DIRECT}>Direct Application</option>
                <option value={CANDIDATE_SOURCES.LINKEDIN}>LinkedIn</option>
                <option value={CANDIDATE_SOURCES.CAREER_PAGE}>Career Page</option>
                <option value={CANDIDATE_SOURCES.REFERRAL}>Employee Referral</option>
                <option value={CANDIDATE_SOURCES.AGENCY}>Recruitment Agency</option>
                <option value={CANDIDATE_SOURCES.INDEED}>Indeed</option>
                <option value={CANDIDATE_SOURCES.OTHER}>Other</option>
              </select>
            </FormField>

            <FormField label="Connect to Job Opening" className="md:col-span-2">
              <select
                value={formData.selectedJobId}
                onChange={(e) => setFormData({ ...formData, selectedJobId: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F9D78] dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="">None (Pool candidate for later)</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} — {job.department} ({job.status})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Key Skills"
              hint="Comma separated"
              className="md:col-span-2"
            >
              <Input
                value={formData.skillsText}
                onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
                placeholder="TypeScript, React, PostgreSQL, Docker"
              />
            </FormField>

            <FormField
              label="Tags"
              hint="Comma separated"
              className="md:col-span-2"
            >
              <Input
                value={formData.tagsText}
                onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                placeholder="Senior, Urgent, Ex-FAANG, Top Tier"
              />
            </FormField>

            <FormField label="Internal Recruiter Notes" className="md:col-span-2">
              <Textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add background notes or screening observations..."
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createCandidateMutation.isPending}>
              Save Candidate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

