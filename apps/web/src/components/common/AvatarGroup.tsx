import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface UserItem {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface AvatarGroupProps {
  users: UserItem[];
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  const sizeClasses = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-xs';

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {visible.map((u) => (
        <Avatar
          key={u.id}
          className={`${sizeClasses} border-2 border-white dark:border-[#142B3B] ring-0`}
          title={u.name}
        >
          {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
          <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div
          className={`flex ${sizeClasses} items-center justify-center rounded-full border-2 border-white bg-slate-100 font-semibold text-slate-600 dark:border-[#142B3B] dark:bg-slate-800 dark:text-slate-300`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

