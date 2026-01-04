import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Paper, Button, Card, CardContent, CardActions, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Box, Chip, FormControlLabel, Switch } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { appointmentAPI, userAPI, serviceAPI, staffAPI, paymentAPI, promotionAPI, categoryAPI } from '../services/api';

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

// Category Management State
const [openNewCategoryDialog, setOpenNewCategoryDialog] = useState(false);
const [openEditCategoryDialog, setOpenEditCategoryDialog] = useState(false);
const [newCategoryData, setNewCategoryData] = useState({
  name: '',
  description: '',
  isActive: true
});
const [editCategoryData, setEditCategoryData] = useState({
  name: '',
  description: '',
  isActive: true
});
const [selectedCategory, setSelectedCategory] = useState(null);

// Additional state for advanced features
const [searchTerm, setSearchTerm] = useState('');
const [dateRange, setDateRange] = useState({ start: '', end: '' });
const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

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

const handleOpenNewCategoryDialog = () => {
  setNewCategoryData({
    name: '',
    description: '',
    isActive: true
  });
  setOpenNewCategoryDialog(true);
};

const handleCloseNewCategoryDialog = () => {
  setOpenNewCategoryDialog(false);
  setNewCategoryData({
    name: '',
    description: '',
    isActive: true
  });
};

const handleCreateCategoryFromPromotion = async () => {
  try {
    const res = await categoryAPI.createCategory(newCategoryData);
    setCategories([res.data.data, ...categories]);
    setFilteredCategories([res.data.data, ...filteredCategories]);
    handleCloseNewCategoryDialog();
  } catch (error) {
    console.error('Error creating category:', error);
    alert('Failed to create category: ' + (error.response?.data?.error || error.message));
  }
};

const handleOpenEditCategoryDialog = (category) => {
  setSelectedCategory(category);
  setEditCategoryData({
    name: category.name,
    description: category.description || '',
    isActive: category.isActive
  });
  setOpenEditCategoryDialog(true);
};

const handleCloseEditCategoryDialog = () => {
  setOpenEditCategoryDialog(false);
  setSelectedCategory(null);
  setEditCategoryData({
    name: '',
    description: '',
    isActive: true
  });
};

const handleUpdateCategoryFromPromotion = async () => {
  if (!selectedCategory) return;
  try {
    const res = await categoryAPI.updateCategory(selectedCategory.id, editCategoryData);
    setCategories(categories.map(cat => cat.id === selectedCategory.id ? res.data.data : cat));
    setFilteredCategories(filteredCategories.map(cat => cat.id === selectedCategory.id ? res.data.data : cat));
    handleCloseEditCategoryDialog();
  } catch (error) {
    console.error('Error updating category:', error);
    alert('Failed to update category: ' + (error.response?.data?.error || error.message));
  }
};

const handleDeleteCategoryFromPromotion = async (id) => {
  if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
    try {
      await categoryAPI.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
      setFilteredCategories(filteredCategories.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category: ' + (error.response?.data?.error || error.message));
    }
  }
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

const handleViewUserDetails = (user) => {
  setSelectedUser(user);
  setOpenUserDetails(true);
};

const handleCloseUserDetails = () => {
  setOpenUserDetails(false);
  setSelectedUser(null);
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

// Category Management Handlers
const handleCreateCategory = async () => {
  try {
    const res = await categoryAPI.createCategory(newCategoryData);
    setCategories([res.data.data, ...categories]);
    setOpenNewCategoryDialog(false);
    setNewCategoryData({ name: '', description: '', isActive: true });
  } catch (error) {
    console.error('Error creating category:', error);
    alert('Failed to create category: ' + (error.response?.data?.error || error.message));
  }
};

const handleUpdateCategory = async () => {
  if (!selectedCategory) return;
  try {
    const res = await categoryAPI.updateCategory(selectedCategory.id, editCategoryData);
    setCategories(categories.map(c => c.id === selectedCategory.id ? res.data.data : c));
    setOpenEditCategoryDialog(false);
    setSelectedCategory(null);
  } catch (error) {
    console.error('Error updating category:', error);
    alert('Failed to update category: ' + (error.response?.data?.error || error.message));
  }
};

const handleDeleteCategory = async (id) => {
  if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
    try {
      await categoryAPI.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category: ' + (error.response?.data?.error || error.message));
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

// Drag and drop handler for services
const onDragEnd = async (result) => {
  if (!result.destination) return;

  const items = Array.from(filteredServices);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  // Update the state with the new order
  setFilteredServices(items);
  setServices(prev => {
    // Update the main services state to reflect the new order
    const updatedServices = [...prev];
    const serviceIndex = updatedServices.findIndex(s => s.id === reorderedItem.id);
    if (serviceIndex !== -1) {
      updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], position: result.destination.index };
    }
    return updatedServices;
  });

  // Update the service position in the database
  try {
    await serviceAPI.updateService(reorderedItem.id, { position: result.destination.index });
  } catch (error) {
    console.error("Failed to update service position:", error);
    // If the update fails, revert the UI changes
    setFilteredServices(prev => {
      const revertedItems = Array.from(prev);
      const [movedItem] = revertedItems.splice(result.destination.index, 1);
      revertedItems.splice(result.source.index, 0, movedItem);
      return revertedItems;
    });
    setServices(prev => {
      const revertedServices = [...prev];
      const serviceIndex = revertedServices.findIndex(s => s.id === reorderedItem.id);
      if (serviceIndex !== -1) {
        revertedServices[serviceIndex] = { ...revertedServices[serviceIndex], position: result.source.index };
      }
      return revertedServices;
    });
    alert("Failed to update service position in database");
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
const handleViewUserDetailsDuplicate = (user) => {
  setSelectedUser(user);
  setOpenUserDetails(true);
};

// Close user details
const handleCloseUserDetailsDuplicate = () => {
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
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, usersRes, servicesRes, staffRes, paymentsRes, promotionsRes, categoriesRes] = await Promise.all([
          appointmentAPI.getAppointments(),
          userAPI.getUsers(),
          serviceAPI.getServices(),
          staffAPI.getStaff(),
          paymentAPI.getPayments(),
          promotionAPI.getPromotions(),
          categoryAPI.getCategories()
        ]);

        setAppointments(appointmentsRes.data.data);
        setFilteredAppointments(appointmentsRes.data.data); // Initially set to all appointments
        setUsers(usersRes.data.data);
        setFilteredUsers(usersRes.data.data); // Initially set to all users
        setServices(servicesRes.data.data);
        setFilteredServices(servicesRes.data.data); // Initially set to all services
        setStaff(staffRes.data.data);
        setFilteredStaff(staffRes.data.data); // Initially set to all staff
        setPayments(paymentsRes.data.data);
        setFilteredPayments(paymentsRes.data.data); // Initially set to all payments
        setPromotions(promotionsRes.data.data);
        setFilteredPromotions(promotionsRes.data.data); // Initially set to all promotions
        setCategories(categoriesRes.data.data);
        setFilteredCategories(categoriesRes.data.data); // Initially set to all categories
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter appointments based on search term, date range, and sorting
  useEffect(() => {
    if (appointments.length === 0) return;

    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.User?.firstName?.toLowerCase().includes(term) ||
        appointment.User?.lastName?.toLowerCase().includes(term) ||
        appointment.User?.email?.toLowerCase().includes(term) ||
        appointment.Service?.name?.toLowerCase().includes(term) ||
        appointment.status?.toLowerCase().includes(term)
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(appointment =>
        new Date(appointment.date) >= new Date(dateRange.start)
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(appointment =>
        new Date(appointment.date) <= new Date(dateRange.end)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, dateRange, sortConfig]);

  // Filter services based on search term
  useEffect(() => {
    if (services.length === 0) return;

    let filtered = [...services];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.name?.toLowerCase().includes(term) ||
        service.description?.toLowerCase().includes(term) ||
        service.category?.toLowerCase().includes(term) ||
        service.price?.toString().includes(term)
      );
    }

    setFilteredServices(filtered);
  }, [services, searchTerm]);

  // Filter staff based on search term
  useEffect(() => {
    if (staff.length === 0) return;

    let filtered = [...staff];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.User?.firstName?.toLowerCase().includes(term) ||
        member.User?.lastName?.toLowerCase().includes(term) ||
        member.User?.email?.toLowerCase().includes(term) ||
        member.specialization?.toLowerCase().includes(term) ||
        member.experience?.toString().includes(term)
      );
    }

    setFilteredStaff(filtered);
  }, [staff, searchTerm]);

  // Filter payments based on search term
  useEffect(() => {
    if (payments.length === 0) return;

    let filtered = [...payments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.amount?.toString().includes(term) ||
        payment.status?.toLowerCase().includes(term) ||
        payment.paymentMethod?.toLowerCase().includes(term) ||
        payment.Appointment?.User?.firstName?.toLowerCase().includes(term) ||
        payment.Appointment?.User?.lastName?.toLowerCase().includes(term)
      );
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm]);

  // Filter promotions based on search term
  useEffect(() => {
    if (promotions.length === 0) return;

    let filtered = [...promotions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(promotion =>
        promotion.code?.toLowerCase().includes(term) ||
        promotion.description?.toLowerCase().includes(term) ||
        promotion.discountType?.toLowerCase().includes(term) ||
        promotion.discountValue?.toString().includes(term)
      );
    }

    setFilteredPromotions(filtered);
  }, [promotions, searchTerm]);

  // Filter users based on search term
  useEffect(() => {
    if (users.length === 0) return;

    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  // Filter categories based on search term
  useEffect(() => {
    if (categories.length === 0) return;

    let filtered = [...categories];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(category =>
        category.name?.toLowerCase().includes(term) ||
        category.description?.toLowerCase().includes(term) ||
        category.isActive?.toString().includes(term)
      );
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

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
          <Tab label="Categories" />
          <Tab label="Content" />
          <Tab label="Files" />
          <Tab label="Forms" />
          <Tab label="Calendar" />
          <Tab label="Webhooks" />
          <Tab label="API Docs" />
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
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Appointments
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Search Appointments"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ maxWidth: { xs: '100%', sm: 250 } }}
                />
                <TextField
                  label="From Date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ maxWidth: { xs: '100%', sm: 150 } }}
                />
                <TextField
                  label="To Date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ maxWidth: { xs: '100%', sm: 150 } }}
                />
                <TextField
                  select
                  label="Sort By"
                  value={`${sortConfig.key}-${sortConfig.direction}`}
                  onChange={(e) => {
                    const [key, direction] = e.target.value.split('-');
                    setSortConfig({ key, direction });
                  }}
                  size="small"
                  sx={{ maxWidth: { xs: '100%', sm: 150 } }}
                >
                  <MenuItem value="createdAt-desc">Newest First</MenuItem>
                  <MenuItem value="createdAt-asc">Oldest First</MenuItem>
                  <MenuItem value="date-asc">Date Ascending</MenuItem>
                  <MenuItem value="date-desc">Date Descending</MenuItem>
                  <MenuItem value="status-asc">Status A-Z</MenuItem>
                </TextField>
              </Box>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate('/appointments/new')}
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
              {filteredAppointments.map((appointment) => (
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
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Users
              </Typography>
              <TextField
                label="Search Users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
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
              {filteredUsers.map((user) => (
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
                        onClick={() => handleViewUserDetails(user)}
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
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Services
              </Typography>
              <TextField
                label="Search Services"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
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
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="services">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Grid container spacing={2}>
                      {filteredServices.map((service, index) => (
                        <Grid item xs={12} key={service.id}>
                          <Draggable draggableId={service.id.toString()} index={index}>
                            {(provided) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  display: 'flex',
                                  flexDirection: { xs: 'column', sm: 'row' },
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  gap: 2,
                                  backgroundColor: '#f9f9f9'
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
                            )}
                          </Draggable>
                        </Grid>
                      ))}
                      {provided.placeholder}
                    </Grid>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Staff
              </Typography>
              <TextField
                label="Search Staff"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
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
              {filteredStaff.map((staffMember) => (
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
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Payments
              </Typography>
              <TextField
                label="Search Payments"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
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
              {filteredPayments.map((payment) => (
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
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Promotions
              </Typography>
              <TextField
                label="Search Promotions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
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
              {filteredPromotions.map((promo) => (
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

      {activeTab === 6 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Categories
              </Typography>
              <TextField
                label="Search Categories"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => setOpenNewCategoryDialog(true)}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add New Category
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
              {filteredCategories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 120
                    }}
                  >
                    <Box>
                      <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {category.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                        {category.description || 'No description provided'}<br />
                        Status: <Chip
                          label={category.isActive ? 'Active' : 'Inactive'}
                          color={category.isActive ? 'success' : 'error'}
                          size="small"
                          sx={{ borderRadius: 2, ml: 1, mt: 0.5 }}
                        />
                      </Typography>
                    </Box>
                    <Box sx={{
                      mt: 2,
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1,
                      flexShrink: 0
                    }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setSelectedCategory(category);
                          setEditCategoryData({
                            name: category.name,
                            description: category.description || '',
                            isActive: category.isActive
                          });
                          setOpenEditCategoryDialog(true);
                        }}
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleDeleteCategory(category.id)}
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

      {activeTab === 7 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Content Management
              </Typography>
              <TextField
                label="Search Content"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/admin/content'}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Manage Content
            </Button>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Use the content management system to create and edit website content, pages, and articles.
          </Typography>
        </Paper>
      )}

      {activeTab === 8 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                File Management
              </Typography>
              <TextField
                label="Search Files"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/admin/files'}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Manage Files
            </Button>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Upload, organize, and manage media files and documents for your website.
          </Typography>
        </Paper>
      )}

      {activeTab === 9 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Form Builder
              </Typography>
              <TextField
                label="Search Forms"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/admin/forms'}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Build Forms
            </Button>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Create custom forms for collecting user data, feedback, and other information.
          </Typography>
        </Paper>
      )}

      {activeTab === 10 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Calendar Integration
              </Typography>
              <TextField
                label="Search Calendar Settings"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/admin/calendar'}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Configure Calendar
            </Button>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Connect your calendar applications to automatically sync appointments.
          </Typography>
        </Paper>
      )}

      {activeTab === 11 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                Webhook Management
              </Typography>
              <TextField
                label="Search Webhooks"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/admin/webhooks'}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Manage Webhooks
            </Button>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Configure webhooks to receive real-time notifications about system events.
          </Typography>
        </Paper>
      )}

      {activeTab === 12 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" className="fw-bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, mb: 1 }}>
                API Documentation
              </Typography>
              <TextField
                label="Search API Docs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                sx={{ maxWidth: { xs: '100%', sm: 300 } }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/api-docs'}
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              View Documentation
            </Button>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Access comprehensive API documentation with interactive testing tools.
          </Typography>
        </Paper>
      )}

      {/* Add Category Dialog */}
      <Dialog open={openNewCategoryDialog} onClose={() => setOpenNewCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={newCategoryData.name}
              onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newCategoryData.description}
              onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newCategoryData.isActive}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewCategoryDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCategory}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a4190)' }
            }}
          >
            Create Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={openEditCategoryDialog} onClose={() => setOpenEditCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={editCategoryData.name}
              onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={editCategoryData.description}
              onChange={(e) => setEditCategoryData({ ...editCategoryData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editCategoryData.isActive}
                  onChange={(e) => setEditCategoryData({ ...editCategoryData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditCategoryDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateCategory}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a4190)' }
            }}
          >
            Update Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={openUserDetails} onClose={handleCloseUserDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
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
              <TextField
                label="Phone"
                value={selectedUser.phone || ""}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev, phone: e.target.value }))
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
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedUser.isActive !== undefined ? selectedUser.isActive : true}
                    onChange={(e) =>
                      setSelectedUser((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => handleDeleteUser(selectedUser.id)}>
            Delete
          </Button>
          <Button color="primary" onClick={() => handleEditUser(selectedUser)}>
            Save Changes
          </Button>
          <Button onClick={handleCloseUserDetails}>Close</Button>
        </DialogActions>
      </Dialog>

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