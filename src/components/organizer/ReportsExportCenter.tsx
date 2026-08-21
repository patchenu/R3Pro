import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, Download, Printer, FileSpreadsheet, 
  Receipt, Users, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { exportRosterToCsv, exportFinancialLedgerToCsv } from '../../utils/exportCsv';
import { printVolunteerRosterHtml, printIrsTaxLetterHtml, printNameBadgesHtml, printStudentServiceLetterHtml } from '../../utils/exportPdf';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ReportsExportCenter: React.FC = () => {
  const { currentEvent, currentOrg, registrations, shifts, subParts, donations } = useApp();
  const [selectedDonationId, setSelectedDonationId] = useState<string>(donations[0]?.id || '');

  const handlePrintRoster = () => {
    printVolunteerRosterHtml(currentEvent, currentOrg, registrations, shifts, subParts);
  };

  const handleExportRosterCsv = () => {
    exportRosterToCsv(registrations, shifts, subParts, currentEvent.title);
  };

  const handleExportLedgerCsv = () => {
    exportFinancialLedgerToCsv(donations, currentEvent.title, currentOrg.ein);
  };

  const handlePrintTaxReceipt = (donationId: string) => {
    const don = donations.find(d => d.id === donationId);
    if (don) {
      printIrsTaxLetterHtml(currentEvent, currentOrg, don);
    }
  };

  const handlePrintBadges = () => {
    printNameBadgesHtml(currentEvent, currentOrg, registrations, shifts, subParts);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
          Compliance, Accounting & Export Studio
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
          Reports, Exports & IRS Substantiation
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Generate print-ready event manifests, official IRS 501(c)(3) tax deduction acknowledgement letters, attendee name badges, and accounting CSV ledgers.
        </p>
      </div>

      {/* 4 Core Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Volunteer Check-In Roster */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Volunteer Attendance Roster</h3>
            <p className="text-xs text-slate-500 mt-1">
              Formatted document featuring participant names, department leads, shift times, waiver compliance badges, and physical check-in boxes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handlePrintRoster}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Clean PDF</span>
            </button>

            <button
              onClick={handleExportRosterCsv}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Card 2: Financial Accounting Ledger */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Financial Ledger & P&L Statement</h3>
            <p className="text-xs text-slate-500 mt-1">
              Detailed double-entry financial record containing donor legal names, receipt IDs, gross amounts, processing fee coverage, and net proceeds.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExportLedgerCsv}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel / CSV Ledger ({donations.length} Transactions)</span>
            </button>
          </div>
        </div>

        {/* Card 3: Legal Compliance & E-Signature Audit Ledger */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Legal Waivers & E-Sign Audit Ledger</h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete signed agreement ledger capturing vector signatures, minor parental consent co-signatures, timestamps, and IP addresses.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (!printWindow) return;
                const allSigned = registrations.flatMap(r => r.waivers || []);
                const html = `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>Legal E-Signature Audit Ledger - ${currentEvent.title}</title>
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 32px; font-size: 11px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
                        th { background: #f8fafc; font-weight: bold; }
                      </style>
                    </head>
                    <body>
                      <h2>${currentEvent.title} — E-Signature Compliance Audit</h2>
                      <div>Organization: <b>${currentOrg.name}</b> (EIN: ${currentOrg.ein})</div>
                      <div>Total Executed Digital Signatures: <b>${allSigned.length}</b></div>
                      <table>
                        <thead>
                          <tr><th>Signer Legal Name</th><th>Signer Relationship</th><th>Waiver Title</th><th>Timestamp</th><th>IP Address</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          ${allSigned.map(w => `
                            <tr>
                              <td><b>${w.signerName}</b></td>
                              <td>${w.signerRelationship}</td>
                              <td>${w.waiverTitle}</td>
                              <td>${formatDate(w.signedAt)}</td>
                              <td><code>${w.ipAddress}</code></td>
                              <td>${w.isVerifiedAtDoor ? 'Verified Door ✓' : 'Online Signed'}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                      <script>window.onload = function() { window.print(); }</script>
                    </body>
                  </html>
                `;
                printWindow.document.write(html);
                printWindow.document.close();
              }}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Compliance Audit Ledger</span>
            </button>
          </div>
        </div>

        {/* Card 4: Official IRS 501(c)(3) Receipts */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">IRS 501(c)(3) Tax Acknowledgement</h3>
            <p className="text-xs text-slate-500 mt-1">
              Statutory written substantiation letter with Organization EIN ({currentOrg.ein}), date, gross amount, and fair-market value offset calculation.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <select
              value={selectedDonationId}
              onChange={(e) => setSelectedDonationId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 font-semibold"
            >
              {donations.map(d => (
                <option key={d.id} value={d.id}>
                  {d.taxReceiptNumber} — {d.isAnonymous ? 'Anonymous' : d.donorName} ({formatCurrency(d.amount)})
                </option>
              ))}
            </select>

            <button
              onClick={() => handlePrintTaxReceipt(selectedDonationId)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Generate Official IRS Letter</span>
            </button>
          </div>
        </div>

      </div>

      {/* CARD 5: STUDENT COMMUNITY SERVICE VERIFICATION CERTIFICATES */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
            High School & Scouting Service Hours
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">Student Service Verification Certificates</h3>
          <p className="text-xs text-blue-200 leading-relaxed">
            Generate formal, signed institutional verification letters certifying volunteer hours for high school graduation, National Honor Society, or Scouting rank advancement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <select
            id="studentCertSelect"
            className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-400"
          >
            {registrations.flatMap(r => r.members).map(m => (
              <option key={m.id} value={m.name}>
                {m.name} {m.isMinor ? '(Student / Minor)' : '(Adult Volunteer)'}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const sel = document.getElementById('studentCertSelect') as HTMLSelectElement;
              const name = sel ? sel.value : (registrations[0]?.members[0]?.name || 'Volunteer');
              printStudentServiceLetterHtml(name, 4.5, currentEvent, currentOrg);
            }}
            className="flex items-center justify-center gap-2 bg-white text-indigo-950 hover:bg-slate-100 font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md transition whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Print Verification Letter</span>
          </button>
        </div>
      </div>

      {/* DONATION & TRANSACTION LOG TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Recorded Financial Contributions & Tax Acknowledgements</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 font-bold">Receipt #</th>
                <th className="pb-3 font-bold">Contributor Name</th>
                <th className="pb-3 font-bold">Gross Amount</th>
                <th className="pb-3 font-bold">Fee Status</th>
                <th className="pb-3 font-bold">Tax Deductible</th>
                <th className="pb-3 font-bold">Payment Method</th>
                <th className="pb-3 font-bold">Date Issued</th>
                <th className="pb-3 text-right font-bold">IRS Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donations.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-mono font-bold text-indigo-600">{d.taxReceiptNumber}</td>
                  <td className="py-3 font-bold text-slate-900">
                    {d.isAnonymous ? 'Anonymous Donor' : d.donorName}
                  </td>
                  <td className="py-3 font-extrabold text-slate-900">{formatCurrency(d.amount)}</td>
                  <td className="py-3">
                    {d.feeCoveredByDonor ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">100% Net (Covered)</span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Fee deducted</span>
                    )}
                  </td>
                  <td className="py-3 font-bold text-emerald-700">{formatCurrency(d.deductibleAmount)}</td>
                  <td className="py-3 text-slate-600 uppercase text-[10px] font-semibold">{d.paymentMethod.replace('_', ' ')}</td>
                  <td className="py-3 text-slate-500">{formatDate(d.createdAt)}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handlePrintTaxReceipt(d.id)}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold text-xs transition"
                    >
                      Print Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
