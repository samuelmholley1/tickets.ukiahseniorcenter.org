import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

export const metadata = {
  title: 'Privacy Policy - Ukiah Senior Center',
  description: 'Privacy Policy for Ukiah Senior Center Database and Ticketing System',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteNavigation />
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: 'var(--space-6) var(--space-4)',
        fontFamily: 'var(--font-serif)'
      }}>
        <h1 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
          fontSize: 'clamp(2rem, 6vw, 3rem)', 
          marginBottom: 'var(--space-4)',
          textAlign: 'center'
        }}>
          Privacy Policy
        </h1>
        
        <p style={{ color: '#666', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          Last Updated: December 19, 2025
        </p>

        <div style={{ lineHeight: '1.8', color: '#333' }}>
          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              1. Introduction
            </h2>
            <p>
              Ukiah Senior Center ("we," "our," or "us") operates the ticketing and database system at 
              tickets.ukiahseniorcenter.org and admin.ukiahseniorcenter.org (the "System"). This Privacy 
              Policy explains how we collect, use, disclose, and safeguard your information when you use our System.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              2. Information We Collect
            </h2>
            <p style={{ marginBottom: 'var(--space-2)' }}>
              We collect information that you provide directly to us when purchasing tickets or making donations:
            </p>
            <ul style={{ marginLeft: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <li>Name (first and last)</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Transaction details (ticket quantities, event selections, donation amounts)</li>
              <li>Purchase date and time</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              3. How We Use Your Information
            </h2>
            <p style={{ marginBottom: 'var(--space-2)' }}>We use the information we collect to:</p>
            <ul style={{ marginLeft: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <li>Process your ticket purchases and donations</li>
              <li>Send you email receipts and confirmations</li>
              <li>Manage event attendance and meal planning</li>
              <li>Maintain accurate financial records</li>
              <li>Integrate transaction data with our accounting system (QuickBooks)</li>
              <li>Communicate important updates about events you've purchased tickets for</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              4. Information Sharing and Disclosure
            </h2>
            <p style={{ marginBottom: 'var(--space-2)' }}>
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information only in the following circumstances:
            </p>
            <ul style={{ marginLeft: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate 
              our System (Airtable for data storage, Resend for email delivery, QuickBooks for accounting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Event Operations:</strong> With event staff and volunteers as necessary to facilitate 
              event operations (e.g., meal preferences, attendance lists)</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal 
              information. However, no method of transmission over the Internet or electronic storage is 100% 
              secure. Payment card information is never stored on our servers and is processed securely through 
              PCI-compliant third-party payment processors.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              6. Data Retention
            </h2>
            <p>
              We retain your transaction information for as long as necessary to fulfill the purposes outlined 
              in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. 
              Financial transaction records are retained in accordance with applicable accounting and tax regulations.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              7. Your Rights
            </h2>
            <p style={{ marginBottom: 'var(--space-2)' }}>You have the right to:</p>
            <ul style={{ marginLeft: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information (subject to legal retention requirements)</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              8. Third-Party Services
            </h2>
            <p>
              Our System integrates with third-party services including Airtable, Resend, QuickBooks, Zeffy, 
              and TicketSpice. These services have their own privacy policies governing their use of your information.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              9. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              updating the "Last Updated" date at the top of this policy.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              10. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p style={{ marginTop: 'var(--space-2)' }}>
              <strong>Ukiah Senior Center</strong><br />
              499 Leslie Street<br />
              Ukiah, CA 95482<br />
              Phone: (707) 462-4343
            </p>
          </section>
        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
