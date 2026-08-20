import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubPart, Shift, ItemSlot } from '../../types';
import { 
  Users, Plus, Gift, Clock, Send, ShieldCheck, CheckCircle2, 
  MapPin, Phone, AlertTriangle, DollarSign, QrCode, TrendingUp 
} from 'lucide-react';
import { formatCurrency, formatTimeRange, formatPercentage } from '../../utils/formatters';
import { LeadBroadcastModal } from './LeadBroadcastModal';
import { Modal } from '../common/Modal';

export const LeadPortal: React.FC = () => {
  const { currentEvent, subParts, shifts, itemSlots, registrations, currentUser, addShift, addItemSlot, requestBudgetIncrease, toggleCheckIn } = useApp();

  // Scoped SubPart: Find user's assigned subpart, or default to the first one
  const assignedSubPart = subParts.find(sp => sp.leadUserId === currentUser.id || currentUser.assignedSubPartIds?.includes(sp.id)) || subParts[0];

  const [activeSubPartId, setActiveSubPartId] = useState<string>(assignedSubPart?.id || (subParts[0]?.id ?? ''));
  const currentSubPart = subParts.find(sp => sp.id === activeSubPartId) || subParts[0];

  // Modals
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isBudgetReqOpen, setIsBudgetReqOpen] = useState(false);

  // Add Shift Form
  const [newShiftTitle, setNewShiftTitle] = useState('');
  const [newShiftDesc, setNewShiftDesc] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('2026-09-19T10:00:00');
  const [newShiftEnd, setNewShiftEnd] = useState('2026-09-19T13:00:00');
  const [newShiftCap, setNewShiftCap] = useState(4);
  const [newShiftWaiver, setNewShiftWaiver] = useState(true);

  // Add Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Supplies');
  const [newItemQty, setNewItemQty] = useState(10);
  const [newItemUnit, setNewItemUnit] = useState('boxes');
  const [newItemDropOff, setNewItemDropOff] = useState('Department Desk');
  const [newItemDeadline, setNewItemDeadline] = useState('Saturday 8:00 AM');

  // Budget Request Form
  const [budgetReqAmount, setBudgetReqAmount] = useState(250);
  const [budgetReqReason, setBudgetReqReason] = useState('');

  if (!currentSubPart) {
    return <div className="p-8 text-center text-slate-500">No committee departments found.</div>;
  }

  const subPartShifts = shifts.filter(s => s.subPartId === currentSubPart.id);
  const subPartItems = itemSlots.filter(i => i.subPartId === currentSubPart.id);
  const subPartRegistrations = registrations.filter(r => 
    r.shiftClaims.some(sc => subPartShifts.some(s => s.id === sc.shiftId))
  );

  const totalCap = subPartShifts.reduce((sum, s) => sum + s.capacity, 0);
  const totalClaimed = subPartShifts.reduce((sum, s) => sum + s.claimedCount, 0);
  const fillRate = formatPercentage(totalClaimed, totalCap);

  const handleAddShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addShift({
      subPartId: currentSubPart.id,
      eventId: currentEvent.id,
      title: newShiftTitle,
      description: newShiftDesc,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      capacity: newShiftCap,
      requiresWaiver: newShiftWaiver,
      waiverTemplateId: 'waiver_general_liability'
    });
    setIsAddShiftOpen(false);
    setNewShiftTitle('');
    setNewShiftDesc('');
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItemSlot({
      subPartId: currentSubPart.id,
      eventId: currentEvent.id,
      itemName: newItemName,
      category: newItemCategory,
      quantityNeeded: newItemQty,
      unit: newItemUnit,
      dropOffLocation: newItemDropOff,
      dropOffDeadline: newItemDeadline
    });
    setIsAddItemOpen(false);
    setNewItemName('');
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestBudgetIncrease(currentSubPart.id, budgetReqAmount, budgetReqReason);
    setIsBudgetReqOpen(false);
    setBudgetReqReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Department Top Banner & Lead Scoping */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                Committee Lead Workspace
              </span>
              <span className="text-xs text-slate-300">
                Lead: <strong>{currentSubPart.leadName}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {currentSubPart.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              Reporting Gate: <strong>{currentSubPart.reportingGate}</strong> • Radio: <strong>{currentSubPart.leadRadioChannel || 'Channel 1'}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast to My Team</span>
            </button>

            <button
              onClick={() => setIsAddShiftOpen(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Volunteer Shift</span>
            </button>

            <button
              onClick={() => setIsAddItemOpen(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Wishlist Item</span>
            </button>
          </div>
        </div>

        {/* Committee Switcher for Admins */}
        {subParts.length > 1 && (
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Switch Committee:</span>
            {subParts.map(sp => (
              <button
                key={sp.id}
                onClick={() => setActiveSubPartId(sp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeSubPartId === sp.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards: Fulfillment & Budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Volunteer Fulfillment Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Shift Staffing Level</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              fillRate < 50 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {fillRate}% Filled
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalClaimed} / {totalCap} Spots
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, fillRate)}%` }}
              className={`h-full rounded-full ${fillRate < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {Math.max(0, totalCap - totalClaimed)} volunteer spots still needed for event day.
          </p>
        </div>

        {/* Department Budget Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Department Budget</span>
            <button
              onClick={() => setIsBudgetReqOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              + Request Budget
            </button>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(currentSubPart.budgetSpent)} / {formatCurrency(currentSubPart.budgetAllocated)}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, formatPercentage(currentSubPart.budgetSpent, currentSubPart.budgetAllocated))}%` }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Remaining Budget Cap: <strong>{formatCurrency(Math.max(0, currentSubPart.budgetAllocated - currentSubPart.budgetSpent))}</strong>
          </p>
        </div>

        {/* Roster & Checked-in Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Registered Volunteers</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {subPartRegistrations.length} Volunteers
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {subPartRegistrations.reduce((acc, r) => acc + r.shiftClaims.filter(c => c.checkedIn).length, 0)} Checked In on-site
            </span>
          </div>
        </div>

      </div>

      {/* SHIFTS MANAGEMENT TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Volunteer Shift Roster</h3>
            <p className="text-xs text-slate-500">Monitor volunteer registrations and track arrivals</p>
          </div>
          <button
            onClick={() => setIsAddShiftOpen(true)}
            className="flex items-center gap-1 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Shift
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 font-bold">Shift Role</th>
                <th className="pb-3 font-bold">Schedule</th>
                <th className="pb-3 font-bold">Filled / Capacity</th>
                <th className="pb-3 font-bold">Waiver Req</th>
                <th className="pb-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subPartShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-bold text-slate-900">
                    {shift.title}
                    <span className="block text-[11px] text-slate-500 font-normal">{shift.description}</span>
                  </td>
                  <td className="py-3 text-slate-700 font-semibold">
                    {formatTimeRange(shift.startTime, shift.endTime)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold ${
                      shift.claimedCount >= shift.capacity ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {shift.claimedCount} / {shift.capacity}
                    </span>
                  </td>
                  <td className="py-3">
                    {shift.requiresWaiver ? (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-3">
                    {shift.isApproved ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px]">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold text-[10px]">
                        Pending Planner Approval
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VOLUNTEER ATTENDANCE & CHECK-IN TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Live Station Volunteer Check-In</h3>
            <p className="text-xs text-slate-500">Tap to check in volunteers as they arrive at {currentSubPart.name}</p>
          </div>
        </div>

        <div className="space-y-2">
          {subPartRegistrations.map((reg) => {
            return reg.shiftClaims
              .filter(sc => subPartShifts.some(s => s.id === sc.shiftId))
              .map((claim, idx) => {
                const shift = subPartShifts.find(s => s.id === claim.shiftId);
                const member = reg.members.find(m => m.id === claim.groupMemberId) || reg.members[0];
                const waiver = reg.waivers.find(w => w.groupMemberId === member.id);

                return (
                  <div
                    key={`${reg.id}_${idx}`}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                        {member.isMinor && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                            Minor / Student
                          </span>
                        )}
                        {waiver ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Waiver Signed
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                            ⚠️ Waiver Pending
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Shift: <strong>{shift?.title}</strong> • Contact: {member.phone || reg.primaryPhone}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCheckIn(reg.id, claim.shiftId, member.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        claim.checkedIn
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{claim.checkedIn ? 'Checked In' : 'Tap to Check In'}</span>
                    </button>
                  </div>
                );
              });
          })}
        </div>
      </div>

      {/* Modals */}
      {isBroadcastOpen && (
        <LeadBroadcastModal
          isOpen={isBroadcastOpen}
          onClose={() => setIsBroadcastOpen(false)}
          subPart={currentSubPart}
        />
      )}

      {/* Add Shift Modal */}
      {isAddShiftOpen && (
        <Modal
          isOpen={isAddShiftOpen}
          onClose={() => setIsAddShiftOpen(false)}
          title={`Add Volunteer Shift to ${currentSubPart.name}`}
          subtitle={`Current threshold: ${currentEvent.approvalThresholdSlots} slots (auto-approves under limit)`}
        >
          <form onSubmit={handleAddShiftSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Title *</label>
              <input
                type="text"
                required
                value={newShiftTitle}
                onChange={(e) => setNewShiftTitle(e.target.value)}
                placeholder="e.g. Master Grill Assistant"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Tasks</label>
              <textarea
                rows={2}
                value={newShiftDesc}
                onChange={(e) => setNewShiftDesc(e.target.value)}
                placeholder="Describe role responsibilities..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Volunteers Needed)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={newShiftCap}
                  onChange={(e) => setNewShiftCap(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Liability Waiver Required?</label>
                <select
                  value={newShiftWaiver ? 'yes' : 'no'}
                  onChange={(e) => setNewShiftWaiver(e.target.value === 'yes')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="yes">Yes (Liability Waiver)</option>
                  <option value="no">No Waiver Needed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setIsAddShiftOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition"
              >
                Create Shift
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <Modal
          isOpen={isAddItemOpen}
          onClose={() => setIsAddItemOpen(false)}
          title={`Add Wishlist Item to ${currentSubPart.name}`}
          subtitle="Request supply and food donations from attendees"
        >
          <form onSubmit={handleAddItemSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description *</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Homemade Brownies (Plate of 12)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Needed</label>
                <input
                  type="number"
                  min={1}
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit (e.g. packs, trays)</label>
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setIsAddItemOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition"
              >
                Add to Wishlist
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Budget Increase Request Modal */}
      {isBudgetReqOpen && (
        <Modal
          isOpen={isBudgetReqOpen}
          onClose={() => setIsBudgetReqOpen(false)}
          title={`Request Budget Increase for ${currentSubPart.name}`}
          subtitle="Routes to Event Planner for 1-click review"
        >
          <form onSubmit={handleBudgetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Budget Amount ($) *</label>
              <input
                type="number"
                min={25}
                required
                value={budgetReqAmount}
                onChange={(e) => setBudgetReqAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Justification *</label>
              <textarea
                required
                rows={3}
                value={budgetReqReason}
                onChange={(e) => setBudgetReqReason(e.target.value)}
                placeholder="Explain why this budget adjustment is required..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setIsBudgetReqOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition"
              >
                Submit Request to Planner
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
