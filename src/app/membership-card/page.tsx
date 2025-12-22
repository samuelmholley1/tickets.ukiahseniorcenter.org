'use client';

import { useEffect } from 'react';

export default function MembershipCard() {
  useEffect(() => {
    // Auto-print after a short delay
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  const borderColor = '#427d78';
  const accentColor = '#427d78';

  const members = ['Roxanne Martinez', 'Vicki Plum'];

  const renderCard = (memberName: string) => (
    <div
      style={{
        width: '3.5in',
        height: '2in',
        position: 'relative',
        overflow: 'visible',
        padding: '10px 12px 12px 12px',
        fontSize: '9px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: `3px solid ${borderColor}`,
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Header with Logo */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', borderBottom: `2px solid ${borderColor}`, paddingBottom: '3px' }}>
        <img
          src="/logo.png"
          alt="Ukiah Senior Center"
          width="45"
          height="45"
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1, textAlign: 'left', marginTop: '-2px' }}>
          <h3 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 'bold', color: accentColor, fontSize: '14px', marginBottom: '1px', lineHeight: '1' }}>
            2025-2026 Membership Card
          </h3>
          <div style={{ fontFamily: 'Bitter, serif', color: '#1f2937', fontSize: '9px', lineHeight: '1.1', fontWeight: '600' }}>
            <div style={{ marginBottom: '0px' }}>Ukiah Senior Center</div>
            <div style={{ fontSize: '8px', color: '#427d78' }}>Valid July 1, 2025 - June 30, 2026</div>
          </div>
        </div>
      </div>

      {/* Member Details */}
      <div style={{ flex: 1, paddingTop: '6px', paddingBottom: '3px', fontSize: '10px', fontFamily: 'Bitter, serif', lineHeight: '1.3' }}>
        <div style={{ marginBottom: '3px' }}>
          <strong style={{ color: accentColor, fontSize: '11px' }}>Member:</strong>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', marginTop: '0px' }}>
            {memberName}
          </div>
        </div>
        <div style={{ marginTop: '4px', paddingTop: '3px', borderTop: `1px solid ${borderColor}`, fontSize: '8px', color: '#6b7280', lineHeight: '1.2' }}>
          <div style={{ marginBottom: '1px' }}>✓ Access to all senior center programs</div>
          <div style={{ marginBottom: '1px' }}>✓ Member pricing on events & activities</div>
          <div>✓ Monthly newsletter & event updates</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: `2px solid ${borderColor}`, paddingTop: '3px' }}>
        <p style={{ fontFamily: 'Bitter, serif', color: '#6b7280', fontSize: '8px', lineHeight: '1', fontWeight: '600', marginBottom: '1px' }}>
          495 Leslie St, Ukiah, CA 95482 • (707) 462-4343
        </p>
        <p style={{ fontFamily: 'Jost, sans-serif', color: accentColor, fontSize: '7px', fontWeight: 'bold', marginTop: '1px' }}>
          ukiahseniorcenter.org
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0', background: 'white' }}>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5in',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1in',
        minHeight: '100vh'
      }}>
        {members.map((member, index) => (
          <div key={index}>{renderCard(member)}</div>
        ))}
      </div>

      <style jsx global>{`
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          html, body { 
            padding: 0; 
            margin: 0; 
            width: 100%;
            height: 100%;
          }
          @page { 
            size: letter portrait;
            margin: 0.5in; 
          }
        }
      `}</style>
    </div>
  );
}
