import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, Alert, Grid } from '@mui/material';
import { calendarAPI } from '../services/api';

const CalendarIntegrationPage = () => {
  const [calendarSettings, setCalendarSettings] = useState({
    calendarId: '',
    syncEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [integrationStatus, setIntegrationStatus] = useState({
    googleCalendar: false,
    facebookCalendar: false,
    outlookCalendar: false
  });

  useEffect(() => {
    loadCalendarSettings();
    loadIntegrationStatus();
  }, []);

  const loadCalendarSettings = async () => {
    try {
      const response = await calendarAPI.getSettings();
      setCalendarSettings(response.data.data);
    } catch (error) {
      console.error('Error loading calendar settings:', error);
      setMessage('Error loading calendar settings');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrationStatus = async () => {
    try {
      const response = await calendarAPI.getStatus();
      setIntegrationStatus(response.data.data);
    } catch (error) {
      console.error('Error loading integration status:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await calendarAPI.updateSettings({
        calendarId: calendarSettings.calendarId
      });
      
      setCalendarSettings(response.data.data);
      setMessage('Calendar settings updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      setMessage(error.response?.data?.error || 'Error saving calendar settings');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCalendarSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Calendar Integration
      </Typography>
      
      {message && (
        <Alert severity={messageType} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Google Calendar Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Google Calendar ID"
                name="calendarId"
                value={calendarSettings.calendarId}
                onChange={handleInputChange}
                helperText="Enter your Google Calendar ID (e.g., primary or your-calendar-id@group.calendar.google.com)"
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              <strong>Instructions:</strong> To find your Google Calendar ID, open Google Calendar,
              click on the calendar settings (gear icon), go to "Settings and sharing", and copy
              the Calendar ID from the "Integrate calendar" section.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Integration Status
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Google Calendar: {integrationStatus.googleCalendar ? '✅ Enabled' : '❌ Not Configured'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Sync appointments to Google Calendar
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Facebook Events: {integrationStatus.facebookCalendar ? '✅ Enabled' : '❌ Not Available'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Sync appointments to Facebook Events
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body1">
                Outlook Calendar: {integrationStatus.outlookCalendar ? '✅ Enabled' : '❌ Not Available'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sync appointments to Outlook Calendar
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Calendar Integration
        </Typography>
        <Typography variant="body1" paragraph>
          Calendar integration automatically syncs your appointments to your connected calendars.
          When appointments are created, updated, or canceled, the changes will be reflected in
          your calendar application.
        </Typography>
        <Typography variant="body1">
          Currently supported: Google Calendar. Facebook and Outlook calendar support coming soon.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CalendarIntegrationPage;