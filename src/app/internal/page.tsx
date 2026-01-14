'use client';

import { useState, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';
import { TicketList } from '@/components/TicketList';

/* ========== 2026 EVENTS ==========
 * Valentine's Day Dance - February 14, 2026
 *   - Member: $30 until Feb 9, then $35
 *   - Non-Member: $45 (always)
 * 
 * Speakeasy Gala - April 11, 2026
 *   - All tickets: $100 until Mar 28, then $110
 * ================================= */

interface TicketQuantities {
  valentinesMember: number;
  valentinesNonMember: number;
  speakeasy: number;
  
  /* ========== CHRISTMAS/NYE 2025 - COMMENTED OUT FOR 2026 ==========
  christmasMember: number;
  christmasNonMember: number;
  nyeMember: number;
  nyeNonMember: number;
  ================================================================== */
}

export default function UnifiedSalesPage() {
  const [quantities, setQuantities] = useState<TicketQuantities>({
    valentinesMember: 0,
    valentinesNonMember: 0,
    speakeasy: 0,
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'cash' as 'cash' | 'check' | 'cashCheckSplit' | 'comp' | 'other',
    checkNumber: '',
    cashAmount: '',
    checkAmount: '',
    otherPaymentDetails: '',
    staffInitials: ''
  });

  const [wantsDonation, setWantsDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Dynamic pricing based on current date
  const pricing = useMemo(() => {
    const today = new Date();
    const valentinesPriceChangeDate = new Date('2026-02-10T00:00:00');
    const speakeasyPriceChangeDate = new Date('2026-03-29T00:00:00');
    
    return {
      valentinesMember: today < valentinesPriceChangeDate ? 30 : 35,
      valentinesNonMember: 45,
      speakeasy: today < speakeasyPriceChangeDate ? 100 : 110,
      isValentinesEarlyBird: today < valentinesPriceChangeDate,
      isSpeakeasyEarlyBird: today < speakeasyPriceChangeDate,
    };
  }, []);

  // Calculate totals
  const valentinesTotal = 
    (quantities.valentinesMember * pricing.valentinesMember) + 
    (quantities.valentinesNonMember * pricing.valentinesNonMember);
  
  const speakeasyTotal = quantities.speakeasy * pricing.speakeasy;
  
  const ticketSubtotal = valentinesTotal + speakeasyTotal;
  const donation = wantsDonation ? (parseFloat(donationAmount) || 0) : 0;
  const grandTotal = (ticketSubtotal || 0) + (donation || 0);
  
  const totalTickets = 
    quantities.valentinesMember + 
    quantities.valentinesNonMember + 
    quantities.speakeasy;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (totalTickets === 0) {
      setError('Please select at least one ticket');
      return;
    }

    if (wantsDonation && (!donationAmount || parseFloat(donationAmount) <= 0)) {
      setError('Please enter a donation amount or select "No"');
      return;
    }

    // Validate split payment totals match
    if (formData.paymentMethod === 'cashCheckSplit') {
      const cashAmt = parseFloat(formData.cashAmount || '0');
      const checkAmt = parseFloat(formData.checkAmount || '0');
      const splitTotal = cashAmt + checkAmt;
      
      if (Math.abs(splitTotal - grandTotal) > 0.01) {
        setError(`Payment amounts don't match total due. Cash ($${cashAmt.toFixed(2)}) + Check ($${checkAmt.toFixed(2)}) = $${splitTotal.toFixed(2)}, but total due is $${grandTotal.toFixed(2)}`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantities,
          customer: formData,
          donation: wantsDonation ? parseFloat(donationAmount) : 0,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit ticket sale');
      }

      // Redirect to success page
      console.log('[internal] Submission successful, redirecting to success page');
      window.location.href = '/internal/success';
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubmitting(false);
    }
  };

  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          {/* Card Payment Button */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link
              href="/"
              className="inline-block bg-[#5eb3a1] hover:bg-[#427d78] text-white font-['Jost',sans-serif] font-bold px-6 py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
              style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
            >
              💳 Card Payment? Click Here
            </Link>
          </div>

          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Ticket Sales
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Staff use only - Record cash or check ticket sales
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-400 rounded-lg text-center" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <p className="text-red-900 font-['Jost',sans-serif] font-bold text-lg">
                ✗ {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Ticket Selection */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                Select Tickets
              </h2>

              {/* Valentine's Day Dance */}
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)', borderRadius: '8px', border: '2px solid #ffb6c1' }}>
                <h3 className="font-['Jost',sans-serif] font-bold text-[#c41e3a] text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                  💕 Valentine&apos;s Day Dance
                </h3>
                <p className="font-['Bitter',serif] text-gray-600 text-sm" style={{ marginBottom: 'var(--space-3)' }}>
                  February 14, 2026
                  {pricing.isValentinesEarlyBird && (
                    <span className="ml-2 inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      🎉 EARLY BIRD until Feb 9!
                    </span>
                  )}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                      Member Tickets (${pricing.valentinesMember} each)
                      {pricing.isValentinesEarlyBird && (
                        <span className="block text-xs text-green-600 mt-1">Regular price: $35 after Feb 9</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quantities.valentinesMember}
                      onChange={(e) => setQuantities({...quantities, valentinesMember: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#c41e3a] focus:outline-none font-['Bitter',serif] text-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                      Non-Member Tickets (${pricing.valentinesNonMember} each)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quantities.valentinesNonMember}
                      onChange={(e) => setQuantities({...quantities, valentinesNonMember: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#c41e3a] focus:outline-none font-['Bitter',serif] text-lg"
                    />
                  </div>
                </div>
                {valentinesTotal > 0 && (
                  <div style={{ marginTop: 'var(--space-2)', textAlign: 'right' }}>
                    <span className="font-['Jost',sans-serif] font-bold text-[#c41e3a] text-lg">
                      Subtotal: ${valentinesTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Speakeasy Gala */}
              <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '8px', border: '2px solid #d97706' }}>
                <h3 className="font-['Jost',sans-serif] font-bold text-amber-800 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                  🎭 An Affair to Remember: A Night at the Speakeasy
                </h3>
                <p className="font-['Bitter',serif] text-amber-700 text-sm" style={{ marginBottom: 'var(--space-3)' }}>
                  April 11, 2026
                  {pricing.isSpeakeasyEarlyBird && (
                    <span className="ml-2 inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      🎉 EARLY BIRD until Mar 28!
                    </span>
                  )}
                </p>

                <div>
                  <label className="block font-['Bitter',serif] text-amber-900 font-medium mb-2">
                    Tickets (${pricing.speakeasy} each)
                    {pricing.isSpeakeasyEarlyBird && (
                      <span className="block text-xs text-green-700 mt-1">Regular price: $110 after Mar 28</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantities.speakeasy}
                    onChange={(e) => setQuantities({...quantities, speakeasy: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border-2 border-amber-500 rounded-lg focus:border-amber-400 focus:outline-none font-['Bitter',serif] text-lg bg-white/90"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
                {speakeasyTotal > 0 && (
                  <div style={{ marginTop: 'var(--space-2)', textAlign: 'right' }}>
                    <span className="font-['Jost',sans-serif] font-bold text-amber-800 text-lg">
                      Subtotal: ${speakeasyTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* ========== NYE GALA 2025 SECTION - COMMENTED OUT FOR 2026 ==========
               * Event Period: December 31, 2025
               * Disabled: January 13, 2026
               * Reason: Event concluded, preserved for next year
               * ====================================================================
              <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 className="font-['Jost',sans-serif] font-bold text-gray-800 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                  New Year&apos;s Eve Gala Dance
                </h3>
                <p className="font-['Bitter',serif] text-gray-600 text-sm" style={{ marginBottom: 'var(--space-3)' }}>
                  December 31, 2025 • 6:00 PM - 10:00 PM
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                      Member Tickets ($35 each)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quantities.nyeMember}
                      onChange={(e) => setQuantities({...quantities, nyeMember: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif] text-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                      Non-Member Tickets ($45 each)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quantities.nyeNonMember}
                      onChange={(e) => setQuantities({...quantities, nyeNonMember: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif] text-lg"
                    />
                  </div>
                </div>
              </div>
              ========== END NYE SECTION ========== */}

              {/* Donation Section */}
              {ticketSubtotal > 0 && (
                <div style={{ 
                  marginTop: 'var(--space-4)', 
                  padding: 'var(--space-4)', 
                  background: 'rgba(220, 53, 69, 0.04)',
                  border: '2px solid rgba(220, 53, 69, 0.2)',
                  borderRadius: '12px'
                }}>
                  <label className="block font-['Jost',sans-serif] font-bold text-gray-800 text-xl mb-3">
                    💝 Would the customer like to make a donation today? *
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                    <label className="flex items-center cursor-pointer px-4 py-2 rounded-lg hover:bg-white/50 transition-colors">
                      <input
                        type="radio"
                        name="donation"
                        checked={!wantsDonation}
                        onChange={() => { setWantsDonation(false); setDonationAmount(''); }}
                        className="mr-2 w-5 h-5"
                      />
                      <span className="font-['Bitter',serif] text-lg font-semibold">No, thank you</span>
                    </label>
                    <label className="flex items-center cursor-pointer px-4 py-2 rounded-lg hover:bg-white/50 transition-colors">
                      <input
                        type="radio"
                        name="donation"
                        checked={wantsDonation}
                        onChange={() => setWantsDonation(true)}
                        className="mr-2 w-5 h-5"
                      />
                      <span className="font-['Bitter',serif] text-lg font-semibold text-[#dc3545]">Yes, I&apos;d like to donate</span>
                    </label>
                  </div>

                  {wantsDonation && (
                    <div style={{ 
                      marginTop: 'var(--space-3)', 
                      padding: 'var(--space-3)', 
                      background: 'white',
                      borderRadius: '8px'
                    }}>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                        Donation Amount *
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        max="10000"
                        step="0.01"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border-2 border-[#dc3545] rounded-lg focus:border-[#c82333] focus:outline-none font-['Bitter',serif] text-lg"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Total Breakdown */}
              {grandTotal > 0 && (
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span className="font-['Bitter',serif] text-gray-700">
                      Ticket Subtotal ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''}):
                    </span>
                    <span className="font-['Jost',sans-serif] font-bold text-gray-900">
                      ${ticketSubtotal.toFixed(2)}
                    </span>
                  </div>
                  {donation > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <span className="font-['Bitter',serif] text-gray-700">
                        Donation:
                      </span>
                      <span className="font-['Jost',sans-serif] font-bold text-gray-900">
                        ${donation.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-2)', borderTop: '2px solid #427d78' }}>
                    <span className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl">
                      Total Amount:
                    </span>
                    <span className="font-['Jost',sans-serif] font-bold text-[#427d78] text-2xl">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                Customer Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({
                      ...formData, 
                      paymentMethod: e.target.value as 'cash' | 'check' | 'cashCheckSplit' | 'comp' | 'other',
                      checkNumber: e.target.value === 'cash' ? '' : formData.checkNumber,
                      cashAmount: e.target.value !== 'cashCheckSplit' ? '' : formData.cashAmount,
                      checkAmount: e.target.value !== 'cashCheckSplit' ? '' : formData.checkAmount,
                      otherPaymentDetails: e.target.value !== 'other' ? '' : formData.otherPaymentDetails
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="cashCheckSplit">Cash & Check</option>
                    <option value="comp">Comp (Complimentary)</option>
                    <option value="other">Other (please specify)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Staff Initials/Name * 
                    <span className="text-xs text-gray-500" style={{ fontWeight: 'normal', display: 'block', marginTop: '4px' }}>
                      (Who processed this sale?)
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staffInitials}
                    onChange={(e) => setFormData({...formData, staffInitials: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    placeholder="e.g., JD or Jane"
                  />
                </div>
              </div>

              {formData.paymentMethod === 'check' && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Check Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.checkNumber}
                    onChange={(e) => setFormData({...formData, checkNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
              )}

              {formData.paymentMethod === 'other' && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Payment Details *
                    <span className="text-xs text-gray-500" style={{ fontWeight: 'normal', display: 'block', marginTop: '4px' }}>
                      (Please specify the payment method)
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.otherPaymentDetails}
                    onChange={(e) => setFormData({...formData, otherPaymentDetails: e.target.value})}
                    placeholder="e.g., Venmo, Zelle, Gift Certificate"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
              )}

              {formData.paymentMethod === 'cashCheckSplit' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                        Cash Amount *
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={formData.cashAmount}
                        onChange={(e) => setFormData({...formData, cashAmount: e.target.value})}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                      />
                    </div>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                        Check Amount *
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={formData.checkAmount}
                        onChange={(e) => setFormData({...formData, checkAmount: e.target.value})}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                      />
                    </div>
                  </div>

                  {/* Split Payment Reconciliation Display */}
                  {(() => {
                    const cashAmt = parseFloat(formData.cashAmount || '0');
                    const checkAmt = parseFloat(formData.checkAmount || '0');
                    const splitTotal = cashAmt + checkAmt;
                    const isReconciled = Math.abs(splitTotal - grandTotal) < 0.01;
                    const difference = splitTotal - grandTotal;
                    
                    return (
                      <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: isReconciled ? '#d4edda' : '#fff3cd', borderRadius: '8px', border: `2px solid ${isReconciled ? '#28a745' : '#ffc107'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                          <span className="font-['Bitter',serif] font-bold">
                            Cash + Check Total:
                          </span>
                          <span className="font-['Jost',sans-serif] font-bold text-xl">
                            ${splitTotal.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                          <span className="font-['Bitter',serif] font-bold">
                            Amount Due:
                          </span>
                          <span className="font-['Jost',sans-serif] font-bold text-xl">
                            ${grandTotal.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ paddingTop: 'var(--space-2)', borderTop: '2px solid rgba(0,0,0,0.1)' }}>
                          {isReconciled ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#28a745' }}>
                              <span style={{ fontSize: '1.5rem' }}>✅</span>
                              <span className="font-['Jost',sans-serif] font-bold">Payment Reconciled</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#856404' }}>
                              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                              <span className="font-['Bitter',serif] font-bold">
                                {difference > 0 ? `Over by $${difference.toFixed(2)}` : `Short by $${Math.abs(difference).toFixed(2)}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                      Check Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.checkNumber}
                      onChange={(e) => setFormData({...formData, checkNumber: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || totalTickets === 0}
              className="w-full bg-[#427d78] hover:bg-[#5eb3a1] text-white font-['Jost',sans-serif] font-bold text-xl py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Recording sale & sending email...' : `Record Sale - $${grandTotal.toFixed(2)}`}
            </button>
            {submitting && (
              <p className="text-center text-gray-600 font-['Bitter',serif] text-sm" style={{ marginTop: 'var(--space-2)' }}>
                This may take a few seconds while we send the email receipt
              </p>
            )}
          </form>

          {/* Embedded Ticket List */}
          <TicketList />

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
