import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, useTheme } from '@mui/material';
import { galleryAPI } from '../services/api';

const AdminGalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    category: 'nails'
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const theme = useTheme();

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await galleryAPI.getGalleryItems();
      setGalleryItems(response.data.data);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setMessage('Error loading gallery items');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.images.length === 0 && !selectedItem) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await galleryAPI.createGalleryItem(formData);
      if (response.data.success) {
        setMessage(`${response.data.count || 1} gallery item(s) added successfully!`);
      } else {
        setMessage('Gallery item added successfully!');
      }
      setOpenAddDialog(false);
      setFormData({ title: '', description: '', images: [], category: 'nails' });
      fetchGalleryItems();
    } catch (error) {
      console.error('Error adding gallery item:', error);
      setMessage('Error adding gallery item: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm() || !selectedItem) return;

    try {
      await galleryAPI.updateGalleryItem(selectedItem.id, formData);
      setMessage('Gallery item updated successfully!');
      setOpenEditDialog(false);
      setSelectedItem(null);
      setFormData({ title: '', description: '', images: [], category: 'nails' });
      fetchGalleryItems();
    } catch (error) {
      console.error('Error updating gallery item:', error);
      setMessage('Error updating gallery item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await galleryAPI.deleteGalleryItem(id);
        setMessage('Gallery item deleted successfully!');
        fetchGalleryItems();
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        setMessage('Error deleting gallery item');
      }
    }
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      images: [], // Don't set images for editing, user can upload new ones
      category: item.category || 'nails'
    });
    setOpenEditDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setSelectedItem(null);
    setFormData({ title: '', description: '', images: [], category: 'nails' });
    setErrors({});
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4">Loading Gallery Management...</Typography>
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
          Gallery Management
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Manage your work examples and portfolio images
        </Typography>
      </Box>

      {message && (
        <Alert 
          severity={message.includes('Error') ? 'error' : 'success'} 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Box sx={{ mb: 4, textAlign: 'right' }}>
        <Button
          variant="contained"
          onClick={() => setOpenAddDialog(true)}
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
          Add New Gallery Item
        </Button>
      </Box>

      <Grid container spacing={3}>
        {galleryItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box
                component="img"
                src={item.imageUrl}
                alt={item.title}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover'
                }}
              />
              <Box sx={{ p: 3, flex: 1 }}>
                <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {item.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Category: {item.category}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenEdit(item)}
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
                    onClick={() => handleDelete(item.id)}
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
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {galleryItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No gallery items yet. Add your first work example!
          </Typography>
        </Box>
      )}

      {/* Add Gallery Item Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Gallery Item</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
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
            <input
              accept="image/*"
              id="gallery-image-upload"
              type="file"
              style={{ display: 'none' }}
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData({ ...formData, images: [...formData.images, ...files] });
              }}
            />
            <label htmlFor="gallery-image-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderColor: errors.images ? '#f44336' : 'inherit'
                }}
              >
                Upload Gallery Images (Multiple)
              </Button>
            </label>
            {errors.images && (
              <Typography color="error" variant="caption">
                {errors.images}
              </Typography>
            )}
            {formData.images.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Selected Images ({formData.images.length}):
                </Typography>
                {formData.images.map((file, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        setFormData({ ...formData, images: newImages });
                      }}
                      sx={{ minWidth: 'auto', ml: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="nails">Nails</MenuItem>
                <MenuItem value="hair">Hair</MenuItem>
                <MenuItem value="beauty">Beauty</MenuItem>
                <MenuItem value="skincare">Skincare</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
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
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Gallery Item Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Gallery Item</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
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
            <input
              accept="image/*"
              id="gallery-image-upload"
              type="file"
              style={{ display: 'none' }}
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData({ ...formData, images: [...formData.images, ...files] });
              }}
            />
            <label htmlFor="gallery-image-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderColor: errors.images ? '#f44336' : 'inherit'
                }}
              >
                Upload Gallery Images (Multiple)
              </Button>
            </label>
            {errors.images && (
              <Typography color="error" variant="caption">
                {errors.images}
              </Typography>
            )}
            {formData.images.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Selected Images ({formData.images.length}):
                </Typography>
                {formData.images.map((file, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        setFormData({ ...formData, images: newImages });
                      }}
                      sx={{ minWidth: 'auto', ml: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="nails">Nails</MenuItem>
                <MenuItem value="hair">Hair</MenuItem>
                <MenuItem value="beauty">Beauty</MenuItem>
                <MenuItem value="skincare">Skincare</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
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
            Update Item
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminGalleryPage;