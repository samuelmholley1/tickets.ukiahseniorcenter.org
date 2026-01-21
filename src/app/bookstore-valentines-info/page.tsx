'use client';

export default function BookstoreValentinesInfoPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Cards Container */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Valentine's Day Dance Card */}
        <div style={{
          width: '5in',
          height: '3.25in',
          border: '3px solid #db2777',
          padding: '15px',
          backgroundColor: '#fdf2f8',
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
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              lineHeight: '1.1',
              color: '#db2777',
              textAlign: 'center'
            }}>
              VALENTINE&apos;S<br/>DAY DANCE
            </h1>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#000' }}>
              $45
            </div>
          </div>
          
          <div style={{ lineHeight: '1.3' }}>
            <p style={{ margin: '6px 0', fontWeight: 'bold', fontSize: '22px' }}>
              💕 Sat, February 14 • 6pm-10pm
            </p>
            <p style={{ margin: '6px 0', fontSize: '18px' }}>
              Live Music • Dancing • Appetizers & Desserts
            </p>
            <p style={{ margin: '4px 0', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
              For member discount, purchase at Ukiah Senior Center or tickets.ukiahseniorcenter.org
            </p>
          </div>
          
          <div>
            <p style={{ fontSize: '11px', margin: '0 0 2px 0', textAlign: 'center', fontWeight: 'bold' }}>
              Checks Payable to Ukiah Senior Center
            </p>
            <p style={{ fontSize: '14px', margin: '0', textAlign: 'center', fontWeight: 'bold' }}>
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
