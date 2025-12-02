import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { TaskDialog } from './TaskDialog';
import type { Column, Task } from '../types';

const mockColumns: Column[] = [
  { id: 'todo', name: 'To Do', order: 0 },
  { id: 'in-progress', name: 'In Progress', order: 1 },
];

const mockTask: Task = {
  id: 'task-1',
  name: 'Existing Task',
  description: 'Existing Description',
  deadline: '2024-12-31',
  columnId: 'todo',
  imageUrl: null,
  isFavorite: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('TaskDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render add dialog when no task provided', () => {
    render(
      <TaskDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        columns={mockColumns}
      />
    );
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should render edit dialog when task is provided', () => {
    render(
      <TaskDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        columns={mockColumns}
        task={mockTask}
      />
    );
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('should populate form with task data when editing', () => {
    render(
      <TaskDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        columns={mockColumns}
        task={mockTask}
      />
    );
    
    expect(screen.getByTestId('task-name-input')).toHaveValue('Existing Task');
    expect(screen.getByTestId('task-description-input')).toHaveValue('Existing Description');
  });

  it('should show error when submitting without name', async () => {
    render(
      <TaskDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        columns={mockColumns}
      />
    );
    
    fireEvent.click(screen.getByTestId('save-task-btn'));
    
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onSave with form data when valid', async () => {
    const user = userEvent.setup();
    render(
      <TaskDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        columns={mockColumns}
        defaultColumnId="todo"
      />
    );
    
    await user.type(screen.getByTestId('task-name-input'), 'New Task');
    await user.type(screen.getByTestId('task-description-input'), 'New Description');
    
    fireEvent.click(screen.getByTestId('save-task-btn'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Task',
        description: 'New Description',
        columnId: 'todo',
      }));
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(
      <TaskDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        columns={mockColumns}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not render when open is false', () => {
    render(
      <TaskDialog
        open={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        columns={mockColumns}
      />
    );
    
    expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
  });
});

