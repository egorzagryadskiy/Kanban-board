import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from '../store/store';
import { TaskCard } from './TaskCard';
import type { Column as ColumnType } from '../types/types';

interface ColumnProps {
  column: ColumnType;
}

export function Column({ column }: ColumnProps) {
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const deleteColumn = useStore((s) => s.deleteColumn);
  const updateColumnTitle = useStore((s) => s.updateColumnTitle);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const columnTasks = column.taskIds.map((id) => tasks[id]).filter(Boolean);

  const handleSaveTitle = () => {
    if (title.trim()) {
      updateColumnTitle(column.id, title.trim());
    } else {
      setTitle(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(column.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  return (
    <div
      className={`w-72 bg-gray-100 rounded-lg p-3 flex flex-col max-h-full ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3 group">
        {isEditingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setTitle(column.title);
                setIsEditingTitle(false);
              }
            }}
            className="flex-1 px-2 py-1 border border-blue-400 rounded text-sm font-semibold focus:outline-none"
          />
        ) : (
          <h3
            onClick={() => setIsEditingTitle(true)}
            className="flex-1 font-semibold text-gray-800 cursor-text truncate"
          >
            {column.title}
            <span className="ml-2 text-xs text-gray-500 font-normal">
              {columnTasks.length}
            </span>
          </h3>
        )}
        <button
          onClick={() => {
            if (confirm(`Удалить колонку "${column.title}" и все её задачи?`)) {
              deleteColumn(column.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-sm ml-2 transition"
          title="Удалить колонку"
        >
          ✕
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto min-h-[40px]"
      >
        <SortableContext
          items={column.taskIds}
          strategy={verticalListSortingStrategy}
        >
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {columnTasks.length === 0 && !isAddingTask && (
          <div className="text-center text-gray-400 text-sm py-4">
            Нет задач
          </div>
        )}
      </div>

      {isAddingTask ? (
        <div className="mt-2">
          <textarea
            autoFocus
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Введите название задачи..."
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:border-blue-400"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddTask();
              }
              if (e.key === 'Escape') {
                setIsAddingTask(false);
                setNewTaskTitle('');
              }
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddTask}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
            >
              Добавить
            </button>
            <button
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
              }}
              className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="mt-2 w-full text-left text-gray-500 hover:text-gray-700 hover:bg-gray-200 px-2 py-1.5 rounded text-sm transition"
        >
          + Добавить задачу
        </button>
      )}
    </div>
  );
}