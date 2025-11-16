'use client';

import { useState } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';
import LoadingStates from '@/components/LoadingStates';
import { EVENTS } from '@/lib/copy';

export default function Tickets() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    EVENTS.reduce((acc, event) => ({ ...acc, [event.id]: true }), {})
  );

  const scrollToForm = (formId: string) => {
    const element = document.getElementById(formId);
    if (element) {
      // Get element position and scroll with offset to show warning section
      const yOffset = -100; // Negative offset to show content above
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleIframeLoad = (eventId: string) => {
    setLoadingStates(prev => ({ ...prev, [eventId]: false }));
  };

  return (
    <>
      <SiteNavigation />
      
      {/* Main Content */}
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container">

          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Event Tickets
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ marginBottom: 'var(--space-3)', maxWidth: '800px', marginInline: 'auto', lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Purchase tickets for upcoming events at the Ukiah Senior Center
            </p>
          </div>

          {/* Event Buttons */}
          <div className="grid-cards" style={{ marginBottom: 'var(--space-4)', maxWidth: '900px', marginInline: 'auto' }}>
            {EVENTS.map((event) => (
              <button 
                key={event.id}
                onClick={() => scrollToForm(`${event.id}-section`)}
                className="group flex flex-col items-center justify-center text-center bg-white rounded-lg border-4 border-[#427d78] hover:bg-[#427d78] transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                style={{ padding: '24px 20px', minHeight: '180px' }}
                aria-label={`Purchase tickets for ${event.title}`}
              >
                <div className="text-lg md:text-xl font-['Jost',sans-serif] font-bold text-gray-900 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2' }}>
                  {event.title}
                </div>
                {event.date && (
                  <div className="text-sm md:text-base text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ marginBottom: 'var(--space-1)', lineHeight: '1.4' }}>
                    📅 {event.date}
                  </div>
                )}
                {event.location && (
                  <div className="text-xs md:text-sm text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4' }}>
                    📍 {event.location}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Event Forms */}
          <div style={{ display: 'grid', gap: 'var(--space-7)' }}>
            {EVENTS.map((event) => (
              <div key={event.id} id={`${event.id}-section`} className="scroll-mt-8">
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

                {/* Event Form */}
                <div className="card">
                  <div className="text-center" style={{ marginBottom: 'var(--space-3)' }}>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2' }}>
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
                    <p className="text-base md:text-lg text-[#666] font-['Bitter',serif]" style={{ marginBottom: 0, maxWidth: '600px', marginInline: 'auto', lineHeight: '1.5' }}>
                      {event.description}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg border-4 border-[#427d78] relative" style={{ padding: 'var(--space-3)' }}>
                    {loadingStates[event.id] && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg z-10">
                        <LoadingStates size="lg" />
                        <p className="text-lg text-gray-600 font-['Bitter',serif] font-medium" style={{ marginTop: 'var(--space-3)' }}>Loading ticket form...</p>
                        <div className="w-full max-w-md space-y-3" style={{ marginTop: 'var(--space-4)', paddingInline: 'var(--space-4)' }}>
                          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                    )}
                    <div style={{ position: 'relative', overflow: 'hidden', height: '1400px', width: '100%' }}>
                      <iframe 
                        title={`${event.title} ticket form powered by Zeffy`}
                        style={{ position: 'absolute', border: 0, top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' }} 
                        src={event.zeffyUrl.replace('?modal=true', '')}
                        allow="payment"
                        onLoad={() => handleIframeLoad(event.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Questions Card */}
          <div className="card text-center" style={{ marginTop: 'var(--space-4)' }}>
            <h3 className="text-xl md:text-2xl font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)' }}>
              Questions About Events?
            </h3>
            <p className="text-base md:text-lg text-[#666] font-['Bitter',serif]" style={{ marginBottom: 0, maxWidth: '700px', marginInline: 'auto', lineHeight: '1.7' }}>
              Contact us at <a href="tel:+17074624343" className="text-[#427d78] hover:text-[#5eb3a1]">(707) 462-4343</a> or email{' '}
              <a href="mailto:director@ukiahseniorcenter.org" className="text-[#427d78] hover:text-[#5eb3a1]">director@ukiahseniorcenter.org</a>
            </p>
          </div>

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
