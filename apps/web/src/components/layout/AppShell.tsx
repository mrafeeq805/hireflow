import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandMenu } from '../common/CommandMenu';
import { CreateJobModal } from '@/features/jobs/components/CreateJobModal';
import { CreateCandidateModal } from '@/features/candidates/components/CreateCandidateModal';

interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps = {}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenCreateJob={() => setIsCreateJobOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar
          onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
          onOpenCreateJob={() => setIsCreateJobOpen(true)}
          onOpenCreateCandidate={() => setIsCreateCandidateOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-[#0B1822]/50 p-6">
          <div className="mx-auto max-w-7xl">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Global Command Menu */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        onOpenCreateJob={() => setIsCreateJobOpen(true)}
        onOpenCreateCandidate={() => setIsCreateCandidateOpen(true)}
      />

      {/* Global Quick Create Job Modal */}
      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
      />

      {/* Global Quick Create Candidate Modal */}
      <CreateCandidateModal
        isOpen={isCreateCandidateOpen}
        onClose={() => setIsCreateCandidateOpen(false)}
      />
    </div>
  );
}
