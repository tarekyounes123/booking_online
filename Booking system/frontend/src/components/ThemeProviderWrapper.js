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
                primary: {
                    main: primaryMain,
                },
                secondary: {
                    main: secondaryMain,
                },
                background: {
                    default: '#f5f5f5',
                },
            },
            shape: {
                borderRadius: borderRadius,
            },
            typography: {
                fontFamily: fontFamily,
                button: {
                    textTransform: 'none', // Optional: simpler buttons often look better
                },
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            borderRadius: borderRadius,
                        },
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            borderRadius: borderRadius,
                        },
                    },
                },
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            borderRadius: borderRadius,
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
