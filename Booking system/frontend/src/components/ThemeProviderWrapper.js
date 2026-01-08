import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { themeAPI } from '../services/api';
import { CircularProgress, Box } from '@mui/material';

const ThemeProviderWrapper = ({ children }) => {
    const [themeSettings, setThemeSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const res = await themeAPI.getTheme();
                setThemeSettings(res.data.data);
            } catch (error) {
                console.error('Error fetching theme:', error);
                // Fallback handled by initial state or default logic below
            } finally {
                setLoading(false);
            }
        };

        fetchTheme();
    }, []);

    const theme = useMemo(() => {
        const primaryMain = themeSettings?.primaryColor || '#1976d2';
        const secondaryMain = themeSettings?.secondaryColor || '#dc004e';
        const fontFamily = themeSettings?.fontFamily || 'Roboto, sans-serif';
        const borderRadius = themeSettings?.borderRadius || 4;

        return createTheme({
            palette: {
                mode: 'dark',
                primary: {
                    main: '#818cf8', // Indigo 400
                    light: '#a5b4fc',
                    dark: '#4f46e5',
                },
                secondary: {
                    main: '#d946ef', // Fuchsia 500
                },
                background: {
                    default: '#0f172a', // Slate 900
                    paper: 'rgba(30, 41, 59, 0.7)', // Slate 800 with transparency
                },
                text: {
                    primary: '#f8fafc',
                    secondary: '#94a3b8',
                },
            },
            shape: {
                borderRadius: 16,
            },
            typography: {
                fontFamily: "'Outfit', 'Inter', sans-serif",
                h1: { fontWeight: 800, letterSpacing: '-0.02em' },
                h2: { fontWeight: 700, letterSpacing: '-0.01em' },
                button: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            backgroundColor: '#0f172a',
                            backgroundImage: `url("/C:/Users/User/.gemini/antigravity/brain/c207abb6-a4de-4182-8bdd-3fa608e47991/super_modern_abstract_bg_1767877642716.png")`,
                            backgroundSize: 'cover',
                            backgroundAttachment: 'fixed',
                            backgroundPosition: 'center',
                            minHeight: '100vh',
                            '&::before': {
                                content: '""',
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)',
                                zIndex: -1,
                            }
                        },
                    },
                },
                MuiButton: {
                    styleOverrides: {
                        root: {
                            borderRadius: 12,
                            padding: '10px 24px',
                            backdropFilter: 'blur(8px)',
                        },
                        containedPrimary: {
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.23)',
                            },
                        },
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 24,
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                        },
                    },
                },
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 24,
                        },
                    },
                },
                MuiTextField: {
                    defaultProps: {
                        variant: 'outlined',
                        size: 'small',
                    },
                    styleOverrides: {
                        root: {
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                transition: 'all 0.2s',
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#818cf8',
                                    borderWidth: '1.5px',
                                },
                            },
                        },
                    },
                },
                MuiOutlinedInput: {
                    styleOverrides: {
                        root: {
                            borderRadius: 12,
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                            },
                        },
                    },
                },
                MuiSelect: {
                    styleOverrides: {
                        select: {
                            borderRadius: 12,
                        },
                    },
                },
                MuiInputLabel: {
                    styleOverrides: {
                        root: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&.Mui-focused': {
                                color: '#818cf8',
                            },
                        },
                    },
                },
            },
        });
    }, [themeSettings]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export default ThemeProviderWrapper;
