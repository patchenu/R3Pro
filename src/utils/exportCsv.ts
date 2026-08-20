import { Registration, Donation, Shift, SubPart } from '../types';

export function exportRosterToCsv(
  registrations: Registration[],
  shifts: Shift[],
  subParts: SubPart[],
  eventTitle: string
): void {
  const headers = [
    'Registration ID',
    'Primary Contact Name',
    'Primary Contact Email',
    'Primary Contact Phone',
    'Participant / Member Name',
    'Relationship',
    'Minor Status',
    'Department / Sub-Part',
    'Shift Title',
    'Shift Time',
    'Checked In',
    'Checked In At',
    'Checked In By',
    'Waiver Signed',
    'Emergency Contact Name',
    'Emergency Contact Phone'
  ];

  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));

  const rows: string[][] = [];

  registrations.forEach(reg => {
    reg.shiftClaims.forEach(claim => {
      const shift = shiftMap.get(claim.shiftId);
      const subPart = shift ? subPartMap.get(shift.subPartId) : undefined;
      const member = reg.members.find(m => m.id === claim.groupMemberId) || reg.members[0];
      const waiver = reg.waivers.find(w => w.groupMemberId === (member?.id || ''));

      rows.push([
        reg.id,
        reg.primaryName,
        reg.primaryEmail,
        reg.primaryPhone,
        member ? member.name : reg.primaryName,
        member ? member.relationship : 'Self',
        member?.isMinor ? 'Yes (Minor)' : 'No (Adult)',
        subPart ? subPart.name : 'General',
        shift ? shift.title : 'Unassigned',
        shift ? `${shift.startTime.slice(11, 16)} - ${shift.endTime.slice(11, 16)}` : '',
        claim.checkedIn ? 'YES' : 'NO',
        claim.checkedInAt || '',
        claim.checkedInBy || '',
        waiver ? 'YES (Signed)' : 'NO (Pending)',
        member?.emergencyContactName || '',
        member?.emergencyContactPhone || ''
      ]);
    });
  });

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  downloadCsv(csvContent, `${eventTitle.replace(/\s+/g, '_')}_Volunteer_Roster.csv`);
}

export function exportFinancialLedgerToCsv(
  donations: Donation[],
  eventTitle: string,
  ein: string
): void {
  const headers = [
    'Receipt Number',
    'Transaction Date',
    'Payer / Donor Name',
    'Payer Email',
    'Gross Amount ($)',
    'Processing Fee ($)',
    'Fee Covered By Donor',
    'Net Organization Proceeds ($)',
    'Tax Deductible Amount ($)',
    'Payment Method',
    'Status',
    'Org EIN'
  ];

  const rows = donations.map(d => [
    d.taxReceiptNumber,
    d.createdAt.slice(0, 10),
    d.isAnonymous ? 'Anonymous Donor' : d.donorName,
    d.donorEmail,
    d.amount.toFixed(2),
    d.feeAmount.toFixed(2),
    d.feeCoveredByDonor ? 'YES' : 'NO',
    d.netAmount.toFixed(2),
    d.deductibleAmount.toFixed(2),
    d.paymentMethod.replace('_', ' ').toUpperCase(),
    d.paymentStatus.toUpperCase(),
    ein
  ]);

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  downloadCsv(csvContent, `${eventTitle.replace(/\s+/g, '_')}_Financial_Ledger.csv`);
}

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
