'use client';

import { useState, useEffect } from 'react';
import LoadingStates from '@/components/LoadingStates';

interface AttendeeRecord {
  id: string;
  fields: {
    'First Name': string;
    'Last Name': string;
    'Ticket Quantity'?: number;
    'Vegetarian Meals'?: number;
  };
}

export default function ChristmasAttendanceList() {
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
      const response = await fetch('/api/christmas-attendance');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch attendance data');
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

  // Sort attendees by last name, then first name
  // Separate Heather Haydon for delivery list
  const heatherRecords = records.filter(r => 
    r.fields['Last Name']?.toLowerCase() === 'haydon' && 
    r.fields['First Name']?.toLowerCase() === 'heather'
  );
  
  const regularRecords = records.filter(r => 
    !(r.fields['Last Name']?.toLowerCase() === 'haydon' && 
      r.fields['First Name']?.toLowerCase() === 'heather')
  );

  const sortedRecords = [...regularRecords].sort((a, b) => {
    const lastNameCompare = (a.fields['Last Name'] || '').localeCompare(b.fields['Last Name'] || '');
    if (lastNameCompare !== 0) return lastNameCompare;
    return (a.fields['First Name'] || '').localeCompare(b.fields['First Name'] || '');
  });

  const totalMeals = records.reduce((sum, record) => sum + (record.fields['Ticket Quantity'] || 0), 0);
  const totalVegetarian = records.reduce((sum, record) => sum + (record.fields['Vegetarian Meals'] || 0), 0);
  const totalRegular = totalMeals - totalVegetarian;

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
            border: 1px solid #333;
            padding: 8px;
          }
          .attendance-header {
            margin-bottom: 20px;
          }
        }

        @media screen {
          .attendance-list-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
            min-height: 100vh;
          }
        }

        .attendance-header {
          text-align: center;
          margin-bottom: 30px;
          page-break-after: avoid;
          page-break-inside: avoid;
        }

        .attendance-header h1 {
          font-family: 'Jost', sans-serif;
          font-size: 2.5rem;
          color: #427d78;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .attendance-header .subtitle {
          font-family: 'Bitter', serif;
          font-size: 1.125rem;
          color: #666;
        }

        .summary-stats {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 20px 0 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          page-break-after: avoid;
          page-break-inside: avoid;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-family: 'Bitter', serif;
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 5px;
        }

        .stat-value {
          font-family: 'Jost', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #427d78;
        }

        .attendance-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          page-break-before: avoid;
        }

        .attendance-table th {
          background: #427d78;
          color: white;
          font-family: 'Jost', sans-serif;
          font-weight: 700;
          padding: 12px 8px;
          text-align: left;
          border: 1px solid #2d5753;
        }

        .attendance-table td {
          padding: 10px 8px;
          border: 1px solid #dee2e6;
          font-family: 'Bitter', serif;
          vertical-align: top;
        }

        .checkbox-cell {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: flex-start;
        }

        .checkbox-item {
          width: 18px;
          height: 18px;
          border: 2px solid #427d78;
          border-radius: 3px;
          background: white;
        }

        @media print {
          .checkbox-item {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        .attendance-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }

        .attendance-table tbody tr:hover {
          background: #e9ecef;
        }

        .print-button {
          display: inline-block;
          background: #427d78;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: 'Jost', sans-serif;
          font-weight: 700;
          cursor: pointer;
          border: none;
          font-size: 1rem;
          margin-bottom: 20px;
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
        <h1>Christmas Drive-Thru 2025</h1>
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

      {/* Summary Statistics */}
      {!loading && !error && (
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-label">Total Attendees</div>
            <div className="stat-value">{records.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total Meals</div>
            <div className="stat-value">{totalMeals}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Prime Rib</div>
            <div className="stat-value">{totalRegular}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Vegetarian (Eggplant)</div>
            <div className="stat-value">{totalVegetarian}</div>
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
              <th style={{ width: '8%', textAlign: 'center' }}>Check In</th>
              <th style={{ width: '23%' }}>Last Name</th>
              <th style={{ width: '23%' }}>First Name</th>
              <th style={{ width: '8%', textAlign: 'center' }}>Tickets</th>
              <th style={{ width: '38%' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No attendees found
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => {
                const notes = [];
                
                // Add vegetarian note if applicable
                const vegCount = record.fields['Vegetarian Meals'] || 0;
                if (vegCount > 0) {
                  notes.push(`Vegetarian: ${vegCount}`);
                }
                
                // Hard-coded special cases
                const firstName = record.fields['First Name'] || '';
                const lastName = record.fields['Last Name'] || '';
                if (lastName.toLowerCase() === 'snyder' && firstName.toLowerCase() === 'mary') {
                  notes.push('Pumpkin Pie');
                }

                const notesText = notes.length > 0 ? notes.join(' | ') : '—';

                const ticketCount = record.fields['Ticket Quantity'] || 0;
                const checkboxes = Array.from({ length: ticketCount }, (_, i) => i);

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
                    <td style={{ textAlign: 'center' }}>{ticketCount || 0}</td>
                    <td>{notesText}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* Separate Delivery List for Heather Haydon */}
      {!loading && !error && heatherRecords.length > 0 && (
        <>
          <div style={{ 
            marginTop: '60px', 
            paddingTop: '40px', 
            borderTop: '3px solid #427d78',
            pageBreakBefore: 'always' 
          }}>
            <div className="attendance-header">
              <h2 style={{ 
                fontFamily: 'Jost, sans-serif', 
                fontSize: '2rem', 
                color: '#427d78', 
                marginBottom: '10px',
                fontWeight: 700 
              }}>
                Delivery List
              </h2>
            </div>

            <table className="attendance-table" style={{ marginTop: '30px' }}>
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>Check In</th>
                  <th style={{ width: '23%' }}>Last Name</th>
                  <th style={{ width: '23%' }}>First Name</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Tickets</th>
                  <th style={{ width: '38%' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {heatherRecords.map((record) => {
                  const notes = [];
                  
                  const vegCount = record.fields['Vegetarian Meals'] || 0;
                  if (vegCount > 0) {
                    notes.push(`Vegetarian: ${vegCount}`);
                  }

                  const notesText = notes.length > 0 ? notes.join(' | ') : '—';
                  const ticketCount = record.fields['Ticket Quantity'] || 0;
                  const checkboxes = Array.from({ length: ticketCount }, (_, i) => i);

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
                      <td style={{ textAlign: 'center' }}>{ticketCount || 0}</td>
                      <td>{notesText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
