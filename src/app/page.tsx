'use client';

import { useState } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';
import LoadingStates from '@/components/LoadingStates';

export default function Tickets() {
  const [isSpeakeasyLoading, setIsSpeakeasyLoading] = useState(true);
  const [isSponsorshipLoading, setIsSponsorshipLoading] = useState(true);

  const scrollToForm = (formId: string) => {
    const element = document.getElementById(formId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
          <div className="grid-cards" style={{ marginBottom: 'var(--space-4)', maxWidth: '800px', marginInline: 'auto' }}>
            <button
              onClick={() => scrollToForm('speakeasy-section')}
              className="group flex flex-col items-center justify-center text-center bg-white rounded-lg border-4 border-amber-600 hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              style={{ padding: '24px 20px', minHeight: '180px' }}
              aria-label="Purchase An Affair to Remember tickets"
            >
              <div className="text-4xl" style={{ marginBottom: 'var(--space-2)' }}>🎭</div>
              <div className="text-lg md:text-xl font-['Jost',sans-serif] font-bold text-gray-900 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--space-1)', lineHeight: '1.2' }}>An Affair to Remember</div>
              <div className="text-xs md:text-sm text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4' }}>A Night at the Speakeasy</div>
              <div className="text-sm text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4' }}>April 11, 2026</div>
              <div className="text-base md:text-lg font-bold text-amber-600 group-hover:text-white transition-colors font-['Jost',sans-serif]" style={{ marginTop: 'var(--space-1)' }}>$100 per person</div>
            </button>
            <button
              onClick={() => scrollToForm('sponsorship-section')}
              className="group flex flex-col items-center justify-center text-center bg-white rounded-lg border-4 border-yellow-700 hover:bg-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              style={{ padding: '24px 20px', minHeight: '180px' }}
              aria-label="Purchase Table Sponsorship"
            >
              <div className="text-4xl" style={{ marginBottom: 'var(--space-2)' }}>🥂</div>
              <div className="text-lg md:text-xl font-['Jost',sans-serif] font-bold text-gray-900 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--space-1)', lineHeight: '1.2' }}>Table Sponsorship</div>
              <div className="text-xs md:text-sm text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4' }}>An Affair to Remember</div>
              <div className="text-sm text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4' }}>April 11, 2026</div>
              <div className="text-base md:text-lg font-bold text-yellow-700 group-hover:text-white transition-colors font-['Jost',sans-serif]" style={{ marginTop: 'var(--space-1)' }}>Starting at $400</div>
            </button>
          </div>

          {/* Sign Up Forms */}
          <div style={{ display: 'grid', gap: 'var(--space-7)' }}>
            {/* An Affair to Remember Section */}
            <div id="speakeasy-section" className="scroll-mt-8">
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
                    style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>

              {/* An Affair to Remember Form */}
              <div className="card">
                <div className="text-center" style={{ marginBottom: 'var(--space-3)' }}>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-['Jost',sans-serif] font-bold text-amber-700" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2' }}>🎭 An Affair to Remember</h2>
                  <p className="text-base md:text-lg text-[#666] font-['Bitter',serif]" style={{ marginBottom: 0, maxWidth: '600px', marginInline: 'auto', lineHeight: '1.5' }}>A Night at the Speakeasy • April 11, 2026 • $100 per person</p>
                </div>
                <div className="bg-amber-50 rounded-lg border-4 border-amber-600 relative" style={{ padding: 'var(--space-3)' }}>
                  {isSpeakeasyLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 rounded-lg z-10">
                      <LoadingStates size="lg" />
                      <p className="text-lg text-gray-600 font-['Bitter',serif] font-medium" style={{ marginTop: 'var(--space-3)' }}>Loading ticket form...</p>
                      <div className="w-full max-w-md space-y-3" style={{ marginTop: 'var(--space-4)', paddingInline: 'var(--space-4)' }}>
                        <div className="h-12 bg-amber-200 rounded-lg animate-pulse"></div>
                        <div className="h-12 bg-amber-200 rounded-lg animate-pulse"></div>
                        <div className="h-12 bg-amber-200 rounded-lg animate-pulse"></div>
                        <div className="h-24 bg-amber-200 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                  )}
                  <div style={{ position: 'relative', overflow: 'hidden', height: '1400px', width: '100%' }}>
                    <iframe
                      title="An Affair to Remember tickets powered by Zeffy"
                      style={{ position: 'absolute', border: 0, top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' }}
                      src="https://www.zeffy.com/embed/ticketing/an-affair-to-remember-2026-a-night-at-the-speakeasy"
                      allow="payment"
                      onLoad={() => setIsSpeakeasyLoading(false)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Sponsorship Section */}
            <div id="sponsorship-section" className="scroll-mt-8">
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
                    style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>

              {/* Table Sponsorship Form */}
              <div className="card">
                <div className="text-center" style={{ marginBottom: 'var(--space-3)' }}>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-['Jost',sans-serif] font-bold text-yellow-800" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2' }}>🥂 Table Sponsorship</h2>
                  <p className="text-base md:text-lg text-[#666] font-['Bitter',serif]" style={{ marginBottom: 0, maxWidth: '600px', marginInline: 'auto', lineHeight: '1.5' }}>An Affair to Remember • A Night at the Speakeasy • April 11, 2026 • Sponsorship tables starting at $400</p>
                </div>
                <div className="bg-yellow-50 rounded-lg border-4 border-yellow-700 relative" style={{ padding: 'var(--space-3)' }}>
                  {isSponsorshipLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-50 rounded-lg z-10">
                      <LoadingStates size="lg" />
                      <p className="text-lg text-gray-600 font-['Bitter',serif] font-medium" style={{ marginTop: 'var(--space-3)' }}>Loading sponsorship form...</p>
                      <div className="w-full max-w-md space-y-3" style={{ marginTop: 'var(--space-4)', paddingInline: 'var(--space-4)' }}>
                        <div className="h-12 bg-yellow-200 rounded-lg animate-pulse"></div>
                        <div className="h-12 bg-yellow-200 rounded-lg animate-pulse"></div>
                        <div className="h-12 bg-yellow-200 rounded-lg animate-pulse"></div>
                        <div className="h-24 bg-yellow-200 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                  )}
                  <div style={{ position: 'relative', overflow: 'hidden', height: '450px', width: '100%', paddingTop: '450px' }}>
                    <iframe
                      title="Donation form powered by Zeffy"
                      style={{ position: 'absolute', border: 0, top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' }}
                      src="https://www.zeffy.com/embed/ticketing/table-sponsors-an-affair-to-remember-2026-a-night-at-the-speakeasy"
                      allow="payment"
                      allowTransparency={true}
                      onLoad={() => setIsSponsorshipLoading(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
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
