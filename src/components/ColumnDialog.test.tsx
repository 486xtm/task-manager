import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ColumnDialog } from './ColumnDialog';
import type { Column } from '../types';

const mockColumn: Column = {
  id: 'col-1',
  name: 'Test Column',
  order: 0,
};

describe('ColumnDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render add dialog when no column provided', () => {
    render(
      <ColumnDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('Add New Column')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should render edit dialog when column is provided', () => {
    render(
      <ColumnDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        column={mockColumn}
      />
    );
    
    expect(screen.getByText('Edit Column')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('should populate input with column name when editing', () => {
    render(
      <ColumnDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        column={mockColumn}
      />
    );
    
    expect(screen.getByTestId('column-name-input')).toHaveValue('Test Column');
  });

  it('should show error when submitting without name', async () => {
    render(
      <ColumnDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByTestId('save-column-btn'));
    
    expect(await screen.findByText('Column name is required')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onSave with column name when valid', async () => {
    const user = userEvent.setup();
    render(
      <ColumnDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    await user.type(screen.getByTestId('column-name-input'), 'New Column');
    fireEvent.click(screen.getByTestId('save-column-btn'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('New Column');
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(
      <ColumnDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should clear error when typing', async () => {
    const user = userEvent.setup();
    render(
      <ColumnDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByTestId('save-column-btn'));
    expect(await screen.findByText('Column name is required')).toBeInTheDocument();
    
    await user.type(screen.getByTestId('column-name-input'), 'New Column');
    
    await waitFor(() => {
      expect(screen.queryByText('Column name is required')).not.toBeInTheDocument();
    });
  });
});

