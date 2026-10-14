import { useState } from 'react';
import { useStore } from '../store/store';

export function Sidebar() {
  const boards = useStore((s) => s.boards);
  const activeBoardId = useStore((s) => s.activeBoardId);
  const addBoard = useStore((s) => s.addBoard);
  const deleteBoard = useStore((s) => s.deleteBoard);
  const setActiveBoard = useStore((s) => s.setActiveBoard);
  const resetAll = useStore((s) => s.resetAll);

  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newBoardTitle.trim()) {
      addBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsAdding(false);
    }
  };

  const handleReset = () => {
    if (confirm('Вы уверены? Все данные будут удалены.')) {
      resetAll();
    }
  };

  const boardList = Object.values(boards);

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col p-4 border-r border-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">Kanban Board</h1>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-sm uppercase text-gray-400 mb-2 font-semibold">
          Доски
        </h2>
        <ul className="space-y-1">
          {boardList.map((board) => (
            <li key={board.id} className="flex items-center group">
              <button
                onClick={() => setActiveBoard(board.id)}
                className={`flex-1 text-left px-3 py-2 rounded transition ${
                  activeBoardId === board.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                {board.title}
              </button>
              <button
                onClick={() => {
                  if (confirm(`Удалить доску "${board.title}"?`)) {
                    deleteBoard(board.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 px-2 transition"
                title="Удалить"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {isAdding ? (
          <div className="mt-3">
            <input
              autoFocus
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              placeholder="Название доски"
              className="w-full px-2 py-1 bg-gray-800 rounded text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAdd}
                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
              >
                Добавить
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-3 w-full text-left px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
          >
            + Новая доска
          </button>
        )}
      </div>

      <button
        onClick={handleReset}
        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition text-sm font-medium"
      >
        Сбросить все данные
      </button>
    </aside>
  );
}