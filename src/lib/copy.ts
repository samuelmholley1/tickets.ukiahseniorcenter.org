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
    id: 'thanksgiving-feast',
    title: 'Thanksgiving Feast',
    description: 'Join us for a traditional Thanksgiving dinner with all the fixings. Celebrate the season with friends and community.',
    date: 'November 27, 2025',
    location: 'Ukiah Senior Center',
    zeffyUrl: 'https://www.zeffy.com/embed/ticketing/thanksgiving-feast--2026?modal=true',
    buttonText: 'Reserve Your Seat'
  },
  {
    id: 'nye-gala-dance',
    title: 'New Year\'s Eve Gala Dance',
    description: 'Ring in 2026 with style! Join us for an elegant evening of dancing, celebration, and festive fun.',
    date: 'December 31, 2025',
    location: 'Ukiah Senior Center',
    zeffyUrl: 'https://www.zeffy.com/embed/ticketing/new-years-eve-gala-dance--2025?modal=true',
    buttonText: 'Get Tickets'
  },
];
