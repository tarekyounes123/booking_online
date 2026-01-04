import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, CardActions, IconButton, Divider, List, ListItem, ListItemText, FormControlLabel, Checkbox } from '@mui/material';
import { Add, Delete, DragIndicator } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const FormBuilderPage = () => {
  const [formFields, setFormFields] = useState([]);
  const [newField, setNewField] = useState({
    type: 'text',
    label: '',
    required: false,
    options: []
  });

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'email', label: 'Email Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'date', label: 'Date Picker' }
  ];

  const addField = () => {
    if (!newField.label.trim()) {
      alert('Please enter a field label');
      return;
    }

    const field = {
      id: Date.now(),
      ...newField
    };

    setFormFields([...formFields, field]);
    setNewField({
      type: 'text',
      label: '',
      required: false,
      options: []
    });
  };

  const removeField = (id) => {
    setFormFields(formFields.filter(field => field.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormFields(items);
  };

  const updateFieldOption = (fieldId, optionIndex, value) => {
    setFormFields(formFields.map(field => {
      if (field.id === fieldId) {
        const updatedOptions = [...field.options];
        updatedOptions[optionIndex] = value;
        return { ...field, options: updatedOptions };
      }
      return field;
    }));
  };

  const addOptionToField = (fieldId) => {
    setFormFields(formFields.map(field => {
      if (field.id === fieldId) {
        return { ...field, options: [...field.options, ''] };
      }
      return field;
    }));
  };

  const removeOptionFromField = (fieldId, optionIndex) => {
    setFormFields(formFields.map(field => {
      if (field.id === fieldId && field.options.length > 1) {
        const updatedOptions = [...field.options];
        updatedOptions.splice(optionIndex, 1);
        return { ...field, options: updatedOptions };
      }
      return field;
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Dynamic Form Builder
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Build Your Form</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                      value={newField.type}
                      label="Field Type"
                      onChange={(e) => setNewField({...newField, type: e.target.value})}
                    >
                      {fieldTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Field Label"
                    value={newField.label}
                    onChange={(e) => setNewField({...newField, label: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addField}
                    fullWidth
                  >
                    Add Field
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 2 }}>Form Preview</Divider>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="form-fields">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {formFields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id.toString()} index={index}>
                        {(provided) => (
                          <Card 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{ mb: 2 }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <IconButton {...provided.dragHandleProps} size="small">
                                  <DragIndicator />
                                </IconButton>
                                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                                  {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => removeField(field.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                              
                              {field.type === 'text' && (
                                <TextField 
                                  label={field.label} 
                                  fullWidth 
                                  required={field.required}
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              
                              {field.type === 'textarea' && (
                                <TextField 
                                  label={field.label} 
                                  fullWidth 
                                  required={field.required}
                                  multiline
                                  rows={3}
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              
                              {field.type === 'select' && (
                                <FormControl fullWidth size="small">
                                  <InputLabel>{field.label}</InputLabel>
                                  <Select label={field.label} required={field.required}>
                                    {field.options.map((option, idx) => (
                                      <MenuItem key={idx} value={option}>{option}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                              
                              {(field.type === 'radio' || field.type === 'checkbox') && (
                                <Box>
                                  {field.options.map((option, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      {field.type === 'radio' ? (
                                        <input type="radio" name={`field-${field.id}`} />
                                      ) : (
                                        <input type="checkbox" />
                                      )}
                                      <TextField
                                        value={option}
                                        onChange={(e) => updateFieldOption(field.id, idx, e.target.value)}
                                        size="small"
                                        sx={{ ml: 1, flex: 1 }}
                                        placeholder="Option label"
                                      />
                                      {field.options.length > 1 && (
                                        <IconButton 
                                          size="small" 
                                          color="error" 
                                          onClick={() => removeOptionFromField(field.id, idx)}
                                          sx={{ ml: 1 }}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  ))}
                                  <Button 
                                    size="small" 
                                    startIcon={<Add />}
                                    onClick={() => addOptionToField(field.id)}
                                    sx={{ mt: 1 }}
                                  >
                                    Add Option
                                  </Button>
                                </Box>
                              )}
                              
                              {field.type === 'email' && (
                                <TextField 
                                  label={field.label} 
                                  type="email"
                                  fullWidth 
                                  required={field.required}
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              
                              {field.type === 'number' && (
                                <TextField 
                                  label={field.label} 
                                  type="number"
                                  fullWidth 
                                  required={field.required}
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              
                              {field.type === 'date' && (
                                <TextField 
                                  label={field.label} 
                                  type="date"
                                  fullWidth 
                                  required={field.required}
                                  variant="outlined"
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
                                />
                              )}
                            </CardContent>
                            <CardActions>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={field.required}
                                    onChange={(e) => setFormFields(formFields.map(f => 
                                      f.id === field.id ? {...f, required: e.target.checked} : f
                                    ))}
                                  />
                                }
                                label="Required"
                              />
                            </CardActions>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Form Configuration</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure your form settings and preview how it will appear to users.
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Form Fields:</Typography>
              {formFields.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No fields added yet. Start by adding fields to your form.
                </Typography>
              ) : (
                <List>
                  {formFields.map((field) => (
                    <ListItem key={field.id} sx={{ pl: 0 }}>
                      <ListItemText 
                        primary={`${field.label} (${field.type})`} 
                        secondary={field.required ? "Required" : "Optional"} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Form Actions:</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mr: 1 }}
                disabled={formFields.length === 0}
              >
                Save Form
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                disabled={formFields.length === 0}
              >
                Preview Form
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormBuilderPage;