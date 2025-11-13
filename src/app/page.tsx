'use client';

import { useState } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';
import { ZeffyModal } from '@/components/ZeffyModal';
import { Button } from '@/components/Button';
import { EVENTS } from '@/lib/copy';

export default function Tickets() {
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  const handleOpenTicket = (eventId: string) => {
    setActiveEvent(eventId);
  };

  const handleCloseModal = () => {
    setActiveEvent(null);
  };

  return (
    <>
      <SiteNavigation />
      
      {/* Main Content */}
      <section className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container">
          
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Event Tickets
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ marginBottom: 0, maxWidth: '800px', marginInline: 'auto', lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Purchase tickets for upcoming events at the Ukiah Senior Center
            </p>
          </div>

          {/* Tip Notice */}
          <div className="bg-red-50 border-2 border-red-400 rounded-lg" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <h3 className="text-base md:text-lg font-['Jost',sans-serif] font-bold text-red-900 text-center" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.3' }}>
              ⚠️ Set Zeffy Tip to $0
            </h3>
            <p className="text-xs md:text-sm text-red-900 font-['Bitter',serif] text-center" style={{ marginBottom: 'var(--space-2)', maxWidth: '700px', marginInline: 'auto', lineHeight: '1.6' }}>
              When filling out the form below, <strong>set the tip to $0</strong> so you don&apos;t pay any fees.
            </p>
            <div className="bg-white rounded border border-red-300" style={{ padding: 'var(--space-2)', maxWidth: '600px', marginInline: 'auto', overflow: 'hidden' }}>
              <img
                src="/zero_tip.png"
                alt="Set Zeffy tip to zero"
                className="rounded"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  display: 'block'
                }}
              />
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid-cards" style={{ marginBottom: 'var(--space-4)' }}>
            {EVENTS.map((event) => (
              <div key={event.id} className="card">
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <h2 className="text-xl md:text-2xl font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2' }}>
                    {event.title}
                  </h2>
                  {event.date && (
                    <p className="text-sm md:text-base text-[#666] font-['Bitter',serif]" style={{ marginBottom: 'var(--space-1)', lineHeight: '1.5' }}>
                      📅 {event.date}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-sm md:text-base text-[#666] font-['Bitter',serif]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.5' }}>
                      📍 {event.location}
                    </p>
                  )}
                  <p className="text-base md:text-lg text-[#666] font-['Bitter',serif]" style={{ marginBottom: 0, lineHeight: '1.6' }}>
                    {event.description}
                  </p>
                </div>
                <Button 
                  onClick={() => handleOpenTicket(event.id)}
                  variant="primary"
                  className="w-full"
                >
                  {event.buttonText || 'Purchase Tickets'}
                </Button>
              </div>
            ))}
          </div>

          {/* Info Card */}
          <div className="card text-center" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 className="text-xl md:text-2xl font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)' }}>
              Questions About Events?
            </h3>
            <p className="text-base md:text-lg text-[#666] font-['Bitter',serif]" style={{ marginBottom: 'var(--space-3)', maxWidth: '700px', marginInline: 'auto', lineHeight: '1.7' }}>
              Contact us at <a href="tel:+17074624343" className="text-[#427d78] hover:text-[#5eb3a1]">(707) 462-4343</a> or email{' '}
              <a href="mailto:director@ukiahseniorcenter.org" className="text-[#427d78] hover:text-[#5eb3a1]">director@ukiahseniorcenter.org</a>
            </p>
          </div>

        </div>
      </section>

      <SiteFooterContent />

      {/* Zeffy Modals */}
      {EVENTS.map((event) => (
        <ZeffyModal
          key={event.id}
          isOpen={activeEvent === event.id}
          onClose={handleCloseModal}
          eventTitle={event.title}
          zeffyUrl={event.zeffyUrl}
        />
      ))}
    </>
  );
}
