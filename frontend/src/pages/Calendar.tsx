import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Google as GoogleIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { calendar } from '../services/api';

interface Event {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  location?: string;
}

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  start: Yup.date().required('Start date is required'),
  end: Yup.date()
    .required('End date is required')
    .min(Yup.ref('start'), 'End date must be after start date'),
  location: Yup.string(),
});

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await calendar.getAuthUrl();
      setIsConnected(response.data.is_connected);
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setError('Failed to check calendar connection');
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const response = await calendar.getAuthUrl();
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      setError('Failed to connect to Google Calendar');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (values: Omit<Event, 'id'>) => {
    try {
      await calendar.syncTask(values);
      fetchEvents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
    }
  };

  const fetchEvents = async () => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Get events for the next 7 days
      
      const response = await calendar.getEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    }
  };

  if (!isConnected) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <Typography variant="h5" gutterBottom>
          Connect Your Google Calendar
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          To use the calendar feature, you need to connect your Google Calendar account.
        </Typography>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleConnectGoogle}
        >
          Connect Google Calendar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Calendar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {event.title}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {event.description}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Start: {new Date(event.start).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                End: {new Date(event.end).toLocaleString()}
              </Typography>
              {event.location && (
                <Typography variant="body2" color="textSecondary">
                  Location: {event.location}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <Formik
          initialValues={{
            title: '',
            description: '',
            start: '',
            end: '',
            location: '',
          }}
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
                  name="start"
                  label="Start Date & Time"
                  type="datetime-local"
                  value={values.start}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.start && Boolean(errors.start)}
                  helperText={touched.start && errors.start}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  name="end"
                  label="End Date & Time"
                  type="datetime-local"
                  value={values.end}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.end && Boolean(errors.end)}
                  helperText={touched.end && errors.end}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  name="location"
                  label="Location"
                  value={values.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  margin="normal"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Create Event
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Calendar; 