import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../services/api';
import { Alert, Button, TextField } from '@mui/material';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyUser({ userId, code: data.verificationCode });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    try {
      const email = searchParams.get('email');
      await authAPI.resendVerification({ email });
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification code.');
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card mt-5">
              <div className="card-body text-center">
                <h2 className="card-title">Verification Successful!</h2>
                <p>Your account has been verified successfully.</p>
                <p>Redirecting to login...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Email Verification</h2>
              
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {resendSuccess && <Alert severity="success" sx={{ mb: 2 }}>Verification code resent successfully!</Alert>}
              
              <p className="text-center mb-4">Please enter the 6-digit verification code sent to your email.</p>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <TextField
                    fullWidth
                    label="Verification Code"
                    variant="outlined"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    {...register('verificationCode', {
                      required: 'Verification code is required',
                      minLength: { value: 6, message: 'Code must be 6 digits' },
                      maxLength: { value: 6, message: 'Code must be 6 digits' },
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Code must be 6 digits'
                      }
                    })}
                  />
                  {errors.verificationCode && (
                    <div className="text-danger mt-1">{errors.verificationCode.message}</div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  disabled={loading}
                  sx={{ mt: 2, mb: 2 }}
                >
                  {loading ? 'Verifying...' : 'Verify Account'}
                </Button>
              </form>
              
              <div className="text-center">
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Resend Code
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;