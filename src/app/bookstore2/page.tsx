'use client';

export default function BookstoreInfoPage() {
  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      color: '#000000'
    }}>
      <h1 style={{
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '40px',
        textAlign: 'center',
        borderBottom: '3px solid #000',
        paddingBottom: '20px'
      }}>
        Ukiah Senior Center Events
      </h1>

      {/* Christmas Drive-Thru Section */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textTransform: 'uppercase'
        }}>
          Christmas Drive-Thru
        </h2>
        
        <div style={{ fontSize: '18px', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '15px' }}>
            <strong>Date:</strong> Tuesday, December 23, 2025
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Time:</strong> Pick Up 12:00-12:30 PM
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Format:</strong> Drive-Thru Only (Stay in Vehicle)
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Menu:</strong> Prime Rib, Fixings, & Dessert
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Location:</strong> Bartlett Event Center<br />
            495 Leslie St, Ukiah, CA 95482
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Price:</strong><br />
            • Members: $20<br />
            • Non-Members: $30
          </p>
          <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>
            ⚠️ IMPORTANT: Must arrive between 12:00-12:30 PM window
          </p>
        </div>
      </div>

      {/* New Year's Eve Gala Section */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textTransform: 'uppercase'
        }}>
          New Year&apos;s Eve Gala Dance
        </h2>
        
        <div style={{ fontSize: '18px', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '15px' }}>
            <strong>Date:</strong> Wednesday, December 31, 2025
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Time:</strong><br />
            • Doors Open: 6:00 PM<br />
            • Dance: 7:00-10:00 PM<br />
            • Ball Drop: 9:00 PM (NY Time!)
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Music:</strong> Beatz Werkin Band (Live)
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Food:</strong> Appetizers & Dessert
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Attire:</strong> Flashy Attire Encouraged!
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Location:</strong> Bartlett Event Center<br />
            495 Leslie St, Ukiah, CA 95482
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>Price:</strong><br />
            • Members: $20<br />
            • Non-Members: $30
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{
        borderTop: '3px solid #000',
        paddingTop: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}>
          Questions?
        </h3>
        <p style={{ fontSize: '20px', marginBottom: '10px' }}>
          <strong>Ukiah Senior Center</strong>
        </p>
        <p style={{ fontSize: '18px', marginBottom: '5px' }}>
          (707) 462-4343 ext 209
        </p>
        <p style={{ fontSize: '16px' }}>
          495 Leslie St, Ukiah, CA 95482
        </p>
      </div>

      {/* Print Button */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          Print This Page
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
          }
        }
      `}</style>
    </div>
  );
}
