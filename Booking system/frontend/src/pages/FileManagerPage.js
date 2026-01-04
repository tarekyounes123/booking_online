import React, { useState, useRef } from 'react';
import { Container, Typography, Paper, Box, Button, Grid, Card, CardContent, CardMedia, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { Delete, Download, Image as ImageIcon, InsertDriveFile, Folder } from '@mui/icons-material';

const FileManagerPage = () => {
  const [files, setFiles] = useState([
    { id: 1, name: 'logo.png', type: 'image', size: '125 KB', date: '2023-01-15', url: 'https://via.placeholder.com/150' },
    { id: 2, name: 'brochure.pdf', type: 'document', size: '2.4 MB', date: '2023-01-20', url: '#' },
    { id: 3, name: 'presentation.pptx', type: 'document', size: '5.7 MB', date: '2023-01-25', url: '#' },
    { id: 4, name: 'banner.jpg', type: 'image', size: '850 KB', date: '2023-02-01', url: 'https://via.placeholder.com/300x150' },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile(file);
      setUploadDialogOpen(true);
    }
  };

  const confirmUpload = () => {
    if (newFile) {
      // Simulate upload progress
      setUploadProgress(0);
      setUploadStatus('Uploading...');
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus('Upload complete!');
            
            // Add the new file to the list
            const newFileObj = {
              id: files.length + 1,
              name: newFile.name,
              type: newFile.type.startsWith('image/') ? 'image' : 'document',
              size: `${(newFile.size / 1024 / 1024).toFixed(2)} MB`,
              date: new Date().toISOString().split('T')[0],
              url: newFile.type.startsWith('image/') ? URL.createObjectURL(newFile) : '#'
            };
            
            setFiles(prev => [...prev, newFileObj]);
            setNewFile(null);
            setUploadDialogOpen(false);
            setUploadProgress(0);
            setUploadStatus('');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleDeleteFile = (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setFiles(prev => prev.filter(file => file.id !== id));
    }
  };

  const getFileIcon = (type) => {
    if (type === 'image') return <ImageIcon fontSize="large" color="primary" />;
    return <InsertDriveFile fontSize="large" color="secondary" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        File Manager
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Media Files</Typography>
          <Button
            variant="contained"
            startIcon={<InsertDriveFile />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </Box>
        
        <Grid container spacing={3}>
          {files.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getFileIcon(file.type)}
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography variant="subtitle1" noWrap>{file.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{file.size}</Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Uploaded: {file.date}
                  </Typography>
                  
                  {file.type === 'image' && (
                    <CardMedia
                      component="img"
                      height="100"
                      image={file.url}
                      alt={file.name}
                      sx={{ borderRadius: 1, mb: 2 }}
                    />
                  )}
                </CardContent>
                
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => window.open(file.url, '_blank')}
                    title="Download"
                  >
                    <Download fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteFile(file.id)}
                    title="Delete"
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>Uploading: {newFile?.name}</Typography>
          {uploadProgress > 0 && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Box sx={{ 
                width: '100%', 
                bgcolor: 'grey.300', 
                borderRadius: 1,
                height: 24
              }}>
                <Box 
                  sx={{ 
                    width: `${uploadProgress}%`, 
                    bgcolor: 'primary.main', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="caption" color="white">
                    {uploadProgress}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          {uploadStatus && (
            <Alert severity={uploadStatus.includes('complete') ? 'success' : 'info'} sx={{ mt: 2 }}>
              {uploadStatus}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmUpload} disabled={uploadProgress > 0}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FileManagerPage;