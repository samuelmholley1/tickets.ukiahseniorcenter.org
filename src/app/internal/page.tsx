'use client';

import { useState, FormEvent } from 'react';

import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';
import { TicketList } from '@/components/TicketList';

interface TicketQuantities {
  christmasMember: number;
  christmasNonMember: number;
  nyeMember: number;
  nyeNonMember: number;
}

export default function UnifiedSalesPage() {
  const [quantities, setQuantities] = useState<TicketQuantities>({
    christmasMember: 0,
    christmasNonMember: 0,
    nyeMember: 0,
    nyeNonMember: 0,
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
    staffInitials: '',
    specialRequests: '',
    dessertPreference: ''
  });

  const [vegetarianMeals, setVegetarianMeals] = useState<boolean[]>([]);

  const [wantsDonation, setWantsDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pricing
  const CHRISTMAS_MEMBER = 15;
  const CHRISTMAS_NON_MEMBER = 20;
  const NYE_MEMBER = 35;
  const NYE_NON_MEMBER = 45;

  // Calculate totals
  const christmasTotal = 
    (quantities.christmasMember * CHRISTMAS_MEMBER) + 
    (quantities.christmasNonMember * CHRISTMAS_NON_MEMBER);
  
  const nyeTotal = 
    (quantities.nyeMember * NYE_MEMBER) + 
    (quantities.nyeNonMember * NYE_NON_MEMBER);
  
  const ticketSubtotal = christmasTotal + nyeTotal;
  const donation = wantsDonation ? (parseFloat(donationAmount) || 0) : 0;
  const grandTotal = ticketSubtotal + donation;
  
  const totalTickets = 
    quantities.christmasMember + 
    quantities.christmasNonMember + 
    quantities.nyeMember + 
    quantities.nyeNonMember;

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
          vegetarianMeals: vegetarianMeals.filter(Boolean).length
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
          
          {/* Action Button */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            <a
              href="https://tickets.ukiahseniorcenter.org"
              className="inline-block bg-[#5eb3a1] hover:bg-[#427d78] text-white font-['Jost',sans-serif] font-bold px-6 py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
              style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
            >
              💳 Card Payment? Click Here
            </a>
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

              {/* Christmas Drive-Thru Meal */}
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 className="font-['Jost',sans-serif] font-bold text-gray-800 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                  Christmas Drive-Thru Meal
                </h3>
                <p className="font-['Bitter',serif] text-gray-600 text-sm" style={{ marginBottom: 'var(--space-3)' }}>
                  December 23, 2025 • 12:00 PM - 12:30 PM
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div>
                    <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                      Member Tickets (${CHRISTMAS_MEMBER} each)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quantities.christmasMember}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value) || 0;
                        const totalChristmas = newVal + quantities.christmasNonMember;
                        setQuantities({...quantities, christmasMember: newVal});
                        // Adjust vegetarian array to match new total
                        setVegetarianMeals(prev => {
                          const newArray = [...prev];
                          newArray.length = totalChristmas;
                          return newArray.fill(false, prev.length);
                        });
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif] text-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                      Non-Member Tickets (${CHRISTMAS_NON_MEMBER} each)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quantities.christmasNonMember}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value) || 0;
                        const totalChristmas = quantities.christmasMember + newVal;
                        setQuantities({...quantities, christmasNonMember: newVal});
                        // Adjust vegetarian array to match new total
                        setVegetarianMeals(prev => {
                          const newArray = [...prev];
                          newArray.length = totalChristmas;
                          return newArray.fill(false, prev.length);
                        });
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif] text-lg"
                    />
                  </div>
                </div>

                {/* Vegetarian Meal Options - Individual Checkboxes */}
                {(quantities.christmasMember + quantities.christmasNonMember) > 0 && (
                  <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: '#f1f8f4', border: '2px solid #4caf50', borderRadius: '8px' }}>
                    <h4 className="font-['Jost',sans-serif] font-bold text-[#1b5e20] mb-3" style={{ fontSize: '16px' }}>
                      🌱 Vegetarian Meal Options (Eggplant instead of Prime Rib)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Array.from({ length: quantities.christmasMember + quantities.christmasNonMember }, (_, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px', background: 'white', borderRadius: '6px' }}>
                          <input
                            type="checkbox"
                            checked={vegetarianMeals[i] || false}
                            onChange={(e) => {
                              setVegetarianMeals(prev => {
                                const newArray = [...prev];
                                newArray[i] = e.target.checked;
                                return newArray;
                              });
                            }}
                            style={{ width: '18px', height: '18px', marginRight: '10px', cursor: 'pointer' }}
                          />
                          <span className="font-['Bitter',serif]" style={{ fontSize: '15px', color: '#2e7d32', fontWeight: '500' }}>
                            Make Meal #{i + 1} vegetarian
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {christmasTotal > 0 && (
                  <div style={{ marginTop: 'var(--space-2)', textAlign: 'right' }}>
                    <span className="font-['Jost',sans-serif] font-bold text-[#427d78] text-lg">
                      Subtotal: ${christmasTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* NYE Gala Dance */}
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
                      Member Tickets (${NYE_MEMBER} each)
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
                      Non-Member Tickets (${NYE_NON_MEMBER} each)
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
                {nyeTotal > 0 && (
                  <div style={{ marginTop: 'var(--space-2)', textAlign: 'right' }}>
                    <span className="font-['Jost',sans-serif] font-bold text-[#427d78] text-lg">
                      Subtotal: ${nyeTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

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

              {/* Special Requests and Dessert Preference for Christmas */}
              {christmasTotal > 0 && (
                <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: '#fffaf0', borderRadius: '8px', border: '2px dashed #e5b96f' }}>
                  <h3 className="font-['Jost',sans-serif] font-bold text-[#8b6914] text-lg mb-3">
                    🎄 Christmas Meal Preferences
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                        Special Requests
                        <span className="text-xs text-gray-500" style={{ fontWeight: 'normal', display: 'block', marginTop: '4px' }}>
                          (Allergies, accessibility needs, etc.)
                        </span>
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                        Dessert Preference
                        <span className="text-xs text-gray-500" style={{ fontWeight: 'normal', display: 'block', marginTop: '4px' }}>
                          (Default: Cheesecake)
                        </span>
                      </label>
                      <select
                        value={formData.dessertPreference}
                        onChange={(e) => setFormData({...formData, dessertPreference: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                      >
                        <option value="">Cheesecake (default)</option>
                        <option value="Pumpkin Pie">Pumpkin Pie</option>
                        <option value="Other">Other (specify in Special Requests)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

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
