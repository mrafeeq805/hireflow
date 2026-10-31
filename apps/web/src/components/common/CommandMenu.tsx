import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Kanban,
  Calendar,
  Gift,
  CheckSquare,
  BarChart3,
  Settings,
  Plus,
  Search,
  UserPlus,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateJob?: () => void;
  onOpenCreateCandidate?: () => void;
}

export function CommandMenu({
  isOpen,
  onClose,
  onOpenCreateJob,
  onOpenCreateCandidate,
}: CommandMenuProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { label: 'Job Openings', path: '/jobs', icon: Briefcase },
    { label: 'Candidates Directory', path: '/candidates', icon: Users },
    { label: 'Recruitment Kanban Pipeline', path: '/pipeline', icon: Kanban },
    { label: 'All Applications', path: '/applications', icon: Briefcase },
    { label: 'Interview Calendar', path: '/interviews', icon: Calendar },
    { label: 'Offers & Hiring', path: '/offers', icon: Gift },
    { label: 'Follow-ups & Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Recruitment Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Team Management', path: '/team', icon: Users },
    { label: 'Workspace Settings', path: '/settings', icon: Settings },
  ];

  const quickActions = [
    {
      label: 'Create New Job Opening',
      action: () => {
        onClose();
        if (onOpenCreateJob) onOpenCreateJob();
        else navigate('/jobs/new');
      },
      icon: Plus,
    },
    {
      label: 'Add Candidate Profile',
      action: () => {
        onClose();
        if (onOpenCreateCandidate) onOpenCreateCandidate();
        else navigate('/candidates/new');
      },
      icon: UserPlus,
    },
  ];

  const filteredNav = navigationItems.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase())
  );
  const filteredActions = quickActions.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectNav = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 overflow-hidden max-w-xl border-slate-200 dark:border-slate-800">
        <div className="flex items-center border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to page..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none dark:text-slate-100"
            autoFocus
          />
          <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {filteredActions.length > 0 && (
            <div>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Actions
              </p>
              {filteredActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-[#D9F5EA]/40 hover:text-[#0F9D78] dark:text-slate-300 dark:hover:bg-[#0F9D78]/20 dark:hover:text-[#34D399]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#0F9D78]" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredNav.length > 0 && (
            <div>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </p>
              {filteredNav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectNav(item.path)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No results found for "{search}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

