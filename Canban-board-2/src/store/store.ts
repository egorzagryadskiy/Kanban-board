import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store } from '../types/types';

const generateId = () => crypto?.randomUUID() ?? Math.random().toString(36).substr(2, 9);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      boards: {},
      columns: {},
      tasks: {},
      activeBoardId: null,

      addBoard: (title) => {
        const id = generateId();
        const newBoard = { id, title, columnIds: [] };
        set((state) => ({
          boards: { ...state.boards, [id]: newBoard },
          activeBoardId: state.activeBoardId ?? id,
        }));
      },

      deleteBoard: (id) => {
        const state = get();
        const board = state.boards[id];
        if (!board) return;

        const newColumns = { ...state.columns };
        const newTasks = { ...state.tasks };

        board.columnIds.forEach((colId) => {
          const col = newColumns[colId];
          if (col) {
            col.taskIds.forEach((taskId) => delete newTasks[taskId]);
            delete newColumns[colId];
          }
        });

        const newBoards = { ...state.boards };
        delete newBoards[id];

        const remainingIds = Object.keys(newBoards);
        set({
          boards: newBoards,
          columns: newColumns,
          tasks: newTasks,
          activeBoardId:
            state.activeBoardId === id
              ? remainingIds[0] ?? null
              : state.activeBoardId,
        });
      },

      setActiveBoard: (id) => set({ activeBoardId: id }),

      updateBoardTitle: (id, title) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [id]: { ...state.boards[id], title },
          },
        }));
      },

      addColumn: (title) => {
        const state = get();
        if (!state.activeBoardId) return;
        const id = generateId();
        const newColumn = {
          id,
          title,
          boardId: state.activeBoardId,
          taskIds: [],
        };
        set((s) => ({
          columns: { ...s.columns, [id]: newColumn },
          boards: {
            ...s.boards,
            [s.activeBoardId!]: {
              ...s.boards[s.activeBoardId!],
              columnIds: [...s.boards[s.activeBoardId!].columnIds, id],
            },
          },
        }));
      },

      deleteColumn: (id) => {
        const state = get();
        const column = state.columns[id];
        if (!column) return;

        const newTasks = { ...state.tasks };
        column.taskIds.forEach((taskId) => delete newTasks[taskId]);

        const newColumns = { ...state.columns };
        delete newColumns[id];

        const board = state.boards[column.boardId];
        set({
          tasks: newTasks,
          columns: newColumns,
          boards: {
            ...state.boards,
            [column.boardId]: {
              ...board,
              columnIds: board.columnIds.filter((cid) => cid !== id),
            },
          },
        });
      },

      updateColumnTitle: (id, title) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [id]: { ...state.columns[id], title },
          },
        }));
      },

      addTask: (columnId, title) => {
        const id = generateId();
        const newTask = { id, title, columnId };
        set((state) => ({
          tasks: { ...state.tasks, [id]: newTask },
          columns: {
            ...state.columns,
            [columnId]: {
              ...state.columns[columnId],
              taskIds: [...state.columns[columnId].taskIds, id],
            },
          },
        }));
      },

      deleteTask: (id) => {
        const state = get();
        const task = state.tasks[id];
        if (!task) return;

        const newTasks = { ...state.tasks };
        delete newTasks[id];

        const column = state.columns[task.columnId];
        set({
          tasks: newTasks,
          columns: {
            ...state.columns,
            [task.columnId]: {
              ...column,
              taskIds: column.taskIds.filter((tid) => tid !== id),
            },
          },
        });
      },

      updateTaskTitle: (id, title) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: { ...state.tasks[id], title },
          },
        }));
      },

      moveTask: (taskId, sourceColumnId, destinationColumnId, newIndex) => {
        set((state) => {
          const sourceCol = state.columns[sourceColumnId];
          const destCol = state.columns[destinationColumnId];
          if (!sourceCol || !destCol) return state;

          const newSourceTaskIds = sourceCol.taskIds.filter((id) => id !== taskId);
          const newDestTaskIds = [...destCol.taskIds];
          newDestTaskIds.splice(newIndex, 0, taskId);

          const newColumns = { ...state.columns };
          newColumns[sourceColumnId] = {
            ...sourceCol,
            taskIds: newSourceTaskIds,
          };
          newColumns[destinationColumnId] = {
            ...destCol,
            taskIds: newDestTaskIds,
          };

          return {
            columns: newColumns,
            tasks: {
              ...state.tasks,
              [taskId]: { ...state.tasks[taskId], columnId: destinationColumnId },
            },
          };
        });
      },

      resetAll: () => {
        set({
          boards: {},
          columns: {},
          tasks: {},
          activeBoardId: null,
        });
      },
    }),
    {
      name: 'kanban-storage',
    }
  )
);