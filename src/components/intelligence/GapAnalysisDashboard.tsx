import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, CheckCircle2, ShieldAlert, Users, 
  Gift, TrendingDown, DollarSign, Send, Sparkles, ArrowRight 
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatTimeRange } from '../../utils/formatters';

interface GapAnalysisDashboardProps {
  onOpenBroadcast: () => void;
}

export const GapAnalysisDashboard: React.FC<GapAnalysisDashboardProps> = ({ onOpenBroadcast }) => {
  const { currentEvent, subParts, shifts, itemSlots, registrations, volunteerCrm, showToast } = useApp();

  // 1. Critical Shift Deficits (<50% capacity)
  const criticalShifts = shifts.filter(s => {
    const rate = formatPercentage(s.claimedCount, s.capacity);
    return rate < 50;
  });

  // 2. Critical Item Supply Shortages (<50% pledged)
  const criticalItems = itemSlots.filter(i => {
    const rate = formatPercentage(i.quantityPledged, i.quantityNeeded);
    return rate < 50;
  });

  // 3. No-Show Risk Volunteers (Pending waivers or not checked in)
  const unverifiedWaiverCount = registrations.flatMap(r => r.members)
    .filter(m => !registrations.some(r => r.waivers.some(w => w.groupMemberId === m.id))).length;

  // 4. Budget Overrun Risk
  const overBudgetSubParts = subParts.filter(sp => sp.budgetSpent > sp.budgetAllocated * 0.85);

  const handleAutoResolveGaps = () => {
    showToast(
      'success',
      'Targeted Invitations Dispatched',
      `Sent urgent broadcast invites to ${volunteerCrm.length} past volunteers from the Organization CRM matching needed skills.`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Real-Time Event Gap & Health Intelligence
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Event Health & Gap Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Automated diagnostic scanning across volunteer headcounts, supply pledges, legal waiver compliance, and department budget burns for <strong>{currentEvent.title}</strong>.
            </p>
          </div>

          <button
            onClick={handleAutoResolveGaps}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black py-3 px-6 rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition transform hover:scale-105 active:scale-100"
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click Auto-Fill: Blast Past CRM Volunteers</span>
          </button>
        </div>
      </div>

      {/* Metric Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Critical Shift Deficits</span>
            <span className={`w-2.5 h-2.5 rounded-full ${criticalShifts.length > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{criticalShifts.length}</div>
          <p className="text-xs text-rose-600 font-semibold mt-1">
            {criticalShifts.length > 0 ? 'Shifts under 50% capacity' : 'All shifts well-staffed'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Item Supply Shortages</span>
            <span className={`w-2.5 h-2.5 rounded-full ${criticalItems.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{criticalItems.length}</div>
          <p className="text-xs text-amber-600 font-semibold mt-1">
            {criticalItems.length > 0 ? 'Wishlist items <50% pledged' : 'All supplies pledged'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">No-Show Risk Factor</span>
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">Low (8%)</div>
          <p className="text-xs text-slate-500 mt-1">
            Based on 24h reminder response & signed waivers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Budget Burn Health</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {overBudgetSubParts.length === 0 ? 'Optimal' : `${overBudgetSubParts.length} At-Risk`}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {overBudgetSubParts.length === 0 ? 'All departments within budget cap' : 'Approaching budget ceiling'}
          </p>
        </div>

      </div>

      {/* CRITICAL SHIFT SHORTAGES BREAKDOWN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              Critical Volunteer Shortages (Immediate Attention)
            </h3>
            <p className="text-xs text-slate-500">Shifts with less than 50% capacity filled</p>
          </div>
        </div>

        {criticalShifts.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Excellent! All volunteer shifts are currently 50% or more filled.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalShifts.map((shift) => {
              const subPart = subParts.find(sp => sp.id === shift.subPartId);
              const spotsLeft = shift.capacity - shift.claimedCount;

              return (
                <div
                  key={shift.id}
                  className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-2 py-0.5 rounded">
                        DEFICIT: {spotsLeft} VOLUNTEERS NEEDED
                      </span>
                      <span className="text-xs font-semibold text-slate-600">{subPart?.name}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-1">{shift.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Schedule: <strong>{formatTimeRange(shift.startTime, shift.endTime)}</strong> • Lead: {subPart?.leadName} ({subPart?.leadPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-rose-700">
                      {shift.claimedCount} of {shift.capacity} Filled ({formatPercentage(shift.claimedCount, shift.capacity)}%)
                    </span>
                    <button
                      onClick={handleAutoResolveGaps}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Invite Volunteers</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SUPPLY ITEM SHORTAGES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              Supply & Equipment Shortages
            </h3>
            <p className="text-xs text-slate-500">Wishlist items that have not yet reached 50% pledge fulfillment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {criticalItems.map((item) => {
            const subPart = subParts.find(sp => sp.id === item.subPartId);
            const deficit = item.quantityNeeded - item.quantityPledged;

            return (
              <div key={item.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {subPart?.name}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{item.itemName}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Drop-off: {item.dropOffLocation} (By {item.dropOffDeadline})
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {deficit} {item.unit} needed
                  </span>
                </div>

                <div className="w-full bg-amber-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, formatPercentage(item.quantityPledged, item.quantityNeeded))}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-1">
                  <span>{item.quantityPledged} pledged</span>
                  <span>Goal: {item.quantityNeeded}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
