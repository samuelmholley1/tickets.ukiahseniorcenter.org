'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

interface TicketData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

const EVENTS = [
  {
    id: 'christmas-drive-thru',
    name: 'Christmas Drive-Thru Meal',
    date: 'December 23, 2025',
    time: '12:00 PM - 12:30 PM',
    location: 'Ukiah Senior Center'
  },
  {
    id: 'nye-gala',
    name: 'New Year\'s Eve Gala Dance',
    date: 'December 31, 2025',
    time: '6:00 PM - 10:00 PM',
    location: 'Ukiah Senior Center'
  }
];

export default function TicketGenerator() {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [ticketData, setTicketData] = useState<TicketData>({
    eventName: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleEventSelect = (eventId: string) => {
    const event = EVENTS.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(eventId);
      setTicketData({
        ...ticketData,
        eventName: event.name,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location
      });
    }
  };

  const handlePrint = () => {
    if (ticketRef.current) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const ticketHTML = ticketRef.current.innerHTML;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Ticket - ${ticketData.eventName}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Bitter', serif;
                  padding: 20px;
                  background: white;
                }
                @keyframes sparkle {
                  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                  50% { transform: scale(1.2) rotate(10deg); opacity: 0.8; }
                }
                @media print {
                  body { padding: 0; margin: 0; }
                  @page { 
                    size: 3.5in 2in;
                    margin: 0; 
                  }
                }
              </style>
            </head>
            <body>
              ${ticketHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const isFormValid = ticketData.customerName && ticketData.customerPhone && ticketData.customerEmail && selectedEvent;

  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Ticket Generator
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Generate and print tickets for events
            </p>
          </div>

          {/* Event Selection */}
          {!selectedEvent && (
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl text-center" style={{ marginBottom: 'var(--space-3)' }}>
                Select Event
              </h2>
              <div className="grid-cards">
                {EVENTS.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventSelect(event.id)}
                    className="group flex flex-col items-center justify-center text-center bg-white rounded-lg border-4 border-[#427d78] hover:bg-[#427d78] transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ padding: '24px 20px', minHeight: '150px' }}
                  >
                    <div className="text-lg md:text-xl font-['Jost',sans-serif] font-bold text-gray-900 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2' }}>
                      {event.name}
                    </div>
                    <div className="text-sm md:text-base text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4' }}>
                      📅 {event.date}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Form */}
          {selectedEvent && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                <button
                  onClick={() => {
                    setSelectedEvent('');
                    setTicketData({
                      eventName: '',
                      eventDate: '',
                      eventTime: '',
                      eventLocation: '',
                      customerName: '',
                      customerPhone: '',
                      customerEmail: ''
                    });
                  }}
                  className="text-sm text-[#427d78] hover:text-[#5eb3a1] font-['Bitter',serif] underline"
                >
                  ← Change Event
                </button>
              </div>

              {/* Ticket Preview - Always Visible */}
              <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl text-center" style={{ marginBottom: 'var(--space-3)' }}>
                  {ticketData.eventName || 'Ticket Preview'}
                </h2>

                <div 
                  ref={ticketRef}
                  style={{ 
                    width: '3.5in', 
                    height: '2in', 
                    marginInline: 'auto', 
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
                    justifyContent: 'space-between'
                  }}
                  className="print:border-2 print:shadow-none"
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
                      <h3 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ fontSize: '14px', marginBottom: '2px', lineHeight: '1.1' }}>
                        {ticketData.eventName}
                      </h3>
                      <div className="font-['Bitter',serif] text-gray-700" style={{ fontSize: '9px', lineHeight: '1.3' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>{ticketData.eventDate}</div>
                        <div style={{ fontWeight: 'bold' }}>{ticketData.eventTime}</div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div style={{ flex: 1, paddingTop: '8px', paddingBottom: '4px' }}>
                    <div className="font-['Bitter',serif]" style={{ fontSize: '10px', lineHeight: '1.5' }}>
                      <div style={{ marginBottom: '3px' }}>
                        <strong style={{ color: '#427d78' }}>Name:</strong>{' '}
                        <input
                          type="text"
                          value={ticketData.customerName}
                          onChange={(e) => setTicketData({...ticketData, customerName: e.target.value})}
                          placeholder="Enter name"
                          style={{ 
                            border: 'none', 
                            borderBottom: '1px dotted #ccc',
                            background: 'transparent',
                            outline: 'none',
                            fontFamily: 'Bitter, serif',
                            fontSize: '10px',
                            width: 'calc(100% - 50px)',
                            padding: '0 2px'
                          }}
                          className="print:border-none"
                        />
                      </div>
                      <div style={{ marginBottom: '3px' }}>
                        <strong style={{ color: '#427d78' }}>Phone:</strong>{' '}
                        <input
                          type="tel"
                          value={ticketData.customerPhone}
                          onChange={(e) => setTicketData({...ticketData, customerPhone: e.target.value})}
                          placeholder="Enter phone"
                          style={{ 
                            border: 'none', 
                            borderBottom: '1px dotted #ccc',
                            background: 'transparent',
                            outline: 'none',
                            fontFamily: 'Bitter, serif',
                            fontSize: '10px',
                            width: 'calc(100% - 55px)',
                            padding: '0 2px'
                          }}
                          className="print:border-none"
                        />
                      </div>
                      <div>
                        <strong style={{ color: '#427d78' }}>Email:</strong>{' '}
                        <input
                          type="email"
                          value={ticketData.customerEmail}
                          onChange={(e) => setTicketData({...ticketData, customerEmail: e.target.value})}
                          placeholder="Enter email"
                          style={{ 
                            border: 'none', 
                            borderBottom: '1px dotted #ccc',
                            background: 'transparent',
                            outline: 'none',
                            fontFamily: 'Bitter, serif',
                            fontSize: '10px',
                            width: 'calc(100% - 50px)',
                            padding: '0 2px'
                          }}
                          className="print:border-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: 'center', borderTop: '2px solid #427d78', paddingTop: '4px' }}>
                    <p className="font-['Bitter',serif] text-gray-600" style={{ fontSize: '8px', lineHeight: '1.2', fontWeight: '600' }}>
                      Bartlett Event Center • 495 Leslie St, Ukiah, CA 95482 • (707) 462-4343
                    </p>
                  </div>
                </div>

                {/* Print Button */}
                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                  <button
                    onClick={handlePrint}
                    disabled={!isFormValid}
                    className="bg-[#427d78] hover:bg-[#5eb3a1] text-white font-['Jost',sans-serif] font-bold text-lg px-8 py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Print Ticket
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
