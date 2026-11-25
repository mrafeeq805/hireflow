import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  Layers,
  Calendar,
  Award,
  CheckSquare,
  BarChart3,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import { WorkspaceSwitcher } from '../common/WorkspaceSwitcher';
import { Logo } from '../common/Logo';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { ROLES } from '@hireflow/shared';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateJob?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onOpenCreateJob,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { activeWorkspace } = useAuthStore();
  const isAdminOrOwner =
    activeWorkspace?.role === ROLES.OWNER || activeWorkspace?.role === ROLES.ADMIN;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Job Openings', path: '/jobs', icon: Briefcase },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'Recruitment Kanban', path: '/pipeline', icon: Kanban },
    { label: 'Applications', path: '/applications', icon: Layers },
    { label: 'Interviews', path: '/interviews', icon: Calendar },
    { label: 'Offers & Hiring', path: '/offers', icon: Award },
    { label: 'Tasks & Follow-ups', path: '/tasks', icon: CheckSquare },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Team Members', path: '/team', icon: UserCheck },
    ...(isAdminOrOwner ? [{ label: 'Settings', path: '/settings', icon: Settings }] : []),
  ];

  const sidebarContent = (isMobileMode = false) => (
    <>
      {/* Brand Logo Header */}
      <div
        className={cn(
          'p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center transition-all',
          !isMobileMode && isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <Logo size="sm" iconOnly={!isMobileMode && isCollapsed} clickable href="/dashboard" />
        {(!isCollapsed || isMobileMode) && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F9D78] bg-[#D9F5EA] dark:bg-[#0F9D78]/20 dark:text-[#34D399] px-2 py-0.5 rounded border border-[#B6EAD5] dark:border-[#0F9D78]/40">
              ATS
            </span>
            {isMobileMode && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Workspace Switcher */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        {!isCollapsed || isMobileMode ? (
          <div className="w-full">
            <WorkspaceSwitcher />
          </div>
        ) : (
          <div
            className="w-9 h-9 mx-auto rounded-lg bg-[#D9F5EA] dark:bg-[#142B3B] border border-[#B6EAD5] dark:border-slate-700 flex items-center justify-center text-[#0F9D78] dark:text-[#34D399] font-bold text-xs shadow-xs"
            title={activeWorkspace?.name || 'Workspace'}
          >
            {activeWorkspace?.name?.charAt(0) || 'W'}
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      {(!isCollapsed || isMobileMode) && onOpenCreateJob && (
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              if (isMobileMode && onCloseMobile) onCloseMobile();
              onOpenCreateJob();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F9D78] hover:bg-[#0B8063] active:bg-[#096B53] py-2 px-3 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Post New Job</span>
          </button>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isMobileMode && onCloseMobile) onCloseMobile();
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-[#0F9D78] text-white shadow-xs font-semibold dark:bg-[#0F9D78]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#142B3B]/60 dark:hover:text-slate-100',
                  !isMobileMode && isCollapsed && 'justify-center px-0'
                )
              }
              title={!isMobileMode && isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  {(!isCollapsed || isMobileMode) && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer / Collapse Toggle (Desktop only) */}
      {!isMobileMode && (
        <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors mx-auto cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (md and up) */}
      <aside
        className={cn(
          'hidden md:flex relative flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#0B1822] transition-all duration-300 z-30 select-none shrink-0',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* 2. Mobile Drawer Sidebar (below md) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-[#142B3B]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer container */}
          <aside className="relative flex flex-col w-72 max-w-[82vw] bg-white dark:bg-[#0B1822] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}

