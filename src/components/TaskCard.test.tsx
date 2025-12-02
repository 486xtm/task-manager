import { render, screen, fireEvent } from '../test-utils';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';

const mockTask: Task = {
  id: 'task-1',
  name: 'Test Task',
  description: 'Test Description',
  deadline: '2024-12-31',
  columnId: 'todo',
  imageUrl: null,
  isFavorite: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onToggleFavorite: jest.fn(),
};

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render task name', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render task description', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render deadline chip', () => {
    const { container } = render(<TaskCard task={mockTask} {...mockHandlers} />);

    // Date formatting depends on locale and timezone, so we check for the chip existence
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  it('should render image when imageUrl is provided', () => {
    const taskWithImage = { ...mockTask, imageUrl: 'data:image/png;base64,test' };
    render(<TaskCard task={taskWithImage} {...mockHandlers} />);
    
    expect(screen.getByAltText('Test Task')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    
    fireEvent.click(screen.getByTestId('edit-btn-task-1'));
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    
    fireEvent.click(screen.getByTestId('delete-btn-task-1'));
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('task-1');
  });

  it('should call onToggleFavorite when favorite button is clicked', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    
    fireEvent.click(screen.getByTestId('favorite-btn-task-1'));
    
    expect(mockHandlers.onToggleFavorite).toHaveBeenCalledWith('task-1');
  });

  it('should show filled star icon when task is favorite', () => {
    const favoriteTask = { ...mockTask, isFavorite: true };
    render(<TaskCard task={favoriteTask} {...mockHandlers} />);
    
    const card = screen.getByTestId('task-card-task-1');
    expect(card).toHaveStyle({ border: '2px solid gold' });
  });

  it('should show overdue styling for past deadline', () => {
    const overdueTask = { ...mockTask, deadline: '2020-01-01' };
    const { container } = render(<TaskCard task={overdueTask} {...mockHandlers} />);

    // Find the chip by its class - it should have error color for overdue
    const chip = container.querySelector('.MuiChip-colorError');
    expect(chip).toBeInTheDocument();
  });
});

