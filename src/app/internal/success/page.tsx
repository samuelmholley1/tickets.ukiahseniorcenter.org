'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

interface SaleData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  checkNumber?: string;
  staffInitials: string;
  christmasMember: number;
  christmasNonMember: number;
  nyeMember: number;
  nyeNonMember: number;
  christmasTotal: number;
  nyeTotal: number;
  grandTotal: number;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [saleData, setSaleData] = useState<SaleData | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        setSaleData(JSON.parse(decodeURIComponent(data)));
      } catch (err) {
        console.error('Failed to parse sale data:', err);
        router.push('/internal');
      }
    } else {
      router.push('/internal');
    }
  }, [searchParams, router]);

  if (!saleData) {
    return (
      <>
        <SiteNavigation />
        <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)', minHeight: '60vh' }}>
          <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
            <p className="font-['Bitter',serif] text-gray-600">Loading...</p>
          </div>
        </div>
        <SiteFooterContent />
      </>
    );
  }

  const CHRISTMAS_MEMBER = 15;
  const CHRISTMAS_NON_MEMBER = 20;
  const NYE_MEMBER = 35;
  const NYE_NON_MEMBER = 40;

  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          {/* Success Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-2)' }}>✓</div>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Sale Recorded Successfully!
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              The ticket sale has been added to Airtable
            </p>
          </div>

          {/* Sale Summary */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
              Sale Summary
            </h2>

            {/* Customer Info */}
            <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 className="font-['Jost',sans-serif] font-bold text-gray-800 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                Customer Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-2)', fontSize: '0.95rem' }}>
                <span className="font-['Bitter',serif] font-bold text-gray-700">Name:</span>
                <span className="font-['Bitter',serif] text-gray-800">{saleData.firstName} {saleData.lastName}</span>
                
                <span className="font-['Bitter',serif] font-bold text-gray-700">Email:</span>
                <span className="font-['Bitter',serif] text-gray-800">{saleData.email}</span>
                
                <span className="font-['Bitter',serif] font-bold text-gray-700">Phone:</span>
                <span className="font-['Bitter',serif] text-gray-800">{saleData.phone}</span>
                
                <span className="font-['Bitter',serif] font-bold text-gray-700">Payment:</span>
                <span className="font-['Bitter',serif] text-gray-800">
                  {saleData.paymentMethod.charAt(0).toUpperCase() + saleData.paymentMethod.slice(1)}
                  {saleData.checkNumber && ` (Check #${saleData.checkNumber})`}
                </span>
                
                <span className="font-['Bitter',serif] font-bold text-gray-700">Staff:</span>
                <span className="font-['Bitter',serif] text-gray-800">{saleData.staffInitials}</span>
              </div>
            </div>

            {/* Tickets Sold */}
            {saleData.christmasTotal > 0 && (
              <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 className="font-['Jost',sans-serif] font-bold text-gray-800 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                  Christmas Drive-Thru Meal
                </h3>
                <div style={{ fontSize: '0.95rem' }}>
                  {saleData.christmasMember > 0 && (
                    <div style={{ marginBottom: 'var(--space-1)' }}>
                      <span className="font-['Bitter',serif] text-gray-800">
                        {saleData.christmasMember} × Member Ticket{saleData.christmasMember !== 1 ? 's' : ''} @ ${CHRISTMAS_MEMBER}
                      </span>
                      <span className="font-['Jost',sans-serif] font-bold text-[#427d78] float-right">
                        ${(saleData.christmasMember * CHRISTMAS_MEMBER).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {saleData.christmasNonMember > 0 && (
                    <div style={{ marginBottom: 'var(--space-1)' }}>
                      <span className="font-['Bitter',serif] text-gray-800">
                        {saleData.christmasNonMember} × Non-Member Ticket{saleData.christmasNonMember !== 1 ? 's' : ''} @ ${CHRISTMAS_NON_MEMBER}
                      </span>
                      <span className="font-['Jost',sans-serif] font-bold text-[#427d78] float-right">
                        ${(saleData.christmasNonMember * CHRISTMAS_NON_MEMBER).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '2px solid #ddd' }}>
                    <span className="font-['Jost',sans-serif] font-bold text-gray-900">Subtotal:</span>
                    <span className="font-['Jost',sans-serif] font-bold text-[#427d78] float-right text-lg">
                      ${saleData.christmasTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {saleData.nyeTotal > 0 && (
              <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 className="font-['Jost',sans-serif] font-bold text-gray-800 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                  New Year&apos;s Eve Gala Dance
                </h3>
                <div style={{ fontSize: '0.95rem' }}>
                  {saleData.nyeMember > 0 && (
                    <div style={{ marginBottom: 'var(--space-1)' }}>
                      <span className="font-['Bitter',serif] text-gray-800">
                        {saleData.nyeMember} × Member Ticket{saleData.nyeMember !== 1 ? 's' : ''} @ ${NYE_MEMBER}
                      </span>
                      <span className="font-['Jost',sans-serif] font-bold text-[#427d78] float-right">
                        ${(saleData.nyeMember * NYE_MEMBER).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {saleData.nyeNonMember > 0 && (
                    <div style={{ marginBottom: 'var(--space-1)' }}>
                      <span className="font-['Bitter',serif] text-gray-800">
                        {saleData.nyeNonMember} × Non-Member Ticket{saleData.nyeNonMember !== 1 ? 's' : ''} @ ${NYE_NON_MEMBER}
                      </span>
                      <span className="font-['Jost',sans-serif] font-bold text-[#427d78] float-right">
                        ${(saleData.nyeNonMember * NYE_NON_MEMBER).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '2px solid #ddd' }}>
                    <span className="font-['Jost',sans-serif] font-bold text-gray-900">Subtotal:</span>
                    <span className="font-['Jost',sans-serif] font-bold text-[#427d78] float-right text-lg">
                      ${saleData.nyeTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Grand Total */}
            <div style={{ padding: 'var(--space-3)', background: '#427d78', borderRadius: '8px' }}>
              <span className="font-['Jost',sans-serif] font-bold text-white text-xl">Total Amount Paid:</span>
              <span className="font-['Jost',sans-serif] font-bold text-white float-right text-2xl">
                ${saleData.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Link
              href="/internal"
              className="block text-center bg-[#427d78] hover:bg-[#5eb3a1] text-white font-['Jost',sans-serif] font-bold text-lg py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Record Another Sale
            </Link>
            <Link
              href="/internal/list"
              className="block text-center bg-gray-600 hover:bg-gray-700 text-white font-['Jost',sans-serif] font-bold text-lg py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              View Sold Tickets
            </Link>
          </div>

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
            <p className="font-['Bitter',serif] text-gray-600">Loading...</p>
          </div>
        </div>
        <SiteFooterContent />
      </>
    }>
      <SuccessContent />
    </Suspense>
  );
}
