import { render, screen, fireEvent } from '../test-utils';
import { BoardColumn } from './BoardColumn';
import type { Column, Task } from '../types';

const mockColumn: Column = {
  id: 'todo',
  name: 'To Do',
  order: 0,
};

const mockColumns: Column[] = [
  mockColumn,
  { id: 'in-progress', name: 'In Progress', order: 1 },
];

const mockTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Task 1',
    description: 'Description 1',
    deadline: null,
    columnId: 'todo',
    imageUrl: null,
    isFavorite: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task-2',
    name: 'Task 2',
    description: 'Description 2',
    deadline: null,
    columnId: 'todo',
    imageUrl: null,
    isFavorite: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

const mockHandlers = {
  onAddTask: jest.fn(),
  onEditTask: jest.fn(),
  onDeleteTask: jest.fn(),
  onToggleFavorite: jest.fn(),
  onMoveTask: jest.fn(),
  onEditColumn: jest.fn(),
  onDeleteColumn: jest.fn(),
  onSortChange: jest.fn(),
};

describe('BoardColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render column name', () => {
    render(
      <BoardColumn
        column={mockColumn}
        tasks={mockTasks}
        columns={mockColumns}
        sortType="none"
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('should render task count', () => {
    render(
      <BoardColumn
        column={mockColumn}
        tasks={mockTasks}
        columns={mockColumns}
        sortType="none"
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('should render all tasks', () => {
    render(
      <BoardColumn
        column={mockColumn}
        tasks={mockTasks}
        columns={mockColumns}
        sortType="none"
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should call onAddTask when add button is clicked', () => {
    render(
      <BoardColumn
        column={mockColumn}
        tasks={mockTasks}
        columns={mockColumns}
        sortType="none"
        {...mockHandlers}
      />
    );
    
    fireEvent.click(screen.getByTestId('add-task-btn-todo'));
    
    expect(mockHandlers.onAddTask).toHaveBeenCalledWith('todo');
  });

  it('should open column menu when menu button is clicked', () => {
    render(
      <BoardColumn
        column={mockColumn}
        tasks={mockTasks}
        columns={mockColumns}
        sortType="none"
        {...mockHandlers}
      />
    );
    
    fireEvent.click(screen.getByTestId('column-menu-btn-todo'));
    
    expect(screen.getByText('Sort A-Z')).toBeInTheDocument();
    expect(screen.getByText('Edit Column')).toBeInTheDocument();
    expect(screen.getByText('Delete Column')).toBeInTheDocument();
  });

  it('should call onSortChange when sort button is clicked', () => {
    render(
      <BoardColumn
        column={mockColumn}
        tasks={mockTasks}
        columns={mockColumns}
        sortType="none"
        {...mockHandlers}
      />
    );
    
    fireEvent.click(screen.getByTestId('column-menu-btn-todo'));
    fireEvent.click(screen.getByTestId('sort-alpha-btn-todo'));
    
    expect(mockHandlers.onSortChange).toHaveBeenCalledWith('todo', 'alphabetical');
  });

  it('should call onEditColumn when edit button is clicked', () => {
    render(
      <BoardColumn
        column={mockColumn}
        tasks={mockTasks}
        columns={mockColumns}
        sortType="none"
        {...mockHandlers}
      />
    );
    
    fireEvent.click(screen.getByTestId('column-menu-btn-todo'));
    fireEvent.click(screen.getByTestId('edit-column-btn-todo'));
    
    expect(mockHandlers.onEditColumn).toHaveBeenCalledWith(mockColumn);
  });

  it('should call onDeleteColumn when delete button is clicked', () => {
    render(
      <BoardColumn
        column={mockColumn}
        tasks={mockTasks}
        columns={mockColumns}
        sortType="none"
        {...mockHandlers}
      />
    );
    
    fireEvent.click(screen.getByTestId('column-menu-btn-todo'));
    fireEvent.click(screen.getByTestId('delete-column-btn-todo'));
    
    expect(mockHandlers.onDeleteColumn).toHaveBeenCalledWith('todo');
  });
});

