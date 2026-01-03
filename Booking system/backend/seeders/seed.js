require('dotenv').config({ path: '../.env' });

const { User, Service, Staff, Appointment, Payment, Branch } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    // Create a default branch
    const branch = await Branch.create({
      name: 'Main Branch',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      phone: '+1-555-123-4567',
      email: 'contact@mainbranch.com',
      openingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: null, close: null } // Closed
      }
    });

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      phone: '+1-555-000-0001',
      isVerified: true,
      branchId: branch.id
    });

    // Create staff users
    const staffPassword = await bcrypt.hash('Staff123!', 12);
    const staffUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'staff@example.com',
      password: staffPassword,
      role: 'staff',
      phone: '+1-555-000-0002',
      isVerified: true,
      branchId: branch.id
    });

    const staff2Password = await bcrypt.hash('Staff123!', 12);
    const staff2User = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'staff2@example.com',
      password: staff2Password,
      role: 'staff',
      phone: '+1-555-000-0003',
      isVerified: true,
      branchId: branch.id
    });

    // Create staff records
    const staff1 = await Staff.create({
      userId: staffUser.id,
      specialization: 'Hair Stylist',
      bio: 'Experienced hair stylist with 5 years of experience',
      experience: 5,
      branchId: branch.id
    });

    const staff2 = await Staff.create({
      userId: staff2User.id,
      specialization: 'Nail Technician',
      bio: 'Professional nail technician with 3 years of experience',
      experience: 3,
      branchId: branch.id
    });

    // Create customer users
    const customerPassword = await bcrypt.hash('Customer123!', 12);
    const customer1 = await User.create({
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'customer1@example.com',
      password: customerPassword,
      role: 'customer',
      phone: '+1-555-000-0004',
      isVerified: true,
      branchId: branch.id
    });

    const customer2 = await User.create({
      firstName: 'Bob',
      lastName: 'Williams',
      email: 'customer2@example.com',
      password: customerPassword,
      role: 'customer',
      phone: '+1-555-000-0005',
      isVerified: true,
      branchId: branch.id
    });

    // Create services
    const service1 = await Service.create({
      name: 'Haircut',
      description: 'Professional haircut with styling',
      duration: 45,
      price: 45.00,
      category: 'Hair',
      branchId: branch.id
    });

    const service2 = await Service.create({
      name: 'Manicure',
      description: 'Basic manicure with polish',
      duration: 30,
      price: 25.00,
      category: 'Nails',
      branchId: branch.id
    });

    const service3 = await Service.create({
      name: 'Pedicure',
      description: 'Relaxing pedicure with massage',
      duration: 60,
      price: 40.00,
      category: 'Nails',
      branchId: branch.id
    });

    const service4 = await Service.create({
      name: 'Hair Coloring',
      description: 'Full hair coloring service',
      duration: 120,
      price: 80.00,
      category: 'Hair',
      branchId: branch.id
    });

    // Create appointments
    const appointment1 = await Appointment.create({
      userId: customer1.id,
      serviceId: service1.id,
      staffId: staff1.id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: '10:00:00',
      endTime: '10:45:00',
      status: 'confirmed',
      notes: 'Please bring reference photo',
      branchId: branch.id
    });

    const appointment2 = await Appointment.create({
      userId: customer2.id,
      serviceId: service2.id,
      staffId: staff2.id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: '11:00:00',
      endTime: '11:30:00',
      status: 'pending',
      branchId: branch.id
    });

    const appointment3 = await Appointment.create({
      userId: customer1.id,
      serviceId: service3.id,
      staffId: staff2.id,
      date: new Date(Date.now() + 48 * 60 * 60 * 1000), // In 2 days
      startTime: '14:00:00',
      endTime: '15:00:00',
      status: 'confirmed',
      branchId: branch.id
    });

    // Create payments
    await Payment.create({
      appointmentId: appointment1.id,
      userId: customer1.id,
      amount: 45.00,
      currency: 'usd',
      paymentMethod: 'stripe',
      transactionId: 'pi_1234567890',
      status: 'completed',
      paidAt: new Date()
    });

    await Payment.create({
      appointmentId: appointment2.id,
      userId: customer2.id,
      amount: 25.00,
      currency: 'usd',
      paymentMethod: 'stripe',
      transactionId: 'pi_0987654321',
      status: 'pending'
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();