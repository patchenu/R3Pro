import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EVENT_TEMPLATES, EventTemplatePreset } from '../../data/templates';
import { Modal } from '../common/Modal';
import { 
  Sparkles, Calendar, MapPin, DollarSign, Users, 
  Gift, Check, ChevronRight, ChevronLeft, Layers, LayoutTemplate,
  Tag, Plus, X, Copy, History, HelpCircle, Briefcase, Award,
  ShieldCheck, Clock, Package, CheckCircle2, Edit3, Trash2, Radio,
  ArrowUp, ArrowDown, Shirt
} from 'lucide-react';
import { formatCurrency, formatTimeRange } from '../../utils/formatters';

interface EventBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_EVENT_TAGS = [
  'Family Friendly',
  'STEM & Tech',
  'Food & Bake Sale',
  'Carnival & Games',
  'Athletics & Sports',
  'Arts & Music',
  'Charity Gala',
  'Silent Auction',
  'Student Service Hours',
  'Outdoors',
  'Free Admission'
];

interface WizardDepartment {
  name: string;
  category: 'labor_setup' | 'hospitality_food' | 'vendors_sponsors' | 'auction_fundraising' | 'registration_greeters';
  leadUserId?: string;
  leadName: string;
  leadPhone?: string;
  leadEmail?: string;
  leadRadioChannel?: string;
  reportingGate: string;
  dressCodeNotes?: string;
  suppliesNotes?: string;
  budgetAllocated: number;
}

interface WizardShift {
  title: string;
  description: string;
  departmentIndex: number;
  startTime: string;
  endTime: string;
  capacity: number;
  requiresWaiver: boolean;
}

interface WizardItem {
  itemName: string;
  category: string;
  departmentIndex: number;
  quantityNeeded: number;
  unit: string;
  dropOffLocation: string;
  dropOffDeadline: string;
  estimatedFmvPerUnit: number;
}

interface WizardTier {
  title: string;
  type: 'sponsor_package' | 'vendor_booth' | 'admission_ticket' | 'raffle';
  price: number;
  fairMarketValue: number;
  capacity: number;
  instantCheckout: boolean;
  description: string;
  perks: string[];
  boothDimensions?: string;
  powerProvided?: boolean;
}

export const EventBuilderWizard: React.FC<EventBuilderWizardProps> = ({ isOpen, onClose }) => {
  const { createEvent, currentOrg, users, currentUser, events, showToast } = useApp();

  // Wizard Step (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Source Mode & Templates
  const [sourceMode, setSourceMode] = useState<'blueprint' | 'clone_past' | 'blank'>('blueprint');
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplatePreset | null>(EVENT_TEMPLATES[0]);
  const [selectedPastEventId, setSelectedPastEventId] = useState<string>('');

  // Step 2: Campaign Essentials & Global Attire
  const [title, setTitle] = useState(EVENT_TEMPLATES[0]?.title || 'Annual Community Carnival');
  const [tagline, setTagline] = useState(EVENT_TEMPLATES[0]?.tagline || 'Family fun, food, and games supporting our local programs.');
  const [goal, setGoal] = useState(EVENT_TEMPLATES[0]?.defaultGoal || 15000);
  const [venueName, setVenueName] = useState('Lincoln Community High School Grounds');
  const [venueAddress, setVenueAddress] = useState('1420 Lincoln Blvd, Springfield, IL');
  const [startDate, setStartDate] = useState('2026-10-15T09:00:00');
  const [endDate, setEndDate] = useState('2026-10-15T17:00:00');
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80');
  const [eventDressCode, setEventDressCode] = useState('Comfortable casual attire or volunteer shirt (provided)');

  // Step 3: Committee Departments & Leadership
  const [departments, setDepartments] = useState<WizardDepartment[]>([]);

  // Step 4: Volunteer Shifts
  const [shifts, setShifts] = useState<WizardShift[]>([]);

  // Step 5: Wishlist Items
  const [items, setItems] = useState<WizardItem[]>([]);

  // Step 6: Sponsor Packages & Commercial Tiers
  const [tiers, setTiers] = useState<WizardTier[]>([]);

  // Step 7: Discovery Tags & Approval Thresholds
  const [selectedTags, setSelectedTags] = useState<string[]>(['Family Friendly', 'Carnival & Games', 'Student Service Hours']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [thresholdBudget, setThresholdBudget] = useState(250);
  const [thresholdSlots, setThresholdSlots] = useState(5);

  // Modals for editing during wizard
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [editingDeptIdx, setEditingDeptIdx] = useState<number | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptLeadUserId, setDeptLeadUserId] = useState(currentUser.id);
  const [deptLeadName, setDeptLeadName] = useState(currentUser.name);
  const [deptLeadEmail, setDeptLeadEmail] = useState(currentUser.email);
  const [deptLeadPhone, setDeptLeadPhone] = useState(currentUser.phone || '');
  const [deptRadio, setDeptRadio] = useState('Channel 1');
  const [deptGate, setDeptGate] = useState('Gate 1 Main Desk');
  const [deptBudget, setDeptBudget] = useState(400);
  const [deptDressCode, setDeptDressCode] = useState('Comfortable attire');

  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false);
  const [editingShiftIdx, setEditingShiftIdx] = useState<number | null>(null);
  const [shiftTitle, setShiftTitle] = useState('');
  const [shiftDesc, setShiftDesc] = useState('');
  const [shiftDeptIdx, setShiftDeptIdx] = useState(0);
  const [shiftStart, setShiftStart] = useState('2026-10-15T09:00:00');
  const [shiftEnd, setShiftEnd] = useState('2026-10-15T12:00:00');
  const [shiftCap, setShiftCap] = useState(4);
  const [shiftWaiver, setShiftWaiver] = useState(true);

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Supplies');
  const [itemDeptIdx, setItemDeptIdx] = useState(0);
  const [itemQty, setItemQty] = useState(10);
  const [itemUnit, setItemUnit] = useState('boxes');
  const [itemDropOff, setItemDropOff] = useState('Department Desk');
  const [itemDeadline, setItemDeadline] = useState('Saturday 8:00 AM');
  const [itemFmv, setItemFmv] = useState(25);

  const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
  const [editingTierIdx, setEditingTierIdx] = useState<number | null>(null);
  const [tierTitle, setTierTitle] = useState('');
  const [tierType, setTierType] = useState<'sponsor_package' | 'vendor_booth' | 'admission_ticket'>('sponsor_package');
  const [tierPrice, setTierPrice] = useState(1000);
  const [tierFmv, setTierFmv] = useState(150);
  const [tierCap, setTierCap] = useState(5);
  const [tierDesc, setTierDesc] = useState('');
  const [tierPerksInput, setTierPerksInput] = useState('Logo on Main Stage, 4 VIP Passes, Social Media Mention');
  const [tierBoothDim, setTierBoothDim] = useState('10x10');
  const [tierPower, setTierPower] = useState(false);

  const orgPastEvents = events.filter(e => e.orgId === currentOrg.id);

  // Initialize initial state based on template
  React.useEffect(() => {
    if (selectedTemplate && sourceMode === 'blueprint') {
      applyTemplateData(selectedTemplate);
    }
  }, [selectedTemplate, sourceMode]);

  const applyTemplateData = (preset: EventTemplatePreset) => {
    setTitle(preset.title);
    setTagline(preset.tagline);
    setGoal(preset.defaultGoal);
    
    // Departments
    const newDepts: WizardDepartment[] = preset.departments.map((d, dIdx) => ({
      name: d.name,
      category: d.category,
      leadUserId: users[dIdx % users.length]?.id || currentUser.id,
      leadName: users[dIdx % users.length]?.name || currentUser.name,
      leadEmail: users[dIdx % users.length]?.email || currentUser.email,
      leadPhone: users[dIdx % users.length]?.phone || currentUser.phone || '(555) 019-2834',
      leadRadioChannel: `Channel ${dIdx + 1}`,
      reportingGate: d.reportingGate || `${d.name} Station`,
      dressCodeNotes: d.dressCode || 'Comfortable attire',
      budgetAllocated: d.suggestedBudget || Math.round(preset.defaultGoal * 0.06)
    }));
    setDepartments(newDepts);

    // Shifts with realistic staggered time windows
    const newShifts: WizardShift[] = [];
    const eventDay = startDate ? startDate.slice(0, 10) : '2026-10-15';
    let baseHour = 8;

    preset.departments.forEach((d, dIdx) => {
      d.shifts.forEach((s, sIdx) => {
        const duration = s.durationHours || 3;
        const startH = (baseHour + (sIdx * 2.5)) % 14 + 7;
        const endH = startH + duration;
        
        const pad = (n: number) => Math.floor(n).toString().padStart(2, '0');
        const startMin = (startH % 1) === 0.5 ? '30' : '00';
        const endMin = (endH % 1) === 0.5 ? '30' : '00';

        const sStart = `${eventDay}T${pad(startH)}:${startMin}:00`;
        const sEnd = `${eventDay}T${pad(endH)}:${endMin}:00`;

        newShifts.push({
          title: s.title,
          description: s.description,
          departmentIndex: dIdx,
          startTime: sStart,
          endTime: sEnd,
          capacity: s.capacity,
          requiresWaiver: s.requiresWaiver
        });
      });
    });
    setShifts(newShifts);

    // Items
    const newItems: WizardItem[] = [];
    preset.departments.forEach((d, dIdx) => {
      d.items.forEach(i => {
        newItems.push({
          itemName: i.itemName,
          category: i.category,
          departmentIndex: dIdx,
          quantityNeeded: i.quantityNeeded,
          unit: i.unit,
          dropOffLocation: `${d.name} Desk`,
          dropOffDeadline: 'Event Morning 8:00 AM',
          estimatedFmvPerUnit: 25
        });
      });
    });
    setItems(newItems);

    // Sponsor / Commercial Tiers
    const newTiers: WizardTier[] = (preset.ticketTiers || []).map(t => ({
      title: t.title,
      type: t.type as any,
      price: t.price,
      fairMarketValue: t.fairMarketValue,
      capacity: t.capacity,
      instantCheckout: t.instantCheckout,
      description: t.description,
      perks: t.perks || ['Logo Placement', 'Event Passes']
    }));
    setTiers(newTiers);

    // Tags
    if (preset.id === 'gala_auction') {
      setSelectedTags(['Charity Gala', 'Silent Auction', 'Dinner & Symphony', 'Student Service Hours']);
    } else {
      setSelectedTags(['Family Friendly', 'Carnival & Games', 'Student Service Hours', 'Food & Bake Sale']);
    }
  };

  const handleSelectPastEvent = (pastEventId: string) => {
    setSelectedPastEventId(pastEventId);
    const past = events.find(e => e.id === pastEventId);
    if (past) {
      setTitle(`${past.title.replace(/\d{4}/, '')} ${new Date().getFullYear() + 1}`.trim());
      setTagline(past.tagline);
      setGoal(past.fundraisingGoal);
      setVenueName(past.venueName);
      setVenueAddress(past.venueAddress);
      setSelectedTags(past.tags || ['Family Friendly']);
    }
  };

  // Department CRUD in Wizard
  const handleOpenAddDept = () => {
    setEditingDeptIdx(null);
    setDeptName('');
    setDeptLeadUserId(currentUser.id);
    setDeptLeadName(currentUser.name);
    setDeptLeadEmail(currentUser.email);
    setDeptLeadPhone(currentUser.phone || '');
    setDeptRadio(`Channel ${departments.length + 1}`);
    setDeptGate(`Gate ${departments.length + 1} Station`);
    setDeptBudget(400);
    setDeptDressCode(eventDressCode || 'Comfortable casual attire');
    setIsAddDeptModalOpen(true);
  };

  const handleOpenEditDept = (idx: number) => {
    setEditingDeptIdx(idx);
    const d = departments[idx];
    setDeptName(d.name);
    setDeptLeadUserId(d.leadUserId || currentUser.id);
    setDeptLeadName(d.leadName);
    setDeptLeadEmail(d.leadEmail || '');
    setDeptLeadPhone(d.leadPhone || '');
    setDeptRadio(d.leadRadioChannel || 'Channel 1');
    setDeptGate(d.reportingGate);
    setDeptBudget(d.budgetAllocated);
    setDeptDressCode(d.dressCodeNotes || eventDressCode || 'Comfortable casual attire');
    setIsAddDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    const assignedUser = users.find(u => u.id === deptLeadUserId);
    const finalLeadName = assignedUser ? assignedUser.name : deptLeadName;
    const finalLeadEmail = assignedUser ? assignedUser.email : deptLeadEmail;
    const finalLeadPhone = assignedUser ? (assignedUser.phone || deptLeadPhone) : deptLeadPhone;

    const deptPayload: WizardDepartment = {
      name: deptName.trim(),
      category: 'labor_setup',
      leadUserId: deptLeadUserId,
      leadName: finalLeadName,
      leadEmail: finalLeadEmail,
      leadPhone: finalLeadPhone,
      leadRadioChannel: deptRadio,
      reportingGate: deptGate,
      dressCodeNotes: deptDressCode.trim() || eventDressCode,
      budgetAllocated: Number(deptBudget) || 0
    };

    if (editingDeptIdx !== null) {
      const updated = [...departments];
      updated[editingDeptIdx] = deptPayload;
      setDepartments(updated);
    } else {
      setDepartments([...departments, deptPayload]);
    }

    setIsAddDeptModalOpen(false);
  };

  const handleDeleteDept = (idx: number) => {
    if (confirm(`Remove ${departments[idx].name} from event plan?`)) {
      setDepartments(departments.filter((_, i) => i !== idx));
      setShifts(shifts.filter(s => s.departmentIndex !== idx));
      setItems(items.filter(i => i.departmentIndex !== idx));
    }
  };

  // Shift CRUD in Wizard
  const handleOpenAddShift = () => {
    setEditingShiftIdx(null);
    setShiftTitle('');
    setShiftDesc('');
    setShiftDeptIdx(0);
    const day = startDate ? startDate.slice(0, 10) : '2026-10-15';
    setShiftStart(`${day}T09:00:00`);
    setShiftEnd(`${day}T12:00:00`);
    setShiftCap(4);
    setShiftWaiver(true);
    setIsAddShiftModalOpen(true);
  };

  const handleOpenEditShift = (idx: number) => {
    setEditingShiftIdx(idx);
    const s = shifts[idx];
    setShiftTitle(s.title);
    setShiftDesc(s.description);
    setShiftDeptIdx(s.departmentIndex);
    setShiftStart(s.startTime || startDate);
    setShiftEnd(s.endTime || endDate);
    setShiftCap(s.capacity);
    setShiftWaiver(s.requiresWaiver);
    setIsAddShiftModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftTitle.trim()) return;

    const shiftPayload: WizardShift = {
      title: shiftTitle.trim(),
      description: shiftDesc.trim(),
      departmentIndex: shiftDeptIdx,
      startTime: shiftStart,
      endTime: shiftEnd,
      capacity: Number(shiftCap) || 1,
      requiresWaiver: shiftWaiver
    };

    if (editingShiftIdx !== null) {
      const updated = [...shifts];
      updated[editingShiftIdx] = shiftPayload;
      setShifts(updated);
    } else {
      setShifts([...shifts, shiftPayload]);
    }

    setIsAddShiftModalOpen(false);
  };

  const handleGenerateTimeSlots = (baseTitle: string, deptIdx: number, desc: string, cap: number, waiver: boolean) => {
    if (!baseTitle.trim()) return;
    const eventDay = startDate ? startDate.slice(0, 10) : '2026-10-15';
    const slots = [
      { name: 'Morning Setup', start: `${eventDay}T08:00:00`, end: `${eventDay}T11:00:00` },
      { name: 'Midday Peak', start: `${eventDay}T11:00:00`, end: `${eventDay}T14:00:00` },
      { name: 'Afternoon Rush', start: `${eventDay}T14:00:00`, end: `${eventDay}T17:00:00` },
      { name: 'Evening / Teardown', start: `${eventDay}T17:00:00`, end: `${eventDay}T20:00:00` }
    ];

    const generatedShifts: WizardShift[] = slots.map(s => ({
      title: `${baseTitle.trim()} — ${s.name}`,
      description: desc.trim() || `Volunteer support for ${baseTitle.trim()}`,
      departmentIndex: deptIdx,
      startTime: s.start,
      endTime: s.end,
      capacity: cap,
      requiresWaiver: waiver
    }));

    setShifts(prev => [...prev, ...generatedShifts]);
    showToast('success', 'Generated 4 Time Slots', `Added Morning, Midday, Afternoon, and Evening slots for ${baseTitle}`);
    setIsAddShiftModalOpen(false);
  };

  const handleDeleteShift = (idx: number) => {
    setShifts(shifts.filter((_, i) => i !== idx));
  };

  // Item CRUD in Wizard
  const handleOpenAddItem = () => {
    setEditingItemIdx(null);
    setItemName('');
    setItemCategory('Supplies');
    setItemDeptIdx(0);
    setItemQty(10);
    setItemUnit('boxes');
    setItemDropOff('Department Station');
    setItemDeadline('Event Morning 8:00 AM');
    setItemFmv(25);
    setIsAddItemModalOpen(true);
  };

  const handleOpenEditItem = (idx: number) => {
    setEditingItemIdx(idx);
    const i = items[idx];
    setItemName(i.itemName);
    setItemCategory(i.category);
    setItemDeptIdx(i.departmentIndex);
    setItemQty(i.quantityNeeded);
    setItemUnit(i.unit);
    setItemDropOff(i.dropOffLocation);
    setItemDeadline(i.dropOffDeadline);
    setItemFmv(i.estimatedFmvPerUnit || 25);
    setIsAddItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const itemPayload: WizardItem = {
      itemName: itemName.trim(),
      category: itemCategory,
      departmentIndex: itemDeptIdx,
      quantityNeeded: Number(itemQty) || 1,
      unit: itemUnit.trim(),
      dropOffLocation: itemDropOff.trim(),
      dropOffDeadline: itemDeadline.trim(),
      estimatedFmvPerUnit: Number(itemFmv) || 0
    };

    if (editingItemIdx !== null) {
      const updated = [...items];
      updated[editingItemIdx] = itemPayload;
      setItems(updated);
    } else {
      setItems([...items, itemPayload]);
    }

    setIsAddItemModalOpen(false);
  };

  const handleDeleteItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Sponsor Tier CRUD in Wizard
  const handleOpenAddTier = () => {
    setEditingTierIdx(null);
    setTierTitle('');
    setTierType('sponsor_package');
    setTierPrice(1000);
    setTierFmv(150);
    setTierCap(4);
    setTierDesc('Corporate underwriting package with main stage banners and VIP perks.');
    setTierPerksInput('Main Stage Banner, 4 VIP Passes, Social Media Announcement');
    setTierBoothDim('10x10');
    setTierPower(false);
    setIsAddTierModalOpen(true);
  };

  const handleOpenEditTier = (idx: number) => {
    setEditingTierIdx(idx);
    const t = tiers[idx];
    setTierTitle(t.title);
    setTierType(t.type as any);
    setTierPrice(t.price);
    setTierFmv(t.fairMarketValue);
    setTierCap(t.capacity);
    setTierDesc(t.description);
    setTierPerksInput(t.perks.join(', '));
    setTierBoothDim(t.boothDimensions || '10x10');
    setTierPower(t.powerProvided || false);
    setIsAddTierModalOpen(true);
  };

  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tierTitle.trim()) return;

    const tierPayload: WizardTier = {
      title: tierTitle.trim(),
      type: tierType,
      price: Number(tierPrice) || 0,
      fairMarketValue: Number(tierFmv) || 0,
      capacity: Number(tierCap) || 1,
      instantCheckout: true,
      description: tierDesc.trim(),
      perks: tierPerksInput.split(',').map(p => p.trim()).filter(Boolean),
      boothDimensions: tierType === 'vendor_booth' ? tierBoothDim : undefined,
      powerProvided: tierPower
    };

    if (editingTierIdx !== null) {
      const updated = [...tiers];
      updated[editingTierIdx] = tierPayload;
      setTiers(updated);
    } else {
      setTiers([...tiers, tierPayload]);
    }

    setIsAddTierModalOpen(false);
  };

  const handleDeleteTier = (idx: number) => {
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const handleMoveTier = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === tiers.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newTiers = [...tiers];
    const [moved] = newTiers.splice(idx, 1);
    newTiers.splice(targetIdx, 0, moved);
    setTiers(newTiers);
  };

  const handleSortTiers = (order: 'high_to_low' | 'low_to_high') => {
    const sorted = [...tiers].sort((a, b) => 
      order === 'high_to_low' ? b.price - a.price : a.price - b.price
    );
    setTiers(sorted);
    showToast('info', 'Tiers Sorted', order === 'high_to_low' ? 'Sorted highest to lowest in cost.' : 'Sorted lowest to highest in cost.');
  };

  // Tags
  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setCustomTagInput('');
  };

  const isDuplicateEvent = events.some(e => 
    e.orgId === currentOrg.id && 
    e.title.toLowerCase().trim() === title.toLowerCase().trim() && 
    e.startDate.slice(0, 10) === startDate.slice(0, 10)
  );

  const handleLaunchCampaign = () => {
    if (!title.trim()) {
      showToast('error', 'Event Title Required', 'Please enter a campaign title.');
      setCurrentStep(2);
      return;
    }

    if (isDuplicateEvent) {
      showToast('error', 'Duplicate Event Detected', `An event titled "${title}" is already scheduled on ${startDate.slice(0, 10)} for ${currentOrg.name}.`);
      return;
    }

    // Format custom payload
    const customPayload = {
      subParts: departments.map(d => ({
        eventId: '',
        name: d.name,
        category: d.category,
        leadUserId: d.leadUserId || currentUser.id,
        leadName: d.leadName,
        leadEmail: d.leadEmail || '',
        leadPhone: d.leadPhone || '',
        leadRadioChannel: d.leadRadioChannel || 'Channel 1',
        reportingGate: d.reportingGate,
        dressCodeNotes: d.dressCodeNotes || 'Comfortable attire',
        suppliesNotes: d.suppliesNotes || 'Check in with lead',
        budgetAllocated: d.budgetAllocated
      })),
      shifts: shifts.map(s => ({
        eventId: '',
        subPartId: '',
        departmentIndex: s.departmentIndex,
        title: s.title,
        description: s.description,
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity,
        requiresWaiver: s.requiresWaiver,
        waiverTemplateId: 'waiver_general_liability'
      })),
      itemSlots: items.map(i => ({
        eventId: '',
        subPartId: '',
        departmentIndex: i.departmentIndex,
        itemName: i.itemName,
        category: i.category,
        quantityNeeded: i.quantityNeeded,
        unit: i.unit,
        dropOffLocation: i.dropOffLocation,
        dropOffDeadline: i.dropOffDeadline,
        estimatedFmvPerUnit: i.estimatedFmvPerUnit
      })),
      ticketTiers: tiers.map(t => ({
        eventId: '',
        title: t.title,
        type: t.type,
        price: t.price,
        fairMarketValue: t.fairMarketValue,
        capacity: t.capacity,
        instantCheckout: t.instantCheckout,
        description: t.description,
        perks: t.perks,
        boothDimensions: t.boothDimensions,
        powerProvided: t.powerProvided
      }))
    };

    createEvent({
      title,
      tagline,
      description: tagline || `Community fundraiser and volunteer event for ${currentOrg.name}`,
      fundraisingGoal: goal,
      venueName,
      venueAddress,
      startDate,
      endDate,
      tags: selectedTags,
      coverImageUrl,
      dressCode: eventDressCode,
      approvalThresholdBudget: thresholdBudget,
      approvalThresholdSlots: thresholdSlots
    }, undefined, customPayload);

    onClose();
  };

  const stepsList = [
    { num: 1, label: '1. Source' },
    { num: 2, label: '2. Essentials' },
    { num: 3, label: '3. Committees & Leads' },
    { num: 4, label: '4. Shifts' },
    { num: 5, label: '5. Wishlist' },
    { num: 6, label: '6. Sponsors' },
    { num: 7, label: '7. Review & Launch' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event / Campaign Wizard"
      subtitle={`Guided 7-step setup for ${currentOrg.name}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        
        {/* Step Progress Ribbon */}
        <div className="border-b border-slate-200 pb-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px] gap-2">
            {stepsList.map(step => (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  currentStep === step.num
                    ? 'bg-purple-600 text-white shadow-xs'
                    : currentStep > step.num
                    ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {currentStep > step.num ? <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" /> : <span>{step.num}</span>}
                <span>{step.label.replace(/^\d+\.\s*/, '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: SETUP SOURCE & BLUEPRINT */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 1: Choose Campaign Setup Source</h3>
                <p className="text-slate-500 text-xs">Pre-load battle-tested operational structures or clone from a prior year</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setSourceMode('blueprint');
                  if (selectedTemplate) applyTemplateData(selectedTemplate);
                }}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                  sourceMode === 'blueprint'
                    ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
                <span>Industry Blueprints</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSourceMode('clone_past');
                  if (orgPastEvents.length > 0) handleSelectPastEvent(orgPastEvents[0].id);
                }}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                  sourceMode === 'clone_past'
                    ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-purple-600" />
                <span>Clone Past Event</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSourceMode('blank');
                  setTitle('New Community Campaign');
                  setTagline('Support our community drive');
                  setDepartments([]);
                  setShifts([]);
                  setItems([]);
                  setTiers([]);
                  setSelectedTags(['Community Event', 'Family Friendly']);
                }}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                  sourceMode === 'blank'
                    ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Blank Canvas (From Scratch)</span>
              </button>
            </div>

            {/* Blueprints Grid */}
            {sourceMode === 'blueprint' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EVENT_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      applyTemplateData(tmpl);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedTemplate?.id === tmpl.id
                        ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    <div>
                      <span className="text-2xl mb-1 block">{tmpl.icon}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{tmpl.title}</h4>
                      <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                        Goal: {formatCurrency(tmpl.defaultGoal)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">
                      {tmpl.departments.length} Depts • {tmpl.ticketTiers?.length || 0} Sponsor Tiers
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clone Past Event Picker */}
            {sourceMode === 'clone_past' && (
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-purple-900">Select Past Campaign to Duplicate:</span>
                </div>

                {orgPastEvents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {orgPastEvents.map(past => (
                      <div
                        key={past.id}
                        onClick={() => handleSelectPastEvent(past.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          selectedPastEventId === past.id
                            ? 'bg-white border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                            : 'bg-white/80 border-purple-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900">{past.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {past.eventKey} • Raised {formatCurrency(past.totalRaised)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-purple-700">No past events recorded yet. Industry blueprints recommended!</p>
                )}
              </div>
            )}

            {/* Blank Canvas Notice */}
            {sourceMode === 'blank' && (
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Blank Slate Setup:</strong> You can add your custom committees, leadership leads, volunteer shifts, wishlist drop-offs, and sponsorship packages in the following steps.
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CAMPAIGN ESSENTIALS & SCHEDULE */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Step 2: Campaign Essentials & Venue Details</h3>
              <p className="text-slate-500 text-xs">Define campaign title, fundraising goals, schedule window, and venue location</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Event Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Tagline / Mission Subtitle</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Fundraising Goal ($) *</label>
                <input
                  type="number"
                  min="500"
                  required
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue / Facility Name *</label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Street Address *</label>
                <input
                  type="text"
                  required
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              {/* Global Event Volunteer Dress Code / Attire */}
              <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Global Volunteer Dress Code / Baseline Attire</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Defaults to all departments unless customized</span>
                </div>
                <input
                  type="text"
                  value={eventDressCode}
                  onChange={(e) => setEventDressCode(e.target.value)}
                  placeholder="e.g. Official Event Volunteer T-Shirt (provided) + comfortable sneakers"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Presets:</span>
                  {[
                    '👕 Casual Spirit / T-Shirt & Sneakers',
                    '👔 Business Casual / Staff Polo',
                    '🤵 Black-Tie / Formal Evening Attire',
                    '🦺 Safety Vest & Work Boots',
                    '🧑‍🍳 Food Safe Apron & Closed Shoes'
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setEventDressCode(preset)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition shadow-2xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: COMMITTEES & LEADERSHIP DELEGATIONS */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 3: Committee Departments & Leadership Leads</h3>
                <p className="text-slate-500 text-xs">Assign designated Leads from organization staff, reporting gates, and budgets</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddDept}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-1.5 self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Department</span>
              </button>
            </div>

            <div className="space-y-2">
              {departments.length > 0 ? (
                departments.map((dept, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{dept.name}</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                          Budget: {formatCurrency(dept.budgetAllocated)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span><strong>Lead:</strong> {dept.leadName} ({dept.leadPhone || dept.leadEmail})</span>
                        <span>• <strong>Gate:</strong> {dept.reportingGate}</span>
                        <span>• <strong>Radio:</strong> {dept.leadRadioChannel || 'Ch 1'}</span>
                      </div>
                      <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-500">
                        <Shirt className="w-3 h-3 text-purple-600 shrink-0" />
                        <span><strong>Attire / Gear:</strong> {dept.dressCodeNotes || eventDressCode || 'Comfortable attire'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDept(idx)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Edit Department"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDept(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 border border-dashed rounded-2xl">
                  No committee departments added yet. Click &quot;+ Add Department&quot; above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: VOLUNTEER SHIFTS */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 4: Volunteer Shift Needs & Staffing Capacities</h3>
                <p className="text-slate-500 text-xs">Define volunteer shift roles, capacities, and liability waiver requirements</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddShift}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Shift Role</span>
              </button>
            </div>

            <div className="space-y-2">
              {shifts.length > 0 ? (
                shifts.map((shift, idx) => {
                  const dept = departments[shift.departmentIndex] || { name: 'General Event' };
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{shift.title}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                            {dept.name}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[10px]">
                            {shift.capacity} Spots Needed
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{shift.description}</p>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>Schedule: {formatTimeRange(shift.startTime, shift.endTime)}</span>
                          <span>• Waiver: {shift.requiresWaiver ? 'Yes (Liability)' : 'None'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditShift(idx)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteShift(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 border border-dashed rounded-2xl">
                  No volunteer shifts created yet. Click &quot;+ Add Shift Role&quot; above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: WISHLIST SUPPLY NEEDS */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 5: Supply & Equipment Wishlist Drop-Offs</h3>
                <p className="text-slate-500 text-xs">Specify physical goods, baked items, drop-off points, and IRS Fair Market Value offsets</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddItem}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Wishlist Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const dept = departments[item.departmentIndex] || { name: 'General' };
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.itemName}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            {item.quantityNeeded} {item.unit}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                            Dept: {dept.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                          <span>Drop-Off: {item.dropOffLocation} (By {item.dropOffDeadline})</span>
                          <span>• Est. FMV: {formatCurrency(item.estimatedFmvPerUnit || 25)} / {item.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditItem(idx)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 border border-dashed rounded-2xl">
                  No wishlist supply needs added yet. Click &quot;+ Add Wishlist Item&quot; above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: SPONSOR PACKAGES & COMMERCIAL TIERS */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 6: Sponsorship Packages & Commercial Tiers</h3>
                <p className="text-slate-500 text-xs">Build corporate underwriting packages, artisan vendor booths, and admission tickets</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {tiers.length > 1 && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 px-1.5">Sort:</span>
                    <button
                      type="button"
                      onClick={() => handleSortTiers('high_to_low')}
                      className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-900 font-bold text-[10px] rounded-lg shadow-2xs transition flex items-center gap-1"
                      title="Sort packages by highest price first"
                    >
                      <span>$$$ &rarr; $ High to Low</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortTiers('low_to_high')}
                      className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-900 font-bold text-[10px] rounded-lg shadow-2xs transition flex items-center gap-1"
                      title="Sort packages by lowest price first"
                    >
                      <span>$ &rarr; $$$ Low to High</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOpenAddTier}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Sponsor Package / Tier</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {tiers.length > 0 ? (
                tiers.map((tier, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-mono text-[10px] rounded font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{tier.title}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-xs">
                          {formatCurrency(tier.price)}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded uppercase font-bold text-[10px]">
                          {tier.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{tier.description}</p>
                      <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-x-2">
                        <span>FMV Offset: {formatCurrency(tier.fairMarketValue)}</span>
                        <span>• Capacity: {tier.capacity} packages</span>
                        {tier.boothDimensions && <span>• Booth: {tier.boothDimensions} {tier.powerProvided ? '(Power ✓)' : ''}</span>}
                        <span>• Perks: {tier.perks.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleMoveTier(idx, 'up')}
                        disabled={idx === 0}
                        className={`p-1.5 rounded-lg border transition ${
                          idx === 0
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                            : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title="Shift Up / Move Earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTier(idx, 'down')}
                        disabled={idx === tiers.length - 1}
                        className={`p-1.5 rounded-lg border transition ${
                          idx === tiers.length - 1
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                            : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title="Shift Down / Move Later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditTier(idx)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg ml-1"
                        title="Edit Tier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTier(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 border border-dashed rounded-2xl">
                  No sponsor tiers or vendor packages created yet. Click &quot;+ Add Sponsor Package / Tier&quot; above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: DISCOVERY TAGS, APPROVAL RULES & REVIEW */}
        {currentStep === 7 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Step 7: Search Tags, Approval Thresholds & Review</h3>
              <p className="text-slate-500 text-xs">Configure public search tags, auto-approval thresholds, and review campaign dossier</p>
            </div>

            {/* Public Tags */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block font-bold text-slate-800">Public Search & Discovery Tags</label>
              
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-xl border border-slate-200">
                {selectedTags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs flex items-center gap-1">
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleToggleTag(tag)} className="text-purple-400 hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_EVENT_TAGS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleToggleTag(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedTags.includes(t) ? 'bg-purple-600 text-white' : 'bg-white border text-slate-700 hover:bg-purple-50'
                    }`}
                  >
                    {selectedTags.includes(t) ? '✓ ' : '+ '} {t}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="Add custom tag (e.g. STEM Fair, Bake Sale)..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                />
                <button type="button" onClick={handleAddCustomTag} className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-xl">
                  + Add Tag
                </button>
              </div>
            </div>

            {/* Variable Approval Rules */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Budget Auto-Approval Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  value={thresholdBudget}
                  onChange={(e) => setThresholdBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">Lead budget increases above this require Planner review</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Slots Auto-Approval Limit</label>
                <input
                  type="number"
                  min="1"
                  value={thresholdSlots}
                  onChange={(e) => setThresholdSlots(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">Shift spot additions exceeding this require Planner review</span>
              </div>
            </div>

            {/* Final Dossier Summary */}
            <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold">Campaign Launch Summary</span>
                  <h4 className="text-base font-extrabold text-white">{title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-purple-300">Target Goal</span>
                  <div className="text-lg font-black text-emerald-400">{formatCurrency(goal)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-[11px]">
                <div><strong>Committees:</strong> {departments.length} Depts</div>
                <div><strong>Volunteer Slots:</strong> {shifts.reduce((a, b) => a + b.capacity, 0)} spots</div>
                <div><strong>Wishlist Items:</strong> {items.reduce((a, b) => a + b.quantityNeeded, 0)} units</div>
                <div><strong>Sponsor Tiers:</strong> {tiers.length} packages</div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Step Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">Step {currentStep} of 7</span>
            {currentStep < 7 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunchCampaign}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>🚀 Launch Event & Publish Campaign</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: ADD / EDIT DEPARTMENT */}
      {isAddDeptModalOpen && (
        <Modal
          isOpen={isAddDeptModalOpen}
          onClose={() => setIsAddDeptModalOpen(false)}
          title={editingDeptIdx !== null ? `Edit Department: ${deptName}` : 'Add Committee Department'}
          subtitle="Assign leadership lead, allocated budget, and reporting gate"
        >
          <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. VIP Hospitality & Food"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Department Lead</label>
              <select
                value={deptLeadUserId}
                onChange={(e) => {
                  setDeptLeadUserId(e.target.value);
                  const u = users.find(user => user.id === e.target.value);
                  if (u) {
                    setDeptLeadName(u.name);
                    setDeptLeadEmail(u.email);
                    setDeptLeadPhone(u.phone || '');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Allocated Budget ($)</label>
                <input
                  type="number"
                  min="0"
                  value={deptBudget}
                  onChange={(e) => setDeptBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Radio Channel</label>
                <input
                  type="text"
                  value={deptRadio}
                  onChange={(e) => setDeptRadio(e.target.value)}
                  placeholder="e.g. Channel 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reporting Gate Location</label>
              <input
                type="text"
                value={deptGate}
                onChange={(e) => setDeptGate(e.target.value)}
                placeholder="e.g. Gate 2 Hospitality Tent"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Department-Specific Dress Code & Special Gear */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-purple-600" />
                  <span>Department Volunteer Attire & Gear Instructions</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDeptDressCode(eventDressCode || 'Comfortable casual attire')}
                  className="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline"
                >
                  Inherit Global Attire
                </button>
              </div>
              <input
                type="text"
                value={deptDressCode}
                onChange={(e) => setDeptDressCode(e.target.value)}
                placeholder="e.g. Work gloves, durable pants, closed-toe boots"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <span className="text-[10px] font-bold text-slate-400 mr-1">+ Quick Add Gear:</span>
                {[
                  '+ Apron & Hairnet (provided)',
                  '+ Work Gloves & Boots',
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

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddDeptModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl">
                Save Department
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ADD / EDIT SHIFT */}
      {isAddShiftModalOpen && (
        <Modal
          isOpen={isAddShiftModalOpen}
          onClose={() => setIsAddShiftModalOpen(false)}
          title={editingShiftIdx !== null ? `Edit Shift: ${shiftTitle}` : 'Add Volunteer Shift Role'}
          subtitle="Define role requirements, exact time slot windows, and safety waiver rules"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Shift Role Title *</label>
              <input
                type="text"
                required
                value={shiftTitle}
                onChange={(e) => setShiftTitle(e.target.value)}
                placeholder="e.g. Bake Sale Cashier, Obstacle Course Marshall..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Committee Department</label>
              <select
                value={shiftDeptIdx}
                onChange={(e) => setShiftDeptIdx(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {departments.map((d, i) => (
                  <option key={i} value={i}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Quick Shift Time Slot Presets */}
            <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
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
                  const day = startDate ? startDate.slice(0, 10) : '2026-10-15';
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        setShiftStart(`${day}T${preset.start}:00`);
                        setShiftEnd(`${day}T${preset.end}:00`);
                      }}
                      className="px-2.5 py-1 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-900 rounded-lg text-[11px] font-semibold transition shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exact Date & Time Slot Windows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Shift Start Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Shift End Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Description & Tasks</label>
              <textarea
                rows={2}
                value={shiftDesc}
                onChange={(e) => setShiftDesc(e.target.value)}
                placeholder="Describe key responsibilities and physical requirements..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Capacity (Volunteers Needed)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={shiftCap}
                  onChange={(e) => setShiftCap(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Liability Waiver?</label>
                <select
                  value={shiftWaiver ? 'yes' : 'no'}
                  onChange={(e) => setShiftWaiver(e.target.value === 'yes')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="yes">Yes (Liability Waiver)</option>
                  <option value="no">No Waiver Needed</option>
                </select>
              </div>
            </div>

            {/* Multi-slot generator action for new roles */}
            {editingShiftIdx === null && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Need this role across the whole day?</span>
                  <span className="text-[10px] text-slate-500">Auto-create 4 time slots (Morning, Midday, Afternoon, Evening)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateTimeSlots(shiftTitle || 'Volunteer Assistant', shiftDeptIdx, shiftDesc, shiftCap, shiftWaiver)}
                  className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold rounded-lg text-xs transition"
                >
                  ⚡ Generate 4 Slots
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddShiftModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                Save Shift Time Slot
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ADD / EDIT ITEM */}
      {isAddItemModalOpen && (
        <Modal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          title={editingItemIdx !== null ? `Edit Wishlist Item: ${itemName}` : 'Add Supply & Wishlist Item'}
          subtitle="Request item drop-offs with IRS Fair Market Value offsets"
        >
          <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Item Description *</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Bottled Water (Cases of 24)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={itemDeptIdx}
                  onChange={(e) => setItemDeptIdx(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {departments.map((d, i) => (
                    <option key={i} value={i}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity Needed</label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit (e.g. cases, trays)</label>
                <input
                  type="text"
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Drop-Off Point</label>
                <input
                  type="text"
                  value={itemDropOff}
                  onChange={(e) => setItemDropOff(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Est. FMV ($ / unit)</label>
                <input
                  type="number"
                  min="0"
                  value={itemFmv}
                  onChange={(e) => setItemFmv(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl">
                Save Wishlist Item
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ADD / EDIT SPONSOR PACKAGE / TIER */}
      {isAddTierModalOpen && (
        <Modal
          isOpen={isAddTierModalOpen}
          onClose={() => setIsAddTierModalOpen(false)}
          title={editingTierIdx !== null ? `Edit Package: ${tierTitle}` : 'Add Sponsor Package / Commercial Tier'}
          subtitle="Define underwriting tiers, pricing, IRS FMV deduction offsets, and perks"
        >
          <form onSubmit={handleSaveTier} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Package Title *</label>
              <input
                type="text"
                required
                value={tierTitle}
                onChange={(e) => setTierTitle(e.target.value)}
                placeholder="e.g. Gold Main Stage Sponsor"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Type</label>
                <select
                  value={tierType}
                  onChange={(e) => setTierType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="sponsor_package">Corporate Sponsorship Package</option>
                  <option value="vendor_booth">Artisan / Food Vendor Booth</option>
                  <option value="admission_ticket">Admission Ticket</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Price ($) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={tierPrice}
                  onChange={(e) => setTierPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">IRS Fair Market Value (FMV) ($)</label>
                <input
                  type="number"
                  min="0"
                  value={tierFmv}
                  onChange={(e) => setTierFmv(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
                <span className="text-[10px] text-slate-400">Goods/meals value deducted from tax receipt</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Capacity (Max Packages)</label>
                <input
                  type="number"
                  min="1"
                  value={tierCap}
                  onChange={(e) => setTierCap(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Inclusions & Perks (Comma-separated)</label>
              <input
                type="text"
                value={tierPerksInput}
                onChange={(e) => setTierPerksInput(e.target.value)}
                placeholder="e.g. Stage Banner, 4 VIP Passes, Social Media Shoutout"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {tierType === 'vendor_booth' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-xl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booth Space</label>
                  <input
                    type="text"
                    value={tierBoothDim}
                    onChange={(e) => setTierBoothDim(e.target.value)}
                    placeholder="e.g. 10x10 or Food Truck"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={tierPower}
                    onChange={(e) => setTierPower(e.target.checked)}
                    id="wizardTierPower"
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="wizardTierPower" className="font-semibold text-slate-700 cursor-pointer">
                    110V Electricity Provided
                  </label>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddTierModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl">
                Save Package
              </button>
            </div>
          </form>
        </Modal>
      )}

    </Modal>
  );
};
