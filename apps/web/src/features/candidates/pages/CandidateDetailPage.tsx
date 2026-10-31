import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { CandidateProfileHeader } from '../components/CandidateProfileHeader';
import { CommentThread } from '../components/CommentThread';
import { ScheduleInterviewModal } from '@/features/interviews/components/ScheduleInterviewModal';
import { CreateOfferModal } from '@/features/offers/components/CreateOfferModal';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatTimeAgo,
} from '@/lib/utils';
import {
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  Activity,
  Plus,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

export function CandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | undefined>(undefined);

  const { data: candidate, isLoading, isError } = useQuery<any>({
    queryKey: ['candidate', candidateId],
    queryFn: () => apiClient(`/candidates/${candidateId}`),
    enabled: !!candidateId,
  });

  const uploadDocMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient(`/candidates/${candidateId}/documents`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) =>
      apiClient(`/candidates/documents/${docId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F9D78] border-t-transparent" />
          <p className="text-xs text-slate-400">Loading candidate dossier...</p>
        </div>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <EmptyState
        title="Candidate not found"
        description="The candidate profile you requested could not be located or you may not have permission to view it."
        action={
          <Button onClick={() => navigate('/candidates')} variant="outline">
            Return to Candidates Directory
          </Button>
        }
      />
    );
  }

  const primaryApplication = candidate.applications?.[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadDocMutation.mutate(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={candidate.fullName}
        description={`Talent Profile • Sourced via ${candidate.source?.replace('_', ' ') || 'Direct'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Candidates', href: '/candidates' },
          { label: candidate.fullName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTaskOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Add Reminder</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAppId(primaryApplication?.id);
                setIsScheduleOpen(true);
              }}
              disabled={!candidate.applications?.length}
              className="gap-1.5 text-xs"
            >
              <Calendar className="h-3.5 w-3.5 text-[#0F9D78]" />
              <span>Schedule Interview</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedAppId(primaryApplication?.id);
                setIsOfferOpen(true);
              }}
              disabled={!candidate.applications?.length}
              className="gap-1.5 text-xs font-medium"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Extend Offer</span>
            </Button>
          </div>
        }
      />

      {/* Main Profile Header Banner */}
      <CandidateProfileHeader candidate={candidate} />

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-[#142B3B] border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-1.5 text-xs">
            <Award className="h-3.5 w-3.5" />
            <span>Applications ({candidate.applications?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            <span>Documents ({candidate.documents?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Internal Notes & Team Chat</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Summary */}
              <Card className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Professional Experience Summary
                </h3>
                {candidate.experienceSummary ? (
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {candidate.experienceSummary}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No summary provided.</p>
                )}
              </Card>

              {/* Verified Competencies */}
              <Card className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Skills & Technical Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills?.length > 0 ? (
                    candidate.skills.map((s: any) => (
                      <Badge key={s.id || s.name} variant="mint" className="text-xs py-1 px-2.5">
                        {s.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No skills tagged yet.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Quick Info Panel */}
            <div className="space-y-4">
              <Card className="p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Compensation & Availability
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Expected Salary</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {candidate.expectedSalary ? formatCurrency(candidate.expectedSalary) : 'Negotiable'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Notice Period</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {candidate.noticePeriodDays ? `${candidate.noticePeriodDays} days` : 'Immediate'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Candidate Source</span>
                    <Badge variant="secondary" className="mt-1 text-[11px]">
                      {candidate.source?.replace('_', ' ') || 'Direct'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Recruiter</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {candidate.assignedRecruiter?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Profile Created</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {formatDate(candidate.createdAt)} ({formatTimeAgo(candidate.createdAt)})
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Applications */}
        <TabsContent value="applications" className="space-y-4 mt-4">
          {candidate.applications?.length > 0 ? (
            <div className="space-y-4">
              {candidate.applications.map((app: any) => (
                <Card key={app.id} className="p-6 transition-all hover:border-[#0F9D78]/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#0F9D78]">
                          {app.job?.department}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs text-slate-400">{app.job?.location}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {app.job?.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <PriorityBadge priority={app.priority} />
                      <StatusBadge status={app.stage} type="application" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/jobs/${app.jobId}`)}
                        className="text-xs"
                      >
                        View Pipeline
                      </Button>
                    </div>
                  </div>

                  {/* Stage History */}
                  <div className="pt-4">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Stage History & Milestones
                    </h5>
                    <div className="space-y-2">
                      {app.stageHistory?.map((hist: any) => (
                        <div
                          key={hist.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900/30"
                        >
                          <span className="text-slate-700 dark:text-slate-300">
                            Transitioned from <span className="font-semibold">{hist.fromStage || 'Created'}</span> to{' '}
                            <span className="font-semibold text-[#0F9D78]">{hist.toStage}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDateTime(hist.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No active job applications"
              description="This candidate has not applied or been attached to any specific open positions yet."
            />
          )}
        </TabsContent>

        {/* Tab 3: Documents */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Uploaded Documents & Resumes
                </h4>
                <p className="text-xs text-slate-500">
                  Accepted formats: PDF, DOCX, PNG, JPG (up to 10MB)
                </p>
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <span className="inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium h-8 px-3 bg-primary text-white hover:bg-[#0B8063] cursor-pointer shadow-xs">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Document</span>
                </span>
              </label>
            </div>

            {candidate.documents?.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {candidate.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <FileText className="h-4 w-4 text-[#0F9D78]" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {doc.fileName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {Math.round((doc.fileSize || 0) / 1024)} KB • Uploaded {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteDocMutation.mutate(doc.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No files uploaded yet.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 4: Internal Notes */}
        <TabsContent value="notes" className="mt-4">
          <CommentThread candidateId={candidate.id} />
        </TabsContent>
      </Tabs>

      {/* Action Modals */}
      <ScheduleInterviewModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        defaultApplicationId={selectedAppId}
      />

      <CreateOfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        defaultApplicationId={selectedAppId}
      />

      <CreateTaskModal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        defaultCandidateId={candidate.id}
      />
    </div>
  );
}
