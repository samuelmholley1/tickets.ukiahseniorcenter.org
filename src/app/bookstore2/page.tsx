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
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <img 
              src="/logo.png" 
              alt="Ukiah Senior Center" 
              style={{ 
                width: '120px',
                height: 'auto',
                display: 'inline-block'
              }} 
            />
          </div>
          
          <h1 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            CHRISTMAS<br/>DRIVE-THRU
          </h1>
          
          <div style={{ fontSize: '16px', lineHeight: '1.4' }}>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
              Tuesday, December 23 • 12:00-12:30 PM
            </p>
            <p style={{ margin: '5px 0' }}>
              Prime Rib Meal • Drive-Thru Pickup
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>$20</strong>
            </p>
          </div>
          
          <p style={{ fontSize: '12px', margin: '0', textAlign: 'center' }}>
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
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <img 
              src="/logo.png" 
              alt="Ukiah Senior Center" 
              style={{ 
                width: '120px',
                height: 'auto',
                display: 'inline-block'
              }} 
            />
          </div>
          
          <h1 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            NEW YEAR&apos;S<br/>EVE GALA
          </h1>
          
          <div style={{ fontSize: '16px', lineHeight: '1.4' }}>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
              Wednesday, December 31 • 6:00-10:00 PM
            </p>
            <p style={{ margin: '5px 0' }}>
              Dance • Beatz Werkin Band • Ball Drop 9PM
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>$45</strong>
            </p>
          </div>
          
          <p style={{ fontSize: '12px', margin: '0', textAlign: 'center' }}>
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
