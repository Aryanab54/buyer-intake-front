import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Button, Form, Row, Col, Card, Badge, Pagination, 
  Spinner, Alert, Dropdown, InputGroup 
} from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buyersAPI } from '../services/api';
import { CITIES, PROPERTY_TYPES, STATUSES, TIMELINES } from '../schemas/buyerSchema';
import { exportToCSV, formatBuyerForCSV } from '../utils/csvUtils';
import { formatTimeline, formatStatus } from '../utils/displayUtils';
import ImportModal from '../components/ImportModal';
import { useAuth } from '../contexts/AuthContext';

const BuyersList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // URL-synced filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    status: searchParams.get('status') || '',
    timeline: searchParams.get('timeline') || '',
    page: parseInt(searchParams.get('page')) || 1,
    sortBy: searchParams.get('sortBy') || 'updatedAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState(filters.search);

  const updateURL = useCallback((newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [setSearchParams]);

  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Map frontend filter values to backend enum values
      const mapFiltersToBackend = (filters) => {
        const timelineMap = {
          '0-3m': 'ZERO_TO_THREE_MONTHS',
          '3-6m': 'THREE_TO_SIX_MONTHS', 
          '>6m': 'MORE_THAN_SIX_MONTHS',
          'Exploring': 'Exploring'
        };
        
        const statusMap = {
          'New': 'NEW'
        };
        
        return {
          ...filters,
          timeline: filters.timeline ? (timelineMap[filters.timeline] || filters.timeline) : '',
          status: filters.status ? (statusMap[filters.status] || filters.status) : ''
        };
      };
      
      const params = {
        ...mapFiltersToBackend(filters),
        limit: 10
      };
      
      const response = await buyersAPI.getAll(params);
      setBuyers(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 0);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch buyers');
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange('search', searchInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset to page 1 when filters change
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleSort = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    handleFilterChange('sortBy', field);
    handleFilterChange('sortOrder', newOrder);
  };

  const handleStatusChange = async (buyerId, newStatus) => {
    try {
      const statusMap = { 'New': 'NEW' };
      const mappedStatus = statusMap[newStatus] || newStatus;
      await buyersAPI.update(buyerId, { status: mappedStatus });
      fetchBuyers(); // Refresh the list
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Map filters to backend enums like in fetchBuyers
      const mapFiltersToBackend = (filters) => {
        const timelineMap = {
          '0-3m': 'ZERO_TO_THREE_MONTHS',
          '3-6m': 'THREE_TO_SIX_MONTHS', 
          '>6m': 'MORE_THAN_SIX_MONTHS',
          'Exploring': 'Exploring'
        };
        const statusMap = { 'New': 'NEW' };
        return {
          ...filters,
          timeline: filters.timeline ? (timelineMap[filters.timeline] || filters.timeline) : '',
          status: filters.status ? (statusMap[filters.status] || filters.status) : ''
        };
      };

      const params = { ...mapFiltersToBackend(filters), limit: 1000 };
      const response = await buyersAPI.getAll(params);
      const csvData = response.data.data.map(formatBuyerForCSV);
      exportToCSV(csvData, `buyers_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      city: '',
      propertyType: '',
      status: '',
      timeline: '',
      page: 1,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    setSearchInput('');
    updateURL(clearedFilters);
  };

  const formatBudget = (min, max) => {
    if (!min && !max) return '-';
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

  const canEdit = (buyer) => {
    return user?.role === 'admin' || buyer.ownerId === user?.id;
  };

  if (loading && buyers.length === 0) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Buyer Leads</h2>
          <p className="text-muted mb-0">
            {totalCount} total leads
            {Object.values(filters).some(v => v && v !== 1 && v !== 'updatedAt' && v !== 'desc') && 
              ` (filtered)`
            }
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={() => setShowImportModal(true)}
          >
            Import CSV
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={handleExport}
            disabled={exporting || buyers.length === 0}
          >
            {exporting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Exporting...
              </>
            ) : (
              'Export CSV'
            )}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/buyers/new')}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Card className="filters-container">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>City</Form.Label>
                <Form.Select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                >
                  <option value="">All Cities</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Property Type</Form.Label>
                <Form.Select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Timeline</Form.Label>
                <Form.Select
                  value={filters.timeline}
                  onChange={(e) => handleFilterChange('timeline', e.target.value)}
                >
                  <option value="">All Timelines</option>
                  {TIMELINES.map(timeline => (
                    <option key={timeline} value={timeline}>{timeline}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {Object.values(filters).some(v => v && v !== 1 && v !== 'updatedAt' && v !== 'desc') && (
            <div className="mt-3">
              <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="table-container">
        <Card.Body className="p-0">
          {buyers.length === 0 ? (
            <div className="empty-state">
              <h5>No leads found</h5>
              <p>Try adjusting your filters or add a new lead.</p>
              <Button variant="primary" onClick={() => navigate('/buyers/new')}>
                Add First Lead
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('fullName')}
                    >
                      Name {filters.sortBy === 'fullName' && (
                        filters.sortOrder === 'asc' ? '↑' : '↓'
                      )}
                    </th>
                    <th>Phone</th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('city')}
                    >
                      City {filters.sortBy === 'city' && (
                        filters.sortOrder === 'asc' ? '↑' : '↓'
                      )}
                    </th>
                    <th>Property Type</th>
                    <th>Budget</th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('timeline')}
                    >
                      Timeline {filters.sortBy === 'timeline' && (
                        filters.sortOrder === 'asc' ? '↑' : '↓'
                      )}
                    </th>
                    <th>Status</th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('updatedAt')}
                    >
                      Updated {filters.sortBy === 'updatedAt' && (
                        filters.sortOrder === 'asc' ? '↑' : '↓'
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer) => (
                    <tr key={buyer.id}>
                      <td>
                        <div>
                          <div className="fw-medium">{buyer.fullName}</div>
                          {buyer.email && (
                            <small className="text-muted">{buyer.email}</small>
                          )}
                        </div>
                      </td>
                      <td>{buyer.phone}</td>
                      <td>{buyer.city}</td>
                      <td>
                        {buyer.propertyType}
                        {buyer.bhk && ` (${buyer.bhk} BHK)`}
                      </td>
                      <td className="budget-display">
                        {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                      </td>
                      <td>{formatTimeline(buyer.timeline)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle 
                            as={Badge}
                            bg={getStatusVariant(buyer.status)}
                            className="status-badge"
                            style={{ cursor: 'pointer' }}
                          >
                            {formatStatus(buyer.status)}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {STATUSES.map(status => (
                              <Dropdown.Item
                                key={status}
                                active={status === buyer.status}
                                onClick={() => handleStatusChange(buyer.id, status)}
                                disabled={!canEdit(buyer)}
                              >
                                {status}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(buyer.updatedAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/buyers/${buyer.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              disabled={filters.page === 1}
              onClick={() => handleFilterChange('page', 1)}
            />
            <Pagination.Prev 
              disabled={filters.page === 1}
              onClick={() => handleFilterChange('page', filters.page - 1)}
            />
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 || 
                page === totalPages || 
                (page >= filters.page - 2 && page <= filters.page + 2)
              ) {
                return (
                  <Pagination.Item
                    key={page}
                    active={page === filters.page}
                    onClick={() => handleFilterChange('page', page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              } else if (
                page === filters.page - 3 || 
                page === filters.page + 3
              ) {
                return <Pagination.Ellipsis key={page} />;
              }
              return null;
            })}
            
            <Pagination.Next 
              disabled={filters.page === totalPages}
              onClick={() => handleFilterChange('page', filters.page + 1)}
            />
            <Pagination.Last 
              disabled={filters.page === totalPages}
              onClick={() => handleFilterChange('page', totalPages)}
            />
          </Pagination>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onSuccess={() => {
          fetchBuyers();
          setShowImportModal(false);
        }}
      />
    </div>
  );
};

export default BuyersList;