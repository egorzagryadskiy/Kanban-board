import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../store/store';
import type { Task } from '../types/types';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTaskTitle = useStore((s) => s.updateTaskTitle);
  const deleteTask = useStore((s) => s.deleteTask);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (title.trim()) {
      updateTaskTitle(task.id, title.trim());
    } else {
      setTitle(task.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded shadow p-3 mb-2 group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab pt-0.5"
          title="Перетащить"
        >
          ⋮⋮
        </div>

        {isEditing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setTitle(task.title);
                setIsEditing(false);
              }
            }}
            className="flex-1 px-1 py-0.5 border border-blue-400 rounded text-sm focus:outline-none"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="flex-1 text-sm text-gray-800 cursor-text"
          >
            {task.title}
          </span>
        )}

        <button
          onClick={() => deleteTask(task.id)}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-sm transition"
          title="Удалить"
        >
          ✕
        </button>
      </div>
    </div>
  );
}