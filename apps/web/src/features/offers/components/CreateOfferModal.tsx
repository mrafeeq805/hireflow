import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { EMPLOYMENT_TYPES } from '@hireflow/shared';
import { AlertCircle } from 'lucide-react';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultApplicationId?: string;
}

export function CreateOfferModal({
  isOpen,
  onClose,
  defaultApplicationId,
}: CreateOfferModalProps) {
  const queryClient = useQueryClient();

  const [applicationId, setApplicationId] = useState(defaultApplicationId || '');
  const [baseSalary, setBaseSalary] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [bonus, setBonus] = useState('');
  const [equity, setEquity] = useState('');
  const [proposedJoiningDate, setProposedJoiningDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [employmentType, setEmploymentType] = useState<string>(EMPLOYMENT_TYPES.FULL_TIME);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load applications if not pre-provided
  const { data: applications } = useQuery<any[]>({
    queryKey: ['applicationsForOffer'],
    queryFn: () => apiClient('/applications'),
    enabled: isOpen && !defaultApplicationId,
  });

  useEffect(() => {
    if (defaultApplicationId) {
      setApplicationId(defaultApplicationId);
    }
  }, [defaultApplicationId]);

  useEffect(() => {
    if (isOpen && !proposedJoiningDate) {
      // Default joining date to 30 days from now
      const join = new Date();
      join.setDate(join.getDate() + 30);
      setProposedJoiningDate(join.toISOString().slice(0, 10));

      // Default expiry date to 7 days from now
      const exp = new Date();
      exp.setDate(exp.getDate() + 7);
      setExpiryDate(exp.toISOString().slice(0, 10));
    }
  }, [isOpen]);

  const createOfferMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient('/offers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['candidate'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      handleClose();
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to generate candidate offer.');
    },
  });

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!applicationId) {
      setError('Please select an applicant.');
      return;
    }

    if (!baseSalary || isNaN(Number(baseSalary))) {
      setError('Please enter a valid base salary amount.');
      return;
    }

    if (!proposedJoiningDate || !expiryDate) {
      setError('Please set the proposed joining date and offer expiry date.');
      return;
    }

    createOfferMutation.mutate({
      applicationId,
      baseSalary: Number(baseSalary),
      currency,
      bonus: bonus ? Number(bonus) : undefined,
      equity: equity.trim() || undefined,
      proposedJoiningDate: new Date(proposedJoiningDate).toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      employmentType,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Extend Job Offer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!defaultApplicationId && (
            <FormField label="Candidate / Job Application *" required>
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                required
              >
                <option value="">Select candidate application...</option>
                {applications?.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.candidate?.fullName} — {app.job?.title} ({app.stage})
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Base Salary *" required>
              <Input
                type="number"
                placeholder="120000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Currency">
              <select
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Annual Bonus / Target ($)">
              <Input
                type="number"
                placeholder="15000"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
              />
            </FormField>

            <FormField label="Equity / Options">
              <Input
                placeholder="0.25% or 5,000 RSUs"
                value={equity}
                onChange={(e) => setEquity(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Proposed Joining Date *" required>
              <Input
                type="date"
                value={proposedJoiningDate}
                onChange={(e) => setProposedJoiningDate(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Offer Expiry Date *" required>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Employment Type">
            <select
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#142B3B] dark:text-white"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value={EMPLOYMENT_TYPES.FULL_TIME}>Full-time</option>
              <option value={EMPLOYMENT_TYPES.PART_TIME}>Part-time</option>
              <option value={EMPLOYMENT_TYPES.CONTRACT}>Contract</option>
              <option value={EMPLOYMENT_TYPES.INTERNSHIP}>Internship</option>
            </select>
          </FormField>

          <FormField label="Internal Notes & Conditions">
            <Textarea
              placeholder="Sign-on bonus conditions, relocation allowance, benefits summary..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOfferMutation.isPending}>
              {createOfferMutation.isPending ? 'Generating...' : 'Create Draft Offer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

