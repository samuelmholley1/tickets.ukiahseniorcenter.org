'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface TicketInfo {
  eventName: string;
  eventDate: string;
  eventTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  ticketNumber: number;
  totalTickets: number;
}

function PrintTicketsContent() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<TicketInfo[]>([]);

  useEffect(() => {
    const firstName = searchParams.get('firstName') || '';
    const lastName = searchParams.get('lastName') || '';
    const email = searchParams.get('email') || '';
    const phone = searchParams.get('phone') || '';
    const christmasMember = parseInt(searchParams.get('christmasMember') || '0');
    const christmasNonMember = parseInt(searchParams.get('christmasNonMember') || '0');
    const nyeMember = parseInt(searchParams.get('nyeMember') || '0');
    const nyeNonMember = parseInt(searchParams.get('nyeNonMember') || '0');

    const customerName = `${firstName} ${lastName}`;
    const generatedTickets: TicketInfo[] = [];

    // Generate Christmas tickets
    const totalChristmas = christmasMember + christmasNonMember;
    for (let i = 0; i < totalChristmas; i++) {
      generatedTickets.push({
        eventName: 'Christmas Drive-Thru Meal',
        eventDate: 'December 23, 2025',
        eventTime: '12:00 PM - 12:30 PM',
        customerName,
        customerPhone: phone,
        customerEmail: email,
        ticketNumber: i + 1,
        totalTickets: totalChristmas
      });
    }

    // Generate NYE tickets
    const totalNYE = nyeMember + nyeNonMember;
    for (let i = 0; i < totalNYE; i++) {
      generatedTickets.push({
        eventName: 'New Year\'s Eve Gala Dance',
        eventDate: 'December 31, 2025',
        eventTime: '6:00 PM - 10:00 PM',
        customerName,
        customerPhone: phone,
        customerEmail: email,
        ticketNumber: i + 1,
        totalTickets: totalNYE
      });
    }

    setTickets(generatedTickets);

    // Auto-print after a short delay
    if (generatedTickets.length > 0) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  if (tickets.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Bitter, serif' }}>
        <p>No tickets to print. Please check the transaction details.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', background: 'white' }}>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 3.5in)',
        gridTemplateRows: 'repeat(5, 2in)',
        gap: '0.25in',
        padding: '0.5in',
        maxWidth: '8.5in',
        margin: '0 auto'
      }}>
      {tickets.map((ticket, index) => {
        const isNYE = ticket.eventName.includes('New Year');
        const borderColor = isNYE ? '#7c3aed' : '#427d78';
        const accentColor = isNYE ? '#7c3aed' : '#427d78';
        
        return (
        <div
          key={index}
          style={{
            width: '3.5in',
            height: '2in',
            position: 'relative',
            overflow: 'hidden',
            padding: '16px',
            fontSize: '9px',
            background: isNYE 
              ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: `3px solid ${borderColor}`,
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Header with Logo */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', borderBottom: `2px solid ${borderColor}`, paddingBottom: '6px' }}>
            <img
              src="/logo.png"
              alt="Ukiah Senior Center"
              width="45"
              height="45"
              style={{ flexShrink: 0 }}
            />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h3 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 'bold', color: accentColor, fontSize: '12px', marginBottom: '3px', lineHeight: '1.1' }}>
                {isNYE ? 'New Year&apos;s Eve Gala Dance' : 'Christmas Prime Rib Meal'}
              </h3>
              <div style={{ fontFamily: 'Bitter, serif', color: '#1f2937', fontSize: '8px', lineHeight: '1.3', fontWeight: '600' }}>
                <div style={{ marginBottom: '2px' }}>{isNYE ? 'Wednesday • December 31, 2025' : 'Tuesday • December 23, 2025'}</div>
                {isNYE ? (
                  <>
                    <div style={{ marginBottom: '1px' }}>Doors: 6:00 PM • Dance: 7:00-10:00 PM</div>
                    <div style={{ fontSize: '7px', color: '#dc2626', fontWeight: 'bold' }}>Ball Drop: 9:00 PM (NY Time!)</div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '1px', color: '#dc2626', fontWeight: 'bold' }}>PICKUP: 12:00-12:30 PM</div>
                    <div style={{ fontSize: '7px' }}>Drive-Thru Only • Stay in Vehicle</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div style={{ flex: 1, paddingTop: '6px', paddingBottom: '4px', fontSize: '7.5px', fontFamily: 'Bitter, serif', lineHeight: '1.4' }}>
            {isNYE ? (
              <>
                <div style={{ marginBottom: '3px' }}>
                  <strong style={{ color: accentColor }}>INCLUDES:</strong> Appetizers, Hors d&apos;oeuvres & Dessert
                </div>
                <div style={{ marginBottom: '3px' }}>
                  <strong style={{ color: accentColor }}>MUSIC:</strong> Beatz Werkin Band
                </div>
                <div style={{ marginBottom: '3px' }}>
                  <strong style={{ color: accentColor }}>ATTIRE:</strong> Flashy Attire!
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '3px' }}>
                  <strong style={{ color: accentColor }}>MENU:</strong> Prime Rib w/ Horseradish, Garlic Mashed Potatoes, Vegetable, Caesar Salad, Garlic Bread, Cheesecake
                </div>
                <div style={{ marginBottom: '2px', color: '#dc2626', fontWeight: 'bold', fontSize: '8px' }}>
                  ⚠️ Arrive within 12:00-12:30 PM window
                </div>
              </>
            )}
            <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: `1px solid ${borderColor}` }}>
              <strong style={{ color: accentColor }}>Guest:</strong> {ticket.customerName} <strong>#{ticket.ticketNumber}</strong>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', borderTop: `2px solid ${borderColor}`, paddingTop: '4px' }}>
            <p style={{ fontFamily: 'Bitter, serif', color: '#6b7280', fontSize: '8px', lineHeight: '1.2', fontWeight: '600' }}>
              Bartlett Event Center • 495 Leslie St, Ukiah, CA 95482 • (707) 462-4343 ext 209
            </p>
          </div>
        </div>
        );
      })}
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

export default function PrintTickets() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading tickets...</div>}>
      <PrintTicketsContent />
    </Suspense>
  );
}
