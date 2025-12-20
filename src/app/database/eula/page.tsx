import { SiteNavigation } from '@/components/SiteNavigation';
import { SiteFooterContent } from '@/components/SiteFooterContent';

export const metadata = {
  title: 'Terms of Service - Ukiah Senior Center',
  description: 'End-User License Agreement for Ukiah Senior Center Database and Ticketing System',
};

export default function TermsPage() {
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
          End-User License Agreement
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
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the Ukiah Senior Center ticketing and database system (&quot;System&quot;) at 
              tickets.ukiahseniorcenter.org and admin.ukiahseniorcenter.org, you agree to be bound by these 
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the System.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              2. Description of Service
            </h2>
            <p>
              The System provides online ticket purchasing, donation processing, and administrative database 
              management for Ukiah Senior Center events. The System integrates with third-party services for 
              data storage, email delivery, payment processing, and accounting.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              3. User Responsibilities
            </h2>
            <p style={{ marginBottom: 'var(--space-2)' }}>When using the System, you agree to:</p>
            <ul style={{ marginLeft: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <li>Provide accurate, current, and complete information</li>
              <li>Use the System only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to any part of the System</li>
              <li>Not interfere with or disrupt the System's operation</li>
              <li>Not use automated systems (bots, scrapers) without express written permission</li>
              <li>Safeguard any administrative access credentials if provided</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              4. Ticket Purchases and Donations
            </h2>
            <p style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Tickets:</strong> All ticket sales are final. Tickets are non-refundable and non-transferable 
              except at the sole discretion of Ukiah Senior Center.
            </p>
            <p style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Pricing:</strong> We reserve the right to change ticket prices at any time. Prices shown 
              at the time of purchase will be honored for that transaction.
            </p>
            <p style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Donations:</strong> All donations are voluntary and non-refundable. Donation receipts 
              will be provided for tax purposes as applicable.
            </p>
            <p>
              <strong>Payment Processing:</strong> Payments are processed through secure third-party providers. 
              We do not store credit card information on our servers.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              5. Event Policies
            </h2>
            <ul style={{ marginLeft: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <li>Events may be cancelled or rescheduled due to circumstances beyond our control</li>
              <li>In the event of cancellation, ticket holders will be notified via email</li>
              <li>Refunds for cancelled events will be processed at our discretion</li>
              <li>Attendees must comply with all venue rules and event policies</li>
              <li>We reserve the right to refuse entry or remove individuals who violate policies</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              6. Data and Privacy
            </h2>
            <p>
              Your use of the System is governed by our Privacy Policy, which is incorporated into these 
              Terms by reference. Please review our <a href="/database/privacy-policy" style={{ 
                color: '#427d78', 
                textDecoration: 'underline' 
              }}>Privacy Policy</a> to understand our data practices.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              7. Intellectual Property
            </h2>
            <p>
              All content on the System, including text, graphics, logos, and software, is the property of 
              Ukiah Senior Center or its licensors and is protected by copyright and other intellectual 
              property laws. You may not reproduce, distribute, or create derivative works without express 
              written permission.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              8. Disclaimer of Warranties
            </h2>
            <p>
              THE SYSTEM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER 
              EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SYSTEM WILL BE UNINTERRUPTED, ERROR-FREE, 
              OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              9. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, UKIAH SENIOR CENTER SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED 
              TO YOUR USE OF THE SYSTEM. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR 
              TICKETS OR DONATIONS THROUGH THE SYSTEM.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              10. Third-Party Services
            </h2>
            <p>
              The System integrates with third-party services including Airtable, Resend, QuickBooks, 
              Zeffy, and TicketSpice. Your use of these services is subject to their respective terms 
              and conditions. We are not responsible for the actions or policies of third-party services.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              11. Modifications to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately 
              upon posting to the System. Your continued use of the System after changes are posted 
              constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              12. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your access to the System at any time, with or 
              without cause, and with or without notice.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              13. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of 
              California, without regard to its conflict of law provisions. Any disputes arising from these 
              Terms shall be resolved in the courts of Mendocino County, California.
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              14. Contact Information
            </h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <p style={{ marginTop: 'var(--space-2)' }}>
              <strong>Ukiah Senior Center</strong><br />
              499 Leslie Street<br />
              Ukiah, CA 95482<br />
              Phone: (707) 462-4343
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="font-['Jost',sans-serif] font-bold text-[#427d78]" style={{ 
              fontSize: '1.5rem', 
              marginBottom: 'var(--space-3)' 
            }}>
              15. Entire Agreement
            </h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you 
              and Ukiah Senior Center regarding the use of the System.
            </p>
          </section>
        </div>
      </div>

      <SiteFooterContent />
    </>
  );
}
