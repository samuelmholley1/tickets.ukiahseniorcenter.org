'use client';

import { useState, useEffect } from 'react';
import LoadingStates from '@/components/LoadingStates';

interface TicketRecord {
  id: string;
  createdTime: string;
  event: string;
  fields: {
    'Transaction ID'?: string;
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Payment Method': string;
    'Check Number'?: string;
    'Ticket Subtotal'?: number;
    'Donation Amount'?: number;
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
        <div className="card" style={{ padding: 'var(--space-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {records.length === 0 ? (
              <div className="text-center text-gray-500 font-['Bitter',serif]" style={{ padding: 'var(--space-4)' }}>
                No tickets found
              </div>
            ) : (
              records.map((record) => (
                <div 
                  key={record.id} 
                  style={{ 
                    padding: 'var(--space-3)', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #427d78'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Transaction ID</div>
                      <div className="font-['Bitter',serif] text-sm" style={{ fontFamily: 'monospace' }}>
                        {record.fields['Transaction ID'] || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Date/Time</div>
                      <div className="font-['Bitter',serif] text-sm">{formatDate(record.createdTime)}</div>
                    </div>
                    {eventFilter === 'all' && (
                      <div>
                        <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Event</div>
                        <div className="font-['Bitter',serif] text-sm font-medium">{record.event}</div>
                      </div>
                    )}
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Staff</div>
                      <div className="font-['Bitter',serif] text-sm">{record.fields['Staff Initials']}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Customer</div>
                      <div className="font-['Bitter',serif] text-sm">
                        {record.fields['First Name']} {record.fields['Last Name']}
                      </div>
                    </div>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Email</div>
                      <div className="font-['Bitter',serif] text-sm">{record.fields['Email']}</div>
                    </div>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Phone</div>
                      <div className="font-['Bitter',serif] text-sm">{record.fields['Phone']}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2)' }}>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Payment</div>
                      <div className="font-['Bitter',serif] text-sm">
                        {record.fields['Payment Method']}
                        {record.fields['Check Number'] && ` #${record.fields['Check Number']}`}
                      </div>
                    </div>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Tickets</div>
                      <div className="font-['Bitter',serif] text-sm">{formatTicketQuantity(record)}</div>
                    </div>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Donation</div>
                      <div className="font-['Jost',sans-serif] text-sm">
                        {record.fields['Donation Amount'] ? `$${record.fields['Donation Amount'].toFixed(2)}` : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="font-['Jost',sans-serif] font-bold text-xs text-gray-500 uppercase">Total</div>
                      <div className="font-['Jost',sans-serif] font-bold text-lg text-[#427d78]">
                        ${record.fields['Amount Paid'].toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
