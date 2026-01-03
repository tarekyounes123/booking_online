# API Documentation

## Base URL
All API endpoints are prefixed with `/api/`

## Authentication
Most endpoints require authentication using JWT tokens stored in HTTP-only cookies. The token is automatically included in requests when using the frontend application.

## Error Handling
All API responses follow this format:
```json
{
  "success": true/false,
  "data": { ... } // Present when success is true
  "error": "Error message" // Present when success is false
}
```

## Endpoints

### Authentication

#### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "firstName": "string (2-30 chars)",
  "lastName": "string (2-30 chars)",
  "email": "valid email",
  "password": "string (min 6 chars, 1 uppercase, 1 lowercase, 1 number)",
  "phone": "string (optional)",
  "role": "customer|admin (default: customer)"
}
```
- **Success Response**:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account."
}
```
- **Error Response**:
```json
{
  "success": false,
  "error": "Error message"
}
```

#### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "email": "valid email",
  "password": "string"
}
```
- **Success Response**:
```json
{
  "success": true,
  "token": "jwt token",
  "user": {
    "id": "user id",
    "firstName": "first name",
    "lastName": "last name",
    "email": "email",
    "role": "user role",
    "isVerified": "verification status",
    "avatar": "avatar url (if any)"
  }
}
```

#### Logout User
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Authentication**: Required
- **Success Response**:
```json
{
  "success": true,
  "data": {}
}
```

#### Get Current User
- **URL**: `/auth/me`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "user id",
    "firstName": "first name",
    "lastName": "last name",
    "email": "email",
    "phone": "phone (if any)",
    "address": "address (if any)",
    "role": "user role",
    "isVerified": "verification status",
    "isActive": "active status",
    "avatar": "avatar url (if any)",
    "branchId": "branch id (if any)",
    "createdAt": "creation date",
    "updatedAt": "update date"
  }
}
```

#### Update User Details
- **URL**: `/auth/updatedetails`
- **Method**: `PUT`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body** (all fields optional):
```json
{
  "firstName": "string (2-30 chars)",
  "lastName": "string (2-30 chars)",
  "email": "valid email",
  "phone": "string",
  "address": "string"
}
```

#### Update Password
- **URL**: `/auth/updatepassword`
- **Method**: `PUT`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "currentPassword": "current password",
  "newPassword": "new password (min 6 chars)"
}
```

#### Forgot Password
- **URL**: `/auth/forgotpassword`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "email": "valid email"
}
```

#### Reset Password
- **URL**: `/auth/resetpassword/:resettoken`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "password": "new password (min 6 chars)"
}
```

### Users

#### Get All Users (Admin only)
- **URL**: `/users`
- **Method**: `GET`
- **Authentication**: Required (Admin role)
- **Success Response**:
```json
{
  "success": true,
  "count": "number of users",
  "data": [
    {
      "id": "user id",
      "firstName": "first name",
      "lastName": "last name",
      "email": "email",
      "role": "user role",
      "phone": "phone (if any)",
      "isVerified": "verification status",
      "isActive": "active status",
      "createdAt": "creation date",
      "updatedAt": "update date"
    }
  ]
}
```

#### Get Single User (Admin only)
- **URL**: `/users/:id`
- **Method**: `GET`
- **Authentication**: Required (Admin role)

### Services

#### Get All Services
- **URL**: `/services`
- **Method**: `GET`
- **Success Response**:
```json
{
  "success": true,
  "count": "number of services",
  "data": [
    {
      "id": "service id",
      "name": "service name",
      "description": "service description",
      "duration": "duration in minutes",
      "price": "price",
      "category": "category",
      "isActive": "active status",
      "image": "image url (if any)",
      "branchId": "branch id (if any)",
      "createdAt": "creation date",
      "updatedAt": "update date",
      "Branch": {
        "id": "branch id",
        "name": "branch name",
        "address": "branch address",
        "city": "branch city"
      }
    }
  ]
}
```

#### Create Service (Admin only)
- **URL**: `/services`
- **Method**: `POST`
- **Authentication**: Required (Admin role)
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "name": "service name (2-100 chars)",
  "description": "service description (optional)",
  "duration": "duration in minutes (1-1440)",
  "price": "price (positive number)",
  "category": "category (optional)",
  "branchId": "branch id (optional)"
}
```

### Appointments

#### Get All Appointments
- **URL**: `/appointments`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**:
```json
{
  "success": true,
  "count": "number of appointments",
  "data": [
    {
      "id": "appointment id",
      "userId": "user id",
      "serviceId": "service id",
      "staffId": "staff id (if assigned)",
      "date": "appointment date (YYYY-MM-DD)",
      "startTime": "start time (HH:MM:SS)",
      "endTime": "end time (HH:MM:SS)",
      "status": "pending|confirmed|completed|cancelled|no-show",
      "notes": "notes (if any)",
      "location": "location (if any)",
      "meetingLink": "meeting link (if any)",
      "reminderSent": "reminder sent status",
      "branchId": "branch id (if any)",
      "createdAt": "creation date",
      "updatedAt": "update date",
      "User": {
        "id": "user id",
        "firstName": "first name",
        "lastName": "last name",
        "email": "email"
      },
      "Service": {
        "id": "service id",
        "name": "service name",
        "price": "price"
      },
      "Staff": {
        "id": "staff id",
        "specialization": "specialization",
        "User": {
          "id": "user id",
          "firstName": "first name",
          "lastName": "last name"
        }
      },
      "Payment": {
        "id": "payment id",
        "amount": "amount",
        "status": "payment status"
      }
    }
  ]
}
```

#### Create Appointment
- **URL**: `/appointments`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "serviceId": "service id",
  "staffId": "staff id (optional)",
  "date": "appointment date (YYYY-MM-DD)",
  "startTime": "start time (HH:MM:SS)",
  "endTime": "end time (HH:MM:SS)",
  "notes": "notes (optional, max 500 chars)"
}
```

#### Get Available Time Slots
- **URL**: `/appointments/available-slots?serviceId=:serviceId&staffId=:staffId&date=:date`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**:
```json
{
  "success": true,
  "date": "requested date",
  "serviceId": "service id",
  "staffId": "staff id",
  "availableSlots": [
    {
      "startTime": "HH:MM:SS",
      "endTime": "HH:MM:SS"
    }
  ]
}
```

### Payments

#### Create Payment Intent
- **URL**: `/payments/create-intent`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "appointmentId": "appointment id",
  "amount": "amount to charge",
  "currency": "currency code (default: usd)"
}
```
- **Success Response**:
```json
{
  "success": true,
  "client_secret": "stripe client secret",
  "payment": {
    "id": "payment id",
    "appointmentId": "appointment id",
    "userId": "user id",
    "amount": "amount",
    "currency": "currency",
    "paymentMethod": "payment method",
    "status": "payment status",
    "paymentIntentId": "stripe payment intent id",
    "createdAt": "creation date",
    "updatedAt": "update date"
  }
}
```

### Notifications

#### Get User Notifications
- **URL**: `/notifications`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**:
```json
{
  "success": true,
  "count": "number of notifications",
  "data": [
    {
      "id": "notification id",
      "userId": "user id",
      "title": "notification title",
      "message": "notification message",
      "type": "email|sms|push|in_app",
      "status": "pending|sent|failed",
      "sentAt": "sent date (if sent)",
      "isRead": "read status",
      "metadata": "additional data (JSON)",
      "createdAt": "creation date",
      "updatedAt": "update date"
    }
  ]
}
```

#### Mark All Notifications as Read
- **URL**: `/notifications/mark-all-read`
- **Method**: `PUT`
- **Authentication**: Required
- **Success Response**:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Get Unread Notifications Count
- **URL**: `/notifications/unread-count`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**:
```json
{
  "success": true,
  "count": "number of unread notifications"
}
```

## Rate Limiting
The API implements rate limiting:
- General requests: 100 requests per 15 minutes per IP
- Authentication requests: 20 requests per 15 minutes per IP

## Security Headers
The API includes the following security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=63072000
- Content-Security-Policy: Various directives to prevent XSS

## Error Codes
- `400`: Bad Request - Validation errors or malformed request
- `401`: Unauthorized - Invalid or missing authentication token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Requested resource does not exist
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server-side error