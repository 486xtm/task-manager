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

export interface BoardState {
  columns: Column[];
  tasks: Task[];
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

export type SortType = 'alphabetical' | 'date' | 'none';

