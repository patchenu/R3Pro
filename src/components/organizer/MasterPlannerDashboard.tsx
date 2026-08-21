import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubPart, Shift, ItemSlot, TicketTier, TicketType, PaidContractor, ProBonoPledge, ContractorPaymentStatus } from '../../types';
import { 
  BarChart3, Users, DollarSign, ShieldAlert, Sparkles, 
  Plus, Settings, CheckCircle2, ArrowRight, Layers, Store, HeartHandshake,
  Printer, FileSpreadsheet, Search, Filter, ShieldCheck, Award, Share2, AlertTriangle, FileText, Package,
  Edit3, Trash2, Tag, Calendar, MapPin, Radio, AlertCircle, Check, X, Zap, Clock,
  Shirt, ArrowUp, ArrowDown, ArrowUpDown, Briefcase, Building2, FileCheck, CheckSquare
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
  onOpenEventBuilder,
  onOpenGapAnalysis,
  onOpenReports
}) => {
  const { 
    currentEvent, currentOrg, subParts, shifts, itemSlots, ticketTiers,
    registrations, donations, approvalRequests, announcements, updateEvent, toggleCheckIn,
    contractors, proBonoPledges,
    addSubPart, updateSubPart, deleteSubPart, 
    addShift, updateShift, deleteShift, 
    addItemSlot, updateItemSlot, deleteItemSlot,
    createTicketTier, updateTicketTier, deleteTicketTier, reorderTicketTiers,
    addContractor, updateContractor, deleteContractor,
    showToast
  } = useApp();

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [activePlannerTab, setActivePlannerTab] = useState<'overview' | 'volunteers' | 'items' | 'marketing' | 'gaps' | 'vendors' | 'reports'>('overview');

  // Committee & Needs Modals
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<SubPart | null>(null);
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemSlot | null>(null);

  // Sponsor & Ticket Tier Modal State
  const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<TicketTier | null>(null);
  const [tierTitle, setTierTitle] = useState('');
  const [tierType, setTierType] = useState<TicketType>('sponsor_package');
  const [tierPrice, setTierPrice] = useState<number>(500);
  const [tierFmv, setTierFmv] = useState<number>(50);
  const [tierCapacity, setTierCapacity] = useState<number>(5);
  const [tierDescription, setTierDescription] = useState('');
  const [tierPerks, setTierPerks] = useState<string[]>(['Logo on Main Stage', '4 VIP Tickets']);
  const [newPerkInput, setNewPerkInput] = useState('');
  const [tierBoothDimensions, setTierBoothDimensions] = useState('10x10');
  const [tierPowerProvided, setTierPowerProvided] = useState(false);
  const [tierInstantCheckout, setTierInstantCheckout] = useState(true);

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

  // Add / Edit Shift Form State
  const [targetSubPartForShift, setTargetSubPartForShift] = useState<string>(subParts[0]?.id || '');
  const [newShiftTitle, setNewShiftTitle] = useState('');
  const [newShiftDesc, setNewShiftDesc] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('2026-09-19T09:00:00');
  const [newShiftEnd, setNewShiftEnd] = useState('2026-09-19T12:00:00');
  const [newShiftCapacity, setNewShiftCapacity] = useState<number>(4);
  const [newShiftWaiver, setNewShiftWaiver] = useState<boolean>(true);

  // Add / Edit Item Form State
  const [targetSubPartForItem, setTargetSubPartForItem] = useState<string>(subParts[0]?.id || '');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>('Supplies');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(5);
  const [newItemUnit, setNewItemUnit] = useState<string>('boxes');
  const [newItemDropOff, setNewItemDropOff] = useState<string>('Main Gate');
  const [newItemDeadline, setNewItemDeadline] = useState<string>('Saturday 8:30 AM');
  const [newItemFmv, setNewItemFmv] = useState<number>(25);

  // Paid Contractor & Service Provider Modal State
  const [isAddContractorModalOpen, setIsAddContractorModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<PaidContractor | null>(null);
  const [contractorBusinessName, setContractorBusinessName] = useState('');
  const [contractorContactName, setContractorContactName] = useState('');
  const [contractorEmail, setContractorEmail] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorCategory, setContractorCategory] = useState('Audio / Visual & DJ');
  const [contractorAmount, setContractorAmount] = useState<number>(500);
  const [contractorSubPartId, setContractorSubPartId] = useState<string>(subParts[0]?.id || '');
  const [contractorW9, setContractorW9] = useState(false);
  const [contractorCoi, setContractorCoi] = useState(false);
  const [contractorStatus, setContractorStatus] = useState<ContractorPaymentStatus>('contract_signed');
  const [contractorInvoiceNum, setContractorInvoiceNum] = useState('');
  const [contractorNotes, setContractorNotes] = useState('');

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
    setEditingShift(null);
    setTargetSubPartForShift(preselectedSubPartId || subParts[0]?.id || '');
    setNewShiftTitle('');
    setNewShiftDesc('');
    setNewShiftStart('2026-09-19T09:00:00');
    setNewShiftEnd('2026-09-19T12:00:00');
    setNewShiftCapacity(4);
    setNewShiftWaiver(true);
    setIsAddShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setTargetSubPartForShift(shift.subPartId);
    setNewShiftTitle(shift.title);
    setNewShiftDesc(shift.description || '');
    setNewShiftStart(shift.startTime);
    setNewShiftEnd(shift.endTime);
    setNewShiftCapacity(shift.capacity);
    setNewShiftWaiver(shift.requiresWaiver);
    setIsAddShiftModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftTitle.trim() || !targetSubPartForShift) return;

    if (editingShift) {
      updateShift(editingShift.id, {
        subPartId: targetSubPartForShift,
        title: newShiftTitle.trim(),
        description: newShiftDesc.trim(),
        startTime: newShiftStart,
        endTime: newShiftEnd,
        capacity: Number(newShiftCapacity) || 1,
        requiresWaiver: newShiftWaiver
      });
    } else {
      addShift({
        eventId: currentEvent.id,
        subPartId: targetSubPartForShift,
        title: newShiftTitle.trim(),
        description: newShiftDesc.trim(),
        startTime: newShiftStart,
        endTime: newShiftEnd,
        capacity: Number(newShiftCapacity) || 1,
        requiresWaiver: newShiftWaiver
      });
    }

    setIsAddShiftModalOpen(false);
  };

  const handleDeleteShift = (shiftId: string) => {
    if (confirm('Are you sure you want to remove this volunteer shift?')) {
      deleteShift(shiftId);
      setIsAddShiftModalOpen(false);
    }
  };

  const handleOpenAddItem = (preselectedSubPartId?: string) => {
    setEditingItem(null);
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

  const handleOpenEditItem = (item: ItemSlot) => {
    setEditingItem(item);
    setTargetSubPartForItem(item.subPartId);
    setNewItemName(item.itemName);
    setNewItemCategory(item.category);
    setNewItemQuantity(item.quantityNeeded);
    setNewItemUnit(item.unit);
    setNewItemDropOff(item.dropOffLocation || 'Main Gate');
    setNewItemDeadline(item.dropOffDeadline || 'Saturday Morning');
    setNewItemFmv(item.estimatedFmvPerUnit || 25);
    setIsAddItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !targetSubPartForItem) return;

    if (editingItem) {
      updateItemSlot(editingItem.id, {
        subPartId: targetSubPartForItem,
        itemName: newItemName.trim(),
        category: newItemCategory,
        quantityNeeded: Number(newItemQuantity) || 1,
        unit: newItemUnit.trim(),
        dropOffLocation: newItemDropOff.trim(),
        dropOffDeadline: newItemDeadline.trim(),
        estimatedFmvPerUnit: Number(newItemFmv) || 0
      });
    } else {
      addItemSlot({
        eventId: currentEvent.id,
        subPartId: targetSubPartForItem,
        itemName: newItemName.trim(),
        category: newItemCategory,
        quantityNeeded: Number(newItemQuantity) || 1,
        unit: newItemUnit.trim(),
        dropOffLocation: newItemDropOff.trim(),
        dropOffDeadline: newItemDeadline.trim(),
        estimatedFmvPerUnit: Number(newItemFmv) || 0
      });
    }

    setIsAddItemModalOpen(false);
  };

  const handleDeleteItemSlot = (itemId: string) => {
    if (confirm('Are you sure you want to remove this supply wishlist item?')) {
      deleteItemSlot(itemId);
      setIsAddItemModalOpen(false);
    }
  };

  // Sponsor & Ticket Tier Handlers
  const handleOpenAddTier = (defaultType: TicketType = 'sponsor_package') => {
    setEditingTier(null);
    setTierTitle('');
    setTierType(defaultType);
    setTierPrice(defaultType === 'sponsor_package' ? 1000 : defaultType === 'vendor_booth' ? 150 : 25);
    setTierFmv(defaultType === 'sponsor_package' ? 100 : 0);
    setTierCapacity(defaultType === 'sponsor_package' ? 4 : defaultType === 'vendor_booth' ? 12 : 200);
    setTierDescription(
      defaultType === 'sponsor_package' 
        ? 'Prominent recognition across main entrance banner, student programs, and website.'
        : defaultType === 'vendor_booth'
        ? 'Reserved 10x10 space in festival courtyard with 1 table and 2 chairs.'
        : 'General admission wristband for games and activities.'
    );
    setTierPerks(
      defaultType === 'sponsor_package' 
        ? ['Main Stage Banner Recognition', '4 VIP Wristbands', 'Program Logo Placement']
        : defaultType === 'vendor_booth'
        ? ['10x10 Footprint', '1 Table + 2 Chairs', 'Access to 1,500+ Attendees']
        : ['Full Day Access']
    );
    setTierBoothDimensions(defaultType === 'vendor_booth' ? '10x10' : '');
    setTierPowerProvided(false);
    setTierInstantCheckout(defaultType !== 'vendor_booth');
    setIsAddTierModalOpen(true);
  };

  const handleOpenEditTier = (tier: TicketTier) => {
    setEditingTier(tier);
    setTierTitle(tier.title);
    setTierType(tier.type);
    setTierPrice(tier.price);
    setTierFmv(tier.fairMarketValue);
    setTierCapacity(tier.capacity);
    setTierDescription(tier.description);
    setTierPerks([...tier.perks]);
    setTierBoothDimensions(tier.boothDimensions || '');
    setTierPowerProvided(!!tier.powerProvided);
    setTierInstantCheckout(tier.instantCheckout);
    setIsAddTierModalOpen(true);
  };

  const handleAddTierPerk = () => {
    if (!newPerkInput.trim()) return;
    setTierPerks([...tierPerks, newPerkInput.trim()]);
    setNewPerkInput('');
  };

  const handleRemoveTierPerk = (index: number) => {
    setTierPerks(tierPerks.filter((_, idx) => idx !== index));
  };

  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tierTitle.trim()) return;

    if (editingTier) {
      updateTicketTier(editingTier.id, {
        title: tierTitle.trim(),
        type: tierType,
        price: Number(tierPrice) || 0,
        fairMarketValue: Number(tierFmv) || 0,
        capacity: Number(tierCapacity) || 1,
        description: tierDescription.trim(),
        perks: tierPerks,
        boothDimensions: tierType === 'vendor_booth' ? tierBoothDimensions.trim() : undefined,
        powerProvided: tierType === 'vendor_booth' ? tierPowerProvided : undefined,
        instantCheckout: tierInstantCheckout
      });
    } else {
      createTicketTier({
        eventId: currentEvent.id,
        title: tierTitle.trim(),
        type: tierType,
        price: Number(tierPrice) || 0,
        fairMarketValue: Number(tierFmv) || 0,
        capacity: Number(tierCapacity) || 1,
        description: tierDescription.trim(),
        perks: tierPerks,
        boothDimensions: tierType === 'vendor_booth' ? tierBoothDimensions.trim() : undefined,
        powerProvided: tierType === 'vendor_booth' ? tierPowerProvided : undefined,
        instantCheckout: tierInstantCheckout
      });
    }

    setIsAddTierModalOpen(false);
  };

  const handleDeleteTier = (tierId: string) => {
    if (confirm('Are you sure you want to delete this sponsor package / ticket tier?')) {
      deleteTicketTier(tierId);
      setIsAddTierModalOpen(false);
    }
  };

  const handleMoveTier = (tierId: string, direction: 'up' | 'down') => {
    const currentIdx = ticketTiers.findIndex(t => t.id === tierId);
    if (currentIdx === -1) return;
    if (direction === 'up' && currentIdx === 0) return;
    if (direction === 'down' && currentIdx === ticketTiers.length - 1) return;

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    const newTiers = [...ticketTiers];
    const [moved] = newTiers.splice(currentIdx, 1);
    newTiers.splice(targetIdx, 0, moved);
    reorderTicketTiers(newTiers);
  };

  const handleSortTiers = (order: 'high_to_low' | 'low_to_high') => {
    const sorted = [...ticketTiers].sort((a, b) => 
      order === 'high_to_low' ? b.price - a.price : a.price - b.price
    );
    reorderTicketTiers(sorted);
    showToast('info', 'Tiers Sorted', order === 'high_to_low' ? 'Sorted highest to lowest in cost.' : 'Sorted lowest to highest in cost.');
  };

  // Paid Contractor Handlers
  const handleOpenAddContractor = (subPartId?: string) => {
    setEditingContractor(null);
    setContractorBusinessName('');
    setContractorContactName('');
    setContractorEmail('');
    setContractorPhone('');
    setContractorCategory('Audio / Visual & DJ');
    setContractorAmount(500);
    setContractorSubPartId(subPartId || subParts[0]?.id || '');
    setContractorW9(false);
    setContractorCoi(false);
    setContractorStatus('contract_signed');
    setContractorInvoiceNum('');
    setContractorNotes('');
    setIsAddContractorModalOpen(true);
  };

  const handleOpenEditContractor = (c: PaidContractor) => {
    setEditingContractor(c);
    setContractorBusinessName(c.businessName);
    setContractorContactName(c.contactName);
    setContractorEmail(c.email);
    setContractorPhone(c.phone);
    setContractorCategory(c.serviceCategory);
    setContractorAmount(c.contractAmount);
    setContractorSubPartId(c.subPartId);
    setContractorW9(c.w9Received);
    setContractorCoi(c.coiReceived);
    setContractorStatus(c.paymentStatus);
    setContractorInvoiceNum(c.invoiceNumber || '');
    setContractorNotes(c.notes || '');
    setIsAddContractorModalOpen(true);
  };

  const handleSaveContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorBusinessName.trim() || !contractorContactName.trim() || contractorAmount <= 0) {
      showToast('error', 'Missing Information', 'Please provide business name, contact name, and fee amount.');
      return;
    }

    if (editingContractor) {
      updateContractor(editingContractor.id, {
        businessName: contractorBusinessName.trim(),
        contactName: contractorContactName.trim(),
        email: contractorEmail.trim(),
        phone: contractorPhone.trim(),
        serviceCategory: contractorCategory,
        contractAmount: Number(contractorAmount),
        subPartId: contractorSubPartId,
        w9Received: contractorW9,
        coiReceived: contractorCoi,
        paymentStatus: contractorStatus,
        invoiceNumber: contractorInvoiceNum.trim() || undefined,
        notes: contractorNotes.trim() || undefined
      });
    } else {
      addContractor({
        eventId: currentEvent.id,
        subPartId: contractorSubPartId,
        businessName: contractorBusinessName.trim(),
        contactName: contractorContactName.trim(),
        email: contractorEmail.trim(),
        phone: contractorPhone.trim(),
        serviceCategory: contractorCategory,
        contractAmount: Number(contractorAmount),
        w9Received: contractorW9,
        coiReceived: contractorCoi,
        paymentStatus: contractorStatus,
        invoiceNumber: contractorInvoiceNum.trim() || undefined,
        notes: contractorNotes.trim() || undefined
      });
    }

    setIsAddContractorModalOpen(false);
  };

  const handleDeleteContractor = (contractorId: string) => {
    if (confirm('Are you sure you want to remove this contractor? The fee will be credited back to the department budget.')) {
      deleteContractor(contractorId);
      setIsAddContractorModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. LIFECYCLE STAGE & COMMAND HEADER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 space-y-6">
        
        {/* Top Meta Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-500/30">
                Event Chair Command Center
              </span>
              <span className="text-xs text-slate-400">
                Host: <strong>{currentOrg.name}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
              {currentEvent.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {currentEvent.tagline || 'Manage your campaign lifecycle, department committees, volunteer rosters, and commercial sponsors.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActivePlannerTab('reports')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3.5 rounded-xl text-xs border border-white/20 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badges & Reports</span>
            </button>

            <button
              onClick={() => onOpenEventBuilder?.()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-md transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Event Settings</span>
            </button>
          </div>
        </div>

        {/* Lifecycle Stage Progress Indicator */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
            <span className="text-white uppercase tracking-wider">Campaign Lifecycle: Phase 2 of 4</span>
            <span className="text-indigo-400">Active Recruitment & Commercial Sales</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-center">
              <span className="block text-[10px] font-extrabold text-emerald-400">✓ Phase 1</span>
              <span className="block text-xs font-bold text-white mt-0.5 truncate">Planning & Setup</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-600/60 border border-indigo-400/50 text-center shadow-inner">
              <span className="block text-[10px] font-extrabold text-amber-300">● Phase 2 (Active)</span>
              <span className="block text-xs font-black text-white mt-0.5 truncate">Recruit & Sales</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-slate-400">
              <span className="block text-[10px] font-bold">Phase 3</span>
              <span className="block text-xs font-semibold mt-0.5 truncate">Day-Of Kiosk</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-slate-400">
              <span className="block text-[10px] font-bold">Phase 4</span>
              <span className="block text-xs font-semibold mt-0.5 truncate">Post-Event 990</span>
            </div>
          </div>
        </div>

        {/* 2. ACTION REQUIRED FOCUS QUEUE (COMMAND BY EXCEPTION) */}
        {(pendingApprovalsCount > 0 || shifts.some(s => s.claimedCount < s.capacity * 0.5)) && (
          <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                  Action Required Focus Queue
                </span>
                <p className="text-xs text-slate-200">
                  {pendingApprovalsCount > 0 
                    ? `${pendingApprovalsCount} lead request(s) exceed variable thresholds and await your authorization.` 
                    : 'Critical volunteer shift shortages detected for this weekend.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {pendingApprovalsCount > 0 && (
                <button
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Review Approvals ({pendingApprovalsCount})</span>
                </button>
              )}

              <button
                onClick={() => setActivePlannerTab('gaps')}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition"
              >
                <span>Inspect Shortages &rarr;</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Campaign Progress Thermometer */}
      <Thermometer
        currentAmount={currentEvent.totalRaised}
        goalAmount={currentEvent.fundraisingGoal}
        donorCount={donations.length + registrations.filter(r => r.donations.length > 0).length + 8}
        volunteerFillRate={shiftFillRate}
        currency={currentEvent.currency}
      />

      {/* UNIFIED 4-TAB BENTO NAVIGATION */}
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
          <span>Volunteer Manifest ({allVolunteerRows.length})</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('vendors')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'vendors' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Sponsors & Vendor Tiers ({ticketTiers.length})</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('items')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'items' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>📦 Item Receiving Dock ({itemSlots.filter(i => i.eventId === currentEvent.id).length})</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('marketing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'marketing' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Marketing & Broadcasts</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('gaps')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'gaps' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Gap Analysis</span>
        </button>

        <button
          onClick={() => setActivePlannerTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activePlannerTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports & Badges</span>
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
                Total Budget Allocated: <strong className="text-slate-900">{formatCurrency(totalAllocatedBudget)}</strong> across <strong>{subParts.length} Departments</strong>, <strong>{shifts.length} Volunteer Needs</strong>, and <strong>{ticketTiers.length} Sponsor & Ticket Tiers</strong>.
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

              <button
                onClick={() => handleOpenAddTier('sponsor_package')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs shadow-sm transition"
              >
                <Award className="w-3.5 h-3.5" />
                <span>+ Add Sponsor / Tier</span>
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

                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {deptShifts.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 bg-slate-50/50 rounded-xl text-xs italic">
                            No shifts added yet. Click "+ Add Shift" to post roles.
                          </div>
                        ) : (
                          deptShifts.map(s => (
                            <div key={s.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs hover:border-slate-300 transition group">
                              <div className="flex-1 pr-2">
                                <span className="font-bold text-slate-800 block">{s.title}</span>
                                <span className="text-[10px] text-slate-500">{formatTimeRange(s.startTime, s.endTime)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  s.claimedCount >= s.capacity ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {s.claimedCount}/{s.capacity}
                                </span>
                                <button
                                  onClick={() => handleOpenEditShift(s)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                                  title="Edit Shift"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteShift(s.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                  title="Delete Shift"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
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
                            <span key={i.id} className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg text-[11px] font-medium flex items-center gap-1.5">
                              <span><strong>{i.itemName}</strong> ({i.quantityPledged}/{i.quantityNeeded} {i.unit})</span>
                              <button
                                onClick={() => handleOpenEditItem(i)}
                                className="text-purple-400 hover:text-purple-900"
                                title="Edit Item"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItemSlot(i.id)}
                                className="text-purple-400 hover:text-rose-600"
                                title="Delete Item"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
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

        {/* Corporate Sponsor Packages & Tickets Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <Award className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Corporate Sponsor Packages, Vendor Spaces & Ticket Tiers ({ticketTiers.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage commercial underwriting tiers, booth pitches, and admission wristbands with IRS 501(c)(3) tax deductions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ticketTiers.length > 1 && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 px-1.5 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    <span>Sort:</span>
                  </span>
                  <button
                    onClick={() => handleSortTiers('high_to_low')}
                    className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-[10px] rounded-lg shadow-2xs transition"
                    title="Sort highest to lowest price"
                  >
                    $$$ &rarr; $ High to Low
                  </button>
                  <button
                    onClick={() => handleSortTiers('low_to_high')}
                    className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-[10px] rounded-lg shadow-2xs transition"
                    title="Sort lowest to highest price"
                  >
                    $ &rarr; $$$ Low to High
                  </button>
                </div>
              )}
              <button
                onClick={() => setActivePlannerTab('vendors')}
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                Open Full Sponsor Studio &rarr;
              </button>
              <button
                onClick={() => handleOpenAddTier('sponsor_package')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Package / Tier</span>
              </button>
            </div>
          </div>

          {ticketTiers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700">No Sponsorship Packages Configured Yet</div>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">Add title sponsors or vendor pitches to raise corporate revenue.</p>
              <button
                onClick={() => handleOpenAddTier('sponsor_package')}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Create Sponsor Tier
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ticketTiers.map((tier, idx) => (
                <div
                  key={tier.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 font-mono text-[9px] rounded font-bold">
                          #{idx + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          tier.type === 'sponsor_package' ? 'bg-indigo-100 text-indigo-800' :
                          tier.type === 'vendor_booth' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tier.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Shift Card Position */}
                        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white mr-1">
                          <button
                            onClick={() => handleMoveTier(tier.id, 'up')}
                            disabled={idx === 0}
                            className={`p-1 transition ${
                              idx === 0 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-indigo-700 hover:bg-indigo-50'
                            }`}
                            title="Shift Left / Up"
                          >
                            <ArrowUp className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => handleMoveTier(tier.id, 'down')}
                            disabled={idx === ticketTiers.length - 1}
                            className={`p-1 transition border-l border-slate-200 ${
                              idx === ticketTiers.length - 1 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-indigo-700 hover:bg-indigo-50'
                            }`}
                            title="Shift Right / Down"
                          >
                            <ArrowDown className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleOpenEditTier(tier)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          title="Edit Package"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Package"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900">{tier.title}</h4>
                    <div className="text-lg font-black text-indigo-600 mt-0.5">{formatCurrency(tier.price)}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tier.description}</div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-semibold">{tier.claimedCount} / {tier.capacity} claimed</span>
                    <button
                      onClick={() => handleOpenEditTier(tier)}
                      className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Edit &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HIRED CONTRACTORS & PAID SERVICES (ACCOUNTS PAYABLE) SECTION */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Briefcase className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Accounts Payable & Operational Procurement
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                Hired Contractors & Paid Services
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paid service providers (DJ, Sound Tech, Port-a-Potties, Security, Rentals) automatically debited against committee department budgets.
              </p>
            </div>

            <button
              onClick={() => handleOpenAddContractor()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Hired Contractor</span>
            </button>
          </div>

          {/* Contractors List */}
          {(() => {
            const eventContractors = (contractors || []).filter(c => c.eventId === currentEvent.id);
            const eventProBono = (proBonoPledges || []).filter(p => p.eventId === currentEvent.id);
            const totalContractedSpend = eventContractors.reduce((sum, c) => sum + Number(c.contractAmount), 0);
            const totalProBonoValue = eventProBono.reduce((sum, p) => sum + Number(p.estimatedFmv), 0);

            return (
              <div className="space-y-4">
                {/* Spend Summary Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-semibold">Total Paid Services Spend:</span>
                    <span className="text-sm font-black text-slate-900">{formatCurrency(totalContractedSpend)}</span>
                  </div>
                  <div className="flex items-center justify-between sm:border-l sm:border-slate-200 sm:pl-4">
                    <span className="text-xs text-emerald-700 font-semibold">Pro-Bono Donated Services (FMV):</span>
                    <span className="text-sm font-black text-emerald-700">{formatCurrency(totalProBonoValue)}</span>
                  </div>
                </div>

                {eventContractors.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-700">No paid contractors logged yet</div>
                    <p className="text-[11px] text-slate-500 mt-1">Log hired DJs, sound engineers, tent rentals, and security providers to reconcile department expenses.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventContractors.map(contractor => {
                      const dept = subParts.find(sp => sp.id === contractor.subPartId);
                      return (
                        <div
                          key={contractor.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                                {contractor.serviceCategory}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditContractor(contractor)}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition"
                                  title="Edit Contractor"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteContractor(contractor.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                                  title="Delete Contractor"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="font-extrabold text-sm text-slate-900 mt-2">{contractor.businessName}</h4>
                            <div className="text-lg font-black text-slate-900 mt-0.5">
                              {formatCurrency(contractor.contractAmount)}
                            </div>
                            
                            <div className="text-xs text-slate-600 mt-1">
                              Contact: <strong>{contractor.contactName}</strong> • {contractor.phone || contractor.email}
                            </div>
                            
                            {dept && (
                              <div className="text-[11px] text-indigo-700 font-semibold mt-1">
                                Committee: {dept.name}
                              </div>
                            )}

                            {contractor.notes && (
                              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic bg-slate-50 p-2 rounded-lg">
                                "{contractor.notes}"
                              </p>
                            )}

                            {/* Compliance & Status Badges */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                contractor.w9Received ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {contractor.w9Received ? '✓ W-9 on file' : '✗ W-9 Needed'}
                              </span>
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                contractor.coiReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {contractor.coiReceived ? '✓ COI Verified' : '⚠ COI Pending'}
                              </span>
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                contractor.paymentStatus === 'paid_in_full' ? 'bg-emerald-100 text-emerald-800' :
                                contractor.paymentStatus === 'invoice_received' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                Status: {contractor.paymentStatus.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="font-mono text-slate-500">{contractor.invoiceNumber || 'No invoice attached'}</span>
                            <button
                              onClick={() => handleOpenEditContractor(contractor)}
                              className="font-bold text-blue-600 hover:text-blue-800"
                            >
                              Update Status &rarr;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pro-Bono In-Kind Services Overview */}
                {eventProBono.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" />
                      <span>Pro-Bono In-Kind Professional Service Donations ({eventProBono.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eventProBono.map(pb => (
                        <div key={pb.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-extrabold text-slate-900 block">{pb.businessName}</span>
                            <span className="text-[11px] text-slate-600">{pb.serviceDescription}</span>
                            <span className="text-[10px] font-mono text-emerald-800 block mt-0.5">{pb.inKindReceiptNumber}</span>
                          </div>
                          <div className="text-right shrink-0 pl-3">
                            <span className="text-sm font-black text-emerald-700 block">{formatCurrency(pb.estimatedFmv)}</span>
                            <span className="text-[10px] font-bold text-emerald-800">501(c)(3) FMV</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })()}
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

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-purple-600" />
                    <span>Department Attire & Gear Instructions</span>
                  </label>
                  {currentEvent.dressCode && (
                    <button
                      type="button"
                      onClick={() => setDeptDressCode(currentEvent.dressCode || '')}
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline"
                    >
                      Inherit Global Attire ({currentEvent.dressCode})
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={deptDressCode}
                  onChange={(e) => setDeptDressCode(e.target.value)}
                  placeholder="e.g. Wear closed-toe shoes, durable pants, volunteer t-shirt"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">+ Quick Add Gear:</span>
                  {[
                    '+ Apron & Hairnet (provided)',
                    '+ Heavy Work Gloves & Boots',
                    '+ Sun Hat & Sunscreen',
                    '+ Black Slacks & Non-Slip Shoes',
                    '+ Safety Vest (provided)'
                  ].map((gear, gIdx) => (
                    <button
                      key={gIdx}
                      type="button"
                      onClick={() => {
                        const item = gear.replace('+ ', '');
                        setDeptDressCode(prev => prev ? `${prev}, ${item}` : item);
                      }}
                      className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-md text-[10px] font-semibold transition"
                    >
                      {gear}
                    </button>
                  ))}
                </div>
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

      {/* MODAL 2: ADD / EDIT VOLUNTEER SHIFT NEED */}
      {isAddShiftModalOpen && (
        <Modal
          isOpen={isAddShiftModalOpen}
          onClose={() => setIsAddShiftModalOpen(false)}
          title={editingShift ? `Edit Shift: ${editingShift.title}` : "Add Volunteer Shift Need"}
          subtitle={editingShift ? "Modify shift hours, capacity, and legal waiver requirements" : "Publish a new shift slot for community volunteers"}
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

            {/* Quick Shift Time Slot Presets */}
            <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Quick Shift Time Slot Presets:
                </span>
                <span className="text-[10px] text-indigo-700 font-semibold">1-Tap Apply</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '🌅 Morning (8am - 11am)', start: '08:00', end: '11:00' },
                  { label: '☀️ Midday (11am - 2pm)', start: '11:00', end: '14:00' },
                  { label: '🌤️ Afternoon (2pm - 5pm)', start: '14:00', end: '17:00' },
                  { label: '🌙 Evening (5pm - 8pm)', start: '17:00', end: '20:00' },
                  { label: '⏱️ Full Event', start: '09:00', end: '17:00' },
                ].map((preset, pIdx) => {
                  const day = currentEvent?.startDate ? currentEvent.startDate.slice(0, 10) : '2026-09-19';
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        setNewShiftStart(`${day}T${preset.start}:00`);
                        setNewShiftEnd(`${day}T${preset.end}:00`);
                      }}
                      className="px-2.5 py-1 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-900 rounded-lg text-[11px] font-semibold transition shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Shift Start Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={newShiftStart}
                  onChange={(e) => setNewShiftStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Shift End Time</span>
                </label>
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

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              {editingShift ? (
                <button
                  type="button"
                  onClick={() => handleDeleteShift(editingShift.id)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Shift</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
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
                  <span>{editingShift ? 'Save Shift Changes' : 'Publish Shift Need'}</span>
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: ADD / EDIT SUPPLY WISHLIST NEED */}
      {isAddItemModalOpen && (
        <Modal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          title={editingItem ? `Edit Supply Need: ${editingItem.itemName}` : "Add Supply & Equipment Wishlist Need"}
          subtitle={editingItem ? "Update requested quantities, drop-off location, or valuation" : "Request physical goods donations and in-kind equipment from community members"}
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

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              {editingItem ? (
                <button
                  type="button"
                  onClick={() => handleDeleteItemSlot(editingItem.id)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Item</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
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
                  <span>{editingItem ? 'Save Item Changes' : 'Publish Wishlist Need'}</span>
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: ADD / EDIT SPONSOR PACKAGE OR TICKET TIER */}
      {isAddTierModalOpen && (
        <Modal
          isOpen={isAddTierModalOpen}
          onClose={() => setIsAddTierModalOpen(false)}
          title={editingTier ? `Edit Package: ${editingTier.title}` : 'Create Sponsor Package or Ticket Tier'}
          subtitle="Configure pricing, statutory IRS tax deduction offsets, capacity, and promotional perks"
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveTier} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Package or Tier Title *</label>
                <input
                  type="text"
                  required
                  value={tierTitle}
                  onChange={(e) => setTierTitle(e.target.value)}
                  placeholder="e.g. Diamond Title Presenting Sponsor, Artisan Food Tent, All-Day Wristband..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tier Classification *</label>
                <select
                  value={tierType}
                  onChange={(e) => setTierType(e.target.value as TicketType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="sponsor_package">💎 Corporate / Family Sponsor Package</option>
                  <option value="vendor_booth">🏬 Commercial / Artisan Vendor Booth</option>
                  <option value="admission_ticket">🎟️ Admission Ticket / Activity Pass</option>
                  <option value="raffle">🎟️ Raffle / Drawing Entry</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Available Capacity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={tierCapacity}
                  onChange={(e) => setTierCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Price ($ USD) *</label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={tierPrice}
                    onChange={(e) => setTierPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  IRS Fair Market Value (FMV) ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={tierFmv}
                    onChange={(e) => setTierFmv(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Value of goods/meals received (deducted from tax receipt)
                </span>
              </div>

              {tierType === 'vendor_booth' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Booth Space Dimensions</label>
                    <input
                      type="text"
                      value={tierBoothDimensions}
                      onChange={(e) => setTierBoothDimensions(e.target.value)}
                      placeholder="e.g. 10x10 Tent, 30ft Food Truck"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="tierPowerCheck"
                      checked={tierPowerProvided}
                      onChange={(e) => setTierPowerProvided(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <label htmlFor="tierPowerCheck" className="font-bold text-slate-700 cursor-pointer">
                      Electric power drop included (110V / 220V)
                    </label>
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Public Description</label>
                <textarea
                  rows={2}
                  value={tierDescription}
                  onChange={(e) => setTierDescription(e.target.value)}
                  placeholder="Describe the opportunity, visibility benefits, or attendee permissions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>

              {/* Perks & Inclusions Builder */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block font-bold text-slate-700">Package Perks & Inclusions (Bullet Points)</label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPerkInput}
                    onChange={(e) => setNewPerkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTierPerk();
                      }
                    }}
                    placeholder="e.g. Dedicated Logo on Stage, 4 VIP passes, Social Media Mention..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddTierPerk}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                  >
                    + Add Perk
                  </button>
                </div>

                {/* Current Perks List */}
                <div className="space-y-1.5 pt-1">
                  {tierPerks.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                      <span className="text-slate-800 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {perk}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTierPerk(pIdx)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="plannerInstantCheckoutCheck"
                  checked={tierInstantCheckout}
                  onChange={(e) => setTierInstantCheckout(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="plannerInstantCheckoutCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Enable Instant Self-Service Checkout (If unchecked, requires organizer review)
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              {editingTier ? (
                <button
                  type="button"
                  onClick={() => handleDeleteTier(editingTier.id)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Package</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTierModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingTier ? 'Save Package Changes' : 'Publish Package Tier'}</span>
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* HIRED CONTRACTOR MODAL */}
      {isAddContractorModalOpen && (
        <Modal
          isOpen={isAddContractorModalOpen}
          onClose={() => setIsAddContractorModalOpen(false)}
          title={editingContractor ? 'Edit Hired Contractor & Terms' : 'Log New Hired Contractor / Service Provider'}
          subtitle={`${currentEvent.title} • Accounts Payable & Operational Procurement`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveContractor} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Department Budget Integration:</strong> Hired contractor fees automatically debit against the assigned committee's budget ({formatCurrency(subParts.find(sp => sp.id === contractorSubPartId)?.budgetAllocated || 0)} allocated).
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business / Provider Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={contractorBusinessName}
                    onChange={(e) => setContractorBusinessName(e.target.value)}
                    placeholder="e.g. SoundWave Stage & Lighting LLC"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={contractorContactName}
                  onChange={(e) => setContractorContactName(e.target.value)}
                  placeholder="e.g. Mike Henderson"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contractorEmail}
                  onChange={(e) => setContractorEmail(e.target.value)}
                  placeholder="mike@soundwavelighting.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={contractorPhone}
                  onChange={(e) => setContractorPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Category *</label>
                <select
                  value={contractorCategory}
                  onChange={(e) => setContractorCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Audio / Visual & DJ">🎵 Audio / Visual, Sound & DJ</option>
                  <option value="Waste & Sanitation">🚻 Waste Management & Portable Restrooms</option>
                  <option value="Security & Safety">🛡️ Private Security & Crossing Guards</option>
                  <option value="Tent & Equipment Rental">🎪 Tents, Canopies & Staging</option>
                  <option value="Catering & Hospitality">☕ Catering & Food Service</option>
                  <option value="Entertainment & Performers">🎭 Live Bands, Magicians & Performers</option>
                  <option value="Photography & Media">📸 Professional Photography / Video</option>
                  <option value="Other">💼 Other Contracted Service</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contract Fee Amount ($ USD) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    step="10"
                    required
                    value={contractorAmount}
                    onChange={(e) => setContractorAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Committee / Department Scope *</label>
                <select
                  value={contractorSubPartId}
                  onChange={(e) => setContractorSubPartId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {subParts.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name} (${sp.budgetAllocated} Budget)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment & Invoice Status</label>
                <select
                  value={contractorStatus}
                  onChange={(e) => setContractorStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="draft">Draft / Inquiry</option>
                  <option value="contract_signed">Contract Signed / Booked</option>
                  <option value="invoice_received">Invoice Received (Pending Payment)</option>
                  <option value="paid_in_full">Paid in Full & Reconciled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={contractorInvoiceNum}
                  onChange={(e) => setContractorInvoiceNum(e.target.value)}
                  placeholder="e.g. INV-9482"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium"
                />
              </div>

              {/* Compliance Checkboxes */}
              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contractorW9}
                    onChange={(e) => setContractorW9(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">W-9 Received</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contractorCoi}
                    onChange={(e) => setContractorCoi(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">COI Verified</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Contract Scope Notes & Equipment Deliverables</label>
                <textarea
                  rows={2}
                  value={contractorNotes}
                  onChange={(e) => setContractorNotes(e.target.value)}
                  placeholder="e.g. Delivering 4 speakers, sound board, 2 wired mics at 7:30 AM East Gate..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              {editingContractor ? (
                <button
                  type="button"
                  onClick={() => handleDeleteContractor(editingContractor.id)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Contractor</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContractorModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{editingContractor ? 'Save Contractor Changes' : 'Log Contractor & Debit Budget'}</span>
                </button>
              </div>
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
