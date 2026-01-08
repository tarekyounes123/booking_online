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

  // Handle URL hash to open specific image in lightbox
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove '#' from hash
      if (hash && galleryItems.length > 0) {
        const imageId = parseInt(hash);
        const imageIndex = galleryItems.findIndex(item => item.id === imageId);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
          setLightboxOpen(true);
        }
      }
    };

    // Check hash on initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [galleryItems]);

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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.03em'
                }}
              >
                Our Gallery
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Discover our collection of premium services and artistic transformations
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Categories Filter */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 6,
          flexWrap: 'wrap',
          gap: 1
        }}>
          {allCategories.map(cat => (
            <Chip
              key={cat.id}
              label={cat.name}
              onClick={() => setSelectedCategory(cat.id)}
              sx={{
                px: 3,
                py: 1.5,
                fontSize: '0.9rem',
                fontWeight: 500,
                borderRadius: '50px',
                backgroundColor: selectedCategory === cat.id
                  ? 'primary.main'
                  : 'rgba(255,255,255,0.08)',
                color: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.8)',
                '&:hover': {
                  backgroundColor: selectedCategory === cat.id
                    ? 'primary.dark'
                    : 'rgba(255,255,255,0.15)',
                },
                transition: 'all 0.3s ease',
                border: selectedCategory === cat.id
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.1)'
              }}
            />
          ))}
        </Box>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 20 }}>
            <CollectionsIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.1)', mb: 3 }} />
            <Typography variant="h5" color="text.secondary">No items found in this category.</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={item.id}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'rgba(30, 41, 59, 0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      '& .image-overlay': {
                        opacity: 1,
                      },
                      '& .image-content': {
                        transform: 'scale(1.05)',
                      }
                    }
                  }}
                  onClick={() => handleImageClick(filteredItems.findIndex(i => i.id === item.id))}
                >
                  {/* Image */}
                  <Box
                    className="image-content"
                    component="img"
                    src={item.imageUrl}
                    alt={item.title}
                    sx={{
                      width: '100%',
                      height: 350,
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease'
                    }}
                  />

                  {/* Hover Overlay */}
                  <Box
                    className="image-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }}
                  >
                    <Tooltip title="View Fullscreen">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(filteredItems.findIndex(i => i.id === item.id));
                        }}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.8)' }
                        }}
                      >
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Image">
                      <IconButton
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!item.imageUrl) return;

                          try {
                            // First, try to get the image as a blob to handle cross-origin issues
                            const response = await fetch(item.imageUrl);
                            if (!response.ok) throw new Error('Failed to fetch image');

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);

                            // Create a temporary link to trigger download
                            const link = document.createElement('a');
                            link.href = url;

                            // Determine file extension from the URL or content type
                            let fileName = item.title || `gallery-image-${item.id}`;
                            const contentType = response.headers.get('content-type');
                            let ext = '.jpg'; // default extension

                            if (contentType) {
                              if (contentType.includes('png')) ext = '.png';
                              else if (contentType.includes('gif')) ext = '.gif';
                              else if (contentType.includes('webp')) ext = '.webp';
                            } else {
                              // Extract extension from URL if possible
                              const urlExtMatch = item.imageUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);
                              if (urlExtMatch) ext = urlExtMatch[0].toLowerCase();
                            }

                            // Ensure filename has proper extension
                            if (!fileName.toLowerCase().endsWith(ext)) {
                              fileName += ext;
                            }

                            link.download = fileName;

                            // Trigger download
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            // Clean up the object URL
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download failed:', error);

                            // Fallback: try direct link approach
                            try {
                              const link = document.createElement('a');
                              link.href = item.imageUrl;
                              link.download = item.title || `gallery-image-${item.id}`;
                              link.target = '_blank';
                              link.rel = 'noopener noreferrer';

                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } catch (fallbackError) {
                              console.error('Fallback download also failed:', fallbackError);
                              alert('Could not download the image. Please try saving it from the lightbox view.');
                            }
                          }
                        }}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.8)' }
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share Image">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          // Create a shareable URL that includes the gallery page with the specific image
                          const shareUrl = `${window.location.origin}${window.location.pathname}#${item.id}`;

                          if (navigator.share) {
                            navigator.share({
                              title: item.title,
                              text: item.description || 'Check out this image!',
                              url: shareUrl  // Share the gallery URL with image ID
                            }).catch(console.error);
                          } else {
                            // Fallback: copy the gallery URL with image ID to clipboard
                            navigator.clipboard.writeText(shareUrl).then(() => {
                              alert('Gallery link copied to clipboard!');
                            }).catch(err => {
                              console.error('Failed to copy: ', err);
                              // Fallback to opening share dialog in new window
                              const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(item.title)}`;
                              window.open(fbShareUrl, '_blank');
                            });
                          }
                        }}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(29, 155, 240, 0.8)' } // Twitter blue for share
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Caption */}
                  <Box sx={{ p: 4, backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, fontSize: '1.2rem' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
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
            <Tooltip title="Zoom In">
              <IconButton
                onClick={() => {
                  const newZoom = Math.min(zoomLevel + 0.2, 3); // Max zoom level of 3x
                  setZoomLevel(newZoom);
                  setIsZoomed(true);
                }}
                sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton
                onClick={() => {
                  const newZoom = Math.max(zoomLevel - 0.2, 0.5); // Min zoom level of 0.5x
                  setZoomLevel(newZoom);
                  if (newZoom <= 1) setIsZoomed(false);
                }}
                sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton
                onClick={async () => {
                  if (activeImage && activeImage.imageUrl) {
                    try {
                      // Get the image as a blob to handle cross-origin issues
                      const response = await fetch(activeImage.imageUrl);
                      if (!response.ok) throw new Error('Failed to fetch image');

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);

                      // Create a temporary link to trigger download
                      const link = document.createElement('a');
                      link.href = url;

                      // Determine file extension from the URL or content type
                      let fileName = activeImage.title || `gallery-image-${activeImage.id}`;
                      const contentType = response.headers.get('content-type');
                      let ext = '.jpg'; // default extension

                      if (contentType) {
                        if (contentType.includes('png')) ext = '.png';
                        else if (contentType.includes('gif')) ext = '.gif';
                        else if (contentType.includes('webp')) ext = '.webp';
                      } else {
                        // Extract extension from URL if possible
                        const urlExtMatch = activeImage.imageUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);
                        if (urlExtMatch) ext = urlExtMatch[0].toLowerCase();
                      }

                      // Ensure filename has proper extension
                      if (!fileName.toLowerCase().endsWith(ext)) {
                        fileName += ext;
                      }

                      link.download = fileName;

                      // Trigger download
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      // Clean up the object URL
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Download failed:', error);

                      // Fallback: try direct link approach
                      try {
                        const link = document.createElement('a');
                        link.href = activeImage.imageUrl;
                        link.download = activeImage.title || `gallery-image-${activeImage.id}`;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';

                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } catch (fallbackError) {
                        console.error('Fallback download also failed:', fallbackError);
                        alert('Could not download the image. Please try right-clicking and selecting "Save image as..."');
                      }
                    }
                  }
                }}
                sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Image">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeImage && activeImage.id) {
                    // Create a shareable URL that includes the gallery page with the specific image
                    const shareUrl = `${window.location.origin}${window.location.pathname}#${activeImage.id}`;

                    if (navigator.share) {
                      navigator.share({
                        title: activeImage.title,
                        text: activeImage.description || 'Check out this image!',
                        url: shareUrl  // Share the gallery URL with image ID
                      }).catch(console.error);
                    } else {
                      // Fallback: copy the gallery URL with image ID to clipboard
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        alert('Gallery link copied to clipboard!');
                      }).catch(err => {
                        console.error('Failed to copy: ', err);
                        // Fallback to opening share dialog in new window
                        const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(activeImage.title)}`;
                        window.open(fbShareUrl, '_blank');
                      });
                    }
                  }
                }}
                sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', '&:hover': { backgroundColor: 'rgba(29, 155, 240, 0.8)' } }}
              >
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
          position: 'relative',
          overflow: 'visible' // Allow overflow when image is zoomed
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
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            p: 4
          }}>
            <Zoom in timeout={500} key={selectedImageIndex}>
              <Box
                component="img"
                src={activeImage?.imageUrl}
                alt={activeImage?.title}
                onClick={() => {
                  // Click to zoom in when not zoomed, zoom out when zoomed
                  if (isZoomed) {
                    setZoomLevel(1);
                    setIsZoomed(false);
                  } else {
                    setZoomLevel(Math.min(zoomLevel + 0.5, 3)); // Zoom in by 0.5x
                    setIsZoomed(true);
                  }
                }}
                onWheelCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const delta = e.deltaY;
                  if (delta > 0) {
                    // Scroll down - zoom out
                    const newZoom = Math.max(zoomLevel - 0.1, 0.5);
                    setZoomLevel(newZoom);
                    if (newZoom <= 1) setIsZoomed(false);
                  } else {
                    // Scroll up - zoom in
                    const newZoom = Math.min(zoomLevel + 0.1, 3);
                    setZoomLevel(newZoom);
                    setIsZoomed(true);
                  }
                }}
                sx={{
                  // Display original image proportions without forcing a shape
                  maxHeight: '70vh',
                  maxWidth: '85vw',
                  boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center', // Zoom from center
                  transition: 'transform 0.3s ease',
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                  userSelect: 'none',
                  display: 'block' // Ensure proper display
                }}
              />
            </Zoom>

            {/* Image Details Overlay */}
            <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{activeImage?.title}</Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>{activeImage?.description}</Typography>
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