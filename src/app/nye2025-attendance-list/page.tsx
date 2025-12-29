'use client';

import { useState, useEffect } from 'react';
import LoadingStates from '@/components/LoadingStates';

interface AttendeeRecord {
  id: string;
  fields: {
    'First Name': string;
    'Last Name': string;
    'Email'?: string;
    'Phone'?: string;
    'Ticket Quantity'?: number;
  };
}

export default function NYEAttendanceList() {
  const [records, setRecords] = useState<AttendeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/nye-attendance');
      if (!response.ok) {
        throw new Error('Failed to fetch NYE attendance data');
      }
      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Sort attendees by last name, then first name
  const sortedRecords = [...records].sort((a, b) => {
    const lastNameCompare = (a.fields['Last Name'] || '').localeCompare(b.fields['Last Name'] || '');
    if (lastNameCompare !== 0) return lastNameCompare;
    return (a.fields['First Name'] || '').localeCompare(b.fields['First Name'] || '');
  });

  // Calculate totals
  const totalTickets = records.reduce((sum, record) => sum + (record.fields['Ticket Quantity'] || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="attendance-list-container">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .attendance-list-container {
            padding: 20px;
          }
          .attendance-table {
            page-break-inside: avoid;
          }
          .attendance-table th,
          .attendance-table td {
            page-break-inside: avoid;
          }
        }

        .attendance-list-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Bitter', serif;
        }

        .attendance-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #427d78;
          padding-bottom: 20px;
        }

        .attendance-header h1 {
          font-family: 'Jost', sans-serif;
          font-size: 2.5rem;
          color: #427d78;
          margin: 0 0 10px 0;
          font-weight: 700;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #666;
          font-family: 'Jost', sans-serif;
          font-weight: 600;
        }

        .summary-box {
          border: 2px solid #000;
          padding: 15px;
          margin-bottom: 20px;
          text-align: center;
        }

        .summary-box h2 {
          font-family: 'Jost', sans-serif;
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .summary-box .stat {
          font-size: 2rem;
          font-weight: 700;
        }

        .attendance-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .attendance-table th {
          background: #427d78;
          color: white;
          padding: 12px;
          text-align: left;
          font-family: 'Jost', sans-serif;
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #2d5653;
        }

        .attendance-table td {
          padding: 10px 12px;
          border: 1px solid #ddd;
          font-size: 0.875rem;
        }

        .attendance-table tbody tr:hover {
          background: #f8f9fa;
        }

        .checkbox-cell {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .checkbox-item {
          width: 18px;
          height: 18px;
          border: 2px solid #427d78;
          border-radius: 3px;
          background: white;
        }

        .print-button {
          background: #427d78;
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 1rem;
          font-family: 'Jost', sans-serif;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .print-button:hover {
          background: #5eb3a1;
        }

        .error-message {
          background: #fee;
          border: 2px solid #fcc;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          color: #c00;
          font-family: 'Jost', sans-serif;
          font-weight: 700;
        }

        .loading-container {
          text-align: center;
          padding: 60px 20px;
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print" style={{ marginBottom: '20px' }}>
        <button onClick={handlePrint} className="print-button">
          🖨️ Print Attendance List
        </button>
      </div>

      {/* Header */}
      <div className="attendance-header">
        <h1>New Year&apos;s Eve Gala Dance 2025</h1>
        <div className="subtitle">Attendance List</div>
        <div style={{ marginTop: '10px', fontSize: '0.875rem', color: '#999' }}>
          Generated: {new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Summary Box */}
      {!loading && !error && (
        <div className="summary-box">
          <h2>TOTAL GUESTS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '10px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '5px' }}>
                Reservations
              </div>
              <div className="stat">{records.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '5px' }}>
                Guests
              </div>
              <div className="stat">{totalTickets}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ✗ {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <LoadingStates size="lg" />
          <p style={{ marginTop: '20px', color: '#666', fontFamily: 'Bitter, serif' }}>
            Loading attendance data...
          </p>
        </div>
      )}

      {/* Attendance Table */}
      {!loading && !error && (
        <table className="attendance-table">
          <thead>
            <tr>
              <th style={{ width: '5%', textAlign: 'center' }}>Check In</th>
              <th style={{ width: '15%' }}>Last Name</th>
              <th style={{ width: '15%' }}>First Name</th>
              <th style={{ width: '20%' }}>Email</th>
              <th style={{ width: '13%' }}>Phone</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Guests</th>
              <th style={{ width: '27%' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No attendees found
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => {
                const ticketCount = record.fields['Ticket Quantity'] || 0;
                const checkboxes = Array.from({ length: ticketCount }, (_, i) => i);
                const email = record.fields['Email'] || '—';
                const phone = record.fields['Phone'] || '—';

                return (
                  <tr key={record.id}>
                    <td>
                      <div className="checkbox-cell">
                        {checkboxes.map((i) => (
                          <div key={i} className="checkbox-item" />
                        ))}
                      </div>
                    </td>
                    <td>{record.fields['Last Name'] || '—'}</td>
                    <td>{record.fields['First Name'] || '—'}</td>
                    <td style={{ fontSize: '0.75rem' }}>{email}</td>
                    <td>{phone}</td>
                    <td style={{ textAlign: 'center' }}>{ticketCount || 0}</td>
                    <td>—</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
