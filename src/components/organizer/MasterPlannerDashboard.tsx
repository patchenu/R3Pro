import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, Users, DollarSign, ShieldAlert, Sparkles, 
  Plus, Settings, CheckCircle2, ArrowRight, Layers, Store, HeartHandshake 
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { Thermometer } from '../common/Thermometer';
import { ApprovalQueueModal } from './ApprovalQueueModal';
import { VendorMarketplaceManager } from './VendorMarketplaceManager';

interface MasterPlannerDashboardProps {
  onOpenEventBuilder: () => void;
  onOpenGapAnalysis: () => void;
  onOpenReports: () => void;
}

export const MasterPlannerDashboard: React.FC<MasterPlannerDashboardProps> = ({
  onOpenEventBuilder,
  onOpenGapAnalysis,
  onOpenReports
}) => {
  const { currentEvent, currentOrg, subParts, shifts, itemSlots, registrations, donations, approvalRequests } = useApp();

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [activePlannerTab, setActivePlannerTab] = useState<'overview' | 'departments' | 'vendors'>('overview');

  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;

  const totalCap = shifts.reduce((sum, s) => sum + s.capacity, 0);
  const totalClaimed = shifts.reduce((sum, s) => sum + s.claimedCount, 0);
  const shiftFillRate = formatPercentage(totalClaimed, totalCap);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Event Planner & Chair Hub
            </span>
            <span className="text-xs text-slate-300">
              Organization: <strong>{currentOrg.name}</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            {currentEvent.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Coordinating {subParts.length} Committee Departments, {shifts.length} Volunteer Shifts, and {formatCurrency(currentEvent.fundraisingGoal)} Campaign Target.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Approval Queue ({pendingApprovalsCount})</span>
            </button>
          )}

          <button
            onClick={onOpenGapAnalysis}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/20 transition"
          >
            <span>Gap Analysis & Health</span>
          </button>

          <button
            onClick={onOpenReports}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
          >
            <span>Print Rosters & Exports</span>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActivePlannerTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activePlannerTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Committees & Department Breakdown
        </button>

        <button
          onClick={() => setActivePlannerTab('vendors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activePlannerTab === 'vendors' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Vendor Marketplace & Booth Allocation
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

      {/* TAB 2: Vendors & Sponsors */}
      {activePlannerTab === 'vendors' && (
        <VendorMarketplaceManager />
      )}

      {/* Approval Queue Modal */}
      <ApprovalQueueModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
      />

    </div>
  );
};
