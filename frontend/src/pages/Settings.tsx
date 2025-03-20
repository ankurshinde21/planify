import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { auth } from '../services/api';

interface UserSettings {
  email_notifications: boolean;
  task_reminders: boolean;
  calendar_sync: boolean;
  dark_mode: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    task_reminders: true,
    calendar_sync: true,
    dark_mode: false,
  });
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSettingChange = (setting: keyof UserSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: event.target.checked,
    }));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    try {
      await auth.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Password changed successfully');
      setOpenPasswordDialog(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Notifications
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Email Notifications"
              secondary="Receive email notifications for important updates"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.email_notifications}
                onChange={handleSettingChange('email_notifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Task Reminders"
              secondary="Get reminders for upcoming tasks"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.task_reminders}
                onChange={handleSettingChange('task_reminders')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Integrations
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Calendar Sync"
              secondary="Sync tasks with your calendar"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.calendar_sync}
                onChange={handleSettingChange('calendar_sync')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Appearance
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Dark Mode"
              secondary="Use dark theme for the application"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.dark_mode}
                onChange={handleSettingChange('dark_mode')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper>
        <Typography variant="h6" sx={{ p: 2 }}>
          Account
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Change Password"
              secondary="Update your account password"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                onClick={() => setOpenPasswordDialog(true)}
              >
                Change Password
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            name="current_password"
            label="Current Password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            name="new_password"
            label="New Password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            name="confirm_password"
            label="Confirm New Password"
            value={passwordData.confirm_password}
            onChange={handlePasswordChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 