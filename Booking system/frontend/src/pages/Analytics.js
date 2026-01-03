import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { appointmentAPI, userAPI, serviceAPI, staffAPI, paymentAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, usersRes, servicesRes, staffRes, paymentsRes] = await Promise.all([
          appointmentAPI.getAppointments(),
          userAPI.getUsers(),
          serviceAPI.getServices(),
          staffAPI.getStaff(),
          paymentAPI.getPayments()
        ]);

        setAppointments(appointmentsRes.data.data);
        setUsers(usersRes.data.data);
        setServices(servicesRes.data.data);
        setStaff(staffRes.data.data);
        setPayments(paymentsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate revenue from completed payments
  const completedPayments = payments.filter(payment => payment.status === 'completed');
  const paymentRevenue = completedPayments.reduce((sum, payment) => {
    // Handle different possible formats of amount (string, number, decimal)
    const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Calculate revenue from completed appointments (using service price)
  const completedAppointments = appointments.filter(app => app.status === 'completed');
  const appointmentRevenue = completedAppointments.reduce((sum, appointment) => {
    // Get the service price for this appointment
    const service = services.find(s => s.id === appointment.serviceId);
    const servicePrice = service ? parseFloat(service.price) : 0;
    return sum + (isNaN(servicePrice) ? 0 : servicePrice);
  }, 0);

  // Total revenue is the sum of both payment revenue and appointment revenue
  const revenue = paymentRevenue + appointmentRevenue;

  // Calculate analytics data
  const revenueByService = services.map(service => {
    const serviceAppointments = appointments.filter(app => app.serviceId === service.id && app.status === 'completed');
    const serviceRevenue = serviceAppointments.reduce((sum, app) => sum + parseFloat(service.price), 0);
    return {
      name: service.name,
      revenue: serviceRevenue,
      count: serviceAppointments.length
    };
  });

  const revenueByMonth = appointments
    .filter(app => app.status === 'completed')
    .reduce((acc, app) => {
      const month = new Date(app.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      const service = services.find(s => s.id === app.serviceId);
      const amount = service ? parseFloat(service.price) : 0;
      
      if (acc[month]) {
        acc[month] += amount;
      } else {
        acc[month] = amount;
      }
      return acc;
    }, {});
  
  const monthlyData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
    name: month,
    revenue: revenue
  }));
  
  const statusData = [
    { name: 'Completed', value: appointments.filter(app => app.status === 'completed').length },
    { name: 'Pending', value: appointments.filter(app => app.status === 'pending').length },
    { name: 'Cancelled', value: appointments.filter(app => app.status === 'canceled').length },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4">Loading Analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Business Analytics
      </Typography>

      {/* Revenue Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-3 text-center">
            <Typography variant="h5" className="text-primary fw-bold">
              ${revenue.toFixed(2)}
            </Typography>
            <Typography variant="body2" className="text-muted">
              Total Revenue
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-3 text-center">
            <Typography variant="h5" className="text-success fw-bold">
              ${paymentRevenue.toFixed(2)}
            </Typography>
            <Typography variant="body2" className="text-muted">
              From Payments
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-3 text-center">
            <Typography variant="h5" className="text-info fw-bold">
              ${appointmentRevenue.toFixed(2)}
            </Typography>
            <Typography variant="body2" className="text-muted">
              From Completed Appointments
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-3 text-center">
            <Typography variant="h5" className="text-warning fw-bold">
              {appointments.length}
            </Typography>
            <Typography variant="body2" className="text-muted">
              Total Appointments
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Analytics Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className="p-3">
            <Typography variant="h6" className="mb-3">
              Revenue by Service
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByService}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="p-3">
            <Typography variant="h6" className="mb-3">
              Monthly Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="p-3">
            <Typography variant="h6" className="mb-3">
              Appointment Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="p-3">
            <Typography variant="h6" className="mb-3">
              Service Popularity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByService}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Appointments" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;