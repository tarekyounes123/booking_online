import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { appointmentAPI, paymentAPI, promotionAPI, settingsAPI } from '../services/api';

import { Container, Typography, Paper, Box, TextField, Button, Alert, CircularProgress, MenuItem } from '@mui/material';

const CheckoutPage = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [finalAmount, setFinalAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('usd'); // Default currency
  const [promotionApplied, setPromotionApplied] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, loyaltyRes] = await Promise.all([
          appointmentAPI.getAppointment(appointmentId),
          settingsAPI.getSetting('loyaltyPointsEnabled').catch(() => ({ data: { data: { value: 'true' } } }))
        ]);

        setAppointment(appRes.data.data);
        setLoyaltyEnabled(loyaltyRes.data.data.value === 'true');

        // Use the stored discounted price if available, otherwise use service price
        const price = appRes.data.data.discountedPrice || appRes.data.data.Service.price;
        setFinalAmount(parseFloat(price));
      } catch (err) {
        setError('Failed to fetch checkout details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appointmentId]);

  const handleApplyPromo = async () => {
    try {
      // First validate the promotion code
      const validateRes = await promotionAPI.validatePromotion(promoCode);
      const promotion = validateRes.data.data;

      // Then apply the promotion to the appointment
      const res = await paymentAPI.applyPromotion({
        appointmentId,
        promoCode: promoCode
      });

      setDiscount({
        code: promoCode,
        amount: res.data.discountAmount
      });
      setFinalAmount(res.data.finalAmount);
      setPromotionApplied(true);
      setSuccessMessage(`Promotion code "${promoCode}" applied successfully! Discount: ${currency.toUpperCase()} ${res.data.discountAmount.toFixed(2)}`);

      // Refresh appointment data to show updated prices
      const updatedRes = await appointmentAPI.getAppointment(appointmentId);
      setAppointment(updatedRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid promo code');
      setDiscount(null);
      setFinalAmount(parseFloat(appointment.Service.price));
      setPromotionApplied(false);
      setSuccessMessage('');
    }
  };

  if (loading) {
    return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container>;
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
        <Typography variant="h4" gutterBottom>Promotion Code Application</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">{appointment.Service.name}</Typography>
          <Typography color="text.secondary">Date: {new Date(appointment.date).toLocaleDateString()}</Typography>
          <Typography color="text.secondary">Time: {appointment.startTime}</Typography>
          <hr />
          <Typography variant="h6" sx={{ mt: 2 }}>Original Price: {currency.toUpperCase()} {appointment.originalPrice ? parseFloat(appointment.originalPrice).toFixed(2) : parseFloat(appointment.Service.price).toFixed(2)}</Typography>
          {appointment.discountAmount > 0 && (
            <Typography color="green">Discount ({appointment.Promotion?.code || discount?.code}): -{currency.toUpperCase()} {parseFloat(appointment.discountAmount || discount?.amount || 0).toFixed(2)}</Typography>
          )}
          <Typography variant="h5" sx={{ mt: 1 }}>Final Price: {currency.toUpperCase()} {appointment.discountedPrice ? parseFloat(appointment.discountedPrice).toFixed(2) : finalAmount ? finalAmount.toFixed(2) : '...'}</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        {!promotionApplied && !appointment.discountAmount ? (
          <>
            <Box sx={{ display: 'flex', gap: 1, my: 2, alignItems: 'center' }}>
              <TextField
                label="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                fullWidth
              />
              <Button onClick={handleApplyPromo}>Apply</Button>
            </Box>

            {loyaltyEnabled && !promotionApplied && (
              <Box sx={{ mt: 3, p: 2, border: '1px dashed grey', borderRadius: 2 }}>
                <Typography variant="h6">Redeem Loyalty Points</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Available Points: {appointment.User?.loyaltyPoints || 0} (10 pts = $1)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    type="number"
                    label="Points to Redeem"
                    size="small"
                    inputProps={{ min: 0 }}
                    id="points-input"
                  />
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      const points = document.getElementById('points-input').value;
                      if (!points) return;
                      try {
                        const res = await paymentAPI.redeemPoints({
                          appointmentId,
                          pointsToRedeem: parseInt(points)
                        });
                        setDiscount({ code: 'LOYALTY', amount: res.data.discountAmount });
                        setFinalAmount(res.data.finalAmount);
                        setPromotionApplied(true);
                        setSuccessMessage(`Redeemed ${points} points for $${res.data.discountAmount} discount!`);

                        // Refresh appointment
                        const updatedRes = await appointmentAPI.getAppointment(appointmentId);
                        setAppointment(updatedRes.data.data);
                      } catch (err) {
                        setError(err.response?.data?.error || 'Redemption failed');
                      }
                    }}
                  >
                    Redeem
                  </Button>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
              <TextField
                select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                fullWidth
              >
                <MenuItem value="usd">USD ($)</MenuItem>
                <MenuItem value="lbp">LBP (ل.ل.)</MenuItem>
              </TextField>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" color="primary">Promotion applied successfully!</Typography>
            <Typography>Customer needs to pay: {currency.toUpperCase()} {appointment.discountedPrice ? parseFloat(appointment.discountedPrice).toFixed(2) : '...'}</Typography>
            <Typography>Proceed with your appointment as scheduled.</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CheckoutPage;