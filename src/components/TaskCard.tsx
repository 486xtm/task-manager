import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Star,
  StarBorder,
  Edit,
  Delete,
  OpenInNew,
} from '@mui/icons-material';
import type { Task } from '../types';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from './ConfirmDialog';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleFavorite: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggleFavorite }: TaskCardProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setDeleteDialogOpen(false);
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const isOverdue = date < now;
    return {
      text: date.toLocaleDateString(),
      isOverdue,
    };
  };

  const deadline = formatDeadline(task.deadline);

  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'grab',
        '&:hover': {
          boxShadow: 3,
        },
        border: task.isFavorite ? '2px solid gold' : undefined,
      }}
      data-testid={`task-card-${task.id}`}
    >
      {task.imageUrl && (
        <CardMedia
          component="img"
          height="120"
          image={task.imageUrl}
          alt={task.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ pb: '8px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
            {task.name}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onToggleFavorite(task.id)}
            color="warning"
            data-testid={`favorite-btn-${task.id}`}
          >
            {task.isFavorite ? <Star /> : <StarBorder />}
          </IconButton>
        </Box>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 1,
            }}
          >
            {task.description}
          </Typography>
        )}

        {deadline && (
          <Chip
            size="small"
            label={deadline.text}
            color={deadline.isOverdue ? 'error' : 'default'}
            sx={{ mb: 1 }}
          />
        )}

        <Box display="flex" justifyContent="flex-end" gap={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/task/${task.id}`)}
              data-testid={`view-btn-${task.id}`}
            >
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit(task)}
              data-testid={`edit-btn-${task.id}`}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={handleDeleteClick}
              color="error"
              data-testid={`delete-btn-${task.id}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Card>
  );
}

