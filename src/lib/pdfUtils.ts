/**
 * Enterprise-grade PDF generation utilities
 * Handles caching, error handling, validation, and monitoring
 */

import { jsPDF } from 'jspdf';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const PDF_CONFIG = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  LOGO_CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const USC_COLORS = {
  TEAL: [66, 125, 120] as [number, number, number],
  PURPLE: [124, 58, 237] as [number, number, number],
  BLACK: [0, 0, 0] as [number, number, number],
  WHITE: [255, 255, 255] as [number, number, number],
  GRAY: [200, 200, 200] as [number, number, number],
} as const;

// ============================================================================
// LOGO CACHING (Thread-safe, async)
// ============================================================================

interface LogoCache {
  base64: string;
  loadedAt: number;
}

let logoCache: LogoCache | null = null;

/**
 * Load and cache the USC logo as base64
 * Uses async file I/O and caching to avoid blocking event loop
 */
export async function getUSCLogo(): Promise<string> {
  const now = Date.now();
  
  // Return cached logo if valid
  if (logoCache && (now - logoCache.loadedAt) < PDF_CONFIG.LOGO_CACHE_TTL_MS) {
    return logoCache.base64;
  }
  
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = await fs.readFile(logoPath);
    const base64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    
    // Update cache
    logoCache = {
      base64,
      loadedAt: now,
    };
    
    console.info('[PDF] Logo loaded and cached', {
      size: logoBuffer.length,
      timestamp: new Date().toISOString(),
    });
    
    return base64;
    
  } catch (error) {
    console.error('[PDF] Failed to load logo:', error);
    
    // Return empty string to allow graceful degradation
    // PDFs will render without logo
    return '';
  }
}

/**
 * Preload logo at server startup for optimal performance
 */
export async function preloadLogo(): Promise<void> {
  await getUSCLogo();
}

// ============================================================================
// PDF VALIDATION
// ============================================================================

export class PDFValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PDFValidationError';
  }
}

/**
 * Validate PDF buffer size
 * @throws PDFValidationError if PDF exceeds size limit
 */
export function validatePDFSize(buffer: Buffer): void {
  const sizeMB = buffer.length / (1024 * 1024);
  
  if (buffer.length > PDF_CONFIG.MAX_SIZE_BYTES) {
    throw new PDFValidationError(
      `PDF too large: ${sizeMB.toFixed(2)}MB (max ${PDF_CONFIG.MAX_SIZE_MB}MB)`,
      'PDF_TOO_LARGE'
    );
  }
  
  // Log size for monitoring
  console.info('[PDF] Size validation passed', {
    sizeMB: sizeMB.toFixed(2),
    sizeBytes: buffer.length,
  });
}

/**
 * Validate input string lengths to prevent rendering issues
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  maxLength: number
): void {
  if (value.length > maxLength) {
    throw new PDFValidationError(
      `${fieldName} too long: ${value.length} chars (max ${maxLength})`,
      'STRING_TOO_LONG'
    );
  }
}

// ============================================================================
// PDF GENERATION UTILITIES
// ============================================================================

export interface PDFMetadata {
  title: string;
  author: string;
  subject?: string;
  creator?: string;
}

/**
 * Create a new jsPDF instance with USC defaults
 */
export function createUSCPDF(metadata: PDFMetadata): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter',
    compress: true, // Enable compression
  });
  
  // Set PDF metadata
  doc.setProperties({
    title: metadata.title,
    author: metadata.author || 'Ukiah Senior Center',
    subject: metadata.subject || metadata.title,
    creator: metadata.creator || 'USC Ticketing System',
  });
  
  return doc;
}

/**
 * Add USC logo to PDF with error handling
 */
export async function addUSCLogo(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<boolean> {
  try {
    const logo = await getUSCLogo();
    
    if (!logo) {
      console.warn('[PDF] Logo not available, skipping');
      return false;
    }
    
    doc.addImage(logo, 'PNG', x, y, width, height);
    return true;
    
  } catch (error) {
    console.error('[PDF] Failed to add logo to document:', error);
    return false;
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export interface PDFError {
  error: string;
  code: string;
  message: string;
  timestamp: string;
  details?: unknown;
}

/**
 * Create standardized error response for PDF generation failures
 */
export function createPDFErrorResponse(
  error: unknown,
  operation: string
): PDFError {
  const timestamp = new Date().toISOString();
  
  // Handle validation errors
  if (error instanceof PDFValidationError) {
    return {
      error: 'Validation failed',
      code: error.code,
      message: error.message,
      timestamp,
    };
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    console.error(`[PDF] ${operation} failed:`, {
      error: error.message,
      stack: error.stack,
      timestamp,
    });
    
    return {
      error: `${operation} failed`,
      code: 'PDF_GENERATION_ERROR',
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'PDF generation failed. Please try again or contact support.',
      timestamp,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
  
  // Handle unknown errors
  console.error(`[PDF] ${operation} failed with unknown error:`, error);
  
  return {
    error: `${operation} failed`,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please contact support.',
    timestamp,
  };
}

// ============================================================================
// MONITORING & TELEMETRY
// ============================================================================

export interface PDFGenerationMetrics {
  operation: string;
  success: boolean;
  durationMs: number;
  sizeBytes?: number;
  itemCount?: number;
  timestamp: string;
}

/**
 * Log PDF generation metrics for monitoring
 */
export function logPDFMetrics(metrics: PDFGenerationMetrics): void {
  const logData = {
    ...metrics,
    sizeMB: metrics.sizeBytes ? (metrics.sizeBytes / (1024 * 1024)).toFixed(2) : undefined,
  };
  
  if (metrics.success) {
    console.info('[PDF] Generation metrics:', logData);
  } else {
    console.warn('[PDF] Generation failed:', logData);
  }
  
  // TODO: Send to monitoring service (DataDog, New Relic, etc.)
  // if (process.env.DATADOG_API_KEY) {
  //   sendToDataDog(logData);
  // }
}

/**
 * Wrapper for PDF generation with automatic metrics logging
 */
export async function withMetrics<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    
    logPDFMetrics({
      operation,
      success: true,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
    
    return result;
    
  } catch (error) {
    logPDFMetrics({
      operation,
      success: false,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
}

// ============================================================================
// LAYOUT UTILITIES (stolen from timesheets repo)
// ============================================================================

export class PDFLayout {
  static readonly POINTS_PER_INCH = 72;
  static readonly POINTS_PER_MM = 2.834645669;
  
  static inchesToPoints(inches: number): number {
    return inches * this.POINTS_PER_INCH;
  }
  
  static mmToPoints(mm: number): number {
    return mm * this.POINTS_PER_MM;
  }
  
  static pointsToInches(points: number): number {
    return points / this.POINTS_PER_INCH;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const pdfConfig = PDF_CONFIG;
