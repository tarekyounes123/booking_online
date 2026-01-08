import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  useTheme,
  Alpha
} from '@mui/material';
import {
  EventAvailable as EventIcon,
  Shield as ShieldIcon,
  NotificationsActive as NotifIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { serviceAPI } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceAPI.getServices();
        // Access nested data property from API response
        if (response.data && response.data.data) {
          setServices(response.data.data.slice(0, 4));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const features = [
    {
      title: 'Easy Scheduling',
      desc: 'Book appointments at your convenience with our intuitive interface. View available slots in real-time.',
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#3f51b5'
    },
    {
      title: 'Secure Payments',
      desc: 'Pay securely online with our integrated system. Multiple payment options for your convenience.',
      icon: <ShieldIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50'
    },
    {
      title: 'Instant Alerts',
      desc: 'Receive automated email and SMS reminders. Never miss an important appointment again.',
      icon: <NotifIcon sx={{ fontSize: 40 }} />,
      color: '#00bcd4'
    }
  ];

  const stats = [
    { label: 'Appointments Booked', value: '5K+' },
    { label: 'Happy Customers', value: '1K+' },
    { label: 'Professional Services', value: '25+' },
    { label: 'Support', value: '24/7' }
  ];

  return (
    <Box sx={{ overflowX: 'hidden', backgroundColor: '#fcfcfc' }}>
      <Helmet>
        <title>Home - Premium Booking System</title>
        <meta name="description" content="Book appointments easily and efficiently with our luxury online booking platform." />
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          pt: { xs: 8, md: 0 },
          overflow: 'hidden'
        }}
      >
        {/* Abstract Background Element */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            zIndex: 0
          }}
        />

        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  animation: 'fadeInUp 0.8s ease-out',
                  '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(30px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 'bold',
                    letterSpacing: 4,
                    color: 'primary.light',
                    mb: 2,
                    display: 'block'
                  }}
                >
                  MODERN SCHEDULING
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 3,
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Elevate Your Service <br />
                  <span style={{ color: '#6366f1' }}>With Precision Booking</span>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: 'grey.400', mb: 5, fontWeight: 400, maxWidth: '600px' }}
                >
                  Streamline your appointments with our professional, automated platform designed for high-growth businesses and elite services.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/appointment/new')}
                    sx={{
                      py: 2,
                      px: 4,
                      borderRadius: '12px',
                      backgroundColor: '#6366f1',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      '&:hover': { backgroundColor: '#4f46e5' },
                      textTransform: 'none',
                      boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
                    }}
                  >
                    Get Started Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/services')}
                    sx={{
                      py: 2,
                      px: 4,
                      borderRadius: '12px',
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.2)',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.05)' },
                      textTransform: 'none'
                    }}
                  >
                    View Our Services
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '30px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                  transform: 'perspective(1000px) rotateY(-15deg) rotateX(10deg)',
                  animation: 'float 6s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'perspective(1000px) rotateY(-15deg) rotateX(10deg) translateY(0)' },
                    '50%': { transform: 'perspective(1000px) rotateY(-15deg) rotateX(10deg) translateY(-20px)' }
                  }
                }}
              >
                {/* Mockup UI Elements */}
                <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '15px', p: 2, mb: 2 }}>
                  <Box sx={{ height: '8px', width: '40%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', mb: 1 }} />
                  <Box sx={{ height: '15px', width: '80%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                </Box>
                <Grid container spacing={1}>
                  {[1, 2, 3, 4].map(i => (
                    <Grid item xs={12} key={i}>
                      <Box sx={{ p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: '40px', height: '40px', backgroundColor: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px' }} />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ height: '8px', width: '60%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '4px', mb: 0.5 }} />
                          <Box sx={{ height: '6px', width: '40%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 12 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{ fontWeight: 800, mb: 2 }}
        >
          Engineered for Excellence
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ color: 'text.secondary', mb: 8, maxWidth: '600px', mx: 'auto' }}
        >
          We build tools that empower businesses to focus on what matters most—delivering exceptional service to their clients.
        </Typography>

        <Grid container spacing={4}>
          {features.map((f, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: '24px',
                  backgroundColor: 'white',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: `${f.color}15`,
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {f.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Popular Services Section */}
      <Box sx={{ backgroundColor: '#f8fafc', py: 12 }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Explore Services
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Handpicked professional services for your convenience
              </Typography>
            </Box>
            <Button
              variant="text"
              onClick={() => navigate('/services')}
              endIcon={<ArrowForwardIcon />}
              sx={{ fontWeight: 'bold', color: '#6366f1', textTransform: 'none' }}
            >
              View All
            </Button>
          </Box>

          <Grid container spacing={4}>
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '20px', mb: 2 }} />
                  <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="40%" height={20} />
                </Grid>
              ))
            ) : services.length === 0 ? (
              <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No services available at the moment.</Typography>
              </Grid>
            ) : (
              services.map((service) => (
                <Grid item xs={12} sm={6} md={3} key={service.id}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      height: '100%',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={service.image || '/placeholder-service.jpg'}
                      alt={service.name}
                      sx={{ filter: 'brightness(0.9)' }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 'bold', mb: 1, display: 'block' }}>
                        {service.Category?.name || 'Service'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, height: '3.6em', overflow: 'hidden' }}>
                        {service.name}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: '900', color: 'text.primary' }}>
                          ${service.price}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                          {service.duration} mins
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container sx={{ py: 12 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: '40px',
            background: '#0f172a',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Grid container spacing={4}>
            {stats.map((s, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Typography variant="h2" sx={{ fontWeight: 900, color: '#6366f1', mb: 1 }}>
                  {s.value}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'grey.400', fontWeight: 'medium' }}>
                  {s.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Trust Section */}
      <Container sx={{ pb: 12 }}>
        <Box
          sx={{
            p: 4,
            borderRadius: '24px',
            border: '2px dashed #e2e8f0',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Trusted by Excellence
          </Typography>
          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            alignItems="center"
            sx={{ opacity: 0.5, filter: 'grayscale(1)' }}
          >
            {/* Simple logo placeholders */}
            <Typography variant="h6" className="fw-bold">PLATINUM</Typography>
            <Typography variant="h6" className="fw-bold">ELITE</Typography>
            <Typography variant="h6" className="fw-bold">PRIME</Typography>
            <Typography variant="h6" className="fw-bold">GLOBAL</Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;