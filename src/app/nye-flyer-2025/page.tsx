'use client';

import { useRef, useEffect } from 'react';

export default function NYEFlyer2025() {
  const flyerRef = useRef<HTMLDivElement>(null);
  
  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Allura&display=swap';
    link.rel = 'stylesheet';
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
    
    // Add print styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        .no-print {
          display: none !important;
        }
        #flyer-to-print {
          position: absolute;
          left: 0;
          top: 0;
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const downloadAsPNG = () => {
    alert('To save as PNG: Right-click the flyer and select "Save image as..." or use your browser\'s print function and "Save as PDF"');
  };

  const printFlyer = () => {
    window.print();
  };

  return (
    <div className="no-print" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
        {/* Buttons */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button 
            onClick={printFlyer}
            style={{
              background: '#7c3aed',
              color: 'white',
              padding: '14px 28px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              marginRight: '12px'
            }}
          >
            🖨️ Print Flyer
          </button>
          <button 
            onClick={downloadAsPNG}
            style={{
              background: '#427d78',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'Jost, sans-serif'
            }}
          >
            💾 Save as PNG
          </button>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            Flyer is quarter-page size (4.25&quot; × 5.5&quot;) - optimized for senior readability
          </p>
        </div>

      {/* Flyer Container */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div 
          id="flyer-to-print"
          ref={flyerRef}
          style={{
            width: '4.25in',
            height: '5.5in',
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            fontFamily: 'Arial, sans-serif',
            padding: '0.25in',
            border: '3px solid #1a237e'
          }}
        >
          
          {/* Content */}
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <h1 style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0 0 4px 0',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#1a237e',
                lineHeight: '1'
              }}>
                NEW YEAR&apos;S EVE<br/>GALA DANCE
              </h1>
              <div style={{
                width: '100px',
                height: '3px',
                background: '#d4af37',
                margin: '8px auto'
              }} />
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '11px',
                fontWeight: '500',
                margin: 0,
                color: '#333'
              }}>
                Bartlett Event Center
              </p>
            </div>

            {/* Date & Time - Most Important */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 6px 0',
                color: '#d4af37'
              }}>
                Wednesday, Dec 31
              </p>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0',
                color: '#1a237e',
                lineHeight: '1.4'
              }}>
                Doors 6PM · Dance 7-10PM<br/>
                <span style={{ fontSize: '12px' }}>Ball Drops Midnight (NY)</span>
              </p>
            </div>

            {/* Pricing - Big and Bold */}
            <div style={{
              textAlign: 'center',
              background: '#d4af37',
              padding: '12px',
              margin: '0 -10px 12px -10px',
              borderTop: '2px solid #1a237e',
              borderBottom: '2px solid #1a237e'
            }}>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '22px',
                fontWeight: 'bold',
                margin: '0',
                color: '#1a237e'
              }}>
                $45 • Members $35
              </p>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '10px',
                fontWeight: '500',
                margin: '4px 0 0 0',
                color: '#1a237e'
              }}>
                Appetizers & Desserts Included
              </p>
            </div>

            {/* Details */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '13px',
                fontWeight: 'bold',
                margin: '0 0 4px 0',
                color: '#1a237e'
              }}>
                🎵 Beatz Werkin Band
              </p>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '10px',
                fontWeight: '500',
                margin: '0',
                color: '#333',
                lineHeight: '1.4'
              }}>
                Flashy Attire • Beer & Wine<br/>
                Raffle Drawings
              </p>
            </div>

            {/* Tickets with QR */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '12px',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '2px solid #d4af37'
            }}>
              <div>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  margin: '0 0 4px 0',
                  color: '#1a237e',
                  textTransform: 'uppercase'
                }}>
                  Get Tickets:
                </p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '9px',
                  fontWeight: '500',
                  lineHeight: '1.5',
                  margin: 0,
                  color: '#333'
                }}>
                  tickets.ukiahseniorcenter.org<br/>
                  Ukiah Senior Center<br/>
                  Bartlett Event Center<br/>
                  Mendocino Book Co
                </p>
              </div>
              <div style={{
                border: '2px solid #1a237e',
                padding: '4px',
                background: '#fff'
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://tickets.ukiahseniorcenter.org"
                  alt="QR Code"
                  style={{
                    width: '70px',
                    height: '70px',
                    display: 'block'
                  }}
                />
              </div>
            </div>

            {/* Sponsors */}
            <div style={{
              textAlign: 'center',
              fontSize: '7px',
              fontFamily: '"Montserrat", sans-serif',
              color: '#666',
              marginTop: '8px'
            }}>
              <p style={{ margin: 0, lineHeight: '1.3' }}>
                Mendocino Book Co • Rain Forest Fantasy • Selzer Realty
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Below */}
      <div className="no-print" style={{
        maxWidth: '4.25in',
        margin: '30px auto',
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1a237e' }}>📋 Instructions:</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#333' }}>
          <li><strong>To Print:</strong> Click the Print button above - prints quarter-page size (4.25&quot; × 5.5&quot;)</li>
          <li><strong>To Save as PNG:</strong> Right-click the flyer and select &quot;Save image as...&quot;</li>
          <li><strong>Senior-Optimized:</strong> Large text, high contrast, festive colors</li>
          <li><strong>Professional Printing:</strong> Use browser Print → Save as PDF for print shops</li>
        </ol>
      </div>
    </div>
  );
}
