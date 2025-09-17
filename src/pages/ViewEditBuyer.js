import React, { useState, useEffect } from 'react';
import { 
  Form, Button, Row, Col, Card, Alert, Spinner, Badge, 
  Modal, Tab, Tabs 
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerSchema, CITIES, PROPERTY_TYPES, BHK_OPTIONS, PURPOSES, TIMELINES, SOURCES, STATUSES } from '../schemas/buyerSchema';
import { buyersAPI } from '../services/api';
import TagInput from '../components/TagInput';
import { useAuth } from '../contexts/AuthContext';

const ViewEditBuyer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [buyer, setBuyer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [originalUpdatedAt, setOriginalUpdatedAt] = useState(null);

  useEffect(() => {
    fetchBuyer();
  }, [id]);

  const fetchBuyer = async () => {
    setLoading(true);
    try {
      const response = await buyersAPI.getById(id);
      const buyerData = response.data.buyer;
      const historyData = response.data.history || [];
      
      setBuyer(buyerData);
      setHistory(historyData);
      setFormData({
        fullName: buyerData.fullName,
        email: buyerData.email || '',
        phone: buyerData.phone,
        city: buyerData.city,
        propertyType: buyerData.propertyType,
        bhk: buyerData.bhk || '',
        purpose: buyerData.purpose,
        budgetMin: buyerData.budgetMin || '',
        budgetMax: buyerData.budgetMax || '',
        timeline: buyerData.timeline,
        source: buyerData.source,
        status: buyerData.status,
        notes: buyerData.notes || '',
        tags: buyerData.tags || []
      });
      setOriginalUpdatedAt(buyerData.updatedAt);
    } catch (error) {
      setErrors({ 
        fetch: error.response?.data?.message || 'Failed to fetch buyer details' 
      });
    } finally {
      setLoading(false);
    }
  };

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
      error.errors.forEach(err => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return null;
    }
  };

  const handleSave = async () => {
    const validatedData = validateForm();
    if (!validatedData) return;

    setSaving(true);
    try {
      const updateData = {
        ...validatedData,
        updatedAt: originalUpdatedAt // Include for concurrency check
      };
      
      await buyersAPI.update(id, updateData);
      setIsEditing(false);
      fetchBuyer(); // Refresh data
    } catch (error) {
      if (error.response?.status === 409) {
        setErrors({ 
          concurrency: 'This record has been modified by another user. Please refresh and try again.' 
        });
      } else {
        setErrors({ 
          submit: error.response?.data?.message || 'Failed to update buyer' 
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await buyersAPI.delete(id);
      navigate('/buyers');
    } catch (error) {
      setErrors({ 
        delete: error.response?.data?.message || 'Failed to delete buyer' 
      });
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = () => {
    return user?.role === 'admin' || buyer?.ownerId === user?.id;
  };

  const formatBudget = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max.toLocaleString()}`;
  };

  const getStatusVariant = (status) => {
    const variants = {
      'New': 'primary',
      'Qualified': 'info',
      'Contacted': 'warning',
      'Visited': 'secondary',
      'Negotiation': 'warning',
      'Converted': 'success',
      'Dropped': 'danger'
    };
    return variants[status] || 'secondary';
  };

  const requiresBHK = ['Apartment', 'Villa'].includes(formData.propertyType);

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!buyer) {
    return (
      <Alert variant="danger">
        Buyer not found or you don't have permission to view this record.
      </Alert>
    );
  }

  return (
    <div className="container-fluid">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">{buyer.fullName}</h2>
              <div className="d-flex align-items-center gap-2">
                <Badge bg={getStatusVariant(buyer.status)}>{buyer.status}</Badge>
                <span className="text-muted">
                  Last updated: {new Date(buyer.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/buyers')}
              >
                Back to List
              </Button>
              {canEdit() && !isEditing && (
                <Button 
                  variant="primary" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
              {canEdit() && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Error Messages */}
          {errors.fetch && <Alert variant="danger">{errors.fetch}</Alert>}
          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
          {errors.concurrency && <Alert variant="warning">{errors.concurrency}</Alert>}
          {errors.delete && <Alert variant="danger">{errors.delete}</Alert>}

          <Tabs defaultActiveKey="details" className="mb-4">
            <Tab eventKey="details" title="Details">
              <Card className="form-container">
                <Card.Body>
                  {isEditing ? (
                    <Form>
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
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => {
                            setIsEditing(false);
                            setErrors({});
                            // Reset form data
                            setFormData({
                              fullName: buyer.fullName,
                              email: buyer.email || '',
                              phone: buyer.phone,
                              city: buyer.city,
                              propertyType: buyer.propertyType,
                              bhk: buyer.bhk || '',
                              purpose: buyer.purpose,
                              budgetMin: buyer.budgetMin || '',
                              budgetMax: buyer.budgetMax || '',
                              timeline: buyer.timeline,
                              source: buyer.source,
                              status: buyer.status,
                              notes: buyer.notes || '',
                              tags: buyer.tags || []
                            });
                          }}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <div>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <strong>Full Name:</strong>
                            <div>{buyer.fullName}</div>
                          </div>
                          <div className="mb-3">
                            <strong>Email:</strong>
                            <div>{buyer.email || 'Not provided'}</div>
                          </div>
                          <div className="mb-3">
                            <strong>Phone:</strong>
                            <div>{buyer.phone}</div>
                          </div>
                          <div className="mb-3">
                            <strong>City:</strong>
                            <div>{buyer.city}</div>
                          </div>
                          <div className="mb-3">
                            <strong>Property Type:</strong>
                            <div>
                              {buyer.propertyType}
                              {buyer.bhk && ` (${buyer.bhk} BHK)`}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <strong>Purpose:</strong>
                            <div>{buyer.purpose}</div>
                          </div>
                          <div className="mb-3">
                            <strong>Budget:</strong>
                            <div className="budget-display">
                              {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                            </div>
                          </div>
                          <div className="mb-3">
                            <strong>Timeline:</strong>
                            <div>{buyer.timeline}</div>
                          </div>
                          <div className="mb-3">
                            <strong>Source:</strong>
                            <div>{buyer.source}</div>
                          </div>
                          <div className="mb-3">
                            <strong>Status:</strong>
                            <div>
                              <Badge bg={getStatusVariant(buyer.status)}>
                                {buyer.status}
                              </Badge>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {buyer.tags && buyer.tags.length > 0 && (
                        <div className="mb-3">
                          <strong>Tags:</strong>
                          <div className="mt-1">
                            {buyer.tags.map((tag, index) => (
                              <Badge key={index} bg="secondary" className="me-1 mb-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {buyer.notes && (
                        <div className="mb-3">
                          <strong>Notes:</strong>
                          <div className="mt-1 p-2 bg-light rounded">
                            {buyer.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="history" title={`History (${history.length})`}>
              <Card className="form-container">
                <Card.Body>
                  {history.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      No history available
                    </div>
                  ) : (
                    <div>
                      {history.slice(0, 5).map((entry, index) => (
                        <div key={index} className="history-item">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong>Changed by:</strong> {entry.changedBy ? (entry.changedBy.name || entry.changedBy.email || entry.changedBy.id) : 'System'}
                            </div>
                            <small className="text-muted">
                              {new Date(entry.changedAt).toLocaleString()}
                            </small>
                          </div>
                          <div>
                            <strong>Changes:</strong>
                            <ul className="mb-0 mt-1">
                              {Object.entries(entry.diff || {}).map(([field, change]) => (
                                <li key={field}>
                                  <strong>{field}:</strong> {change.from} → {change.to}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                      {history.length > 5 && (
                        <div className="text-muted text-center">
                          Showing last 5 changes
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this buyer lead? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </div>
  );
};

export default ViewEditBuyer;