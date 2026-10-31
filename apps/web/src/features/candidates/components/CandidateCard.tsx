import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Building2, Briefcase, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';

interface CandidateCardProps {
  candidate: any;
  onClick?: () => void;
}

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/candidates/${candidate.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="p-5 hover:border-[#0F9D78]/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
            <AvatarFallback className="bg-[#D9F5EA] text-[#0F9D78] font-bold">
              {getInitials(candidate.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0F9D78] transition-colors truncate dark:text-slate-100">
              {candidate.fullName}
            </h4>
            {candidate.currentCompany && (
              <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                <span>{candidate.currentCompany}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-3.5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{candidate.location}</span>
            </div>
          )}
        </div>

        {candidate.tags && candidate.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {candidate.tags.slice(0, 3).map((tag: string, idx: number) => (
              <Badge key={idx} variant="mint" className="text-[10px] px-1.5 py-0 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {candidate.skills.slice(0, 3).map((s: any) => (
              <span
                key={s.id || s.name}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {s.name}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] capitalize">{candidate.source?.toLowerCase().replace('_', ' ')}</span>
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {candidate.applicationsCount || 0} applications
        </span>
      </div>
    </Card>
  );
}

