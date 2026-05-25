import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';

import TaskCard from './TaskCard';
import { TASK_STATUSES } from '@/utils/constants';
import { cn } from '@/utils/cn';
import { useUpdateTaskStatus } from '@/hooks/useTasks';
import { usePermissions } from '@/hooks/usePermissions';

const COLUMN_ACCENT = {
  todo:        'from-slate-500/30   to-transparent',
  in_progress: 'from-amber-500/30   to-transparent',
  completed:   'from-emerald-500/30 to-transparent',
};

export default function KanbanBoard({ tasks = [], projectId, onAdd, onEdit, onDelete, onToggle }) {
  const updateStatus = useUpdateTaskStatus();
  const { canEditTask } = usePermissions();

  const columns = TASK_STATUSES.map((s) => ({
    ...s,
    items: tasks.filter((t) => t.status === s.value),
  }));

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    updateStatus.mutate({
      id: draggableId,
      status: destination.droppableId,
      projectId,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <Droppable droppableId={col.value} key={col.value}>
            {(provided, snapshot) => (
              <section
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'rounded-2xl bg-surface-900/60 border border-white/[0.05] flex flex-col min-h-[400px] transition-colors',
                  snapshot.isDraggingOver && 'bg-surface-850/80 border-brand-500/30'
                )}
              >
                <header
                  className={cn(
                    'flex items-center justify-between px-4 py-3 border-b border-white/[0.05] rounded-t-2xl bg-gradient-to-b',
                    COLUMN_ACCENT[col.value]
                  )}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold tracking-tight">{col.label}</h3>
                    <span className="text-xs text-slate-400 bg-white/[0.06] rounded-full px-2 py-0.5">
                      {col.items.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-icon h-7 w-7"
                    title="Add task"
                    aria-label={`Add task to ${col.label}`}
                    onClick={() => onAdd?.(col.value)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </header>

                <div className="p-3 space-y-2.5 flex-1">
                  {col.items.length === 0 && (
                    <p className="text-center text-xs text-slate-500 py-8">
                      Drop tasks here or click + to add one
                    </p>
                  )}
                  {col.items.map((task, idx) => {
                    const draggable = canEditTask(task);
                    return (
                      <Draggable
                        draggableId={task.id}
                        index={idx}
                        key={task.id}
                        isDragDisabled={!draggable}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={cn(
                              'transition-transform',
                              dragSnapshot.isDragging && 'rotate-1 scale-[1.02]'
                            )}
                          >
                            <TaskCard
                              task={task}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onToggle={onToggle}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              </section>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
