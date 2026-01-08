import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/api';

const MyBookings = () => {
    const [value, setValue] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await appointmentAPI.getAppointments();
            setAppointments(res.data.data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load your appointments.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleRebook = (serviceId) => {
        navigate(`/appointment/new?service=${serviceId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'completed': return 'info';
            default: return 'default';
        }
    };

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const upcomingAppointments = appointments.filter(appt => {
        // appt.date is "YYYY-MM-DD"
        return ['pending', 'confirmed'].includes(appt.status) && appt.date >= todayStr;
    }).sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });

    const pastAppointments = appointments.filter(appt => {
        return ['completed', 'cancelled', 'no-show'].includes(appt.status) || appt.date < todayStr;
    }).sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.startTime.localeCompare(a.startTime);
    });

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    const AppointmentList = ({ items, showRebook }) => (
        <List>
            {items.length === 0 ? (
                <ListItem>
                    <ListItemText primary="No appointments found." />
                </ListItem>
            ) : (
                items.map((appt) => (
                    <React.Fragment key={appt.id}>
                        <ListItem
                            alignItems="flex-start"
                            secondaryAction={
                                showRebook && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleRebook(appt.Service?.id)}
                                    >
                                        Book Again
                                    </Button>
                                )
                            }
                        >
                            <ListItemText
                                primary={
                                    <Typography variant="h6">
                                        {appt.Service?.name || 'Unknown Service'}
                                    </Typography>
                                }
                                secondary={
                                    <React.Fragment>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            {new Date(appt.date).toLocaleDateString()} at {appt.startTime}
                                        </Typography>
                                        <br />
                                        <Chip
                                            label={appt.status.toUpperCase()}
                                            color={getStatusColor(appt.status)}
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                        {appt.Staff && ` with ${appt.Staff.User.firstName}`}
                                    </React.Fragment>
                                }
                            />
                        </ListItem>
                        <Divider component="li" />
                    </React.Fragment>
                ))
            )}
        </List>
    );

    return (
        <Paper sx={{ width: '100%', p: 2 }}>
            <Typography variant="h5" gutterBottom>My Bookings</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleTabChange} aria-label="booking tabs">
                    <Tab label={`Upcoming (${upcomingAppointments.length})`} />
                    <Tab label="History" />
                </Tabs>
            </Box>
            <Box sx={{ p: 2 }}>
                {value === 0 && <AppointmentList items={upcomingAppointments} showRebook={false} />}
                {value === 1 && <AppointmentList items={pastAppointments} showRebook={true} />}
            </Box>
        </Paper>
    );
};

export default MyBookings;
