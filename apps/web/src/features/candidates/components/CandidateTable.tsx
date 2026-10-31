import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { Building2, Mail, MapPin } from 'lucide-react';

interface CandidateTableProps {
  candidates: any[];
  onSelectCandidate?: (candidate: any) => void;
  onSelect?: (candidate: any) => void;
}

export function CandidateTable({ candidates, onSelectCandidate, onSelect }: CandidateTableProps) {
  const handleSelect = onSelect || onSelectCandidate;
  if (candidates.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-[#142B3B]/40">
        No candidates found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#142B3B]/40">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-[#0B1822]">
          <tr>
            <th className="py-3 px-4">Candidate</th>
            <th className="py-3 px-4">Current Role & Company</th>
            <th className="py-3 px-4">Contact Info</th>
            <th className="py-3 px-4">Tags & Source</th>
            <th className="py-3 px-4">Assigned Recruiter</th>
            <th className="py-3 px-4 text-center">Applications</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {candidates.map((c) => (
            <tr
              key={c.id}
              onClick={() => handleSelect?.(c)}
              className="cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-[#1D3D53]/30"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 ring-1 ring-slate-200 dark:ring-slate-700">
                    <AvatarFallback className="bg-[#D9F5EA] text-[#0F9D78] font-bold text-xs">
                      {getInitials(c.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#0F9D78]">
                      {c.fullName}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.location || 'Location not specified'}
                    </p>
                  </div>
                </div>
              </td>

              <td className="py-3 px-4">
                {c.currentCompany ? (
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.currentCompany}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Unspecified</span>
                )}
              </td>

              <td className="py-3 px-4">
                <p className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-400" />
                  {c.email}
                </p>
                {c.phone && <p className="text-[11px] text-slate-400 mt-0.5">{c.phone}</p>}
              </td>

              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400 capitalize">
                    {c.source?.toLowerCase().replace('_', ' ')}
                  </span>
                  {c.tags &&
                    c.tags.slice(0, 2).map((t: string, i: number) => (
                      <Badge key={i} variant="mint" className="text-[9px] px-1 py-0">
                        {t}
                      </Badge>
                    ))}
                </div>
              </td>

              <td className="py-3 px-4">
                <span className="text-slate-600 dark:text-slate-400">
                  {c.assignedRecruiter?.name || 'Unassigned'}
                </span>
              </td>

              <td className="py-3 px-4 text-center">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {c.applicationsCount || 0}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
