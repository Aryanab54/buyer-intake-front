import Papa from 'papaparse';
import { csvRowSchema } from '../schemas/buyerSchema';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const validateCSVData = (data) => {
  const validRows = [];
  const errors = [];

  data.forEach((row, index) => {
    try {
      const validatedRow = csvRowSchema.parse(row);
      validRows.push(validatedRow);
    } catch (error) {
      if (error.errors) {
        const rowErrors = error.errors.map(err => ({
          row: index + 1,
          field: err.path[0],
          message: err.message,
          value: row[err.path[0]]
        }));
        errors.push(...rowErrors);
      } else {
        errors.push({
          row: index + 1,
          field: 'unknown',
          message: error.message || 'Validation failed',
          value: ''
        });
      }
    }
  });

  return { validRows, errors };
};

export const exportToCSV = (data, filename = 'buyers.csv') => {
  const csv = Papa.unparse(data, {
    header: true
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatBuyerForCSV = (buyer) => ({
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
  notes: buyer.notes || '',
  tags: buyer.tags ? buyer.tags.join(',') : '',
  status: buyer.status
});