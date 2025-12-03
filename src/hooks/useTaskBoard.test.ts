import { renderHook, act } from '@testing-library/react';
import { useTaskBoard } from './useTaskBoard';

describe('useTaskBoard', () => {
  beforeEach(() => {
    localStorage.clear();
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  describe('initial state', () => {
    it('should have default columns', () => {
      const { result } = renderHook(() => useTaskBoard());

      expect(result.current.columns).toHaveLength(3);
      expect(result.current.columns.map(c => c.name)).toEqual(['To Do', 'In Progress', 'Done']);
    });

    it('should start with no tasks', () => {
      const { result } = renderHook(() => useTaskBoard());

      expect(result.current.allTasks).toHaveLength(0);
    });

    it('should have tasks as object with column keys', () => {
      const { result } = renderHook(() => useTaskBoard());

      expect(result.current.tasks).toEqual({
        'todo': [],
        'in-progress': [],
        'done': [],
      });
    });
  });

  describe('task operations', () => {
    it('should add a new task', () => {
      const { result } = renderHook(() => useTaskBoard());

      act(() => {
        result.current.addTask({
          name: 'Test Task',
          description: 'Test Description',
          deadline: '2024-12-31',
          columnId: 'todo',
          imageUrl: null,
          isFavorite: false,
        });
      });

      expect(result.current.tasks['todo']).toHaveLength(1);
      expect(result.current.tasks['todo'][0].name).toBe('Test Task');
      expect(result.current.allTasks).toHaveLength(1);
    });

    it('should update a task', () => {
      const { result } = renderHook(() => useTaskBoard());

      let taskId: string;
      act(() => {
        const task = result.current.addTask({
          name: 'Original',
          description: '',
          deadline: null,
          columnId: 'todo',
          imageUrl: null,
          isFavorite: false,
        });
        taskId = task.id;
      });

      act(() => {
        result.current.updateTask(taskId, { name: 'Updated' });
      });

      expect(result.current.tasks['todo'][0].name).toBe('Updated');
    });

    it('should delete a task', () => {
      const { result } = renderHook(() => useTaskBoard());

      let taskId: string;
      act(() => {
        const task = result.current.addTask({
          name: 'To Delete',
          description: '',
          deadline: null,
          columnId: 'todo',
          imageUrl: null,
          isFavorite: false,
        });
        taskId = task.id;
      });

      expect(result.current.tasks['todo']).toHaveLength(1);

      act(() => {
        result.current.deleteTask(taskId);
      });

      expect(result.current.tasks['todo']).toHaveLength(0);
    });

    it('should move a task between columns', () => {
      const { result } = renderHook(() => useTaskBoard());

      let taskId: string;
      act(() => {
        const task = result.current.addTask({
          name: 'Moving Task',
          description: '',
          deadline: null,
          columnId: 'todo',
          imageUrl: null,
          isFavorite: false,
        });
        taskId = task.id;
      });

      expect(result.current.tasks['todo']).toHaveLength(1);

      act(() => {
        result.current.moveTask(taskId, 'in-progress');
      });

      expect(result.current.tasks['todo']).toHaveLength(0);
      expect(result.current.tasks['in-progress']).toHaveLength(1);
      expect(result.current.tasks['in-progress'][0].columnId).toBe('in-progress');
    });

    it('should toggle favorite status', () => {
      const { result } = renderHook(() => useTaskBoard());

      let taskId: string;
      act(() => {
        const task = result.current.addTask({
          name: 'Favorite Task',
          description: '',
          deadline: null,
          columnId: 'todo',
          imageUrl: null,
          isFavorite: false,
        });
        taskId = task.id;
      });

      expect(result.current.tasks['todo'][0].isFavorite).toBe(false);

      act(() => {
        result.current.toggleFavorite(taskId);
      });

      expect(result.current.tasks['todo'][0].isFavorite).toBe(true);
    });
  });

  describe('column operations', () => {
    it('should add a new column', () => {
      const { result } = renderHook(() => useTaskBoard());
      
      act(() => {
        result.current.addColumn('New Column');
      });
      
      expect(result.current.columns).toHaveLength(4);
      expect(result.current.columns[3].name).toBe('New Column');
    });

    it('should update a column', () => {
      const { result } = renderHook(() => useTaskBoard());
      
      act(() => {
        result.current.updateColumn('todo', 'Backlog');
      });
      
      expect(result.current.columns[0].name).toBe('Backlog');
    });

    it('should delete a column and its tasks', () => {
      const { result } = renderHook(() => useTaskBoard());

      act(() => {
        result.current.addTask({
          name: 'Task in todo',
          description: '',
          deadline: null,
          columnId: 'todo',
          imageUrl: null,
          isFavorite: false,
        });
      });

      act(() => {
        result.current.deleteColumn('todo');
      });

      expect(result.current.columns).toHaveLength(2);
      expect(result.current.tasks['todo']).toBeUndefined();
      expect(result.current.allTasks).toHaveLength(0);
    });

    it('should add empty task array for new column', () => {
      const { result } = renderHook(() => useTaskBoard());

      let newColumnId: string;
      act(() => {
        const column = result.current.addColumn('New Column');
        newColumnId = column.id;
      });

      expect(result.current.tasks[newColumnId!]).toEqual([]);
    });
  });

  describe('sorting', () => {
    it('should sort favorites to top', () => {
      const { result } = renderHook(() => useTaskBoard());

      act(() => {
        result.current.addTask({
          name: 'B Task',
          description: '',
          deadline: null,
          columnId: 'todo',
          imageUrl: null,
          isFavorite: false,
        });
        result.current.addTask({
          name: 'A Task',
          description: '',
          deadline: null,
          columnId: 'todo',
          imageUrl: null,
          isFavorite: true,
        });
      });

      const tasks = result.current.getTasksByColumn('todo', 'none');
      expect(tasks[0].name).toBe('A Task');
      expect(tasks[0].isFavorite).toBe(true);
    });

    it('should sort alphabetically while keeping favorites on top', () => {
      const { result } = renderHook(() => useTaskBoard());

      act(() => {
        result.current.addTask({ name: 'C', description: '', deadline: null, columnId: 'todo', imageUrl: null, isFavorite: false });
        result.current.addTask({ name: 'A', description: '', deadline: null, columnId: 'todo', imageUrl: null, isFavorite: false });
        result.current.addTask({ name: 'B', description: '', deadline: null, columnId: 'todo', imageUrl: null, isFavorite: true });
      });

      const tasks = result.current.getTasksByColumn('todo', 'alphabetical');
      expect(tasks[0].name).toBe('B'); // Favorite first
      expect(tasks[1].name).toBe('A');
      expect(tasks[2].name).toBe('C');
    });
  });

  describe('getTask', () => {
    it('should return task by id', () => {
      const { result } = renderHook(() => useTaskBoard());

      let taskId = '';
      act(() => {
        const task = result.current.addTask({
          name: 'Find Me',
          description: '',
          deadline: null,
          columnId: 'todo',
          imageUrl: null,
          isFavorite: false,
        });
        taskId = task.id;
      });

      const found = result.current.getTask(taskId);
      expect(found?.name).toBe('Find Me');
    });

    it('should return undefined for non-existent id', () => {
      const { result } = renderHook(() => useTaskBoard());

      const found = result.current.getTask('non-existent');
      expect(found).toBeUndefined();
    });
  });
});

