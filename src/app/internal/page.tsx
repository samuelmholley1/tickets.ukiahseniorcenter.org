'use client';

import Link from 'next/link';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

export default function InternalPage() {
  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container">
          
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Internal Ticket Sales
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ marginBottom: 'var(--space-3)', maxWidth: '800px', marginInline: 'auto', lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Staff use only - Enter cash or check ticket sales
            </p>
          </div>

          {/* Event Selection Buttons */}
          <div className="grid-cards" style={{ marginBottom: 'var(--space-4)', maxWidth: '900px', marginInline: 'auto' }}>
            <Link
              href="/internal/christmas-drive-thru-2025"
              className="group flex flex-col items-center justify-center text-center bg-white rounded-lg border-4 border-[#427d78] hover:bg-[#427d78] transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ padding: '24px 20px', minHeight: '180px' }}
            >
              <div className="text-lg md:text-xl font-['Jost',sans-serif] font-bold text-gray-900 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2' }}>
                Christmas Drive-Thru Meal
              </div>
              <div className="text-sm md:text-base text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ marginBottom: 'var(--space-1)', lineHeight: '1.4' }}>
                📅 December 23, 2025
              </div>
              <div className="text-xs md:text-sm text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4' }}>
                Enter ticket sale →
              </div>
            </Link>

            <Link
              href="/internal/nye-gala-2025"
              className="group flex flex-col items-center justify-center text-center bg-white rounded-lg border-4 border-[#427d78] hover:bg-[#427d78] transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ padding: '24px 20px', minHeight: '180px' }}
            >
              <div className="text-lg md:text-xl font-['Jost',sans-serif] font-bold text-gray-900 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2' }}>
                New Year&apos;s Eve Gala Dance
              </div>
              <div className="text-sm md:text-base text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ marginBottom: 'var(--space-1)', lineHeight: '1.4' }}>
                📅 December 31, 2025
              </div>
              <div className="text-xs md:text-sm text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4' }}>
                Enter ticket sale →
              </div>
            </Link>
          </div>

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
