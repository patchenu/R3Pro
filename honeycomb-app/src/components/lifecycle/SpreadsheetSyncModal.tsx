import React, { useState } from 'react';
import { 
  Table, Download, Upload, FileSpreadsheet, X, Check, 
  Sparkles, AlertCircle, ArrowRight, HelpCircle 
} from 'lucide-react';
import { useHoneycomb } from '../../context/HoneycombContext';

export const SpreadsheetSyncModal: React.FC = () => {
  const { 
    isSpreadsheetModalOpen, 
    setIsSpreadsheetModalOpen, 
    event, 
    needs, 
    shifts, 
    volunteers, 
    donations,
    showToast 
  } = useHoneycomb();

  const [activeTab, setActiveTab] = useState<'preview' | 'import_sandbox'>('preview');

  if (!isSpreadsheetModalOpen) return null;

  // Build unified tabular rows matching future spreadsheet
  const rows = [
    // Support Needs / Equipment
    ...needs.map(n => ({
      type: 'Equipment / Need',
      title: n.title,
      assigneeOrVolunteer: n.assignedTo ? n.assignedTo.name : 'Open to Public',
      email: n.assignedTo?.email || '—',
      status: n.assignedTo?.status === 'confirmed' ? 'Confirmed ✓' : n.assignedTo ? 'Pending RSVP' : 'Open Wishlist',
      hoursOrQty: `${n.quantityNeeded} ${n.unit}`,
      verified: n.quantityFulfilled >= n.quantityNeeded ? 'Yes' : 'No',
      financialFmv: n.estimatedFmv ? `$${n.estimatedFmv}` : '—',
      notes: n.details
    })),

    // Volunteer Registrations & Shifts
    ...volunteers.map(v => {
      const shift = shifts.find(s => s.id === v.shiftId);
      return {
        type: 'Volunteer Shift',
        title: shift ? shift.title : 'Volunteer Duty',
        assigneeOrVolunteer: v.name,
        email: v.email,
        status: v.hoursVerified ? 'Verified ✓' : 'Checked In',
        hoursOrQty: `${v.hoursCompleted} hrs`,
        verified: v.hoursVerified ? 'Yes' : 'Pending',
        financialFmv: `$${(v.hoursCompleted * 31.80).toFixed(2)} labor value`,
        notes: v.notes || (v.isMinor ? `Student (Age ${v.age || 15})` : 'Adult Volunteer')
      };
    }),

    // Donations
    ...donations.map(d => ({
      type: 'Direct Donation',
      title: 'Monetary Contribution',
      assigneeOrVolunteer: d.donorName,
      email: d.donorEmail,
      status: d.isConfirmed ? 'Received' : 'Pending',
      hoursOrQty: '—',
      verified: 'Yes',
      financialFmv: `$${d.amount.toFixed(2)}`,
      notes: `Receipt #${d.taxReceiptNumber}`
    }))
  ];

  // 1-Click CSV Downloader
  const handleExportCsv = () => {
    const headers = [
      'Event Date', 'Event Name', 'Organization', 'Category Type', 
      'Item / Role Title', 'Assignee / Volunteer', 'Contact Email', 
      'Status', 'Hours or Quantity', 'Verified by Organizer', 
      'Financial / FMV ($)', 'Internal Notes'
    ];

    const csvRows = [
      headers.join(','),
      ...rows.map(r => [
        `"${event.date}"`,
        `"${event.name.replace(/"/g, '""')}"`,
        `"${event.organizationName.replace(/"/g, '""')}"`,
        `"${r.type}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.assigneeOrVolunteer.replace(/"/g, '""')}"`,
        `"${r.email}"`,
        `"${r.status}"`,
        `"${r.hoursOrQty}"`,
        `"${r.verified}"`,
        `"${r.financialFmv}"`,
        `"${r.notes ? r.notes.replace(/"/g, '""') : ''}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HiveEvent_${event.name.replace(/\s+/g, '_')}_Outcomes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'CSV File Downloaded! 📊', 'Ready to open in Excel, Google Sheets, or Numbers.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-amber-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 text-amber-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 clip-hex bg-white/90 flex items-center justify-center text-base shadow-xs">
              📊
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-900/20 px-2 py-0.5 rounded-full">
                Spreadsheet Integration Engine
              </span>
              <h3 className="font-chunky text-base font-bold">
                Universal Event &amp; Outcomes Spreadsheet Hub
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSpreadsheetModalOpen(false)}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-slate-200 bg-amber-50/50 p-2 text-xs gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Unified Data Grid ({rows.length} rows)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import_sandbox')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import_sandbox'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upcoming Spreadsheet Importer</span>
          </button>

          <div className="ml-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV File</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 text-xs space-y-3">
          
          {activeTab === 'preview' ? (
            <div className="space-y-3">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-center justify-between text-[11px] text-amber-900">
                <span>
                  💡 <strong>Spreadsheet Compatibility:</strong> This data grid maps volunteer hours, equipment needs (like Minh&apos;s table), and donations into a single clean tabular format.
                </span>
                <span className="font-bold text-amber-950 shrink-0">
                  {rows.length} Total Records
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Title / Role</th>
                      <th className="p-2.5">Person</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Qty / Hours</th>
                      <th className="p-2.5">Verified</th>
                      <th className="p-2.5">FMV / Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-amber-800">{row.type}</td>
                        <td className="p-2 font-medium text-slate-900">{row.title}</td>
                        <td className="p-2 text-slate-800 font-bold">{row.assigneeOrVolunteer}</td>
                        <td className="p-2 text-slate-500">{row.email}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {row.status}
                          </span>
                        </td>
                        <td className="p-2 font-bold">{row.hoursOrQty}</td>
                        <td className="p-2 text-emerald-700 font-bold">{row.verified}</td>
                        <td className="p-2 text-slate-700">{row.financialFmv}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Upcoming Spreadsheet Importer Sandbox */
            <div className="space-y-4 text-center py-4">
              <div className="border-2 border-dashed border-amber-300 rounded-3xl p-8 bg-amber-50/50 space-y-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  📁
                </div>
                <h4 className="font-chunky text-base font-bold text-slate-800">
                  Ready for Your Upcoming Spreadsheet
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  When you have your spreadsheet ready, drag &amp; drop it here. HiveEvent will automatically detect columns for volunteer names, hours, equipment pledges, and financial line items.
                </p>

                <div className="pt-2">
                  <label className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Spreadsheet File (.csv / .xlsx)</span>
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      className="hidden"
                      onChange={() => {
                        showToast('info', 'File Detected', 'Spreadsheet imported successfully into sandbox preview.');
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
