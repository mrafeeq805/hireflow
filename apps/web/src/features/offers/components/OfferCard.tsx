import {
  DollarSign,
  Calendar,
  Gift,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Award,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { OFFER_STATUSES } from '@hireflow/shared';

interface OfferCardProps {
  offer: any;
  onOpenDetails?: () => void;
}

export function OfferCard({ offer, onOpenDetails }: OfferCardProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, declineReason }: { status: string; declineReason?: string }) =>
      apiClient(`/offers/${offer.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, declineReason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const markHiredMutation = useMutation({
    mutationFn: () =>
      apiClient('/offers/mark-hired', {
        method: 'POST',
        body: JSON.stringify({ applicationId: offer.applicationId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const isAccepted = offer.status === OFFER_STATUSES.ACCEPTED;
  const isDeclined = offer.status === OFFER_STATUSES.DECLINED;

  return (
    <Card className="p-5 hover:border-[#0F9D78]/50 hover:shadow-card transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {offer.application?.job?.department || 'Department'}
              </span>
              <StatusBadge status={offer.status} />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {offer.application?.candidate?.fullName || 'Candidate'}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {offer.application?.job?.title || 'Job Opening'}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 outline-none">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {offer.status !== OFFER_STATUSES.SENT && (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ status: OFFER_STATUSES.SENT })}
                >
                  Mark as Sent
                </DropdownMenuItem>
              )}
              {offer.status !== OFFER_STATUSES.ACCEPTED && (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ status: OFFER_STATUSES.ACCEPTED })}
                  className="text-emerald-600 font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                  Mark Accepted
                </DropdownMenuItem>
              )}
              {offer.status !== OFFER_STATUSES.DECLINED && (
                <DropdownMenuItem
                  onClick={() => {
                    const reason = window.prompt('Reason for decline (optional):');
                    updateStatusMutation.mutate({
                      status: OFFER_STATUSES.DECLINED,
                      declineReason: reason || undefined,
                    });
                  }}
                  className="text-red-600"
                >
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Mark Declined
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Compensation details */}
        <div className="mt-4 rounded-lg bg-slate-50 p-3.5 dark:bg-[#0B1822]/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500">Base Salary</span>
            <span className="text-base font-extrabold text-[#0F9D78]">
              {formatCurrency(offer.baseSalary, offer.currency)}
            </span>
          </div>

          {(offer.bonus || offer.equity) && (
            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              {offer.bonus && (
                <div className="flex justify-between">
                  <span>Bonus:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    +{formatCurrency(offer.bonus, offer.currency)}
                  </span>
                </div>
              )}
              {offer.equity && (
                <div className="flex justify-between">
                  <span>Equity / Options:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {offer.equity}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Start Date:
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {formatDate(offer.proposedJoiningDate)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Offer Expiry:
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {formatDate(offer.expiryDate)}
            </span>
          </div>
        </div>

        {offer.declineReason && (
          <div className="mt-3 p-2 bg-red-50 text-[11px] text-red-600 rounded border border-red-100">
            Decline reason: {offer.declineReason}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 capitalize">
          {offer.employmentType?.toLowerCase().replace('_', ' ')}
        </span>

        {isAccepted && (
          <Button
            size="sm"
            onClick={() => markHiredMutation.mutate()}
            isLoading={markHiredMutation.isPending}
            className="text-xs bg-[#0F9D78] hover:bg-[#0B8063]"
          >
            <Award className="h-3.5 w-3.5 mr-1" />
            Official Hire
          </Button>
        )}
      </div>
    </Card>
  );
}

