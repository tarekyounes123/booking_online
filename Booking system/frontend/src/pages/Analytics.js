import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { appointmentAPI, userAPI, serviceAPI, staffAPI, paymentAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

  // Calculate revenue from completed appointments (using discounted price from appointment)
  const completedAppointments = appointments.filter(app => app.status === 'completed');
  const appointmentRevenue = completedAppointments.reduce((sum, appointment) => {
    // Use the discounted price from the appointment if available, otherwise use original service price
    const appointmentPrice = appointment.discountedPrice !== null && appointment.discountedPrice !== undefined
      ? parseFloat(appointment.discountedPrice)
      : (appointment.originalPrice !== null && appointment.originalPrice !== undefined
          ? parseFloat(appointment.originalPrice)
          : 0);
    return sum + (isNaN(appointmentPrice) ? 0 : appointmentPrice);
  }, 0);

  // Total revenue is the sum of both payment revenue and appointment revenue
  const revenue = paymentRevenue + appointmentRevenue;

  // Calculate analytics data
  const revenueByService = services.map(service => {
    const serviceAppointments = appointments.filter(app => app.serviceId === service.id && app.status === 'completed');
    const serviceRevenue = serviceAppointments.reduce((sum, app) => {
      // Use the discounted price from the appointment if available, otherwise use original service price
      const appointmentPrice = app.discountedPrice !== null && app.discountedPrice !== undefined
        ? parseFloat(app.discountedPrice)
        : (app.originalPrice !== null && app.originalPrice !== undefined
            ? parseFloat(app.originalPrice)
            : 0);
      return sum + (isNaN(appointmentPrice) ? 0 : appointmentPrice);
    }, 0);
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
      // Use the discounted price from the appointment if available, otherwise use original service price
      const amount = app.discountedPrice !== null && app.discountedPrice !== undefined
        ? parseFloat(app.discountedPrice)
        : (app.originalPrice !== null && app.originalPrice !== undefined
            ? parseFloat(app.originalPrice)
            : 0);

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
            <Bar
              data={{
                labels: revenueByService.map(item => item.name),
                datasets: [
                  {
                    label: 'Revenue',
                    data: revenueByService.map(item => item.revenue),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Revenue by Service'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="p-3">
            <Typography variant="h6" className="mb-3">
              Monthly Revenue
            </Typography>
            <Line
              data={{
                labels: monthlyData.map(item => item.name),
                datasets: [
                  {
                    label: 'Revenue',
                    data: monthlyData.map(item => item.revenue),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Monthly Revenue Trend'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="p-3">
            <Typography variant="h6" className="mb-3">
              Appointment Status
            </Typography>
            <Pie
              data={{
                labels: statusData.map(item => item.name),
                datasets: [
                  {
                    data: statusData.map(item => item.value),
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.6)',
                      'rgba(54, 162, 235, 0.6)',
                      'rgba(255, 205, 86, 0.6)'
                    ],
                    borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 205, 86, 1)'
                    ],
                    borderWidth: 1,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Appointment Status Distribution'
                  }
                }
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="p-3">
            <Typography variant="h6" className="mb-3">
              Service Popularity
            </Typography>
            <Doughnut
              data={{
                labels: revenueByService.map(item => item.name),
                datasets: [
                  {
                    label: 'Number of Appointments',
                    data: revenueByService.map(item => item.count),
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.6)',
                      'rgba(54, 162, 235, 0.6)',
                      'rgba(255, 205, 86, 0.6)',
                      'rgba(75, 192, 192, 0.6)',
                      'rgba(153, 102, 255, 0.6)',
                      'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 205, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Service Popularity'
                  }
                }
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;