import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, serviceAPI } from '../services/api';
import { Container, Typography, Grid, Paper, Card, CardContent, CardActions, Button, Chip, Box } from '@mui/material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsRes = await appointmentAPI.getAppointments();
        setAppointments(appointmentsRes.data.data);

        const servicesRes = await serviceAPI.getServices();
        setServices(servicesRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const upcomingAppointments = appointments.filter(
    appt => appt.date >= todayStr && !['completed', 'cancelled', 'no-show'].includes(appt.status)
  );

  const completedAppointments = appointments.filter(
    appt => appt.status === 'completed'
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom className="fw-bold">
          Welcome, {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your appointments and services
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: 'primary.light',
              color: 'primary.contrastText'
            }}
          >
            <Typography variant="h4" component="div" className="fw-bold">
              {upcomingAppointments.length}
            </Typography>
            <Typography variant="body2">Upcoming Appointments</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: 'success.light',
              color: 'success.contrastText'
            }}
          >
            <Typography variant="h4" component="div" className="fw-bold">
              {completedAppointments.length}
            </Typography>
            <Typography variant="body2">Completed Appointments</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: 'info.light',
              color: 'info.contrastText'
            }}
          >
            <Typography variant="h4" component="div" className="fw-bold">
              {services.length}
            </Typography>
            <Typography variant="body2">Available Services</Typography>
          </Paper>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom className="fw-bold">
                Upcoming Appointments
              </Typography>
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </Box>
              ) : upcomingAppointments.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {upcomingAppointments.map((appointment) => (
                    <Paper
                      key={appointment.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography variant="h6" className="fw-bold">
                          {appointment.Service?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date: {new Date(appointment.date).toLocaleDateString()}<br />
                          Time: {appointment.startTime} - {appointment.endTime}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Appointment ID: {appointment.id}
                        </Typography>
                      </Box>
                      <Box>
                        <Chip
                          label={appointment.status}
                          color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                          sx={{ borderRadius: 2, mr: 1 }}
                        />
                        {appointment.status === 'pending' && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate(`/checkout/${appointment.id}`)}
                            sx={{ borderRadius: 2 }}
                          >
                            Pay Now
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No upcoming appointments
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Popular Services */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom className="fw-bold">
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/appointment/new')}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  Book New Appointment
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/profile')}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  Update Profile
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/services')}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  Browse Services
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Popular Services */}
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom className="fw-bold">
                Popular Services
              </Typography>
              {services.slice(0, 3).map((service) => (
                <Paper
                  key={service.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="h6" className="fw-bold">
                      {service.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${service.price} • {service.duration} min
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(`/appointment/new?service=${service.id}`)}
                    sx={{ borderRadius: 2 }}
                  >
                    Book
                  </Button>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;