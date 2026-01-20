'use client';

import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

/* ========== STAFF DIRECTORY ==========
 * Central hub linking to all staff-facing pages
 * across all ukiahseniorcenter.org subdomains
 * ===================================== */

const DIRECTORY_SECTIONS = [
  {
    title: '🎟️ Tickets & Events',
    description: 'Event ticket sales and management',
    links: [
      { name: 'Ticket Sales (Internal)', url: '/internal', description: 'Cash/check ticket sales for Valentine\'s & AATR' },
      { name: 'Lunch Sales', url: '/internal/lunch', description: 'Lunch reservations and lunch card sales' },
      { name: 'Public Tickets Page', url: '/', description: 'Where customers buy tickets online (Zeffy)' },
      { name: 'Ticket List', url: '/internal/list', description: 'View all ticket transactions' },
    ]
  },
  {
    title: '👥 Memberships',
    description: 'Membership management',
    links: [
      { name: 'Public Memberships Page', url: 'https://memberships.ukiahseniorcenter.org', description: 'Where people sign up online', external: true },
      { name: 'Membership Card Generator', url: '/membership-card', description: 'Generate printable membership cards' },
    ]
  },
  {
    title: '💰 Donations',
    description: 'Donation processing',
    links: [
      { name: 'Public Donate Page', url: 'https://donate.ukiahseniorcenter.org', description: 'Where people donate online', external: true },
    ]
  },
  {
    title: '⚙️ Admin',
    description: 'Administrative tools',
    links: [
      { name: 'Admin Portal', url: 'https://admin.ukiahseniorcenter.org', description: 'Admin dashboard and tools', external: true },
    ]
  },
  {
    title: '📊 Attendance Lists',
    description: 'Event attendance tracking',
    links: [
      { name: 'NYE 2025 Attendance', url: '/nye2025-attendance-list', description: 'New Year\'s Eve Gala guest list' },
      { name: 'Christmas 2025 Attendance', url: '/xmas2025-attendance-list', description: 'Christmas Drive-Thru pickup list' },
    ]
  },
  {
    title: '📚 Bookstore Tickets',
    description: 'Pre-printed tickets for Mendocino Book Company',
    links: [
      { name: 'Speakeasy Box Card', url: '/bookstore-speakeasy-info', description: 'An Affair to Remember summary card (5x3)' },
      { name: 'Valentine\'s Tickets PDF', url: '/bookstore-valentines', description: '20 Valentine\'s Day Dance tickets' },
      { name: 'Valentine\'s Box Card', url: '/bookstore-valentines-info', description: 'Event summary card for box (5x3)' },
      { name: 'Xmas/NYE Tickets PDF', url: '/bookstore', description: '20 Christmas + 20 NYE tickets' },
      { name: 'Xmas/NYE Box Cards', url: '/bookstore2', description: 'Event summary cards for box (5x3)' },
    ]
  },
  {
    title: '🔗 Zeffy Campaigns',
    description: 'Direct links to Zeffy payment pages',
    links: [
      { name: 'Valentine\'s Day Dance', url: 'https://www.zeffy.com/en-US/ticketing/valentines-day-dance--2026-2', description: 'Feb 14, 2026', external: true },
      { name: 'An Affair to Remember', url: 'https://www.zeffy.com/en-US/ticketing/an-affair-to-remember-2026-a-night-at-the-speakeasy', description: 'Apr 11, 2026', external: true },
      { name: 'Lunch Program', url: 'https://www.zeffy.com/en-US/ticketing/lunch-8', description: 'Daily lunches & lunch cards', external: true },
      { name: 'Individual Membership', url: 'https://www.zeffy.com/en-US/ticketing/become-a-member-of-ukiah-senior-center', description: '$40/year', external: true },
      { name: 'Household Membership', url: 'https://www.zeffy.com/en-US/ticketing/join-ukiah-senior-center-as-a-household', description: '$65/year', external: true },
      { name: 'Donations', url: 'https://www.zeffy.com/en-US/donation-form/ukiah-senior-center', description: 'General donations', external: true },
    ]
  },
  {
    title: '📋 Airtable',
    description: 'Direct database access',
    links: [
      { name: 'Airtable Base', url: 'https://airtable.com/appYnPTgbxRMUCANw', description: 'All ticket and lunch data', external: true },
    ]
  },
];

export default function DirectoryPage() {
  return (
    <>
      <SiteNavigation />
      
      <div className="bg-[#fafbff]" style={{ paddingBlock: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ marginBottom: 'var(--space-2)', lineHeight: '1.2', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
              📁 Staff Directory
            </h1>
            <p className="font-['Bitter',serif] text-[#666]" style={{ lineHeight: '1.6', fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Quick links to all staff tools and pages
            </p>
          </div>

          {/* Directory Sections */}
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {DIRECTORY_SECTIONS.map((section) => (
              <div key={section.title} className="card">
                <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78] text-xl" style={{ marginBottom: 'var(--space-1)' }}>
                  {section.title}
                </h2>
                <p className="font-['Bitter',serif] text-gray-500 text-sm" style={{ marginBottom: 'var(--space-3)' }}>
                  {section.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-2)' }}>
                  {section.links.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="block p-4 bg-gray-50 hover:bg-[#427d78] rounded-lg border-2 border-gray-200 hover:border-[#427d78] transition-all group"
                    >
                      <div className="font-['Jost',sans-serif] font-bold text-gray-900 group-hover:text-white flex items-center gap-2">
                        {link.name}
                        {link.external && (
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </div>
                      <div className="font-['Bitter',serif] text-sm text-gray-500 group-hover:text-white/80" style={{ marginTop: '4px' }}>
                        {link.description}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reference */}
          <div className="card" style={{ marginTop: 'var(--space-4)', background: '#427d78' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-white text-xl" style={{ marginBottom: 'var(--space-3)' }}>
              🚀 Quick Actions
            </h2>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <a
                href="/internal"
                className="inline-block bg-white hover:bg-gray-100 text-[#427d78] font-['Jost',sans-serif] font-bold px-6 py-3 rounded-lg transition-colors"
              >
                🎟️ Sell Event Tickets
              </a>
              <a
                href="/internal/lunch"
                className="inline-block bg-white hover:bg-gray-100 text-[#427d78] font-['Jost',sans-serif] font-bold px-6 py-3 rounded-lg transition-colors"
              >
                🍽️ Sell Lunch
              </a>
              <a
                href="/membership-card"
                className="inline-block bg-white hover:bg-gray-100 text-[#427d78] font-['Jost',sans-serif] font-bold px-6 py-3 rounded-lg transition-colors"
              >
                💳 Print Membership Card
              </a>
              <a
                href="https://airtable.com/appYnPTgbxRMUCANw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white hover:bg-gray-100 text-[#427d78] font-['Jost',sans-serif] font-bold px-6 py-3 rounded-lg transition-colors"
              >
                📊 View Database
              </a>
            </div>
          </div>

        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
