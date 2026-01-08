import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    InputAdornment,
    Divider
} from '@mui/material';
import { themeAPI } from '../services/api';

const AdminThemeSettings = () => {
    const [formData, setFormData] = useState({
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        fontFamily: 'Roboto, sans-serif',
        borderRadius: 4
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const res = await themeAPI.getTheme();
                if (res.data.data) {
                    const { primaryColor, secondaryColor, fontFamily, borderRadius } = res.data.data;
                    setFormData({ primaryColor, secondaryColor, fontFamily, borderRadius });
                }
            } catch (err) {
                console.error('Error fetching theme:', err);
                setError('Failed to load current theme settings');
            } finally {
                setLoading(false);
            }
        };

        fetchTheme();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await themeAPI.updateTheme(formData);
            setSuccess('Theme updated successfully! Refresh the page to see changes.');
        } catch (err) {
            console.error('Error updating theme:', err);
            setError(err.response?.data?.error || 'Failed to update theme');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom>
                Theme Customization
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" gutterBottom>Colors</Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Primary Color"
                                name="primaryColor"
                                type="color"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                helperText="Main brand color (e.g., buttons, headers)"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">#</InputAdornment>,
                                    sx: { height: '80px' }
                                }}
                            />
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Hex: {formData.primaryColor}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Secondary Color"
                                name="secondaryColor"
                                type="color"
                                value={formData.secondaryColor}
                                onChange={handleChange}
                                helperText="Accent color (e.g., optional highlights)"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">#</InputAdornment>,
                                    sx: { height: '80px' }
                                }}
                            />
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Hex: {formData.secondaryColor}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" gutterBottom>Typography & Shape</Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="font-family-label">Font Family</InputLabel>
                                <Select
                                    labelId="font-family-label"
                                    name="fontFamily"
                                    value={formData.fontFamily}
                                    label="Font Family"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Roboto, sans-serif">Roboto (Default)</MenuItem>
                                    <MenuItem value="'Open Sans', sans-serif">Open Sans</MenuItem>
                                    <MenuItem value="'Lato', sans-serif">Lato</MenuItem>
                                    <MenuItem value="'Montserrat', sans-serif">Montserrat</MenuItem>
                                    <MenuItem value="'Poppins', sans-serif">Poppins</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Border Radius (px)"
                                name="borderRadius"
                                type="number"
                                value={formData.borderRadius}
                                onChange={handleChange}
                                inputProps={{ min: 0, max: 20 }}
                                helperText="Roundness of buttons and cards"
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Theme'}
                        </Button>
                    </Box>
                </form>
            </Paper>

            {/* Preview Section - Optional but helpful */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Live Preview Elements</Typography>
                <Paper sx={{ p: 3, borderRadius: `${formData.borderRadius}px` }}> {/* Manually applying border radius for preview */}
                    <Typography variant="h5" sx={{ color: formData.primaryColor, fontFamily: formData.fontFamily }} gutterBottom>
                        Header Text
                    </Typography>
                    <Typography paragraph sx={{ fontFamily: formData.fontFamily }}>
                        This is how your paragraph text will look like. The font family is currently set to {formData.fontFamily}.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: formData.primaryColor,
                                borderRadius: `${formData.borderRadius}px`,
                                fontFamily: formData.fontFamily,
                                '&:hover': { bgcolor: formData.primaryColor, opacity: 0.9 }
                            }}
                        >
                            Primary Button
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                color: formData.secondaryColor,
                                borderColor: formData.secondaryColor,
                                borderRadius: `${formData.borderRadius}px`,
                                fontFamily: formData.fontFamily
                            }}
                        >
                            Secondary Button
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default AdminThemeSettings;
