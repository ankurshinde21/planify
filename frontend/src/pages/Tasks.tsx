import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { tasks } from '../services/api';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  due_date: Yup.date().required('Due date is required'),
  priority: Yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
});

const Tasks: React.FC = () => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasks.getAll();
      setTaskList(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleOpenDialog = (task?: Task) => {
    setSelectedTask(task || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleDelete = async () => {
    if (selectedTask) {
      try {
        await tasks.delete(selectedTask.id);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
    handleMenuClose();
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (selectedTask) {
      try {
        await tasks.update(selectedTask.id, { ...selectedTask, status: newStatus });
        fetchTasks();
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
    handleMenuClose();
  };

  const handleSubmit = async (values: Omit<Task, 'id'>) => {
    try {
      if (selectedTask) {
        await tasks.update(selectedTask.id, { ...values, id: selectedTask.id });
      } else {
        await tasks.create(values);
      }
      fetchTasks();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const filteredTasks = taskList.filter(task => filter === 'all' || task.status === filter);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Task
        </Button>
      </Box>

      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Filter</InputLabel>
        <Select
          value={filter}
          label="Filter"
          onChange={(e: SelectChangeEvent) => setFilter(e.target.value as typeof filter)}
        >
          <MenuItem value="all">All Tasks</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {task.description}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <IconButton onClick={(e) => handleMenuClick(e, task)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenDialog(selectedTask)}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('completed')}>
          <CheckCircleIcon sx={{ mr: 1 }} /> Mark as Completed
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <Formik
          initialValues={
            selectedTask || {
              title: '',
              description: '',
              due_date: '',
              priority: 'medium',
              status: 'pending',
            }
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <TextField
                  fullWidth
                  name="title"
                  label="Title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="due_date"
                  label="Due Date"
                  type="date"
                  value={values.due_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.due_date && Boolean(errors.due_date)}
                  helperText={touched.due_date && errors.due_date}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={values.priority}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.priority && Boolean(errors.priority)}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                  {touched.priority && errors.priority && (
                    <Typography color="error" variant="caption">
                      {errors.priority}
                    </Typography>
                  )}
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" variant="contained">
                  {selectedTask ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Tasks; 