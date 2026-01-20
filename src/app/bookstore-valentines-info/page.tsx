'use client';

export default function BookstoreValentinesInfoPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Cards Container */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Valentine's Day Dance Card */}
        <div style={{
          width: '5in',
          height: '3in',
          border: '3px solid #db2777',
          padding: '15px',
          backgroundColor: '#fdf2f8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pageBreakAfter: 'avoid'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img 
                src="/logo.png" 
                alt="Ukiah Senior Center" 
                style={{ 
                  width: '90px',
                  height: 'auto',
                  flexShrink: 0
                }} 
              />
              <h1 style={{
                fontSize: '38px',
                fontWeight: 'bold',
                margin: '0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.1',
                color: '#db2777'
              }}>
                VALENTINE&apos;S<br/>DAY DANCE
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#db2777' }}>
                Members
              </div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#000' }}>
                $30
              </div>
              <div style={{ fontSize: '16px', color: '#666' }}>
                Non-Members $45
              </div>
            </div>
          </div>
          
          <div style={{ lineHeight: '1.4' }}>
            <p style={{ margin: '8px 0', fontWeight: 'bold', fontSize: '24px' }}>
              💕 Sat, February 14 • 6pm-10pm
            </p>
            <p style={{ margin: '8px 0', fontSize: '20px' }}>
              Live Music • Dancing • Light Refreshments
            </p>
          </div>
          
          <p style={{ fontSize: '16px', margin: '0', textAlign: 'center', fontWeight: 'bold' }}>
            (707) 462-4343 ext 209
          </p>
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
            backgroundColor: '#db2777',
            color: '#fff',
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
