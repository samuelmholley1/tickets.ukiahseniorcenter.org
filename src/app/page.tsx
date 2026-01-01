'use client';

// import { useState } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';
// import LoadingStates from '@/components/LoadingStates';

export default function Tickets() {
  // const [loading, setLoading] = useState(true);

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

          {/* Tip Notice */}
          {/* ZEFFY TIP NOTICE - UNCOMMENT WHEN TICKET SALES ARE ACTIVE
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
          */}

          {/* Online Sales Closed Notice */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 border-2 border-[#427d78] rounded-lg" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <h2 className="text-2xl md:text-3xl font-['Jost',sans-serif] font-bold text-[#427d78] text-center" style={{ marginBottom: 'var(--space-3)', lineHeight: '1.3' }}>
              🎉 Online Ticket Sales Have Closed
            </h2>
            <div className="text-center" style={{ marginBottom: 'var(--space-3)' }}>
              <p className="text-lg md:text-xl text-gray-700 font-['Bitter',serif] font-semibold" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.5' }}>
                Don&apos;t worry! You can still purchase tickets at the door.
              </p>
              <p className="text-base md:text-lg text-gray-600 font-['Bitter',serif]" style={{ marginBottom: 'var(--space-3)', maxWidth: '700px', marginInline: 'auto', lineHeight: '1.7' }}>
                We look forward to seeing you at our event! Payment accepted at the entrance.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#427d78]" style={{ padding: 'var(--space-3)', maxWidth: '600px', marginInline: 'auto' }}>
              <p className="text-center text-base md:text-lg text-gray-700 font-['Bitter',serif]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.6' }}>
                <strong className="text-[#427d78]">Check back soon!</strong> Upcoming events and ticket sales will be posted here.
              </p>
              <p className="text-center text-sm md:text-base text-gray-600 font-['Bitter',serif]" style={{ marginBottom: 0, lineHeight: '1.6' }}>
                Questions? Call us at <a href="tel:+17074624343" className="text-[#427d78] hover:text-[#5eb3a1] font-semibold">(707) 462-4343</a>
              </p>
            </div>
          </div>

          {/* Event Form - COMMENTED OUT FOR NEXT EVENT
          <div className="card">
            <div className="bg-gray-50 rounded-lg border-4 border-[#427d78] relative" style={{ padding: 'var(--space-3)' }}>
              {loading && (
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
              <div style={{ position: 'relative', overflow: 'hidden', height: '450px', width: '100%', paddingTop: '450px' }}>
                <iframe 
                  title="Donation form powered by Zeffy"
                  style={{ position: 'absolute', border: 0, top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' }} 
                  src="https://www.zeffy.com/embed/ticketing/new-years-eve-gala-dance--2025"
                  allow="payment"
                  onLoad={() => setLoading(false)}
                />
              </div>
            </div>
          </div>
          */}

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
