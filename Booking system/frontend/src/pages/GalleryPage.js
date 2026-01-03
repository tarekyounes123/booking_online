import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, Box, Typography, Paper, IconButton, useMediaQuery, useTheme, Chip, FormControl, InputLabel, Select, MenuItem, Fade, Zoom, Dialog, DialogContent, DialogActions, Button, Skeleton } from '@mui/material';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { galleryAPI } from '../services/api';

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFilmstrip, setShowFilmstrip] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const imageRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await galleryAPI.getGalleryItems();
        setGalleryItems(response.data.data);
        setFilteredItems(response.data.data);
      } catch (error) {
        console.error('Error fetching gallery items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  // Filter and sort items based on selected options
  useEffect(() => {
    let filtered = [...galleryItems];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [galleryItems, selectedCategory, sortBy]);

  const categories = ['all', 'nails', 'hair', 'beauty', 'skincare', 'other'];

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setSelectedImageIndex(index);
    setLightboxOpen(true);
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const handleLightboxClose = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const handlePrevImage = () => {
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setSelectedImage(filteredItems[prevIndex]);
      setSelectedImageIndex(prevIndex);
    } else {
      // If at the first image, go to the last one
      const lastIndex = filteredItems.length - 1;
      setSelectedImage(filteredItems[lastIndex]);
      setSelectedImageIndex(lastIndex);
    }
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const handleNextImage = () => {
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    if (currentIndex < filteredItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setSelectedImage(filteredItems[nextIndex]);
      setSelectedImageIndex(nextIndex);
    } else {
      // If at the last image, go to the first one
      setSelectedImage(filteredItems[0]);
      setSelectedImageIndex(0);
    }
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => prev + 0.2);
      setIsZoomed(true);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => Math.max(1, prev - 0.2));
      if (zoomLevel <= 1.2) {
        setIsZoomed(false);
      }
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
  };

  const handleDownload = () => {
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = selectedImage.imageUrl;
    link.download = selectedImage.title || `gallery-image-${selectedImage.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4">Loading Gallery...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
        {/* Decorative background elements */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          left: { xs: -50, md: -100 },
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          right: { xs: -50, md: -100 },
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
          zIndex: 0
        }} />

        <Typography
          variant="h1"
          component="h1"
          sx={{
            mb: 2,
            background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ff6b6b, #4ecdc4)',
            backgroundSize: '400% 400%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 8s ease infinite',
            '@keyframes gradientShift': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            },
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
            fontWeight: 700,
            textShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
            position: 'relative',
            zIndex: 1
          }}
        >
          Premium Collection
        </Typography>
        <Typography variant="h4" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4, fontWeight: 300, position: 'relative', zIndex: 1 }}>
          Exquisite craftsmanship curated for the discerning client
        </Typography>
        
        {/* Premium Filters and Sorting */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4, position: 'relative', zIndex: 1 }}>
          <FormControl sx={{
            minWidth: 180,
            maxWidth: 220,
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            borderRadius: 3,
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <InputLabel sx={{
              color: 'rgba(0,0,0,0.7)',
              fontWeight: 500
            }}>
              Category
            </InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{
                backgroundColor: 'transparent',
                borderRadius: 2,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,0,0,0.2)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,215,0,0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'gold'
                }
              }}
            >
              {categories.map(category => (
                <MenuItem
                  key={category}
                  value={category}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255,215,0,0.1)'
                    }
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{
            minWidth: 180,
            maxWidth: 220,
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            borderRadius: 3,
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <InputLabel sx={{
              color: 'rgba(0,0,0,0.7)',
              fontWeight: 500
            }}>
              Sort By
            </InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                backgroundColor: 'transparent',
                borderRadius: 2,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,0,0,0.2)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,215,0,0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'gold'
                }
              }}
            >
              <MenuItem
                value="newest"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,215,0,0.1)'
                  }
                }}
              >
                Newest First
              </MenuItem>
              <MenuItem
                value="oldest"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,215,0,0.1)'
                  }
                }}
              >
                Oldest First
              </MenuItem>
              <MenuItem
                value="title"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,215,0,0.1)'
                  }
                }}
              >
                Title A-Z
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Premium Category Chips */}
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1.5,
          mb: 3,
          position: 'relative',
          zIndex: 1
        }}>
          {categories.map(category => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                fontWeight: selectedCategory === category ? 'bold' : 'normal',
                fontSize: '0.875rem',
                height: 36,
                background: selectedCategory === category
                  ? 'linear-gradient(45deg, #ffd700, #ffed4e)'
                  : 'transparent',
                color: selectedCategory === category ? '#000' : 'rgba(0,0,0,0.7)',
                border: selectedCategory === category
                  ? '1px solid transparent'
                  : '1px solid rgba(0,0,0,0.2)',
                '&:hover': {
                  background: selectedCategory === category
                    ? 'linear-gradient(45deg, #ffed4e, #fff176)'
                    : 'rgba(255,215,0,0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(255,215,0,0.2)'
                },
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': selectedCategory === category ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 100%)',
                  zIndex: 1
                } : {}
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Premium Hero Carousel */}
      <Box sx={{
        mb: 6,
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 215, 0, 0.2)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 40%, rgba(255,215,0,0.05) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }
      }}>
        <Carousel
          showArrows={!isMobile}
          showStatus={false}
          showIndicators={true}
          showThumbs={false}
          infiniteLoop={true}
          autoPlay={true}
          interval={5000}
          transitionTime={700}
          swipeable={true}
          emulateTouch={true}
          renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
              <IconButton
                onClick={onClickHandler}
                aria-label={label}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 20,
                  transform: 'translateY(-50%)',
                  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                  color: 'rgba(0,0,0,0.8)',
                  '&:hover': {
                    background: 'linear-gradient(145deg, #ffd700, #ffed4e)',
                    color: 'black',
                    transform: 'translateY(-50%) scale(1.1)',
                    boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)'
                  },
                  zIndex: 2,
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              >
                <ArrowBackIosIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )
          }
          renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <IconButton
                onClick={onClickHandler}
                aria-label={label}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 20,
                  transform: 'translateY(-50%)',
                  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                  color: 'rgba(0,0,0,0.8)',
                  '&:hover': {
                    background: 'linear-gradient(145deg, #ffd700, #ffed4e)',
                    color: 'black',
                    transform: 'translateY(-50%) scale(1.1)',
                    boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)'
                  },
                  zIndex: 2,
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              >
                <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )
          }
        >
          {filteredItems.slice(0, 5).map((item, index) => (
            <div key={item.id}>
              <Box
                component="img"
                src={item.imageUrl}
                alt={item.title || `Gallery item ${index + 1}`}
                sx={{
                  width: '100%',
                  height: { xs: 250, sm: 350, md: 450 },
                  objectFit: 'cover',
                  transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.3)'
                  },
                  position: 'relative',
                  zIndex: 0
                }}
                loading="lazy"
                onClick={() => handleImageClick(item, index)}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)',
                  color: 'white',
                  p: 3,
                  backdropFilter: 'blur(15px)',
                  zIndex: 1
                }}
              >
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {item.title}
                </Typography>
                <Typography variant="h6" component="div" sx={{ opacity: 0.9, fontStyle: 'italic' }}>
                  {item.description}
                </Typography>
                <Chip
                  label={item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  sx={{
                    mt: 1,
                    backgroundColor: 'rgba(255, 215, 0, 0.3)',
                    color: 'gold',
                    border: '1px solid gold',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(5px)'
                  }}
                />
              </Box>

              {/* Premium corner accent */}
              <Box sx={{
                position: 'absolute',
                top: 15,
                right: 15,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,215,0,0.2) 70%)',
                zIndex: 2,
                opacity: 0.8
              }} />
            </div>
          ))}
        </Carousel>
      </Box>

      {/* Masonry Grid Gallery */}
      <Grid container spacing={3}>
        {filteredItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Paper
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  height: 300,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': {
                    transform: 'translateY(-15px) scale(1.03)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.3)',
                    '& .gallery-overlay': {
                      opacity: 1,
                      backdropFilter: 'blur(10px)'
                    },
                    '& .gallery-image': {
                      transform: 'scale(1.15)'
                    }
                  },
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 40%, rgba(255, 215, 0, 0.1) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }
                }}
                onClick={() => handleImageClick(item, index)}
              >
                <Box
                  component="img"
                  src={item.imageUrl}
                  alt={item.title}
                  className="gallery-image"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                    zIndex: 0
                  }}
                  loading="lazy"
                />
                <Box
                  className="gallery-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(0,0,0,0.9), rgba(0,0,0,0.6))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    p: 3,
                    opacity: 0,
                    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                    color: 'white',
                    zIndex: 2
                  }}
                >
                  <Typography variant="h6" component="div" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, opacity: 0.9, fontStyle: 'italic' }}>
                    {item.description}
                  </Typography>
                  <Chip
                    label={item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    sx={{
                      backgroundColor: 'rgba(255, 215, 0, 0.3)',
                      color: 'gold',
                      border: '1px solid gold',
                      fontWeight: 'bold',
                      backdropFilter: 'blur(5px)'
                    }}
                  />
                </Box>

                {/* Premium corner accent */}
                <Box sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.1) 70%)',
                  zIndex: 3,
                  opacity: 0.7
                }} />
              </Paper>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {filteredItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No gallery items available in this category. Check back soon!
          </Typography>
        </Box>
      )}

      {/* Premium Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={handleLightboxClose}
        maxWidth="lg"
        fullWidth
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            margin: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: 0,
            backdropFilter: 'blur(10px)'
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleLightboxClose();
          if (e.key === 'ArrowLeft') handlePrevImage();
          if (e.key === 'ArrowRight') handleNextImage();
          if (e.key === '+') handleZoomIn();
          if (e.key === '-') handleZoomOut();
        }}
      >
        {/* Top Action Bar */}
        <DialogActions sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 2,
          p: 1
        }}>
          <Button
            onClick={handleShare}
            sx={{
              color: 'white',
              minWidth: 36,
              width: 36,
              height: 36,
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <ShareIcon fontSize="small" />
          </Button>
          <Button
            onClick={handleDownload}
            sx={{
              color: 'white',
              minWidth: 36,
              width: 36,
              height: 36,
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <DownloadIcon fontSize="small" />
          </Button>
          <Button
            onClick={handleResetZoom}
            sx={{
              color: 'white',
              minWidth: 36,
              width: 36,
              height: 36,
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <ZoomInIcon fontSize="small" />
          </Button>
          <Button
            onClick={handleLightboxClose}
            sx={{
              color: 'white',
              minWidth: 36,
              width: 36,
              height: 36,
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </DialogActions>

        {/* Zoom Controls */}
        <DialogActions sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 2,
          p: 1
        }}>
          <Button
            onClick={handleZoomOut}
            sx={{
              color: 'white',
              minWidth: 36,
              width: 36,
              height: 36,
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <ZoomOutIcon fontSize="small" />
          </Button>
          <Typography variant="body2" color="white" sx={{ mx: 1 }}>
            {Math.round(zoomLevel * 100)}%
          </Typography>
          <Button
            onClick={handleZoomIn}
            sx={{
              color: 'white',
              minWidth: 36,
              width: 36,
              height: 36,
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <ZoomInIcon fontSize="small" />
          </Button>
        </DialogActions>

        <DialogContent sx={{ p: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {selectedImage && (
            <Box sx={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box
                ref={imageRef}
                component="img"
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                sx={{
                  maxHeight: '80vh',
                  maxWidth: '90vw',
                  objectFit: 'contain',
                  margin: '0 auto',
                  borderRadius: 2,
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.3s ease',
                  transformOrigin: 'center center'
                }}
                loading="lazy"
                onClick={() => {
                  if (isZoomed) {
                    handleResetZoom();
                  } else {
                    handleZoomIn();
                  }
                }}
              />
              <Box sx={{ mt: 2, color: 'white', px: 2 }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {selectedImage.title}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, opacity: 0.8, fontStyle: 'italic' }}>
                  {selectedImage.description}
                </Typography>
                <Chip
                  label={selectedImage.category.charAt(0).toUpperCase() + selectedImage.category.slice(1)}
                  sx={{
                    mt: 2,
                    backgroundColor: 'rgba(255, 215, 0, 0.2)',
                    color: 'gold',
                    border: '1px solid gold',
                    fontWeight: 'bold'
                  }}
                />
              </Box>

              {/* Navigation buttons */}
              <Box sx={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', zIndex: 1000 }}>
                <Button
                  onClick={handlePrevImage}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: 50,
                    width: 50,
                    height: 50,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.8)',
                      transform: 'scale(1.1)',
                    },
                    boxShadow: 3
                  }}
                >
                  <ArrowBackIosIcon fontSize="medium" />
                </Button>
              </Box>
              <Box sx={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', zIndex: 1000 }}>
                <Button
                  onClick={handleNextImage}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: 50,
                    width: 50,
                    height: 50,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.8)',
                      transform: 'scale(1.1)',
                    },
                    boxShadow: 3
                  }}
                >
                  <ArrowForwardIosIcon fontSize="medium" />
                </Button>
              </Box>

              {/* Filmstrip Preview */}
              {showFilmstrip && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 2,
                  zIndex: 1000
                }}>
                  {filteredItems.slice(Math.max(0, selectedImageIndex - 2), selectedImageIndex + 3).map((item, idx) => (
                    <Box
                      key={item.id}
                      component="img"
                      src={item.imageUrl}
                      alt={item.title}
                      onClick={() => {
                        setSelectedImage(item);
                        setSelectedImageIndex(filteredItems.findIndex(i => i.id === item.id));
                        setZoomLevel(1);
                        setIsZoomed(false);
                      }}
                      sx={{
                        width: selectedImage.id === item.id ? 60 : 40,
                        height: selectedImage.id === item.id ? 40 : 30,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: selectedImage.id === item.id ? '2px solid gold' : '1px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.3s ease',
                        opacity: selectedImage.id === item.id ? 1 : 0.6,
                        '&:hover': {
                          opacity: 1,
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default GalleryPage;