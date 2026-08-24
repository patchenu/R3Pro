import React, { useState } from 'react';
import { Shift, SubPart } from '../../types';
import { 
  Clock, AlertTriangle, CheckCircle2, ChevronUp, 
  ChevronDown, Sparkles, ArrowRight, MapPin,
  Gift, Ticket, DollarSign, X
} from 'lucide-react';
import { formatTimeRange } from '../../utils/formatters';

interface VisualScheduleTimelineBarProps {
  selectedShifts: Shift[];
  subParts: SubPart[];
  itemPledgesCount: number;
  ticketsCount: number;
  directDonationAmount: number;
  onRemoveShift: (shiftId: string) => void;
  onClearAll: () => void;
  onOpenRegistration: () => void;
  primaryColor?: string;
}

export const VisualScheduleTimelineBar: React.FC<VisualScheduleTimelineBarProps> = ({
  selectedShifts,
  subParts,
  itemPledgesCount,
  ticketsCount,
  directDonationAmount,
  onRemoveShift,
  onClearAll,
  onOpenRegistration,
  primaryColor = '#4f46e5'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (selectedShifts.length === 0 && itemPledgesCount === 0 && ticketsCount === 0 && directDonationAmount === 0) {
    return null;
  }

  // Sort shifts chronologically by start time
  const sortedShifts = [...selectedShifts].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Compute total service hours
  const totalServiceHours = sortedShifts.reduce((acc, shift) => {
    const start = new Date(shift.startTime).getTime();
    const end = new Date(shift.endTime).getTime();
    const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
    return acc + hours;
  }, 0);

  // Detect time collisions / overlaps between shifts
  const overlappingPairs: { shift1: Shift; shift2: Shift; overlapMinutes: number }[] = [];
  for (let i = 0; i < sortedShifts.length; i++) {
    for (let j = i + 1; j < sortedShifts.length; j++) {
      const s1 = sortedShifts[i];
      const s2 = sortedShifts[j];
      const start1 = new Date(s1.startTime).getTime();
      const end1 = new Date(s1.endTime).getTime();
      const start2 = new Date(s2.startTime).getTime();
      const end2 = new Date(s2.endTime).getTime();

      if (start1 < end2 && start2 < end1) {
        const overlapStart = Math.max(start1, start2);
        const overlapEnd = Math.min(end1, end2);
        const overlapMins = Math.round((overlapEnd - overlapStart) / (1000 * 60));
        overlappingPairs.push({ shift1: s1, shift2: s2, overlapMinutes: overlapMins });
      }
    }
  }

  const hasOverlap = overlappingPairs.length > 0;
  const totalItemsCount = selectedShifts.length + itemPledgesCount + ticketsCount + (directDonationAmount > 0 ? 1 : 0);

  return (
    <div className="fixed bottom-3 inset-x-2 sm:inset-x-4 max-w-5xl mx-auto z-40 transition-all duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-3xl border border-indigo-500/30 shadow-2xl shadow-slate-950/60 overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Volunteer Day & Cart</span>
            </div>

            {selectedShifts.length > 0 && (
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <strong className="text-white">{totalServiceHours.toFixed(1)} hrs</strong> of community impact
              </span>
            )}

            {/* Overlap Status Badge */}
            {selectedShifts.length > 1 && (
              hasOverlap ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  Time Overlap Conflict
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Zero Conflicts ✓
                </span>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition text-xs flex items-center gap-1 font-semibold"
              title={isExpanded ? "Collapse view" : "Expand schedule"}
            >
              <span className="hidden sm:inline">{isExpanded ? "Hide Details" : "Show Schedule"}</span>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={onClearAll}
              className="text-[11px] text-slate-400 hover:text-rose-300 transition font-medium px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Expandable Timeline Section */}
        {isExpanded && (
          <div className="p-4 sm:p-5 space-y-3.5 max-h-72 overflow-y-auto custom-scrollbar">
            
            {/* Warning Message if Overlaps Exist */}
            {hasOverlap && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-rose-300 block">Conflicting Shift Times Detected:</span>
                  {overlappingPairs.map((pair, idx) => (
                    <div key={idx} className="text-[11px] text-rose-200 mt-0.5">
                      • <strong>{pair.shift1.title}</strong> and <strong>{pair.shift2.title}</strong> overlap by {pair.overlapMinutes} minutes. You can still register different household members for each shift in the sign-up modal.
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Shifts Visual Timeline */}
            {sortedShifts.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                  Chronological Volunteer Schedule
                </span>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
                  {sortedShifts.map((shift, idx) => {
                    const dept = subParts.find(sp => sp.id === shift.subPartId);
                    const nextShift = sortedShifts[idx + 1];
                    let bufferMinutes = 0;
                    if (nextShift) {
                      const endCurrent = new Date(shift.endTime).getTime();
                      const startNext = new Date(nextShift.startTime).getTime();
                      bufferMinutes = Math.round((startNext - endCurrent) / (1000 * 60));
                    }

                    return (
                      <React.Fragment key={shift.id}>
                        <div className="flex-1 min-w-[240px] bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-3 flex items-center justify-between gap-2.5 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-md text-[10px] font-extrabold">
                                {dept?.name || 'General'}
                              </span>
                              <span className="font-bold text-xs text-white">
                                {shift.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                {formatTimeRange(shift.startTime, shift.endTime)}
                              </span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <MapPin className="w-3 h-3 text-rose-400" />
                                {shift.reportingLocationOverride || dept?.reportingGate || 'Main Gate'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveShift(shift.id)}
                            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl transition"
                            title="Remove shift"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Transition Buffer Badge between consecutive shifts */}
                        {nextShift && (
                          <div className="hidden sm:flex items-center justify-center px-1">
                            {bufferMinutes > 0 ? (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 whitespace-nowrap">
                                ⏱️ {bufferMinutes}m break
                              </span>
                            ) : bufferMinutes === 0 ? (
                              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950 px-2 py-1 rounded-lg border border-indigo-800 whitespace-nowrap">
                                ⚡ Back-to-back
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-1 rounded-lg border border-rose-800 whitespace-nowrap">
                                ⚠️ {Math.abs(bufferMinutes)}m overlap
                              </span>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Non-Shift Items Summary in Cart */}
            {(itemPledgesCount > 0 || ticketsCount > 0 || directDonationAmount > 0) && (
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
                  Also in Cart:
                </span>
                {itemPledgesCount > 0 && (
                  <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" />
                    <span>{itemPledgesCount} Wishlist Supplies Pledged</span>
                  </span>
                )}
                {ticketsCount > 0 && (
                  <span className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{ticketsCount} Admission / Package Tickets</span>
                  </span>
                )}
                {directDonationAmount > 0 && (
                  <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>${directDonationAmount} Direct Donation</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Checkout Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              <strong>{totalItemsCount} total {totalItemsCount === 1 ? 'selection' : 'selections'}</strong> ready for 1-click confirmation
            </span>
          </div>

          <button
            onClick={onOpenRegistration}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 shrink-0 group cursor-pointer"
          >
            <span>Complete Sign-Up & Claim Passes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
