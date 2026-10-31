import { Badge } from '@/components/ui/badge';
import {
  JOB_STATUSES,
  APPLICATION_STAGES,
  OFFER_STATUSES,
  INTERVIEW_STATUSES,
  INTERVIEW_OUTCOMES,
} from '@hireflow/shared';

interface StatusBadgeProps {
  status: string;
  className?: string;
  type?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Job Statuses
  if (status === JOB_STATUSES.PUBLISHED) {
    return <Badge variant="success" className={className}>Published</Badge>;
  }
  if (status === JOB_STATUSES.DRAFT) {
    return <Badge variant="secondary" className={className}>Draft</Badge>;
  }
  if (status === JOB_STATUSES.PAUSED) {
    return <Badge variant="warning" className={className}>Paused</Badge>;
  }
  if (status === JOB_STATUSES.CLOSED) {
    return <Badge variant="outline" className={className}>Closed</Badge>;
  }
  if (status === JOB_STATUSES.ARCHIVED) {
    return <Badge variant="outline" className={className}>Archived</Badge>;
  }

  // Application Stages
  if (status === APPLICATION_STAGES.APPLIED) {
    return <Badge variant="info" className={className}>Applied</Badge>;
  }
  if (status === APPLICATION_STAGES.SCREENING) {
    return <Badge variant="mint" className={className}>Screening</Badge>;
  }
  if (status === APPLICATION_STAGES.SHORTLISTED) {
    return <Badge variant="info" className={className}>Shortlisted</Badge>;
  }
  if (status === APPLICATION_STAGES.INTERVIEW) {
    return <Badge variant="navy" className={className}>Interview</Badge>;
  }
  if (status === APPLICATION_STAGES.ASSESSMENT) {
    return <Badge variant="warning" className={className}>Assessment</Badge>;
  }
  if (status === APPLICATION_STAGES.OFFER) {
    return <Badge variant="mint" className={className}>Offer</Badge>;
  }
  if (status === APPLICATION_STAGES.HIRED) {
    return <Badge variant="success" className={className}>Hired</Badge>;
  }
  if (status === APPLICATION_STAGES.REJECTED) {
    return <Badge variant="destructive" className={className}>Rejected</Badge>;
  }

  // Offer Statuses
  if (status === OFFER_STATUSES.ACCEPTED) {
    return <Badge variant="success" className={className}>Accepted</Badge>;
  }
  if (status === OFFER_STATUSES.SENT) {
    return <Badge variant="info" className={className}>Sent</Badge>;
  }
  if (status === OFFER_STATUSES.DECLINED) {
    return <Badge variant="destructive" className={className}>Declined</Badge>;
  }
  if (status === OFFER_STATUSES.EXPIRED) {
    return <Badge variant="secondary" className={className}>Expired</Badge>;
  }

  // Interview Outcomes
  if (status === INTERVIEW_OUTCOMES.PASSED) {
    return <Badge variant="success" className={className}>Passed</Badge>;
  }
  if (status === INTERVIEW_OUTCOMES.FAILED) {
    return <Badge variant="destructive" className={className}>Failed</Badge>;
  }
  if (status === INTERVIEW_STATUSES.COMPLETED) {
    return <Badge variant="secondary" className={className}>Completed</Badge>;
  }

  return <Badge variant="secondary" className={className}>{status}</Badge>;
}
