'use client';

import { useEffect, useState } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';

export default function InternalSuccessPage() {
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/internal';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff] min-h-screen" style={{ padding: 'var(--space-5)' }}>
        <div className="container mx-auto" style={{ maxWidth: '800px' }}>
          
          {/* Success Message */}
          <div className="bg-green-50 border-4 border-green-500 rounded-lg text-center" style={{ padding: 'var(--space-6)' }}>
            <div style={{ fontSize: '5rem', marginBottom: 'var(--space-3)' }}>✅</div>
            <h1 className="font-['Jost',sans-serif] font-bold text-green-900 text-4xl" style={{ marginBottom: 'var(--space-3)' }}>
              Sale Recorded Successfully!
            </h1>
            <p className="font-['Bitter',serif] text-green-800 text-xl" style={{ marginBottom: 'var(--space-4)' }}>
              Email receipt sent to customer
            </p>
            
            <div className="bg-white border-2 border-green-500 rounded-lg" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <p className="font-['Jost',sans-serif] font-bold text-green-900 text-2xl" style={{ marginBottom: 'var(--space-2)' }}>
                Returning to sales form in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>

            <button
              onClick={() => window.location.href = '/internal'}
              className="bg-[#427d78] hover:bg-[#356860] text-white font-['Jost',sans-serif] font-bold text-lg rounded-lg transition-colors"
              style={{ padding: 'var(--space-3) var(--space-5)' }}
            >
              Return to Sales Form Now
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
