# Booking System - Online Appointment Booking

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Running the Application](#running-the-application)
9. [API Documentation](#api-documentation)
10. [Frontend Structure](#frontend-structure)
11. [Security Features](#security-features)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

## Overview
The Booking System is a professional, secure, and feature-rich online appointment booking platform built with Node.js, React, and MySQL. It provides a complete solution for businesses to manage appointments, payments, and customer interactions.

## Features
- **User Authentication**: Secure signup/login with email verification and password reset
- **Role-based Access**: Customer, Admin, and Staff roles with appropriate permissions
- **Appointment Management**: Book, view, update, and cancel appointments
- **Payment Integration**: Stripe payment processing
- **Notification System**: Email notifications and in-app notifications
- **Staff Management**: Assign appointments to specific staff members
- **Google Calendar Integration**: Sync appointments with Google Calendar
- **Multi-branch Support**: Support for multiple business locations
- **Responsive UI**: Mobile-friendly interface built with React and Material-UI

## Technology Stack
### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database management system
- **Sequelize**: ORM for Node.js
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Stripe**: Payment processing
- **Nodemailer**: Email sending
- **Google APIs**: Calendar integration

### Frontend
- **React**: JavaScript library for building user interfaces
- **React Router**: Declarative routing
- **Material-UI**: React UI framework
- **Axios**: HTTP client
- **React Query**: Server state management

### Security
- **Helmet**: Security headers
- **Express Rate Limit**: Rate limiting
- **XSS Clean**: XSS protection
- **Mongo Sanitize**: NoSQL injection protection
- **HPP**: Parameter pollution protection
- **Express Validator**: Input validation

## Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MySQL** database server
- **Stripe account** (for payment processing)
- **Gmail account** (for email notifications)
- **Google account** (for calendar integration)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd booking-system
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Return to Root Directory
```bash
cd ..
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=booking_system
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@bookingsystem.com
FROM_NAME=Booking System

# Stripe
STRIPE_API_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Google Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Setting up Environment Variables

#### Database Configuration
1. Install and start MySQL server
2. Create a new database: `CREATE DATABASE booking_system;`
3. Update the database credentials in `.env`

#### Gmail SMTP Configuration
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: Google Account > Security > App passwords
3. Use the app password in `SMTP_PASSWORD`

#### Stripe Configuration
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints for payment events

#### Google Calendar Configuration
1. Create a Google Cloud project
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs

## Database Setup

### 1. Create Database Tables
The application uses Sequelize ORM which will automatically create tables based on the models. The tables include:

- `users`: Stores user information (customers, admins, staff)
- `services`: Stores available services
- `staff`: Stores staff information
- `appointments`: Stores appointment details
- `payments`: Stores payment information
- `notifications`: Stores notification records
- `branches`: Stores branch information

### 2. Seed Database with Initial Data
```bash
npm run seed
```

This will create:
- Admin user: admin@example.com (password: Admin123!)
- Staff users: staff@example.com, staff2@example.com (password: Staff123!)
- Customer users: customer1@example.com, customer2@example.com (password: Customer123!)
- Sample services
- Sample appointments
- Sample payments

## Running the Application

### Development Mode
1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```

### Production Mode
1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend server:
```bash
npm start
```

The application will be available at `http://localhost:5000` in production mode.

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password
- `GET /api/auth/me` - Get current user

### User Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user (admin only)
- `PUT /api/users/:id` - Update a user (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)

### Service Endpoints
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get a specific service
- `POST /api/services` - Create a new service (admin only)
- `PUT /api/services/:id` - Update a service (admin only)
- `DELETE /api/services/:id` - Delete a service (admin only)

### Appointment Endpoints
- `GET /api/appointments` - Get all appointments (user-specific)
- `GET /api/appointments/:id` - Get a specific appointment
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Cancel an appointment
- `PUT /api/appointments/:id/status` - Update appointment status (admin/staff only)

### Payment Endpoints
- `POST /api/payments/create-intent` - Create a payment intent
- `GET /api/payments` - Get all payments (user-specific)
- `GET /api/payments/:id` - Get a specific payment
- `PUT /api/payments/:id` - Update payment status (admin only)
- `GET /api/payments/:id/receipt` - Get payment receipt

### Staff Endpoints
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get a specific staff member
- `POST /api/staff` - Create a new staff member (admin only)
- `PUT /api/staff/:id` - Update a staff member (admin only)
- `DELETE /api/staff/:id` - Delete a staff member (admin only)
- `GET /api/staff/:id/appointments` - Get staff appointments

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/:id` - Get a specific notification
- `PUT /api/notifications/:id` - Update notification (mark as read)
- `DELETE /api/notifications/:id` - Delete a notification
- `POST /api/notifications` - Send notification (admin only)
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `GET /api/notifications/unread-count` - Get unread notifications count

## Frontend Structure

```
frontend/
├── public/                 # Static assets
│   ├── index.html          # Main HTML file
│   └── favicon.ico
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── PrivateRoute.js # Protected route component
│   │   ├── AdminRoute.js   # Admin-only route component
│   │   └── StaffRoute.js   # Staff-only route component
│   ├── pages/              # Page components
│   │   ├── HomePage.js     # Landing page
│   │   ├── LoginPage.js    # Login page
│   │   ├── RegisterPage.js # Registration page
│   │   ├── Dashboard.js    # User dashboard
│   │   ├── AdminDashboard.js # Admin dashboard
│   │   ├── StaffDashboard.js # Staff dashboard
│   │   ├── AppointmentPage.js # Appointment booking page
│   │   ├── ServicesPage.js # Services listing page
│   │   └── UserProfile.js  # User profile page
│   ├── services/           # API service functions
│   │   └── api.js          # API configuration and endpoints
│   ├── context/            # React context providers
│   │   └── AuthContext.js  # Authentication context
│   ├── utils/              # Utility functions
│   ├── assets/             # Images and other assets
│   ├── App.js              # Main application component
│   ├── App.css             # Global styles
│   └── index.js            # Entry point
├── package.json            # Frontend dependencies
└── README.md               # Frontend documentation
```

## Security Features

### Authentication Security
- JWT tokens stored in HTTP-only cookies
- Passwords hashed with bcrypt (12 rounds)
- Email verification required for account activation
- Password reset tokens with expiration

### Input Validation
- Server-side validation using express-validator
- Client-side validation for better UX
- Sanitization of user inputs

### Rate Limiting
- Protection against brute force attacks
- Limit on authentication attempts
- General API rate limiting

### Protection Against Common Attacks
- XSS protection with xss-clean
- NoSQL injection prevention with mongo-sanitize
- HTTP parameter pollution protection with hpp
- Security headers with helmet

### CORS Configuration
- Properly configured CORS for security
- Whitelisted origins in production

## Deployment

### Heroku Deployment
1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set KEY=VALUE`
5. Deploy: `git push heroku main`

### DigitalOcean Deployment
1. Create a DigitalOcean droplet
2. Install Node.js, MySQL, and other dependencies
3. Clone the repository
4. Set up environment variables
5. Run the application with PM2 for process management

### Docker Deployment (Optional)
A Dockerfile can be created for containerized deployment:

```dockerfile
FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
- Ensure MySQL server is running
- Verify database credentials in `.env`
- Check that the database name exists

#### Email Issues
- Verify SMTP settings in `.env`
- Ensure app password is correct for Gmail
- Check that the email address is verified

#### Payment Issues
- Verify Stripe API keys in `.env`
- Ensure webhook endpoints are properly configured
- Check that Stripe is in test mode during development

#### Frontend Build Issues
- Ensure all dependencies are installed
- Check for any build errors in the console
- Verify that the build folder is properly served in production

### Development Tips
- Use `npm run dev` for backend development with auto-restart
- Use `npm start` in frontend directory for development with hot reloading
- Check the browser console for frontend errors
- Check the server logs for backend errors

### Logging
The application includes logging for:
- Authentication events
- Payment processing
- Error events
- API requests (in development)

For production, consider implementing a more robust logging solution like Winston with log rotation.

## Support
For support, please create an issue in the repository or contact the development team.