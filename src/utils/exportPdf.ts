import { Organization, Event, Registration, Donation, Shift, SubPart, ItemSlot } from '../types';
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
          .header { border-bottom: 2px solid ${org.primaryColor || '#4f46e5'}; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .logo { max-height: 48px; max-width: 140px; object-fit: contain; margin-right: 12px; }
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
          <div style="display:flex;align-items:center;">
            ${org.logoUrl ? `<img src="${org.logoUrl}" class="logo" alt="${org.name}" />` : ''}
            <div>
              <div class="title">${event.title}</div>
              <div class="org">${org.name} • EIN: ${org.ein} • Date: ${formatDate(event.startDate)}</div>
            </div>
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
  event: Event,
  org: Organization,
  donation: Donation
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const officerName = org.signatoryOfficerName || 'Elena Rostova';
  const officerTitle = org.signatoryOfficerTitle || 'President / Executive Director';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>IRS 501(c)(3) Tax Receipt - ${donation.taxReceiptNumber}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; color: #0f172a; padding: 48px; font-size: 14px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
          .logo { max-height: 55px; max-width: 180px; object-fit: contain; margin-bottom: 8px; }
          .org-name { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .org-details { font-size: 12px; color: #475569; margin-top: 4px; }
          .receipt-title { font-size: 16px; font-weight: bold; margin-top: 24px; text-align: center; text-decoration: underline; }
          .meta-box { margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
          .table th { background: #f1f5f9; font-weight: bold; }
          .affirmation { font-style: italic; margin: 24px 0; padding: 12px; border-left: 3px solid #0f172a; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
          .sig-line { border-top: 1px solid #0f172a; width: 260px; text-align: center; padding-top: 8px; font-size: 12px; }
          .sig-img { max-height: 40px; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${org.logoUrl ? `<div><img src="${org.logoUrl}" class="logo" alt="${org.name}" /></div>` : ''}
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
            ${org.signatorySignatureUrl ? `<img src="${org.signatorySignatureUrl}" class="sig-img" alt="Signature" /><br>` : ''}
            <b>${officerName}</b><br>
            ${officerTitle}<br>
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

export function printInKindTaxLetterHtml(
  event: Event,
  org: Organization,
  donorName: string,
  donorEmail: string,
  donorPhone: string,
  itemName: string,
  quantity: number,
  unit: string,
  deliveredAt: string,
  estimatedFmv: number,
  receiptNumber: string,
  notes?: string
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const officerName = org.signatoryOfficerName || 'Elena Rostova';
  const officerTitle = org.signatoryOfficerTitle || 'President / Executive Director';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>IRS In-Kind Donation Receipt - ${receiptNumber}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; color: #0f172a; padding: 48px; font-size: 14px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
          .logo { max-height: 55px; max-width: 180px; object-fit: contain; margin-bottom: 8px; }
          .org-name { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .org-details { font-size: 12px; color: #475569; margin-top: 4px; }
          .receipt-title { font-size: 16px; font-weight: bold; margin-top: 24px; text-align: center; text-decoration: underline; }
          .meta-box { margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
          .table th { background: #f1f5f9; font-weight: bold; }
          .affirmation { font-style: italic; margin: 24px 0; padding: 12px; border-left: 3px solid #0f172a; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
          .sig-line { border-top: 1px solid #0f172a; width: 260px; text-align: center; padding-top: 8px; font-size: 12px; }
          .sig-img { max-height: 40px; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${org.logoUrl ? `<div><img src="${org.logoUrl}" class="logo" alt="${org.name}" /></div>` : ''}
          <div class="org-name">${org.name}</div>
          <div class="org-details">${org.address} • Phone: ${org.phone} • Email: ${org.contactEmail}</div>
          <div class="org-details"><b>IRS Employer Identification Number (EIN):</b> ${org.ein}</div>
        </div>

        <div class="receipt-title">OFFICIAL IN-KIND PROPERTY / GOODS CONTRIBUTION ACKNOWLEDGEMENT</div>

        <div class="meta-box">
          <div class="meta-grid">
            <div>
              <b>Receipt Number:</b> ${receiptNumber}<br>
              <b>Date Received:</b> ${formatDate(deliveredAt)}<br>
              <b>Designated Event:</b> ${event.title}
            </div>
            <div>
              <b>Donor / Contributor Name:</b><br>
              ${donorName}<br>
              ${donorEmail} • ${donorPhone}
            </div>
          </div>
        </div>

        <p>Dear ${donorName},</p>
        <p>On behalf of <b>${org.name}</b> and the event coordination committee, we gratefully acknowledge receipt of your in-kind donation of physical items/supplies for <b>${event.title}</b>.</p>

        <table class="table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Quantity & Unit</th>
              <th>Condition / Receiving Notes</th>
              <th>Donor's Stated Fair Market Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>${itemName}</b></td>
              <td>${quantity} ${unit}</td>
              <td>${notes || 'Received in new / excellent condition at designated drop-off station'}</td>
              <td><b>${estimatedFmv > 0 ? formatCurrency(estimatedFmv) : 'Declared by Donor'}</b></td>
            </tr>
          </tbody>
        </table>

        <div class="affirmation">
          <b>Mandatory IRS Written Substantiation & In-Kind Valuation Notice:</b><br>
          ${org.name} is a tax-exempt 501(c)(3) organization. No goods or services were provided in exchange for this contribution other than intangible religious or charitable benefits. In accordance with federal IRS regulations (IRS Publication 526 / 561), it is the donor's sole legal responsibility to determine and declare the Fair Market Value (FMV) of non-cash physical property contributions on IRS Form 8283.
        </div>

        <div class="signature-section">
          <div>
            Date of Issuance: ${new Date().toLocaleDateString()}
          </div>
          <div class="sig-line">
            ${org.signatorySignatureUrl ? `<img src="${org.signatorySignatureUrl}" class="sig-img" alt="Signature" /><br>` : ''}
            <b>${officerName}</b><br>
            ${officerTitle}<br>
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

export function printItemReceivingManifestHtml(
  event: Event,
  org: Organization,
  registrations: Registration[],
  itemSlots: ItemSlot[],
  subParts: SubPart[]
): void {
  const itemMap = new Map(itemSlots.map(i => [i.id, i]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${event.title} - Item Pledges & Drop-Off Manifest</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 24px; font-size: 12px; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .logo { max-height: 48px; max-width: 140px; object-fit: contain; margin-right: 12px; }
          .title { font-size: 20px; font-weight: bold; color: #1e1b4b; }
          .org { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta { font-size: 11px; text-align: right; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background: #f1f5f9; text-align: left; padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569; }
          td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: top; }
          .check-box { width: 18px; height: 18px; border: 2px solid #64748b; border-radius: 3px; display: inline-block; }
          .status-badge { font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
          .status-received { background: #dcfce7; color: #166534; }
          .status-pending { background: #fee2e2; color: #991b1b; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display:flex;align-items:center;">
            ${org.logoUrl ? `<img src="${org.logoUrl}" class="logo" alt="${org.name}" />` : ''}
            <div>
              <div class="title">${event.title} - Item Pledges & Drop-Off Manifest</div>
              <div class="org">${org.name} • Event Date: ${formatDate(event.startDate)}</div>
            </div>
          </div>
          <div class="meta">
            <div>Printed on: ${new Date().toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px;">Check</th>
              <th>Item Description</th>
              <th>Qty & Unit</th>
              <th>Donor Name & Contact</th>
              <th>Designated Drop-Off Gate</th>
              <th>Status / Date Received</th>
              <th>Notes / Value</th>
            </tr>
          </thead>
          <tbody>
            ${registrations.flatMap(reg => 
              reg.itemPledges.map(pledge => {
                const item = itemMap.get(pledge.itemSlotId);
                const subPart = item ? subPartMap.get(item.subPartId) : undefined;

                return `
                  <tr>
                    <td style="text-align: center;">
                      ${pledge.delivered ? '<b>✓</b>' : '<div class="check-box"></div>'}
                    </td>
                    <td>
                      <b>${item?.itemName || 'Item'}</b><br>
                      <span style="font-size:10px;color:#64748b;">Dept: ${subPart?.name || 'General'}</span>
                    </td>
                    <td><b>${pledge.quantity}</b> ${item?.unit || 'units'}</td>
                    <td>
                      <b>${reg.primaryName}</b><br>
                      <span style="font-size:10px;color:#64748b;">${reg.primaryPhone} • ${reg.primaryEmail}</span>
                    </td>
                    <td>${item?.dropOffLocation || 'Cafeteria Drop-off'}</td>
                    <td>
                      ${pledge.delivered ? `<span class="status-badge status-received">RECEIVED</span><br><span style="font-size:10px;color:#166534;">${pledge.deliveredAt ? formatDate(pledge.deliveredAt) : 'Yes'}</span>` : '<span class="status-badge status-pending">AWAITING DROP-OFF</span>'}
                    </td>
                    <td>
                      ${pledge.donorNotes ? `<em>${pledge.donorNotes}</em><br>` : ''}
                      ${pledge.estimatedFmv ? `FMV: $${pledge.estimatedFmv}` : ''}
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
        <title>${event.title} - Volunteer Name Badges & Lanyards</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; padding: 16px; margin: 0; background: #f8fafc; }
          .badge-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .badge { background: white; border: 2px dashed #94a3b8; border-radius: 16px; padding: 20px; box-sizing: border-box; page-break-inside: avoid; display: flex; flex-direction: column; justify-content: space-between; height: 320px; }
          .badge-header { border-bottom: 2px solid ${org.primaryColor || '#4f46e5'}; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
          .badge-logo { max-height: 28px; max-width: 90px; object-fit: contain; }
          .badge-org { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; }
          .badge-event { font-size: 12px; font-weight: bold; color: ${org.primaryColor || '#4f46e5'}; }
          .badge-name { font-size: 24px; font-weight: 900; color: #0f172a; margin: 12px 0 4px 0; text-align: center; }
          .badge-role { font-size: 13px; font-weight: 700; color: #475569; text-align: center; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; }
          .badge-details { font-size: 11px; color: #334155; margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          .badge-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
          .qr-placeholder { width: 44px; height: 44px; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; border-radius: 6px; }
          @media print {
            body { background: white; padding: 0; }
            .badge { border: 1px dashed #cbd5e1; }
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
                  <div>
                    <div class="badge-header">
                      <div>
                        <div class="badge-org">${org.name}</div>
                        <div class="badge-event">${event.title}</div>
                      </div>
                      ${org.logoUrl ? `<img src="${org.logoUrl}" class="badge-logo" alt="${org.name}" />` : ''}
                    </div>

                    <div class="badge-name">${member ? member.name : reg.primaryName}</div>
                    <div class="badge-role">${subPart?.name || 'Volunteer Crew'} • ${shift?.title || 'General Shift'}</div>
                  </div>

                  <div>
                    <div class="badge-details">
                      <div><b>Shift Window:</b> ${shift ? `${shift.startTime.slice(11,16)} - ${shift.endTime.slice(11,16)}` : 'Full Day'}</div>
                      <div><b>Reporting Gate:</b> ${subPart?.reportingGate || 'Main Gate'} (Lead: ${subPart?.leadName || 'Organizer'})</div>
                      <div><b>Emergency Contact:</b> ${member?.emergencyContactName || 'On File'} (${member?.emergencyContactPhone || reg.primaryPhone})</div>
                    </div>

                    <div class="badge-footer">
                      <div style="font-size: 9px; color: #94a3b8;">
                        R3Pro Express Access Pass<br>
                        Token: ${reg.manageToken.slice(0, 10)}...
                      </div>
                      <div class="qr-placeholder">QR PASS</div>
                    </div>
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
  studentName: string,
  hours: number,
  event: Event,
  org: Organization
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const officerName = org.signatoryOfficerName || 'Elena Rostova';
  const officerTitle = org.signatoryOfficerTitle || 'Authorized Coordinator / Executive';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student Community Service Certificate - ${studentName}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; color: #0f172a; padding: 48px; font-size: 14px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
          .logo { max-height: 55px; max-width: 180px; object-fit: contain; margin-bottom: 8px; }
          .org-name { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .cert-title { font-size: 18px; font-weight: bold; margin-top: 24px; text-align: center; letter-spacing: 1px; }
          .student-box { text-align: center; margin: 32px 0; padding: 20px; border: 2px double #0f172a; background: #f8fafc; }
          .student-name { font-size: 26px; font-weight: bold; text-decoration: underline; margin-bottom: 8px; }
          .hours-badge { font-size: 20px; font-weight: bold; color: #4f46e5; }
          .signature-section { margin-top: 64px; display: flex; justify-content: space-between; align-items: flex-end; }
          .sig-line { border-top: 1px solid #0f172a; width: 260px; text-align: center; padding-top: 8px; font-size: 12px; }
          .sig-img { max-height: 40px; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${org.logoUrl ? `<div><img src="${org.logoUrl}" class="logo" alt="${org.name}" /></div>` : ''}
          <div class="org-name">${org.name}</div>
          <div style="font-size: 12px; color: #475569;">EIN: ${org.ein} • ${org.address} • ${org.phone}</div>
        </div>

        <div class="cert-title">OFFICIAL CERTIFICATE OF COMMUNITY SERVICE HOURS</div>

        <div class="student-box">
          <div style="font-size: 14px; color: #475569; margin-bottom: 6px;">This document certifies that</div>
          <div class="student-name">${studentName}</div>
          <div style="font-size: 14px; color: #475569;">has successfully contributed and verified</div>
          <div class="hours-badge">${hours.toFixed(1)} Verified Volunteer Service Hours</div>
        </div>

        <p>This service was completed in support of <b>${event.title}</b> held on <b>${formatDate(event.startDate)}</b> at <b>${event.venueName}</b>.</p>
        <p>The student conducted volunteer duties in full compliance with organizational safety guidelines, punctuality standards, and community service requirements for High School Graduation, National Honor Society (NHS), Key Club, or Scouting rank advancement.</p>

        <div class="signature-section">
          <div>
            <b>Date Verified:</b> ${new Date().toLocaleDateString()}<br>
            <b>Venue:</b> ${event.venueName}
          </div>
          <div class="sig-line">
            ${org.signatorySignatureUrl ? `<img src="${org.signatorySignatureUrl}" class="sig-img" alt="Signature" /><br>` : ''}
            <b>${officerName}</b><br>
            ${officerTitle}<br>
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
