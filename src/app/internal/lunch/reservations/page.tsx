
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

interface Reservation {
  id: string;
  Name: string;
  Date?: string;
  'Meal Type': string;
  'Member Status': string;
  'Payment Method': string;
  'Notes'?: string;
  'Status'?: string;
  'Amount'?: number;
}

export default function LunchList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelStep, setCancelStep] = useState<'choose' | 'confirm' | 'processing' | 'done' | 'error'>('choose');
  const [selectedRefund, setSelectedRefund] = useState<'cash' | 'lunchCard' | 'forfeit' | null>(null);
  const [cancelResult, setCancelResult] = useState<string>('');
  const [cancelError, setCancelError] = useState<string>('');

  // Customer lookup state
  const [lookupSearch, setLookupSearch] = useState('');
  const [lookupResults, setLookupResults] = useState<Reservation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPastReservations, setShowPastReservations] = useState(false);
  
  // Bulk modification state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'cancel' | 'changeDate' | 'changeMealType' | null>(null);
  const [bulkNewDate, setBulkNewDate] = useState('');
  const [bulkNewMealType, setBulkNewMealType] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ success: number; failed: number; messages: string[] }>({ success: 0, failed: 0, messages: [] });

  // Modify modal state
  const [modifyTarget, setModifyTarget] = useState<Reservation | null>(null);
  const [modifyStep, setModifyStep] = useState<'choose' | 'date' | 'mealType' | 'notes' | 'confirm' | 'processing' | 'done' | 'error'>('choose');
  const [modifyDate, setModifyDate] = useState<string>('');
  const [modifyMealType, setModifyMealType] = useState<string>('');
  const [modifyNotes, setModifyNotes] = useState<string[]>([]);
  const [modifyFreeformNote, setModifyFreeformNote] = useState<string>('');
  const [modifyResult, setModifyResult] = useState<string>('');
  const [modifyError, setModifyError] = useState<string>('');
  const [modifyField, setModifyField] = useState<'date' | 'mealType' | 'notes' | null>(null);

  const SPECIAL_REQUEST_OPTIONS = [
    'Vegetarian', 'No Garlic/Onions', 'Gluten-Free', 'Dairy-Free',
    'No Dessert', 'No Chocolate Dessert', 'In Fridge',
  ];

  const MEAL_TYPES = ['Dine In', 'To Go', 'Delivery'] as const;

  const PRICE_MAP: Record<string, { member: number; nonMember: number }> = {
    'Dine In':  { member: 8,  nonMember: 10 },
    'To Go':    { member: 9,  nonMember: 11 },
    'Delivery': { member: 12, nonMember: 14 },
  };

  const getPrice = (mealType: string, memberStatus: string) => {
    const prices = PRICE_MAP[mealType];
    if (!prices) return 0;
    return memberStatus === 'Member' ? prices.member : prices.nonMember;
  };


  // Default to next business lunch day (tomorrow, or Monday if Thu-Sun)
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    let daysToAdd = 1;
    switch (day) {
      case 0: daysToAdd = 1; break; // Sun → Mon
      case 4: daysToAdd = 4; break; // Thu → Mon
      case 5: daysToAdd = 3; break; // Fri → Mon
      case 6: daysToAdd = 2; break; // Sat → Mon
      default: daysToAdd = 1; break; // Mon-Wed → next day
    }
    const next = new Date(now);
    next.setDate(now.getDate() + daysToAdd);
    const year = next.getFullYear();
    const month = String(next.getMonth() + 1).padStart(2, '0');
    const d = String(next.getDate()).padStart(2, '0');
    return `${year}-${month}-${d}`;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/lunch/reservation?date=${currentDate}`);
        if (res.ok) {
          const data = await res.json();
          setReservations(data.reservations || []);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [currentDate]);

  const changeDate = (days: number) => {
    const dateObj = new Date(currentDate + 'T12:00:00'); // Force noon to avoid DST/timezone shift issues
    dateObj.setDate(dateObj.getDate() + days);
    
    // Convert back to YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  // Group by meal type for summary counts
  const dineIn = reservations.filter(r => r['Meal Type'] === 'Dine In');
  const toGo = reservations.filter(r => r['Meal Type'] === 'To Go');
  const delivery = reservations.filter(r => r['Meal Type'] === 'Delivery');

  // Merged list sorted A-Z by last name
  const sortedReservations = [...reservations].sort((a, b) => {
    const getLastName = (name: string) => {
      const parts = name.trim().split(/\s+/);
      return parts[parts.length - 1].toLowerCase();
    };
    return getLastName(a.Name).localeCompare(getLastName(b.Name));
  });

  const openCancelModal = (reservation: Reservation) => {
    setCancelTarget(reservation);
    setCancelStep('choose');
    setSelectedRefund(null);
    setCancelResult('');
    setCancelError('');
  };

  const closeCancelModal = () => {
    setCancelTarget(null);
    setCancelStep('choose');
    setSelectedRefund(null);
  };

  // Customer lookup handlers
  const handleLookup = async (includePast?: boolean) => {
    if (!lookupSearch.trim()) return;
    setIsSearching(true);
    setSelectedIds(new Set());
    setBulkResults({ success: 0, failed: 0, messages: [] });
    
    const futureOnly = includePast !== undefined ? !includePast : !showPastReservations;
    try {
      const res = await fetch(`/api/lunch/reservation?search=${encodeURIComponent(lookupSearch.trim())}${futureOnly ? '&futureOnly=true' : ''}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLookupResults(data.reservations || []);
      } else {
        setLookupResults([]);
      }
    } catch {
      setLookupResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(lookupResults.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const openBulkModal = (action: 'cancel' | 'changeDate' | 'changeMealType') => {
    setBulkAction(action);
    setBulkNewDate(currentDate);
    setBulkNewMealType('Dine In');
    setShowBulkModal(true);
    setBulkResults({ success: 0, failed: 0, messages: [] });
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setBulkAction(null);
    setBulkProcessing(false);
  };

  const executeBulkAction = async () => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    const results = { success: 0, failed: 0, messages: [] as string[] };

    for (const id of selectedIds) {
      const reservation = lookupResults.find(r => r.id === id);
      if (!reservation) continue;

      try {
        if (bulkAction === 'cancel') {
          const res = await fetch('/api/lunch/reservation', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reservationId: id,
              refundMethod: 'forfeit',
              staff: 'STAFF',
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            results.success++;
            results.messages.push(`✓ ${reservation.Name} (${reservation.Date}) cancelled`);
          } else {
            results.failed++;
            results.messages.push(`✗ ${reservation.Name} (${reservation.Date}): ${data.error || 'Failed'}`);
          }
        } else if (bulkAction === 'changeDate' || bulkAction === 'changeMealType') {
          const payload: Record<string, unknown> = {
            reservationId: id,
            memberStatus: reservation['Member Status'],
            staff: 'STAFF',
          };
          if (bulkAction === 'changeDate') payload.date = bulkNewDate;
          if (bulkAction === 'changeMealType') payload.mealType = bulkNewMealType;

          const res = await fetch('/api/lunch/reservation', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            results.success++;
            const changeDesc = bulkAction === 'changeDate' ? `date→${bulkNewDate}` : `type→${bulkNewMealType}`;
            results.messages.push(`✓ ${reservation.Name} (${reservation.Date}) ${changeDesc}`);
          } else {
            results.failed++;
            results.messages.push(`✗ ${reservation.Name} (${reservation.Date}): ${data.error || 'Failed'}`);
          }
        }
      } catch {
        results.failed++;
        results.messages.push(`✗ ${reservation.Name}: Network error`);
      }
    }

    setBulkResults(results);
    setBulkProcessing(false);

    // Refresh lookup after bulk operations
    if (results.success > 0) {
      handleLookup();
      // Force refresh the daily list by toggling date momentarily
      const saved = currentDate;
      setCurrentDate('');
      setTimeout(() => setCurrentDate(saved), 0);
    }
  };

  const openModifyModal = (reservation: Reservation) => {
    setModifyTarget(reservation);
    setModifyStep('choose');
    setModifyDate(currentDate);
    setModifyMealType(reservation['Meal Type']);
    // Separate pill-based notes from free-form notes
    const existingNotes = (reservation.Notes || '').split(', ').filter(Boolean);
    const pillNotes = existingNotes.filter(n => SPECIAL_REQUEST_OPTIONS.includes(n));
    setModifyNotes(pillNotes);
    setModifyFreeformNote(existingNotes.filter(n => !SPECIAL_REQUEST_OPTIONS.includes(n)).join(', '));
    setModifyField(null);
    setModifyResult('');
    setModifyError('');
  };

  const closeModifyModal = () => {
    setModifyTarget(null);
    setModifyStep('choose');
    setModifyField(null);
  };

  // Generate weekdays for date picker (4 weeks from current date)
  const getWeekdays = (): { value: string; label: string; dayName: string }[] => {
    const days: { value: string; label: string; dayName: string }[] = [];
    const start = new Date();
    start.setDate(start.getDate() - 7); // Include last week
    for (let i = 0; i < 42; i++) { // ~6 weeks
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) { // Mon-Fri
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const value = `${year}-${month}-${day}`;
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        days.push({ value, label, dayName });
      }
    }
    return days;
  };

  const handleModify = async () => {
    if (!modifyTarget || !modifyField) return;
    setModifyStep('processing');

    const payload: Record<string, unknown> = {
      reservationId: modifyTarget.id,
      memberStatus: modifyTarget['Member Status'],
      staff: 'STAFF',
    };

    if (modifyField === 'date') payload.date = modifyDate;
    if (modifyField === 'mealType') payload.mealType = modifyMealType;
    if (modifyField === 'notes') {
      const combined = [...modifyNotes, ...(modifyFreeformNote.trim() ? [modifyFreeformNote.trim()] : [])].join(', ');
      payload.notes = combined;
    }

    try {
      const res = await fetch('/api/lunch/reservation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setModifyResult(data.message);
        setModifyStep('done');
        // Update local list with new data
        if (data.reservation) {
          // If date changed, the reservation may no longer be on this date's list
          if (modifyField === 'date' && modifyDate !== currentDate) {
            setReservations(prev => prev.filter(r => r.id !== modifyTarget.id));
          } else {
            setReservations(prev => prev.map(r => r.id === modifyTarget.id ? { id: data.reservation.id, ...data.reservation } : r));
          }
        }
      } else {
        setModifyError(data.error || 'Failed to modify reservation');
        setModifyStep('error');
      }
    } catch {
      setModifyError('Network error. Please try again.');
      setModifyStep('error');
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget || !selectedRefund) return;
    setCancelStep('processing');

    try {
      const res = await fetch('/api/lunch/reservation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: cancelTarget.id,
          refundMethod: selectedRefund,
          staff: 'STAFF',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCancelResult(data.message);
        setCancelStep('done');
        // Remove from local list
        setReservations(prev => prev.filter(r => r.id !== cancelTarget.id));
      } else {
        setCancelError(data.error || 'Failed to cancel reservation');
        setCancelStep('error');
      }
    } catch {
      setCancelError('Network error. Please try again.');
      setCancelStep('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <SiteNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Link 
              href="/internal/lunch"
              className="text-[#427d78] hover:underline font-bold"
            >
              ← Back to Sales
            </Link>
            <h1 className="text-3xl font-bold text-[#2d3748] font-['Jost',sans-serif]">
              Lunch List
            </h1>
            <div className="w-24"></div> {/* Spacer for cleanup */}
          </div>

          {/* Date Controls */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8 flex justify-between items-center">
            <button 
              onClick={() => changeDate(-1)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 text-lg"
            >
              ‹
            </button>
            <div className="text-center">
               <input 
                 type="date" 
                 value={currentDate}
                 onChange={(e) => setCurrentDate(e.target.value)}
                 className="text-2xl font-bold text-[#427d78] border-b-2 border-[#427d78] focus:outline-none text-center bg-transparent"
               />
               <p className="text-gray-500 text-sm mt-0.5">
                 {new Date(currentDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
               </p>
            </div>
            <button 
              onClick={() => changeDate(1)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 text-lg"
            >
              ›
            </button>
          </div>

          {/* PDF Reports */}
          <div className="bg-purple-50 rounded-xl p-6 mb-8 flex flex-wrap gap-4 items-center justify-between border border-purple-100">
            <div>
              <h3 className="font-bold text-purple-900 text-lg">Daily Reports</h3>
              <p className="text-purple-700 text-sm">Download printable lists for the kitchen and drivers</p>
            </div>
            <div className="flex gap-3">
              <a 
                href={`/api/lunch/export-list?date=${currentDate}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md flex items-center gap-2"
              >
                📥 Download Kitchen List (PDF)
              </a>
              <a 
                href={`/api/lunch/export-labels?date=${currentDate}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-bold shadow-sm flex items-center gap-2"
              >
                🏷️ Download Labels
              </a>
            </div>
          </div>

          {/* Customer Lookup Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowLookupModal(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 text-lg"
            >
              🔍 Customer Lookup
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#427d78] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading reservations...</p>
            </div>
          ) : (
             <div className="space-y-6">
                 {/* Summary Stats */}
                 <div className="grid grid-cols-3 gap-4 mb-6">
                     <div className="bg-blue-50 p-4 rounded-lg text-center border-2 border-blue-100">
                         <div className="text-2xl font-bold text-blue-700">{dineIn.length}</div>
                         <div className="text-blue-900 font-bold uppercase text-xs tracking-wider">Dine In</div>
                     </div>
                     <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-100">
                         <div className="text-2xl font-bold text-green-700">{toGo.length}</div>
                         <div className="text-green-900 font-bold uppercase text-xs tracking-wider">To Go</div>
                     </div>
                     <div className="bg-yellow-50 p-4 rounded-lg text-center border-2 border-yellow-100">
                         <div className="text-2xl font-bold text-yellow-700">{delivery.length}</div>
                         <div className="text-yellow-900 font-bold uppercase text-xs tracking-wider">Delivery</div>
                     </div>
                 </div>

                 {reservations.length === 0 ? (
                     <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                         <p className="text-gray-400 text-lg">No reservations found for this date.</p>
                     </div>
                 ) : (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                         <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                             <h3 className="font-bold text-gray-900 text-lg">All Reservations ({sortedReservations.length})</h3>
                         </div>
                         <div className="divide-y divide-gray-100">
                             {sortedReservations.map(item => {
                                 const typeColor = item['Meal Type'] === 'Dine In' ? 'blue' : item['Meal Type'] === 'To Go' ? 'green' : 'yellow';
                                 const typeBg = { blue: 'bg-blue-100 text-blue-800', green: 'bg-green-100 text-green-800', yellow: 'bg-yellow-100 text-yellow-800' }[typeColor] || 'bg-gray-100 text-gray-700';
                                 return (
                                     <div key={item.id} className="p-4 hover:bg-gray-50 flex justify-between items-start">
                                         <div className="flex-1 min-w-0">
                                             <div className="font-bold text-gray-800 text-lg">{item.Name}</div>
                                             {item.Notes && (
                                                 <p className="text-sm text-gray-500 mt-1 italic">&quot;{item.Notes}&quot;</p>
                                             )}
                                             <div className="flex gap-2 mt-2 flex-wrap">
                                                 <span className={`text-xs px-2 py-1 rounded font-bold ${typeBg}`}>
                                                     {item['Meal Type']}
                                                 </span>
                                                 <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                                     {item['Member Status']}
                                                 </span>
                                                 <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                                     paid via {item['Payment Method']}
                                                 </span>
                                             </div>
                                         </div>
                                         <div className="flex items-center gap-2 ml-4 shrink-0">
                                             {item.Amount && item.Amount > 0 && (
                                                 <div className="font-bold text-green-700">${item.Amount}</div>
                                             )}
                                             <button
                                                 type="button"
                                                 onClick={() => openModifyModal(item)}
                                                 className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg text-sm font-bold border border-blue-200 hover:border-blue-300 transition-all"
                                             >
                                                 ✏️ Modify
                                             </button>
                                             <button
                                                 type="button"
                                                 onClick={() => openCancelModal(item)}
                                                 className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg text-sm font-bold border border-red-200 hover:border-red-300 transition-all"
                                             >
                                                 ✕ Cancel
                                             </button>
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 )}
             </div>
          )}
        </div>
      </main>

      {/* Cancel Reservation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-xl font-['Jost',sans-serif]">Cancel Reservation</h2>
              <button onClick={closeCancelModal} className="text-white/80 hover:text-white text-2xl font-bold leading-none">&times;</button>
            </div>

            <div className="p-6">
              {/* Reservation info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
                <div className="font-bold text-gray-900 text-lg">{cancelTarget.Name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {cancelTarget['Meal Type']} &bull; {cancelTarget['Member Status']} &bull; {cancelTarget['Payment Method']}
                </div>
                {cancelTarget.Amount && cancelTarget.Amount > 0 && (
                  <div className="text-green-700 font-bold mt-1">${cancelTarget.Amount}</div>
                )}
              </div>

              {/* Step: Choose refund method */}
              {cancelStep === 'choose' && (
                <>
                  <p className="text-gray-700 font-medium mb-4">How should this cancellation be handled?</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => { setSelectedRefund('cash'); setCancelStep('confirm'); }}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💵</span>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-green-800">Refund — Cash</div>
                          <div className="text-sm text-gray-500">Give cash back to customer. Cash box balance will be adjusted.</div>
                        </div>
                      </div>
                    </button>

                    {cancelTarget['Payment Method'] === 'Lunch Card' && (
                      <button
                        onClick={() => { setSelectedRefund('lunchCard'); setCancelStep('confirm'); }}
                        className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎫</span>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-amber-800">Refund — Lunch Card</div>
                            <div className="text-sm text-gray-500">Add 1 meal back to their lunch card balance.</div>
                          </div>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => { setSelectedRefund('forfeit'); setCancelStep('confirm'); }}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🚫</span>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-red-800">Forfeit Payment</div>
                          <div className="text-sm text-gray-500">Cancel without refund. Customer forfeits payment.</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {/* Step: Confirm */}
              {cancelStep === 'confirm' && selectedRefund && (
                <>
                  <div className={`p-4 rounded-xl border-2 mb-5 ${
                    selectedRefund === 'cash' ? 'bg-green-50 border-green-300' :
                    selectedRefund === 'lunchCard' ? 'bg-amber-50 border-amber-300' :
                    'bg-red-50 border-red-300'
                  }`}>
                    <div className="font-bold text-lg mb-1">
                      {selectedRefund === 'cash' && '💵 Cash Refund'}
                      {selectedRefund === 'lunchCard' && '🎫 Lunch Card Refund'}
                      {selectedRefund === 'forfeit' && '🚫 Forfeit Payment'}
                    </div>
                    <div className="text-sm text-gray-700">
                      {selectedRefund === 'cash' && `Return $${cancelTarget.Amount || 0} cash to ${cancelTarget.Name}. This will be reflected in cash box balancing.`}
                      {selectedRefund === 'lunchCard' && `Add 1 meal back to ${cancelTarget.Name}'s lunch card.`}
                      {selectedRefund === 'forfeit' && `${cancelTarget.Name}'s reservation will be cancelled with no refund.`}
                    </div>
                  </div>

                  <p className="text-red-700 font-bold text-center mb-4">⚠️ This action cannot be undone.</p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setCancelStep('choose'); setSelectedRefund(null); }}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
                    >
                      Confirm Cancellation
                    </button>
                  </div>
                </>
              )}

              {/* Step: Processing */}
              {cancelStep === 'processing' && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Processing cancellation...</p>
                </div>
              )}

              {/* Step: Done */}
              {cancelStep === 'done' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-green-800 font-bold text-lg mb-2">Reservation Cancelled</p>
                  <p className="text-gray-600 mb-5">{cancelResult}</p>
                  <button
                    onClick={closeCancelModal}
                    className="px-6 py-3 bg-[#427d78] hover:bg-[#356560] text-white font-bold rounded-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Step: Error */}
              {cancelStep === 'error' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">❌</div>
                  <p className="text-red-800 font-bold text-lg mb-2">Cancellation Failed</p>
                  <p className="text-gray-600 mb-5">{cancelError}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCancelStep('choose')}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={closeCancelModal}
                      className="flex-1 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modify Reservation Modal */}
      {modifyTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-white font-bold text-xl font-['Jost',sans-serif]">✏️ Modify Reservation</h2>
              <button onClick={closeModifyModal} className="text-white/80 hover:text-white text-2xl font-bold leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Reservation info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
                <div className="font-bold text-gray-900 text-lg">{modifyTarget.Name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {modifyTarget['Meal Type']} &bull; {modifyTarget['Member Status']} &bull; {modifyTarget['Payment Method']}
                </div>
                {modifyTarget.Notes && (
                  <p className="text-sm text-gray-500 mt-1 italic">&quot;{modifyTarget.Notes}&quot;</p>
                )}
              </div>

              {/* Step: Choose what to modify */}
              {modifyStep === 'choose' && (
                <>
                  <p className="text-gray-700 font-medium mb-4">What would you like to change?</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => { setModifyField('date'); setModifyStep('date'); }}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-800">Change Date</div>
                          <div className="text-sm text-gray-500">Move this reservation to a different weekday</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setModifyField('mealType'); setModifyStep('mealType'); }}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍽️</span>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-green-800">Change Meal Type</div>
                          <div className="text-sm text-gray-500">Switch between Dine In, To Go, or Delivery</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setModifyField('notes'); setModifyStep('notes'); }}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-purple-800">Change Special Request</div>
                          <div className="text-sm text-gray-500">Add or change dietary preferences and notes</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {/* Step: Pick new date */}
              {modifyStep === 'date' && (
                <>
                  <p className="text-gray-700 font-medium mb-3">Select a new date (Mon–Fri only):</p>
                  <div className="grid grid-cols-5 gap-1 mb-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
                      <div key={d} className="text-center font-['Jost',sans-serif] font-bold text-xs text-gray-500 py-1">{d}</div>
                    ))}
                  </div>
                  {(() => {
                    const weekdays = getWeekdays();
                    // Group by week (Mon start)
                    const weeks: { value: string; label: string; dayName: string }[][] = [];
                    let currentWeek: { value: string; label: string; dayName: string }[] = [];
                    for (const day of weekdays) {
                      if (day.dayName === 'Mon' && currentWeek.length > 0) {
                        weeks.push(currentWeek);
                        currentWeek = [];
                      }
                      currentWeek.push(day);
                    }
                    if (currentWeek.length > 0) weeks.push(currentWeek);

                    return weeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-5 gap-1 mb-1">
                        {week.map(day => {
                          const isCurrentDate = day.value === currentDate;
                          const isSelected = day.value === modifyDate;
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => setModifyDate(day.value)}
                              className={`py-2 px-1 rounded-lg text-center transition-all text-sm font-['Jost',sans-serif] font-semibold ${
                                isSelected
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                  : isCurrentDate
                                    ? 'bg-amber-50 text-amber-800 border-2 border-amber-300 hover:border-amber-400'
                                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              <div className="text-xs opacity-70">{day.dayName}</div>
                              <div>{new Date(day.value + 'T12:00:00').getDate()}</div>
                            </button>
                          );
                        })}
                      </div>
                    ));
                  })()}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => { setModifyStep('choose'); setModifyField(null); }}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setModifyStep('confirm')}
                      disabled={modifyDate === currentDate}
                      className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all ${
                        modifyDate === currentDate
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Move to {modifyDate !== currentDate ? new Date(modifyDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '...'}
                    </button>
                  </div>
                </>
              )}

              {/* Step: Pick meal type */}
              {modifyStep === 'mealType' && (
                <>
                  <p className="text-gray-700 font-medium mb-4">Select the new meal type:</p>
                  <div className="space-y-3">
                    {MEAL_TYPES.map(type => {
                      const isSelected = modifyMealType === type;
                      const isCurrent = modifyTarget['Meal Type'] === type;
                      const emoji = type === 'Dine In' ? '🍽️' : type === 'To Go' ? '📦' : '🚗';
                      const price = getPrice(type, modifyTarget['Member Status']);
                      const currentPrice = getPrice(modifyTarget['Meal Type'], modifyTarget['Member Status']);
                      const priceDiff = price - currentPrice;
                      const color = type === 'Dine In' ? 'blue' : type === 'To Go' ? 'green' : 'yellow';
                      const colors = {
                        blue: { border: 'border-blue-500 bg-blue-50', ring: 'ring-blue-300', text: 'text-blue-800' },
                        green: { border: 'border-green-500 bg-green-50', ring: 'ring-green-300', text: 'text-green-800' },
                        yellow: { border: 'border-yellow-500 bg-yellow-50', ring: 'ring-yellow-300', text: 'text-yellow-800' },
                      }[color];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setModifyMealType(type)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `${colors.border} ring-2 ${colors.ring}`
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{emoji}</span>
                            <div className="flex-1">
                              <div className={`font-bold text-lg ${isSelected ? colors.text : 'text-gray-900'}`}>
                                {type} — ${price}
                              </div>
                              {!isCurrent && priceDiff !== 0 && (
                                <div className={`text-xs font-bold mt-0.5 ${priceDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {priceDiff > 0 ? `+$${priceDiff} more — collect extra` : `-$${Math.abs(priceDiff)} less — refund difference`}
                                </div>
                              )}
                            </div>
                            {isCurrent && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-bold">Current</span>
                            )}
                            {isSelected && !isCurrent && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-bold">Selected</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => { setModifyStep('choose'); setModifyField(null); }}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setModifyStep('confirm')}
                      disabled={modifyMealType === modifyTarget['Meal Type']}
                      className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all ${
                        modifyMealType === modifyTarget['Meal Type']
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Change to {modifyMealType}
                    </button>
                  </div>
                </>
              )}

              {/* Step: Special request pills */}
              {modifyStep === 'notes' && (
                <>
                  <p className="text-gray-700 font-medium mb-4">Select special requests:</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {SPECIAL_REQUEST_OPTIONS.map(option => {
                      const isActive = modifyNotes.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setModifyNotes(prev =>
                              isActive ? prev.filter(n => n !== option) : [...prev, option]
                            );
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-bold font-['Jost',sans-serif] transition-all border-2 ${
                            isActive
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                        >
                          {isActive ? '✓ ' : ''}{option}
                        </button>
                      );
                    })}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                    <div className="text-xs text-gray-500 font-bold mb-1">Preview:</div>
                    <div className="text-sm text-gray-700 font-['Bitter',serif]">
                      {modifyNotes.length > 0 || modifyFreeformNote.trim() ? (
                        [...modifyNotes, ...(modifyFreeformNote.trim() ? [modifyFreeformNote.trim()] : [])].join(', ')
                      ) : (
                        <span className="italic text-gray-400">No special requests</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 font-bold mb-1">Additional note (optional):</label>
                    <input
                      type="text"
                      value={modifyFreeformNote}
                      onChange={(e) => setModifyFreeformNote(e.target.value)}
                      placeholder="e.g. Allergic to shellfish"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm font-['Bitter',serif]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setModifyStep('choose'); setModifyField(null); }}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setModifyStep('confirm')}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                    >
                      Save Special Request
                    </button>
                  </div>
                </>
              )}

              {/* Step: Confirm */}
              {modifyStep === 'confirm' && modifyField && (
                <>
                  <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-300 mb-5">
                    <div className="font-bold text-lg mb-2 text-blue-900">Summary of Change</div>
                    {modifyField === 'date' && (
                      <div className="text-sm text-gray-700">
                        <span className="font-bold">Date:</span>{' '}
                        <span className="line-through text-gray-400">{new Date(currentDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        {' → '}
                        <span className="font-bold text-blue-800">{new Date(modifyDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                    {modifyField === 'mealType' && (() => {
                      const oldPrice = getPrice(modifyTarget['Meal Type'], modifyTarget['Member Status']);
                      const newPrice = getPrice(modifyMealType, modifyTarget['Member Status']);
                      const diff = newPrice - oldPrice;
                      const isLunchCard = modifyTarget['Payment Method'] === 'Lunch Card' || modifyTarget['Payment Method'] === 'Comp Card';
                      return (
                        <>
                          <div className="text-sm text-gray-700">
                            <span className="font-bold">Meal Type:</span>{' '}
                            <span className="line-through text-gray-400">{modifyTarget['Meal Type']} (${oldPrice})</span>
                            {' → '}
                            <span className="font-bold text-blue-800">{modifyMealType} (${newPrice})</span>
                          </div>
                          {diff !== 0 && !isLunchCard && (
                            <div className={`mt-3 p-3 rounded-lg border-2 ${diff > 0 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                              <div className={`font-bold text-lg ${diff > 0 ? 'text-red-800' : 'text-green-800'}`}>
                                {diff > 0 ? `⚠️ Collect $${diff} more from customer` : `💵 Refund $${Math.abs(diff)} to customer`}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Price changes from ${oldPrice} to ${newPrice}. Handle the ${Math.abs(diff)} difference at the register.
                              </div>
                            </div>
                          )}
                          {diff !== 0 && isLunchCard && (
                            <div className="mt-3 p-3 rounded-lg border-2 bg-amber-50 border-amber-300">
                              <div className="font-bold text-amber-800">
                                🎫 Lunch Card — no cash action needed
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Lunch cards are 1 punch per meal regardless of type. No additional payment or refund required.
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    {modifyField === 'notes' && (
                      <div className="text-sm text-gray-700">
                        <span className="font-bold">Special Request:</span>{' '}
                        {modifyTarget.Notes && <span className="line-through text-gray-400">{modifyTarget.Notes}</span>}
                        {modifyTarget.Notes && ' → '}
                        <span className="font-bold text-blue-800">{modifyNotes.length > 0 ? modifyNotes.join(', ') : '(none)'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setModifyStep(modifyField)}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleModify}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                    >
                      Confirm Change
                    </button>
                  </div>
                </>
              )}

              {/* Step: Processing */}
              {modifyStep === 'processing' && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Applying changes...</p>
                </div>
              )}

              {/* Step: Done */}
              {modifyStep === 'done' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-green-800 font-bold text-lg mb-2">Reservation Modified</p>
                  <p className="text-gray-600 mb-5">{modifyResult}</p>
                  <button
                    onClick={closeModifyModal}
                    className="px-6 py-3 bg-[#427d78] hover:bg-[#356560] text-white font-bold rounded-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Step: Error */}
              {modifyStep === 'error' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">❌</div>
                  <p className="text-red-800 font-bold text-lg mb-2">Modification Failed</p>
                  <p className="text-gray-600 mb-5">{modifyError}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModifyStep('choose')}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={closeModifyModal}
                      className="flex-1 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && bulkAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${
              bulkAction === 'cancel' ? 'bg-red-600' : 
              bulkAction === 'changeDate' ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              <h2 className="text-white font-bold text-xl font-['Jost',sans-serif]">
                {bulkAction === 'cancel' && `Cancel ${selectedIds.size} Reservation${selectedIds.size !== 1 ? 's' : ''}`}
                {bulkAction === 'changeDate' && `Change Date for ${selectedIds.size} Reservation${selectedIds.size !== 1 ? 's' : ''}`}
                {bulkAction === 'changeMealType' && `Change Meal Type for ${selectedIds.size} Reservation${selectedIds.size !== 1 ? 's' : ''}`}
              </h2>
              <button onClick={closeBulkModal} className="text-white/80 hover:text-white text-2xl font-bold leading-none">&times;</button>
            </div>

            <div className="p-6">
              {bulkResults.messages.length > 0 ? (
                /* Results view */
                <div>
                  <div className="mb-4 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {bulkResults.success > 0 && <span className="text-green-600">{bulkResults.success} succeeded</span>}
                      {bulkResults.success > 0 && bulkResults.failed > 0 && ', '}
                      {bulkResults.failed > 0 && <span className="text-red-600">{bulkResults.failed} failed</span>}
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3 text-sm space-y-1 mb-4">
                    {bulkResults.messages.map((msg, i) => (
                      <div key={i} className={msg.startsWith('✓') ? 'text-green-700' : 'text-red-600'}>
                        {msg}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={closeBulkModal}
                    className="w-full px-4 py-3 bg-[#427d78] hover:bg-[#356560] text-white font-bold rounded-xl"
                  >
                    Done
                  </button>
                </div>
              ) : bulkProcessing ? (
                /* Processing view */
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#427d78] mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Processing {selectedIds.size} reservation{selectedIds.size !== 1 ? 's' : ''}...</p>
                </div>
              ) : (
                /* Confirmation view */
                <div>
                  {bulkAction === 'cancel' && (
                    <>
                      <p className="text-gray-700 mb-4">
                        This will cancel {selectedIds.size} reservation{selectedIds.size !== 1 ? 's' : ''} without refund (forfeit).
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        For refunds, cancel reservations individually from the daily list.
                      </p>
                    </>
                  )}
                  {bulkAction === 'changeDate' && (
                    <div className="mb-6">
                      <label className="block text-gray-700 font-bold mb-2">New Date</label>
                      <input
                        type="date"
                        value={bulkNewDate}
                        onChange={(e) => setBulkNewDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                  {bulkAction === 'changeMealType' && (
                    <div className="mb-6">
                      <label className="block text-gray-700 font-bold mb-2">New Meal Type</label>
                      <div className="space-y-2">
                        {['Dine In', 'To Go', 'Delivery'].map(type => (
                          <button
                            key={type}
                            onClick={() => setBulkNewMealType(type)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              bulkNewMealType === type 
                                ? 'border-green-500 bg-green-50 text-green-800' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="font-bold">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={closeBulkModal}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeBulkAction}
                      className={`flex-1 px-4 py-3 text-white font-bold rounded-xl ${
                        bulkAction === 'cancel' ? 'bg-red-600 hover:bg-red-700' :
                        bulkAction === 'changeDate' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {bulkAction === 'cancel' ? 'Cancel Reservations' : 'Apply Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Lookup Modal */}
      {showLookupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-teal-600 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-white font-bold text-xl font-['Jost',sans-serif]">🔍 Customer Lookup</h2>
              <button
                onClick={() => { setShowLookupModal(false); setLookupResults([]); setSelectedIds(new Set()); setLookupSearch(''); setShowPastReservations(false); }}
                className="text-white/80 hover:text-white text-2xl font-bold leading-none"
              >&times;</button>
            </div>

            <div className="p-6 flex flex-col overflow-hidden">
              {/* Search input */}
              <div className="flex gap-2 items-center mb-4">
                <input
                  type="text"
                  value={lookupSearch}
                  onChange={(e) => setLookupSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="Search by last name..."
                  className="flex-1 px-4 py-2.5 border-2 border-teal-300 rounded-lg focus:outline-none focus:border-teal-500 text-gray-800 text-lg"
                  autoFocus
                />
                <button
                  onClick={() => handleLookup()}
                  disabled={isSearching || !lookupSearch.trim()}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg font-bold shadow-md"
                >
                  {isSearching ? '...' : 'Search'}
                </button>
              </div>

              {/* Results area */}
              {lookupResults.length > 0 || isSearching ? (
                <div className="flex flex-col overflow-hidden flex-1">
                  {/* Results header with count + controls */}
                  <div className="bg-teal-50 px-4 py-2 rounded-t-lg border border-teal-200 border-b-0 flex justify-between items-center shrink-0">
                    <span className="font-bold text-teal-900">
                      {isSearching ? 'Searching...' : `${lookupResults.length} reservation${lookupResults.length !== 1 ? 's' : ''} found`}
                    </span>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => {
                          const next = !showPastReservations;
                          setShowPastReservations(next);
                          handleLookup(!next);
                        }}
                        className={`text-sm px-3 py-1 rounded font-bold transition-all ${
                          showPastReservations
                            ? 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {showPastReservations ? '📋 Showing All' : '📋 View Past'}
                      </button>
                      {lookupResults.length > 0 && (
                        <button
                          onClick={selectedIds.size === lookupResults.length ? deselectAll : selectAll}
                          className="text-sm px-3 py-1 bg-teal-200 hover:bg-teal-300 text-teal-800 rounded font-bold"
                        >
                          {selectedIds.size === lookupResults.length ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Scrollable results list */}
                  <div className="border border-teal-200 rounded-b-lg overflow-y-auto max-h-[50vh] divide-y divide-gray-100">
                    {lookupResults.map(r => {
                      const isPast = r.Date && new Date(r.Date + 'T12:00:00') < new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }).split(',')[0] + 'T00:00:00');
                      const typeColor = r['Meal Type'] === 'Dine In' ? 'blue' : r['Meal Type'] === 'To Go' ? 'green' : 'yellow';
                      const typeBg = { blue: 'bg-blue-100 text-blue-800', green: 'bg-green-100 text-green-800', yellow: 'bg-yellow-100 text-yellow-800' }[typeColor] || 'bg-gray-100 text-gray-700';
                      return (
                        <label key={r.id} className={`flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer ${isPast ? 'opacity-60' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(r.id)}
                            onChange={() => toggleSelection(r.id)}
                            className="w-5 h-5 rounded border-2 border-teal-400 text-teal-600 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-gray-900">{r.Name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded font-bold ${typeBg}`}>
                                {r['Meal Type']}
                              </span>
                              <span className="text-xs text-gray-500">{r['Payment Method']}</span>
                              {isPast && <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600 font-bold">PAST</span>}
                            </div>
                            <div className="text-sm text-gray-600 mt-0.5">
                              📅 {r.Date ? new Date(r.Date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'No date'}
                              {r.Notes && <span className="ml-2 italic text-gray-500">&quot;{r.Notes}&quot;</span>}
                              {r.Amount != null && r.Amount > 0 && <span className="ml-2 font-bold text-green-700">${r.Amount}</span>}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Bulk Action Buttons */}
                  {selectedIds.size > 0 && (
                    <div className="bg-gray-50 px-4 py-3 flex gap-2 items-center border border-gray-200 rounded-lg mt-3 flex-wrap shrink-0">
                      <span className="text-sm text-gray-600 mr-2 font-bold">{selectedIds.size} selected:</span>
                      <button
                        onClick={() => openBulkModal('changeDate')}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold text-sm"
                      >
                        📅 Change Date
                      </button>
                      <button
                        onClick={() => openBulkModal('changeMealType')}
                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded font-bold text-sm"
                      >
                        🍽️ Change Meal Type
                      </button>
                      <button
                        onClick={() => openBulkModal('cancel')}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold text-sm"
                      >
                        ✕ Cancel Selected
                      </button>
                    </div>
                  )}
                </div>
              ) : lookupSearch.trim() && !isSearching ? (
                <div className="text-center py-8 text-gray-500">
                  No {showPastReservations ? '' : 'future '}reservations found for &quot;{lookupSearch}&quot;
                  {!showPastReservations && (
                    <div className="mt-3">
                      <button
                        onClick={() => { setShowPastReservations(true); handleLookup(true); }}
                        className="text-sm px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold"
                      >
                        📋 Try including past reservations
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Enter a last name and press Search
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <SiteFooterContent />
    </div>
  );
}


