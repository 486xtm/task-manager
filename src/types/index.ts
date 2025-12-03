export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  columnId: string;
  imageUrl: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
}

export type TasksByColumn = Record<string, Task[]>;

export interface BoardState {
  columns: Column[];
  tasks: TasksByColumn;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
  onSave: (taskData: TaskFormData) => void;
  columns: Column[];
}

export interface ColumnDialogProps {
  open: boolean;
  onClose: () => void;
  column?: Column;
  onSave: (name: string) => void;
}

export type SortType = 'alphabetical' | 'descending' | 'none';

export enum SortTypeData {
  Alphabetical = "alphabetical",
  Descending = "descending",
  None = "none",
}