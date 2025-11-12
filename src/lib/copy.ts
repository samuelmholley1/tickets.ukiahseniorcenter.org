// Tickets page copy - centralized for easy editing

export const title = "Event Tickets — Ukiah Senior Center";

export const COPY = {
  // Main page
  headline: 'Event Tickets',
  subhead: 'Purchase tickets for upcoming events at the Ukiah Senior Center',
  
  // Buttons
  primaryButton: 'Purchase Tickets',
  closeButton: 'Close',
  
  // Modal
  modalTipInstruction: 'Tip is optional. You can adjust or set it to $0 during checkout.',
  
  // Footer
  orgName: 'Ukiah Senior Center',
  address: '499 Leslie St, Ukiah, CA 95482',
  phone: '(707) 462-4343',
  email: 'director@ukiahseniorcenter.org',
} as const;

// Event definitions - Add your events here
export interface Event {
  id: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  location?: string;
  zeffyUrl: string;
  buttonText?: string;
}

export const EVENTS: Event[] = [
  {
    id: 'sample-event-1',
    title: 'Sample Event - Spring Luncheon',
    description: 'Join us for our annual spring luncheon featuring live music and a delicious meal.',
    date: 'March 15, 2025',
    time: '12:00 PM - 2:00 PM',
    location: 'Ukiah Senior Center Hall',
    zeffyUrl: 'https://www.zeffy.com/ticketing/your-event-id-1',
    buttonText: 'Get Tickets'
  },
  {
    id: 'sample-event-2',
    title: 'Sample Event - Bingo Night',
    description: 'An evening of bingo, prizes, and fun with friends.',
    date: 'March 22, 2025',
    time: '6:00 PM - 8:00 PM',
    location: 'Ukiah Senior Center Hall',
    zeffyUrl: 'https://www.zeffy.com/ticketing/your-event-id-2',
    buttonText: 'Reserve Your Spot'
  },
];
