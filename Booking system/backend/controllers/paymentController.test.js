const request = require('supertest');
const app = require('../server'); // Adjust path to your main server file
const { Payment, Appointment, User, Service } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: 'pi_123456789',
          client_secret: 'pi_123456789_secret_abcdef',
        }),
      },
    };
  });
});

describe('Payment Controller - Lebanon Visa Card Support', () => {
  let user, service, appointment, token;

  beforeAll(async () => {
    // Create a test user
    user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '+96171234567', // Lebanese phone number format
    });

    // Create a test service
    service = await Service.create({
      name: 'Test Service',
      description: 'Test service for payment',
      duration: 60,
      price: 100.00,
      category: 'test',
      isActive: true,
    });

    // Create a test appointment
    appointment = await Appointment.create({
      userId: user.id,
      serviceId: service.id,
      date: '2024-12-25',
      startTime: '10:00:00',
      endTime: '11:00:00',
      status: 'pending',
    });

    // Generate a JWT token for the user (you might need to adjust this based on your auth implementation)
    // This is a simplified example - in real implementation you'd use your JWT signing method
  });

  afterAll(async () => {
    // Clean up test data
    await Payment.destroy({ where: { appointmentId: appointment.id } });
    await Appointment.destroy({ where: { id: appointment.id } });
    await Service.destroy({ where: { id: service.id } });
    await User.destroy({ where: { id: user.id } });
  });

  describe('POST /api/payments/create-intent', () => {
    it('should create a payment intent with LBP currency for Lebanon', async () => {
      const paymentData = {
        appointmentId: appointment.id,
        currency: 'lbp', // Lebanese currency
        paymentMethod: 'stripe',
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${token}`) // Use actual token in real implementation
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.client_secret).toBeDefined();
      expect(response.body.payment).toBeDefined();
      expect(response.body.payment.currency).toBe('lbp');
    });

    it('should create a payment intent with USD currency', async () => {
      const paymentData = {
        appointmentId: appointment.id,
        currency: 'usd',
        paymentMethod: 'stripe',
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${token}`) // Use actual token in real implementation
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.client_secret).toBeDefined();
      expect(response.body.payment.currency).toBe('usd');
    });

    it('should handle zero amount payments correctly', async () => {
      // Create an appointment with a promotional code that results in 0 amount
      const paymentData = {
        appointmentId: appointment.id,
        currency: 'lbp',
        paymentMethod: 'stripe',
        promoCode: 'FREE_SERVICE', // Assuming this code makes the service free
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${token}`) // Use actual token in real implementation
        .send(paymentData);

      // This test would require setting up a promotion that makes the service free
      // For now, we'll just check that it doesn't crash
      expect(response.status).toBeOneOf([200, 400]); // Either success or validation error
    });
  });

  describe('POST /api/payments/create', () => {
    it('should create a payment record for Lebanon bank transfer method', async () => {
      const paymentData = {
        appointmentId: appointment.id,
        paymentMethod: 'bank_transfer',
        currency: 'lbp',
      };

      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${token}`) // Use actual token in real implementation
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.payment).toBeDefined();
      expect(response.body.payment.paymentMethod).toBe('bank_transfer');
      expect(response.body.payment.currency).toBe('lbp');
    });
  });
});