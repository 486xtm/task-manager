import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  Divider,
} from '@mui/material';
import { ArrowBack, Star, StarBorder, Edit, Delete } from '@mui/icons-material';
import { useTaskBoardContext } from '../context/TaskBoardContext';
import { useState } from 'react';
import { TaskDialog, ConfirmDialog } from '../components';
import type { TaskFormData } from '../types';

export function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { getTask, updateTask, deleteTask, toggleFavorite, columns } = useTaskBoardContext();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const task = taskId ? getTask(taskId) : undefined;

  if (!task) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" onClick={() => navigate('/')} data-testid="back-btn">
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Task Not Found
            </Typography>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Typography variant="h5">Task not found</Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Go Back to Board
          </Button>
        </Container>
      </Box>
    );
  }

  const column = columns.find((col) => col.id === task.columnId);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteTask(task.id);
    setDeleteDialogOpen(false);
    navigate('/');
  };

  const handleSaveTask = (taskData: TaskFormData) => {
    updateTask(task.id, taskData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/')} data-testid="back-btn">
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            Task Details
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => toggleFavorite(task.id)}
            data-testid="detail-favorite-btn"
          >
            {task.isFavorite ? <Star /> : <StarBorder />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setEditDialogOpen(true)}
            data-testid="detail-edit-btn"
          >
            <Edit />
          </IconButton>
          <IconButton color="inherit" onClick={handleDeleteClick} data-testid="detail-delete-btn">
            <Delete />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h4" component="h1">
              {task.name}
            </Typography>
            {task.isFavorite && <Star color="warning" />}
          </Box>

          <Box display="flex" gap={1} mb={3}>
            <Chip label={column?.name || 'Unknown'} color="primary" />
            {task.deadline && (
              <Chip
                label={`Due: ${new Date(task.deadline).toLocaleDateString()}`}
                color={new Date(task.deadline) < new Date() ? 'error' : 'default'}
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {task.description || 'No description provided.'}
          </Typography>

          {task.imageUrl && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Attached Image
              </Typography>
              <Box
                component="img"
                src={task.imageUrl}
                alt={task.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
                data-testid="task-image"
              />
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Created: {formatDate(task.createdAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Updated: {formatDate(task.updatedAt)}
            </Typography>
          </Box>
        </Paper>
      </Container>

      <TaskDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        task={task}
        onSave={handleSaveTask}
        columns={columns}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
}

