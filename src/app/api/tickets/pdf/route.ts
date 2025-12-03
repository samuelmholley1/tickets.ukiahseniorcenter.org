import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      christmasMember = 0,
      christmasNonMember = 0,
      nyeMember = 0,
      nyeNonMember = 0,
    } = body;

    // Build the ticket print HTML
    const customerName = `${firstName} ${lastName}`;
    const tickets: Array<{
      eventName: string;
      isNYE: boolean;
      ticketNumber: number;
      totalTickets: number;
    }> = [];

    // Generate Christmas tickets
    const totalChristmas = christmasMember + christmasNonMember;
    for (let i = 0; i < totalChristmas; i++) {
      tickets.push({
        eventName: 'Christmas Prime Rib Meal',
        isNYE: false,
        ticketNumber: i + 1,
        totalTickets: totalChristmas,
      });
    }

    // Generate NYE tickets
    const totalNYE = nyeMember + nyeNonMember;
    for (let i = 0; i < totalNYE; i++) {
      tickets.push({
        eventName: 'New Year\'s Eve Gala Dance',
        isNYE: true,
        ticketNumber: i + 1,
        totalTickets: totalNYE,
      });
    }

    // Generate HTML
    const ticketsHTML = tickets.map((ticket) => {
      const borderColor = ticket.isNYE ? '#7c3aed' : '#427d78';
      const accentColor = ticket.isNYE ? '#7c3aed' : '#427d78';
      const bgGradient = ticket.isNYE
        ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';

      return `
        <div style="
          width: 3.5in;
          height: 2in;
          position: relative;
          overflow: hidden;
          padding: 16px;
          font-size: 9px;
          background: ${bgGradient};
          border: 3px solid ${borderColor};
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        ">
          <!-- Header -->
          <div style="display: flex; align-items: flex-start; gap: 10px; border-bottom: 2px solid ${borderColor}; padding-bottom: 6px;">
            <img
              src="https://tickets.ukiahseniorcenter.org/logo.png"
              alt="USC"
              style="width: 45px; height: 45px; flex-shrink: 0;"
            />
            <div style="flex: 1; text-align: left;">
              <h3 style="font-family: Jost, sans-serif; font-weight: bold; color: ${accentColor}; font-size: 12px; margin: 0 0 3px 0; line-height: 1.1;">
                ${ticket.isNYE ? 'New Year\'s Eve Gala Dance' : 'Christmas Prime Rib Meal'}
              </h3>
              <div style="font-family: Bitter, serif; color: #1f2937; font-size: 8px; line-height: 1.3; font-weight: 600;">
                <div style="margin-bottom: 2px;">${ticket.isNYE ? 'Wednesday, Dec 31, 2025' : 'Tuesday, Dec 23, 2025'}</div>
                ${ticket.isNYE ? `
                  <div style="margin-bottom: 1px;">Doors: 6:00 PM • Dance: 7:00-10:00 PM</div>
                  <div style="font-size: 7px; color: #dc2626; font-weight: bold;">Ball Drop: 9:00 PM (NY Time!)</div>
                ` : `
                  <div style="margin-bottom: 1px; color: #dc2626; font-weight: bold;">PICKUP: 12:00-12:30 PM</div>
                  <div style="font-size: 7px;">Drive-Thru Only • Stay in Vehicle</div>
                `}
              </div>
            </div>
          </div>

          <!-- Event Details -->
          <div style="flex: 1; padding-top: 6px; padding-bottom: 4px; font-size: 7.5px; font-family: Bitter, serif; line-height: 1.4;">
            ${ticket.isNYE ? `
              <div style="margin-bottom: 3px;">
                <strong style="color: ${accentColor};">INCLUDES:</strong> Appetizers, Hors d'oeuvres & Dessert
              </div>
              <div style="margin-bottom: 3px;">
                <strong style="color: ${accentColor};">MUSIC:</strong> Beatz Werkin Band
              </div>
              <div style="margin-bottom: 3px;">
                <strong style="color: ${accentColor};">ATTIRE:</strong> Flashy Attire!
              </div>
            ` : `
              <div style="margin-bottom: 3px;">
                <strong style="color: ${accentColor};">MENU:</strong> Prime Rib w/ Horseradish, Garlic Mashed Potatoes, Vegetable, Caesar Salad, Garlic Bread, Cheesecake
              </div>
              <div style="margin-bottom: 2px; color: #dc2626; font-weight: bold; font-size: 8px;">
                ⚠️ Arrive within 12:00-12:30 PM window
              </div>
            `}
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid ${borderColor};">
              <strong style="color: ${accentColor};">Guest:</strong> ${customerName} <strong>#${ticket.ticketNumber}</strong>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; border-top: 2px solid ${borderColor}; padding-top: 4px;">
            <p style="font-family: Bitter, serif; color: #6b7280; font-size: 8px; line-height: 1.2; font-weight: 600; margin: 0;">
              Bartlett Event Center • 495 Leslie St, Ukiah, CA 95482 • (707) 462-4343
            </p>
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            @page {
              size: letter portrait;
              margin: 0.5in;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 3.5in);
              grid-template-rows: repeat(5, 2in);
              gap: 0.25in;
              padding: 0;
              max-width: 8.5in;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${ticketsHTML}
          </div>
        </body>
      </html>
    `;

    // Launch headless browser and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="tickets.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
