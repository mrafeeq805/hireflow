import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Building2,
  DollarSign,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface CandidateDetailDrawerProps {
  candidate?: any;
  candidateId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateDetailDrawer({
  candidate: directCandidate,
  candidateId,
  isOpen,
  onClose,
}: CandidateDetailDrawerProps) {
  const navigate = useNavigate();

  const { data: fetchedCandidate } = useQuery<any>({
    queryKey: ['candidateDrawer', candidateId],
    queryFn: () => apiClient(`/candidates/${candidateId}`),
    enabled: isOpen && !!candidateId && !directCandidate,
  });

  const candidate = directCandidate || fetchedCandidate;

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-[#142B3B]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen sm:max-w-md bg-white shadow-2xl flex flex-col dark:bg-[#142B3B] dark:border-l dark:border-slate-800">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between dark:border-slate-800">
            <div className="flex items-center gap-3 truncate">
              <Avatar className="h-10 w-10 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                <AvatarFallback className="bg-[#D9F5EA] text-[#0F9D78] font-bold">
                  {getInitials(candidate.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="truncate">
                <h3 className="font-bold text-sm text-slate-900 truncate dark:text-slate-100">
                  {candidate.fullName}
                </h3>
                <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-[#0F9D78] font-medium"
                onClick={() => {
                  onClose();
                  navigate(`/candidates/${candidate.id}`);
                }}
              >
                <span>Full Profile</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body Tabs */}
          <div className="flex-1 overflow-y-auto p-5">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 text-xs">
                {/* Contact info card */}
                <div className="rounded-lg border border-slate-200/80 p-3 space-y-2 bg-slate-50/50 dark:border-slate-800 dark:bg-[#0B1822]/40">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  {candidate.expectedSalary && (
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      <span>Expected: {formatCurrency(candidate.expectedSalary)}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 dark:text-slate-200">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.map((s: any) => (
                        <span
                          key={s.id || s.name}
                          className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">No skills specified</span>
                    )}
                  </div>
                </div>

                {/* Experience summary */}
                {candidate.experienceSummary && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1.5 dark:text-slate-200">
                      Experience Summary
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {candidate.experienceSummary}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-3">
                {candidate.applications && candidate.applications.length > 0 ? (
                  candidate.applications.map((app: any) => (
                    <div
                      key={app.id}
                      className="rounded-lg border border-slate-200 p-3 bg-white hover:border-[#0F9D78] transition-colors dark:border-slate-800 dark:bg-[#0B1822]/40"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {app.job?.title || 'Job Opening'}
                        </h4>
                        <StatusBadge status={app.stage} />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Applied: {formatDate(app.appliedAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active job applications.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-3">
                {candidate.resumeUrl && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#0F9D78]" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Primary Resume
                        </p>
                        <p className="text-[10px] text-slate-400">PDF Document</p>
                      </div>
                    </div>
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#0F9D78] font-semibold hover:underline"
                    >
                      Download
                    </a>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
