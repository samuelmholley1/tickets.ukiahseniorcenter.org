/**
 * Validation schemas for ticket PDF generation
 * Ensures type safety and prevents invalid data from causing PDF failures
 */

import { z } from 'zod';

// ============================================================================
// TICKET REQUEST VALIDATION
// ============================================================================

export const TicketRequestSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .trim(),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .trim(),
  
  christmasMember: z.number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(20, 'Maximum 20 tickets per type'),
  
  christmasNonMember: z.number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(20, 'Maximum 20 tickets per type'),
  
  nyeMember: z.number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(20, 'Maximum 20 tickets per type'),
  
  nyeNonMember: z.number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(20, 'Maximum 20 tickets per type'),
  
}).refine(
  (data) => {
    const total = 
      data.christmasMember + 
      data.christmasNonMember + 
      data.nyeMember + 
      data.nyeNonMember;
    return total > 0 && total <= 50;
  },
  {
    message: 'Total tickets must be between 1 and 50',
    path: ['total'],
  }
);

export type TicketRequest = z.infer<typeof TicketRequestSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Validate ticket request and return formatted result
 */
export function validateTicketRequest(data: unknown): ValidationResult<TicketRequest> {
  const result = TicketRequestSchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  return {
    success: false,
    errors: result.error.issues.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}
