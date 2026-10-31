import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OfferCard } from '../components/OfferCard';
import { CreateOfferModal } from '../components/CreateOfferModal';
import {
  Award,
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  FileCheck2,
} from 'lucide-react';
import { OFFER_STATUSES } from '@hireflow/shared';
import { useNavigate } from 'react-router-dom';

export function OffersPage() {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: offers, isLoading } = useQuery<any[]>({
    queryKey: ['offers', { statusTab }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusTab !== 'ALL') params.append('status', statusTab);
      return apiClient(`/offers?${params.toString()}`);
    },
  });

  const totalCount = offers?.length || 0;
  const acceptedCount = offers?.filter((o) => o.status === OFFER_STATUSES.ACCEPTED).length || 0;
  const pendingCount = offers?.filter((o) => o.status === OFFER_STATUSES.SENT || o.status === OFFER_STATUSES.DRAFT).length || 0;
  const acceptanceRate = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Offers & Hires"
        description="Oversee compensation packages, draft offers, track candidate acceptances, and finalize hires"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Offers' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/hired')}
              className="gap-1.5 font-medium shadow-xs text-xs"
            >
              <CheckCircle className="h-4 w-4 text-[#0F9D78]" />
              <span>View Hired Roster</span>
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 font-medium shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Extend New Offer</span>
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0F9D78] flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Extended</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Awaiting Decision</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0F9D78] flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Acceptance Rate</p>
            <p className="text-xl font-black text-[#0F9D78]">{acceptanceRate}%</p>
          </div>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setStatusTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusTab === 'ALL'
              ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          All Offers
        </button>
        <button
          type="button"
          onClick={() => setStatusTab(OFFER_STATUSES.DRAFT)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusTab === OFFER_STATUSES.DRAFT
              ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Drafts
        </button>
        <button
          type="button"
          onClick={() => setStatusTab(OFFER_STATUSES.SENT)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusTab === OFFER_STATUSES.SENT
              ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Sent / In Review
        </button>
        <button
          type="button"
          onClick={() => setStatusTab(OFFER_STATUSES.ACCEPTED)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusTab === OFFER_STATUSES.ACCEPTED
              ? 'bg-white dark:bg-[#142B3B] text-[#0F9D78] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Accepted
        </button>
        <button
          type="button"
          onClick={() => setStatusTab(OFFER_STATUSES.DECLINED)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusTab === OFFER_STATUSES.DECLINED
              ? 'bg-white dark:bg-[#142B3B] text-rose-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Declined
        </button>
      </div>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader count={6} className="h-56 rounded-xl" />
        </div>
      ) : offers && offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No offers found"
          description={
            statusTab !== 'ALL'
              ? 'No offers match this status filter.'
              : 'Once a candidate passes interview evaluations, draft and send an offer letter here.'
          }
          action={
            <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Create Offer</span>
            </Button>
          }
        />
      )}

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

