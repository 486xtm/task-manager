import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Task, Column, BoardState, TaskFormData, SortType } from '../types';

const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', name: 'To Do', order: 0 },
  { id: 'in-progress', name: 'In Progress', order: 1 },
  { id: 'done', name: 'Done', order: 2 },
];

const INITIAL_STATE: BoardState = {
  columns: DEFAULT_COLUMNS,
  tasks: [],
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function useTaskBoard() {
  const [boardState, setBoardState] = useLocalStorage<BoardState>('task-board', INITIAL_STATE);

  // Task operations
  const addTask = useCallback((taskData: TaskFormData) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setBoardState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    return newTask;
  }, [setBoardState]);

  const updateTask = useCallback((taskId: string, updates: Partial<TaskFormData>) => {
    setBoardState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  }, [setBoardState]);

  const deleteTask = useCallback((taskId: string) => {
    setBoardState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  }, [setBoardState]);

  const moveTask = useCallback((taskId: string, targetColumnId: string) => {
    setBoardState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, columnId: targetColumnId, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  }, [setBoardState]);

  const toggleFavorite = useCallback((taskId: string) => {
    setBoardState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? { ...task, isFavorite: !task.isFavorite, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  }, [setBoardState]);

  // Column operations
  const addColumn = useCallback((name: string) => {
    const newColumn: Column = {
      id: generateId(),
      name,
      order: boardState.columns.length,
    };
    setBoardState((prev) => ({
      ...prev,
      columns: [...prev.columns, newColumn],
    }));
    return newColumn;
  }, [boardState.columns.length, setBoardState]);

  const updateColumn = useCallback((columnId: string, name: string) => {
    setBoardState((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, name } : col
      ),
    }));
  }, [setBoardState]);

  const deleteColumn = useCallback((columnId: string) => {
    setBoardState((prev) => ({
      ...prev,
      columns: prev.columns.filter((col) => col.id !== columnId),
      tasks: prev.tasks.filter((task) => task.columnId !== columnId),
    }));
  }, [setBoardState]);

  // Get task by ID
  const getTask = useCallback((taskId: string) => {
    return boardState.tasks.find((task) => task.id === taskId);
  }, [boardState.tasks]);

  // Get tasks by column with sorting
  const getTasksByColumn = useCallback((columnId: string, sortType: SortType = 'none') => {
    let tasks = boardState.tasks.filter((task) => task.columnId === columnId);
    
    // Sort by favorites first
    tasks = tasks.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });

    // Then apply additional sorting
    if (sortType === 'alphabetical') {
      tasks = tasks.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } else if (sortType === 'descending') {
      tasks = tasks.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }
        return b.name.localeCompare(a.name);
      });
    } 
     else if (sortType === 'date') {
      tasks = tasks.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return tasks;
  }, [boardState.tasks]);

  const sortedColumns = useMemo(() => {
    return [...boardState.columns].sort((a, b) => a.order - b.order);
  }, [boardState.columns]);

  return {
    columns: sortedColumns,
    tasks: boardState.tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleFavorite,
    addColumn,
    updateColumn,
    deleteColumn,
    getTask,
    getTasksByColumn,
  };
}

