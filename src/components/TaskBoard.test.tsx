import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { TaskBoard } from './TaskBoard';

describe('TaskBoard', () => {
  beforeEach(() => {
    localStorage.clear();
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  it('should render the app title', () => {
    render(<TaskBoard />);
    
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  it('should render default columns', () => {
    render(<TaskBoard />);
    
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should render Add Column button', () => {
    render(<TaskBoard />);
    
    expect(screen.getByTestId('add-column-btn')).toBeInTheDocument();
  });

  it('should open column dialog when Add Column is clicked', async () => {
    render(<TaskBoard />);
    
    fireEvent.click(screen.getByTestId('add-column-btn'));
    
    expect(await screen.findByText('Add New Column')).toBeInTheDocument();
  });

  it('should open task dialog when add task button is clicked', async () => {
    render(<TaskBoard />);
    
    fireEvent.click(screen.getByTestId('add-task-btn-todo'));
    
    expect(await screen.findByText('Add New Task')).toBeInTheDocument();
  });

  it('should add a new task when form is submitted', async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);
    
    fireEvent.click(screen.getByTestId('add-task-btn-todo'));
    
    await user.type(screen.getByTestId('task-name-input'), 'New Test Task');
    fireEvent.click(screen.getByTestId('save-task-btn'));
    
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  it('should add a new column when form is submitted', async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);
    
    fireEvent.click(screen.getByTestId('add-column-btn'));
    
    await user.type(screen.getByTestId('column-name-input'), 'Review');
    fireEvent.click(screen.getByTestId('save-column-btn'));
    
    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });
  });

  it('should delete a task when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);

    // Add a task first
    fireEvent.click(screen.getByTestId('add-task-btn-todo'));
    await user.type(screen.getByTestId('task-name-input'), 'Task to Delete');
    fireEvent.click(screen.getByTestId('save-task-btn'));

    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeInTheDocument();
    });

    // Get the task card's delete button using testid
    const deleteButtons = screen.getAllByTestId(/delete-btn-/);
    fireEvent.click(deleteButtons[0]);

    // Confirm the deletion in the dialog
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog-confirm')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));

    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
    });
  });

  it('should show task count in column header', async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);

    // Initially all columns should show (0)
    const zeroCounts = screen.getAllByText('(0)');
    expect(zeroCounts.length).toBe(3);

    // Add a task
    fireEvent.click(screen.getByTestId('add-task-btn-todo'));
    await user.type(screen.getByTestId('task-name-input'), 'Count Test');
    fireEvent.click(screen.getByTestId('save-task-btn'));

    await waitFor(() => {
      expect(screen.getByText('(1)')).toBeInTheDocument();
    });
  });
});

