import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Tooltip,
  Stack,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  CalendarMonth as CalendarIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Collections as GalleryIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  MiscellaneousServices as ServicesIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: t('welcome'), path: '/', icon: <CalendarIcon /> },
    { label: t('services'), path: '/services', icon: <ServicesIcon /> },
    { label: t('gallery'), path: '/gallery', icon: <GalleryIcon /> },
  ];

  if (user) navLinks.push({ label: t('dashboard'), path: '/dashboard', icon: <DashboardIcon /> });

  const adminLinks = [
    { label: 'Admin', path: '/admin', icon: <AdminIcon /> },
    { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
    { label: 'Gallery', path: '/admin/gallery', icon: <GalleryIcon /> },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 800, color: 'primary.main' }}>
        BOOKING
      </Typography>
      <Divider />
      <List>
        {navLinks.map((item) => (
          <ListItem key={item.path} button onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {user?.role === 'admin' && adminLinks.map((item) => (
          <ListItem key={item.path} button onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
          color: 'text.primary'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 4,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 900,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CalendarIcon sx={{ color: 'primary.main' }} />
              BOOKING
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
                fontWeight: 900,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              BOOKING
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{
                    my: 2,
                    color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                    display: 'block',
                    fontWeight: location.pathname === link.path ? 'bold' : 'medium',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': { color: 'primary.main', backgroundColor: 'transparent' }
                  }}
                >
                  {link.label}
                </Button>
              ))}
              {user?.role === 'admin' && adminLinks.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{
                    my: 2,
                    color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                    display: 'block',
                    fontWeight: location.pathname === link.path ? 'bold' : 'medium',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': { color: 'primary.main', backgroundColor: 'transparent' }
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <LanguageSwitcher />

              {user ? (
                <Box>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5, border: '2px solid', borderColor: 'primary.light' }}>
                      <Avatar
                        alt={`${user.firstName} ${user.lastName}`}
                        sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem' }}
                      >
                        {user.firstName[0]}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                    PaperProps={{
                      elevation: 4,
                      sx: { borderRadius: '12px', minWidth: '180px', mt: 1 }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.role}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                      <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary={t('profile')} />
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                      <ListItemText primary={t('logout')} sx={{ color: 'error.main' }} />
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'bold',
                      color: 'text.primary'
                    }}
                  >
                    {t('login')}
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: '10px',
                      boxShadow: 'none'
                    }}
                  >
                    {t('register')}
                  </Button>
                </Stack>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;