import { buyerSchema, csvRowSchema } from '../schemas/buyerSchema';

describe('Buyer Validation', () => {
  describe('buyerSchema', () => {
    test('should validate a complete buyer object', () => {
      const validBuyer = {
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
        status: 'New',
        notes: 'Looking for a 2BHK apartment',
        tags: ['urgent', 'family']
      };

      expect(() => buyerSchema.parse(validBuyer)).not.toThrow();
    });

    test('should require BHK for Apartment and Villa', () => {
      const buyerWithoutBHK = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website'
      };

      expect(() => buyerSchema.parse(buyerWithoutBHK)).toThrow();
    });

    test('should validate budget constraints', () => {
      const invalidBudget = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMin: 7000000,
        budgetMax: 5000000, // Max less than min
        timeline: '0-3m',
        source: 'Website'
      };

      expect(() => buyerSchema.parse(invalidBudget)).toThrow();
    });

    test('should validate phone number format', () => {
      const invalidPhone = {
        fullName: 'John Doe',
        phone: '123', // Too short
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website'
      };

      expect(() => buyerSchema.parse(invalidPhone)).toThrow();
    });

    test('should allow optional fields to be empty', () => {
      const minimalBuyer = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website'
      };

      expect(() => buyerSchema.parse(minimalBuyer)).not.toThrow();
    });
  });

  describe('csvRowSchema', () => {
    test('should validate CSV row data', () => {
      const csvRow = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: '5000000',
        budgetMax: '7000000',
        timeline: '0-3m',
        source: 'Website',
        notes: 'Test notes',
        tags: 'urgent,family',
        status: 'New'
      };

      expect(() => csvRowSchema.parse(csvRow)).not.toThrow();
    });

    test('should transform string budgets to numbers', () => {
      const csvRow = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        budgetMin: '5000000',
        budgetMax: '7000000',
        timeline: '0-3m',
        source: 'Website',
        tags: '',
        status: 'New'
      };

      const result = csvRowSchema.parse(csvRow);
      expect(typeof result.budgetMin).toBe('number');
      expect(typeof result.budgetMax).toBe('number');
    });

    test('should transform tags string to array', () => {
      const csvRow = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
        tags: 'urgent, family, premium',
        status: 'New'
      };

      const result = csvRowSchema.parse(csvRow);
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags).toEqual(['urgent', 'family', 'premium']);
    });
  });
});