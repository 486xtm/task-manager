import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import type { Column } from '../types';

interface ColumnDialogProps {
  open: boolean;
  onClose: () => void;
  column?: Column;
  onSave: (name: string) => void;
}

export function ColumnDialog({ open, onClose, column, onSave }: ColumnDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (column) {
      setName(column.name);
    } else {
      setName('');
    }
    setError('');
  }, [column, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Column name is required');
      return;
    }
    onSave(name.trim());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{column ? 'Edit Column' : 'Add New Column'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Column Name"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error}
          inputProps={{ 'data-testid': 'column-name-input' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" data-testid="save-column-btn">
          {column ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

