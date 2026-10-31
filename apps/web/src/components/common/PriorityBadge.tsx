import { Badge } from '@/components/ui/badge';
import { APPLICATION_PRIORITIES } from '@hireflow/shared';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (priority === APPLICATION_PRIORITIES.URGENT) {
    return (
      <Badge variant="destructive" className={className}>
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        Urgent
      </Badge>
    );
  }
  if (priority === APPLICATION_PRIORITIES.HIGH) {
    return (
      <Badge variant="warning" className={className}>
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
        High
      </Badge>
    );
  }
  if (priority === APPLICATION_PRIORITIES.MEDIUM) {
    return (
      <Badge variant="info" className={className}>
        Medium
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className={className}>
      Low
    </Badge>
  );
}

