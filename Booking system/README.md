# Booking System - Online Appointment Booking

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
- **Security**: JWT authentication, bcrypt password hashing, rate limiting, XSS protection

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

## Project Structure
```
booking-system/
├── backend/
│   ├── controllers/     # Request handling logic
│   ├── models/          # Database models
│   ├── routes/          # API route definitions
│   ├── middleware/      # Authentication and validation middleware
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   └── seeders/         # Database seed files
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── services/    # API service functions
│       ├── context/     # React context providers
│       ├── utils/       # Utility functions
│       └── assets/      # Images and other assets
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── README.md            # Project documentation
├── DOCS.md              # Comprehensive documentation
├── API_DOCS.md          # API documentation
└── package.json         # Project dependencies
```

## Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MySQL** database server
- **Stripe account** (for payment processing)
- **Gmail account** (for email notifications)
- **Google account** (for calendar integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd booking-system
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Return to root directory:
```bash
cd ..
```

5. Set up environment variables:
```bash
# Create .env file in root directory
touch .env
```

6. Add the following to your `.env` file:
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

7. Set up the database:
- Install and start MySQL server
- Create a new database: `CREATE DATABASE booking_system;`

8. Seed the database with initial data:
```bash
npm run seed
```

9. Start the development servers:
- Backend: `npm run dev`
- Frontend: `cd frontend && npm start`

## Environment Variables Setup

### Database Configuration
1. Install and start MySQL server
2. Create a new database: `CREATE DATABASE booking_system;`
3. Update the database credentials in `.env`

### Gmail SMTP Configuration
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: Google Account > Security > App passwords
3. Use the app password in `SMTP_PASSWORD`

### Stripe Configuration
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints for payment events

### Google Calendar Configuration
1. Create a Google Cloud project
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs

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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user (admin only)
- `PUT /api/users/:id` - Update a user (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get a specific service
- `POST /api/services` - Create a new service (admin only)
- `PUT /api/services/:id` - Update a service (admin only)
- `DELETE /api/services/:id` - Delete a service (admin only)
- `GET /api/services/branch/:branchId` - Get services by branch

### Appointments
- `GET /api/appointments` - Get all appointments for current user
- `GET /api/appointments/:id` - Get a specific appointment
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment
- `PUT /api/appointments/:id/status` - Update appointment status (admin/staff only)
- `DELETE /api/appointments/:id` - Cancel an appointment
- `GET /api/appointments/available-slots` - Get available time slots

### Payments
- `POST /api/payments/create-intent` - Create a payment intent
- `POST /api/payments/webhook` - Handle payment webhook
- `GET /api/payments` - Get all payments (user-specific)
- `GET /api/payments/:id` - Get a specific payment
- `PUT /api/payments/:id` - Update payment status (admin only)
- `GET /api/payments/:id/receipt` - Get payment receipt

### Staff
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get a specific staff member
- `POST /api/staff` - Create a new staff member (admin only)
- `PUT /api/staff/:id` - Update a staff member (admin only)
- `DELETE /api/staff/:id` - Delete a staff member (admin only)
- `GET /api/staff/:id/appointments` - Get staff appointments
- `GET /api/staff/branch/:branchId` - Get staff by branch

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/:id` - Get a specific notification
- `PUT /api/notifications/:id` - Update notification (mark as read)
- `DELETE /api/notifications/:id` - Delete a notification
- `POST /api/notifications` - Send notification (admin only)
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `GET /api/notifications/unread-count` - Get unread notifications count
- `POST /api/notifications/appointment-reminder` - Send appointment reminder (admin only)

## Database Schema

The application uses the following database tables:

- `users`: Stores user information (customers, admins, staff)
- `services`: Stores available services
- `staff`: Stores staff information
- `appointments`: Stores appointment details
- `payments`: Stores payment information
- `notifications`: Stores notification records
- `branches`: Stores branch information

## Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization using express-validator
- Rate limiting for authentication endpoints
- Protection against SQL injection, XSS, and parameter pollution
- CORS configured for security
- Helmet security headers
- Email verification for account activation

## Default Credentials

After seeding the database, the following default accounts are created:

- **Admin**: admin@example.com (password: Admin123!)
- **Staff**: staff@example.com (password: Staff123!)
- **Staff 2**: staff2@example.com (password: Staff123!)
- **Customer 1**: customer1@example.com (password: Customer123!)
- **Customer 2**: customer2@example.com (password: Customer123!)

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

## Support
For support, please create an issue in the repository or contact the development team.

## License
This project is licensed under the MIT License.