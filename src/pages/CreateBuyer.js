import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { buyerSchema, CITIES, PROPERTY_TYPES, BHK_OPTIONS, PURPOSES, TIMELINES, SOURCES, STATUSES } from '../schemas/buyerSchema';
import { buyersAPI } from '../services/api';
import TagInput from '../components/TagInput';

const CreateBuyer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    propertyType: '',
    bhk: '',
    purpose: '',
    budgetMin: '',
    budgetMax: '',
    timeline: '',
    source: '',
    status: 'New',
    notes: '',
    tags: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleTagsChange = (tags) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const validateForm = () => {
    try {
      const processedData = {
        ...formData,
        budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : undefined,
        email: formData.email || undefined,
        bhk: formData.bhk || undefined,
        notes: formData.notes || undefined
      };

      buyerSchema.parse(processedData);
      setErrors({});
      return processedData;
    } catch (error) {
      const fieldErrors = {};
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
      } else {
        fieldErrors.submit = 'Validation failed';
      }
      setErrors(fieldErrors);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validatedData = validateForm();
    if (!validatedData) return;

    setLoading(true);
    try {
      await buyersAPI.create(validatedData);
      navigate('/buyers');
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to create buyer lead' 
      });
    } finally {
      setLoading(false);
    }
  };

  const requiresBHK = ['Apartment', 'Villa'].includes(formData.propertyType);

  return (
    <div className="container-fluid">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="form-container">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Add New Buyer Lead</h2>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/buyers')}
                >
                  Back to List
                </Button>
              </div>

              {errors.submit && (
                <Alert variant="danger">{errors.submit}</Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        isInvalid={!!errors.fullName}
                        placeholder="Enter full name"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fullName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        placeholder="Enter email address"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        isInvalid={!!errors.phone}
                        placeholder="Enter phone number"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        isInvalid={!!errors.city}
                        required
                      >
                        <option value="">Select City</option>
                        {CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.city}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Property Type *</Form.Label>
                      <Form.Select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleChange}
                        isInvalid={!!errors.propertyType}
                        required
                      >
                        <option value="">Select Property Type</option>
                        {PROPERTY_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.propertyType}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        BHK {requiresBHK && '*'}
                      </Form.Label>
                      <Form.Select
                        name="bhk"
                        value={formData.bhk}
                        onChange={handleChange}
                        isInvalid={!!errors.bhk}
                        required={requiresBHK}
                        disabled={!requiresBHK}
                      >
                        <option value="">Select BHK</option>
                        {BHK_OPTIONS.map(bhk => (
                          <option key={bhk} value={bhk}>{bhk}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.bhk}
                      </Form.Control.Feedback>
                      {!requiresBHK && (
                        <Form.Text className="text-muted">
                          BHK is only applicable for Apartment and Villa
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Purpose *</Form.Label>
                      <Form.Select
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        isInvalid={!!errors.purpose}
                        required
                      >
                        <option value="">Select Purpose</option>
                        {PURPOSES.map(purpose => (
                          <option key={purpose} value={purpose}>{purpose}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.purpose}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Timeline *</Form.Label>
                      <Form.Select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        isInvalid={!!errors.timeline}
                        required
                      >
                        <option value="">Select Timeline</option>
                        {TIMELINES.map(timeline => (
                          <option key={timeline} value={timeline}>{timeline}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.timeline}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Budget Min (INR)</Form.Label>
                      <Form.Control
                        type="number"
                        name="budgetMin"
                        value={formData.budgetMin}
                        onChange={handleChange}
                        isInvalid={!!errors.budgetMin}
                        placeholder="Minimum budget"
                        min="0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.budgetMin}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Budget Max (INR)</Form.Label>
                      <Form.Control
                        type="number"
                        name="budgetMax"
                        value={formData.budgetMax}
                        onChange={handleChange}
                        isInvalid={!!errors.budgetMax}
                        placeholder="Maximum budget"
                        min="0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.budgetMax}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Source *</Form.Label>
                      <Form.Select
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        isInvalid={!!errors.source}
                        required
                      >
                        <option value="">Select Source</option>
                        {SOURCES.map(source => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.source}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        isInvalid={!!errors.status}
                      >
                        {STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.status}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Tags</Form.Label>
                  <TagInput
                    tags={formData.tags}
                    onChange={handleTagsChange}
                    placeholder="Add tags (press Enter or comma to add)"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    isInvalid={!!errors.notes}
                    placeholder="Additional notes (max 1000 characters)"
                    maxLength={1000}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.notes}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.notes.length}/1000 characters
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Lead'
                    )}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/buyers')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateBuyer;