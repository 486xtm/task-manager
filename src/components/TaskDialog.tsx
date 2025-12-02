import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import type { Task, TaskFormData, Column } from '../types';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
  onSave: (taskData: TaskFormData) => void;
  columns: Column[];
  defaultColumnId?: string;
}

const initialFormData: TaskFormData = {
  name: '',
  description: '',
  deadline: null,
  columnId: '',
  imageUrl: null,
  isFavorite: false,
};

export function TaskDialog({
  open,
  onClose,
  task,
  onSave,
  columns,
  defaultColumnId,
}: TaskDialogProps) {
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        deadline: task.deadline,
        columnId: task.columnId,
        imageUrl: task.imageUrl,
        isFavorite: task.isFavorite,
      });
    } else {
      setFormData({
        ...initialFormData,
        columnId: defaultColumnId || columns[0]?.id || '',
      });
    }
    setErrors({});
  }, [task, open, columns, defaultColumnId]);

  const handleChange = (field: keyof TaskFormData, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' && errors.name) {
      setErrors({});
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            inputProps={{ 'data-testid': 'task-name-input' }}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
            inputProps={{ 'data-testid': 'task-description-input' }}
          />

          <TextField
            label="Deadline"
            type="date"
            value={formData.deadline || ''}
            onChange={(e) => handleChange('deadline', e.target.value || null)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            inputProps={{ 'data-testid': 'task-deadline-input' }}
          />

          <FormControl fullWidth>
            <InputLabel>Column</InputLabel>
            <Select
              value={formData.columnId}
              label="Column"
              onChange={(e) => handleChange('columnId', e.target.value)}
              data-testid="task-column-select"
            >
              {columns.map((col) => (
                <MenuItem key={col.id} value={col.id}>
                  {col.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isFavorite}
                onChange={(e) => handleChange('isFavorite', e.target.checked)}
                data-testid="task-favorite-switch"
              />
            }
            label="Favorite"
          />

          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              data-testid="image-upload-btn"
            >
              {formData.imageUrl ? 'Change Image' : 'Upload Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
                data-testid="image-upload-input"
              />
            </Button>
            {formData.imageUrl && (
              <Box mt={1}>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" data-testid="save-task-btn">
          {task ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

