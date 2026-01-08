import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Divider,
  useTheme,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Collections as GalleryIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as ServiceIcon,
  Language as LanguageIcon,
  Event as EventIcon,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const navItems = [
    { label: t('home'), path: '/', icon: <HomeIcon /> },
    { label: t('services'), path: '/services', icon: <ServiceIcon /> },
    { label: t('gallery'), path: '/gallery', icon: <GalleryIcon /> },
    { label: t('dashboard'), path: '/dashboard', icon: <DashboardIcon /> },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(15, 23, 42, 0.4) !important',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none',
        top: 0,
        zIndex: 1100,
        transition: 'all 0.3s ease'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '80px !important' }}>
          {/* Logo Section */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: 1.5,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)' }
            }}
          >
            <Box sx={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)'
            }}>
              <EventIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'white',
                display: { xs: 'none', sm: 'block' },
                fontSize: '1.4rem'
              }}
            >
              Elite<span style={{ color: '#818cf8' }}>Book</span>
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, background: 'rgba(255,255,255,0.03)', p: 0.5, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  px: 2.5,
                  py: 1,
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: 600,
                  '&:hover': {
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Language Switcher */}
            <IconButton
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                '&:hover': { background: 'rgba(255,255,255,0.08)', color: 'white' }
              }}
            >
              <LanguageIcon />
            </IconButton>

            {user ? (
              <>
                <IconButton
                  onClick={handleMenu}
                  sx={{
                    p: 0.5,
                    border: '1.5px solid rgba(129, 140, 248, 0.3)',
                    borderRadius: '14px',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#818cf8', transform: 'translateY(-1px)' }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%)',
                      fontSize: '0.9rem',
                      fontWeight: 700
                    }}
                  >
                    {user.firstName?.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  disableScrollLock
                  PaperProps={{
                    sx: {
                      mt: 2,
                      minWidth: 220,
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                      borderRadius: '20px',
                      p: 1,
                      '& .MuiMenuItem-root': {
                        px: 2, py: 1.5, borderRadius: '12px', transition: 'all 0.2s', mb: 0.5,
                        '&:hover': { background: 'rgba(255, 255, 255, 0.08)' }
                      }
                    }
                  }}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                    <AccountCircle sx={{ mr: 2, opacity: 0.8, color: '#818cf8' }} /> {t('profile')}
                  </MenuItem>
                  {user.role === 'admin' && (
                    <>
                      <MenuItem onClick={() => { handleClose(); navigate('/admin'); }}>
                        <DashboardIcon sx={{ mr: 2, opacity: 0.8, color: '#818cf8' }} /> Admin Dashboard
                      </MenuItem>
                      <MenuItem onClick={() => { handleClose(); navigate('/admin?tab=gallery'); }}>
                        <GalleryIcon sx={{ mr: 2, opacity: 0.8, color: '#818cf8' }} /> Gallery Management
                      </MenuItem>
                    </>
                  )}
                  {user.role === 'staff' && (
                    <MenuItem onClick={() => { handleClose(); navigate('/staff'); }}>
                      <DashboardIcon sx={{ mr: 2, opacity: 0.8, color: '#818cf8' }} /> Staff Dashboard
                    </MenuItem>
                  )}
                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />
                  <MenuItem onClick={handleLogout} sx={{ color: '#fb7185' }}>
                    <LogoutIcon sx={{ mr: 2 }} /> {t('logout')}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: '14px',
                  fontWeight: 800,
                  px: 4,
                  py: 1.2,
                  fontSize: '0.95rem'
                }}
              >
                Get Started
              </Button>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;