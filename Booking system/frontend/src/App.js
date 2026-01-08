import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
// import { ThemeProvider, createTheme } from '@mui/material/styles'; // Moved to ThemeProviderWrapper
// import CssBaseline from '@mui/material/CssBaseline'; // Moved to ThemeProviderWrapper
import { Helmet } from 'react-helmet';
import { generateOrganizationSchema, generateLocalBusinessSchema } from './utils/structuredData';
import { newsletterAPI } from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

// Components
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
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
import CategoryManagementPage from './pages/CategoryManagementPage';
import ContentManagementPage from './pages/ContentManagementPage';
import FileManagerPage from './pages/FileManagerPage';
import FormBuilderPage from './pages/FormBuilderPage';
import CalendarIntegrationPage from './pages/CalendarIntegrationPage';
import WebhookManagementPage from './pages/WebhookManagementPage';
import ApiDocumentationPage from './pages/ApiDocumentationPage';
import AdminThemeSettings from './pages/AdminThemeSettings';
import ThemeProviderWrapper from './components/ThemeProviderWrapper'; // Import dynamic theme wrapper
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  const handleNewsletterSubscribe = async () => {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value;

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      await newsletterAPI.subscribe(email);
      alert('Thank you for subscribing to our newsletter!');
      emailInput.value = '';
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('There was an error subscribing to our newsletter. Please try again later.');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProviderWrapper>
        <Router>
          <div className="App">
            <Helmet>
              <title>Booking System - Online Appointment Booking</title>
              <meta name="description" content="Book appointments online with our easy-to-use system. Manage your bookings, services, and staff efficiently." />
              <meta name="keywords" content="appointment booking, online booking, scheduling, appointment management, booking system" />
              <meta property="og:title" content="Booking System - Online Appointment Booking" />
              <meta property="og:description" content="Book appointments online with our easy-to-use system. Manage your bookings, services, and staff efficiently." />
              <meta property="og:type" content="website" />
              <meta property="og:url" content={window.location.href} />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="Booking System - Online Appointment Booking" />
              <meta name="twitter:description" content="Book appointments online with our easy-to-use system. Manage your bookings, services, and staff efficiently." />
              <script type="application/ld+json">
                {JSON.stringify(generateOrganizationSchema())}
              </script>
              <script type="application/ld+json">
                {JSON.stringify(generateLocalBusinessSchema())}
              </script>
            </Helmet>
            <Navbar />
            <main>
              <div className="container-fluid">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
                    path="/admin/categories"
                    element={
                      <AdminRoute>
                        <CategoryManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/content"
                    element={
                      <AdminRoute>
                        <ContentManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/files"
                    element={
                      <AdminRoute>
                        <FileManagerPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/forms"
                    element={
                      <AdminRoute>
                        <FormBuilderPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/calendar"
                    element={
                      <AdminRoute>
                        <CalendarIntegrationPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/webhooks"
                    element={
                      <AdminRoute>
                        <WebhookManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/api-docs"
                    element={
                      <AdminRoute>
                        <ApiDocumentationPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/theme"
                    element={
                      <AdminRoute>
                        <AdminThemeSettings />
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
              <div className="container">
                <div className="row">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <h5>Booking System</h5>
                    <p className="mb-0">Professional appointment booking service for all your needs.</p>
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <h5>Quick Links</h5>
                    <ul className="list-unstyled">
                      <li><a href="/" className="text-white text-decoration-none">Home</a></li>
                      <li><a href="/services" className="text-white text-decoration-none">Services</a></li>
                      <li><a href="/gallery" className="text-white text-decoration-none">Gallery</a></li>
                    </ul>
                  </div>
                  <div className="col-md-4">
                    <h5>Follow Us</h5>
                    <div className="d-flex gap-3 justify-content-md-start justify-content-center">
                      <a href="#" className="text-white text-decoration-none" aria-label="Facebook">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                      <a href="#" className="text-white text-decoration-none" aria-label="Twitter">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href="#" className="text-white text-decoration-none" aria-label="Instagram">
                        <i className="fab fa-instagram"></i>
                      </a>
                      <a href="#" className="text-white text-decoration-none" aria-label="LinkedIn">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-12">
                    <h5>Subscribe to our Newsletter</h5>
                    <p className="mb-2">Stay updated with our latest services and offers</p>
                    <div className="d-flex flex-column flex-md-row gap-2">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        id="newsletter-email"
                      />
                      <button
                        className="btn btn-primary"
                        onClick={handleNewsletterSubscribe}
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
                <hr className="my-3 bg-secondary" />
                <div className="text-center">
                  <span>&copy; {new Date().getFullYear()} Booking System. All rights reserved.</span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </ThemeProviderWrapper>
    </QueryClientProvider>
  );
}

export default App;