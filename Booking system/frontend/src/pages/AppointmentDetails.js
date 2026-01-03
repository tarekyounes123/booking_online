import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI, userAPI, serviceAPI, staffAPI } from '../services/api';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentAPI.getAppointment(id);
        setAppointment(response.data.data);
        setEditData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load appointment details');
        setLoading(false);
        console.error('Error fetching appointment:', err);
      }
    };

    const fetchRelatedData = async () => {
      try {
        const [usersRes, servicesRes, staffRes] = await Promise.all([
          userAPI.getUsers(),
          serviceAPI.getServices(),
          staffAPI.getStaff()
        ]);
        
        setUsers(usersRes.data.data);
        setServices(servicesRes.data.data);
        setStaff(staffRes.data.data);
      } catch (err) {
        console.error('Error fetching related data:', err);
      }
    };

    fetchAppointment();
    fetchRelatedData();
  }, [id]);

  const handleEditToggle = () => {
    if (editing) {
      // Cancel edit, reset to original values
      setEditData({ ...appointment });
    }
    setEditing(!editing);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      // Format time values to ensure they're in HH:MM:SS format for the backend
      const formattedData = {
        ...editData,
        startTime: editData.startTime ? (editData.startTime.length === 5 ? editData.startTime + ':00' : editData.startTime) : editData.startTime,
        endTime: editData.endTime ? (editData.endTime.length === 5 ? editData.endTime + ':00' : editData.endTime) : editData.endTime
      };

      const response = await appointmentAPI.updateAppointment(id, formattedData);
      setAppointment(response.data.data);
      setEditData(response.data.data);
      setEditing(false);
      alert('Appointment updated successfully!');
    } catch (err) {
      console.error('Error updating appointment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update appointment';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await appointmentAPI.deleteAppointment(id);
      alert('Appointment deleted successfully!');
      navigate('/admin'); // Navigate back to admin dashboard
    } catch (err) {
      console.error('Error deleting appointment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete appointment';
      alert(`Error: ${errorMessage}`);
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/admin')} sx={{ mt: 2 }}>
          Back to Admin Dashboard
        </Button>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Appointment not found</Alert>
        <Button variant="contained" onClick={() => navigate('/admin')} sx={{ mt: 2 }}>
          Back to Admin Dashboard
        </Button>
      </Container>
    );
  }

  const getUserById = (userId) => users.find(user => user.id === userId);
  const getServiceById = (serviceId) => services.find(service => service.id === serviceId);
  const getStaffById = (staffId) => staff.find(s => s.id === staffId);

  const appointmentUser = getUserById(appointment.userId);
  const appointmentService = getServiceById(appointment.serviceId);
  const appointmentStaff = getStaffById(appointment.staffId);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Appointment Details
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin')}
                sx={{ mr: 1 }}
              >
                Back to Admin
              </Button>
              <Button
                variant="contained"
                onClick={handleEditToggle}
                sx={{ mr: 1 }}
              >
                {editing ? 'Cancel' : 'Edit'}
              </Button>
              {editing && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saveLoading}
                >
                  {saveLoading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Appointment Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Appointment Information
            </Typography>
            
            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>User</InputLabel>
                  <Select
                    value={editData.userId || ''}
                    onChange={(e) => handleFieldChange('userId', e.target.value)}
                  >
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={editData.serviceId || ''}
                    onChange={(e) => handleFieldChange('serviceId', e.target.value)}
                  >
                    {services.map(service => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name} - ${service.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Staff</InputLabel>
                  <Select
                    value={editData.staffId || ''}
                    onChange={(e) => handleFieldChange('staffId', e.target.value)}
                  >
                    <MenuItem value="">No Staff</MenuItem>
                    {staff.map(staffMember => (
                      <MenuItem key={staffMember.id} value={staffMember.id}>
                        {staffMember.User?.firstName} {staffMember.User?.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Date"
                  type="date"
                  value={editData.date || ''}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Start Time"
                  type="time"
                  value={editData.startTime ? editData.startTime.slice(0, 5) : ''}
                  onChange={(e) => {
                    // Ensure time is in HH:MM format for the input, but store as HH:MM:SS for backend
                    const timeValue = e.target.value;
                    handleFieldChange('startTime', timeValue);
                  }}
                />

                <TextField
                  label="End Time"
                  type="time"
                  value={editData.endTime ? editData.endTime.slice(0, 5) : ''}
                  onChange={(e) => {
                    // Ensure time is in HH:MM format for the input, but store as HH:MM:SS for backend
                    const timeValue = e.target.value;
                    handleFieldChange('endTime', timeValue);
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editData.status || 'pending'}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="no-show">No-Show</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Notes"
                  multiline
                  rows={4}
                  value={editData.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                />

                <TextField
                  label="Location"
                  value={editData.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                />

                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={editData.paymentMethod || 'cash'}
                    onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                  >
                    <MenuItem value="cash">Cash at Service Location</MenuItem>
                    <MenuItem value="online">Online Payment</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Appointment ID:</strong> {appointment.id}</Typography>
                <Typography><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</Typography>
                <Typography><strong>Time:</strong> {appointment.startTime} - {appointment.endTime}</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip 
                    label={appointment.status} 
                    color={
                      appointment.status === 'completed' ? 'success' :
                      appointment.status === 'pending' ? 'warning' :
                      appointment.status === 'cancelled' ? 'error' : 'default'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography><strong>Service:</strong> {appointmentService?.name || 'N/A'}</Typography>
                <Typography><strong>Staff:</strong> {appointmentStaff ? `${appointmentStaff.User?.firstName} ${appointmentStaff.User?.lastName}` : 'Unassigned'}</Typography>
                <Typography><strong>Notes:</strong> {appointment.notes || 'No notes'}</Typography>
                <Typography><strong>Location:</strong> {appointment.location || 'N/A'}</Typography>
                <Typography><strong>Payment Method:</strong>
                  {appointment.paymentMethod === 'cash' ? 'Cash at Service Location' : 'Online Payment'}
                </Typography>
                <Typography><strong>Created:</strong> {new Date(appointment.createdAt).toLocaleString()}</Typography>
                <Typography><strong>Updated:</strong> {new Date(appointment.updatedAt).toLocaleString()}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            
            {appointmentUser ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Name:</strong> {appointmentUser.firstName} {appointmentUser.lastName}</Typography>
                <Typography><strong>Email:</strong> {appointmentUser.email}</Typography>
                <Typography><strong>Phone:</strong> {appointmentUser.phone || 'N/A'}</Typography>
                <Typography><strong>Role:</strong> {appointmentUser.role}</Typography>
                <Typography><strong>Joined:</strong> {new Date(appointmentUser.createdAt).toLocaleDateString()}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">Customer data not available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Service Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Service Details
            </Typography>
            
            {appointmentService ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Name:</strong> {appointmentService.name}</Typography>
                <Typography><strong>Price:</strong> ${appointmentService.price}</Typography>
                <Typography><strong>Duration:</strong> {appointmentService.duration} minutes</Typography>
                <Typography><strong>Category:</strong> {appointmentService.category}</Typography>
                <Typography><strong>Description:</strong> {appointmentService.description}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">Service data not available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Staff Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Staff Details
            </Typography>
            
            {appointmentStaff ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Name:</strong> {appointmentStaff.User?.firstName} {appointmentStaff.User?.lastName}</Typography>
                <Typography><strong>Specialization:</strong> {appointmentStaff.specialization || 'N/A'}</Typography>
                <Typography><strong>Experience:</strong> {appointmentStaff.experience || 'N/A'} years</Typography>
                <Typography><strong>Bio:</strong> {appointmentStaff.bio || 'N/A'}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">No staff assigned</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => setConfirmDelete(true)}
        >
          Delete Appointment
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentDetails;