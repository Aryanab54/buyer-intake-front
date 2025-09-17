import { z } from 'zod';

export const CITIES = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'];
export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'];
export const BHK_OPTIONS = ['1', '2', '3', '4', 'Studio'];
export const PURPOSES = ['Buy', 'Rent'];
export const TIMELINES = ['0-3m', '3-6m', '>6m', 'Exploring'];
export const SOURCES = ['Website', 'Referral', 'Walk-in', 'Call', 'Other'];
export const STATUSES = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'];

const phoneRegex = /^\d{10,15}$/;

export const buyerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters'),
  
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(phoneRegex, 'Phone must be 10-15 digits')
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone must not exceed 15 digits'),
  
  city: z.enum(CITIES, {
    errorMap: () => ({ message: 'Please select a valid city' })
  }),
  
  propertyType: z.enum(PROPERTY_TYPES, {
    errorMap: () => ({ message: 'Please select a valid property type' })
  }),
  
  bhk: z.enum(BHK_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid BHK option' })
  }).optional(),
  
  purpose: z.enum(PURPOSES, {
    errorMap: () => ({ message: 'Please select a valid purpose' })
  }),
  
  budgetMin: z.number()
    .int('Budget must be a whole number')
    .min(0, 'Budget cannot be negative')
    .optional(),
  
  budgetMax: z.number()
    .int('Budget must be a whole number')
    .min(0, 'Budget cannot be negative')
    .optional(),
  
  timeline: z.enum(TIMELINES, {
    errorMap: () => ({ message: 'Please select a valid timeline' })
  }),
  
  source: z.enum(SOURCES, {
    errorMap: () => ({ message: 'Please select a valid source' })
  }),
  
  status: z.enum(STATUSES, {
    errorMap: () => ({ message: 'Please select a valid status' })
  }).default('New'),
  
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  
  tags: z.array(z.string()).optional().default([])
}).refine((data) => {
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa properties',
  path: ['bhk']
}).refine((data) => {
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax']
});

export const csvRowSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex),
  city: z.enum(CITIES),
  propertyType: z.enum(PROPERTY_TYPES),
  bhk: z.enum(BHK_OPTIONS).optional().or(z.literal('')),
  purpose: z.enum(PURPOSES),
  budgetMin: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  budgetMax: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  timeline: z.enum(TIMELINES),
  source: z.enum(SOURCES),
  notes: z.string().max(1000).optional().or(z.literal('')),
  tags: z.string().transform(val => val ? val.split(',').map(t => t.trim()) : []).optional(),
  status: z.enum(STATUSES).default('New')
}).refine((data) => {
  if (['Apartment', 'Villa'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}).refine((data) => {
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
});