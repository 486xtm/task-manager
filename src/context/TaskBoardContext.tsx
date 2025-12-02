import { createContext, useContext, ReactNode } from 'react';
import { useTaskBoard } from '../hooks/useTaskBoard';

type TaskBoardContextType = ReturnType<typeof useTaskBoard>;

const TaskBoardContext = createContext<TaskBoardContextType | null>(null);

export function TaskBoardProvider({ children }: { children: ReactNode }) {
  const taskBoard = useTaskBoard();

  return (
    <TaskBoardContext.Provider value={taskBoard}>
      {children}
    </TaskBoardContext.Provider>
  );
}

export function useTaskBoardContext() {
  const context = useContext(TaskBoardContext);
  if (!context) {
    throw new Error('useTaskBoardContext must be used within a TaskBoardProvider');
  }
  return context;
}

