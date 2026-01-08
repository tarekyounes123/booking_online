import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Container, Grid, Box, Typography, Paper, IconButton,
  useMediaQuery, useTheme, Chip, Fade, Zoom, Dialog,
  DialogContent, Button, Skeleton, Stack, Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  FilterList as FilterListIcon,
  Collections as CollectionsIcon
} from '@mui/icons-material';
import { galleryAPI, categoryAPI } from '../services/api';

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galleryResponse, categoryResponse] = await Promise.all([
          galleryAPI.getGalleryItems(),
          categoryAPI.getCategories()
        ]);
        setGalleryItems(galleryResponse.data.data);
        setCategories(categoryResponse.data.data);
      } catch (error) {
        console.error('Error fetching gallery data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return galleryItems;
    return galleryItems.filter(item => item.categoryId?.toString() === selectedCategory.toString());
  }, [galleryItems, selectedCategory]);

  const allCategories = useMemo(() => [
    { id: 'all', name: 'All' },
    ...categories.map(cat => ({ id: cat.id, name: cat.name }))
  ], [categories]);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const handleLightboxClose = () => {
    setLightboxOpen(false);
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(prev => (prev === 0 ? filteredItems.length - 1 : prev - 1));
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => (prev === filteredItems.length - 1 ? 0 : prev + 1));
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const activeImage = filteredItems[selectedImageIndex];

  // Bento Layout Logic (Simplified Masonry)
  const getMasonryColumns = () => {
    if (isMobile) return 1;
    if (theme.breakpoints.values.md > window.innerWidth) return 2;
    return 3;
  };

  const columns = useMemo(() => {
    const numCols = getMasonryColumns();
    const cols = Array.from({ length: numCols }, () => []);
    filteredItems.forEach((item, index) => {
      cols[index % numCols].push({ item, originalIndex: index });
    });
    return cols;
  }, [filteredItems, isMobile]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#0a0a0a', pt: 12 }}>
        <Container maxWidth="xl">
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 8, mb: 4, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <Grid container spacing={4}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)' }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#050505',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      pt: { xs: 8, md: 12 },
      pb: 8
    }}>
      {/* Mesh Gradient Background */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 40%)',
        pointerEvents: 'none'
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ mb: 10, textAlign: 'center' }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: 'primary.light',
                  letterSpacing: 6,
                  fontWeight: 700,
                  display: 'block',
                  mb: 2
                }}
              >
                THE GALLERY
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3.5rem', md: '7rem' },
                  fontWeight: 900,
                  lineHeight: 1,
                  mb: 4,
                  background: 'linear-gradient(to bottom, #ffffff 30%, rgba(255,255,255,0.5) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: -2
                }}
              >
                Capturing <br /> Excellence.
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(225, 225, 225, 0.6)',
                  maxWidth: 700,
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontWeight: 300
                }}
              >
                Explore our curated collection of premium services and artistic transformations.
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Categories Bento Bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 8,
          position: 'sticky',
          top: 100,
          zIndex: 10
        }}>
          <Paper sx={{
            p: 1,
            borderRadius: '100px',
            backgroundColor: 'rgba(15, 15, 15, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            gap: 1,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            {allCategories.map(cat => (
              <Chip
                key={cat.id}
                label={cat.name}
                onClick={() => setSelectedCategory(cat.id)}
                sx={{
                  px: 2,
                  py: 2.5,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '100px',
                  backgroundColor: selectedCategory === cat.id ? 'white' : 'transparent',
                  color: selectedCategory === cat.id ? 'black' : 'white',
                  '&:hover': {
                    backgroundColor: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.05)',
                  },
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Paper>
        </Box>

        {/* Masonry Grid */}
        {filteredItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 20 }}>
            <CollectionsIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.1)', mb: 3 }} />
            <Typography variant="h5" color="text.secondary">No items found in this category.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 4 }}>
            {columns.map((col, colIndex) => (
              <Box key={colIndex} sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {col.map(({ item, originalIndex }) => (
                  <Fade in key={item.id} timeout={500 + originalIndex * 100}>
                    <Box
                      onClick={() => handleImageClick(originalIndex)}
                      sx={{
                        position: 'relative',
                        borderRadius: 6,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#111',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                        '&:hover': {
                          transform: 'scale(1.02) translateY(-10px)',
                          borderColor: 'rgba(255,255,255,0.2)',
                          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                          '& .item-overlay': { opacity: 1 },
                          '& .item-img': { transform: 'scale(1.1)' }
                        }
                      }}
                    >
                      <Box
                        className="item-img"
                        component="img"
                        src={item.imageUrl}
                        alt={item.title}
                        sx={{
                          width: '100%',
                          display: 'block',
                          transition: 'transform 1.2s cubic-bezier(0.23, 1, 0.32, 1)'
                        }}
                      />
                      <Box
                        className="item-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          p: 4,
                          opacity: 0,
                          transition: 'opacity 0.4s ease'
                        }}
                      >
                        <Chip
                          label={item.category || 'General'}
                          size="small"
                          sx={{
                            alignSelf: 'flex-start',
                            mb: 1.5,
                            backgroundColor: 'white',
                            color: 'black',
                            fontWeight: 700,
                            fontSize: '0.65rem'
                          }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Container>

      {/* Cinematic Lightbox */}
      <Dialog
        fullScreen
        open={lightboxOpen}
        onClose={handleLightboxClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(5, 5, 5, 0.98)',
            backdropFilter: 'blur(15px)',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
      >
        {/* Lightbox Header */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          p: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 2 }}>
            BROWSE GALLERY
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Share">
              <IconButton onClick={() => { }} sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={handleLightboxClose} sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Main Content Area */}
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <IconButton
            onClick={handlePrevImage}
            sx={{
              position: 'absolute',
              left: 40,
              color: 'white',
              zIndex: 5,
              padding: 2,
              backgroundColor: 'rgba(255,255,255,0.02)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>

          <Box sx={{
            maxWidth: '85vw',
            maxHeight: '75vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}>
            <Zoom in timeout={500} key={selectedImageIndex}>
              <Box
                component="img"
                src={activeImage?.imageUrl}
                alt={activeImage?.title}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  borderRadius: 8,
                  boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.3s ease'
                }}
              />
            </Zoom>

            {/* Image Details Overlay */}
            <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{activeImage?.title}</Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>{activeImage?.description}</Typography>
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
                sx={{
                  borderRadius: '100px',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.2)',
                  px: 4,
                  py: 1.5,
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }
                }}
              >
                Download Masterpiece
              </Button>
            </Box>
          </Box>

          <IconButton
            onClick={handleNextImage}
            sx={{
              position: 'absolute',
              right: 40,
              color: 'white',
              zIndex: 5,
              padding: 2,
              backgroundColor: 'rgba(255,255,255,0.02)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        {/* Filmstrip / Progress */}
        <Box sx={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 2
        }}>
          {filteredItems.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              sx={{
                width: selectedImageIndex === idx ? 40 : 10,
                height: 10,
                borderRadius: '5px',
                backgroundColor: selectedImageIndex === idx ? 'white' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.4s ease'
              }}
            />
          ))}
        </Box>
      </Dialog>
    </Box>
  );
};

export default GalleryPage;