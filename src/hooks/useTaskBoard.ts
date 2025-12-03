import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Task, Column, BoardState, TaskFormData, SortType, TasksByColumn } from '../types';

const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', name: 'To Do', order: 0 },
  { id: 'in-progress', name: 'In Progress', order: 1 },
  { id: 'done', name: 'Done', order: 2 },
];

const INITIAL_STATE: BoardState = {
  columns: DEFAULT_COLUMNS,
  tasks: {
    'todo': [],
    'in-progress': [],
    'done': [],
  },
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to migrate old array format to new object format
const migrateTasksFormat = (state: BoardState | { columns: Column[]; tasks: Task[] }): BoardState => {
  // Check if tasks is an array (old format)
  if (Array.isArray(state.tasks)) {
    const tasksByColumn: TasksByColumn = {};

    // Initialize empty arrays for each column
    state.columns.forEach((col) => {
      tasksByColumn[col.id] = [];
    });

    // Distribute tasks to their respective columns
    state.tasks.forEach((task: Task) => {
      if (tasksByColumn[task.columnId]) {
        tasksByColumn[task.columnId].push(task);
      } else {
        // If column doesn't exist, add to first column
        const firstColumnId = state.columns[0]?.id;
        if (firstColumnId) {
          tasksByColumn[firstColumnId] = tasksByColumn[firstColumnId] || [];
          tasksByColumn[firstColumnId].push({ ...task, columnId: firstColumnId });
        }
      }
    });

    return {
      columns: state.columns,
      tasks: tasksByColumn,
    };
  }

  // Already in new format, ensure all columns have arrays
  const tasks = state.tasks as TasksByColumn;
  state.columns.forEach((col) => {
    if (!tasks[col.id]) {
      tasks[col.id] = [];
    }
  });

  return state as BoardState;
};

// Helper to get all tasks as flat array
const getAllTasks = (tasks: TasksByColumn): Task[] => {
  return Object.values(tasks).flat();
};

// Helper to find task and its column
const findTaskWithColumn = (tasks: TasksByColumn, taskId: string): { task: Task; columnId: string } | null => {
  for (const [columnId, columnTasks] of Object.entries(tasks)) {
    if (!Array.isArray(columnTasks)) continue;
    const task = columnTasks.find((t) => t.id === taskId);
    if (task) {
      return { task, columnId };
    }
  }
  return null;
};

export function useTaskBoard() {
  const [rawBoardState, setBoardState] = useLocalStorage<BoardState>('task-board', INITIAL_STATE);

  // Migrate old format to new format if needed
  const boardState = useMemo(() => migrateTasksFormat(rawBoardState), [rawBoardState]);

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
      tasks: {
        ...prev.tasks,
        [taskData.columnId]: [...(prev.tasks[taskData.columnId] || []), newTask],
      },
    }));
    return newTask;
  }, [setBoardState]);

  const updateTask = useCallback((taskId: string, updates: Partial<TaskFormData>) => {
    setBoardState((prev) => {
      const result = findTaskWithColumn(prev.tasks, taskId);
      if (!result) return prev;

      const { columnId: currentColumnId } = result;
      const newColumnId = updates.columnId;

      // If moving to a different column
      if (newColumnId && newColumnId !== currentColumnId) {
        const updatedTask = {
          ...result.task,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            [currentColumnId]: prev.tasks[currentColumnId].filter((t) => t.id !== taskId),
            [newColumnId]: [...(prev.tasks[newColumnId] || []), updatedTask],
          },
        };
      }

      // Update in same column
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [currentColumnId]: prev.tasks[currentColumnId].map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        },
      };
    });
  }, [setBoardState]);

  const deleteTask = useCallback((taskId: string) => {
    setBoardState((prev) => {
      const result = findTaskWithColumn(prev.tasks, taskId);
      if (!result) return prev;

      const { columnId } = result;
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [columnId]: prev.tasks[columnId].filter((task) => task.id !== taskId),
        },
      };
    });
  }, [setBoardState]);

  const moveTask = useCallback((taskId: string, targetColumnId: string, targetIndex?: number) => {
    setBoardState((prev) => {
      const result = findTaskWithColumn(prev.tasks, taskId);
      console.log("++++++++++++++++", result);
      if (!result) return prev;

      const { task, columnId: sourceColumnId } = result;

      // Same column reordering
      if (sourceColumnId === targetColumnId) {
        if (targetIndex === undefined) return prev;

        const columnTasks = [...prev.tasks[sourceColumnId]];
        const currentIndex = columnTasks.findIndex((t) => t.id === taskId);
        if (currentIndex === -1 || currentIndex === targetIndex) return prev;

        // Find the boundary between favorites and non-favorites
        const lastFavoriteIndex = columnTasks.reduce((lastIdx, t, idx) => {
          return t.isFavorite ? idx : lastIdx;
        }, -1);
        const firstNonFavoriteIndex = lastFavoriteIndex + 1;

        let adjustedTargetIndex = targetIndex;

        // If dragging a non-favorite task onto a favorite task's position,
        // move it to the first non-favorite position instead
        if (!task.isFavorite && targetIndex <= lastFavoriteIndex) {
          adjustedTargetIndex = firstNonFavoriteIndex;
        }

        // If dragging a favorite task onto a non-favorite task's position,
        // move it to the last favorite position instead
        if (task.isFavorite && targetIndex > lastFavoriteIndex) {
          // After removing the task, calculate where the last favorite will be
          const tasksWithoutCurrent = columnTasks.filter((t) => t.id !== taskId);
          const newLastFavoriteIndex = tasksWithoutCurrent.reduce((lastIdx, t, idx) => {
            return t.isFavorite ? idx : lastIdx;
          }, -1);
          adjustedTargetIndex = newLastFavoriteIndex + 1;
        }

        // Remove from current position
        columnTasks.splice(currentIndex, 1);
        // Adjust target index if removing from before target
        const finalTargetIndex = currentIndex < adjustedTargetIndex ? adjustedTargetIndex - 1 : adjustedTargetIndex;
        // Insert at new position
        columnTasks.splice(finalTargetIndex, 0, task);

        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            [sourceColumnId]: columnTasks,
          },
        };
      }

      // Moving to different column
      const updatedTask = {
        ...task,
        columnId: targetColumnId,
        updatedAt: new Date().toISOString(),
      };

      const targetTasks = [...(prev.tasks[targetColumnId] || [])];

      if (targetIndex !== undefined) {
        // Find the boundary between favorites and non-favorites in target column
        const lastFavoriteIndex = targetTasks.reduce((lastIdx, t, idx) => {
          return t.isFavorite ? idx : lastIdx;
        }, -1);
        const firstNonFavoriteIndex = lastFavoriteIndex + 1;

        let adjustedTargetIndex = targetIndex;

        // If dropping a non-favorite task onto a favorite task's position,
        // move it to the first non-favorite position instead
        if (!updatedTask.isFavorite && targetIndex <= lastFavoriteIndex) {
          adjustedTargetIndex = firstNonFavoriteIndex;
        }

        // If dropping a favorite task onto a non-favorite task's position,
        // move it to the last favorite position instead (right after last favorite)
        if (updatedTask.isFavorite && targetIndex > lastFavoriteIndex) {
          adjustedTargetIndex = lastFavoriteIndex + 1;
        }

        targetTasks.splice(adjustedTargetIndex, 0, updatedTask);
      } else {
        // When no target index, add to end of respective group
        if (updatedTask.isFavorite) {
          // Find last favorite index and insert after it
          const lastFavoriteIndex = targetTasks.reduce((lastIdx, t, idx) => {
            return t.isFavorite ? idx : lastIdx;
          }, -1);
          targetTasks.splice(lastFavoriteIndex + 1, 0, updatedTask);
        } else {
          targetTasks.push(updatedTask);
        }
      }

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [sourceColumnId]: prev.tasks[sourceColumnId].filter((t) => t.id !== taskId),
          [targetColumnId]: targetTasks,
        },
      };
    });
  }, [setBoardState]);

  const toggleFavorite = useCallback((taskId: string) => {
    setBoardState((prev) => {
      const result = findTaskWithColumn(prev.tasks, taskId);
      if (!result) return prev;

      const { columnId } = result;
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [columnId]: prev.tasks[columnId].map((task) =>
            task.id === taskId
              ? { ...task, isFavorite: !task.isFavorite, updatedAt: new Date().toISOString() }
              : task
          ),
        },
      };
    });
  }, [setBoardState]);

  // Column operations
  const addColumn = useCallback((name: string) => {
    const columnId = generateId();
    const newColumn: Column = {
      id: columnId,
      name,
      order: boardState.columns.length,
    };
    setBoardState((prev) => ({
      ...prev,
      columns: [...prev.columns, newColumn],
      tasks: {
        ...prev.tasks,
        [columnId]: [],
      },
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
    setBoardState((prev) => {
      const { [columnId]: _, ...remainingTasks } = prev.tasks;
      return {
        ...prev,
        columns: prev.columns.filter((col) => col.id !== columnId),
        tasks: remainingTasks,
      };
    });
  }, [setBoardState]);

  // Get task by ID
  const getTask = useCallback((taskId: string) => {
    const result = findTaskWithColumn(boardState.tasks, taskId);
    return result?.task;
  }, [boardState.tasks]);

  // Get tasks by column with sorting
  const getTasksByColumn = useCallback((columnId: string, sortType: SortType = 'none') => {
    let tasks = [...(boardState.tasks[columnId] || [])];

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
    } else if (sortType === 'date') {
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

  // Get all tasks as flat array (for backward compatibility)
  const allTasks = useMemo(() => getAllTasks(boardState.tasks), [boardState.tasks]);

  return {
    columns: sortedColumns,
    tasks: boardState.tasks,
    allTasks,
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

