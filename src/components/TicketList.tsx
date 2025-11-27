'use client';

import { useState, useEffect } from 'react';
import LoadingStates from '@/components/LoadingStates';

interface TicketRecord {
  id: string;
  createdTime: string;
  event: string;
  fields: {
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Payment Method': string;
    'Check Number'?: string;
    'Amount Paid': number;
    'Ticket Quantity'?: number;
    'Christmas Member Tickets'?: number;
    'Christmas Non-Member Tickets'?: number;
    'NYE Member Tickets'?: number;
    'NYE Non-Member Tickets'?: number;
    'Staff Initials': string;
  };
}

type EventFilter = 'christmas' | 'nye' | 'all';

interface TicketListProps {
  autoRefresh?: boolean;
}

export function TicketList({ autoRefresh = false }: TicketListProps) {
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [records, setRecords] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/tickets/list?event=${eventFilter}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch tickets');
      }
      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [eventFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatTicketQuantity = (record: TicketRecord) => {
    const fields = record.fields;
    const parts: string[] = [];
    
    if (fields['Christmas Member Tickets']) {
      parts.push(`${fields['Christmas Member Tickets']} Xmas Member`);
    }
    if (fields['Christmas Non-Member Tickets']) {
      parts.push(`${fields['Christmas Non-Member Tickets']} Xmas Non-Member`);
    }
    if (fields['NYE Member Tickets']) {
      parts.push(`${fields['NYE Member Tickets']} NYE Member`);
    }
    if (fields['NYE Non-Member Tickets']) {
      parts.push(`${fields['NYE Non-Member Tickets']} NYE Non-Member`);
    }
    
    return parts.length > 0 ? parts.join(', ') : (fields['Ticket Quantity'] || 0).toString();
  };

  const totalAmount = records.reduce((sum, record) => sum + record.fields['Amount Paid'], 0);
  const totalTickets = records.reduce((sum, record) => sum + (record.fields['Ticket Quantity'] || 0), 0);
  const totalTransactions = records.length;

  return (
    <div style={{ marginTop: 'var(--space-6)' }}>
      
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
          Recent Ticket Sales
        </h2>
        <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
          Scroll down to confirm your entry
        </p>
      </div>

      {/* Event Filter Tabs */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setEventFilter('all')}
            className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
              eventFilter === 'all' 
                ? 'bg-[#427d78] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setEventFilter('christmas')}
            className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
              eventFilter === 'christmas' 
                ? 'bg-[#427d78] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Christmas Drive-Thru
          </button>
          <button
            onClick={() => setEventFilter('nye')}
            className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
              eventFilter === 'nye' 
                ? 'bg-[#427d78] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            NYE Gala Dance
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && !error && (
        <div className="card" style={{ marginBottom: 'var(--space-4)', background: '#427d78' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', textAlign: 'center' }}>
            <div>
              <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: 'var(--space-1)' }}>
                Total Tickets
              </div>
              <div className="text-white font-['Jost',sans-serif] font-bold text-3xl">
                {totalTickets}
              </div>
            </div>
            <div>
              <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: 'var(--space-1)' }}>
                Total Transactions
              </div>
              <div className="text-white font-['Jost',sans-serif] font-bold text-3xl">
                {totalTransactions}
              </div>
            </div>
            <div>
              <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: 'var(--space-1)' }}>
                Total Amount
              </div>
              <div className="text-white font-['Jost',sans-serif] font-bold text-3xl">
                ${totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border-2 border-red-400">
          <p className="text-red-900 font-['Jost',sans-serif] font-bold text-center">
            ✗ {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <LoadingStates size="lg" />
          <p className="text-lg text-gray-600 font-['Bitter',serif] font-medium" style={{ marginTop: 'var(--space-3)' }}>
            Loading tickets...
          </p>
        </div>
      )}

      {/* Tickets Table */}
      {!loading && !error && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th className="font-['Jost',sans-serif] font-bold text-left text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Date/Time</th>
                  {eventFilter === 'all' && (
                    <th className="font-['Jost',sans-serif] font-bold text-left text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Event</th>
                  )}
                  <th className="font-['Jost',sans-serif] font-bold text-left text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Customer Name</th>
                  <th className="font-['Jost',sans-serif] font-bold text-left text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Email</th>
                  <th className="font-['Jost',sans-serif] font-bold text-left text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Phone</th>
                  <th className="font-['Jost',sans-serif] font-bold text-left text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Payment</th>
                  <th className="font-['Jost',sans-serif] font-bold text-left text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Tickets</th>
                  <th className="font-['Jost',sans-serif] font-bold text-right text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Amount</th>
                  <th className="font-['Jost',sans-serif] font-bold text-left text-[#427d78]" style={{ padding: 'var(--space-3)' }}>Staff</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={eventFilter === 'all' ? 9 : 8} className="text-center text-gray-500 font-['Bitter',serif]" style={{ padding: 'var(--space-4)' }}>
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td className="font-['Bitter',serif] text-sm" style={{ padding: 'var(--space-3)', whiteSpace: 'nowrap' }}>
                        {formatDate(record.createdTime)}
                      </td>
                      {eventFilter === 'all' && (
                        <td className="font-['Bitter',serif] text-sm font-medium" style={{ padding: 'var(--space-3)' }}>
                          {record.event}
                        </td>
                      )}
                      <td className="font-['Bitter',serif]" style={{ padding: 'var(--space-3)' }}>
                        {record.fields['First Name']} {record.fields['Last Name']}
                      </td>
                      <td className="font-['Bitter',serif] text-sm" style={{ padding: 'var(--space-3)' }}>
                        {record.fields['Email']}
                      </td>
                      <td className="font-['Bitter',serif] text-sm" style={{ padding: 'var(--space-3)', whiteSpace: 'nowrap' }}>
                        {record.fields['Phone']}
                      </td>
                      <td className="font-['Bitter',serif] text-sm" style={{ padding: 'var(--space-3)' }}>
                        {record.fields['Payment Method']}
                        {record.fields['Check Number'] && ` #${record.fields['Check Number']}`}
                      </td>
                      <td className="font-['Bitter',serif] text-sm" style={{ padding: 'var(--space-3)' }}>
                        {formatTicketQuantity(record)}
                      </td>
                      <td className="font-['Jost',sans-serif] font-bold text-right" style={{ padding: 'var(--space-3)' }}>
                        ${record.fields['Amount Paid'].toFixed(2)}
                      </td>
                      <td className="font-['Bitter',serif] text-sm" style={{ padding: 'var(--space-3)' }}>
                        {record.fields['Staff Initials']}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
