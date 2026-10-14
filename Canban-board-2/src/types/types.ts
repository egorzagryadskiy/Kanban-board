export interface Task {
  id: string;
  title: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  taskIds: string[];
}

export interface Board {
  id: string;
  title: string;
  columnIds: string[];
}

export interface AppState {
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  tasks: Record<string, Task>;
  activeBoardId: string | null;
}

export interface AppActions {
  // Boards
  addBoard: (title: string) => void;
  deleteBoard: (id: string) => void;
  setActiveBoard: (id: string) => void;
  updateBoardTitle: (id: string, title: string) => void;
  
  // Columns
  addColumn: (title: string) => void;
  deleteColumn: (id: string) => void;
  updateColumnTitle: (id: string, title: string) => void;
  
  // Tasks
  addTask: (columnId: string, title: string) => void;
  deleteTask: (id: string) => void;
  updateTaskTitle: (id: string, title: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void;
  
  // Utils
  resetAll: () => void;
}

export type Store = AppState & AppActions;