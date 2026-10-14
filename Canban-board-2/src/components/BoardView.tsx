import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useStore } from '../store/store';
import { Column } from './Column';
import { TaskCard } from './TaskCard';

export function BoardView() {
  const activeBoardId = useStore((s) => s.activeBoardId);
  const boards = useStore((s) => s.boards);
  const columns = useStore((s) => s.columns);
  const tasks = useStore((s) => s.tasks);
  const addColumn = useStore((s) => s.addColumn);
  const moveTask = useStore((s) => s.moveTask);
  const updateBoardTitle = useStore((s) => s.updateBoardTitle);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const board = activeBoardId ? boards[activeBoardId] : null;

  useState(() => {
    if (board) setBoardTitle(board.title);
  });

  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-xl mb-2">Нет активной доски</p>
          <p className="text-sm">Создайте доску в левой панели</p>
        </div>
      </div>
    );
  }

  const boardColumns = board.columnIds
    .map((id) => columns[id])
    .filter(Boolean);

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleSaveBoardTitle = () => {
    if (boardTitle.trim() && activeBoardId) {
      updateBoardTitle(activeBoardId, boardTitle.trim());
    } else if (activeBoardId) {
      setBoardTitle(board.title);
    }
    setIsEditingTitle(false);
  };

  const findColumnByTaskId = (taskId: string) => {
    const task = tasks[taskId];
    return task ? task.columnId : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumnId = findColumnByTaskId(activeId);
    const overColumnId = tasks[overId] ? tasks[overId].columnId : overId;

    if (!activeColumnId || !overColumnId) return;
    if (activeColumnId === overColumnId) return;

    const overColumn = columns[overColumnId];
    if (!overColumn) return;

    const overIndex = overColumn.taskIds.indexOf(overId);
    const newIndex = overIndex >= 0 ? overIndex : overColumn.taskIds.length;

    moveTask(activeId, activeColumnId, overColumnId, newIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumnId = findColumnByTaskId(activeId);
    if (!activeColumnId) return;

    const activeColumn = columns[activeColumnId];

    if (tasks[overId]) {
      const overColumnId = tasks[overId].columnId;
      const overColumn = columns[overColumnId];
      if (activeColumnId === overColumnId) {
        const oldIndex = activeColumn.taskIds.indexOf(activeId);
        const newIndex = overColumn.taskIds.indexOf(overId);
        if (oldIndex !== newIndex) {
          moveTask(activeId, activeColumnId, overColumnId, newIndex);
        }
      }
    } else {
      const overColumnId = overId;
      if (activeColumnId !== overColumnId) {
        const overColumn = columns[overColumnId];
        moveTask(activeId, activeColumnId, overColumnId, overColumn.taskIds.length);
      }
    }
  };

  const activeTask = activeTaskId ? tasks[activeTaskId] : null;

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        {isEditingTitle ? (
          <input
            autoFocus
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onBlur={handleSaveBoardTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveBoardTitle();
              if (e.key === 'Escape') {
                setBoardTitle(board.title);
                setIsEditingTitle(false);
              }
            }}
            className="text-2xl font-bold px-2 py-1 border border-blue-400 rounded focus:outline-none"
          />
        ) : (
          <h2
            onClick={() => {
              setBoardTitle(board.title);
              setIsEditingTitle(true);
            }}
            className="text-2xl font-bold text-gray-800 cursor-text"
          >
            {board.title}
          </h2>
        )}
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full items-start">
            {boardColumns.map((column) => (
              <Column key={column.id} column={column} />
            ))}

            {isAddingColumn ? (
              <div className="w-72 bg-gray-100 rounded-lg p-3">
                <input
                  autoFocus
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Название колонки"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2 focus:outline-none focus:border-blue-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddColumn}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                  >
                    Добавить
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }}
                    className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-72 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg p-3 text-left transition"
              >
                + Добавить колонку
              </button>
            )}
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}