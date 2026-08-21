import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubPart, Shift, ItemSlot } from '../../types';
import { 
  BarChart3, Users, DollarSign, ShieldAlert, Sparkles, 
  Plus, Settings, CheckCircle2, ArrowRight, Layers, Store, HeartHandshake,
  Printer, FileSpreadsheet, Search, Filter, ShieldCheck, Award, Share2, AlertTriangle, FileText, Package,
  Edit3, Trash2, Tag, Calendar, MapPin, Radio, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatTimeRange } from '../../utils/formatters';
import { exportRosterToCsv } from '../../utils/exportCsv';
import { printVolunteerRosterHtml, printNameBadgesHtml, printStudentServiceLetterHtml } from '../../utils/exportPdf';
import { Thermometer } from '../common/Thermometer';
import { Modal } from '../common/Modal';
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
  const { 
    currentEvent, currentOrg, subParts, shifts, itemSlots, 
    registrations, donations, approvalRequests, toggleCheckIn,
    addSubPart, updateSubPart, deleteSubPart, addShift, addItemSlot 
  } = useApp();

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [activePlannerTab, setActivePlannerTab] = useState<'overview' | 'volunteers' | 'items' | 'marketing' | 'gaps' | 'vendors' | 'reports'>('overview');

  // Committee & Needs Modals
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<SubPart | null>(null);
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Add / Edit SubPart Form State
  const [deptName, setDeptName] = useState('');
  const [deptCategory, setDeptCategory] = useState<SubPart['category']>('general_support' as any);
  const [deptLeadName, setDeptLeadName] = useState('');
  const [deptLeadPhone, setDeptLeadPhone] = useState('');
  const [deptLeadEmail, setDeptLeadEmail] = useState('');
  const [deptRadio, setDeptRadio] = useState('');
  const [deptBudget, setDeptBudget] = useState<number>(500);
  const [deptGate, setDeptGate] = useState('');
  const [deptDressCode, setDeptDressCode] = useState('');
  const [deptSupplies, setDeptSupplies] = useState('');

  // Add Shift Form State
  const [targetSubPartForShift, setTargetSubPartForShift] = useState<string>(subParts[0]?.id || '');
  const [newShiftTitle, setNewShiftTitle] = useState('');
  const [newShiftDesc, setNewShiftDesc] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('2026-09-19T09:00:00');
  const [newShiftEnd, setNewShiftEnd] = useState('2026-09-19T12:00:00');
  const [newShiftCapacity, setNewShiftCapacity] = useState<number>(4);
  const [newShiftWaiver, setNewShiftWaiver] = useState<boolean>(true);

  // Add Item Form State
  const [targetSubPartForItem, setTargetSubPartForItem] = useState<string>(subParts[0]?.id || '');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>('Supplies');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(5);
  const [newItemUnit, setNewItemUnit] = useState<string>('boxes');
  const [newItemDropOff, setNewItemDropOff] = useState<string>('Main Gate');
  const [newItemDeadline, setNewItemDeadline] = useState<string>('Saturday 8:30 AM');
  const [newItemFmv, setNewItemFmv] = useState<number>(25);

  // Volunteer Management Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubPartId, setSelectedSubPartId] = useState<string>('all');
  const [checkInFilter, setCheckInFilter] = useState<'all' | 'checked_in' | 'pending'>('all');

  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;

  const totalCap = shifts.reduce((sum, s) => sum + s.capacity, 0);
  const totalClaimed = shifts.reduce((sum, s) => sum + s.claimedCount, 0);
  const shiftFillRate = formatPercentage(totalClaimed, totalCap);
  const totalAllocatedBudget = subParts.reduce((sum, sp) => sum + sp.budgetAllocated, 0);

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

  const checkedInCount = allVolunteerRows.filter(r => r.claim.checkedIn).length;

  // Handlers for Committee & Needs Modals
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCategory('general_support' as any);
    setDeptLeadName(currentOrg.signatoryOfficerName || 'Committee Chair');
    setDeptLeadPhone('(555) 234-8900');
    setDeptLeadEmail(currentOrg.contactEmail || 'chair@org.org');
    setDeptRadio('Channel 1');
    setDeptBudget(500);
    setDeptGate('North Gate Desk #1');
    setDeptDressCode('Casual / Volunteer T-Shirt');
    setDeptSupplies('Check-in clipboards and nametags provided');
    setIsAddDeptModalOpen(true);
  };

  const handleOpenEditDept = (sp: SubPart) => {
    setEditingDept(sp);
    setDeptName(sp.name);
    setDeptCategory(sp.category);
    setDeptLeadName(sp.leadName);
    setDeptLeadPhone(sp.leadPhone);
    setDeptLeadEmail(sp.leadEmail);
    setDeptRadio(sp.leadRadioChannel || 'Channel 1');
    setDeptBudget(sp.budgetAllocated);
    setDeptGate(sp.reportingGate);
    setDeptDressCode(sp.dressCodeNotes || '');
    setDeptSupplies(sp.suppliesNotes || '');
    setIsAddDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    if (editingDept) {
      updateSubPart(editingDept.id, {
        name: deptName,
        category: deptCategory,
        leadName: deptLeadName,
        leadPhone: deptLeadPhone,
        leadEmail: deptLeadEmail,
        leadRadioChannel: deptRadio,
        budgetAllocated: Number(deptBudget) || 0,
        reportingGate: deptGate,
        dressCodeNotes: deptDressCode,
        suppliesNotes: deptSupplies
      });
    } else {
      addSubPart({
        eventId: currentEvent.id,
        name: deptName,
        category: deptCategory,
        leadUserId: 'user_' + Date.now(),
        leadName: deptLeadName,
        leadPhone: deptLeadPhone,
        leadEmail: deptLeadEmail,
        leadRadioChannel: deptRadio,
        budgetAllocated: Number(deptBudget) || 0,
        reportingGate: deptGate,
        dressCodeNotes: deptDressCode,
        suppliesNotes: deptSupplies
      });
    }

    setIsAddDeptModalOpen(false);
  };

  const handleDeleteDept = (subPartId: string) => {
    if (confirm('Are you sure you want to remove this committee department and its shifts?')) {
      deleteSubPart(subPartId);
      setIsAddDeptModalOpen(false);
    }
  };

  const handleOpenAddShift = (preselectedSubPartId?: string) => {
    setTargetSubPartForShift(preselectedSubPartId || subParts[0]?.id || '');
    setNewShiftTitle('');
    setNewShiftDesc('');
    setNewShiftStart('2026-09-19T09:00:00');
    setNewShiftEnd('2026-09-19T12:00:00');
    setNewShiftCapacity(4);
    setNewShiftWaiver(true);
    setIsAddShiftModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftTitle.trim() || !targetSubPartForShift) return;

    addShift({
      eventId: currentEvent.id,
      subPartId: targetSubPartForShift,
      title: newShiftTitle,
      description: newShiftDesc,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      capacity: Number(newShiftCapacity) || 1,
      requiresWaiver: newShiftWaiver
    });

    setIsAddShiftModalOpen(false);
  };

  const handleOpenAddItem = (preselectedSubPartId?: string) => {
    setTargetSubPartForItem(preselectedSubPartId || subParts[0]?.id || '');
    setNewItemName('');
    setNewItemCategory('Supplies');
    setNewItemQuantity(5);
    setNewItemUnit('boxes');
    setNewItemDropOff('Cafeteria Gate');
    setNewItemDeadline('Saturday 8:30 AM');
    setNewItemFmv(25);
    setIsAddItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !targetSubPartForItem) return;

    addItemSlot({
      eventId: currentEvent.id,
      subPartId: targetSubPartForItem,
      itemName: newItemName,
      category: newItemCategory,
      quantityNeeded: Number(newItemQuantity) || 1,
      unit: newItemUnit,
      dropOffLocation: newItemDropOff,
      dropOffDeadline: newItemDeadline,
      estimatedFmvPerUnit: Number(newItemFmv) || 0
    });

    setIsAddItemModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Event Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
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
          <span>Committees & Budgets ({subParts.length})</span>
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
          
          {/* Top Operational Action Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Event Committee Departments & Operational Needs</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Budget Allocated: <strong className="text-slate-900">{formatCurrency(totalAllocatedBudget)}</strong> across <strong>{subParts.length} Departments</strong> and <strong>{shifts.length} Volunteer Needs</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={handleOpenAddDept}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Committee Department</span>
              </button>

              <button
                onClick={() => handleOpenAddShift()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Shift Need</span>
              </button>

              <button
                onClick={() => handleOpenAddItem()}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Supply Need</span>
              </button>
            </div>
          </div>

          {/* Department Cards Grid or Empty State */}
          {subParts.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-6 shadow-xs">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Layers className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-xl font-black text-slate-900">No Committee Departments Setup Yet</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are starting with a blank slate for this event! Create custom committee operational areas, assign designated Department Leads with allocated budgets, and publish volunteer shifts.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleOpenAddDept}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 px-6 rounded-2xl text-xs shadow-md transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create First Committee Department</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {subParts.map((sp) => {
                const deptShifts = shifts.filter(s => s.subPartId === sp.id);
                const deptItems = itemSlots.filter(i => i.subPartId === sp.id);
                const deptCap = deptShifts.reduce((acc, s) => acc + s.capacity, 0);
                const deptClaimed = deptShifts.reduce((acc, s) => acc + s.claimedCount, 0);
                const deptFill = formatPercentage(deptClaimed, deptCap);

                return (
                  <div
                    key={sp.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition relative flex flex-col justify-between"
                  >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                          {sp.category.replace('_', ' ')}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 mt-1">{sp.name}</h3>
                        <p className="text-xs text-slate-500">
                          Designated Lead: <strong>{sp.leadName}</strong> • {sp.leadPhone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                          deptFill < 50 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {deptFill}% Staffed
                        </span>
                        <button
                          onClick={() => handleOpenEditDept(sp)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          title="Edit Committee Department & Budget"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Shifts & Budget Meters */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Volunteer Staffing</span>
                        <div className="font-extrabold text-slate-900 mt-0.5">{deptClaimed} / {deptCap} spots</div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full ${deptFill < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(deptFill, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Budget Allocation</span>
                        <div className="font-extrabold text-slate-900 mt-0.5">{formatCurrency(sp.budgetSpent)} of {formatCurrency(sp.budgetAllocated)}</div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min((sp.budgetSpent / (sp.budgetAllocated || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Department Shift Needs List */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                          Volunteer Shifts ({deptShifts.length})
                        </span>
                        <button
                          onClick={() => handleOpenAddShift(sp.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Add Shift
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {deptShifts.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 bg-slate-50/50 rounded-xl text-xs italic">
                            No shifts added yet. Click "+ Add Shift" to post roles.
                          </div>
                        ) : (
                          deptShifts.map(s => (
                            <div key={s.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-slate-800 block">{s.title}</span>
                                <span className="text-[10px] text-slate-500">{formatTimeRange(s.startTime, s.endTime)}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                s.claimedCount >= s.capacity ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {s.claimedCount}/{s.capacity} Filled
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Department Supply / Wishlist Needs List */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                          Supply & Equipment Needs ({deptItems.length})
                        </span>
                        <button
                          onClick={() => handleOpenAddItem(sp.id)}
                          className="text-slate-700 hover:text-slate-900 font-bold text-[11px] flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Add Item
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {deptItems.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">No supply items requested.</span>
                        ) : (
                          deptItems.map(i => (
                            <span key={i.id} className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg text-[11px] font-medium">
                              <strong>{i.itemName}</strong> ({i.quantityPledged}/{i.quantityNeeded} {i.unit})
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gate & Action Footer */}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Gate: <strong>{sp.reportingGate}</strong>
                    </span>

                    <button
                      onClick={() => handleOpenEditDept(sp)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                    >
                      Edit Budget & Gate &rarr;
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <select
                value={selectedSubPartId}
                onChange={(e) => setSelectedSubPartId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">All Departments ({subParts.length})</option>
                {subParts.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>

              <select
                value={checkInFilter}
                onChange={(e) => setCheckInFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">All Check-In Statuses</option>
                <option value="checked_in">Checked In ({checkedInCount})</option>
                <option value="pending">Pending Arrival ({allVolunteerRows.length - checkedInCount})</option>
              </select>
            </div>

            {/* Print / Export Suite */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => printVolunteerRosterHtml(currentEvent, currentOrg, registrations, shifts, subParts)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Master Roster</span>
              </button>

              <button
                onClick={() => printNameBadgesHtml(currentEvent, currentOrg, registrations, shifts, subParts)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-sm transition"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Print Lanyards & Badges</span>
              </button>

              <button
                onClick={() => exportRosterToCsv(registrations, shifts, subParts, currentEvent.title)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3.5 rounded-xl text-xs transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>

          </div>

          {/* Volunteer Roster Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Volunteer Attendance & Live Check-In</h3>
                <p className="text-xs text-slate-500">Live roster synchronizing on-site arrivals, signed digital waivers, and student verification certificates</p>
              </div>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl">
                {checkedInCount} of {allVolunteerRows.length} Volunteers Checked In
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 font-bold">Volunteer / Minor</th>
                    <th className="pb-3 font-bold">Department</th>
                    <th className="pb-3 font-bold">Assigned Shift</th>
                    <th className="pb-3 font-bold">Contact</th>
                    <th className="pb-3 font-bold">Waiver Status</th>
                    <th className="pb-3 font-bold">Check-In Status</th>
                    <th className="pb-3 text-right font-bold">Certificates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No volunteers match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map((row, idx) => (
                      <tr key={`${row.regId}_${idx}`} className="hover:bg-slate-50 transition">
                        
                        {/* Name & Minor Tag */}
                        <td className="py-3.5">
                          <strong className="text-slate-900 block font-bold">{row.member?.name}</strong>
                          {row.member?.isMinor && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                              Minor (Age {row.member.age || '14-17'})
                            </span>
                          )}
                        </td>

                        {/* Department */}
                        <td className="py-3.5 text-slate-700 font-medium">
                          {row.subPart?.name || 'General'}
                        </td>

                        {/* Shift Role & Schedule */}
                        <td className="py-3.5">
                          <strong className="text-slate-900 block font-semibold">{row.shift?.title}</strong>
                          <span className="text-[10px] text-slate-500">
                            {row.shift ? formatTimeRange(row.shift.startTime, row.shift.endTime) : 'TBD'}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 text-slate-600 font-mono">
                          {row.member?.phone || row.primaryPhone}
                        </td>

                        {/* Legal Waiver Status */}
                        <td className="py-3.5">
                          {row.waiver ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Signed & Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
                              ⚠️ Waiver Required
                            </span>
                          )}
                        </td>

                        {/* Check-In Toggle */}
                        <td className="py-3.5">
                          <button
                            onClick={() => toggleCheckIn(row.regId, row.claim.shiftId, row.member.id)}
                            className={`px-3 py-1 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                              row.claim.checkedIn
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{row.claim.checkedIn ? 'Checked In ✓' : 'Tap Check-In'}</span>
                          </button>
                        </td>

                        {/* Actions / Certificates */}
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => printStudentServiceLetterHtml(
                              row.member.name,
                              3.0,
                              currentEvent,
                              currentOrg
                            )}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg transition"
                          >
                            Hours Letter
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
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

      {/* TAB 5: GAP ANALYSIS & CAMPAIGN HEALTH */}
      {activePlannerTab === 'gaps' && (
        <GapAnalysisDashboard onOpenBroadcast={() => setActivePlannerTab('marketing')} />
      )}

      {/* TAB 6: VENDORS & SPONSORS */}
      {activePlannerTab === 'vendors' && (
        <VendorMarketplaceManager />
      )}

      {/* TAB 7: REPORTS, BADGES & IRS RECEIPTS */}
      {activePlannerTab === 'reports' && (
        <ReportsExportCenter />
      )}

      {/* MODAL 1: ADD / EDIT COMMITTEE DEPARTMENT */}
      {isAddDeptModalOpen && (
        <Modal
          isOpen={isAddDeptModalOpen}
          onClose={() => setIsAddDeptModalOpen(false)}
          title={editingDept ? `Edit Committee: ${editingDept.name}` : "Create New Committee Department"}
          subtitle="Define operational department scope, lead coordinator, allocated budget, and reporting gate"
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Committee Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Raffle & Silent Auction, Food & Concessions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Category</label>
                <select
                  value={deptCategory}
                  onChange={(e) => setDeptCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="labor_setup">Labor & Physical Setup</option>
                  <option value="hospitality_food">Hospitality & Food Services</option>
                  <option value="vendors_sponsors">Vendor Marketplace & Sponsors</option>
                  <option value="auction_fundraising">Auction & Fundraising Games</option>
                  <option value="registration_greeters">Registration & Door Greeters</option>
                  <option value="other">General Operations</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Allocated Budget ($)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={deptBudget}
                  onChange={(e) => setDeptBudget(Number(e.target.value))}
                  placeholder="500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Lead Details */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                Designated Lead Coordinator
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Lead Full Name *</label>
                  <input
                    type="text"
                    required
                    value={deptLeadName}
                    onChange={(e) => setDeptLeadName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Lead Phone Number</label>
                  <input
                    type="text"
                    value={deptLeadPhone}
                    onChange={(e) => setDeptLeadPhone(e.target.value)}
                    placeholder="(555) 234-8902"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Lead Contact Email</label>
                  <input
                    type="email"
                    value={deptLeadEmail}
                    onChange={(e) => setDeptLeadEmail(e.target.value)}
                    placeholder="lead@org.org"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Radio Channel / Comms</label>
                  <input
                    type="text"
                    value={deptRadio}
                    onChange={(e) => setDeptRadio(e.target.value)}
                    placeholder="Channel 2"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Logistics & Gate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Designated Reporting Gate / Location *</label>
                <input
                  type="text"
                  required
                  value={deptGate}
                  onChange={(e) => setDeptGate(e.target.value)}
                  placeholder="e.g. North Gymnasium Loading Dock, Courtyard Booth #1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dress Code & Uniform Notes</label>
                <textarea
                  rows={2}
                  value={deptDressCode}
                  onChange={(e) => setDeptDressCode(e.target.value)}
                  placeholder="e.g. Wear closed-toe shoes and navy volunteer t-shirt."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Supplies / Tooling Notes</label>
                <textarea
                  rows={2}
                  value={deptSupplies}
                  onChange={(e) => setDeptSupplies(e.target.value)}
                  placeholder="e.g. Event binders, radios, and clipboard check-in sheets provided."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              {editingDept ? (
                <button
                  type="button"
                  onClick={() => handleDeleteDept(editingDept.id)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Department</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingDept ? 'Save Department Changes' : 'Create Committee Department'}</span>
                </button>
              </div>
            </div>

          </form>
        </Modal>
      )}

      {/* MODAL 2: ADD VOLUNTEER SHIFT NEED */}
      {isAddShiftModalOpen && (
        <Modal
          isOpen={isAddShiftModalOpen}
          onClose={() => setIsAddShiftModalOpen(false)}
          title="Add Volunteer Shift Need"
          subtitle="Publish a new shift slot for community volunteers"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Committee Department *</label>
              <select
                value={targetSubPartForShift}
                onChange={(e) => setTargetSubPartForShift(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                {subParts.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Shift Role Title *</label>
              <input
                type="text"
                required
                value={newShiftTitle}
                onChange={(e) => setNewShiftTitle(e.target.value)}
                placeholder="e.g. Master Grill Assistant, Ticket Gate Host..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Description & Responsibilities</label>
              <textarea
                rows={2}
                value={newShiftDesc}
                onChange={(e) => setNewShiftDesc(e.target.value)}
                placeholder="Describe key responsibilities and physical requirements..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Start Time</label>
                <input
                  type="datetime-local"
                  value={newShiftStart}
                  onChange={(e) => setNewShiftStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift End Time</label>
                <input
                  type="datetime-local"
                  value={newShiftEnd}
                  onChange={(e) => setNewShiftEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Volunteers Needed (Capacity)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={newShiftCapacity}
                  onChange={(e) => setNewShiftCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newShiftWaiver}
                    onChange={(e) => setNewShiftWaiver(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Require Digital Legal Waiver</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddShiftModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Shift Need</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: ADD SUPPLY / WISHLIST NEED */}
      {isAddItemModalOpen && (
        <Modal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          title="Add Supply & Equipment Wishlist Need"
          subtitle="Request physical goods donations and in-kind equipment from community members"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Committee Department *</label>
              <select
                value={targetSubPartForItem}
                onChange={(e) => setTargetSubPartForItem(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                {subParts.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Item Description / Name *</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. 10x10 Pop-Up Canopies, Double Chocolate Brownies, Face Paint Kits..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="Supplies">Supplies</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Logistics">Logistics</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity Needed</label>
                <input
                  type="number"
                  min={1}
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit of Measure</label>
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="boxes, trays, tents"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Drop-Off Location / Gate</label>
                <input
                  type="text"
                  value={newItemDropOff}
                  onChange={(e) => setNewItemDropOff(e.target.value)}
                  placeholder="Cafeteria Drop-off Gate"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Drop-Off Deadline</label>
                <input
                  type="text"
                  value={newItemDeadline}
                  onChange={(e) => setNewItemDeadline(e.target.value)}
                  placeholder="Saturday 8:30 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Fair Market Value (FMV) Per Unit ($)</label>
              <input
                type="number"
                min={0}
                value={newItemFmv}
                onChange={(e) => setNewItemFmv(Number(e.target.value))}
                placeholder="25"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Used to pre-calculate In-Kind IRS property contribution tax receipts for donors.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Wishlist Need</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Approval Queue Modal */}
      <ApprovalQueueModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
      />

    </div>
  );
};
