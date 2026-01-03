import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, useTheme, FormControlLabel, Switch } from '@mui/material';
import { categoryAPI } from '../services/api';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const theme = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (formData.name.trim().length > 50) newErrors.name = 'Name must be less than 50 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateForm()) return;

    try {
      await categoryAPI.createCategory(formData);
      setSuccess('Category created successfully!');
      setOpenAddDialog(false);
      setFormData({ name: '', description: '', isActive: true });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm() || !selectedCategory) return;

    try {
      await categoryAPI.updateCategory(selectedCategory.id, formData);
      setSuccess('Category updated successfully!');
      setOpenEditDialog(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '', isActive: true });
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await categoryAPI.deleteCategory(id);
        setSuccess('Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', isActive: true });
    setErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setErrors({});
    setOpenEditDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '', isActive: true });
    setErrors({});
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4">Loading Categories...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            mb: 2, 
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s ease infinite',
            '@keyframes gradientShift': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            }
          }}
        >
          Category Management
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Manage your service categories and organize your gallery items
        </Typography>
      </Box>

      {(error || success) && (
        <Alert 
          severity={error ? 'error' : 'success'} 
          sx={{ mb: 3 }}
          onClose={() => { setError(''); setSuccess(''); }}
        >
          {error || success}
        </Alert>
      )}

      <Box sx={{ mb: 4, textAlign: 'right' }}>
        <Button
          variant="contained"
          onClick={handleOpenAdd}
          sx={{ 
            borderRadius: 3, 
            px: 3, 
            py: 1.5,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
            }
          }}
        >
          Add New Category
        </Button>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: category.isActive ? '1px solid #e0e0e0' : '1px solid #ff6b6b',
                backgroundColor: category.isActive ? 'white' : 'rgba(255, 107, 107, 0.05)'
              }}
            >
              <Box sx={{ p: 3, flex: 1 }}>
                <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {category.description || 'No description provided'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color={category.isActive ? 'success.main' : 'error.main'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: 1
              }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleOpenEdit(category)}
                  sx={{ 
                    flex: 1,
                    borderRadius: 2,
                    backgroundColor: '#667eea',
                    '&:hover': { backgroundColor: '#5a6fd8' }
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleDelete(category.id)}
                  sx={{ 
                    flex: 1,
                    borderRadius: 2,
                    borderColor: '#ff6b6b',
                    color: '#ff6b6b',
                    '&:hover': { 
                      backgroundColor: '#ff6b6b',
                      color: 'white'
                    }
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No categories yet. Add your first category!
          </Typography>
        </Box>
      )}

      {/* Add Category Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddSubmit} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a4190)' }
            }}
          >
            Add Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
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
    </Container>
  );
};

export default CategoryManagementPage;