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
    'Purchase Date'?: string;
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

export function TicketList() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* Zeffy Import Notice */}
        <div style={{ 
          marginTop: 'var(--space-2)', 
          padding: '4px 12px',
          background: '#d4f4dd',
          border: '1px solid #4ade80',
          borderRadius: '4px',
          display: 'inline-block',
          fontSize: '12px'
        }}>
          <span className="font-['Jost',sans-serif] text-[#15803d]">💳 Last Zeffy Import: 12/23/25 at 7:35 AM</span>
        </div>
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
                    padding: 'var(--space-4)', 
                    background: 'white', 
                    borderRadius: '12px',
                    border: '1px solid #dee2e6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Header: Customer Name + Total */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-3)',
                    paddingBottom: 'var(--space-3)',
                    borderBottom: '2px solid #f8f9fa',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div className="font-['Jost',sans-serif] font-bold text-xl text-gray-900">
                        {record.fields['First Name']} {record.fields['Last Name']}
                      </div>
                      {eventFilter === 'all' && (
                        <div className="font-['Jost',sans-serif] text-sm font-bold" style={{ marginTop: '2px', color: record.event === 'Christmas Drive-Thru' ? '#427d78' : '#7c3aed' }}>
                          {record.event}
                        </div>
                      )}
                      <div className="font-['Bitter',serif] text-xs text-gray-500" style={{ marginTop: '4px' }}>
                        {formatDate(record.fields['Purchase Date'] || record.createdTime)} • Processed by: {record.fields['Staff Initials']?.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/tickets/pdf', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                firstName: record.fields['First Name'],
                                lastName: record.fields['Last Name'],
                                christmasMember: record.fields['Christmas Member Tickets'] || 0,
                                christmasNonMember: record.fields['Christmas Non-Member Tickets'] || 0,
                                nyeMember: record.fields['NYE Member Tickets'] || 0,
                                nyeNonMember: record.fields['NYE Non-Member Tickets'] || 0
                              })
                            });
                            
                            if (!response.ok) throw new Error('Failed to generate PDF');
                            
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                          } catch (error) {
                            console.error('Error generating PDF:', error);
                            alert('Failed to generate PDF tickets');
                          }
                        }}
                        className="bg-[#427d78] hover:bg-[#5eb3a1] text-white font-['Jost',sans-serif] font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        🎟️ Print Tickets
                      </button>
                      <div className="font-['Jost',sans-serif] font-bold text-2xl text-[#427d78]">
                        ${record.fields['Amount Paid'].toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Tickets Section - Most Important */}
                  <div style={{ 
                    marginBottom: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div className="font-['Jost',sans-serif] font-bold text-sm text-gray-700" style={{ marginBottom: '6px' }}>
                      Tickets Purchased
                    </div>
                    <div className="font-['Bitter',serif] text-base text-gray-900">
                      {formatTicketQuantity(record)}
                    </div>
                    {record.fields['Donation Amount'] ? (
                      <div className="font-['Bitter',serif] text-sm text-gray-600" style={{ marginTop: '6px' }}>
                        + ${record.fields['Donation Amount'].toFixed(2)} donation
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Contact & Payment - Secondary Info */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 'var(--space-3)',
                    fontSize: '0.875rem'
                  }}>
                    <div>
                      <div className="font-['Jost',sans-serif] text-xs text-gray-500" style={{ marginBottom: '4px' }}>
                        EMAIL
                      </div>
                      <div className="font-['Bitter',serif] text-gray-700">
                        {record.fields['Email']}
                      </div>
                    </div>
                    <div>
                      <div className="font-['Jost',sans-serif] text-xs text-gray-500" style={{ marginBottom: '4px' }}>
                        PHONE
                      </div>
                      <div className="font-['Bitter',serif] text-gray-700">
                        {record.fields['Phone']}
                      </div>
                    </div>
                    <div>
                      <div className="font-['Jost',sans-serif] text-xs text-gray-500" style={{ marginBottom: '4px' }}>
                        PAYMENT
                      </div>
                      <div className="font-['Bitter',serif] text-gray-700">
                        {record.fields['Payment Method']}
                        {record.fields['Check Number'] && ` #${record.fields['Check Number']}`}
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
