'use client';

import { useState } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';

export default function BookstorePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/tickets/bookstore-pdf', {
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
      a.download = `Mendocino-Book-Company-Tickets-${new Date().getTime()}.pdf`;
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
            
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Mendocino Book Company Tickets
            </h1>
            
            <p className="font-['Bitter',serif] text-[#666]" style={{ marginBottom: 'var(--space-4)', lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Generate bulk tickets for Mendocino Book Company. This will create a PDF with:
            </p>

            <div className="bg-white rounded-lg border-2 border-[#427d78]" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', textAlign: 'left' }}>
              <ul className="font-['Bitter',serif]" style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#427d78', fontWeight: 'bold' }}>🎄</span>
                  20 Christmas Prime Rib Meal tickets
                </li>
                <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#7c3aed', fontWeight: 'bold' }}>🎉</span>
                  20 New Year&apos;s Eve Gala Dance tickets
                </li>
              </ul>
              <p className="font-['Bitter',serif] text-[#666]" style={{ marginTop: 'var(--space-2)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                All tickets will be labeled &quot;Mendocino Book Company #1&quot; through &quot;#20&quot; for each event.
              </p>
            </div>

            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="font-['Jost',sans-serif]"
              style={{
                backgroundColor: isGenerating ? '#9ca3af' : '#427d78',
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
                  e.currentTarget.style.backgroundColor = '#2d5a56';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = '#427d78';
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
                This may take a few moments to generate 40 tickets...
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
