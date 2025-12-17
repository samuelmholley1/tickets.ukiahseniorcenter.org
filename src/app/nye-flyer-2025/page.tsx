'use client';

import { useRef, useEffect } from 'react';

export default function NYEFlyer2025() {
  const flyerRef = useRef<HTMLDivElement>(null);
  
  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Allura&display=swap';
    link.rel = 'stylesheet';
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
    
    // Add print styles - FIXED
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: 3.5in 2in;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
        #flyer-to-print {
          width: 3.5in !important;
          height: 2in !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          page-break-after: avoid !important;
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
            Flyer is 3.5&quot; × 2&quot; (business card size) - Elegant design with Allura script, optimized for seniors
          </p>
        </div>

      {/* Flyer Container */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div 
          id="flyer-to-print"
          ref={flyerRef}
          style={{
            width: '3.5in',
            height: '2in',
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            fontFamily: 'Arial, sans-serif',
            padding: '0.18in',
            border: '2px solid #1a237e',
            boxSizing: 'border-box'
          }}
        >
          
          {/* Subtle Fireworks Accents */}
          <div style={{ 
            position: 'absolute', 
            top: '-8px', 
            left: '-8px', 
            fontSize: '40px',
            opacity: '0.1',
            color: '#d4af37',
            transform: 'rotate(-15deg)'
          }}>✨</div>
          <div style={{ 
            position: 'absolute', 
            bottom: '-4px', 
            right: '-4px', 
            fontSize: '36px',
            opacity: '0.12',
            color: '#d4af37',
            transform: 'rotate(25deg)',
            zIndex: 0
          }}>✨</div>
          
          {/* Content - ULTRA COMPACT */}
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            
            {/* Header - ALLURA */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: '"Allura", cursive',
                fontSize: '32px',
                fontWeight: '400',
                margin: '0',
                color: '#1a237e',
                lineHeight: '1'
              }}>
                New Year&apos;s Eve Gala
              </div>
            </div>

            {/* Date & Venue - CRITICAL INFO */}
            <div style={{ textAlign: 'center', marginTop: '-4px' }}>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '15px',
                fontWeight: 'bold',
                margin: '0 0 6px 0',
                color: '#d4af37',
                lineHeight: '1',
                letterSpacing: '0.3px'
              }}>
                WED DEC 31
              </p>
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                margin: '0 0 4px 0',
                color: '#1a237e',
                lineHeight: '1.25'
              }}>
                6:00 PM · Bartlett Event Center
              </p>
              
              {/* PRICING BAR */}
              <div style={{
                background: '#d4af37',
                padding: '8px 6px',
                margin: '10px -4px 0 -4px',
                borderTop: '2px solid #1a237e',
                borderBottom: '2px solid #1a237e'
              }}>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '16px',
                  fontWeight: '800',
                  margin: '0',
                  color: '#1a237e',
                  lineHeight: '1'
                }}>
                  $45 · $35 Members
                </p>
              </div>
            </div>

            {/* Bottom - ESSENTIALS WITH HIERARCHY */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '8px',
              alignItems: 'end'
            }}>
              <div>
                <p style={{
                  fontFamily: '"Allura", cursive',
                  fontSize: '10px',
                  margin: '0 0 1px 0',
                  color: '#1a237e',
                  opacity: '0.7',
                  lineHeight: '1'
                }}>
                  Celebrate
                </p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '9px',
                  fontWeight: '600',
                  margin: '0 0 2px 0',
                  color: '#1a237e',
                  lineHeight: '1.15'
                }}>
                  🎶 Beatz Werkin Band
                </p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '7px',
                  fontWeight: '500',
                  margin: '0 0 3px 0',
                  color: '#333',
                  lineHeight: '1.2'
                }}>
                  🍽️ Apps & Desserts Included
                </p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '7px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#1a237e',
                  lineHeight: '1.2'
                }}>
                  tickets.ukiahseniorcenter.org
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '7px',
                  fontWeight: '600',
                  margin: '0 0 2px 0',
                  color: '#1a237e',
                  lineHeight: '1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  Scan for Tickets
                </p>
                <div style={{
                  border: '2px solid #1a237e',
                  padding: '2px',
                  background: '#fff',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tickets.ukiahseniorcenter.org"
                    alt="Scan QR Code"
                    style={{
                      width: '52px',
                      height: '52px',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
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
