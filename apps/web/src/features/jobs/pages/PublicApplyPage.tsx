import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  Briefcase,
  AlertCircle,
  Building2,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export function PublicApplyPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    portfolioUrl: '',
    currentCompany: '',
    expectedSalary: '',
    noticePeriodDays: '',
    resumeUrl: '',
    coverLetter: '',
    skillsText: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch public job details
  const { data: job, isLoading, isError } = useQuery<any>({
    queryKey: ['publicJob', jobId],
    queryFn: () =>
      apiClient(`/jobs/public/${jobId}`, {
        skipAuth: true,
      }),
  });

  const applyMutation = useMutation({
    mutationFn: (payload: any) =>
      apiClient(`/jobs/public/${jobId}/apply`, {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to submit application. Please check your information.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Please provide your full name and email address.');
      return;
    }

    const skillsArray = formData.skillsText
      ? formData.skillsText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    applyMutation.mutate({
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      location: formData.location.trim() || undefined,
      linkedinUrl: formData.linkedinUrl.trim() || undefined,
      portfolioUrl: formData.portfolioUrl.trim() || undefined,
      currentCompany: formData.currentCompany.trim() || undefined,
      expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : undefined,
      noticePeriodDays: formData.noticePeriodDays ? Number(formData.noticePeriodDays) : undefined,
      resumeUrl: formData.resumeUrl.trim() || undefined,
      coverLetter: formData.coverLetter.trim() || undefined,
      skills: skillsArray,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1822]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F9D78] border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading position details...</p>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#0B1822]">
        <Briefcase className="h-12 w-12 text-slate-400 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Job Opening Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          This position may have been closed or is not accepting public applications at this time.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#0B1822] text-slate-800 dark:text-slate-100 pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 dark:border-slate-800 dark:bg-[#142B3B]/80 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to={`/jobs/public/${job.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Job Details</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Powered by</span>
            <span className="font-bold text-[#0F9D78]">HireFlow</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 pt-8">
        {/* Success Confirmation Card */}
        {isSubmitted ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm dark:border-slate-800 dark:bg-[#142B3B]">
            <div className="h-16 w-16 bg-[#D9F5EA] text-[#0F9D78] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Application Received!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto">
              Thank you for applying to the <span className="font-semibold">{job.title}</span> position at{' '}
              <span className="font-semibold">{job.workspace?.name}</span>. Our hiring team will review your profile and contact you if there is a match.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button onClick={() => navigate(`/jobs/public/${job.id}`)} variant="outline">
                View Job Description
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs dark:border-slate-800 dark:bg-[#142B3B] overflow-hidden">
            {/* Header info */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="mint" className="text-[11px] font-semibold">
                  {job.department}
                </Badge>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Apply for {job.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please complete the application form below. All fields marked with * are required.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="m-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 dark:bg-red-950/30 dark:border-red-800/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1. Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name *" required>
                    <Input
                      placeholder="Jane Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </FormField>

                  <FormField label="Email Address *" required>
                    <Input
                      type="email"
                      placeholder="jane.doe@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Phone Number">
                    <Input
                      placeholder="+1 (555) 234-5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Current Location">
                    <Input
                      placeholder="City, State / Remote"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </FormField>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. Professional Background
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Current Company">
                    <Input
                      placeholder="e.g. Acme Inc."
                      value={formData.currentCompany}
                      onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Notice Period (Days)">
                    <Input
                      type="number"
                      placeholder="e.g. 30"
                      value={formData.noticePeriodDays}
                      onChange={(e) => setFormData({ ...formData, noticePeriodDays: e.target.value })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="LinkedIn Profile URL">
                    <Input
                      placeholder="https://linkedin.com/in/janedoe"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Portfolio or GitHub URL">
                    <Input
                      placeholder="https://github.com/janedoe"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Expected Annual Salary ($)">
                    <Input
                      type="number"
                      placeholder="e.g. 135000"
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Resume URL or Hosted Link">
                    <Input
                      placeholder="https://drive.google.com/... or cloud link"
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    />
                  </FormField>
                </div>

                <FormField label="Skills (Comma-separated)">
                  <Input
                    placeholder="React, TypeScript, Node.js, GraphQL, PostgreSQL"
                    value={formData.skillsText}
                    onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    List your primary tools, technologies, and core competencies.
                  </p>
                </FormField>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. Cover Letter & Summary
                </h3>

                <FormField label="Brief Cover Letter or Experience Summary">
                  <Textarea
                    placeholder="Share why you're interested in this role and what relevant experience makes you a great fit..."
                    rows={5}
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  />
                </FormField>
              </div>

              {/* Submit CTA */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/jobs/public/${job.id}`)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="px-6 font-semibold"
                >
                  {applyMutation.isPending ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

