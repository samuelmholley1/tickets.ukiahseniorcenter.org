# Ukiah Senior Center - Event Tickets

Purchase tickets for events at the Ukiah Senior Center.

**Live Site:** [https://tickets.ukiahseniorcenter.org](https://tickets.ukiahseniorcenter.org)  
**GitHub:** [https://github.com/samuelmholley1/tickets.ukiahseniorcenter.org](https://github.com/samuelmholley1/tickets.ukiahseniorcenter.org)

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Zeffy** - Payment/ticketing processing (popup modals)

## Features

✅ Event ticket purchasing via **Zeffy popup modals** (not full embeds)  
✅ Responsive design optimized for seniors  
✅ Accessible, WCAG-compliant interface  
✅ Multiple event support with individual purchase buttons  
✅ Matching design system with main Ukiah Senior Center site

## How to Add Events

Edit `src/lib/copy.ts` and add events to the `EVENTS` array:

```typescript
export const EVENTS: Event[] = [
  {
    id: 'unique-event-id',
    title: 'Event Name',
    description: 'Event description here',
    date: 'March 15, 2025',
    time: '12:00 PM - 2:00 PM',
    location: 'Ukiah Senior Center Hall',
    zeffyUrl: 'https://www.zeffy.com/ticketing/your-zeffy-event-id',
    buttonText: 'Get Tickets' // Optional, defaults to "Purchase Tickets"
  },
  // Add more events...
];
```

Each event will automatically get its own card and purchase button that opens a Zeffy modal.

## Zeffy Integration

This site uses **Zeffy popup modals** instead of full embeds:
- Cleaner interface with multiple events on one page
- Each event button opens a modal with the Zeffy ticketing form
- Users can easily browse multiple events before purchasing

To set up new Zeffy ticket forms:
1. Create a ticketing form in Zeffy
2. Get the ticketing URL from Zeffy
3. Add it to the `EVENTS` array in `src/lib/copy.ts`

## Development Commands

```bash
yarn dev       # Start development server
yarn build     # Build for production
yarn start     # Run production build
yarn lint      # Run ESLint
```

## Deployment

This site can be deployed to Vercel, Netlify, or any hosting platform that supports Next.js:

```bash
yarn build
```

The output will be in the `.next` directory.

## Design System

Matches the main [ukiahseniorcenter.org](https://ukiahseniorcenter.org) site:
- **Fonts:** Jost (headings), Bitter (body), Montserrat (buttons)
- **Colors:** Teal (#427d78), hover teal (#5eb3a1)
- **Optimized for seniors:** Large text, high contrast, clear CTAs

## Related Projects

- [donate.ukiahseniorcenter.org](https://github.com/samuelmholley1/donate.ukiahseniorcenter.org) - Donation page
- [memberships.ukiahseniorcenter.org](https://github.com/samuelmholley1/memberships.ukiahseniorcenter.org) - Membership forms

## License

© 2025 Ukiah Senior Center  
Web page by [Samuel Holley AI Consulting](https://samuelholley.com)
