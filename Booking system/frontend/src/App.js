import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

// Components
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import StaffDashboard from './pages/StaffDashboard';
import AppointmentPage from './pages/AppointmentPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage'; // Import ServiceDetailsPage
import CheckoutPage from './pages/CheckoutPage';
import UserProfile from './pages/UserProfile';
import AppointmentDetails from './pages/AppointmentDetails';
import GalleryPage from './pages/GalleryPage';
import AdminGalleryPage from './pages/AdminGalleryPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';

// Create a client for React Query
const queryClient = new QueryClient();

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e57373',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <div className="container-fluid">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-email" element={<EmailVerificationPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/:id" element={<ServiceDetailsPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/appointment/:id"
                    element={
                      <PrivateRoute>
                        <AppointmentPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/appointment/new"
                    element={
                      <PrivateRoute>
                        <NewAppointmentPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/checkout/:appointmentId"
                    element={
                      <PrivateRoute>
                        <CheckoutPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <UserProfile />
                      </PrivateRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/appointments/:id"
                    element={
                      <AdminRoute>
                        <AppointmentDetails />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <AdminRoute>
                        <Analytics />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/gallery"
                    element={
                      <AdminRoute>
                        <AdminGalleryPage />
                      </AdminRoute>
                    }
                  />

                  {/* Staff routes */}
                  <Route
                    path="/staff"
                    element={
                      <StaffRoute>
                        <StaffDashboard />
                      </StaffRoute>
                    }
                  />
                </Routes>
              </div>
            </main>
            <footer className="footer mt-auto py-3 bg-dark text-white">
              <div className="container text-center">
                <span>&copy; {new Date().getFullYear()} Booking System. All rights reserved.</span>
              </div>
            </footer>
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;