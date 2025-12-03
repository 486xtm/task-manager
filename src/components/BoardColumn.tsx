import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  SortByAlpha,
} from '@mui/icons-material';
import type { Column, Task, SortType } from '../types';
import { TaskCard } from './TaskCard';
import { ConfirmDialog } from './ConfirmDialog';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleFavorite: (taskId: string) => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  columns: Column[];
  sortType: SortType;
  onSortChange: (columnId: string, sortType: SortType) => void;
}

export function BoardColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleFavorite,
  onMoveTask,
  onEditColumn,
  onDeleteColumn,
  columns,
  sortType,
  onSortChange,
}: BoardColumnProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [moveMenuAnchor, setMoveMenuAnchor] = useState<null | { anchor: HTMLElement; taskId: string }>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteColumnClick = () => {
    setMenuAnchor(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteColumnConfirm = () => {
    onDeleteColumn(column.id);
    setDeleteDialogOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onMoveTask(taskId, column.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  return (
    <Paper
      sx={{
        width: 300,
        minWidth: 300,
        backgroundColor: 'grey.100',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-testid={`column-${column.id}`}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {column.name}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({tasks.length})
          </Typography>
        </Typography>
        <Box>
          <Tooltip title="Add Task">
            <IconButton
              size="small"
              onClick={() => onAddTask(column.id)}
              data-testid={`add-task-btn-${column.id}`}
            >
              <Add />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            data-testid={`column-menu-btn-${column.id}`}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 1, overflow: 'auto', flexGrow: 1 }}>
        {tasks.map((task) => (
          <Box
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            data-testid={`draggable-task-${task.id}`}
          >
            <TaskCard
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleFavorite={onToggleFavorite}
            />
          </Box>
        ))}
      </Box>

      {/* Column Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            onSortChange(column.id, sortType === 'alphabetical' ? 'descending' : sortType === "descending" ? 'none' : sortType === "none" ? 'alphabetical' : 'none');
            setMenuAnchor(null);
          }}
          data-testid={`sort-alpha-btn-${column.id}`}
        >
          <ListItemIcon>
            <SortByAlpha fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {sortType === 'alphabetical' ? 'Sort Z-A' : sortType === "descending" ? 'Clear Sort' : 'Sort A-Z'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEditColumn(column);
            setMenuAnchor(null);
          }}
          data-testid={`edit-column-btn-${column.id}`}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Column</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteColumnClick}
          sx={{ color: 'error.main' }}
          data-testid={`delete-column-btn-${column.id}`}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Column</ListItemText>
        </MenuItem>
      </Menu>

      {/* Move Task Menu */}
      <Menu
        anchorEl={moveMenuAnchor?.anchor}
        open={Boolean(moveMenuAnchor)}
        onClose={() => setMoveMenuAnchor(null)}
      >
        {columns
          .filter((col) => col.id !== column.id)
          .map((col) => (
            <MenuItem
              key={col.id}
              onClick={() => {
                if (moveMenuAnchor) {
                  onMoveTask(moveMenuAnchor.taskId, col.id);
                }
                setMoveMenuAnchor(null);
              }}
            >
              {col.name}
            </MenuItem>
          ))}
      </Menu>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Column"
        message={`Are you sure you want to delete "${column.name}"? All tasks in this column will also be deleted. This action cannot be undone.`}
        onConfirm={handleDeleteColumnConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Paper>
  );
}

