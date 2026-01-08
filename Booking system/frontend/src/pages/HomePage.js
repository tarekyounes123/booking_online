import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Stack,
  Skeleton,
  useTheme,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Event as EventIcon,
  Shield as ShieldIcon,
  NotificationsActive as NotifIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Group as GroupIcon,
  Spa as SpaIcon
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
      title: 'Real-time Booking',
      desc: 'Seamlessly schedule appointments with instant confirmation.',
      icon: <EventIcon />,
      color: '#6366f1',
      size: 'large'
    },
    {
      title: 'Secure & Private',
      desc: 'Your data is encrypted and protected with industry standards.',
      icon: <ShieldIcon />,
      color: '#10b981',
      size: 'small'
    },
    {
      title: 'Smart Alerts',
      desc: 'Never miss a slot with automated AI-driven reminders.',
      icon: <NotifIcon />,
      color: '#f59e0b',
      size: 'small'
    },
    {
      title: 'Elite Services',
      desc: 'Curated professional services tailored to your lifestyle.',
      icon: <SpaIcon />,
      color: '#d946ef',
      size: 'medium'
    }
  ];

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', pb: 10 }}>
      <Helmet>
        <title>Elite Experience - Super Modern Booking</title>
      </Helmet>

      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ mt: { xs: 4, md: 10 }, mb: 15 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} lg={7}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Chip
                label="NEW GENERATION BOOKING"
                sx={{
                  mb: 3,
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#818cf8',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em'
                }}
              />
              <Typography variant="h1" sx={{
                fontSize: { xs: '3rem', md: '5.5rem' },
                lineHeight: 1.1,
                mb: 3,
                background: 'linear-gradient(to right, #fff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'fadeInUp 0.8s ease-out'
              }}>
                Book Your <br />
                <span style={{ color: '#818cf8' }}>Future</span> Today.
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 5, maxWidth: '600px', fontWeight: 400, lineHeight: 1.8 }}>
                Experience the world's most sophisticated appointment system.
                Built for those who value time and appreciate precision.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/services')}
                  sx={{
                    px: 4, py: 2, fontSize: '1.1rem',
                  }}
                >
                  Explore Services
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 4, py: 2, fontSize: '1.1rem',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  Get Started
                </Button>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Box sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-20%',
                right: '-20%',
                width: '140%',
                height: '140%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                zIndex: -1
              }
            }}>
              <Paper sx={{
                p: 1,
                borderRadius: '32px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                transform: { lg: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)' },
                boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
              }}>
                <Box sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                    </Box>
                    <Box sx={{ height: 300, background: 'rgba(0,0,0,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingIcon sx={{ fontSize: 100, color: 'rgba(255,255,255,0.1)' }} />
                    </Box>
                    <Stack spacing={1}>
                      <Skeleton variant="text" width="60%" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    </Stack>
                  </Stack>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Bento Grid Features */}
      <Container maxWidth="xl" sx={{ mb: 20 }}>
        <Typography variant="h2" sx={{ textAlign: 'center', mb: 8, color: 'white' }}>
          Crafted for Excellence.
        </Typography>
        <Grid container spacing={3}>
          {features.map((f, idx) => (
            <Grid item xs={12} md={f.size === 'large' ? 8 : 4} key={idx}>
              <Paper sx={{
                height: '100%',
                p: 5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: f.color
                }
              }}>
                <Box>
                  <Box sx={{
                    width: 60, height: 60, borderRadius: '16px',
                    background: `${f.color}22`,
                    color: f.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 4,
                    fontSize: 30
                  }}>
                    {f.icon}
                  </Box>
                  <Typography variant="h4" sx={{ mb: 2, color: 'white', fontWeight: 800 }}>{f.title}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>{f.desc}</Typography>
                </Box>
                <IconButton sx={{ alignSelf: 'flex-end', mt: 4, color: f.color }}>
                  <ArrowIcon />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Services Preview */}
      <Box sx={{ background: 'rgba(129, 140, 248, 0.03)', py: 15, borderY: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 8 }}>
            <Box>
              <Typography variant="h2" sx={{ color: 'white', mb: 2 }}>Premium Services.</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Discover our most popular booking categories</Typography>
            </Box>
            <Button href="/services" endIcon={<ArrowIcon />} sx={{ color: '#818cf8', fontWeight: 700 }}>View All</Button>
          </Box>

          <Grid container spacing={4}>
            {loading ? Array(4).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.05)' }} />
              </Grid>
            )) : services.map((s) => (
              <Grid item xs={12} sm={6} md={3} key={s.id}>
                <Paper sx={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  p: 0,
                  transition: 'all 0.4s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}>
                  <Box sx={{ height: 200, position: 'relative' }}>
                    {s.image ? (
                      <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #312e81, #581c87)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SpaIcon sx={{ fontSize: 60, opacity: 0.2 }} />
                      </Box>
                    )}
                    <Chip
                      label={`$${s.price}`}
                      secondary
                      sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 800, backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.5)' }}
                    />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ color: 'white', mb: 1, fontWeight: 700 }}>{s.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, height: 40, overflow: 'hidden' }}>{s.description}</Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(`/appointment/new?service=${s.id}`)}
                      sx={{ borderRadius: '12px' }}
                    >
                      Book Invitation
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features & Trust */}
      <Container maxWidth="xl" sx={{ mt: 20 }}>
        <Grid container spacing={10}>
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ mb: 4, color: 'white' }}>Why the Elite choose us?</Typography>
            <Stack spacing={4}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: '#818cf822', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>Performance Optimized</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Lightning fast booking flow that respects your time.</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: '#d946ef22', color: '#d946ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GroupIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>Concierge Support</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Dedicated 24/7 support for all your scheduling needs.</Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Stack spacing={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ color: 'white' }}>Global Satisfaction</Typography>
                    <Typography variant="h4" sx={{ color: '#818cf8', fontWeight: 900 }}>99.9%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, color: '#f59e0b' }}>
                    <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                  <Typography sx={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
                    "This is exactly what the industry needed. A professional, beautiful, and efficient way to handle appointments."
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default HomePage;