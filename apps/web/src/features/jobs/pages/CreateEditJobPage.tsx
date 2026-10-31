import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
} from '@hireflow/shared';

export function CreateEditJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const isEditing = Boolean(jobId);
  const navigate = useNavigate();
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
    preferredSkillsText: '',
    status: JOB_STATUSES.PUBLISHED,
    internalNotes: '',
  });

  const [error, setError] = useState<string | null>(null);

  // If editing, load job data
  const { data: existingJob, isLoading: isLoadingJob } = useQuery<any>({
    queryKey: ['job', jobId],
    queryFn: () => apiClient(`/jobs/${jobId}`),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingJob) {
      const required = existingJob.skills
        ?.filter((s: any) => s.isRequired)
        .map((s: any) => s.name)
        .join(', ');
      const preferred = existingJob.skills
        ?.filter((s: any) => !s.isRequired)
        .map((s: any) => s.name)
        .join(', ');

      setFormData({
        title: existingJob.title || '',
        department: existingJob.department || 'Engineering',
        location: existingJob.location || '',
        employmentType: existingJob.employmentType || EMPLOYMENT_TYPES.FULL_TIME,
        experienceLevel: existingJob.experienceLevel || EXPERIENCE_LEVELS.MID,
        salaryMin: existingJob.salaryMin?.toString() || '',
        salaryMax: existingJob.salaryMax?.toString() || '',
        vacancies: existingJob.vacancies || 1,
        description: existingJob.description || '',
        responsibilities: existingJob.responsibilities || '',
        requiredSkillsText: required || '',
        preferredSkillsText: preferred || '',
        status: existingJob.status || JOB_STATUSES.PUBLISHED,
        internalNotes: existingJob.internalNotes || '',
      });
    }
  }, [existingJob]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return apiClient(`/jobs/${jobId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        return apiClient('/jobs', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      navigate(isEditing ? `/jobs/${jobId}` : `/jobs/${res.id}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to save job opening');
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

    const preferredSkills = formData.preferredSkillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    saveMutation.mutate({
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
      preferredSkills,
      status: formData.status,
      internalNotes: formData.internalNotes.trim() || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={isEditing ? `Edit Job: ${formData.title}` : 'Post New Job Opening'}
        description="Specify job requirements, compensation, vacancies, and evaluation criteria."
        breadcrumbs={[
          { label: 'Jobs', href: '/jobs' },
          { label: isEditing ? 'Edit Job' : 'New Job' },
        ]}
      />

      <Card className="p-6">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Job Title" required className="md:col-span-2">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Backend Engineer (Node.js & Go)"
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
                placeholder="e.g. 140000"
              />
            </FormField>

            <FormField label="Max Salary ($ USD)">
              <Input
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                placeholder="e.g. 180000"
              />
            </FormField>

            <FormField label="Number of Vacancies">
              <Input
                type="number"
                min="1"
                value={formData.vacancies}
                onChange={(e) => setFormData({ ...formData, vacancies: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Publication Status">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F9D78] dark:border-slate-800 dark:bg-slate-900"
              >
                <option value={JOB_STATUSES.PUBLISHED}>Published (Visible on career portal)</option>
                <option value={JOB_STATUSES.DRAFT}>Draft (Internal only)</option>
                <option value={JOB_STATUSES.PAUSED}>Paused</option>
                <option value={JOB_STATUSES.CLOSED}>Closed</option>
              </select>
            </FormField>
          </div>

          <FormField label="Required Skills" hint="Comma separated">
            <Input
              value={formData.requiredSkillsText}
              onChange={(e) => setFormData({ ...formData, requiredSkillsText: e.target.value })}
              placeholder="TypeScript, React, Node.js, PostgreSQL"
            />
          </FormField>

          <FormField label="Preferred Skills" hint="Optional, comma separated">
            <Input
              value={formData.preferredSkillsText}
              onChange={(e) => setFormData({ ...formData, preferredSkillsText: e.target.value })}
              placeholder="Docker, Kubernetes, GraphQL, AWS"
            />
          </FormField>

          <FormField label="Job Description & Overview" required>
            <Textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a clear description of the role, team objectives, and tech stack..."
            />
          </FormField>

          <FormField label="Key Responsibilities">
            <Textarea
              rows={4}
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              placeholder="• Architect reliable systems...&#10;• Collaborate with cross-functional partners..."
            />
          </FormField>

          <FormField label="Internal Hiring Notes" hint="Not visible on public portal">
            <Textarea
              rows={2}
              value={formData.internalNotes}
              onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
              placeholder="Target interview questions or recruiter alignment notes..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => navigate('/jobs')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {isEditing ? 'Save Changes' : 'Publish Job'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

