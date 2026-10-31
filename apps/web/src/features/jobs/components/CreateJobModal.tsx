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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
} from '@hireflow/shared';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: '',
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    experienceLevel: EXPERIENCE_LEVELS.MID,
    salaryMin: '',
    salaryMax: '',
    vacancies: 1,
    description: '',
    responsibilities: '',
    requiredSkillsText: '',
    status: JOB_STATUSES.PUBLISHED,
  });

  const [error, setError] = useState<string | null>(null);

  const createJobMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient('/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      onClose();
      setFormData({
        title: '',
        department: 'Engineering',
        location: '',
        employmentType: EMPLOYMENT_TYPES.FULL_TIME,
        experienceLevel: EXPERIENCE_LEVELS.MID,
        salaryMin: '',
        salaryMax: '',
        vacancies: 1,
        description: '',
        responsibilities: '',
        requiredSkillsText: '',
        status: JOB_STATUSES.PUBLISHED,
      });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create job');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Title, Location, and Description are required');
      return;
    }

    const requiredSkills = formData.requiredSkillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    createJobMutation.mutate({
      title: formData.title.trim(),
      department: formData.department,
      location: formData.location.trim(),
      employmentType: formData.employmentType,
      experienceLevel: formData.experienceLevel,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
      vacancies: Number(formData.vacancies) || 1,
      description: formData.description.trim(),
      responsibilities: formData.responsibilities.trim() || undefined,
      requiredSkills,
      status: formData.status,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Post New Job Opening</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField label="Job Title" required className="md:col-span-2">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer (React)"
                autoFocus
              />
            </FormField>

            <FormField label="Department" required>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F9D78] dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design & UX">Design & UX</option>
                <option value="Product">Product</option>
                <option value="Talent Acquisition">Talent Acquisition</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </FormField>

            <FormField label="Location" required>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA (or Remote)"
              />
            </FormField>

            <FormField label="Employment Type">
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F9D78] dark:border-slate-800 dark:bg-slate-900"
              >
                <option value={EMPLOYMENT_TYPES.FULL_TIME}>Full-Time</option>
                <option value={EMPLOYMENT_TYPES.PART_TIME}>Part-Time</option>
                <option value={EMPLOYMENT_TYPES.CONTRACT}>Contract</option>
                <option value={EMPLOYMENT_TYPES.INTERNSHIP}>Internship</option>
                <option value={EMPLOYMENT_TYPES.REMOTE}>Remote</option>
              </select>
            </FormField>

            <FormField label="Experience Level">
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F9D78] dark:border-slate-800 dark:bg-slate-900"
              >
                <option value={EXPERIENCE_LEVELS.ENTRY}>Entry Level</option>
                <option value={EXPERIENCE_LEVELS.MID}>Mid Level</option>
                <option value={EXPERIENCE_LEVELS.SENIOR}>Senior</option>
                <option value={EXPERIENCE_LEVELS.LEAD}>Lead / Principal</option>
                <option value={EXPERIENCE_LEVELS.EXECUTIVE}>Executive</option>
              </select>
            </FormField>

            <FormField label="Min Salary ($ USD)">
              <Input
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                placeholder="e.g. 130000"
              />
            </FormField>

            <FormField label="Max Salary ($ USD)">
              <Input
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                placeholder="e.g. 165000"
              />
            </FormField>

            <FormField label="Open Vacancies">
              <Input
                type="number"
                min="1"
                value={formData.vacancies}
                onChange={(e) => setFormData({ ...formData, vacancies: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Status">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F9D78] dark:border-slate-800 dark:bg-slate-900"
              >
                <option value={JOB_STATUSES.PUBLISHED}>Published (Live)</option>
                <option value={JOB_STATUSES.DRAFT}>Draft</option>
              </select>
            </FormField>

            <FormField
              label="Required Skills"
              hint="Comma separated"
              className="md:col-span-2"
            >
              <Input
                value={formData.requiredSkillsText}
                onChange={(e) => setFormData({ ...formData, requiredSkillsText: e.target.value })}
                placeholder="React, TypeScript, Tailwind CSS, REST APIs"
              />
            </FormField>

            <FormField label="Job Description" required className="md:col-span-2">
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a comprehensive summary of the role, team, and expectations..."
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createJobMutation.isPending}>
              Create Job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

