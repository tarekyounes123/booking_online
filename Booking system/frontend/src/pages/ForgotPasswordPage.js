import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';

const ForgotPasswordPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const steps = ['Request Code', 'Verify Code', 'Reset Password'];

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await authAPI.forgotPassword(email);
            setMessage('A verification code has been sent to your email.');
            setActiveStep(1);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await authAPI.verifyResetCode({ email, code });
            setMessage('Code verified successfully. Please enter your new password.');
            setActiveStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await authAPI.resetPassword({ email, code, password });
            setMessage('Password reset successfully. You can now login with your new password.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Reset Password
                </Typography>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                {activeStep === 0 && (
                    <Box component="form" onSubmit={handleRequestCode}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? 'Sending...' : 'Send Code'}
                        </Button>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box component="form" onSubmit={handleVerifyCode}>
                        <Typography variant="body1" gutterBottom>
                            Enter the 6-digit code sent to {email}
                        </Typography>
                        <TextField
                            fullWidth
                            label="Verification Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            margin="normal"
                            inputProps={{ maxLength: 6 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => setActiveStep(0)}
                            sx={{ mt: 1 }}
                        >
                            Back
                        </Button>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box component="form" onSubmit={handleResetPassword}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </Box>
                )}

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
};

export default ForgotPasswordPage;
