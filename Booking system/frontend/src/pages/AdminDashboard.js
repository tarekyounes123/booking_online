import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Paper, Button, Card, CardContent, CardActions, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Box, Chip } from '@mui/material';
import { appointmentAPI, userAPI, serviceAPI, staffAPI, paymentAPI, promotionAPI } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
   // ✅ PLACE THE STATE HERE (TOP OF COMPONENT)
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openServiceDetails, setOpenServiceDetails] = useState(false);
const [selectedService, setSelectedService] = useState(null);
const [openNewServiceDialog, setOpenNewServiceDialog] = useState(false);
const [newServiceData, setNewServiceData] = useState({
  name: "",
  price: "",
  duration: "",
  category: "",
  description: "",
  imageFile: null
});
const [openStaffDetails, setOpenStaffDetails] = useState(false);
const [selectedStaff, setSelectedStaff] = useState(null);
const [openNewStaffDialog, setOpenNewStaffDialog] = useState(false);
const [newStaffData, setNewStaffData] = useState({
  userId: "",
  specialization: "",
  experience: "",
  bio: ""
});
const [openPaymentDetails, setOpenPaymentDetails] = useState(false);
const [selectedPayment, setSelectedPayment] = useState(null);

// Promotions state and handlers
const [openNewPromotionDialog, setOpenNewPromotionDialog] = useState(false);
const [newPromotionData, setNewPromotionData] = useState({
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  startDate: '',
  endDate: '',
  usageLimit: ''
});
const [openEditPromotionDialog, setOpenEditPromotionDialog] = useState(false);
const [selectedPromotion, setSelectedPromotion] = useState(null);

const handleOpenNewPromotionDialog = () => {
  setNewPromotionData({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    usageLimit: ''
  });
  setOpenNewPromotionDialog(true);
};

const handleCloseNewPromotionDialog = () => {
  setOpenNewPromotionDialog(false);
};

const handleCreatePromotion = async () => {
  try {
    const res = await promotionAPI.createPromotion(newPromotionData);
    setPromotions([res.data.data, ...promotions]);
    handleCloseNewPromotionDialog();
  } catch (error) {
    console.error('Error creating promotion:', error);
    alert('Failed to create promotion.');
  }
};

const handleOpenEditPromotionDialog = (promo) => {
  setSelectedPromotion({
    ...promo,
    startDate: new Date(promo.startDate).toISOString().split('T')[0],
    endDate: new Date(promo.endDate).toISOString().split('T')[0]
  });
  setOpenEditPromotionDialog(true);
};

const handleCloseEditPromotionDialog = () => {
  setOpenEditPromotionDialog(false);
  setSelectedPromotion(null);
};

const handleUpdatePromotion = async () => {
  if (!selectedPromotion) return;
  try {
    const res = await promotionAPI.updatePromotion(selectedPromotion.id, selectedPromotion);
    setPromotions(promotions.map(p => p.id === selectedPromotion.id ? res.data.data : p));
    handleCloseEditPromotionDialog();
  } catch (error) {
    console.error('Error updating promotion:', error);
    alert('Failed to update promotion.');
  }
};

const handleDeletePromotion = async (id) => {
  if (window.confirm('Are you sure you want to delete this promotion?')) {
    try {
      await promotionAPI.deletePromotion(id);
      setPromotions(promotions.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Failed to delete promotion.');
    }
  }
};

const handleOpenNewServiceDialog = () => {
  setNewServiceData({ name: "", price: "", duration: "", category: "", description: "", imageFile: null });
  setOpenNewServiceDialog(true);
};

const handleCloseNewServiceDialog = () => {
  setOpenNewServiceDialog(false);
};

    // ✅ HANDLERS ALSO HERE
    //create service
    const handleCreateService = async (newService) => {
  try {
    // Create a clean service object for creation
    const serviceToCreate = {
      name: newService.name,
      description: newService.description,
      duration: newService.duration,
      price: newService.price,
      category: newService.category,
      isActive: newService.isActive,
      branchId: newService.branchId
    };

    // Only add imageFile if one was selected
    if (newService.imageFile) {
      serviceToCreate.imageFile = newService.imageFile;
    }

    const response = await serviceAPI.createService(serviceToCreate); // call API
    const createdService = response.data; // assuming API returns the created service

    setServices((prev) => [createdService, ...prev]); // add to state
    alert("Service created successfully!");
  } catch (error) {
    console.error("Failed to create service:", error);
    alert("Failed to create service: " + (error.response?.data?.message || error.message));
  }
};
    // Open service dialog
const handleViewServiceDetails = (service) => {
  setSelectedService({ ...service, imageFile: null });
  setOpenServiceDetails(true);
};

// Close service dialog
const handleCloseServiceDetails = () => {
  setOpenServiceDetails(false);
  setSelectedService(null);
};

// Update service
const handleEditService = async (updatedService) => {
  try {
    // Create a clean service object without the original image URL (only include fields to update)
    const serviceToUpdate = {
      id: updatedService.id,
      name: updatedService.name,
      description: updatedService.description,
      duration: updatedService.duration,
      price: updatedService.price,
      category: updatedService.category,
      isActive: updatedService.isActive,
      branchId: updatedService.branchId
    };

    // Only add imageFile if a new image was selected
    if (updatedService.imageFile) {
      serviceToUpdate.imageFile = updatedService.imageFile;
    }

    await serviceAPI.updateService(updatedService.id, serviceToUpdate); // call API

    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? updatedService : s))
    );

    setSelectedService(updatedService);
    alert("Service updated successfully!");
  } catch (error) {
    console.error("Failed to update service:", error);
    alert("Failed to update service in database: " + (error.response?.data?.message || error.message));
  }
};

// Delete service
const handleDeleteService = async (serviceId) => {
  if (!window.confirm("Are you sure you want to delete this service?")) return;

  try {
    await serviceAPI.deleteService(serviceId); // call API

    setServices((prev) => prev.filter((s) => s.id !== serviceId));

    setOpenServiceDetails(false);
    setSelectedService(null);
  } catch (error) {
    console.error("Failed to delete service:", error);
    alert("Failed to delete service");
  }
};

// Staff handlers
const handleOpenNewStaffDialog = () => {
  setNewStaffData({ userId: "", specialization: "", experience: "", bio: "" });
  setOpenNewStaffDialog(true);
};

const handleCloseNewStaffDialog = () => {
  setOpenNewStaffDialog(false);
};

const handleCreateStaff = async (newStaff) => {
  try {
    const response = await staffAPI.createStaff(newStaff);
    const createdStaff = response.data;

    setStaff((prev) => [createdStaff, ...prev]);
    alert("Staff member created successfully!");
  } catch (error) {
    console.error("Failed to create staff:", error);
    alert("Failed to create staff member");
  }
};

const handleViewStaffDetails = (staff) => {
  setSelectedStaff(staff);
  setOpenStaffDetails(true);
};

const handleCloseStaffDetails = () => {
  setOpenStaffDetails(false);
  setSelectedStaff(null);
};

const handleEditStaff = async (updatedStaff) => {
  try {
    await staffAPI.updateStaff(updatedStaff.id, updatedStaff);

    setStaff((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );

    setSelectedStaff(updatedStaff);
    alert("Staff member updated successfully!");
  } catch (error) {
    console.error("Failed to update staff:", error);
    alert("Failed to update staff member in database");
  }
};

const handleDeleteStaff = async (staffId) => {
  if (!window.confirm("Are you sure you want to delete this staff member?")) return;

  try {
    await staffAPI.deleteStaff(staffId);

    setStaff((prev) => prev.filter((s) => s.id !== staffId));

    setOpenStaffDetails(false);
    setSelectedStaff(null);
  } catch (error) {
    console.error("Failed to delete staff:", error);
    alert("Failed to delete staff member");
  }
};

    // Open user details
const handleViewUserDetails = (user) => {
  setSelectedUser(user);
  setOpenUserDetails(true);
};

// Close user details
const handleCloseUserDetails = () => {
  setOpenUserDetails(false);
  setSelectedUser(null);
};

// Update user
const handleEditUser = async (updatedUser) => {
  try {
    await userAPI.updateUser(updatedUser.id, updatedUser); // call your API

    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    setSelectedUser(updatedUser);
    alert("User updated successfully!");
  } catch (error) {
    console.error("Failed to update user:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to update user in database";
    alert(`Failed to update user: ${errorMessage}`);
  }
};

// Delete user
const handleDeleteUser = async (userId) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    await userAPI.deleteUser(userId); // call your API

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    setOpenUserDetails(false);
    setSelectedUser(null);
  } catch (error) {
    console.error("Failed to delete user:", error);
    alert("Failed to delete user");
  }
};

// Payment handlers
const handleViewPaymentDetails = (payment) => {
  setSelectedPayment(payment);
  setOpenPaymentDetails(true);
};

const handleClosePaymentDetails = () => {
  setOpenPaymentDetails(false);
  setSelectedPayment(null);
};

const handleEditPayment = async (updatedPayment) => {
  try {
    // Note: The payment API doesn't have update method, so we'll show a message
    alert("Payment update functionality would be implemented in the backend");
    // For now, we'll just update the local state
    setPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );

    setSelectedPayment(updatedPayment);
    alert("Payment updated successfully!");
  } catch (error) {
    console.error("Failed to update payment:", error);
    alert("Failed to update payment in database");
  }
};

const handleDeletePayment = async (paymentId) => {
  if (!window.confirm("Are you sure you want to delete this payment?")) return;

  try {
    // Note: The payment API doesn't have delete method, so we'll show a message
    alert("Payment delete functionality would be implemented in the backend");
    // For now, we'll just update the local state
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));

    setOpenPaymentDetails(false);
    setSelectedPayment(null);
  } catch (error) {
    console.error("Failed to delete payment:", error);
    alert("Failed to delete payment");
  }
};

  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, usersRes, servicesRes, staffRes, paymentsRes, promotionsRes] = await Promise.all([
          appointmentAPI.getAppointments(),
          userAPI.getUsers(),
          serviceAPI.getServices(),
          staffAPI.getStaff(),
          paymentAPI.getPayments(),
          promotionAPI.getPromotions()
        ]);

        setAppointments(appointmentsRes.data.data);
        setUsers(usersRes.data.data);
        setServices(servicesRes.data.data);
        setStaff(staffRes.data.data);
        setPayments(paymentsRes.data.data);
        setPromotions(promotionsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const pendingAppointments = appointments.filter(appt => appt.status === 'pending');
  const todayAppointments = appointments.filter(appt => 
    new Date(appt.date).toDateString() === new Date().toDateString()
  );
  const revenue = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => {
      // Handle different possible formats of amount (string, number, decimal)
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography component="h1" variant="h4" gutterBottom className="fw-bold" sx={{ fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' } }}>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Manage your system and monitor business performance
        </Typography>
      </Box>

      {/* Stats Cards - Responsive Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
              minHeight: 100
            }}
          >
            <Typography variant="h5" className="fw-bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {appointments.length}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Total Appointments</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: 'success.light',
              color: 'success.contrastText',
              minHeight: 100
            }}
          >
            <Typography variant="h5" className="fw-bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {users.length}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Total Users</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: 'info.light',
              color: 'info.contrastText',
              minHeight: 100
            }}
          >
            <Typography variant="h5" className="fw-bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              ${revenue.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Total Revenue</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: 'warning.light',
              color: 'warning.contrastText',
              minHeight: 100
            }}
          >
            <Typography variant="h5" className="fw-bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {pendingAppointments.length}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Pending Appointments</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs - Responsive */}
      <Paper sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
              minWidth: { xs: 70, sm: 80, md: 100 }
            }
          }}
        >
          <Tab label="Appointments" />
          <Tab label="Users" />
          <Tab label="Services" />
          <Tab label="Staff" />
          <Tab label="Payments" />
          <Tab label="Promotions" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 1
          }}>
            <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Appointments
            </Typography>
            <Button
              variant="contained"
              onClick={() => alert('New appointment functionality would go here')}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add New Appointment
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {appointments.map((appointment) => (
                <Grid item xs={12} key={appointment.id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {appointment.Service?.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                        Customer: {appointment.User?.firstName} {appointment.User?.lastName}<br />
                        Phone: {appointment.User?.phone || 'N/A'}<br />
                        Date: {new Date(appointment.date).toLocaleDateString()}<br />
                        Time: {appointment.startTime} - {appointment.endTime}<br />
                        Status: <Chip
                          label={appointment.status}
                          color={
                            appointment.status === 'completed' ? 'success' :
                            appointment.status === 'pending' ? 'warning' :
                            appointment.status === 'canceled' ? 'error' : 'default'
                          }
                          size="small"
                          sx={{ borderRadius: 2, ml: 1, mt: 0.5 }}
                        />
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1,
                      flexShrink: 0
                    }}>
                      {appointment.User?.phone && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(`https://wa.me/${appointment.User.phone.replace(/\D/g, '')}`, '_blank')}
                          sx={{
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            backgroundColor: '#25D366',
                            color: 'white',
                            '&:hover': { backgroundColor: '#128C7E' },
                            minWidth: 'auto'
                          }}
                        >
                          WhatsApp
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => alert('Edit functionality would go here')}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Staff Dialogs */}
      <Dialog
        open={openNewStaffDialog}
        onClose={handleCloseNewStaffDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="User ID"
              value={newStaffData.userId}
              onChange={(e) =>
                setNewStaffData((prev) => ({ ...prev, userId: e.target.value }))
              }
            />
            <TextField
              label="Specialization"
              value={newStaffData.specialization}
              onChange={(e) =>
                setNewStaffData((prev) => ({ ...prev, specialization: e.target.value }))
              }
            />
            <TextField
              label="Experience (years)"
              type="number"
              value={newStaffData.experience}
              onChange={(e) =>
                setNewStaffData((prev) => ({ ...prev, experience: e.target.value }))
              }
            />
            <TextField
              label="Bio"
              multiline
              rows={3}
              value={newStaffData.bio}
              onChange={(e) =>
                setNewStaffData((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              handleCreateStaff(newStaffData);
              handleCloseNewStaffDialog();
            }}
          >
            Create
          </Button>
          <Button onClick={handleCloseNewStaffDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openStaffDetails}
        onClose={handleCloseStaffDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Staff</DialogTitle>
        <DialogContent dividers>
          {selectedStaff && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="User ID"
                value={selectedStaff.userId || ""}
                onChange={(e) =>
                  setSelectedStaff((prev) => ({ ...prev, userId: e.target.value }))
                }
              />
              <TextField
                label="Specialization"
                value={selectedStaff.specialization || ""}
                onChange={(e) =>
                  setSelectedStaff((prev) => ({ ...prev, specialization: e.target.value }))
                }
              />
              <TextField
                label="Experience (years)"
                type="number"
                value={selectedStaff.experience || ""}
                onChange={(e) =>
                  setSelectedStaff((prev) => ({ ...prev, experience: e.target.value }))
                }
              />
              <TextField
                label="Bio"
                multiline
                rows={3}
                value={selectedStaff.bio || ""}
                onChange={(e) =>
                  setSelectedStaff((prev) => ({ ...prev, bio: e.target.value }))
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => handleDeleteStaff(selectedStaff.id)}>
            Delete
          </Button>
          <Button color="primary" onClick={() => handleEditStaff(selectedStaff)}>
            Save Changes
          </Button>
          <Button onClick={handleCloseStaffDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {activeTab === 1 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 1
          }}>
            <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Users
            </Typography>
            <Button
              variant="contained"
              onClick={() => alert('New user functionality would go here')}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add New User
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {users.map((user) => (
                <Grid item xs={12} key={user.id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                        {user.email}<br />
                        Role: <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                          sx={{ borderRadius: 2, ml: 1, mt: 0.5 }}
                        /><br />
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1,
                      flexShrink: 0
                    }}>
                      {user.phone && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(`https://wa.me/${user.phone.replace(/\D/g, '')}`, '_blank')}
                          sx={{
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            backgroundColor: '#25D366',
                            color: 'white',
                            '&:hover': { backgroundColor: '#128C7E' },
                            minWidth: 'auto'
                          }}
                        >
                          WhatsApp
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewUserDetails(user)}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => alert('Edit functionality would go here')}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}
      <Dialog
  open={openUserDetails}
  onClose={handleCloseUserDetails}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>User Details</DialogTitle>

  <DialogContent dividers>
    {selectedUser && (
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="First Name"
          value={selectedUser.firstName || ""}
          onChange={(e) =>
            setSelectedUser((prev) => ({ ...prev, firstName: e.target.value }))
          }
        />
        <TextField
          label="Last Name"
          value={selectedUser.lastName || ""}
          onChange={(e) =>
            setSelectedUser((prev) => ({ ...prev, lastName: e.target.value }))
          }
        />
        <TextField
          label="Email"
          type="email"
          value={selectedUser.email || ""}
          onChange={(e) =>
            setSelectedUser((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedUser.role || ""}
            onChange={(e) =>
              setSelectedUser((prev) => ({ ...prev, role: e.target.value }))
            }
          >
            <MenuItem value="customer">Customer</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
          </Select>
        </FormControl>
      </Box>
    )}
  </DialogContent>

  <DialogActions>
    <Button color="error" onClick={() => handleDeleteUser(selectedUser.id)}>
      Delete
    </Button>

    <Button color="primary" onClick={() => handleEditUser(selectedUser)}>
      Save
    </Button>

    <Button onClick={handleCloseUserDetails}>Close</Button>
  </DialogActions>
</Dialog>

      {activeTab === 2 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 1
          }}>
            <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Services
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpenNewServiceDialog}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add New Service
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {services.map((service) => (
                <Grid item xs={12} key={service.id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {service.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                        Description: {service.description}<br/>
                        Price: ${service.price}<br />
                        Duration: {service.duration} min<br />
                        Category: {service.category}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1,
                      flexShrink: 0
                    }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewServiceDetails(service)}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => alert('Delete functionality would go here')}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                        color="error"
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}
    <Dialog
  open={openNewServiceDialog}
  onClose={handleCloseNewServiceDialog}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Add New Service</DialogTitle>
  <DialogContent dividers>
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Service Name"
        value={newServiceData.name}
        onChange={(e) =>
          setNewServiceData((prev) => ({ ...prev, name: e.target.value }))
        }
      />
       <TextField
        label="Service Description"
        value={newServiceData.description}
        onChange={(e) =>
          setNewServiceData((prev) => ({ ...prev, description: e.target.value }))
        }
      />
      <TextField
        label="Price"
        type="number"
        value={newServiceData.price}
        onChange={(e) =>
          setNewServiceData((prev) => ({ ...prev, price: e.target.value }))
        }
      />
      <TextField
        label="Duration (minutes)"
        type="number"
        value={newServiceData.duration}
        onChange={(e) =>
          setNewServiceData((prev) => ({ ...prev, duration: e.target.value }))
        }
      />
      <TextField
        label="Category"
        value={newServiceData.category}
        onChange={(e) =>
          setNewServiceData((prev) => ({ ...prev, category: e.target.value }))
        }
      />
      <input
        accept="image/*"
        id="service-image-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            // For now, we'll handle the file in the API call
            setNewServiceData((prev) => ({ ...prev, imageFile: file }));
          }
        }}
      />
      <label htmlFor="service-image-upload">
        <Button variant="outlined" component="span" fullWidth>
          Upload Service Image
        </Button>
      </label>
      {newServiceData.imageFile && (
        <Typography variant="body2" color="text.secondary">
          Selected: {newServiceData.imageFile.name}
        </Typography>
      )}
    </Box>
  </DialogContent>
  <DialogActions>
    <Button
      color="primary"
      onClick={() => {
        handleCreateService(newServiceData);
        handleCloseNewServiceDialog();
      }}
    >
      Create
    </Button>
    <Button onClick={handleCloseNewServiceDialog}>Cancel</Button>
  </DialogActions>
</Dialog>

{/* THIS IS THE NEW DIALOG FOR EDITING A SERVICE */}
<Dialog
  open={openServiceDetails}
  onClose={handleCloseServiceDetails}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Edit Service</DialogTitle>
  <DialogContent dividers>
    {selectedService && (
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Service Name"
          value={selectedService.name}
          onChange={(e) =>
            setSelectedService((prev) => ({ ...prev, name: e.target.value }))
          }
        />
          <TextField
          label="Service Description"
          value={selectedService.description}
          onChange={(e) =>
            setSelectedService((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <TextField
          label="Price"
          type="number"
          value={selectedService.price}
          onChange={(e) =>
            setSelectedService((prev) => ({ ...prev, price: e.target.value }))
          }
        />
        <TextField
          label="Duration (minutes)"
          type="number"
          value={selectedService.duration}
          onChange={(e) =>
            setSelectedService((prev) => ({ ...prev, duration: e.target.value }))
          }
        />
        <TextField
          label="Category"
          value={selectedService.category}
          onChange={(e) =>
            setSelectedService((prev) => ({ ...prev, category: e.target.value }))
          }
        />
        <input
          accept="image/*"
          id="service-edit-image-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // For now, we'll handle the file in the API call
              setSelectedService((prev) => ({ ...prev, imageFile: file }));
            }
          }}
        />
        <label htmlFor="service-edit-image-upload">
          <Button variant="outlined" component="span" fullWidth>
            Upload New Image
          </Button>
        </label>
        {selectedService.imageFile && (
          <Typography variant="body2" color="text.secondary">
            Selected: {selectedService.imageFile.name}
          </Typography>
        )}
        {selectedService.image && !selectedService.imageFile && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <img
              src={selectedService.image}
              alt={selectedService.name}
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </Box>
        )}
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button color="error" onClick={() => handleDeleteService(selectedService.id)}>
      Delete
    </Button>
    <Button color="primary" onClick={() => handleEditService(selectedService)}>
      Save Changes
    </Button>
    <Button onClick={handleCloseServiceDetails}>Close</Button>
  </DialogActions>
</Dialog>


      {activeTab === 3 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 1
          }}>
            <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Staff
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpenNewStaffDialog}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add New Staff
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {staff.map((staffMember) => (
                <Grid item xs={12} key={staffMember.id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {staffMember.User?.firstName} {staffMember.User?.lastName}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                        Specialization: {staffMember.specialization || 'N/A'}<br />
                        Experience: {staffMember.experience || 'N/A'} years<br />
                        Email: {staffMember.User?.email}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1,
                      flexShrink: 0
                    }}>
                      {staffMember.User?.phone && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(`https://wa.me/${staffMember.User.phone.replace(/\D/g, '')}`, '_blank')}
                          sx={{
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            backgroundColor: '#25D366',
                            color: 'white',
                            '&:hover': { backgroundColor: '#128C7E' },
                            minWidth: 'auto'
                          }}
                        >
                          WhatsApp
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewStaffDetails(staffMember)}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => alert('Delete functionality would go here')}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                        color="error"
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {activeTab === 4 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 1
          }}>
            <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Payments
            </Typography>
            <Button
              variant="contained"
              onClick={() => alert('New payment functionality would go here')}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add New Payment
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {payments.map((payment) => (
                <Grid item xs={12} key={payment.id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        ${payment.amount} - {payment.status}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                        Appointment ID: {payment.appointmentId}<br />
                        User: {payment.Appointment?.User?.firstName} {payment.Appointment?.User?.lastName}<br />
                        Paid At: {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'N/A'}<br />
                        Method: {payment.paymentMethod || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1,
                      flexShrink: 0
                    }}>
                      {payment.Appointment?.User?.phone && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(`https://wa.me/${payment.Appointment.User.phone.replace(/\D/g, '')}`, '_blank')}
                          sx={{
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            backgroundColor: '#25D366',
                            color: 'white',
                            '&:hover': { backgroundColor: '#128C7E' },
                            minWidth: 'auto'
                          }}
                        >
                          WhatsApp
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewPaymentDetails(payment)}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => alert('Edit functionality would go here')}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {activeTab === 5 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 1
          }}>
            <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Promotions
            </Typography>
            <Button
              variant="contained"
              onClick={handleOpenNewPromotionDialog}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add New Promotion
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {promotions.map((promo) => (
                <Grid item xs={12} key={promo.id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {promo.code}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                        {promo.description}<br />
                        Discount: {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}<br />
                        Valid: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}<br/>
                        Usage: {promo.timesUsed} / {promo.usageLimit}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1,
                      flexShrink: 0
                    }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenEditPromotionDialog(promo)}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleDeletePromotion(promo.id)}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                        color="error"
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Promotion Dialogs */}
      <Dialog open={openNewPromotionDialog} onClose={handleCloseNewPromotionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Promotion</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Code" value={newPromotionData.code} onChange={(e) => setNewPromotionData({ ...newPromotionData, code: e.target.value })} />
            <TextField label="Description" value={newPromotionData.description} onChange={(e) => setNewPromotionData({ ...newPromotionData, description: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Discount Type</InputLabel>
              <Select value={newPromotionData.discountType} label="Discount Type" onChange={(e) => setNewPromotionData({ ...newPromotionData, discountType: e.target.value })}>
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Discount Value" type="number" value={newPromotionData.discountValue} onChange={(e) => setNewPromotionData({ ...newPromotionData, discountValue: e.target.value })} />
            <TextField label="Start Date" type="date" value={newPromotionData.startDate} onChange={(e) => setNewPromotionData({ ...newPromotionData, startDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label="End Date" type="date" value={newPromotionData.endDate} onChange={(e) => setNewPromotionData({ ...newPromotionData, endDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField label="Usage Limit" type="number" value={newPromotionData.usageLimit} onChange={(e) => setNewPromotionData({ ...newPromotionData, usageLimit: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewPromotionDialog}>Cancel</Button>
          <Button onClick={handleCreatePromotion}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditPromotionDialog} onClose={handleCloseEditPromotionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Promotion</DialogTitle>
        <DialogContent>
          {selectedPromotion && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Code" value={selectedPromotion.code} onChange={(e) => setSelectedPromotion({ ...selectedPromotion, code: e.target.value })} />
              <TextField label="Description" value={selectedPromotion.description} onChange={(e) => setSelectedPromotion({ ...selectedPromotion, description: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select value={selectedPromotion.discountType} label="Discount Type" onChange={(e) => setSelectedPromotion({ ...selectedPromotion, discountType: e.target.value })}>
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Discount Value" type="number" value={selectedPromotion.discountValue} onChange={(e) => setSelectedPromotion({ ...selectedPromotion, discountValue: e.target.value })} />
              <TextField label="Start Date" type="date" value={selectedPromotion.startDate} onChange={(e) => setSelectedPromotion({ ...selectedPromotion, startDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label="End Date" type="date" value={selectedPromotion.endDate} onChange={(e) => setSelectedPromotion({ ...selectedPromotion, endDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label="Usage Limit" type="number" value={selectedPromotion.usageLimit} onChange={(e) => setSelectedPromotion({ ...selectedPromotion, usageLimit: e.target.value })} />
               <FormControl fullWidth>
                <InputLabel>Is Active</InputLabel>
                <Select value={selectedPromotion.isActive} label="Is Active" onChange={(e) => setSelectedPromotion({ ...selectedPromotion, isActive: e.target.value })}>
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditPromotionDialog}>Cancel</Button>
          <Button onClick={handleUpdatePromotion}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialogs - Note: Payment creation is not supported by the API */}

      <Dialog
        open={openPaymentDetails}
        onClose={handleClosePaymentDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Appointment ID"
                value={selectedPayment.appointmentId || ""}
                disabled
              />
              <TextField
                label="Amount"
                value={typeof selectedPayment.amount === 'string' ? selectedPayment.amount : (selectedPayment.amount || 0).toFixed(2)}
                disabled
              />
              <TextField
                label="Status"
                value={selectedPayment.status || "pending"}
                disabled
              />
              <TextField
                label="Payment Method"
                value={selectedPayment.paymentMethod || "credit_card"}
                disabled
              />
              <TextField
                label="Paid At"
                value={selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleString() : 'N/A'}
                disabled
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;