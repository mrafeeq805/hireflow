import {
  Mail,
  Phone,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  ExternalLink,
  FileText,
  Plus,
  Edit,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, getInitials } from '@/lib/utils';

interface CandidateProfileHeaderProps {
  candidate: any;
  onEdit?: () => void;
  onApplyToJob?: () => void;
  onUploadDoc?: () => void;
}

export function CandidateProfileHeader({
  candidate,
  onEdit,
  onApplyToJob,
  onUploadDoc,
}: CandidateProfileHeaderProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#142B3B]/40 mb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left: Avatar + Identity */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0 ring-2 ring-[#0F9D78]/30">
            <AvatarFallback className="bg-[#D9F5EA] text-[#0F9D78] font-bold text-xl">
              {getInitials(candidate.fullName)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {candidate.fullName}
              </h1>
              <Badge variant="mint" className="capitalize">
                Source: {candidate.source?.toLowerCase().replace('_', ' ')}
              </Badge>
            </div>

            {candidate.currentCompany && (
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>{candidate.currentCompany}</span>
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {candidate.email}
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {candidate.phone}
                </span>
              )}
              {candidate.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {candidate.location}
                </span>
              )}
              {candidate.expectedSalary && (
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  Expected: {formatCurrency(candidate.expectedSalary)}
                </span>
              )}
              {candidate.noticePeriodDays !== undefined && candidate.noticePeriodDays !== null && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {candidate.noticePeriodDays} days notice
                </span>
              )}
            </div>

            {/* Tags & External Links */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {candidate.tags &&
                candidate.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}

              {candidate.linkedinUrl && (
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sky-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  LinkedIn
                </a>
              )}
              {candidate.portfolioUrl && (
                <a
                  href={candidate.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#0F9D78] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Portfolio
                </a>
              )}
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F9D78] hover:underline"
                >
                  <FileText className="h-3 w-3" />
                  View Resume
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onUploadDoc && (
            <Button size="sm" variant="outline" onClick={onUploadDoc}>
              <FileText className="h-3.5 w-3.5 mr-1 text-[#0F9D78]" />
              Upload Document
            </Button>
          )}
          {onApplyToJob && (
            <Button size="sm" onClick={onApplyToJob}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Connect to Job
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit className="h-3.5 w-3.5 mr-1 text-slate-500" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

