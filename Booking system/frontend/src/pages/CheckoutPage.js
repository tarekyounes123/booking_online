import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { appointmentAPI, paymentAPI, promotionAPI } from '../services/api';

import { Container, Typography, Paper, Box, TextField, Button, Alert, CircularProgress } from '@mui/material';

// TODO: Fetch this key from the backend instead of hardcoding
const stripePromise = loadStripe('pk_test_51Hh25dK2Plp3b6zH3gq6n2gYJg8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8g8');

const CheckoutForm = ({ appointment, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setPaymentError(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      setPaymentError(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      setPaymentSuccess(true);
      setProcessing(false);
      // Here you might want to redirect the user or show a success message.
      // e.g., navigate('/payment-success');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6">Enter Card Details</Typography>
      <Box sx={{ my: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
        <CardElement />
      </Box>
      {paymentError && <Alert severity="error" sx={{mb: 2}}>{paymentError}</Alert>}
      {paymentSuccess && <Alert severity="success" sx={{mb: 2}}>Payment Successful!</Alert>}
      <Button type="submit" variant="contained" fullWidth disabled={!stripe || processing || paymentSuccess}>
        {processing ? <CircularProgress size={24} /> : 'Pay Now'}
      </Button>
    </form>
  );
};


const CheckoutPage = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [finalAmount, setFinalAmount] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await appointmentAPI.getAppointment(appointmentId);
        setAppointment(res.data.data);
        setFinalAmount(parseFloat(res.data.data.Service.price));
      } catch (err) {
        setError('Failed to fetch appointment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const handleApplyPromo = async () => {
    try {
        const res = await promotionAPI.validatePromotion(promoCode);
        const promotion = res.data.data;
        const originalAmount = parseFloat(appointment.Service.price);
        let discountValue = 0;
        if (promotion.discountType === 'percentage') {
            discountValue = (originalAmount * promotion.discountValue) / 100;
        } else {
            discountValue = promotion.discountValue;
        }
        setDiscount({
            code: promotion.code,
            amount: discountValue
        });
        setFinalAmount(Math.max(0, originalAmount - discountValue));
    } catch (err) {
        setError(err.response?.data?.error || 'Invalid promo code');
        setDiscount(null);
        setFinalAmount(parseFloat(appointment.Service.price));
    }
  };
  
  // This function will be called to create the payment intent
  // before rendering the Stripe form
  const createPaymentIntent = async () => {
      try {
          const res = await paymentAPI.createPaymentIntent({
              appointmentId,
              promoCode: discount ? discount.code : undefined
          });
          setClientSecret(res.data.client_secret);
      } catch (err) {
          setError(err.response?.data?.error || 'Failed to create payment intent.');
      }
  };

  if (loading) {
    return <Container sx={{textAlign: 'center', mt: 5}}><CircularProgress /></Container>;
  }

  if (error && !appointment) {
      return <Container><Alert severity="error">{error}</Alert></Container>
  }

  if (!appointment) {
    return <Container><Typography>No appointment found.</Typography></Container>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Checkout</Typography>
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6">{appointment.Service.name}</Typography>
            <Typography color="text.secondary">Date: {new Date(appointment.date).toLocaleDateString()}</Typography>
            <Typography color="text.secondary">Time: {appointment.startTime}</Typography>
            <hr/>
            <Typography variant="h6" sx={{mt: 2}}>Original Price: ${parseFloat(appointment.Service.price).toFixed(2)}</Typography>
            {discount && (
                <Typography color="green">Discount ({discount.code}): -${parseFloat(discount.amount).toFixed(2)}</Typography>
            )}
            <Typography variant="h5" sx={{mt:1}}>Total: ${finalAmount ? finalAmount.toFixed(2) : '...'}</Typography>
        </Box>

        {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
        
        {!clientSecret ? (
            <>
                <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
                    <TextField 
                        label="Promo Code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        fullWidth
                    />
                    <Button onClick={handleApplyPromo}>Apply</Button>
                </Box>
                <Button variant="contained" fullWidth onClick={createPaymentIntent}>Proceed to Payment</Button>
            </>
        ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm appointment={appointment} clientSecret={clientSecret} />
            </Elements>
        )}
      </Paper>
    </Container>
  );
};

export default CheckoutPage;
