import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { ApplicationKanban } from '../components/ApplicationKanban';
import { CandidateDetailDrawer } from '@/features/candidates/components/CandidateDetailDrawer';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Kanban, List, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RecruitmentKanbanPage() {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load jobs for filtering
  const { data: jobs } = useQuery<any[]>({
    queryKey: ['jobsDropdown'],
    queryFn: () => apiClient('/jobs'),
  });

  // Load applications
  const { data: applications, isLoading } = useQuery<any[]>({
    queryKey: ['applicationsKanban', selectedJobId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedJobId !== 'ALL') params.append('jobId', selectedJobId);
      return apiClient(`/applications?${params.toString()}`);
    },
  });

  const handleSelectApplication = (app: any) => {
    setSelectedCandidateId(app.candidateId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Kanban"
        description="Drag and drop candidate cards across pipeline stages with real-time sync"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Applications', href: '/applications' },
          { label: 'Kanban Board' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/applications')}
              className="gap-1.5 font-medium shadow-xs text-xs"
            >
              <List className="h-4 w-4" />
              <span>List View</span>
            </Button>
          </div>
        }
      />

      {/* Filter */}
      <FilterBar
        filters={[
          {
            label: 'Filter by Job Position',
            value: selectedJobId,
            options: [
              { label: 'All Open Positions', value: 'ALL' },
              ...(jobs?.map((j) => ({ label: `${j.title} (${j.department})`, value: j.id })) || []),
            ],
            onChange: setSelectedJobId,
          },
        ]}
        onClear={() => setSelectedJobId('ALL')}
      />

      {/* Kanban Board Container */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          <SkeletonLoader count={4} className="h-96 rounded-xl" />
        </div>
      ) : (
        <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <ApplicationKanban
            applications={applications || []}
            onSelectApplication={handleSelectApplication}
          />
        </div>
      )}

      {/* Candidate Profile Drawer */}
      <CandidateDetailDrawer
        candidateId={selectedCandidateId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCandidateId(null);
        }}
      />
    </div>
  );
}

