'use client';

import { useRef } from 'react';

export default function NYEFlyer2025() {
  const flyerRef = useRef<HTMLDivElement>(null);

  const downloadAsPNG = () => {
    alert('To save as PNG: Right-click the flyer and select "Save image as..." or use your browser\'s print function and "Save as PDF"');
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
      {/* Download Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
          💾 How to Save as PNG
        </button>
        <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
          Flyer is 8.5&quot; × 11&quot; (standard letter size) - Right-click to save or Print to PDF
        </p>
      </div>

      {/* Flyer Container */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div 
          ref={flyerRef}
          style={{
            width: '8.5in',
            height: '11in',
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
            top: '0.5in',
            left: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            border: '3px solid #d4af37',
            borderRadius: '12px',
            pointerEvents: 'none'
          }} />

          {/* Content Container */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: '0.75in',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            color: 'white'
          }}>
            
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '0.4in' }}>
              <h1 style={{
                fontFamily: 'Georgia, serif',
                fontSize: '52px',
                fontWeight: 'bold',
                margin: '0 0 12px 0',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}>
                NEW YEAR&apos;S EVE
              </h1>
              <h2 style={{
                fontFamily: 'Georgia, serif',
                fontSize: '44px',
                fontWeight: 'bold',
                margin: '0 0 16px 0',
                letterSpacing: '1px',
                color: '#d4af37',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}>
                GALA DANCE
              </h2>
              <div style={{
                width: '200px',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                margin: '0 auto 20px auto'
              }} />
              <p style={{
                fontSize: '18px',
                margin: 0,
                fontWeight: '500',
                letterSpacing: '1px',
                color: '#e0e0e0'
              }}>
                Bartlett Event Center
              </p>
              <p style={{
                fontSize: '16px',
                margin: '4px 0 0 0',
                color: '#b0b0b0'
              }}>
                Ukiah Senior Center
              </p>
            </div>

            {/* Main Info Section */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '12px',
              padding: '28px',
              marginBottom: '24px',
              flex: 1
            }}>
              {/* Date & Time */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: '0 0 12px 0',
                  color: '#d4af37'
                }}>
                  Wednesday, December 31, 2025
                </p>
                <p style={{
                  fontSize: '22px',
                  margin: '0 0 8px 0',
                  color: '#ffffff'
                }}>
                  Doors Open: 6:00 PM • Dancing: 7:00 PM - 10:00 PM
                </p>
                <p style={{
                  fontSize: '20px',
                  margin: 0,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  background: 'rgba(212,175,55,0.2)',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'inline-block'
                }}>
                  🎆 Ball Drops at Midnight (New York Time!)
                </p>
              </div>

              {/* Pricing Box */}
              <div style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(212,175,55,0.4)'
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                  color: '#1a237e',
                  textShadow: 'none'
                }}>
                  Tickets: $45 • Members: $35
                </p>
                <p style={{
                  fontSize: '16px',
                  margin: 0,
                  color: '#1a237e',
                  fontWeight: '600'
                }}>
                  Includes Appetizers & Desserts
                </p>
              </div>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '0 0 8px 0',
                    color: '#d4af37'
                  }}>
                    🎵 Live Music
                  </p>
                  <p style={{ fontSize: '18px', margin: 0, color: '#ffffff' }}>
                    Beatz Werkin Band
                  </p>
                </div>
                <div>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '0 0 8px 0',
                    color: '#d4af37'
                  }}>
                    ✨ Dress Code
                  </p>
                  <p style={{ fontSize: '18px', margin: 0, color: '#ffffff' }}>
                    Flashy Attire!
                  </p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(212,175,55,0.2)'
              }}>
                <p style={{
                  fontSize: '16px',
                  margin: '0 0 8px 0',
                  color: '#e0e0e0',
                  textAlign: 'center'
                }}>
                  🍺 Beer & Wine Available for Purchase
                </p>
                <p style={{
                  fontSize: '16px',
                  margin: 0,
                  color: '#e0e0e0',
                  textAlign: 'center'
                }}>
                  🎟️ Raffle Drawings Throughout the Night
                </p>
              </div>
            </div>

            {/* Where to Buy Section with QR Code */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid #d4af37',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '24px',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0 0 12px 0',
                  color: '#d4af37'
                }}>
                  WHERE TO BUY TICKETS
                </h3>
                <ul style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  margin: 0,
                  paddingLeft: '20px',
                  color: '#ffffff'
                }}>
                  <li>Ukiah Senior Center</li>
                  <li>Bartlett Event Center</li>
                  <li><strong>Online:</strong> tickets.ukiahseniorcenter.org</li>
                  <li>Mendocino Book Company (cash/check only)</li>
                </ul>
              </div>
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: '#000',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: '#fff',
                  textAlign: 'center'
                }}>
                  [QR CODE]<br/>
                  Add via<br/>
                  QR generator
                </div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  margin: 0,
                  color: '#1a237e'
                }}>
                  SCAN FOR<br/>TICKETS
                </p>
              </div>
            </div>

            {/* Sponsors Footer */}
            <div style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#a0a0a0',
              paddingTop: '12px',
              borderTop: '1px solid rgba(212,175,55,0.2)'
            }}>
              <p style={{ margin: '0 0 4px 0' }}>
                Thanks to Our Generous Sponsors
              </p>
              <p style={{ margin: 0 }}>
                Ukiah Senior Center • Bartlett Event Center • Mendocino Book Company
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Below */}
      <div style={{
        maxWidth: '8.5in',
        margin: '30px auto',
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1a237e' }}>📋 Instructions:</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#333' }}>
          <li><strong>To Save as PNG:</strong> Right-click the flyer above and select &quot;Save image as...&quot;</li>
          <li><strong>To Print:</strong> Use browser Print function (Ctrl+P) and select &quot;Save as PDF&quot;</li>
          <li><strong>Add QR Code:</strong> Generate a QR code for tickets.ukiahseniorcenter.org and overlay it on the black square</li>
          <li><strong>Professional Printing:</strong> Save as PDF, send to print shop for high-quality 8.5&quot;×11&quot; prints</li>
        </ol>
      </div>
    </div>
  );
}
