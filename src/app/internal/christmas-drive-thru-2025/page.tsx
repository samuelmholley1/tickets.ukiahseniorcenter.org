'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

export default function ChristmasDriveThruForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    paymentMethod: 'cash',
    checkNumber: '',
    amountPaid: '',
    staffInitials: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend/database
    console.log('Form submitted:', formData);
    
    // Show success message
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        paymentMethod: 'cash',
        checkNumber: '',
        amountPaid: '',
        staffInitials: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          
          {/* Back Link */}
          <Link 
            href="/internal" 
            className="inline-flex items-center text-[#427d78] hover:text-[#5eb3a1] font-['Bitter',serif] mb-4"
            style={{ marginBottom: 'var(--space-3)' }}
          >
            ← Back to Internal Sales
          </Link>

          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              Christmas Drive-Thru Meal
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              December 23, 2025
            </p>
            <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
              Enter cash or check ticket sale
            </p>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="bg-green-50 border-2 border-green-400 rounded-lg text-center" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <p className="text-green-900 font-['Jost',sans-serif] font-bold text-lg">
                ✓ Ticket sale recorded successfully!
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="card">
            <form onSubmit={handleSubmit}>
              
              {/* Customer Information */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                  Customer Information
                </h2>
                
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label htmlFor="firstName" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label htmlFor="lastName" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label htmlFor="email" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                  Payment Information
                </h2>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label htmlFor="paymentMethod" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value, checkNumber: e.target.value === 'cash' ? '' : formData.checkNumber})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                {formData.paymentMethod === 'check' && (
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <label htmlFor="checkNumber" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                      Check Number *
                    </label>
                    <input
                      type="text"
                      id="checkNumber"
                      required
                      value={formData.checkNumber}
                      onChange={(e) => setFormData({...formData, checkNumber: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    />
                  </div>
                )}

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label htmlFor="amountPaid" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Amount Paid (Per Ticket) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-['Bitter',serif]">$</span>
                    <input
                      type="number"
                      id="amountPaid"
                      required
                      step="0.01"
                      min="0"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData({...formData, amountPaid: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Staff Information */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                  Staff Information
                </h2>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label htmlFor="staffInitials" className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Staff Initials/Name *
                  </label>
                  <input
                    type="text"
                    id="staffInitials"
                    required
                    value={formData.staffInitials}
                    onChange={(e) => setFormData({...formData, staffInitials: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    placeholder="e.g., JD or John Doe"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#427d78] hover:bg-[#5eb3a1] text-white font-['Jost',sans-serif] font-bold text-lg py-4 rounded-lg transition-colors duration-300"
              >
                Submit Ticket Sale
              </button>

            </form>
          </div>

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
