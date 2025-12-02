import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskDetail } from './TaskDetail';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { TaskBoardProvider } from '../context/TaskBoardContext';

const theme = createTheme();

const renderWithRouter = (taskId: string) => {
  return render(
    <ThemeProvider theme={theme}>
      <TaskBoardProvider>
        <MemoryRouter initialEntries={[`/task/${taskId}`]}>
          <Routes>
            <Route path="/task/:taskId" element={<TaskDetail />} />
            <Route path="/" element={<div>Board</div>} />
          </Routes>
        </MemoryRouter>
      </TaskBoardProvider>
    </ThemeProvider>
  );
};

describe('TaskDetail', () => {
  beforeEach(() => {
    localStorage.clear();
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  it('should show not found message for non-existent task', () => {
    renderWithRouter('non-existent-id');
    
    expect(screen.getByText('Task not found')).toBeInTheDocument();
  });

  it('should show back button', () => {
    renderWithRouter('task-1');
    
    expect(screen.getByTestId('back-btn')).toBeInTheDocument();
  });

  it('should show Go Back to Board button on not found', () => {
    renderWithRouter('non-existent-id');
    
    expect(screen.getByText('Go Back to Board')).toBeInTheDocument();
  });

  it('should navigate to board when Go Back button is clicked', async () => {
    renderWithRouter('non-existent-id');
    
    fireEvent.click(screen.getByText('Go Back to Board'));
    
    await waitFor(() => {
      expect(screen.getByText('Board')).toBeInTheDocument();
    });
  });

  it('should render task details when task exists', () => {
    // Set up localStorage with a task
    const boardState = {
      columns: [{ id: 'todo', name: 'To Do', order: 0 }],
      tasks: [{
        id: 'existing-task',
        name: 'My Task',
        description: 'My Description',
        deadline: '2024-12-31',
        columnId: 'todo',
        imageUrl: null,
        isFavorite: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }],
    };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(boardState));
    
    renderWithRouter('existing-task');
    
    expect(screen.getByText('My Task')).toBeInTheDocument();
    expect(screen.getByText('My Description')).toBeInTheDocument();
  });

  it('should display column name as chip', () => {
    const boardState = {
      columns: [{ id: 'todo', name: 'To Do', order: 0 }],
      tasks: [{
        id: 'task-1',
        name: 'Test',
        description: '',
        deadline: null,
        columnId: 'todo',
        imageUrl: null,
        isFavorite: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }],
    };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(boardState));
    
    renderWithRouter('task-1');
    
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('should show No description message when description is empty', () => {
    const boardState = {
      columns: [{ id: 'todo', name: 'To Do', order: 0 }],
      tasks: [{
        id: 'task-1',
        name: 'Test',
        description: '',
        deadline: null,
        columnId: 'todo',
        imageUrl: null,
        isFavorite: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }],
    };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(boardState));
    
    renderWithRouter('task-1');
    
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('should show attached image when imageUrl is provided', () => {
    const boardState = {
      columns: [{ id: 'todo', name: 'To Do', order: 0 }],
      tasks: [{
        id: 'task-1',
        name: 'Test',
        description: '',
        deadline: null,
        columnId: 'todo',
        imageUrl: 'data:image/png;base64,test',
        isFavorite: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }],
    };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(boardState));
    
    renderWithRouter('task-1');
    
    expect(screen.getByTestId('task-image')).toBeInTheDocument();
    expect(screen.getByText('Attached Image')).toBeInTheDocument();
  });
});

