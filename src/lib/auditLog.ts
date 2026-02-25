/**
 * Reservation Audit Log — tracks all changes, modifications, and cancellations.
 * Writes to the "Reservation Audit Log" Airtable table.
 *
 * Every mutation (create, modify, cancel) writes an append-only row so there is
 * a complete paper trail of who changed what and when.
 */

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

export type AuditAction = 'Created' | 'Modified' | 'Cancelled' | 'Refunded';
export type AuditRefundMethod = 'Card Punch Restored' | 'Cash' | 'Forfeit' | 'No Refund';

export interface AuditLogEntry {
  action: AuditAction;
  reservationId: string;
  reservationName: string;
  reservationDate?: string; // YYYY-MM-DD
  mealType?: string;
  changedFields?: Record<string, { from: unknown; to: unknown }>; // JSON diff
  previousValues?: string; // Human-readable summary like "Dine In → To Go"
  staff: string;
  refundMethod?: AuditRefundMethod;
  refundAmount?: number;
  paymentMethod?: string;
  amount?: number;
}

/**
 * Write an audit log entry to Airtable. Fire-and-forget — errors are logged but
 * never block the main operation.
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  const tableId = process.env.AIRTABLE_LUNCH_AUDIT_LOG_TABLE_ID;
  if (!tableId || !process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.warn('Audit log table not configured, skipping audit entry');
    return;
  }

  // Build summary (primary field) — short human-readable string
  const summary = buildSummary(entry);

  const fields: Record<string, unknown> = {
    'Summary': summary,
    'Action': entry.action,
    'Reservation Name': entry.reservationName,
    'Reservation ID': entry.reservationId,
    'Staff': entry.staff,
  };

  if (entry.reservationDate) fields['Reservation Date'] = entry.reservationDate;
  if (entry.mealType) fields['Meal Type'] = entry.mealType;
  if (entry.paymentMethod) fields['Payment Method'] = entry.paymentMethod;
  if (entry.amount !== undefined) fields['Amount'] = entry.amount;
  if (entry.refundMethod) fields['Refund Method'] = entry.refundMethod;
  if (entry.refundAmount !== undefined) fields['Refund Amount'] = entry.refundAmount;

  if (entry.changedFields) {
    fields['Changed Fields'] = JSON.stringify(entry.changedFields, null, 2);
  }
  if (entry.previousValues) {
    fields['Previous Values'] = entry.previousValues;
  }

  try {
    const res = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${tableId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Audit log write failed (${res.status}):`, errorText);
    }
  } catch (err) {
    console.error('Audit log write error:', err);
  }
}

function buildSummary(entry: AuditLogEntry): string {
  const name = entry.reservationName;
  const staff = entry.staff;
  const date = entry.reservationDate || '';

  switch (entry.action) {
    case 'Created':
      return `${staff} created ${name} ${entry.mealType || ''} for ${date}`.trim();
    case 'Modified':
      return `${staff} modified ${name}: ${entry.previousValues || 'details changed'}`;
    case 'Cancelled':
      return `${staff} cancelled ${name} (${date}) — ${entry.refundMethod || 'no refund info'}`;
    case 'Refunded':
      return `${staff} refunded ${name} $${(entry.refundAmount || 0).toFixed(2)} via ${entry.refundMethod || '?'}`;
    default:
      return `${staff} ${entry.action} ${name}`;
  }
}
