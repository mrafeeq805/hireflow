import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from './FormField';
import { apiClient } from '@/lib/api';

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, setAuth, user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectWorkspace = (ws: any) => {
    setActiveWorkspace(ws);
    queryClient.invalidateQueries();
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsSubmitting(true);
    try {
      const res: any = await apiClient('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: newOrgName.trim() }),
      });

      const updatedWorkspaces = [...workspaces, res];
      if (user && accessToken) {
        setAuth(user, updatedWorkspaces, accessToken, res.id);
      }
      setIsCreateOpen(false);
      setNewOrgName('');
      queryClient.invalidateQueries();
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/60 p-2 text-left text-xs transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-[#142B3B]/40 dark:hover:bg-[#142B3B]/80 outline-none">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0F9D78] text-white font-bold text-xs">
              {activeWorkspace?.name?.substring(0, 1) || 'W'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                {activeWorkspace?.name || 'Workspace'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {activeWorkspace?.role?.toLowerCase() || 'Member'}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400 ml-1" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-[11px] text-slate-400 uppercase tracking-wider">
            Workspaces
          </DropdownMenuLabel>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => handleSelectWorkspace(ws)}
              className="flex items-center justify-between text-xs cursor-pointer py-2"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{ws.name}</span>
              </div>
              {ws.id === activeWorkspace?.id && (
                <Check className="h-3.5 w-3.5 text-[#0F9D78]" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 text-xs text-[#0F9D78] font-medium cursor-pointer py-2 hover:text-[#0B8063]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create new workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreateWorkspace}>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <FormField label="Organization / Workspace Name" required>
                <Input
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Acme Talent Acquisition"
                  autoFocus
                />
              </FormField>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} disabled={!newOrgName.trim()}>
                Create Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

