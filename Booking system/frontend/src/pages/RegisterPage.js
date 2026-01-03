import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../services/api';
import { Alert } from '@mui/material';

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    try {
      const response = await authAPI.register(data);
      if (response.data.userId) {
        // Redirect to email verification page with userId
        navigate(`/verify-email?userId=${response.data.userId}&email=${data.email}`);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Sign Up</h2>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error.includes('Email could not be sent')
                    ? 'Registration failed: Email verification could not be sent. Please contact support or try again later.'
                    : error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Registration successful! Please check your email to verify your account.
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      id="firstName"
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'First name must be at least 2 characters' },
                        maxLength: { value: 30, message: 'First name cannot exceed 30 characters' },
                        pattern: { value: /^[a-zA-Z\s]+$/, message: 'First name can only contain letters and spaces' }
                      })}
                    />
                    {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      id="lastName"
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                        maxLength: { value: 30, message: 'Last name cannot exceed 30 characters' },
                        pattern: { value: /^[a-zA-Z\s]+$/, message: 'Last name can only contain letters and spaces' }
                      })}
                    />
                    {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                      }
                    })}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    id="phone"
                    {...register('phone', {
                      pattern: { value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im, message: 'Invalid phone number' }
                    })}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    className="form-select"
                    id="role"
                    defaultValue="customer"
                    {...register('role')}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Sign Up
                </button>
                <div className="text-center mt-3">
                  <p>
                    Already have an account? <Link to="/login">Sign In</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;