import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateTable } from '../components/CandidateTable';
import { CandidateDetailDrawer } from '../components/CandidateDetailDrawer';
import { CreateCandidateModal } from '../components/CreateCandidateModal';
import {
  Users,
  Plus,
  LayoutGrid,
  List,
  Sparkles,
  Download,
} from 'lucide-react';
import { CANDIDATE_SOURCES } from '@hireflow/shared';

export function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('ALL');
  const [tag, setTag] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: candidates, isLoading } = useQuery<any[]>({
    queryKey: ['candidates', { search, source, tag }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (source !== 'ALL') params.append('source', source);
      if (tag !== 'ALL') params.append('tag', tag);
      return apiClient(`/candidates?${params.toString()}`);
    },
  });

  const handleSelectCandidate = (candidate: any) => {
    setSelectedCandidateId(candidate.id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Directory"
        description="Search, screen, and track talent profiles across all your open pipelines"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Candidates' }]}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-white dark:bg-[#142B3B]">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-100 text-[#0F9D78] dark:bg-slate-800 dark:text-[#0F9D78]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-[#0F9D78] dark:bg-slate-800 dark:text-[#0F9D78]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Grid cards view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 font-medium shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Add Candidate</span>
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        searchComponent={
          <SearchInput
            placeholder="Search candidates by name, email, skills, current company..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-80"
          />
        }
        filters={[
          {
            label: 'Source',
            value: source,
            options: [
              { label: 'All Sources', value: 'ALL' },
              { label: 'LinkedIn', value: CANDIDATE_SOURCES.LINKEDIN },
              { label: 'Referral', value: CANDIDATE_SOURCES.REFERRAL },
              { label: 'Career Page', value: CANDIDATE_SOURCES.CAREER_PAGE },
              { label: 'Direct Sourcing', value: CANDIDATE_SOURCES.DIRECT },
              { label: 'Agency', value: CANDIDATE_SOURCES.AGENCY },
            ],
            onChange: setSource,
          },
        ]}
        onClear={() => {
          setSearch('');
          setSource('ALL');
          setTag('ALL');
        }}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader count={5} className="h-16 rounded-xl" />
        </div>
      ) : candidates && candidates.length > 0 ? (
        viewMode === 'table' ? (
          <CandidateTable candidates={candidates} onSelect={handleSelectCandidate} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onClick={() => handleSelectCandidate(candidate)}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description={
            search || source !== 'ALL'
              ? 'Try modifying your search keywords or clearing your active filters.'
              : 'Start sourcing your talent pipeline by adding your first candidate profile.'
          }
          action={
            <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Add First Candidate</span>
            </Button>
          }
        />
      )}

      {/* Candidate Profile Quick Drawer */}
      <CandidateDetailDrawer
        candidateId={selectedCandidateId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCandidateId(null);
        }}
      />

      {/* Create Candidate Modal */}
      <CreateCandidateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
