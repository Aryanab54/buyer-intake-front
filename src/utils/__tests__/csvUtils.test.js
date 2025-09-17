import { validateCSVData, formatBuyerForCSV } from '../csvUtils';

describe('CSV Utils', () => {
  describe('validateCSVData', () => {
    test('validates correct CSV data', () => {
      const data = [{
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
        status: 'New'
      }];

      const result = validateCSVData(data);
      expect(result.validRows).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    test('catches validation errors', () => {
      const data = [{
        fullName: 'A', // Too short
        phone: '123', // Invalid format
        city: 'InvalidCity',
        propertyType: 'Apartment',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website'
      }];

      const result = validateCSVData(data);
      expect(result.validRows).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('formatBuyerForCSV', () => {
    test('formats buyer data for CSV export', () => {
      const buyer = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: 5000000,
        budgetMax: 7000000,
        timeline: '0-3m',
        source: 'Website',
        notes: 'Test notes',
        tags: ['urgent', 'family'],
        status: 'New'
      };

      const result = formatBuyerForCSV(buyer);
      expect(result.fullName).toBe('John Doe');
      expect(result.tags).toBe('urgent,family');
      expect(result.budgetMin).toBe(5000000);
    });
  });
});