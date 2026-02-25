
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

interface Reservation {
  id: string;
  Name: string;
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
                                         <div className="flex items-center gap-3 ml-4 shrink-0">
                                             {item.Amount && item.Amount > 0 && (
                                                 <div className="font-bold text-green-700">${item.Amount}</div>
                                             )}
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
      
      <SiteFooterContent />
    </div>
  );
}


