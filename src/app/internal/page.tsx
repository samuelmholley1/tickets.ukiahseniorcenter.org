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

          {/* Unified Sales Form Button */}
          <div style={{ marginBottom: 'var(--space-4)', maxWidth: '600px', marginInline: 'auto' }}>
            <Link
              href="/internal/sales"
              className="group flex flex-col items-center justify-center text-center bg-white rounded-lg border-4 border-[#427d78] hover:bg-[#427d78] transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ padding: '32px 24px', minHeight: '200px' }}
            >
              <div className="text-2xl md:text-3xl font-['Jost',sans-serif] font-bold text-gray-900 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--space-3)', lineHeight: '1.2' }}>
                Record Ticket Sale
              </div>
              <div className="text-base md:text-lg text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.5' }}>
                Sell tickets for both events
              </div>
              <div className="text-sm text-[#666] group-hover:text-white transition-colors font-['Bitter',serif]" style={{ lineHeight: '1.4', opacity: '0.9' }}>
                Christmas Drive-Thru • NYE Gala Dance
              </div>
            </Link>
          </div>

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
