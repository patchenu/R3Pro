import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, Users, DollarSign, ShieldAlert, Sparkles, 
  Plus, Settings, CheckCircle2, ArrowRight, Layers, Store, HeartHandshake,
  Printer, FileSpreadsheet, Search, Filter, ShieldCheck, Award, Share2, AlertTriangle, FileText, Package
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatTimeRange } from '../../utils/formatters';
import { exportRosterToCsv } from '../../utils/exportCsv';
import { printVolunteerRosterHtml, printNameBadgesHtml, printStudentServiceLetterHtml } from '../../utils/exportPdf';
import { Thermometer } from '../common/Thermometer';
import { ApprovalQueueModal } from './ApprovalQueueModal';
import { VendorMarketplaceManager } from './VendorMarketplaceManager';
import { EventMarketingHub } from '../marketing/EventMarketingHub';
import { GapAnalysisDashboard } from '../intelligence/GapAnalysisDashboard';
import { ReportsExportCenter } from './ReportsExportCenter';
import { ItemReceivingHub } from './ItemReceivingHub';

interface MasterPlannerDashboardProps {
  onOpenEventBuilder: () => void;
  onOpenGapAnalysis?: () => void;
  onOpenReports?: () => void;
}

export const MasterPlannerDashboard: React.FC<MasterPlannerDashboardProps> = ({
  onOpenEventBuilder
}) => {
  const { currentEvent, currentOrg, subParts, shifts, itemSlots, registrations, donations, approvalRequests, toggleCheckIn } = useApp();

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [activePlannerTab, setActivePlannerTab] = useState<'overview' | 'volunteers' | 'items' | 'marketing' | 'gaps' | 'vendors' | 'reports'>('overview');

  // Volunteer Management Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubPartId, setSelectedSubPartId] = useState<string>('all');
  const [checkInFilter, setCheckInFilter] = useState<'all' | 'checked_in' | 'pending'>('all');

  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;

  const totalCap = shifts.reduce((sum, s) => sum + s.capacity, 0);
  const totalClaimed = shifts.reduce((sum, s) => sum + s.claimedCount, 0);
  const shiftFillRate = formatPercentage(totalClaimed, totalCap);

  // Flatten shift claims for comprehensive volunteer management
  const allVolunteerRows = registrations.flatMap(reg => 
    reg.shiftClaims.map(claim => {
      const shift = shifts.find(s => s.id === claim.shiftId);
      const subPart = shift ? subParts.find(sp => sp.id === shift.subPartId) : undefined;
      const member = reg.members.find(m => m.id === claim.groupMemberId) || reg.members[0];
      const waiver = reg.waivers.find(w => w.groupMemberId === (member?.id || ''));

      return {
        regId: reg.id,
        claim,
        shift,
        subPart,
        member,
        waiver,
        primaryPhone: reg.primaryPhone
      };
    })
  );

  const filteredVolunteers = allVolunteerRows.filter(row => {
    const nameMatch = (row.member?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (row.shift?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (row.subPart?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = selectedSubPartId === 'all' || row.subPart?.id === selectedSubPartId;
    const checkInMatch = checkInFilter === 'all' || 
                         (checkInFilter === 'checked_in' && row.claim.checkedIn) ||
                         (checkInFilter === 'pending' && !row.claim.checkedIn);
    return nameMatch && deptMatch && checkInMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Planner Command Hub Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              Event Planner & Chair Hub
            </span>
            <span className="text-xs text-indigo-200">
              Organization: <strong className="text-white">{currentOrg.name}</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mt-1.5">
            {currentEvent.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Complete command center coordinating {subParts.length} Departments, {shifts.length} Volunteer Shifts, and {formatCurrency(currentEvent.fundraisingGoal)} Campaign Target.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition animate-bounce"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Approval Queue ({pendingApprovalsCount})</span>
            </button>
          )}

          <button
            onClick={() => setActivePlannerTab('gaps')}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/20 transition"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Gap Analysis</span>
          </button>

          <button
            onClick={() => setActivePlannerTab('reports')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Reports & Badges</span>
          </button>
        </div>
      </div>

      {/* Campaign Progress Thermometer */}
      <Thermometer
        currentAmount={currentEvent.totalRaised}
        goalAmount={currentEvent.fundraisingGoal}
        donorCount={donations.length + registrations.filter(r => r.donations.length > 0).length + 8}
        volunteerFillRate={shiftFillRate}
        currency={currentEvent.currency}
      />

      {/* Unified Event Planner Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActivePlannerTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Committees & Budgets</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('volunteers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'volunteers' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Volunteer Manifest & Check-In ({allVolunteerRows.length})</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('items')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'items' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>📦 Item Pledges & Receiving</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('marketing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'marketing' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Marketing, Flyers & Broadcast</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('gaps')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'gaps' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Gap Analysis & Health</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('vendors')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'vendors' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vendor Marketplace & Booths</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports, Badges & IRS Receipts</span>
        </button>
      </div>

      {/* TAB 1: Department Breakdown & Budget Allocations */}
      {activePlannerTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subParts.map((sp) => {
              const deptShifts = shifts.filter(s => s.subPartId === sp.id);
              const deptCap = deptShifts.reduce((acc, s) => acc + s.capacity, 0);
              const deptClaimed = deptShifts.reduce((acc, s) => acc + s.claimedCount, 0);
              const deptFill = formatPercentage(deptClaimed, deptCap);

              return (
                <div
                  key={sp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {sp.category.replace('_', ' ')}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{sp.name}</h3>
                      <p className="text-xs text-slate-500">
                        Designated Lead: <strong>{sp.leadName}</strong> ({sp.leadPhone})
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      deptFill < 50 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {deptFill}% Staffed
                    </span>
                  </div>

                  {/* Shifts & Budget Meters */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Volunteers Filled</span>
                      <div className="font-bold text-slate-900 mt-0.5">{deptClaimed} / {deptCap} spots</div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Budget Allocated</span>
                      <div className="font-bold text-slate-900 mt-0.5">{formatCurrency(sp.budgetSpent)} of {formatCurrency(sp.budgetAllocated)}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span>Gate: <strong>{sp.reportingGate}</strong></span>
                    <span>{deptShifts.length} Shift Roles</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE VOLUNTEER MANIFEST & MANAGEMENT */}
      {activePlannerTab === 'volunteers' && (
        <div className="space-y-6">
          
          {/* Volunteer Action Controls */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search volunteer, shift, dept..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <select
                value={selectedSubPartId}
                onChange={(e) => setSelectedSubPartId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">All Departments ({subParts.length})</option>
                {subParts.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>

              <select
                value={checkInFilter}
                onChange={(e) => setCheckInFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="checked_in">Checked In Only</option>
                <option value="pending">Pending Arrival Only</option>
              </select>
            </div>

            {/* Print & Export Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => printNameBadgesHtml(currentEvent, currentOrg, registrations, shifts, subParts)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Lanyards / Badges</span>
              </button>

              <button
                onClick={() => printVolunteerRosterHtml(currentEvent, currentOrg, registrations, shifts, subParts)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF Manifest</span>
              </button>

              <button
                onClick={() => exportRosterToCsv(registrations, shifts, subParts, currentEvent.title)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3.5 rounded-xl text-xs transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Volunteer Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Event Volunteer Attendance Manifest</h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredVolunteers.length} volunteer shift assignments for {currentEvent.title}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 font-bold">Volunteer Name</th>
                    <th className="pb-3 font-bold">Department</th>
                    <th className="pb-3 font-bold">Assigned Shift</th>
                    <th className="pb-3 font-bold">Contact Phone</th>
                    <th className="pb-3 font-bold">Waiver Status</th>
                    <th className="pb-3 font-bold">Check-In Status</th>
                    <th className="pb-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVolunteers.map((row, idx) => {
                    const isMinor = row.member?.isMinor;
                    return (
                      <tr key={`${row.regId}_${idx}`} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 font-bold text-slate-900">
                          {row.member ? row.member.name : 'Volunteer'}
                          {isMinor && (
                            <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded font-bold">
                              Minor / Student
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-700">
                          <span className="font-semibold">{row.subPart?.name || 'General'}</span>
                          <span className="block text-[10px] text-slate-400">Gate: {row.subPart?.reportingGate || 'Main Gate'}</span>
                        </td>
                        <td className="py-3.5 text-slate-700">
                          <strong className="text-slate-900">{row.shift?.title || 'Shift'}</strong>
                          <span className="block text-[10px] text-indigo-600 font-semibold">
                            {row.shift ? formatTimeRange(row.shift.startTime, row.shift.endTime) : ''}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-600">{row.member?.phone || row.primaryPhone}</td>
                        <td className="py-3.5">
                          {row.waiver ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-max">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Signed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px] w-max block">
                              Pending Waiver
                            </span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => toggleCheckIn(row.regId, row.claim.shiftId, row.member?.id || '')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              row.claim.checkedIn
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{row.claim.checkedIn ? 'Checked In ✓' : 'Mark Present'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => printStudentServiceLetterHtml(row.member?.name || 'Volunteer', 4.0, currentEvent, currentOrg)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition"
                            title="Print verified service hours certificate"
                          >
                            Hours Cert
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ITEM PLEDGES & PHYSICAL RECEIVING STATION */}
      {activePlannerTab === 'items' && (
        <ItemReceivingHub />
      )}

      {/* TAB 4: MARKETING, FLYERS & OUTREACH */}
      {activePlannerTab === 'marketing' && (
        <EventMarketingHub />
      )}

      {/* TAB 4: GAP ANALYSIS & CAMPAIGN HEALTH */}
      {activePlannerTab === 'gaps' && (
        <GapAnalysisDashboard onOpenBroadcast={() => setActivePlannerTab('marketing')} />
      )}

      {/* TAB 5: VENDORS & SPONSORS */}
      {activePlannerTab === 'vendors' && (
        <VendorMarketplaceManager />
      )}

      {/* TAB 6: REPORTS, BADGES & IRS RECEIPTS */}
      {activePlannerTab === 'reports' && (
        <ReportsExportCenter />
      )}

      {/* Approval Queue Modal */}
      <ApprovalQueueModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
      />

    </div>
  );
};
