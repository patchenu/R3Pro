import { Organization, Event, Registration, Donation, Shift, SubPart } from '../types';
import { formatCurrency, formatDate } from './formatters';

export function printVolunteerRosterHtml(
  event: Event,
  org: Organization,
  registrations: Registration[],
  shifts: Shift[],
  subParts: SubPart[]
): void {
  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${event.title} - Volunteer Check-In Roster</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 24px; font-size: 12px; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: bold; color: #1e1b4b; }
          .org { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta { font-size: 11px; text-align: right; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background: #f1f5f9; text-align: left; padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569; }
          td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: top; }
          .check-box { width: 18px; height: 18px; border: 2px solid #64748b; border-radius: 3px; display: inline-block; }
          .waiver-badge { font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
          .waiver-signed { background: #dcfce7; color: #166534; }
          .waiver-pending { background: #fee2e2; color: #991b1b; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${event.title}</div>
            <div class="org">${org.name} • EIN: ${org.ein} • Date: ${formatDate(event.startDate)}</div>
          </div>
          <div class="meta">
            <div>Printed on: ${new Date().toLocaleString()}</div>
            <div>Total Volunteers: ${registrations.reduce((acc, r) => acc + r.shiftClaims.length, 0)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px;">Check</th>
              <th>Volunteer Name</th>
              <th>Department / Lead</th>
              <th>Shift & Hours</th>
              <th>Contact Phone</th>
              <th>Waiver Status</th>
              <th>Emergency Contact</th>
            </tr>
          </thead>
          <tbody>
            ${registrations.flatMap(reg => 
              reg.shiftClaims.map(claim => {
                const shift = shiftMap.get(claim.shiftId);
                const subPart = shift ? subPartMap.get(shift.subPartId) : undefined;
                const member = reg.members.find(m => m.id === claim.groupMemberId) || reg.members[0];
                const waiver = reg.waivers.find(w => w.groupMemberId === (member?.id || ''));

                return `
                  <tr>
                    <td style="text-align: center;">
                      ${claim.checkedIn ? '<b>✓</b>' : '<div class="check-box"></div>'}
                    </td>
                    <td>
                      <b>${member ? member.name : reg.primaryName}</b>
                      ${member?.isMinor ? '<br><span style="color:#d97706;font-size:10px;">(Minor / Student)</span>' : ''}
                    </td>
                    <td>
                      <b>${subPart?.name || 'General'}</b><br>
                      <span style="font-size:10px;color:#64748b;">Lead: ${subPart?.leadName || 'Organizer'} (${subPart?.leadPhone || ''})</span>
                    </td>
                    <td>
                      <b>${shift?.title || 'Shift'}</b><br>
                      <span style="color:#4f46e5;">${shift ? `${shift.startTime.slice(11,16)} - ${shift.endTime.slice(11,16)}` : ''}</span>
                    </td>
                    <td>${member?.phone || reg.primaryPhone}</td>
                    <td>
                      ${waiver ? '<span class="waiver-badge waiver-signed">SIGNED</span>' : '<span class="waiver-badge waiver-pending">PENDING SIGNATURE</span>'}
                    </td>
                    <td>
                      ${member?.emergencyContactName ? `${member.emergencyContactName}<br><span style="font-size:10px;color:#64748b;">${member.emergencyContactPhone || ''}</span>` : 'On file'}
                    </td>
                  </tr>
                `;
              })
            ).join('')}
          </tbody>
        </table>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printIrsTaxLetterHtml(
  donation: Donation,
  org: Organization,
  event: Event
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>IRS 501(c)(3) Tax Receipt - ${donation.taxReceiptNumber}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; color: #0f172a; padding: 48px; font-size: 14px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
          .org-name { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .org-details { font-size: 12px; color: #475569; margin-top: 4px; }
          .receipt-title { font-size: 16px; font-weight: bold; margin-top: 24px; text-align: center; text-decoration: underline; }
          .meta-box { margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
          .table th { background: #f1f5f9; font-weight: bold; }
          .affirmation { font-style: italic; margin: 24px 0; padding: 12px; border-left: 3px solid #0f172a; }
          .signature-section { margin-top: 48px; display: flex; justify-content: space-between; }
          .sig-line { border-top: 1px solid #0f172a; width: 250px; text-align: center; padding-top: 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="org-name">${org.name}</div>
          <div class="org-details">${org.address} • Phone: ${org.phone} • Email: ${org.contactEmail}</div>
          <div class="org-details"><b>IRS Employer Identification Number (EIN):</b> ${org.ein}</div>
        </div>

        <div class="receipt-title">OFFICIAL CHARITABLE CONTRIBUTION RECEIPT & ACKNOWLEDGEMENT</div>

        <div class="meta-box">
          <div class="meta-grid">
            <div>
              <b>Receipt Number:</b> ${donation.taxReceiptNumber}<br>
              <b>Contribution Date:</b> ${formatDate(donation.createdAt)}<br>
              <b>Payment Method:</b> ${donation.paymentMethod.replace('_', ' ').toUpperCase()}
            </div>
            <div>
              <b>Donor / Contributor Name:</b><br>
              ${donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}<br>
              ${donation.donorEmail}
            </div>
          </div>
        </div>

        <p>Dear ${donation.isAnonymous ? 'Community Supporter' : donation.donorName},</p>
        <p>On behalf of <b>${org.name}</b> and the planning committee for <b>${event.title}</b>, thank you for your generous financial contribution to our organization. Your support makes a direct and meaningful impact in our community.</p>

        <table class="table">
          <thead>
            <tr>
              <th>Description / Purpose</th>
              <th>Gross Amount</th>
              <th>Fair Market Value of Goods Received</th>
              <th>Eligible Tax-Deductible Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Charitable Contribution to ${event.title}</td>
              <td>${formatCurrency(donation.amount)}</td>
              <td>${formatCurrency(donation.amount - donation.deductibleAmount)}</td>
              <td><b>${formatCurrency(donation.deductibleAmount)}</b></td>
            </tr>
          </tbody>
        </table>

        <div class="affirmation">
          <b>Mandatory IRS Written Substantiation Statement (IRC § 170(f)(8)):</b><br>
          ${org.name} is an organization exempt from federal income tax under Internal Revenue Code Section 501(c)(3). No goods or services were provided in exchange for this contribution other than those explicitly specified above. Please retain this official receipt for your federal income tax filing records.
        </div>

        <div class="signature-section">
          <div>
            Date of Issuance: ${new Date().toLocaleDateString()}
          </div>
          <div class="sig-line">
            <b>Elena Rostova</b><br>
            Authorized Treasurer / Executive<br>
            ${org.name}
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printNameBadgesHtml(
  event: Event,
  org: Organization,
  registrations: Registration[],
  shifts: Shift[],
  subParts: SubPart[]
): void {
  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${event.title} - Volunteer Name Badges</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; }
          .badge-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .badge { border: 2px dashed #94a3b8; border-radius: 8px; padding: 16px; min-height: 220px; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; background: #fff; }
          .badge-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
          .org-badge { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
          .evt-badge { font-size: 11px; font-weight: bold; color: #4f46e5; }
          .name { font-size: 22px; font-weight: 800; color: #0f172a; margin: 12px 0 4px 0; }
          .role { font-size: 13px; font-weight: 600; color: #059669; }
          .time { font-size: 11px; color: #64748b; margin-top: 4px; }
          .badge-bottom { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 12px; }
          .qr-placeholder { width: 48px; height: 48px; background: #f1f5f9; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #64748b; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="badge-grid">
          ${registrations.flatMap(reg =>
            reg.shiftClaims.map(claim => {
              const shift = shiftMap.get(claim.shiftId);
              const subPart = shift ? subPartMap.get(shift.subPartId) : undefined;
              const member = reg.members.find(m => m.id === claim.groupMemberId) || reg.members[0];

              return `
                <div class="badge">
                  <div class="badge-top">
                    <div>
                      <div class="org-badge">${org.name}</div>
                      <div class="evt-badge">${event.title}</div>
                    </div>
                    <div style="font-size:10px;background:#eef2ff;color:#4f46e5;padding:2px 8px;border-radius:12px;font-weight:bold;">VOLUNTEER</div>
                  </div>

                  <div>
                    <div class="name">${member ? member.name : reg.primaryName}</div>
                    <div class="role">${subPart?.name || 'General Team'} • ${shift?.title || 'Volunteer'}</div>
                    <div class="time">Shift: ${shift ? `${shift.startTime.slice(11,16)} - ${shift.endTime.slice(11,16)}` : 'Full Day'}</div>
                  </div>

                  <div class="badge-bottom">
                    <div style="font-size:10px;color:#64748b;">
                      Reporting: <b>${subPart?.reportingGate || 'Main Desk'}</b><br>
                      Lead: ${subPart?.leadName || 'Coordinator'}
                    </div>
                    <div class="qr-placeholder">QR PASS</div>
                  </div>
                </div>
              `;
            })
          ).join('')}
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printStudentServiceLetterHtml(
  volunteerName: string,
  hours: number,
  event: Event,
  org: Organization
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student Community Service Verification - ${volunteerName}</title>
        <style>
          body { font-family: 'Times New Roman', serif; color: #0f172a; padding: 48px; font-size: 14px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .org-title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .cert-title { font-size: 18px; font-weight: bold; color: #4338ca; margin-top: 10px; text-transform: uppercase; }
          .body-text { font-size: 15px; margin: 25px 0; text-align: justify; }
          .highlight { font-weight: bold; text-decoration: underline; }
          .details-box { border: 1px solid #94a3b8; background: #f8fafc; padding: 18px; margin: 25px 0; border-radius: 8px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; }
          .sig-row { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 10px; font-family: 'Helvetica Neue', Arial, sans-serif; }
          .sig-line { border-top: 1px solid #0f172a; width: 220px; text-align: center; padding-top: 6px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="org-title">${org.name}</div>
          <div style="font-size:12px; color:#475569; margin-top:4px;">Tax ID (EIN): ${org.ein} • ${org.address}</div>
          <div class="cert-title">Official Verification of Student Community Service</div>
        </div>

        <div style="font-size:13px; color:#475569; margin-bottom: 20px;">
          Date of Issue: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <p class="body-text">
          To Whom It May Concern (School Administration / National Honor Society / Scouting Review Board):
        </p>

        <p class="body-text">
          This official letter certifies that <strong>${volunteerName}</strong> has actively participated as an authorized volunteer for <strong>${org.name}</strong>, a verified community entity.
        </p>

        <div class="details-box">
          <div style="margin-bottom: 8px;"><strong>Event / Campaign:</strong> ${event.title}</div>
          <div style="margin-bottom: 8px;"><strong>Service Date(s):</strong> ${formatDate(event.startDate)}</div>
          <div style="margin-bottom: 8px;"><strong>Total Verified Service Hours:</strong> <span style="font-size:16px; color:#4338ca; font-weight:bold;">${hours} Hours</span></div>
          <div><strong>Event Venue / Location:</strong> ${event.venueName} (${event.venueAddress})</div>
        </div>

        <p class="body-text">
          During their service commitment, ${volunteerName} completed all assigned duties in good standing and adhered to all organizational conduct guidelines.
        </p>

        <div class="sig-row">
          <div>
            <div class="sig-line">Authorized Event Coordinator</div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">${org.name} Leadership</div>
          </div>
          <div>
            <div class="sig-line">Official Seal & Verification Date</div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">R3Pro Verified Record #SRV-${Date.now().toString().slice(-6)}</div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
