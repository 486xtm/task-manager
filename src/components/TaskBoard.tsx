import { useState } from 'react';
import { Box, Button, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTaskBoardContext } from '../context/TaskBoardContext';
import { BoardColumn } from './BoardColumn';
import { TaskDialog } from './TaskDialog';
import { ColumnDialog } from './ColumnDialog';
import type { Task, Column, TaskFormData, SortType } from '../types';

export function TaskBoard() {
  const {
    columns,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleFavorite,
    addColumn,
    updateColumn,
    deleteColumn,
    getTasksByColumn,
  } = useTaskBoardContext();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [editingColumn, setEditingColumn] = useState<Column | undefined>();
  const [defaultColumnId, setDefaultColumnId] = useState<string | undefined>();
  const [columnSortTypes, setColumnSortTypes] = useState<Record<string, SortType>>({});

  const handleAddTask = (columnId: string) => {
    setDefaultColumnId(columnId);
    setEditingTask(undefined);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = (taskData: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleAddColumn = () => {
    setEditingColumn(undefined);
    setColumnDialogOpen(true);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setColumnDialogOpen(true);
  };

  const handleSaveColumn = (name: string) => {
    if (editingColumn) {
      updateColumn(editingColumn.id, name);
    } else {
      addColumn(name);
    }
  };

  const handleSortChange = (columnId: string, sortType: SortType) => {
    setColumnSortTypes((prev) => ({ ...prev, [columnId]: sortType }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          <Button
            color="inherit"
            startIcon={<Add />}
            onClick={handleAddColumn}
            data-testid="add-column-btn"
          >
            Add Column
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={false}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          py: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            minHeight: 'calc(100vh - 150px)',
            pb: 2,
          }}
        >
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={getTasksByColumn(column.id, columnSortTypes[column.id] || 'none')}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={deleteTask}
              onToggleFavorite={toggleFavorite}
              onMoveTask={moveTask}
              onEditColumn={handleEditColumn}
              onDeleteColumn={deleteColumn}
              columns={columns}
              sortType={columnSortTypes[column.id] || 'none'}
              onSortChange={handleSortChange}
            />
          ))}
        </Box>
      </Container>

      <TaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        columns={columns}
        defaultColumnId={defaultColumnId}
      />

      <ColumnDialog
        open={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        column={editingColumn}
        onSave={handleSaveColumn}
      />
    </Box>
  );
}

