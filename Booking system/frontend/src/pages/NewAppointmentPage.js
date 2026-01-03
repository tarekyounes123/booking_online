import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { appointmentAPI, serviceAPI, staffAPI } from '../services/api';

const NewAppointmentPage = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Default to cash payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceAPI.getServices();
        setServices(res.data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError(error.response?.data?.error || 'Failed to load services');
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedTime('');
    }
  }, [selectedService, selectedDate]);

  useEffect(() => {
    if (selectedService) {
      fetchStaffForService();
    } else {
      setStaff([]);
      setSelectedStaff('');
    }
  }, [selectedService]);

  const fetchStaffForService = async () => {
    try {
      const staffRes = await staffAPI.getStaff();
      // Filter staff that can provide the selected service if needed
      setStaff(staffRes.data.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError(error.response?.data?.error || 'Failed to load staff');
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedService || !selectedDate) return;
    
    setSlotsLoading(true);
    setError('');
    
    try {
      const slotsRes = await appointmentAPI.getAvailableSlots(
        selectedService,
        selectedStaff || null,
        selectedDate
      );
      setAvailableSlots(slotsRes.data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError(error.response?.data?.error || 'Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
    setSelectedStaff('');
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
  };

  const handleStaffChange = (e) => {
    setSelectedStaff(e.target.value);
    // Refresh available slots when staff changes
    if (selectedDate) {
      fetchAvailableSlots();
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
    setAvailableSlots([]);
  };

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Please select service, date, and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const appointmentData = {
        serviceId: parseInt(selectedService),
        staffId: selectedStaff ? parseInt(selectedStaff) : null,
        date: selectedDate,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
        notes: notes,
        paymentMethod: paymentMethod // Add payment method to appointment data
      };

      await appointmentAPI.createAppointment(appointmentData);
      setSuccess(true);

      // Reset form (except service if we want to keep it)
      // setSelectedService(''); // Keep service selection
      setSelectedStaff('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      setAvailableSlots([]);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Book an Appointment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Appointment booked successfully! You will receive a confirmation email.
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="service-label">Service</InputLabel>
              <Select
                labelId="service-label"
                id="service"
                value={selectedService}
                label="Service"
                onChange={handleServiceChange}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name} - ${service.price}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
              InputProps={{ inputProps: { min: new Date().toISOString().split('T')[0] } }} // Prevent past dates
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="staff-label">Preferred Staff</InputLabel>
              <Select
                labelId="staff-label"
                id="staff"
                value={selectedStaff}
                label="Preferred Staff"
                onChange={handleStaffChange}
                disabled={!selectedService}
              >
                <MenuItem value="">
                  <em>Any Available Staff</em>
                </MenuItem>
                {staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.id}>
                    {staffMember.User?.firstName} {staffMember.User?.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" disabled={!selectedDate || availableSlots.length === 0}>
              <InputLabel id="time-slot-label">Time Slot</InputLabel>
              <Select
                labelId="time-slot-label"
                id="time-slot"
                value={selectedTime}
                label="Time Slot"
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                {slotsLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => (
                    <MenuItem key={index} value={slot}>
                      {slot.startTime} - {slot.endTime}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {selectedDate ? 'No available slots' : 'Select a date first'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              margin="normal"
              placeholder="Any special requests or information for the staff..."
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset" margin="normal">
              <Typography variant="subtitle1" gutterBottom>
                Payment Method
              </Typography>
              <RadioGroup
                row
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel value="cash" control={<Radio />} label="Pay at Service Location" />
                <FormControlLabel value="online" control={<Radio />} label="Pay Online (Coming Soon)" disabled />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              onClick={handleBookAppointment}
              disabled={loading || !selectedService || !selectedDate || !selectedTime}
              fullWidth
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Booking...
                </>
              ) : (
                'Book Appointment'
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default NewAppointmentPage;