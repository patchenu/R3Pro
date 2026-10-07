import React, { useState } from 'react';
import { 
  Award, CheckCircle2, Clock, DollarSign, Download, FileText, 
  Heart, Printer, Share2, Sparkles, UserCheck, ShieldCheck, 
  HelpCircle, ChevronRight, Table, AlertCircle 
} from 'lucide-react';
import { useHoneycomb } from '../../context/HoneycombContext';
import { VolunteerRegistration, DirectDonation } from '../../types';

export const Step3OutcomesStudio: React.FC = () => {
  const { 
    event, 
    volunteers, 
    donations, 
    needs, 
    verifyVolunteerHours, 
    verifyAllPendingHours, 
    verifyComplianceProof,
    recordDirectDonation,
    setIsSpreadsheetModalOpen,
    triggerCelebrationConfetti,
    showToast 
  } = useHoneycomb();

  const [activeTab, setActiveTab] = useState<'hours' | 'donations' | 'irs_letters' | 'certificates'>('hours');
  
  // Selected items for modal previews
  const [selectedCertVolunteer, setSelectedCertVolunteer] = useState<VolunteerRegistration | null>(null);
  const [selectedTaxDonor, setSelectedTaxDonor] = useState<DirectDonation | null>(null);

  // Quick Offline Donation Form
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorAmount, setDonorAmount] = useState(100);

  // Compute stats
  const totalHoursLogged = volunteers.reduce((acc, v) => acc + v.hoursCompleted, 0);
  const verifiedHours = volunteers.filter(v => v.hoursVerified).reduce((acc, v) => acc + v.hoursCompleted, 0);
  const totalFunds = event.goals.fundsRaised;
  const fundsPercent = Math.min(100, Math.round((totalFunds / (event.goals.fundraisingTarget || 1)) * 100));
  const equipmentDone = needs.filter(n => n.quantityFulfilled >= n.quantityNeeded).length;

  const handleRecordDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || donorAmount <= 0) return;

    recordDirectDonation({
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim() || 'supporter@gmail.com',
      amount: donorAmount
    });

    setDonorName('');
    setDonorEmail('');
    setShowAddDonation(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      
      {/* Community Goals Scorecard Hero */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-3xl p-5 sm:p-6 text-amber-950 shadow-honey">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-900/20 px-2.5 py-1 rounded-full">
              Step 3: Central Outcomes Hub
            </span>
            <h2 className="font-chunky text-xl sm:text-2xl font-bold mt-1">
              Event Outcomes &amp; Impact Ledger
            </h2>
            <p className="text-xs text-amber-900 font-medium max-w-lg mt-0.5">
              Track volunteer service hours, IRS 501(c)(3) tax acknowledgement letters, and financial goals.
            </p>
          </div>

          {/* 1-Click Spreadsheet Data Hub */}
          <button
            type="button"
            onClick={() => setIsSpreadsheetModalOpen(true)}
            className="bg-white hover:bg-amber-50 text-amber-900 font-chunky font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-2 cursor-pointer transition shrink-0"
          >
            <Table className="w-4 h-4 text-amber-600" />
            <span>Spreadsheet Sync &amp; Export</span>
          </button>
        </div>

        {/* 4 Outcome Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mt-5">
          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-300 shadow-xs">
            <div className="text-[10px] font-extrabold uppercase text-slate-500">
              Verified Hours
            </div>
            <div className="font-chunky text-2xl font-bold text-amber-900">
              {verifiedHours} / {totalHoursLogged}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">
              ${(verifiedHours * 31.80).toLocaleString()} labor value
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-300 shadow-xs">
            <div className="text-[10px] font-extrabold uppercase text-slate-500">
              Funds Raised
            </div>
            <div className="font-chunky text-2xl font-bold text-emerald-800">
              ${totalFunds.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-600 font-medium">
              {fundsPercent}% of ${event.goals.fundraisingTarget.toLocaleString()} goal
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-300 shadow-xs">
            <div className="text-[10px] font-extrabold uppercase text-slate-500">
              Support Equipment
            </div>
            <div className="font-chunky text-2xl font-bold text-amber-900">
              {equipmentDone} / {needs.length}
            </div>
            <div className="text-[10px] text-slate-600 font-medium">
              needs fulfilled
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-300 shadow-xs">
            <div className="text-[10px] font-extrabold uppercase text-slate-500">
              Volunteers
            </div>
            <div className="font-chunky text-2xl font-bold text-indigo-900">
              {volunteers.length}
            </div>
            <div className="text-[10px] text-indigo-700 font-bold">
              100% attendance rate
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-amber-200 overflow-x-auto shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('hours')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'hours'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Verify Volunteer Hours ({volunteers.filter(v => !v.hoursVerified).length} pending)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('donations')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'donations'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Donations Ledger ({donations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('irs_letters')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'irs_letters'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>IRS 501(c)(3) Letters</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'certificates'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Student Service Certificates</span>
        </button>
      </div>

      {/* TAB 1: VOLUNTEER HOURS VERIFICATION ROSTER */}
      {activeTab === 'hours' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-chunky text-base font-bold text-slate-800">
                Organizer Volunteer Hour Verification
              </h3>
              <p className="text-slate-500">
                Confirm hours completed for student graduation credit and volunteer logs.
              </p>
            </div>

            <button
              type="button"
              onClick={verifyAllPendingHours}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Tap Verify All Hours ✓</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                  <th className="py-2.5 px-3">Volunteer</th>
                  <th className="py-2.5 px-3">Role / Shift</th>
                  <th className="py-2.5 px-3">Compliance Proof</th>
                  <th className="py-2.5 px-3">Hours Logged</th>
                  <th className="py-2.5 px-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {volunteers.map(vol => (
                  <tr key={vol.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{vol.name}</span>
                        {vol.isMinor && (
                          <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200">
                            Student (Age {vol.age || 15})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {vol.email} • {vol.phone}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-700 font-medium">
                        {vol.shiftId.replace('shift-', '').replace(/-/g, ' ')}
                      </span>
                    </td>

                    {/* Compliance Option B Status */}
                    <td className="py-3 px-3">
                      {vol.complianceProof?.credentialId ? (
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ {vol.complianceProof.credentialId}
                          </span>
                        </div>
                      ) : vol.complianceProof?.isVerified ? (
                        <span className="text-slate-500 text-[10px]">Open Clearance</span>
                      ) : (
                        <span className="text-amber-700 text-[10px] bg-amber-50 px-2 py-0.5 rounded-full">
                          Pending Review
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-chunky text-sm font-bold text-slate-800">
                        {vol.hoursCompleted} hrs
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {vol.hoursVerified ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified ✓</span>
                          </span>
                          {vol.isMinor && (
                            <button
                              type="button"
                              onClick={() => setSelectedCertVolunteer(vol)}
                              className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 cursor-pointer"
                            >
                              Certificate
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => verifyVolunteerHours(vol.id, vol.hoursCompleted)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Verify Hours ✓
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DONATIONS & FINANCIAL OUTCOMES */}
      {activeTab === 'donations' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-chunky text-base font-bold text-slate-800">
                Direct Contributions &amp; Sponsorships
              </h3>
              <p className="text-slate-500">
                All donations received via online passes or offline checks, tracked centrally.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddDonation(!showAddDonation)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              {showAddDonation ? 'Cancel' : '+ Record Donation / Check'}
            </button>
          </div>

          {/* Add Donation Form */}
          {showAddDonation && (
            <form onSubmit={handleRecordDonation} className="bg-amber-50 p-4 rounded-2xl border border-amber-300 space-y-3">
              <div className="font-bold text-amber-950">Record Offline Contribution / Check</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Donor / Business Name"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
                <input
                  type="email"
                  placeholder="Donor Email (for tax receipt)"
                  value={donorEmail}
                  onChange={e => setDonorEmail(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Amount ($)"
                  value={donorAmount}
                  onChange={e => setDonorAmount(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Save &amp; Generate Tax Receipt ➔
                </button>
              </div>
            </form>
          )}

          {/* Donations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                  <th className="py-2.5 px-3">Donor</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">IRS Receipt #</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map(don => (
                  <tr key={don.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{don.donorName}</div>
                      <div className="text-[11px] text-slate-500">{don.donorEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{don.date}</td>
                    <td className="py-3 px-3 font-chunky text-sm font-bold text-emerald-700">
                      ${don.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {don.taxReceiptNumber}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTaxDonor(don)}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition cursor-pointer"
                      >
                        View IRS Letter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: IRS 501(C)(3) LETTERS */}
      {activeTab === 'irs_letters' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="font-chunky text-base font-bold text-slate-800">
              📜 Automated IRS 501(c)(3) Tax Substantiation Letters
            </h3>
            <p className="text-slate-500">
              Generates official IRS Pub 526/561 non-cash contribution letters for equipment (Minh&apos;s table, canopies) and cash donors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Equipment In-Kind Letter Card */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                In-Kind Property &amp; Equipment
              </span>
              <h4 className="font-chunky text-sm font-bold text-slate-800">
                Minh&apos;s Folding Table &amp; Equipment Pledges
              </h4>
              <p className="text-slate-600 text-[11px]">
                Official acknowledgement verifying receipt of tangible equipment with zero goods provided in exchange.
              </p>
              <div className="pt-2 flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-700">Estimated FMV: $75.00</span>
                <button
                  type="button"
                  onClick={() => alert(`IRS In-Kind Non-Cash Letter Generated for Minh!\n\nOrganization: ${event.organizationName}\nItem: 6-ft Heavy Duty Folding Table\nDate Received: ${event.date}\nStatutory Clause: No goods or services were provided in whole or part in consideration for this non-cash property contribution.`)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs"
                >
                  Download IRS Letter
                </button>
              </div>
            </div>

            {/* Direct Donation Letters */}
            {donations.slice(0, 2).map(don => (
              <div key={don.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Cash Contribution
                </span>
                <h4 className="font-chunky text-sm font-bold text-slate-800">
                  {don.donorName} (${don.amount})
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Receipt #{don.taxReceiptNumber} • Dispatched via email
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTaxDonor(don)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-300"
                  >
                    View Official Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT SERVICE CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="font-chunky text-base font-bold text-slate-800">
              🎓 Student Community Service Verification Certificates
            </h3>
            <p className="text-slate-500">
              Printable certificates for High School Graduation, National Honor Society, and Scouting hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {volunteers.filter(v => v.isMinor).map(vol => (
              <div key={vol.id} className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-chunky text-sm font-bold text-slate-800">
                      {vol.name}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Age {vol.age || 15} • {event.organizationName}
                    </p>
                  </div>
                  <span className="font-chunky text-sm font-bold text-indigo-900 bg-indigo-100 px-2.5 py-1 rounded-xl">
                    {vol.hoursCompleted} Hours
                  </span>
                </div>

                <div className="text-[11px] text-slate-600">
                  Role: <strong>{vol.shiftId.replace('shift-', '').replace(/-/g, ' ')}</strong>
                  <br />
                  Supervisor: <strong>{event.organizerName}</strong>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCertVolunteer(vol)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View &amp; Print Certificate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: STUDENT SERVICE CERTIFICATE PREVIEW */}
      {selectedCertVolunteer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border-4 border-amber-300 overflow-hidden my-auto p-6 space-y-4 text-center">
            <div className="border-2 border-amber-400 p-6 rounded-2xl bg-amber-50/30 space-y-3">
              <span className="text-3xl">🐝</span>
              <div className="text-[11px] font-black uppercase tracking-widest text-amber-800">
                Certificate of Community Service
              </div>
              <h2 className="font-chunky text-2xl font-bold text-slate-900">
                {selectedCertVolunteer.name}
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Has successfully completed <strong>{selectedCertVolunteer.hoursCompleted} hours</strong> of certified volunteer service supporting <strong>{event.name}</strong> on behalf of {event.organizationName}.
              </p>

              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-amber-200 text-xs text-slate-600 text-left">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Authorized Supervisor</div>
                  <div className="font-bold text-slate-800">{event.organizerName}</div>
                  <div className="text-[10px] text-slate-500">Event Coordinator</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Date Verified</div>
                  <div className="font-bold text-slate-800">{event.date}</div>
                  <div className="text-[10px] text-slate-500">Verified via HiveBooster Hub</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCertVolunteer(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IRS TAX LETTER PREVIEW */}
      {selectedTaxDonor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-300 p-6 space-y-4 text-xs">
            <div className="border-b pb-3 space-y-1">
              <div className="font-bold text-sm text-slate-900">{event.organizationName}</div>
              <div className="text-slate-500">501(c)(3) Nonprofit • Tax ID: 94-2849102</div>
              <div className="text-[10px] font-mono text-slate-400">Receipt #{selectedTaxDonor.taxReceiptNumber}</div>
            </div>

            <div className="space-y-2">
              <p>Dear <strong>{selectedTaxDonor.donorName}</strong>,</p>
              <p>
                Thank you for your generous contribution of <strong>${selectedTaxDonor.amount.toLocaleString()}.00</strong> received on <strong>{selectedTaxDonor.date}</strong> in support of {event.name}.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <strong>Statutory IRS Disclosure (IRC §170(f)(8)):</strong>
                <br />
                No goods or services were provided in whole or in part in exchange for this contribution. Please retain this letter for your federal income tax filing records.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTaxDonor(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
