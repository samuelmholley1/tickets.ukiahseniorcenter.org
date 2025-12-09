'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';
import { TicketList } from '@/components/TicketList';
import LoadingStates from '@/components/LoadingStates';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [saleData, setSaleData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        setSaleData(JSON.parse(decodeURIComponent(dataParam)));
      } catch {
        console.error('Failed to parse sale data');
      }
    }
  }, [searchParams]);

  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          
          {/* Success Message */}
          <div className="card bg-green-50 border-2 border-green-500" style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-2)' }}>✓</div>
              <h1 className="font-['Jost',sans-serif] font-bold text-green-900" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: 'var(--space-2)' }}>
                Sale Successfully Recorded!
              </h1>
              <p className="font-['Bitter',serif] text-green-800" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
                Scroll down to confirm your entry in the list below
              </p>
            </div>
            
            {saleData && typeof saleData.email === 'string' && saleData.email.length > 0 && (
              <div className="bg-green-100 border-2 border-green-500 text-green-900 font-['Jost',sans-serif] font-bold text-base px-6 py-3 rounded-lg" style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
                📧 Email receipt automatically sent to {saleData.email}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
              <Link
                href="/internal"
                className="inline-block bg-[#427d78] hover:bg-[#5eb3a1] text-white font-['Jost',sans-serif] font-bold text-lg px-8 py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                ➕ Record Another Sale
              </Link>
            </div>
          </div>

          {/* Embedded Ticket List */}
          <TicketList />

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}

export default function SalesSuccessPage() {
  return (
    <Suspense fallback={
      <>
        <SiteNavigation />
        <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)', minHeight: '60vh' }}>
          <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
            <LoadingStates size="lg" />
            <p className="font-['Bitter',serif] text-gray-600" style={{ marginTop: 'var(--space-3)' }}>Loading...</p>
          </div>
        </div>
        <SiteFooterContent />
      </>
    }>
      <SuccessContent />
    </Suspense>
  );
}
