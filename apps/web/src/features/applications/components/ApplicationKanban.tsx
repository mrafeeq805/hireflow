import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { ApplicationCard } from './ApplicationCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { APPLICATION_STAGES, SOCKET_EVENTS } from '@hireflow/shared';

interface ApplicationKanbanProps {
  applications: any[];
  onSelectApplication: (app: any) => void;
}

const DEFAULT_STAGES_CONFIG = [
  { id: '1', name: APPLICATION_STAGES.APPLIED, color: '#0F9D78' },
  { id: '2', name: APPLICATION_STAGES.SCREENING, color: '#15966B' },
  { id: '3', name: APPLICATION_STAGES.SHORTLISTED, color: '#3B82F6' },
  { id: '4', name: APPLICATION_STAGES.INTERVIEW, color: '#8B5CF6' },
  { id: '5', name: APPLICATION_STAGES.ASSESSMENT, color: '#E6A23C' },
  { id: '6', name: APPLICATION_STAGES.OFFER, color: '#EC4899' },
  { id: '7', name: APPLICATION_STAGES.HIRED, color: '#10B981' },
  { id: '8', name: APPLICATION_STAGES.REJECTED, color: '#DC5B62' },
];

export function ApplicationKanban({
  applications,
  onSelectApplication,
}: ApplicationKanbanProps) {
  const queryClient = useQueryClient();
  const [activeApp, setActiveApp] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const updateStageMutation = useMutation({
    mutationFn: ({ appId, stage, note }: { appId: string; stage: string; note?: string }) =>
      apiClient(`/applications/${appId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage, note }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  // Listen to real-time socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStageChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    };

    socket.on(SOCKET_EVENTS.APPLICATION_STAGE_CHANGED, handleStageChanged);
    return () => {
      socket.off(SOCKET_EVENTS.APPLICATION_STAGE_CHANGED, handleStageChanged);
    };
  }, [queryClient]);

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    if (app) setActiveApp(app);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const targetStage = over.id as string;
    const appId = active.id as string;
    const app = applications.find((a) => a.id === appId);

    if (app && app.stage !== targetStage) {
      // If moving to rejected, prompt reason
      let note: string | undefined = undefined;
      if (targetStage === APPLICATION_STAGES.REJECTED) {
        const reason = window.prompt('Reason for rejection (optional):', 'Candidate withdrew or not aligned');
        if (reason) note = reason;
      }

      updateStageMutation.mutate({ appId, stage: targetStage, note });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none">
        {DEFAULT_STAGES_CONFIG.map((stage) => {
          const stageApps = applications.filter((a) => a.stage === stage.name);
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              applications={stageApps}
              onSelectApplication={onSelectApplication}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeApp ? (
          <div className="w-72 shadow-2xl rotate-2">
            <ApplicationCard
              application={activeApp}
              isDraggable={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

