import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Sun,
  Moon,
  LogOut,
  User,
  UserPlus,
  Wifi,
  WifiOff,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationCenter } from '../common/NotificationCenter';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useSocketStore } from '@/stores/socketStore';
import { getInitials } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';

interface TopbarProps {
  onOpenCommandMenu: () => void;
  onOpenCreateJob?: () => void;
  onOpenCreateCandidate?: () => void;
  onOpenMobileSidebar?: () => void;
}

export function Topbar({
  onOpenCommandMenu,
  onOpenCreateJob,
  onOpenCreateCandidate,
  onOpenMobileSidebar,
}: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeWorkspace, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isConnected } = useSocketStore();

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      disconnectSocket();
      logout();
      navigate('/login');
    }
  };

  // Derive human friendly page title
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pathName = pathParts[0] || 'dashboard';
  const pageTitleMap: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    jobs: 'Job Openings',
    candidates: 'Candidates Directory',
    pipeline: 'Recruitment Kanban Pipeline',
    applications: 'All Applications',
    interviews: 'Interview Schedule & Calendar',
    offers: 'Offers & Hiring Management',
    tasks: 'Follow-ups & Tasks',
    analytics: 'Recruitment Analytics & Insights',
    team: 'Team & Permissions',
    settings: 'Workspace Settings',
  };
  const pageTitle = pageTitleMap[pathName] || 'Recruitment Platform';

  return (
    <header className="h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-20 dark:border-slate-800 dark:bg-[#0B1822]/90 shrink-0">
      {/* Left: Mobile Menu Trigger + Breadcrumbs / Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <h1 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate max-w-[150px] sm:max-w-xs md:max-w-none">
          {pageTitle}
        </h1>

        {/* Real-time Socket status indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0"
          title={isConnected ? 'Live real-time sync active' : 'Connecting to live sync...'}
        >
          {isConnected ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D78] animate-pulse" />
              <span className="text-[#0F9D78] font-semibold">Live Sync</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Search / Command Palette shortcut */}
        <button
          onClick={onOpenCommandMenu}
          className="hidden sm:flex items-center gap-2 h-8 px-2.5 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:border-slate-800 dark:bg-[#142B3B]/40 dark:hover:border-slate-700 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Quick search...</span>
          <kbd className="ml-1 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-800">
            Ctrl K
          </kbd>
        </button>

        {/* Quick Add Candidate */}
        {onOpenCreateCandidate && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCreateCandidate}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#0F9D78]" />
            <span>Add Candidate</span>
          </Button>
        )}

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </Button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0F9D78] focus:ring-offset-2">
              <Avatar className="h-8 w-8 ring-1 ring-slate-200 dark:ring-slate-700">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
                  {user?.name || 'Recruiter'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
                {activeWorkspace && (
                  <span className="inline-block mt-1 text-[10px] font-semibold text-[#0F9D78] uppercase">
                    Role: {activeWorkspace.role}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4 text-slate-400" />
              <span>Profile & Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

