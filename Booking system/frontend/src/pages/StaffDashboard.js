import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab
} from '@mui/material';
import { appointmentAPI, staffAPI } from '../services/api';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Get staff ID for the current user (this would come from auth context in a real app)
        // For now, we'll use a placeholder ID
        const res = await staffAPI.getStaffAppointments(1); // Placeholder staff ID
        setAppointments(res.data.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const upcomingAppointments = appointments.filter(appt => 
    new Date(appt.date) >= new Date() && appt.status !== 'completed'
  );
  
  const completedAppointments = appointments.filter(appt => 
    appt.status === 'completed'
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Staff Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{upcomingAppointments.length}</Typography>
            <Typography>Upcoming Appointments</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{completedAppointments.length}</Typography>
            <Typography>Completed Today</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{appointments.filter(appt => appt.status === 'pending').length}</Typography>
            <Typography>Pending</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{appointments.length}</Typography>
            <Typography>Total</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Today's Appointments" />
          <Tab label="All Appointments" />
          <Tab label="Schedule" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Today's Appointments
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Grid container spacing={2}>
              {appointments
                .filter(appt => 
                  new Date(appt.date).toDateString() === new Date().toDateString()
                )
                .map((appointment) => (
                  <Grid item xs={12} key={appointment.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          {appointment.Service?.name}
                        </Typography>
                        <Typography color="textSecondary">
                          Customer: {appointment.User?.firstName} {appointment.User?.lastName}<br />
                          Date: {new Date(appointment.date).toLocaleDateString()}<br />
                          Time: {appointment.startTime} - {appointment.endTime}<br />
                          Status: {appointment.status}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">View Details</Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => alert(`Update status for appointment ${appointment.id}`)}
                        >
                          Update Status
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            All Appointments
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Grid container spacing={2}>
              {appointments.map((appointment) => (
                <Grid item xs={12} key={appointment.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        {appointment.Service?.name}
                      </Typography>
                      <Typography color="textSecondary">
                        Customer: {appointment.User?.firstName} {appointment.User?.lastName}<br />
                        Date: {new Date(appointment.date).toLocaleDateString()}<br />
                        Time: {appointment.startTime} - {appointment.endTime}<br />
                        Status: {appointment.status}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">View Details</Button>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => alert(`Update status for appointment ${appointment.id}`)}
                      >
                        Update Status
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Schedule
          </Typography>
          <Typography>
            Schedule management would go here. This would include setting availability, 
            time off requests, and viewing the calendar.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => alert('Calendar integration would go here')}
          >
            View Calendar
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default StaffDashboard;