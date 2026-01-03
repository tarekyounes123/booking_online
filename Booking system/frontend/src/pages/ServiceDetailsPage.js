import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Rating,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { serviceAPI } from '../services/api';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [reviewSnackbar, setReviewSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchServiceAndReviews = async () => {
      try {
        const serviceRes = await serviceAPI.getService(id);
        setService(serviceRes.data.data);

        const reviewsRes = await serviceAPI.getServiceReviews(id);
        setReviews(reviewsRes.data.data);
      } catch (err) {
        setError('Failed to fetch service details or reviews.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAndReviews();
  }, [id]);

  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (event, newValue) => {
    setNewReview({ ...newReview, rating: newValue });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewSnackbar({ open: true, message: 'You must be logged in to submit a review.', severity: 'warning' });
      return;
    }
    if (newReview.rating === 0) {
      setReviewSnackbar({ open: true, message: 'Please provide a rating.', severity: 'warning' });
      return;
    }

    try {
      await serviceAPI.addReview(id, newReview);
      setReviewSnackbar({ open: true, message: 'Review submitted successfully!', severity: 'success' });
      setNewReview({ rating: 0, comment: '' });
      // Re-fetch reviews to update the list
      const reviewsRes = await serviceAPI.getServiceReviews(id);
      setReviews(reviewsRes.data.data);
      // Also update service average rating
      const serviceRes = await serviceAPI.getService(id);
      setService(serviceRes.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit review.';
      setReviewSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error(err);
    }
  };

  const handleCloseSnackbar = () => {
    setReviewSnackbar({ ...reviewSnackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!service) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Service not found.</Alert>
      </Container>
    );
  }

  const hasReviewed = reviews.some(review => review.userId === user?.id);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            {service.image && (
              <CardMedia
                component="img"
                height="300"
                image={service.image}
                alt={service.name}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom className="fw-bold">
                {service.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {service.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={service.averageRating} readOnly precision={0.1} />
                <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                  ({service.numOfReviews} reviews)
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong className="fw-bold">Duration:</strong> {service.duration} minutes
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong className="fw-bold">Price:</strong> ${service.price}
              </Typography>
              {service.category && (
                <Typography variant="body1">
                  <strong className="fw-bold">Category:</strong> {service.category}
                </Typography>
              )}
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate(`/appointment/new?service=${service.id}`)}
                sx={{ mt: 3, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
              >
                Book This Service
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom className="fw-bold">
              Reviews
            </Typography>
            {reviews.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No reviews yet. Be the first to review!
              </Typography>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        by {review.user?.firstName || 'Anonymous'} on {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{review.comment}</Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>

          {user && !hasReviewed ? (
            <Box component="form" onSubmit={submitReview} sx={{ mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h5" component="h2" gutterBottom className="fw-bold">
                Submit Your Review
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">Your Rating</Typography>
                <Rating
                  name="rating"
                  value={newReview.rating}
                  onChange={handleRatingChange}
                  precision={1}
                  sx={{ mb: 1 }}
                />
              </Box>
              <TextField
                name="comment"
                label="Your Comment"
                multiline
                rows={4}
                fullWidth
                value={newReview.comment}
                onChange={handleReviewChange}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}>
                Submit Review
              </Button>
            </Box>
          ) : user && hasReviewed ? (
            <Box sx={{ mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h5" component="h2" gutterBottom className="fw-bold">
                You have already reviewed this service.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/my-reviews')} // Placeholder for user's reviews page
                sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
              >
                View Your Reviews
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h5" component="h2" gutterBottom className="fw-bold">
                Want to leave a review?
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Log in to share your experience with this service!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
              >
                Log In
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
      <Snackbar open={reviewSnackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={reviewSnackbar.severity} sx={{ width: '100%' }}>
          {reviewSnackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ServiceDetailsPage;