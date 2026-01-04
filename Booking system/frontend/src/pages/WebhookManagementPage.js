import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, Alert, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { Delete, Edit, PlayArrow } from '@mui/icons-material';
import { webhookAPI } from '../services/api';

const WebhookManagementPage = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentWebhook, setCurrentWebhook] = useState({
    name: '',
    url: '',
    event: 'appointment.created',
    isActive: true,
    secret: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const events = [
    'appointment.created',
    'appointment.updated', 
    'appointment.deleted',
    'payment.completed',
    'user.created',
    'user.updated'
  ];

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const response = await webhookAPI.getWebhooks();
      setWebhooks(response.data.data);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      setMessage('Error loading webhooks');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (webhook = null) => {
    if (webhook) {
      setCurrentWebhook(webhook);
      setIsEditing(true);
    } else {
      setCurrentWebhook({
        name: '',
        url: '',
        event: 'appointment.created',
        isActive: true,
        secret: ''
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentWebhook({
      name: '',
      url: '',
      event: 'appointment.created',
      isActive: true,
      secret: ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentWebhook(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveWebhook = async () => {
    try {
      if (isEditing) {
        await webhookAPI.updateWebhook(currentWebhook.id, currentWebhook);
      } else {
        await webhookAPI.createWebhook(currentWebhook);
      }
      
      setMessage(isEditing ? 'Webhook updated successfully!' : 'Webhook created successfully!');
      setMessageType('success');
      handleCloseDialog();
      loadWebhooks();
    } catch (error) {
      console.error('Error saving webhook:', error);
      setMessage(error.response?.data?.error || 'Error saving webhook');
      setMessageType('error');
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      await webhookAPI.deleteWebhook(id);
      setMessage('Webhook deleted successfully!');
      setMessageType('success');
      loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      setMessage(error.response?.data?.error || 'Error deleting webhook');
      setMessageType('error');
    }
  };

  const handleTestWebhook = async (id) => {
    try {
      const response = await webhookAPI.testWebhook(id);
      setMessage(response.data.data.message);
      setMessageType(response.data.data.success ? 'success' : 'error');
    } catch (error) {
      console.error('Error testing webhook:', error);
      setMessage(error.response?.data?.error || 'Error testing webhook');
      setMessageType('error');
    }
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
        Webhook Management
      </Typography>
      
      {message && (
        <Alert severity={messageType} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Webhooks</Typography>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
            >
              Add Webhook
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Triggered</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell>{webhook.name}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {webhook.url}
                  </Typography>
                </TableCell>
                <TableCell>{webhook.event}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: webhook.isActive ? 'success.light' : 'error.light',
                      color: webhook.isActive ? 'success.contrastText' : 'error.contrastText'
                    }}
                  >
                    {webhook.isActive ? 'Active' : 'Inactive'}
                  </Box>
                </TableCell>
                <TableCell>
                  {webhook.lastTriggeredAt ? new Date(webhook.lastTriggeredAt).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleTestWebhook(webhook.id)}
                    title="Test Webhook"
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(webhook)}
                    title="Edit Webhook"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    title="Delete Webhook"
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Webhook' : 'Add New Webhook'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Webhook Name"
              name="name"
              value={currentWebhook.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Webhook URL"
              name="url"
              value={currentWebhook.url}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Event Type</InputLabel>
              <Select
                name="event"
                value={currentWebhook.event}
                onChange={handleInputChange}
              >
                {events.map(event => (
                  <MenuItem key={event} value={event}>{event}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={currentWebhook.isActive}
                  onChange={(e) => handleInputChange({ target: { name: 'isActive', value: e.target.checked } })}
                />
              }
              label="Active"
              sx={{ mt: 1 }}
            />
            
            {isEditing && (
              <TextField
                fullWidth
                label="Secret (read-only)"
                value={currentWebhook.secret || 'Not set'}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveWebhook} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Webhooks
        </Typography>
        <Typography variant="body1" paragraph>
          Webhooks allow external services to be notified when specific events occur in your booking system.
          When an event occurs (like an appointment being created), we'll send an HTTP POST request to your
          configured URL with the event data.
        </Typography>
        <Typography variant="body1">
          Supported events: {events.join(', ')}
        </Typography>
      </Paper>
    </Container>
  );
};

export default WebhookManagementPage;