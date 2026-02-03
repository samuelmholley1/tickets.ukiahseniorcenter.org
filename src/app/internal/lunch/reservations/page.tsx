
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


  // Fix 1: Use local date string instead of UTC
  const [currentDate, setCurrentDate] = useState<string>(() => {
    // Return YYYY-MM-DD in local time
    const local = new Date();
    const offset = local.getTimezoneOffset() * 60000;
    const localISOTime = new Date(local.getTime() - offset).toISOString();
    return localISOTime.split('T')[0];
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
    const newDate = new Date(currentDate);
    // Add timezone offset to prevent UTC conversion weirdness when date crosses boundary
    // Actually, simply manipulating the day part of the string or using local date is safer
    // But since input type="date" uses YYYY-MM-DD, let's stick to string maniupulation or careful Date obj
    newDate.setDate(newDate.getDate() + (days + 1)); // Fix: UTC conversion swallows a day if not careful? 
    // Wait, "2026-02-02" parsed as UTC is midnight. setDate(+1) -> "2026-02-03T00:00:00.000Z". split('T')[0] works.
    // BUT new Date("2026-02-02") is treated as UTC usually.
    // Let's use a simpler approach.
    const dateObj = new Date(currentDate + 'T12:00:00'); // Force noon to avoid DST/timezone shift issues
    dateObj.setDate(dateObj.getDate() + days);
    
    // Convert back to YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  // Group by meal type for easier display
  const dineIn = reservations.filter(r => r['Meal Type'] === 'Dine In');
  const toGo = reservations.filter(r => r['Meal Type'] === 'To Go');
  const delivery = reservations.filter(r => r['Meal Type'] === 'Delivery');

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
                 {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
                     <>
                        <Section title="🍽️ Dine In" items={dineIn} color="blue" />
                        <Section title="🛍️ To Go / Pickup" items={toGo} color="green" />
                        <Section title="🚚 Delivery" items={delivery} color="yellow" />
                     </>
                 )}
             </div>
          )}
        </div>
      </main>
      
      <SiteFooterContent />
    </div>
  );
}

function Section({ title, items, color }: { title: string, items: Reservation[], color: string }) {
    if (items.length === 0) return null;
    
    const colorClasses = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
        green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
        yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
    }[color] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900' };

    return (
        <div className={`bg-white rounded-xl shadow-sm border ${colorClasses.border} overflow-hidden`}>
            <div className={`${colorClasses.bg} px-6 py-3 border-b ${colorClasses.border}`}>
                <h3 className={`font-bold ${colorClasses.text} text-lg`}>{title} ({items.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {items.map(item => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 flex justify-between items-start">
                        <div>
                            <div className="font-bold text-gray-800 text-lg">{item.Name}</div>
                            {item.Notes && (
                                <p className="text-sm text-gray-500 mt-1 italic">&quot;{item.Notes}&quot;</p>
                            )}
                            <div className="flex gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600`}>
                                    {item['Member Status']}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600`}>
                                    paid via {item['Payment Method']}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                             {item.Amount && item.Amount > 0 && (
                                 <div className="font-bold text-green-700">${item.Amount}</div>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
