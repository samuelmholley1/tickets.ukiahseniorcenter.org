'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

interface LunchCard {
  id: string;
  name: string;
  phone: string;
  cardType: string;
  totalMeals: number;
  remainingMeals: number;
  memberStatus: string;
}

/* ========== LUNCH PRICING ==========
 * Individual Meals:
 *   - Member Dine In: $8
 *   - Member To Go: $9
 *   - Non-Member Dine In: $10
 *   - Non-Member To Go: $11
 *   - Delivery Add-on: $3
 * 
 * Lunch Cards (prepaid):
 *   5, 10, 15, 20 meal options
 *   Dine In / Pickup / Delivery variants
 *   Member / Non-Member pricing
 * ================================== */

// Pricing constants
const PRICING = {
  individual: {
    memberDineIn: 8,
    memberToGo: 9,
    nonMemberDineIn: 10,
    nonMemberToGo: 11,
    deliveryCharge: 3,
  },
  cards: {
    5: {
      member: { dineIn: 40, pickup: 45, delivery: 60 },
      nonMember: { dineIn: 50, pickup: 55, delivery: 70 },
    },
    10: {
      member: { dineIn: 80, pickup: 90, delivery: 120 },
      nonMember: { dineIn: 100, pickup: 110, delivery: 140 },
    },
    15: {
      member: { dineIn: 120, pickup: 135, delivery: 180 },
      nonMember: { dineIn: 150, pickup: 165, delivery: 210 },
    },
    20: {
      member: { dineIn: 160, pickup: 180, delivery: 240 },
      nonMember: { dineIn: 200, pickup: 220, delivery: 280 },
    },
  },
} as const;

type MealCount = 5 | 10 | 15 | 20;
type MealType = 'dineIn' | 'pickup' | 'delivery';
type MembershipType = 'member' | 'nonMember';
type TransactionType = 'individual' | 'lunchCard';
type PaymentMethodType = 'cash' | 'check' | 'card' | 'lunchCard';

/* ========== RESERVATION DEADLINE LOGIC ==========
 * All meals must be reserved by 2pm the BUSINESS DAY before
 * Closed on Fridays
 * So Thursday 2pm is the deadline for Monday lunch
 * ================================================ */

// Get the next available lunch date based on 2pm deadline rule
const getNextAvailableLunch = (): string => {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const currentHour = now.getHours();
  const isBefore2pm = currentHour < 14;
  
  // Logic:
  // - Mon before 2pm → Tuesday
  // - Mon after 2pm → Wednesday  
  // - Tue before 2pm → Wednesday
  // - Tue after 2pm → Thursday
  // - Wed before 2pm → Thursday
  // - Wed after 2pm → Monday (skip Fri)
  // - Thu before 2pm → Monday (Thu 2pm is Monday deadline)
  // - Thu after 2pm → Tuesday
  // - Fri/Sat/Sun → Tuesday (Monday deadline was Thu 2pm)
  
  let daysToAdd = 1; // Default: tomorrow
  
  switch (currentDay) {
    case 0: // Sunday
      daysToAdd = 2; // Tuesday
      break;
    case 1: // Monday
      daysToAdd = isBefore2pm ? 1 : 2; // Tue or Wed
      break;
    case 2: // Tuesday  
      daysToAdd = isBefore2pm ? 1 : 2; // Wed or Thu
      break;
    case 3: // Wednesday
      daysToAdd = isBefore2pm ? 1 : 5; // Thu or Monday (skip Fri/Sat/Sun)
      break;
    case 4: // Thursday
      daysToAdd = isBefore2pm ? 4 : 5; // Monday or Tuesday
      break;
    case 5: // Friday
      daysToAdd = 4; // Tuesday
      break;
    case 6: // Saturday
      daysToAdd = 3; // Tuesday
      break;
  }
  
  const nextLunch = new Date(now);
  nextLunch.setDate(now.getDate() + daysToAdd);
  return nextLunch.toISOString().split('T')[0];
};

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface SubmitResult {
  success: boolean;
  message: string;
  amount?: number;
}

export default function LunchPage() {
  // Customer info
  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Transaction type
  const [transactionType, setTransactionType] = useState<TransactionType>('individual');

  // Individual meal options
  const [isMember, setIsMember] = useState<MembershipType>('member');
  const [mealType, setMealType] = useState<MealType>('dineIn');
  const [quantity, setQuantity] = useState(1);

  // Lunch card options
  const [cardMealCount, setCardMealCount] = useState<MealCount>(5);
  const [cardMealType, setCardMealType] = useState<MealType>('dineIn');
  const [cardMemberType, setCardMemberType] = useState<MembershipType>('member');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [checkNumber, setCheckNumber] = useState('');
  const [staffInitials, setStaffInitials] = useState('');
  const [notes, setNotes] = useState('');
  
  // Multiple dates support - defaults to next available lunch based on 2pm deadline
  const [selectedDates, setSelectedDates] = useState<string[]>([getNextAvailableLunch()]);
  
  // Generate next 14 days for selection (Mon-Thu only, closed Fri-Sun)
  const getNext14Days = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      // Closed Friday (5), Saturday (6), Sunday (0)
      const isClosed = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      days.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isClosed,
      });
    }
    return days;
  };
  
  const toggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date].sort());
    }
  };

  // Lunch card lookup
  const [lunchCardSearch, setLunchCardSearch] = useState('');
  const [availableLunchCards, setAvailableLunchCards] = useState<LunchCard[]>([]);
  const [selectedLunchCard, setSelectedLunchCard] = useState<LunchCard | null>(null);
  const [isSearchingCards, setIsSearchingCards] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  // Calculate individual meal price
  const calculateIndividualPrice = () => {
    let basePrice = 0;
    if (isMember === 'member') {
      basePrice = mealType === 'dineIn' ? PRICING.individual.memberDineIn : PRICING.individual.memberToGo;
    } else {
      basePrice = mealType === 'dineIn' ? PRICING.individual.nonMemberDineIn : PRICING.individual.nonMemberToGo;
    }
    if (mealType === 'delivery') {
      basePrice = (isMember === 'member' ? PRICING.individual.memberToGo : PRICING.individual.nonMemberToGo) + PRICING.individual.deliveryCharge;
    }
    return basePrice * quantity;
  };

  // Calculate lunch card price
  const calculateCardPrice = () => {
    return PRICING.cards[cardMealCount][cardMemberType][cardMealType];
  };

  // Get total
  const getTotal = () => {
    if (paymentMethod === 'lunchCard') return 0;
    if (transactionType === 'individual') {
      // Price per meal × quantity × number of dates
      const pricePerMeal = calculateIndividualPrice() / quantity; // get single meal price
      return pricePerMeal * quantity * selectedDates.length;
    }
    return calculateCardPrice();
  };

  // Get total meals being ordered
  const getTotalMeals = () => {
    return quantity * selectedDates.length;
  };

  // Search for lunch cards
  const searchLunchCards = async (query: string) => {
    if (!query || query.length < 2) {
      setAvailableLunchCards([]);
      return;
    }
    
    setIsSearchingCards(true);
    try {
      const response = await fetch(`/api/lunch/card?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setAvailableLunchCards(data.cards);
      }
    } catch (error) {
      console.error('Error searching lunch cards:', error);
    } finally {
      setIsSearchingCards(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (paymentMethod === 'lunchCard' && lunchCardSearch) {
        searchLunchCards(lunchCardSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [lunchCardSearch, paymentMethod]);

  // Reset form after successful submission
  const resetForm = () => {
    setCustomer({ firstName: '', lastName: '', email: '', phone: '' });
    setQuantity(1);
    setSelectedDates([getNextAvailableLunch()]);
    setNotes('');
    setCheckNumber('');
    setSelectedLunchCard(null);
    setLunchCardSearch('');
    setAvailableLunchCards([]);
    setSubmitResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      if (transactionType === 'individual') {
        // Create lunch reservations - one record per date per quantity
        const totalMeals = getTotalMeals();
        let successCount = 0;
        let errorMessage = '';

        for (const date of selectedDates) {
          for (let i = 0; i < quantity; i++) {
            const response = await fetch('/api/lunch/reservation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `${customer.firstName} ${customer.lastName}`.trim(),
                date: date,
                mealType: mealType === 'pickup' ? 'toGo' : mealType,
                memberStatus: isMember,
                paymentMethod: paymentMethod,
                lunchCardId: selectedLunchCard?.id,
                notes: notes + (checkNumber ? ` Check #${checkNumber}` : ''),
                staff: staffInitials,
                quantity: 1, // Always 1 per record now
              }),
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
              successCount++;
            } else {
              errorMessage = result.error || 'Failed to create reservation';
              break;
            }
          }
          if (errorMessage) break;
        }

        if (successCount === totalMeals) {
          setSubmitResult({
            success: true,
            message: `Created ${totalMeals} reservation(s) for ${selectedDates.length} date(s). Total: $${getTotal().toFixed(2)}`,
            amount: getTotal(),
          });
          resetForm();
        } else {
          setSubmitResult({
            success: false,
            message: errorMessage || `Only created ${successCount} of ${totalMeals} reservations`,
          });
        }
      } else {
        // Create lunch card
        const response = await fetch('/api/lunch/card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            phone: customer.phone,
            cardType: cardMealCount,
            mealType: cardMealType,
            memberStatus: cardMemberType,
            paymentMethod: paymentMethod === 'lunchCard' ? 'cash' : paymentMethod,
            checkNumber: checkNumber || undefined,
            staff: staffInitials,
          }),
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
          setSubmitResult({
            success: true,
            message: result.message,
            amount: result.amount,
          });
          resetForm();
        } else {
          setSubmitResult({
            success: false,
            message: result.error || 'Failed to create lunch card',
          });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          {/* Back to Internal */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link
              href="/internal"
              className="inline-block bg-[#5eb3a1] hover:bg-[#427d78] text-white font-['Jost',sans-serif] font-bold px-6 py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
              style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
            >
              ← Back to Ticket Sales
            </Link>
          </div>

          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              🍽️ Lunch Sales
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Staff use only - Record lunch purchases and lunch card sales
            </p>
          </div>

          {/* Success/Error Message */}
          {submitResult && (
            <div className={`card ${submitResult.success ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`} style={{ marginBottom: 'var(--space-4)', borderWidth: '3px' }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{submitResult.success ? '✅' : '❌'}</span>
                <div>
                  <div className={`font-['Jost',sans-serif] font-bold text-lg ${submitResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {submitResult.success ? 'Success!' : 'Error'}
                  </div>
                  <div className={`font-['Bitter',serif] ${submitResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {submitResult.message}
                  </div>
                </div>
              </div>
              {submitResult.success && (
                <button
                  type="button"
                  onClick={() => setSubmitResult(null)}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white font-['Jost',sans-serif] font-bold px-4 py-2 rounded-lg"
                >
                  Start New Transaction
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Transaction Type Selection */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                Transaction Type
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => setTransactionType('individual')}
                  className={`p-4 rounded-lg border-3 font-['Jost',sans-serif] font-bold transition-all ${
                    transactionType === 'individual'
                      ? 'bg-[#427d78] text-white border-[#427d78]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#427d78]'
                  }`}
                >
                  🍴 Individual Meal
                  <span className="block text-sm font-normal mt-1">Single meal purchase</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('lunchCard')}
                  className={`p-4 rounded-lg border-3 font-['Jost',sans-serif] font-bold transition-all ${
                    transactionType === 'lunchCard'
                      ? 'bg-[#427d78] text-white border-[#427d78]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#427d78]'
                  }`}
                >
                  💳 Lunch Card
                  <span className="block text-sm font-normal mt-1">Prepaid meal package</span>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                Customer Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={customer.firstName}
                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={customer.lastName}
                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                </div>
              </div>
            </div>

            {/* Individual Meal Options */}
            {transactionType === 'individual' && (
              <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                  Meal Details
                </h2>

                {/* Multiple Dates Selection */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Meal Date(s) * <span className="text-sm text-gray-500">({selectedDates.length} selected)</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                    {getNext14Days().map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDate(day.value)}
                        disabled={day.isClosed}
                        className={`p-2 rounded-lg font-['Jost',sans-serif] text-sm transition-all border-2 ${
                          day.isClosed 
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : selectedDates.includes(day.value)
                              ? 'bg-[#427d78] text-white border-[#427d78]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#427d78]'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 font-['Bitter',serif]">
                    💡 Click multiple dates to reserve for multiple days. Closed Fri-Sun. Must reserve by 2pm day before.
                  </p>
                </div>
                
                {/* Membership Status */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Membership Status</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setIsMember('member')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        isMember === 'member' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ✓ Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMember('nonMember')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        isMember === 'nonMember' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Non-Member
                    </button>
                  </div>
                </div>

                {/* Meal Type */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Meal Type</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setMealType('dineIn')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        mealType === 'dineIn' ? 'bg-[#427d78] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🍽️ Dine In (${isMember === 'member' ? PRICING.individual.memberDineIn : PRICING.individual.nonMemberDineIn})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMealType('pickup')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        mealType === 'pickup' ? 'bg-[#427d78] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📦 To Go (${isMember === 'member' ? PRICING.individual.memberToGo : PRICING.individual.nonMemberToGo})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMealType('delivery')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        mealType === 'delivery' ? 'bg-[#427d78] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🚗 Delivery (+${PRICING.individual.deliveryCharge})
                    </button>
                  </div>
                </div>

                {/* Quantity per day (for multiple people) */}
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                    Meals per Day <span className="text-sm text-gray-500">(for multiple people)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif] text-lg"
                    style={{ maxWidth: '150px' }}
                  />
                  <p className="text-sm text-gray-500 mt-1 font-['Bitter',serif]">
                    💡 Set to 2+ if ordering for multiple people on each selected date.
                  </p>
                </div>
              </div>
            )}

            {/* Lunch Card Options */}
            {transactionType === 'lunchCard' && (
              <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                  Lunch Card Details
                </h2>
                
                {/* Membership Status */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Membership Status</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setCardMemberType('member')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        cardMemberType === 'member' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ✓ Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardMemberType('nonMember')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        cardMemberType === 'nonMember' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Non-Member
                    </button>
                  </div>
                </div>

                {/* Meal Type */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Card Type</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setCardMealType('dineIn')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        cardMealType === 'dineIn' ? 'bg-[#427d78] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🍽️ Dine In
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardMealType('pickup')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        cardMealType === 'pickup' ? 'bg-[#427d78] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📦 Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardMealType('delivery')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        cardMealType === 'delivery' ? 'bg-[#427d78] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🚗 Delivery
                    </button>
                  </div>
                </div>

                {/* Meal Count */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Number of Meals</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-2)' }}>
                    {([5, 10, 15, 20] as MealCount[]).map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setCardMealCount(count)}
                        className={`p-4 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                          cardMealCount === count
                            ? 'bg-[#427d78] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {count} Meals
                        <span className="block text-lg mt-1">
                          ${PRICING.cards[count][cardMemberType][cardMealType]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                Payment
              </h2>
              
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Payment Method</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                      paymentMethod === 'cash' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('check')}
                    className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                      paymentMethod === 'check' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📝 Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                      paymentMethod === 'card' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    💳 Card
                  </button>
                  {transactionType === 'individual' && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('lunchCard')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        paymentMethod === 'lunchCard' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🎫 Use Lunch Card
                    </button>
                  )}
                </div>
              </div>

              {paymentMethod === 'check' && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Check Number</label>
                  <input
                    type="text"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              )}

              {paymentMethod === 'lunchCard' && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4" style={{ marginBottom: 'var(--space-3)' }}>
                  <p className="font-['Bitter',serif] text-amber-800 mb-3">
                    <strong>Search for customer&apos;s lunch card:</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={lunchCardSearch}
                    onChange={(e) => setLunchCardSearch(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none font-['Bitter',serif]"
                  />
                  
                  {isSearchingCards && (
                    <p className="mt-2 text-amber-700 font-['Bitter',serif]">Searching...</p>
                  )}
                  
                  {availableLunchCards.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {availableLunchCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setSelectedLunchCard(card);
                            setLunchCardSearch('');
                            setAvailableLunchCards([]);
                          }}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedLunchCard?.id === card.id
                              ? 'bg-amber-200 border-amber-500'
                              : 'bg-white border-gray-200 hover:border-amber-400'
                          }`}
                        >
                          <div className="font-['Jost',sans-serif] font-bold">{card.name}</div>
                          <div className="font-['Bitter',serif] text-sm text-gray-600">
                            {card.phone} • {card.cardType} • <span className="text-green-600 font-bold">{card.remainingMeals} meals left</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedLunchCard && (
                    <div className="mt-3 bg-green-100 border-2 border-green-400 rounded-lg p-3">
                      <div className="font-['Jost',sans-serif] font-bold text-green-800">Selected Card:</div>
                      <div className="font-['Bitter',serif] text-green-700">
                        {selectedLunchCard.name} - {selectedLunchCard.remainingMeals} meals remaining
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLunchCard(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 font-['Jost',sans-serif]"
                      >
                        ✕ Remove selection
                      </button>
                    </div>
                  )}
                  
                  {!selectedLunchCard && lunchCardSearch.length >= 2 && availableLunchCards.length === 0 && !isSearchingCards && (
                    <p className="mt-2 text-red-600 font-['Bitter',serif]">No lunch cards found with remaining meals.</p>
                  )}
                </div>
              )}

              <div>
                <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Staff/Volunteer Initials *</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={staffInitials}
                  onChange={(e) => setStaffInitials(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif] text-lg uppercase"
                  style={{ maxWidth: '100px' }}
                  placeholder="ABC"
                />
              </div>

              {/* Notes */}
              <div style={{ marginTop: 'var(--space-3)' }}>
                <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requests, delivery address, etc."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  rows={2}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="card" style={{ marginBottom: 'var(--space-4)', background: '#427d78' }}>
              <h2 className="font-['Jost',sans-serif] font-bold text-white text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                Order Summary
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: '4px' }}>Type</div>
                  <div className="text-white font-['Jost',sans-serif] font-bold text-lg">
                    {transactionType === 'individual' ? 'Individual Meal' : `${cardMealCount}-Meal Lunch Card`}
                  </div>
                </div>
                <div>
                  <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: '4px' }}>Details</div>
                  <div className="text-white font-['Jost',sans-serif] font-bold text-lg">
                    {transactionType === 'individual' 
                      ? `${isMember === 'member' ? 'Member' : 'Non-Member'} - ${mealType === 'dineIn' ? 'Dine In' : mealType === 'pickup' ? 'To Go' : 'Delivery'}`
                      : `${cardMemberType === 'member' ? 'Member' : 'Non-Member'} - ${cardMealType === 'dineIn' ? 'Dine In' : cardMealType === 'pickup' ? 'Pickup' : 'Delivery'}`
                    }
                  </div>
                </div>
                {transactionType === 'individual' && (
                  <>
                    <div>
                      <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: '4px' }}>Dates</div>
                      <div className="text-white font-['Jost',sans-serif] font-bold text-lg">
                        {selectedDates.length} day(s)
                      </div>
                    </div>
                    <div>
                      <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: '4px' }}>Meals/Day</div>
                      <div className="text-white font-['Jost',sans-serif] font-bold text-lg">
                        {quantity}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: '4px' }}>Total Meals</div>
                      <div className="text-white font-['Jost',sans-serif] font-bold text-2xl">
                        {getTotalMeals()}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <div className="text-white/80 font-['Bitter',serif] text-sm" style={{ marginBottom: '4px' }}>Total</div>
                  <div className="text-white font-['Jost',sans-serif] font-bold text-3xl">
                    ${getTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isSubmitting || 
                !customer.firstName || 
                !customer.lastName || 
                !staffInitials ||
                (transactionType === 'individual' && selectedDates.length === 0) ||
                (paymentMethod === 'lunchCard' && !selectedLunchCard)
              }
              className="w-full bg-[#427d78] hover:bg-[#5eb3a1] disabled:bg-gray-400 text-white font-['Jost',sans-serif] font-bold text-xl py-4 rounded-lg transition-colors shadow-lg"
            >
              {isSubmitting 
                ? '⏳ Processing...' 
                : paymentMethod === 'lunchCard' 
                  ? `Deduct ${getTotalMeals()} Meal(s) from Lunch Card` 
                  : `Complete Transaction - ${getTotalMeals()} meal(s) - $${getTotal().toFixed(2)}`
              }
            </button>
          </form>

          {/* Pricing Reference */}
          <div className="card" style={{ marginTop: 'var(--space-6)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
              📋 Pricing Reference
            </h2>
            
            {/* Individual Meals */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h3 className="font-['Jost',sans-serif] font-bold text-gray-700 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                Individual Meals
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 font-['Jost',sans-serif]">Type</th>
                      <th className="text-right p-2 font-['Jost',sans-serif]">Member</th>
                      <th className="text-right p-2 font-['Jost',sans-serif]">Non-Member</th>
                    </tr>
                  </thead>
                  <tbody className="font-['Bitter',serif]">
                    <tr className="border-b">
                      <td className="p-2">Dine In</td>
                      <td className="text-right p-2">${PRICING.individual.memberDineIn}</td>
                      <td className="text-right p-2">${PRICING.individual.nonMemberDineIn}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">To Go</td>
                      <td className="text-right p-2">${PRICING.individual.memberToGo}</td>
                      <td className="text-right p-2">${PRICING.individual.nonMemberToGo}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Delivery (+$3)</td>
                      <td className="text-right p-2">${PRICING.individual.memberToGo + PRICING.individual.deliveryCharge}</td>
                      <td className="text-right p-2">${PRICING.individual.nonMemberToGo + PRICING.individual.deliveryCharge}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lunch Cards */}
            <div>
              <h3 className="font-['Jost',sans-serif] font-bold text-gray-700 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
                Lunch Cards (Prepaid)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 font-['Jost',sans-serif]">Card Type</th>
                      <th className="text-right p-2 font-['Jost',sans-serif]">Member</th>
                      <th className="text-right p-2 font-['Jost',sans-serif]">Non-Member</th>
                    </tr>
                  </thead>
                  <tbody className="font-['Bitter',serif]">
                    {([5, 10, 15, 20] as MealCount[]).map((count) => (
                      <>
                        <tr key={`${count}-dineIn`} className="border-b bg-gray-50">
                          <td className="p-2 font-semibold" colSpan={3}>{count} Meals</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 pl-4">↳ Dine In</td>
                          <td className="text-right p-2">${PRICING.cards[count].member.dineIn}</td>
                          <td className="text-right p-2">${PRICING.cards[count].nonMember.dineIn}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 pl-4">↳ Pickup</td>
                          <td className="text-right p-2">${PRICING.cards[count].member.pickup}</td>
                          <td className="text-right p-2">${PRICING.cards[count].nonMember.pickup}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 pl-4">↳ Delivery</td>
                          <td className="text-right p-2">${PRICING.cards[count].member.delivery}</td>
                          <td className="text-right p-2">${PRICING.cards[count].nonMember.delivery}</td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
