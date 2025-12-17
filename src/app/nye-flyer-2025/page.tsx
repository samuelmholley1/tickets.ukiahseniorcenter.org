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
            background: 'linear-gradient(135deg, #1a237e 0%, #0d1642 50%, #1a237e 100%)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Subtle Stars Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
                        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 1px, transparent 1px),
                        radial-gradient(circle at 40% 70%, rgba(255,255,255,0.12) 1px, transparent 1px),
                        radial-gradient(circle at 60% 50%, rgba(255,255,255,0.09) 1px, transparent 1px),
                        radial-gradient(circle at 90% 80%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '200px 200px',
            opacity: 0.6,
            pointerEvents: 'none'
          }} />

          {/* Gold Frame */}
          <div style={{
            position: 'absolute',
            top: '0.25in',
            left: '0.25in',
            right: '0.25in',
            bottom: '0.25in',
            border: '2px solid #d4af37',
            borderRadius: '8px',
            pointerEvents: 'none'
          }} />

          {/* Content Container */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: '0.35in',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            color: 'white'
          }}>
            
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              {/* Primary Title */}
              <h1 style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#ffffff',
                lineHeight: '1.1'
              }}>
                NEW YEAR&apos;S EVE<br/>GALA DANCE
              </h1>
              
              {/* Gold Divider */}
              <div style={{
                width: '80px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                margin: '0 auto 8px auto'
              }} />
              
              {/* Host Line */}
              <p style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '9px',
                fontWeight: '500',
                margin: 0,
                letterSpacing: '0.3px',
                color: '#e0e0e0'
              }}>
                Bartlett Event Center
              </p>
            </div>

            {/* Main Info Section */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '10px',
              flex: 1
            }}>
              {/* Date & Time */}
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  margin: '0 0 5px 0',
                  color: '#d4af37'
                }}>
                  Wednesday, Dec 31, 2025
                </p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '10px',
                  fontWeight: '500',
                  margin: '0 0 5px 0',
                  color: '#ffffff',
                  lineHeight: '1.3'
                }}>
                  Doors <strong>6PM</strong> · Dance <strong>7–10PM</strong><br/>
                  🎉 Ball Drops <strong>Midnight (NY)</strong>
                </p>
              </div>

              {/* Pricing Box */}
              <div style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                padding: '10px',
                borderRadius: '4px',
                textAlign: 'center',
                marginBottom: '10px',
                boxShadow: '0 2px 6px rgba(212,175,55,0.4)'
              }}>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: '0 0 2px 0',
                  color: '#1a237e',
                  letterSpacing: '0.3px'
                }}>
                  $45 · Members $35
                </p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '8px',
                  fontWeight: '400',
                  margin: 0,
                  color: '#1a237e'
                }}>
                  Appetizers & desserts included
                </p>
              </div>

              {/* Entertainment & Details */}
              <div style={{
                textAlign: 'center',
                marginBottom: '8px',
                padding: '8px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
                border: '1px solid rgba(212,175,55,0.2)'
              }}>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '10px',
                  fontWeight: '600',
                  margin: '0 0 3px 0',
                  color: '#ffffff'
                }}>
                  <strong>Beatz Werkin Band</strong>
                </p>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '8px',
                  fontWeight: '400',
                  margin: 0,
                  color: '#e0e0e0',
                  lineHeight: '1.3'
                }}>
                  Flashy Attire · Beer & Wine · Raffles
                </p>
              </div>
            </div>

            {/* Where to Buy Section with QR Code */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #d4af37',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '8px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '10px',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '10px',
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  color: '#d4af37',
                  letterSpacing: '0.5px'
                }}>
                  GET TICKETS
                </h3>
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '8px',
                  fontWeight: '400',
                  lineHeight: '1.3',
                  margin: 0,
                  color: '#e0e0e0'
                }}>
                  tickets.ukiahseniorcenter.org<br/>
                  Ukiah Senior Center<br/>
                  Bartlett Event Center<br/>
                  Mendocino Book Co
                </p>
              </div>
              <div style={{
                background: 'white',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://tickets.ukiahseniorcenter.org"
                  alt="QR Code"
                  style={{
                    width: '60px',
                    height: '60px',
                    display: 'block'
                  }}
                />
                <p style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '6px',
                  fontWeight: '600',
                  margin: '2px 0 0 0',
                  color: '#1a237e',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase'
                }}>
                  Scan
                </p>
              </div>
            </div>

            {/* Sponsors Footer */}
            <div style={{
              textAlign: 'center',
              fontSize: '6px',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: '400',
              color: '#a0a0a0',
              paddingTop: '6px',
              borderTop: '1px solid rgba(212,175,55,0.2)',
              lineHeight: '1.3'
            }}>
              <p style={{ margin: 0 }}>
                Mendocino Book Co · Rain Forest Fantasy · Selzer Realty
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
