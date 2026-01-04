import React from 'react';
import { Container, Typography, Paper, Box, Button, Link } from '@mui/material';

const ApiDocumentationPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        API Documentation
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Interactive API Documentation
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Our API documentation is available through Swagger UI, which provides an interactive interface 
          to test and explore all available endpoints.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          href="/api-docs"
          target="_blank"
          sx={{ mb: 2 }}
        >
          View API Documentation
        </Button>
        
        <Typography variant="body2" color="text.secondary">
          The documentation includes all endpoints with detailed parameter descriptions, 
          request/response examples, and authentication requirements.
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Base URL
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: 'monospace', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          https://your-domain.com/api
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Authentication
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Most endpoints require authentication using JWT tokens. Include the token in the request header:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', p: 2, bgcolor: 'grey.100', borderRadius: 1, mb: 1 }}>
          Authorization: Bearer &lt;your-jwt-token&gt;
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You can obtain a token by logging in through the authentication endpoints.
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Endpoints
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Authentication:</strong> Register, login, logout, password reset</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Users:</strong> Get, update, and manage user accounts</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Appointments:</strong> Create, read, update, and delete appointments</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Services:</strong> Manage service offerings</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Payments:</strong> Process and manage payments</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Staff:</strong> Manage staff members and schedules</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Notifications:</strong> Send and manage notifications</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Promotions:</strong> Manage discount codes and promotions</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Gallery:</strong> Manage gallery items</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Categories:</strong> Manage service categories</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Newsletter:</strong> Manage newsletter subscriptions</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>• <strong>Calendar:</strong> Manage calendar integrations</Typography>
          <Typography variant="body1">• <strong>Webhooks:</strong> Manage webhook endpoints</Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApiDocumentationPage;