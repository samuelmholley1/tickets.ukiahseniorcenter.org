'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

interface LunchCard {
  id: string;
  name: string;
  phone: string;
  cardType: string;
  mealType?: string;
  totalMeals: number;
  remainingMeals: number;
  memberStatus: string;
}

// Individual meal info - each meal gets its own entry
interface MealEntry {
  name: string;         // Customer name for this meal
  specialRequest: string; // Special request for this meal (was "notes")
}

// Per-date meal tracking - maps date to array of meals for that date
// e.g., { "2026-02-02": [{ name: "John", specialRequest: "no onions" }, ...] }
type DateMeals = Record<string, MealEntry[]>;

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
type PaymentMethodType = 'cash' | 'check' | 'cashCheckSplit' | 'card' | 'lunchCard' | 'compCard';

/* ========== RESERVATION DEADLINE LOGIC ==========
 * All meals must be reserved by 2pm the BUSINESS DAY before
 * Closed on Fridays
 * So Thursday 2pm is the deadline for Monday lunch
 * ================================================ */

// Get the next available lunch date based on 2pm deadline rule
// Uses local timezone for proper deadline calculation
const getNextAvailableLunch = (): string => {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const currentHour = now.getHours(); // Local hour
  const isBefore2pm = currentHour < 14;
  
  console.log(`[getNextAvailableLunch] Today: ${currentDay} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][currentDay]}), Hour: ${currentHour}, Before 2pm: ${isBefore2pm}`);
  
  // Logic:
  // - Mon before 2pm → Tuesday
  // - Mon after 2pm → Wednesday  
  // - Tue before 2pm → Wednesday
  // - Tue after 2pm → Thursday
  // - Wed before 2pm → Thursday
  // - Wed after 2pm → Monday (skip Fri/Sat/Sun)
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
      daysToAdd = isBefore2pm ? 0 : 4; // Same day (Thu) or Monday
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
  
  // Format as YYYY-MM-DD using local date parts
  const year = nextLunch.getFullYear();
  const month = String(nextLunch.getMonth() + 1).padStart(2, '0');
  const day = String(nextLunch.getDate()).padStart(2, '0');
  const result = `${year}-${month}-${day}`;
  
  console.log(`[getNextAvailableLunch] Adding ${daysToAdd} days, result: ${result}`);
  return result;
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

// New card form interface
interface NewCardForm {
  name: string;
  phone: string;
  cardType: MealCount;
  mealType: MealType;
  memberStatus: MembershipType;
}

export default function LunchPage() {
  // Sticky header state
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const transactionSectionRef = useRef<HTMLDivElement>(null);

  // Customer info
  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: 'cashier@seniorctr.org',
    phone: '',
  });

  // Transaction type
  const [transactionType, setTransactionType] = useState<TransactionType>('individual');

  // Individual meal options
  const [isMember, setIsMember] = useState<MembershipType>('member');
  const [mealType, setMealType] = useState<MealType>('dineIn');
  
  // Per-date meal tracking: { "2026-02-02": [{ name: "John", specialRequest: "" }, ...] }
  const [dateMeals, setDateMeals] = useState<DateMeals>(() => {
    const initialDate = getNextAvailableLunch();
    return { [initialDate]: [{ name: '', specialRequest: '' }] };
  });

  // Lunch card options
  const [cardMealCount, setCardMealCount] = useState<MealCount>(5);
  const [cardMealType, setCardMealType] = useState<MealType>('dineIn');
  const [cardMemberType, setCardMemberType] = useState<MembershipType>('member');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [checkNumber, setCheckNumber] = useState('');
  const [compCardNumber, setCompCardNumber] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [checkAmount, setCheckAmount] = useState('');
  const [staffInitials, setStaffInitials] = useState('');
  
  // Helper to get selected dates from dateMeals
  const selectedDates = Object.keys(dateMeals).sort();
  
  // Helper to get total meals count
  const getTotalMealsFromDateMeals = () => {
    return Object.values(dateMeals).reduce((sum, meals) => sum + meals.length, 0);
  };
  
  // Generate next 30 days for selection (Mon-Thu only, closed Fri-Sun)
  const getNext30Days = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      // Closed Friday (5), Saturday (6), Sunday (0)
      const isClosed = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      // Format as YYYY-MM-DD using local date parts
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      days.push({
        value: `${year}-${month}-${day}`,
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isClosed,
      });
    }
    return days;
  };
  
  // Add a meal to a date (or add date with 1 meal if not exists)
  const addMealToDate = (date: string) => {
    const customerName = `${customer.firstName} ${customer.lastName}`.trim();
    setDateMeals(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), { name: customerName, specialRequest: '' }]
    }));
  };
  
  // Remove a meal from a date (remove date entirely if last meal)
  const removeMealFromDate = (date: string) => {
    setDateMeals(prev => {
      const meals = prev[date] || [];
      if (meals.length <= 1) {
        // Remove the date entirely if this was the last meal
        // But keep at least one date
        if (Object.keys(prev).length <= 1) {
          return prev; // Don't remove last date
        }
        const { [date]: _removed, ...rest } = prev;
        void _removed; // Suppress unused variable warning
        return rest;
      }
      // Remove last meal from this date
      return { ...prev, [date]: meals.slice(0, -1) };
    });
  };
  
  // Update a specific meal's details
  const updateMealDetail = (date: string, mealIndex: number, field: keyof MealEntry, value: string) => {
    setDateMeals(prev => {
      const meals = [...(prev[date] || [])];
      if (meals[mealIndex]) {
        meals[mealIndex] = { ...meals[mealIndex], [field]: value };
      }
      return { ...prev, [date]: meals };
    });
  };
  
  // Handle date cell click - toggle date on/off
  const handleDateClick = (date: string) => {
    const customerName = `${customer.firstName} ${customer.lastName}`.trim();
    if (dateMeals[date]) {
      // Date is selected - remove it (unless it's the only one)
      if (Object.keys(dateMeals).length > 1) {
        setDateMeals(prev => {
          const { [date]: _removed, ...rest } = prev;
          void _removed; // Suppress unused variable warning
          return rest;
        });
      }
    } else {
      // Add date with 1 meal
      setDateMeals(prev => ({
        ...prev,
        [date]: [{ name: customerName, specialRequest: '' }]
      }));
    }
  };

  // Lunch card lookup
  const [lunchCardSearch, setLunchCardSearch] = useState('');
  const [availableLunchCards, setAvailableLunchCards] = useState<LunchCard[]>([]);
  const [selectedLunchCard, setSelectedLunchCard] = useState<LunchCard | null>(null);
  const [isSearchingCards, setIsSearchingCards] = useState(false);
  
  // Auto-detected lunch card from customer name
  const [autoDetectedCard, setAutoDetectedCard] = useState<LunchCard | null>(null);
  
  // Add un-entered card modal
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardForm, setNewCardForm] = useState<NewCardForm>({
    name: '',
    phone: '',
    cardType: 5,
    mealType: 'dineIn',
    memberStatus: 'member',
  });
  const [isAddingCard, setIsAddingCard] = useState(false);
  
  // Transaction confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionLog, setTransactionLog] = useState<string[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  
  // Sticky header scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (transactionSectionRef.current) {
        const rect = transactionSectionRef.current.getBoundingClientRect();
        setIsSticky(rect.top < 0);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Reset confirmation when important values change (prevents stale data submission)
  useEffect(() => {
    setShowConfirmation(false);
  }, [transactionType, paymentMethod, dateMeals, selectedLunchCard, cardMealCount]);
  
  // Auto-fill customer name in meals when customer name changes
  useEffect(() => {
    const customerName = `${customer.firstName} ${customer.lastName}`.trim();
    if (customerName) {
      // Update any empty meal names with customer name
      setDateMeals(prev => {
        const updated: DateMeals = {};
        for (const [date, meals] of Object.entries(prev)) {
          updated[date] = meals.map(meal => ({
            ...meal,
            name: meal.name || customerName
          }));
        }
        return updated;
      });
    }
  }, [customer.firstName, customer.lastName]);
  
  // Auto-lookup lunch card when customer name changes
  const searchCustomerCard = useCallback(async (firstName: string, lastName: string) => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName.length < 3) {
      setAutoDetectedCard(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/lunch/card?search=${encodeURIComponent(fullName)}`);
      const data = await response.json();
      if (data.success && data.cards && data.cards.length > 0) {
        // Find exact or close match
        const exactMatch = data.cards.find((card: LunchCard) => 
          card.name.toLowerCase() === fullName.toLowerCase()
        );
        setAutoDetectedCard(exactMatch || data.cards[0]);
      } else {
        setAutoDetectedCard(null);
      }
    } catch {
      setAutoDetectedCard(null);
    }
  }, []);
  
  // Debounced auto-lookup on name change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (customer.firstName || customer.lastName) {
        searchCustomerCard(customer.firstName, customer.lastName);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [customer.firstName, customer.lastName, searchCustomerCard]);

  // Calculate individual meal price (single meal)
  const calculateSingleMealPrice = () => {
    let basePrice = 0;
    if (isMember === 'member') {
      basePrice = mealType === 'dineIn' ? PRICING.individual.memberDineIn : PRICING.individual.memberToGo;
    } else {
      basePrice = mealType === 'dineIn' ? PRICING.individual.nonMemberDineIn : PRICING.individual.nonMemberToGo;
    }
    if (mealType === 'delivery') {
      basePrice = (isMember === 'member' ? PRICING.individual.memberToGo : PRICING.individual.nonMemberToGo) + PRICING.individual.deliveryCharge;
    }
    return basePrice;
  };

  // Calculate lunch card price
  const calculateCardPrice = () => {
    return PRICING.cards[cardMealCount][cardMemberType][cardMealType];
  };

  // Get total meals being ordered
  const getTotalMeals = () => {
    if (transactionType === 'lunchCard') {
      return cardMealCount; // For lunch card purchases, it's the card size
    }
    return getTotalMealsFromDateMeals();
  };

  // Get total price
  const getTotal = () => {
    // Lunch card and comp card are free (already prepaid or complimentary)
    if (paymentMethod === 'lunchCard' || paymentMethod === 'compCard') return 0;
    if (transactionType === 'individual') {
      // Price per meal × total meals
      return calculateSingleMealPrice() * getTotalMealsFromDateMeals();
    }
    return calculateCardPrice();
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
    setCustomer({ firstName: '', lastName: '', email: 'cashier@seniorctr.org', phone: '' });
    const initialDate = getNextAvailableLunch();
    setDateMeals({ [initialDate]: [{ name: '', specialRequest: '' }] });
    setCheckNumber('');
    setCompCardNumber('');
    setCashAmount('');
    setCheckAmount('');
    setSelectedLunchCard(null);
    setLunchCardSearch('');
    setAvailableLunchCards([]);
    setAutoDetectedCard(null);
    setSubmitResult(null);
    setShowConfirmation(false);
    setTransactionLog([]);
  };
  
  // Add un-entered card to database
  const handleAddNewCard = async () => {
    if (!newCardForm.name || !newCardForm.phone) {
      alert('Please enter name and phone for the new card');
      return;
    }
    
    setIsAddingCard(true);
    try {
      const response = await fetch('/api/lunch/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCardForm.name,
          phone: newCardForm.phone,
          cardType: newCardForm.cardType,
          mealType: newCardForm.mealType,
          memberStatus: newCardForm.memberStatus,
          paymentMethod: 'cash', // Paper cards already paid
          staff: staffInitials || 'SYS',
        }),
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        // Card created, now fetch it to use
        const searchResponse = await fetch(`/api/lunch/card?search=${encodeURIComponent(newCardForm.name)}`);
        const searchData = await searchResponse.json();
        if (searchData.success && searchData.cards && searchData.cards.length > 0) {
          const newCard = searchData.cards[0];
          setSelectedLunchCard(newCard);
          setAutoDetectedCard(newCard);
          setPaymentMethod('lunchCard');
          // Fill customer info
          setCustomer({
            ...customer,
            firstName: newCardForm.name.split(' ')[0] || '',
            lastName: newCardForm.name.split(' ').slice(1).join(' ') || '',
            phone: newCardForm.phone,
          });
        }
        setShowAddCardModal(false);
        setNewCardForm({ name: '', phone: '', cardType: 5, mealType: 'dineIn', memberStatus: 'member' });
        alert(`Card added successfully! ${newCardForm.cardType} meals available.`);
      } else {
        alert(result.error || 'Failed to add card');
      }
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Network error adding card');
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show confirmation before submitting
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitResult(null);
    const log: string[] = [];

    try {
      if (transactionType === 'individual') {
        // Create lunch reservations - one record per meal in dateMeals
        const totalMeals = getTotalMeals();
        let successCount = 0;
        let errorMessage = '';
        let isFirstMeal = true;

        // Iterate through all dates and meals
        for (const date of selectedDates) {
          const meals = dateMeals[date] || [];
          for (let i = 0; i < meals.length; i++) {
            const meal = meals[i];
            const mealName = meal.name.trim() || `${customer.firstName} ${customer.lastName}`.trim();
            
            const mealNotes = [
              meal.specialRequest.trim(),
              checkNumber ? `Check #${checkNumber}` : '',
              compCardNumber ? `Comp #${compCardNumber}` : '',
            ].filter(Boolean).join(' | ');
            
            const response = await fetch('/api/lunch/reservation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: mealName,
                date: date,
                mealType: mealType === 'pickup' ? 'toGo' : mealType,
                memberStatus: isMember,
                paymentMethod: paymentMethod,
                lunchCardId: selectedLunchCard?.id,
                notes: mealNotes,
                staff: staffInitials,
                quantity: isFirstMeal ? totalMeals : 1, // Deduct total on first call
                deductMeal: isFirstMeal, // Only deduct from card on first meal
              }),
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
              successCount++;
              log.push(`✓ ${date}: ${mealName}`);
            } else {
              errorMessage = result.error || 'Failed to create reservation';
              log.push(`✗ ${date}: ${mealName} - ${errorMessage}`);
              break;
            }
            
            isFirstMeal = false;
          }
          if (errorMessage) break;
        }

        setTransactionLog(log);

        if (successCount === totalMeals) {
          setSubmitResult({
            success: true,
            message: `Created ${totalMeals} reservation(s) for ${selectedDates.length} date(s). Total: $${getTotal().toFixed(2)}`,
            amount: getTotal(),
          });
        } else {
          // Partial failure - this is serious if lunch card was debited
          const partialFailureMsg = paymentMethod === 'lunchCard' && successCount > 0
            ? ` IMPORTANT: ${getTotalMeals()} meals were deducted from lunch card but only ${successCount} reservations created. Contact office to reconcile.`
            : '';
          setSubmitResult({
            success: false,
            message: (errorMessage || `Only created ${successCount} of ${totalMeals} reservations`) + partialFailureMsg,
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
            compCardNumber: compCardNumber || undefined,
            staff: staffInitials,
          }),
        });

        const result = await response.json();
        
        log.push(`Creating ${cardMealCount}-meal lunch card for ${customer.firstName} ${customer.lastName}`);
        setTransactionLog(log);
        
        if (response.ok && result.success) {
          log.push(`✓ Card created successfully`);
          setSubmitResult({
            success: true,
            message: result.message,
            amount: result.amount,
          });
        } else {
          log.push(`✗ Failed: ${result.error}`);
          setSubmitResult({
            success: false,
            message: result.error || 'Failed to create lunch card',
          });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setTransactionLog([...log, `✗ Network error`]);
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
      
      {/* Sticky Transaction Type Widget - appears when scrolled past main toggle */}
      {isSticky && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b-4 border-[#427d78]"
          style={{ padding: 'var(--space-2) var(--space-3)' }}
        >
          <div className="container" style={{ maxWidth: '1000px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="font-['Jost',sans-serif] font-bold text-[#427d78]">Mode:</span>
              <button
                type="button"
                onClick={() => setTransactionType('individual')}
                className={`px-3 py-1 rounded-full font-['Jost',sans-serif] text-sm font-bold transition-all ${
                  transactionType === 'individual'
                    ? 'bg-[#427d78] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🍴 Meal
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('lunchCard')}
                className={`px-3 py-1 rounded-full font-['Jost',sans-serif] text-sm font-bold transition-all ${
                  transactionType === 'lunchCard'
                    ? 'bg-[#427d78] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                💳 Card
              </button>
            </div>
            
            {/* Show auto-detected card balance in sticky header */}
            {autoDetectedCard && transactionType === 'individual' && (
              <div className={`px-3 py-1 rounded-full ${autoDetectedCard.remainingMeals > 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <span className={`font-['Jost',sans-serif] text-sm font-bold ${autoDetectedCard.remainingMeals > 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                  🎫 {autoDetectedCard.name}: {autoDetectedCard.remainingMeals} meals left
                  {autoDetectedCard.remainingMeals === 0 && ' (EMPTY)'}
                </span>
              </div>
            )}
            
            {/* Quick total display */}
            {transactionType === 'individual' && selectedDates.length > 0 && (
              <div className="font-['Jost',sans-serif] font-bold text-lg">
                {getTotalMeals()} meal{getTotalMeals() !== 1 ? 's' : ''} = ${getTotal().toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          {/* Page Header */}
          <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              🍽️ Lunch Sales
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Staff use only - Record lunch purchases and lunch card sales
            </p>
          </div>
          
          {/* Export Section */}
          <div className="card" style={{ marginBottom: 'var(--space-4)', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-lg" style={{ marginBottom: 'var(--space-3)' }}>
              📤 Export Daily Reports
            </h2>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-1 text-sm">Select Date</label>
                <input
                  type="date"
                  defaultValue={getNextAvailableLunch()}
                  id="export-date"
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const dateInput = document.getElementById('export-date') as HTMLInputElement;
                  if (dateInput?.value) {
                    const d = new Date(dateInput.value + 'T12:00:00');
                    const day = d.getDay();
                    if (day === 0 || day === 5 || day === 6) {
                      alert('Warning: Lunch is closed on Fridays, Saturdays, and Sundays. There may be no reservations for this date.');
                    }
                    window.open(`/api/lunch/export-list?date=${dateInput.value}`, '_blank');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#427d78] hover:bg-[#5eb3a1] text-white font-['Jost',sans-serif] font-bold rounded-lg transition-colors"
              >
                📋 Download List PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  const dateInput = document.getElementById('export-date') as HTMLInputElement;
                  if (dateInput?.value) {
                    const d = new Date(dateInput.value + 'T12:00:00');
                    const day = d.getDay();
                    if (day === 0 || day === 5 || day === 6) {
                      alert('Warning: Lunch is closed on Fridays, Saturdays, and Sundays. There may be no reservations for this date.');
                    }
                    window.open(`/api/lunch/export-labels?date=${dateInput.value}`, '_blank');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-['Jost',sans-serif] font-bold rounded-lg transition-colors"
              >
                🏷️ Download Avery 5160 Labels
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-['Bitter',serif]">
              List PDF: Alphabetical reservation list for the day. Labels: Print on Avery 5160 sheets (30 labels/page).
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
              
              {/* Transaction Log */}
              {transactionLog.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <div className="font-['Jost',sans-serif] font-bold text-gray-700 mb-2">Transaction Log:</div>
                  <div className="font-['Bitter',serif] text-sm text-gray-600 space-y-1">
                    {transactionLog.map((entry, i) => (
                      <div key={i}>{entry}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {submitResult.success && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white font-['Jost',sans-serif] font-bold px-4 py-2 rounded-lg"
                >
                  Start New Transaction
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Transaction Type Selection */}
            <div ref={transactionSectionRef} className="card" style={{ marginBottom: 'var(--space-4)' }}>
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

            {/* Quick Lunch Card Lookup */}
            <div className="card" style={{ marginBottom: 'var(--space-4)', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '2px solid #f59e0b' }}>
              <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 'var(--space-3)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-amber-700 text-xl">
                  🔍 Quick Lunch Card Lookup
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-['Jost',sans-serif] font-bold rounded-lg transition-all text-sm"
                >
                  ➕ Add Un-entered Card
                </button>
              </div>
              <p className="font-['Bitter',serif] text-amber-800 text-sm mb-3">
                Search for a customer&apos;s lunch card to check their balance
              </p>
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={lunchCardSearch}
                onChange={(e) => {
                  setLunchCardSearch(e.target.value);
                  if (e.target.value.length >= 2) {
                    searchLunchCards(e.target.value);
                  } else {
                    setAvailableLunchCards([]);
                  }
                }}
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none font-['Bitter',serif]"
              />
              
              {isSearchingCards && (
                <p className="mt-2 text-amber-700 font-['Bitter',serif]">Searching...</p>
              )}
              
              {availableLunchCards.length > 0 && (
                <div className="mt-3 space-y-2">
                  {availableLunchCards.map((card) => (
                    <div
                      key={card.id}
                      className="w-full text-left p-3 rounded-lg border-2 bg-white border-amber-200"
                    >
                      <div className="font-['Jost',sans-serif] font-bold text-gray-800">{card.name}</div>
                      <div className="font-['Bitter',serif] text-sm text-gray-600">
                        📞 {card.phone} • {card.cardType} • {card.memberStatus}
                        {card.mealType && <span className="ml-1 font-semibold text-blue-600">• {card.mealType}</span>}
                      </div>
                      <div className="font-['Jost',sans-serif] font-bold text-lg mt-1">
                        <span className="text-green-600">{card.remainingMeals} meals remaining</span>
                        <span className="text-gray-400 text-sm ml-2">/ {card.totalMeals} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {lunchCardSearch.length >= 2 && availableLunchCards.length === 0 && !isSearchingCards && (
                <p className="mt-2 text-gray-500 font-['Bitter',serif]">No lunch cards found.</p>
              )}
            </div>
            
            {/* Add Un-entered Card Modal */}
            {showAddCardModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                  <h3 className="font-['Jost',sans-serif] font-bold text-xl text-[#427d78] mb-4">
                    ➕ Add Un-entered Paper Card
                  </h3>
                  <p className="font-['Bitter',serif] text-sm text-gray-600 mb-4">
                    Enter details from a paper lunch card that isn&apos;t in the system yet
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-1">Customer Name *</label>
                      <input
                        type="text"
                        value={newCardForm.name}
                        onChange={(e) => setNewCardForm({ ...newCardForm, name: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={newCardForm.phone}
                        onChange={(e) => setNewCardForm({ ...newCardForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none"
                        placeholder="707-555-1234"
                      />
                    </div>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-1">Card Size</label>
                      <select
                        value={newCardForm.cardType}
                        onChange={(e) => setNewCardForm({ ...newCardForm, cardType: parseInt(e.target.value) as MealCount })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none"
                      >
                        <option value={5}>5 Meals</option>
                        <option value={10}>10 Meals</option>
                        <option value={15}>15 Meals</option>
                        <option value={20}>20 Meals</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-1">Meal Type</label>
                      <select
                        value={newCardForm.mealType}
                        onChange={(e) => setNewCardForm({ ...newCardForm, mealType: e.target.value as MealType })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none"
                      >
                        <option value="dineIn">Dine In</option>
                        <option value="pickup">Pickup/To Go</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-1">Member Status</label>
                      <select
                        value={newCardForm.memberStatus}
                        onChange={(e) => setNewCardForm({ ...newCardForm, memberStatus: e.target.value as MembershipType })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="nonMember">Non-Member</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddCardModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-['Jost',sans-serif] font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewCard}
                      disabled={isAddingCard || !newCardForm.name || !newCardForm.phone}
                      className="flex-1 px-4 py-2 bg-[#427d78] hover:bg-[#5eb3a1] disabled:bg-gray-400 text-white font-['Jost',sans-serif] font-bold rounded-lg"
                    >
                      {isAddingCard ? 'Adding...' : 'Add Card'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 'var(--space-3)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl">
                  Customer Information
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setCustomer({ firstName: '', lastName: '', email: 'cashier@seniorctr.org', phone: '' });
                    setAutoDetectedCard(null);
                  }}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-['Jost',sans-serif] font-bold rounded-lg transition-all text-sm"
                >
                  🗑️ Clear All
                </button>
              </div>
              
              {/* Auto-detected lunch card notification */}
              {autoDetectedCard && transactionType === 'individual' && (
                <div className={`mb-4 p-3 border-2 rounded-lg ${autoDetectedCard.remainingMeals > 0 ? 'bg-green-100 border-green-400' : 'bg-yellow-100 border-yellow-400'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className={`font-['Jost',sans-serif] font-bold ${autoDetectedCard.remainingMeals > 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                        🎫 Lunch Card Found: {autoDetectedCard.name}
                      </div>
                      <div className={`font-['Bitter',serif] ${autoDetectedCard.remainingMeals > 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                        <span className="font-bold text-lg">{autoDetectedCard.remainingMeals}</span> meals remaining
                        {autoDetectedCard.remainingMeals === 0 && <span className="ml-2 text-red-600 font-bold">(EMPTY)</span>}
                      </div>
                    </div>
                    {autoDetectedCard.remainingMeals > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLunchCard(autoDetectedCard);
                          setPaymentMethod('lunchCard');
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-['Jost',sans-serif] font-bold rounded-lg"
                      >
                        Use This Card
                      </button>
                    )}
                  </div>
                </div>
              )}
              
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
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(customer.firstName)}
                    className="mt-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-['Jost',sans-serif] rounded text-xs transition-all"
                  >
                    📋 Copy
                  </button>
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
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(customer.lastName)}
                    className="mt-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-['Jost',sans-serif] rounded text-xs transition-all"
                  >
                    📋 Copy
                  </button>
                </div>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(customer.email)}
                    className="mt-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-['Jost',sans-serif] rounded text-xs transition-all"
                  >
                    📋 Copy
                  </button>
                </div>
                <div>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(customer.phone)}
                    className="mt-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-['Jost',sans-serif] rounded text-xs transition-all"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 font-['Bitter',serif]">
                💡 To copy/paste: Right-click → Copy/Paste, or use <strong>Ctrl+C</strong> (copy) / <strong>Ctrl+V</strong> (paste)
              </p>
            </div>

            {/* Individual Meal Options */}
            {transactionType === 'individual' && (
              <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                  Meal Details
                </h2>

                {/* Date Selection with +/- controls */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-['Bitter',serif] text-gray-700 font-medium">
                      Select Dates &amp; Meals * 
                      <span className="text-sm text-gray-500 ml-1">
                        ({selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}, {getTotalMealsFromDateMeals()} meal{getTotalMealsFromDateMeals() !== 1 ? 's' : ''})
                      </span>
                    </label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                    {getNext30Days().map((day) => {
                      const isSelected = dateMeals[day.value] !== undefined;
                      const mealCount = dateMeals[day.value]?.length || 0;
                      
                      return (
                        <div
                          key={day.value}
                          className={`p-2 rounded-lg font-['Jost',sans-serif] text-sm transition-all border-2 ${
                            day.isClosed 
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : isSelected
                                ? 'bg-[#427d78] text-white border-[#427d78]'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#427d78]'
                          }`}
                        >
                          {/* Date label - click to toggle */}
                          <button
                            type="button"
                            onClick={() => !day.isClosed && handleDateClick(day.value)}
                            disabled={day.isClosed}
                            className="w-full text-center font-bold"
                          >
                            {day.label}
                          </button>
                          
                          {/* +/- controls when selected */}
                          {isSelected && (
                            <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-white/30">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeMealFromDate(day.value); }}
                                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-lg"
                              >
                                −
                              </button>
                              <span className="font-bold text-lg min-w-[24px] text-center">{mealCount}</span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); addMealToDate(day.value); }}
                                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-lg"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 font-['Bitter',serif]">
                    💡 Click date to select. Use +/− to add more meals per day. Closed Fri-Sun.
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

                {/* Per-Meal Details - Name and Special Request for each meal */}
                {getTotalMealsFromDateMeals() > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <h3 className="font-['Jost',sans-serif] font-bold text-blue-800 mb-3">
                      📝 Meal Details ({getTotalMealsFromDateMeals()} meal{getTotalMealsFromDateMeals() !== 1 ? 's' : ''})
                    </h3>
                    <p className="font-['Bitter',serif] text-sm text-blue-700 mb-4">
                      Each meal gets its own line in the system. Edit names and special requests below.
                      <br />
                      <strong>Tip:</strong> Names auto-fill with customer name. Clear to enter a different name.
                    </p>
                    
                    {selectedDates.map((date) => {
                      const dateObj = new Date(date + 'T12:00:00');
                      const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      const meals = dateMeals[date] || [];
                      
                      return (
                        <div key={date} className="mb-4">
                          <div className="font-['Jost',sans-serif] font-bold text-gray-800 mb-2 bg-white px-3 py-2 rounded-t-lg border-2 border-b-0 border-blue-200">
                            📅 {dateLabel}
                          </div>
                          {meals.map((meal, idx) => (
                            <div key={idx} className="p-3 bg-white border-2 border-blue-200 border-t-0 last:rounded-b-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-['Jost',sans-serif] font-bold text-gray-600">Meal #{idx + 1}</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Name for Attendance List</label>
                                  <div className="flex gap-1">
                                    <input
                                      type="text"
                                      placeholder={`${customer.firstName} ${customer.lastName}`.trim() || 'Customer name'}
                                      value={meal.name}
                                      onChange={(e) => updateMealDetail(date, idx, 'name', e.target.value)}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    {meal.name && (
                                      <button
                                        type="button"
                                        onClick={() => updateMealDetail(date, idx, 'name', '')}
                                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded text-xs"
                                        title="Clear name"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Special Request (optional)</label>
                                  <input
                                    type="text"
                                    placeholder="No onions, extra bread, etc."
                                    value={meal.specialRequest}
                                    onChange={(e) => updateMealDetail(date, idx, 'specialRequest', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                    onClick={() => setPaymentMethod('cashCheckSplit')}
                    className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                      paymentMethod === 'cashCheckSplit' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    💵📝 Cash & Check
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
                      onClick={() => setPaymentMethod('compCard')}
                      className={`px-6 py-3 rounded-lg font-['Jost',sans-serif] font-bold transition-all ${
                        paymentMethod === 'compCard' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🎁 Comp Card
                    </button>
                  )}
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

              {paymentMethod === 'card' && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <a
                    href="https://www.zeffy.com/en-US/ticketing/lunch-8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-['Jost',sans-serif] font-bold rounded-lg transition-colors text-lg"
                  >
                    💳 Open Zeffy to Process Card Payment →
                  </a>
                  <p className="text-sm text-purple-600 mt-2 font-['Bitter',serif]">
                    💡 Process the card payment in Zeffy, then return here to complete the reservation.
                  </p>
                </div>
              )}

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
              
              {paymentMethod === 'compCard' && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">Comp Card Number *</label>
                  <input
                    type="text"
                    required
                    value={compCardNumber}
                    onChange={(e) => setCompCardNumber(e.target.value)}
                    placeholder="Enter comp card number"
                    className="w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none font-['Bitter',serif]"
                    style={{ maxWidth: '300px' }}
                  />
                  <p className="text-sm text-pink-600 mt-1 font-['Bitter',serif]">
                    💡 Enter the complimentary meal card number for tracking.
                  </p>
                </div>
              )}

              {paymentMethod === 'cashCheckSplit' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <label className="block font-['Bitter',serif] text-gray-700 font-medium mb-2">
                        Cash Amount *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
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
                        min="0"
                        step="0.01"
                        required
                        value={checkAmount}
                        onChange={(e) => setCheckAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                      />
                    </div>
                  </div>

                  {/* Split Payment Reconciliation Display */}
                  {(() => {
                    const cashAmt = parseFloat(cashAmount || '0');
                    const checkAmt = parseFloat(checkAmount || '0');
                    const splitTotal = cashAmt + checkAmt;
                    const totalDue = getTotal();
                    const isReconciled = Math.abs(splitTotal - totalDue) < 0.01;
                    const difference = splitTotal - totalDue;
                    
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
                            ${totalDue.toFixed(2)}
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
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#427d78] focus:outline-none font-['Bitter',serif]"
                    />
                  </div>
                </>
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
                            {card.phone} • {card.cardType}
                            {card.mealType && <span className="text-blue-600"> • {card.mealType}</span>}
                            {' '} • <span className="text-green-600 font-bold">{card.remainingMeals} meals left</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedLunchCard && (
                    <div className={`mt-3 border-2 rounded-lg p-3 ${
                      selectedLunchCard.remainingMeals >= getTotalMeals()
                        ? 'bg-green-100 border-green-400'
                        : 'bg-red-100 border-red-400'
                    }`}>
                      <div className={`font-['Jost',sans-serif] font-bold ${
                        selectedLunchCard.remainingMeals >= getTotalMeals() ? 'text-green-800' : 'text-red-800'
                      }`}>Selected Card:</div>
                      <div className={`font-['Bitter',serif] ${
                        selectedLunchCard.remainingMeals >= getTotalMeals() ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {selectedLunchCard.name} - {selectedLunchCard.remainingMeals} meals remaining
                        {selectedLunchCard.mealType && <span className="text-blue-600 ml-1">({selectedLunchCard.mealType})</span>}
                      </div>
                      {selectedLunchCard.remainingMeals < getTotalMeals() && (
                        <div className="mt-2 p-2 bg-red-200 rounded text-red-800 font-['Jost',sans-serif] font-bold text-sm">
                          ⚠️ Not enough meals! Need {getTotalMeals()}, has {selectedLunchCard.remainingMeals}.
                          Reduce dates or quantity.
                        </div>
                      )}
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

            {/* Transaction Confirmation Preview */}
            {showConfirmation && !submitResult && (
              <div className="card bg-amber-50 border-4 border-amber-400" style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="font-['Jost',sans-serif] font-bold text-amber-800 text-xl" style={{ marginBottom: 'var(--space-3)' }}>
                  ⚠️ Confirm Transaction
                </h2>
                <div className="font-['Bitter',serif] text-amber-900 space-y-2">
                  <p><strong>Customer:</strong> {customer.firstName} {customer.lastName}</p>
                  <p><strong>Type:</strong> {transactionType === 'individual' ? `${getTotalMeals()} Individual Meal(s)` : `${cardMealCount}-Meal Lunch Card`}</p>
                  {transactionType === 'individual' && (
                    <>
                      <p><strong>Dates:</strong> {selectedDates.join(', ')}</p>
                      <p><strong>Total meals:</strong> {getTotalMeals()}</p>
                    </>
                  )}
                  <p><strong>Payment:</strong> {
                    paymentMethod === 'lunchCard' ? `Lunch Card (${selectedLunchCard?.name})` 
                    : paymentMethod === 'compCard' ? `Comp Card #${compCardNumber}` 
                    : paymentMethod === 'cashCheckSplit' ? `Cash $${cashAmount} + Check #${checkNumber} $${checkAmount}`
                    : paymentMethod === 'check' ? `Check #${checkNumber}`
                    : paymentMethod === 'card' ? 'Card (Zeffy)'
                    : 'Cash'
                  }</p>
                  <p><strong>Total:</strong> ${getTotal().toFixed(2)}</p>
                  {paymentMethod === 'lunchCard' && selectedLunchCard && (
                    selectedLunchCard.remainingMeals >= getTotalMeals() ? (
                      <p className="text-green-700 font-bold">
                        Will deduct {getTotalMeals()} meal(s) from card ({selectedLunchCard.remainingMeals} remaining → {selectedLunchCard.remainingMeals - getTotalMeals()} after)
                      </p>
                    ) : (
                      <p className="text-red-700 font-bold">
                        ❌ Insufficient meals! Card has {selectedLunchCard.remainingMeals} meals but needs {getTotalMeals()}.
                      </p>
                    )
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-['Jost',sans-serif] font-bold rounded-lg"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (paymentMethod === 'lunchCard' && !!selectedLunchCard && selectedLunchCard.remainingMeals < getTotalMeals())}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-['Jost',sans-serif] font-bold rounded-lg"
                  >
                    {isSubmitting ? '⏳ Processing...' : '✓ Confirm & Submit'}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!showConfirmation && !submitResult && (
              <button
                type="submit"
                disabled={
                  isSubmitting || 
                  !customer.firstName || 
                  !customer.lastName || 
                  !staffInitials ||
                  (transactionType === 'individual' && selectedDates.length === 0) ||
                  (transactionType === 'lunchCard' && !customer.phone) ||
                  (paymentMethod === 'lunchCard' && !selectedLunchCard) ||
                  (paymentMethod === 'lunchCard' && !!selectedLunchCard && selectedLunchCard.remainingMeals < getTotalMeals()) ||
                  (paymentMethod === 'compCard' && !compCardNumber) ||
                  (paymentMethod === 'check' && !checkNumber) ||
                  (paymentMethod === 'cashCheckSplit' && Math.abs((parseFloat(cashAmount || '0') + parseFloat(checkAmount || '0')) - getTotal()) >= 0.01) ||
                  (paymentMethod === 'cashCheckSplit' && !checkNumber)
                }
                className="w-full bg-[#427d78] hover:bg-[#5eb3a1] disabled:bg-gray-400 text-white font-['Jost',sans-serif] font-bold text-xl py-4 rounded-lg transition-colors shadow-lg"
              >
                {isSubmitting 
                  ? '⏳ Processing...' 
                  : paymentMethod === 'lunchCard' 
                    ? `Review: Deduct ${getTotalMeals()} Meal(s) from Lunch Card` 
                    : `Review Transaction - ${getTotalMeals()} meal(s) - $${getTotal().toFixed(2)}`
                }
              </button>
            )}
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
