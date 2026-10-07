import React, { useState } from 'react';
import { 
  Package, Users, DollarSign, Target, Plus, Send, Clock, MapPin, 
  ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, Sparkles, 
  HelpCircle, Eye, RefreshCw 
} from 'lucide-react';
import { useHoneycomb } from '../../context/HoneycombContext';
import { 
  DutyCategory, DUTY_CATEGORIES, STANDARD_COMPLIANCE, 
  ComplianceType, SupportNeed 
} from '../../types';

export const Step2OrganizerStudio: React.FC = () => {
  const { 
    event, 
    needs, 
    shifts, 
    updateEventGoals, 
    addEquipmentNeed, 
    assignNeedToPerson,
    sendNeedReminder,
    releaseNeedToPublic,
    addShift,
    setIsMinhModalOpen,
    setCurrentLifecyclePhase
  } = useHoneycomb();

  const [activeTab, setActiveTab] = useState<'equipment' | 'shifts' | 'goals' | 'privacy'>('equipment');

  // New Equipment Need Form
  const [showAddNeedForm, setShowAddNeedForm] = useState(false);
  const [needTitle, setNeedTitle] = useState('');
  const [needDetails, setNeedDetails] = useState('');
  const [needQty, setNeedQty] = useState(1);
  const [needUnit, setNeedUnit] = useState('table');
  const [needDueDate, setNeedDueDate] = useState(event.date);
  const [needDueTime, setNeedDueTime] = useState('07:30');
  const [needFmv, setNeedFmv] = useState<number>(75);
  const [fallbackOption, setFallbackOption] = useState<'alert_organizer' | 'auto_public_wishlist' | 'both'>('both');
  
  // Assignee Fields
  const [assigneeName, setAssigneeName] = useState('Minh');
  const [assigneeEmail, setAssigneeEmail] = useState('minh.volunteer@gmail.com');
  const [assigneePhone, setAssigneePhone] = useState('(555) 349-1102');
  const [assigneeNotes, setAssigneeNotes] = useState('Can bring the folding table from my garage');

  // Shift Form
  const [showAddShiftForm, setShowAddShiftForm] = useState(false);
  const [shiftTitle, setShiftTitle] = useState('');
  const [shiftDuty, setShiftDuty] = useState<DutyCategory>('check_in');
  const [shiftStart, setShiftStart] = useState('08:00');
  const [shiftEnd, setShiftEnd] = useState('11:00');
  const [shiftLocation, setShiftLocation] = useState('Main Gate Entrance');
  const [shiftDuties, setShiftDuties] = useState('');
  const [shiftCapacity, setShiftCapacity] = useState(3);
  const [complianceType, setComplianceType] = useState<ComplianceType>('safesport');

  // Goals Form
  const [purpose, setPurpose] = useState(event.goals.purpose);
  const [communityImpact, setCommunityImpact] = useState(event.goals.communityImpact);
  const [fundraisingTarget, setFundraisingTarget] = useState(event.goals.fundraisingTarget);

  const handleCreateNeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!needTitle.trim()) return;

    addEquipmentNeed({
      type: 'equipment',
      title: needTitle.trim(),
      details: needDetails.trim(),
      dueDate: needDueDate,
      dueTime: needDueTime,
      quantityNeeded: needQty,
      unit: needUnit,
      estimatedFmv: needFmv,
      fallbackOption,
      assignedTo: assigneeName.trim() ? {
        name: assigneeName.trim(),
        email: assigneeEmail.trim(),
        phone: assigneePhone.trim(),
        assignedAt: new Date().toISOString(),
        status: 'pending',
        confirmationToken: `confirm-${Date.now().toString(36)}`,
        notes: assigneeNotes
      } : undefined
    });

    setNeedTitle('');
    setNeedDetails('');
    setShowAddNeedForm(false);
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftTitle.trim()) return;

    addShift({
      title: shiftTitle.trim(),
      dutyCategory: shiftDuty,
      startTime: shiftStart,
      endTime: shiftEnd,
      reportLocation: shiftLocation.trim(),
      dutiesDescription: shiftDuties.trim() || 'General volunteer duties',
      capacity: shiftCapacity,
      compliance: STANDARD_COMPLIANCE[complianceType]
    });

    setShiftTitle('');
    setShiftDuties('');
    setShowAddShiftForm(false);
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventGoals({
      purpose,
      communityImpact,
      fundraisingTarget
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* Step Sub-Header Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-3 rounded-2xl border border-amber-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'equipment'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Equipment & Minh&apos;s Table</span>
            <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
              {needs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'shifts'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Volunteer Shifts</span>
            <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
              {shifts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'goals'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Goals & Impact</span>
          </button>
        </div>

        {/* 1-Click Minh Experience Trigger */}
        <button
          type="button"
          onClick={() => setIsMinhModalOpen(true)}
          className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 cursor-pointer transition shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-amber-700" />
          <span>Test Minh&apos;s 1-Click View</span>
        </button>
      </div>

      {/* TAB 1: EQUIPMENT, MONEY & MINH'S ASSIGNMENT */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-chunky text-base font-bold text-slate-800 flex items-center gap-2">
                <span>📦 Support Needs & Equipment Drops</span>
              </h3>
              <p className="text-xs text-slate-500">
                Assign specific gear to people (like Minh) with automated RSVP alerts &amp; fallback release.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddNeedForm(!showAddNeedForm)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddNeedForm ? 'Cancel' : '+ Add Need / Assign Minh'}</span>
            </button>
          </div>

          {/* Add Need Form */}
          {showAddNeedForm && (
            <form onSubmit={handleCreateNeed} className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-300 space-y-3 text-xs animate-in fade-in">
              <div className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Specify Need & Assign to Someone (e.g. Minh)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Item / Equipment Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6-ft Folding Check-in Table"
                    value={needTitle}
                    onChange={e => setNeedTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fair Market Value ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 75"
                    value={needFmv}
                    onChange={e => setNeedFmv(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Details / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Heavy duty table for registration gate. Drop off at Gate 1."
                  value={needDetails}
                  onChange={e => setNeedDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date Due
                  </label>
                  <input
                    type="date"
                    value={needDueDate}
                    onChange={e => setNeedDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Time Due
                  </label>
                  <input
                    type="time"
                    value={needDueTime}
                    onChange={e => setNeedDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Assignee Block (e.g. Minh) */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3 h-3 text-amber-600" />
                    <span>Assign Directly to Someone (Not Yet in Database)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    System will email/SMS them to confirm
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Assignee Name (e.g. Minh)"
                    value={assigneeName}
                    onChange={e => setAssigneeName(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={assigneeEmail}
                    onChange={e => setAssigneeEmail(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Phone (optional)"
                    value={assigneePhone}
                    onChange={e => setAssigneePhone(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                {/* Fallback Option */}
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Fallback Rule if Assignee Declines or Doesn&apos;t Confirm within 48h:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFallbackOption('both')}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                        fallbackOption === 'both'
                          ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      🌟 Both (Alert Organizer + Auto-Release to Public Wishlist)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFallbackOption('alert_organizer')}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                        fallbackOption === 'alert_organizer'
                          ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      📩 Alert Organizer Only
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNeedForm(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Create &amp; Dispatch Alert ➔
                </button>
              </div>
            </form>
          )}

          {/* List of Active Needs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {needs.map(need => {
              const isAssigned = !!need.assignedTo;
              const status = need.assignedTo?.status || 'unassigned';
              const isConfirmed = status === 'confirmed';

              return (
                <div
                  key={need.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isConfirmed
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : isAssigned
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200">
                        {need.type === 'equipment' ? '📦 Equipment' : '💰 Fund'}
                      </span>
                      <h4 className="font-chunky text-sm font-bold text-slate-800 mt-1">
                        {need.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                        {need.details}
                      </p>
                    </div>

                    <div className="text-right">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirmed</span>
                        </span>
                      ) : isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>Pending RSVP</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          Open Need
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Due & FMV */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due: {need.dueDate} at {need.dueTime}</span>
                    </span>
                    {need.estimatedFmv && (
                      <span className="font-bold text-slate-700">
                        IRS FMV: ${need.estimatedFmv}
                      </span>
                    )}
                  </div>

                  {/* Assigned Person Status Bar */}
                  {need.assignedTo && (
                    <div className="mt-2.5 bg-white/90 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>👤 Assigned to:</span>
                          <span className="text-amber-900 font-extrabold">{need.assignedTo.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {need.assignedTo.email} {need.assignedTo.phone && `• ${need.assignedTo.phone}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isConfirmed && (
                          <button
                            type="button"
                            onClick={() => sendNeedReminder(need.id)}
                            className="text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-300 transition cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Remind</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsMinhModalOpen(true)}
                          className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-200 transition cursor-pointer"
                        >
                          RSVP Pass
                        </button>
                      </div>
                    </div>
                  )}

                  {!need.assignedTo && (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const name = prompt('Assign to person name (e.g. Minh):');
                          const email = prompt('Enter their email address:');
                          if (name && email) {
                            assignNeedToPerson(need.id, { name, email });
                          }
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 transition cursor-pointer"
                      >
                        + Assign to Someone
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VOLUNTEER SHIFTS & DUTIES */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-chunky text-base font-bold text-slate-800">
                👥 Volunteer Shift Buildout
              </h3>
              <p className="text-xs text-slate-500">
                Duty categories &amp; standard requirements (USA SafeSport, LAUSD Volunteer Tier II, ServSafe).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddShiftForm(!showAddShiftForm)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddShiftForm ? 'Cancel' : '+ Add Volunteer Shift'}</span>
            </button>
          </div>

          {/* Add Shift Form */}
          {showAddShiftForm && (
            <form onSubmit={handleCreateShift} className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-300 space-y-3 text-xs animate-in fade-in">
              <div className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Build New Volunteer Opportunity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Shift Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Snack Bar Griller"
                    value={shiftTitle}
                    onChange={e => setShiftTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Duty Category *
                  </label>
                  <select
                    value={shiftDuty}
                    onChange={e => setShiftDuty(e.target.value as DutyCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    {DUTY_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Times & Capacity */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={e => setShiftStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={e => setShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Volunteers Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={shiftCapacity}
                    onChange={e => setShiftCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Where to Report & Duties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Where to Report (Gate / Station)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gate 2 Concessions Shack"
                    value={shiftLocation}
                    onChange={e => setShiftLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Duties Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grill burgers, take meal tickets, keep counter clean"
                    value={shiftDuties}
                    onChange={e => setShiftDuties(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Standard Compliance Selector */}
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <label className="block font-bold text-slate-700 mb-1">
                  🛡️ Special Volunteer Requirements (Option B Audit-Ready)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                  {(Object.keys(STANDARD_COMPLIANCE) as ComplianceType[]).map(compKey => {
                    const comp = STANDARD_COMPLIANCE[compKey];
                    return (
                      <button
                        key={compKey}
                        type="button"
                        onClick={() => setComplianceType(compKey)}
                        className={`p-2 rounded-xl border text-left transition flex items-start gap-1.5 cursor-pointer ${
                          complianceType === compKey
                            ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50/50'
                        }`}
                      >
                        <span className="text-base">{comp.badge}</span>
                        <div>
                          <div className="font-bold text-[11px] leading-tight">{comp.title}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{comp.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddShiftForm(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Publish Shift ➔
                </button>
              </div>
            </form>
          )}

          {/* Shifts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shifts.map(shift => {
              const isFull = shift.filledCount >= shift.capacity;
              return (
                <div
                  key={shift.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {DUTY_CATEGORIES.find(d => d.id === shift.dutyCategory)?.icon}{' '}
                        {DUTY_CATEGORIES.find(d => d.id === shift.dutyCategory)?.label}
                      </span>
                      <h4 className="font-chunky text-sm font-bold text-slate-800 mt-1">
                        {shift.title}
                      </h4>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isFull ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {shift.filledCount}/{shift.capacity} Filled
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {shift.dutiesDescription}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{shift.startTime} – {shift.endTime}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{shift.reportLocation}</span>
                    </span>
                  </div>

                  {/* Compliance Badge */}
                  <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200/80 flex items-center gap-1.5 text-[10px]">
                    <span className="text-xs">{shift.compliance.badge}</span>
                    <span className="font-bold text-amber-900">{shift.compliance.title}</span>
                    {shift.compliance.requiresUploadOrId && (
                      <span className="ml-auto text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                        ID / Upload Required
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GOALS & PURPOSE */}
      {activeTab === 'goals' && (
        <form onSubmit={handleSaveGoals} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs animate-in fade-in">
          <div>
            <h3 className="font-chunky text-base font-bold text-slate-800">
              🎯 Goals &amp; Community Impact
            </h3>
            <p className="text-xs text-slate-500">
              Clear goals motivate parents, students, and local sponsors to step up and participate.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Event Purpose / Mission
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Community Impact Statement
            </label>
            <textarea
              rows={2}
              value={communityImpact}
              onChange={e => setCommunityImpact(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Fundraising Target ($)
            </label>
            <input
              type="number"
              value={fundraisingTarget}
              onChange={e => setFundraisingTarget(Number(e.target.value))}
              className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              Save Goals ✓
            </button>
          </div>
        </form>
      )}

      {/* Advance to Step 3 Outcomes Button */}
      <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-white flex items-center justify-between shadow-honey">
        <div>
          <h4 className="font-chunky font-bold text-sm">
            Ready to track post-event outcomes?
          </h4>
          <p className="text-xs text-amber-100">
            Verify volunteer hours, view donations, and issue 501(c)(3) tax letters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCurrentLifecyclePhase('wrapup')}
          className="bg-white text-amber-900 font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-amber-50 transition cursor-pointer text-xs"
        >
          Go to Step 3: Outcomes ➔
        </button>
      </div>

    </div>
  );
};
