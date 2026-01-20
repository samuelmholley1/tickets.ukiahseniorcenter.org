'use client';

import { useState } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';

export default function BookstoreValentinesPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/tickets/bookstore-valentines-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mendocino-Book-Company-Valentines-Tickets-${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)', minHeight: '80vh' }}>
        <div className="container">
          <div style={{ maxWidth: '600px', marginInline: 'auto', textAlign: 'center' }}>
            
            <h1 className="font-['Jost',sans-serif] font-bold text-pink-600" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              💕 Valentine&apos;s Day Bookstore Tickets
            </h1>
            
            <p className="font-['Bitter',serif] text-[#666]" style={{ marginBottom: 'var(--space-4)', lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Generate bulk Valentine&apos;s Day Dance tickets for Mendocino Book Company. This will create a PDF with:
            </p>

            <div className="bg-white rounded-lg border-2 border-pink-500" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', textAlign: 'left' }}>
              <ul className="font-['Bitter',serif]" style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#db2777', fontWeight: 'bold' }}>💕</span>
                  20 Valentine&apos;s Day Dance tickets
                </li>
              </ul>
              <p className="font-['Bitter',serif] text-[#666]" style={{ marginTop: 'var(--space-2)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                All tickets will be labeled &quot;Mendocino Book Company #1&quot; through &quot;#20&quot;.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg border border-pink-200" style={{ padding: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <p className="font-['Bitter',serif] text-pink-800" style={{ fontSize: '0.9rem', margin: 0 }}>
                <strong>Event:</strong> Valentine&apos;s Day Dance<br />
                <strong>Date:</strong> Saturday, February 14, 2026<br />
                <strong>Time:</strong> Doors 6pm, Dance 7-10pm<br />
                <strong>Price:</strong> Members $30 / Non-Members $45
              </p>
            </div>

            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="font-['Jost',sans-serif]"
              style={{
                backgroundColor: isGenerating ? '#9ca3af' : '#db2777',
                color: 'white',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = '#be185d';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = '#db2777';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
              }}
            >
              {isGenerating ? '⏳ Generating PDF...' : '📄 Generate Tickets PDF'}
            </button>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg" style={{ padding: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <p className="font-['Bitter',serif] text-red-700" style={{ fontSize: '0.875rem' }}>
                  ❌ {error}
                </p>
              </div>
            )}

            {isGenerating && (
              <p className="font-['Bitter',serif] text-[#666]" style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem' }}>
                This may take a few moments to generate 20 tickets...
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
