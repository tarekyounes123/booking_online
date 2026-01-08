import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Rating,
  CardMedia
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { serviceAPI } from '../services/api';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceAPI.getServices();
        setServices(res.data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Services - Booking System - Professional Appointment Services</title>
        <meta name="description" content="Browse our wide range of professional services. Book appointments online for all your needs with our easy-to-use system." />
        <meta name="keywords" content="services, appointment services, booking services, professional services, online booking" />
        <meta property="og:title" content="Services - Booking System - Professional Appointment Services" />
        <meta property="og:description" content="Browse our wide range of professional services. Book appointments online for all your needs with our easy-to-use system." />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:title" content="Services - Booking System - Professional Appointment Services" />
        <meta name="twitter:description" content="Browse our wide range of professional services. Book appointments online for all your needs with our easy-to-use system." />
      </Helmet>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography component="h1" variant="h3" gutterBottom className="fw-bold">
            Our Services
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Choose from our wide range of professional services tailored to meet your needs
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: 2,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{
                    height: 150,
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    fontSize: 48,
                    overflow: 'hidden'
                  }}>
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{service.name.charAt(0)}</span>
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography gutterBottom variant="h5" component="div" className="fw-bold">
                        {service.name}
                      </Typography>
                      {service.type === 'bundle' && (
                        <Chip label="BUNDLE" color="secondary" size="small" sx={{ fontWeight: 'bold' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>

                    {service.type === 'bundle' && service.includedServices && (
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight="bold">Includes:</Typography>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '0.875rem' }}>
                          {Array.isArray(service.includedServices) ?
                            service.includedServices.map((item, idx) => <li key={idx}>{item}</li>) :
                            <li>{service.includedServices}</li>
                          }
                        </ul>
                      </Box>
                    )}

                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label={`$${service.price}`}
                        color="primary"
                        variant="filled"
                        sx={{ borderRadius: 2 }}
                      />
                      <Chip
                        label={`${service.duration} min`}
                        color={service.type === 'bundle' ? 'secondary' : 'default'}
                        variant="filled"
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                    {service.category && (
                      <Chip
                        label={service.category}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: 'grey.100',
                          color: 'grey.800'
                        }}
                      />
                    )}
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <Rating value={service.averageRating} readOnly size="small" precision={0.1} />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({service.numOfReviews} reviews)
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        flex: 1,
                        mr: 1
                      }}
                      onClick={() => navigate(`/services/${service.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(`/appointment/new?service=${service.id}`)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        flex: 1,
                        ml: 1
                      }}
                    >
                      Book Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </div>
  );
};

export default ServicesPage;