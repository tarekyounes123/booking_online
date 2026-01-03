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
  Alert
} from '@mui/material';
import { appointmentAPI, serviceAPI, staffAPI } from '../services/api';

const AppointmentPage = () => {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceAPI.getServices();
        setServices(res.data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchStaffAndSlots();
    }
  }, [selectedService, selectedDate]);

  const fetchStaffAndSlots = async () => {
    try {
      // Fetch staff for the selected service
      const staffRes = await staffAPI.getStaff();
      setStaff(staffRes.data.data);

      // Fetch available time slots
      if (selectedService && selectedDate) {
        const slotsRes = await appointmentAPI.getAvailableSlots(
          selectedService,
          selectedStaff || null,
          selectedDate
        );
        setAvailableSlots(slotsRes.data.availableSlots);
      }
    } catch (error) {
      console.error('Error fetching staff or slots:', error);
    }
  };

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
    setSelectedStaff('');
    setSelectedTime('');
    setAvailableSlots([]);
  };

  const handleStaffChange = (e) => {
    setSelectedStaff(e.target.value);
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
        serviceId: selectedService,
        staffId: selectedStaff || null,
        date: selectedDate,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
        notes: notes
      };

      await appointmentAPI.createAppointment(appointmentData);
      setSuccess(true);
      
      // Reset form
      setSelectedService('');
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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Appointment booked successfully! You will receive a confirmation email.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
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
                disabled={!selectedService || !selectedDate}
              >
                <MenuItem value="">
                  <em>Any Available Staff</em>
                </MenuItem>
                {staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.id}>
                    {staffMember.User.firstName} {staffMember.User.lastName}
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
                {availableSlots.map((slot, index) => (
                  <MenuItem key={index} value={slot}>
                    {slot.startTime} - {slot.endTime}
                  </MenuItem>
                ))}
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
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              onClick={handleBookAppointment}
              disabled={loading || !selectedService || !selectedDate || !selectedTime}
              fullWidth
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AppointmentPage;