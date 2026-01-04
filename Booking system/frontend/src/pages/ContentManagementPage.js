import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Button, TextField } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ContentManagementPage = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent',
    'direction',
    'size',
    'color', 'background',
    'font',
    'align',
    'clean',
    'link', 'image', 'video'
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real application, you would save the content to the database
      console.log('Saving content:', { title, content });
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Content Management
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Content Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Content Editor
          </Typography>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            style={{ height: '300px', marginBottom: '30px' }}
          />
        </Box>
        
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          sx={{ mt: 2 }}
        >
          {isSaving ? 'Saving...' : 'Save Content'}
        </Button>
      </Paper>
    </Container>
  );
};

export default ContentManagementPage;