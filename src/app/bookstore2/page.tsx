'use client';

export default function BookstoreInfoPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Cards Container */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Christmas Card */}
        <div style={{
          width: '5in',
          height: '3in',
          border: '3px solid #000',
          padding: '15px',
          backgroundColor: '#fff',
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
                lineHeight: '1.1'
              }}>
                CHRISTMAS<br/>DRIVE-THRU
              </h1>
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#000' }}>
              $20
            </div>
          </div>
          
          <div style={{ lineHeight: '1.4' }}>
            <p style={{ margin: '8px 0', fontWeight: 'bold', fontSize: '24px' }}>
              Tues, December 23 • 12pm-12:30pm
            </p>
            <p style={{ margin: '8px 0', fontSize: '20px' }}>
              Prime Rib Meal • Drive-Thru Pickup
            </p>
          </div>
          
          <p style={{ fontSize: '16px', margin: '0', textAlign: 'center', fontWeight: 'bold' }}>
            (707) 462-4343 ext 209
          </p>
        </div>

        {/* NYE Card */}
        <div style={{
          width: '5in',
          height: '3in',
          border: '3px solid #000',
          padding: '15px',
          backgroundColor: '#fff',
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
                lineHeight: '1.1'
              }}>
                NEW YEAR&apos;S<br/>EVE GALA
              </h1>
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#000' }}>
              $45
            </div>
          </div>
          
          <div style={{ lineHeight: '1.4' }}>
            <p style={{ margin: '8px 0', fontWeight: 'bold', fontSize: '24px' }}>
              Wed, December 31 • 6pm-10pm
            </p>
            <p style={{ margin: '8px 0', fontSize: '20px' }}>
              Dance • Beatz Werkin Band • Ball Drop 9PM
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
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          Print Cards
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
