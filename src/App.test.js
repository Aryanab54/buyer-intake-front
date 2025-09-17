import { render } from '@testing-library/react';
import { buyerSchema } from './schemas/buyerSchema';

// Simple integration test for the validation schema
test('buyer schema validation works correctly', () => {
  const validBuyer = {
    fullName: 'John Doe',
    phone: '9876543210',
    city: 'Chandigarh',
    propertyType: 'Plot',
    purpose: 'Buy',
    timeline: '0-3m',
    source: 'Website'
  };

  expect(() => buyerSchema.parse(validBuyer)).not.toThrow();
});

test('buyer schema requires BHK for apartments', () => {
  const apartmentWithoutBHK = {
    fullName: 'John Doe',
    phone: '9876543210',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    purpose: 'Buy',
    timeline: '0-3m',
    source: 'Website'
  };

  expect(() => buyerSchema.parse(apartmentWithoutBHK)).toThrow();
});
