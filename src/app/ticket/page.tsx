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
              <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
                  <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl">
                    Customer Information
                  </h2>
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
                    className="text-sm text-[#427d78] hover:text-[#5eb3a1] font-['Bitter',serif]"
                  >
                    Change Event
                  </button>
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label htmlFor="customerName" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    required
                    value={ticketData.customerName}
                    onChange={(e) => setTicketData({...ticketData, customerName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    placeholder="John Doe"
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label htmlFor="customerPhone" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    required
                    value={ticketData.customerPhone}
                    onChange={(e) => setTicketData({...ticketData, customerPhone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    placeholder="(707) 555-1234"
                  />
                </div>

                <div style={{ marginBottom: 0 }}>
                  <label htmlFor="customerEmail" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    required
                    value={ticketData.customerEmail}
                    onChange={(e) => setTicketData({...ticketData, customerEmail: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Ticket Preview */}
              {isFormValid && (
                <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                  <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl text-center" style={{ marginBottom: 'var(--space-3)' }}>
                    Ticket Preview
                  </h2>

                  <div 
                    ref={ticketRef}
                    className="bg-white border-4 border-[#427d78] rounded-lg print:border-2"
                    style={{ 
                      width: '3.5in', 
                      height: '2in', 
                      marginInline: 'auto', 
                      position: 'relative', 
                      overflow: 'hidden',
                      padding: '12px',
                      fontSize: '9px'
                    }}
                  >
                    {/* Christmas Decorations */}
                    {selectedEvent === 'christmas-drive-thru' && (
                      <>
                        {/* Snowflakes */}
                        <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '0.8rem', opacity: 0.3 }}>❄️</div>
                        <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem', opacity: 0.3 }}>❄️</div>
                        <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontSize: '0.7rem', opacity: 0.3 }}>❄️</div>
                        <div style={{ position: 'absolute', bottom: '12px', right: '6px', fontSize: '0.8rem', opacity: 0.3 }}>❄️</div>
                      </>
                    )}
                    
                    {/* NYE Decorations */}
                    {selectedEvent === 'nye-gala' && (
                      <>
                        {/* Confetti and celebration */}
                        <div style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '0.7rem' }}>🎉</div>
                        <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.8rem' }}>✨</div>
                        <div style={{ position: 'absolute', bottom: '10px', left: '8px', fontSize: '0.8rem' }}>🥂</div>
                        <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '0.7rem' }}>🎆</div>
                      </>
                    )}

                    {/* Logo with decorations */}
                    <div style={{ textAlign: 'center', marginBottom: '4px', position: 'relative' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Image
                          src="/logo.png"
                          alt="Ukiah Senior Center"
                          width={60}
                          height={60}
                          style={{ marginInline: 'auto' }}
                        />
                        {selectedEvent === 'christmas-drive-thru' && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '-3px', 
                            right: '5px', 
                            fontSize: '1rem',
                            transform: 'rotate(25deg)',
                            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
                          }}>
                            🎅
                          </div>
                        )}
                        {selectedEvent === 'nye-gala' && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '-2px', 
                            right: '4px', 
                            fontSize: '1rem',
                            animation: 'sparkle 2s ease-in-out infinite'
                          }}>
                            🎩
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Event Info */}
                    <div style={{ textAlign: 'center', marginBottom: '6px', borderBottom: '1px solid #427d78', paddingBottom: '4px' }}>
                      <h3 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ fontSize: '13px', marginBottom: '2px', lineHeight: '1.1' }}>
                        {ticketData.eventName}
                      </h3>
                      <p className="font-['Bitter',serif] text-gray-700" style={{ fontSize: '9px', marginBottom: '1px', lineHeight: '1.2' }}>
                        📅 {ticketData.eventDate}
                      </p>
                      <p className="font-['Bitter',serif] text-gray-700" style={{ fontSize: '9px', marginBottom: '1px', lineHeight: '1.2', fontWeight: 'bold' }}>
                        🕐 {ticketData.eventTime}
                      </p>
                      <p className="font-['Bitter',serif] text-gray-700" style={{ fontSize: '8px', lineHeight: '1.2' }}>
                        📍 {ticketData.eventLocation}
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div style={{ marginBottom: '4px' }}>
                      <h4 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ fontSize: '10px', marginBottom: '2px' }}>
                        Ticket Holder
                      </h4>
                      <div className="font-['Bitter',serif] text-gray-700" style={{ fontSize: '8px', lineHeight: '1.3' }}>
                        <p><strong>Name:</strong> {ticketData.customerName}</p>
                        <p><strong>Phone:</strong> {ticketData.customerPhone}</p>
                        <p><strong>Email:</strong> {ticketData.customerEmail}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', borderTop: '1px solid #427d78', paddingTop: '3px', marginTop: '4px' }}>
                      <p className="font-['Bitter',serif] text-gray-600" style={{ fontSize: '7px', lineHeight: '1.2' }}>
                        499 Leslie St, Ukiah, CA 95482 • (707) 462-4343
                      </p>
                    </div>
                  </div>

                  {/* Print Button */}
                  <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                    <button
                      onClick={handlePrint}
                      className="bg-[#427d78] hover:bg-[#5eb3a1] text-white font-['Jost',sans-serif] font-bold text-lg px-8 py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                    >
                      🖨️ Print Ticket
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
