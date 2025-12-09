'use client';

import { useState } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';

export default function TicketDesignPage() {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Smith');
  const [christmasMember, setChristmasMember] = useState(2);
  const [nyeMember, setNyeMember] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/tickets/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          christmasMember: parseInt(christmasMember.toString()) || 0,
          christmasNonMember: 0,
          nyeMember: parseInt(nyeMember.toString()) || 0,
          nyeNonMember: 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-design-test.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <SiteNavigation />
      <div className="bg-[#fafbff] min-h-screen" style={{ padding: 'var(--space-5)' }}>
        <div className="max-w-2xl mx-auto">
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Ticket Design Testing
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Download sample tickets to test spacing and design improvements
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0]" style={{ padding: 'var(--space-4)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="block font-['Jost',sans-serif] font-medium text-[#333] mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border-2 border-[#ddd] rounded-lg px-4 py-3 font-['Bitter',serif] text-base focus:outline-none focus:border-[#427d78]"
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="block font-['Jost',sans-serif] font-medium text-[#333] mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border-2 border-[#ddd] rounded-lg px-4 py-3 font-['Bitter',serif] text-base focus:outline-none focus:border-[#427d78]"
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="block font-['Jost',sans-serif] font-medium text-[#333] mb-2">
                Christmas Tickets
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={christmasMember}
                onChange={(e) => setChristmasMember(parseInt(e.target.value) || 0)}
                className="w-full border-2 border-[#ddd] rounded-lg px-4 py-3 font-['Bitter',serif] text-base focus:outline-none focus:border-[#427d78]"
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="block font-['Jost',sans-serif] font-medium text-[#333] mb-2">
                NYE Tickets
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={nyeMember}
                onChange={(e) => setNyeMember(parseInt(e.target.value) || 0)}
                className="w-full border-2 border-[#ddd] rounded-lg px-4 py-3 font-['Bitter',serif] text-base focus:outline-none focus:border-[#427d78]"
              />
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-[#427d78] hover:bg-[#356860] text-white font-['Jost',sans-serif] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ padding: 'var(--space-3)' }}
            >
              {isDownloading ? 'Generating PDF...' : 'Download Test Tickets'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] mt-6" style={{ padding: 'var(--space-4)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl mb-3">
              Current Spacing Issues
            </h2>
            <ul className="font-['Bitter',serif] text-[#666] space-y-2" style={{ lineHeight: '1.6' }}>
              <li>• Logo placement and size relative to text</li>
              <li>• Vertical spacing between title, date, and details</li>
              <li>• Guest name position at bottom</li>
              <li>• Footer position and spacing</li>
              <li>• Overall balance within 3.5&quot; x 2&quot; ticket</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] mt-6" style={{ padding: 'var(--space-4)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl mb-3">
              Design Notes
            </h2>
            <div className="font-['Bitter',serif] text-[#666] space-y-2" style={{ lineHeight: '1.6' }}>
              <p><strong>Ticket Size:</strong> 3.5&quot; × 2&quot; (2 per row, 4 rows = 8 per page)</p>
              <p><strong>Logo:</strong> 30% width on left, vertically centered</p>
              <p><strong>Fonts:</strong></p>
              <ul className="ml-6">
                <li>• Title: 16pt bold (event color)</li>
                <li>• Date: 11pt bold black</li>
                <li>• Details: 10pt normal black</li>
                <li>• Guest: 10pt bold (event color)</li>
                <li>• Footer: 8pt bold black</li>
              </ul>
              <p><strong>Colors:</strong></p>
              <ul className="ml-6">
                <li>• Christmas: #427d78 (teal)</li>
                <li>• NYE: #7c3aed (purple)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
