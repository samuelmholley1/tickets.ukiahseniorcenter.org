'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

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
    <div style={{ padding: '20px' }}>
      {tickets.map((ticket, index) => (
        <div
          key={index}
          style={{
            width: '3.5in',
            height: '2in',
            marginInline: 'auto',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
            padding: '16px',
            fontSize: '9px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '3px solid #427d78',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(66, 125, 120, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pageBreakAfter: index < tickets.length - 1 ? 'always' : 'auto'
          }}
        >
          {/* Header with Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #427d78', paddingBottom: '8px' }}>
            <Image
              src="/logo.png"
              alt="Ukiah Senior Center"
              width={50}
              height={50}
              style={{ flexShrink: 0 }}
            />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h3 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 'bold', color: '#427d78', fontSize: '14px', marginBottom: '2px', lineHeight: '1.1' }}>
                {ticket.eventName}
              </h3>
              <div style={{ fontFamily: 'Bitter, serif', color: '#374151', fontSize: '9px', lineHeight: '1.3' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>{ticket.eventDate}</div>
                <div style={{ fontWeight: 'bold' }}>{ticket.eventTime}</div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ flex: 1, paddingTop: '8px', paddingBottom: '4px' }}>
            <div style={{ fontFamily: 'Bitter, serif', fontSize: '10px', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '3px' }}>
                <strong style={{ color: '#427d78' }}>Name:</strong>{' '}
                <span>{ticket.customerName} #{ticket.ticketNumber}</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                <strong style={{ color: '#427d78' }}>Phone:</strong>{' '}
                <span>{ticket.customerPhone}</span>
              </div>
              <div>
                <strong style={{ color: '#427d78' }}>Email:</strong>{' '}
                <span>{ticket.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', borderTop: '2px solid #427d78', paddingTop: '4px' }}>
            <p style={{ fontFamily: 'Bitter, serif', color: '#6b7280', fontSize: '8px', lineHeight: '1.2', fontWeight: '600' }}>
              Ukiah Senior Center • 499 Leslie St, Ukiah, CA 95482 • (707) 462-4343
            </p>
          </div>
        </div>
      ))}

      <style jsx global>{`
        @media print {
          body { 
            padding: 0; 
            margin: 0; 
          }
          @page { 
            size: 3.5in 2in;
            margin: 0.25in; 
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
