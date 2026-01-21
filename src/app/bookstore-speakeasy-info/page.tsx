'use client';

export default function BookstoreSpeakeasyInfoPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Cards Container */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Speakeasy Gala Card */}
        <div style={{
          width: '5in',
          height: '3.25in',
          border: '3px solid #d4af37',
          padding: '15px',
          backgroundColor: '#fefce8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pageBreakAfter: 'avoid',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <img 
                src="/logo.png" 
                alt="Ukiah Senior Center" 
                style={{ 
                  width: '80px',
                  height: 'auto',
                  flexShrink: 0
                }} 
              />
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#666' }}>Ukiah Senior Center</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.1',
                color: '#d4af37'
              }}>
                AN AFFAIR TO<br/>REMEMBER
              </h1>
              <p style={{
                fontSize: '16px',
                margin: '4px 0 0 0',
                color: '#92400e',
                fontStyle: 'italic'
              }}>
                A Night at the Speakeasy
              </p>
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#000' }}>
              $100
            </div>
          </div>
          
          <div style={{ lineHeight: '1.4' }}>
            <p style={{ margin: '8px 0', fontWeight: 'bold', fontSize: '22px' }}>
              🎭 Sat, April 11 • 6pm-10pm
            </p>
            <p style={{ margin: '8px 0', fontSize: '18px' }}>
              Live Entertainment • Dancing • Appetizers
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px', fontStyle: 'italic', color: '#666' }}>
              1920s Speakeasy Attire Encouraged!
            </p>
          </div>
          
          <div>
            <p style={{ fontSize: '12px', margin: '0 0 4px 0', textAlign: 'center', fontWeight: 'bold' }}>
              Checks Payable to Ukiah Senior Center
            </p>
            <p style={{ fontSize: '16px', margin: '0', textAlign: 'center', fontWeight: 'bold' }}>
              Contact: (707) 462-4343 ext 209
            </p>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#d4af37',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          Print Card
        </button>
      </div>

      <style jsx global>{`
        @media print {
          button {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          @page {
            size: landscape;
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
}
