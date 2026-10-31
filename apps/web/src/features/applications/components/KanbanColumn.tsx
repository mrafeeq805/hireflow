import { useDroppable } from '@dnd-kit/core';
import { ApplicationCard } from './ApplicationCard';

interface KanbanColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
  };
  applications: any[];
  onSelectApplication: (app: any) => void;
}

export function KanbanColumn({
  stage,
  applications,
  onSelectApplication,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.name,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 shrink-0 rounded-xl border bg-slate-100/60 p-3 transition-colors dark:bg-[#0B1822]/60 ${
        isOver
          ? 'border-[#0F9D78] bg-[#D9F5EA]/20 dark:border-[#0F9D78] dark:bg-[#0F9D78]/10'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            {stage.name}
          </h3>
        </div>

        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-slate-600 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
          {applications.length}
        </span>
      </div>

      {/* Applications Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[400px]">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onClick={() => onSelectApplication(app)}
          />
        ))}

        {applications.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400 dark:border-slate-800">
            Drop candidate here
          </div>
        )}
      </div>
    </div>
  );
}

