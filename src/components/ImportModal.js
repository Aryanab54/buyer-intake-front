import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import { parseCSV, validateCSVData } from '../utils/csvUtils';
import { buyersAPI } from '../services/api';

const ImportModal = ({ show, onHide, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setValidationResults(null);
  };

  const handleValidate = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const results = await parseCSV(file);
      
      if (results.data.length > 200) {
        setValidationResults({
          errors: [{ row: 'File', field: 'size', message: 'Maximum 200 rows allowed', value: results.data.length }],
          validRows: []
        });
        setLoading(false);
        return;
      }

      const validation = validateCSVData(results.data);
      setValidationResults(validation);
    } catch (error) {
      setValidationResults({
        errors: [{ row: 'File', field: 'parse', message: 'Failed to parse CSV file', value: error.message }],
        validRows: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await buyersAPI.import(formData);
      onSuccess();
      handleClose();
    } catch (error) {
      setValidationResults(prev => ({
        ...prev,
        errors: [...(prev.errors || []), {
          row: 'Import',
          field: 'server',
          message: error.response?.data?.message || 'Import failed',
          value: ''
        }]
      }));
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationResults(null);
    setLoading(false);
    setImporting(false);
    onHide();
  };

  const downloadTemplate = () => {
    const template = `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
John Doe,john@example.com,9876543210,Chandigarh,Apartment,2,Buy,5000000,7000000,0-3m,Website,"Looking for 2BHK","urgent,family",New`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'buyer_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Import Buyer Leads</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="mb-3">
          <Button variant="outline-info" size="sm" onClick={downloadTemplate}>
            Download CSV Template
          </Button>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Select CSV File</Form.Label>
          <Form.Control
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading || importing}
          />
          <Form.Text className="text-muted">
            Maximum 200 rows allowed. Use the template for correct format.
          </Form.Text>
        </Form.Group>

        {file && !validationResults && (
          <Button 
            variant="primary" 
            onClick={handleValidate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Validating...
              </>
            ) : (
              'Validate File'
            )}
          </Button>
        )}

        {validationResults && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>Validation Results</h6>
              <div>
                <Badge bg="success" className="me-2">
                  Valid: {validationResults.validRows.length}
                </Badge>
                <Badge bg="danger">
                  Errors: {validationResults.errors.length}
                </Badge>
              </div>
            </div>

            {validationResults.errors.length > 0 && (
              <Alert variant="warning">
                <Alert.Heading>Validation Errors</Alert.Heading>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <Table size="sm" striped>
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Field</th>
                        <th>Error</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResults.errors.map((error, index) => (
                        <tr key={index}>
                          <td>{error.row}</td>
                          <td>{error.field}</td>
                          <td>{error.message}</td>
                          <td className="text-truncate" style={{ maxWidth: '100px' }}>
                            {error.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Alert>
            )}

            {validationResults.validRows.length > 0 && (
              <Alert variant="success">
                {validationResults.validRows.length} rows are valid and ready to import.
                {validationResults.errors.length > 0 && ' Only valid rows will be imported.'}
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={importing}>
          Cancel
        </Button>
        {validationResults?.validRows.length > 0 && (
          <Button 
            variant="primary" 
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Importing...
              </>
            ) : (
              `Import ${validationResults.validRows.length} Leads`
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ImportModal;