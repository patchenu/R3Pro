import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, MapPin, Share2, Clock, Users, HeartHandshake, 
  Store, Gift, Check, ShieldCheck, AlertTriangle, Sparkles, 
  ExternalLink, ChevronRight, Info, Bell, Tag, ArrowRight 
} from 'lucide-react';
import { formatCurrency, formatDate, formatTimeRange, formatPercentage } from '../../utils/formatters';
import { Thermometer } from '../common/Thermometer';
import { UnifiedRegistrationModal } from './UnifiedRegistrationModal';
import { VendorApplicationModal } from './VendorApplicationModal';
import { ConfirmationCard } from './ConfirmationCard';
import { QrCodeModal } from '../common/QrCodeModal';
import { ManageRegistration } from './ManageRegistration';
import { TicketTier } from '../../types';

export const PublicEventLanding: React.FC = () => {
  const { currentEvent, currentOrg, subParts, shifts, itemSlots, ticketTiers, donations, announcements, registrations } = useApp();

  // Filter State
  const [selectedSubPartId, setSelectedSubPartId] = useState<string>('all');
  const [slotTypeFilter, setSlotTypeFilter] = useState<'all' | 'volunteer' | 'items' | 'tickets' | 'unfilled'>('all');
  const [timeSlotFilter, setTimeSlotFilter] = useState<'all' | 'morning' | 'midday' | 'afternoon_evening'>('all');

  // Selected Cart for Unified Registration
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const [selectedItemPledges, setSelectedItemPledges] = useState<{ itemSlotId: string; quantity: number }[]>([]);
  const [selectedTicketTiers, setSelectedTicketTiers] = useState<{ ticketTierId: string; quantity: number }[]>([]);
  const [directDonationAmount, setDirectDonationAmount] = useState<number>(0);

  // Modals State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedVendorTier, setSelectedVendorTier] = useState<TicketTier | null>(null);
  const [confirmedReg, setConfirmedReg] = useState<any | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Toggle Shift Selection
  const toggleShiftSelection = (shiftId: string) => {
    setSelectedShiftIds(prev => 
      prev.includes(shiftId) ? prev.filter(id => id !== shiftId) : [...prev, shiftId]
    );
  };

  // Toggle Item Pledge Selection
  const toggleItemPledge = (itemSlotId: string, quantity: number) => {
    setSelectedItemPledges(prev => {
      const exists = prev.find(p => p.itemSlotId === itemSlotId);
      if (exists) {
        return prev.filter(p => p.itemSlotId !== itemSlotId);
      } else {
        return [...prev, { itemSlotId, quantity: Math.max(1, quantity) }];
      }
    });
  };

  // Toggle Ticket Selection
  const updateTicketQty = (ticketTierId: string, delta: number) => {
    setSelectedTicketTiers(prev => {
      const existing = prev.find(t => t.ticketTierId === ticketTierId);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = Math.max(0, currentQty + delta);

      if (newQty === 0) {
        return prev.filter(t => t.ticketTierId !== ticketTierId);
      } else if (existing) {
        return prev.map(t => t.ticketTierId === ticketTierId ? { ...t, quantity: newQty } : t);
      } else {
        return [...prev, { ticketTierId, quantity: newQty }];
      }
    });
  };

  const totalSelectionsCount = selectedShiftIds.length + selectedItemPledges.length + selectedTicketTiers.length + (directDonationAmount > 0 ? 1 : 0);

  const totalShiftsCount = shifts.length;
  const filledShiftsCount = shifts.reduce((acc, s) => acc + s.claimedCount, 0);
  const totalShiftCapacity = shifts.reduce((acc, s) => acc + s.capacity, 0);
  const volunteerFillRate = formatPercentage(filledShiftsCount, totalShiftCapacity);

  // Filtered SubParts
  const filteredSubParts = selectedSubPartId === 'all' 
    ? subParts 
    : subParts.filter(sp => sp.id === selectedSubPartId);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      
      {/* If newly confirmed registration is active */}
      {confirmedReg && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <ConfirmationCard
            registration={confirmedReg}
            event={currentEvent}
            subParts={subParts}
            shifts={shifts}
            onClose={() => setConfirmedReg(null)}
          />
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        {/* Background Image with Overlay Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentEvent.coverImageUrl}
            alt={currentEvent.title}
            className="w-full h-full object-cover object-center opacity-30 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          {/* Top Org & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-indigo-300">
                {currentOrg.name}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                ✓ Verified 501(c)(3) Campaign
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsManageModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5 text-slate-200"
              >
                <span>Manage My Sign-Up</span>
              </button>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share & QR Flyer</span>
              </button>
            </div>
          </div>

          {/* Event Title & Tagline */}
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              {currentEvent.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mt-2 font-medium leading-relaxed">
              {currentEvent.tagline}
            </p>

            {/* Date, Location, Time Chips */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-5 text-xs sm:text-sm text-slate-200 font-semibold">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{formatDate(currentEvent.startDate)}</span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{formatTimeRange(currentEvent.startDate, currentEvent.endDate)}</span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{currentEvent.venueName}</span>
                {currentEvent.mapUrl && (
                  <a href={currentEvent.mapUrl} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-white underline text-xs">
                    Map
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-8">
        
        {/* Fundraising Thermometer Card */}
        <Thermometer
          currentAmount={currentEvent.totalRaised}
          goalAmount={currentEvent.fundraisingGoal}
          donorCount={donations.length + registrations.filter(r => r.donations.length > 0).length + 8}
          volunteerFillRate={volunteerFillRate}
          currency={currentEvent.currency}
          themeColor={currentEvent.theme.primaryColor}
        />

        {/* Urgent Needs & Volunteer Drive Callout */}
        <div id="volunteer-drive-banner" className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 rounded-2xl border border-indigo-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/30 text-amber-400 flex items-center justify-center font-black text-xl shrink-0">
              <Users className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Volunteers Needed</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold">100% Free • Family Friendly</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {totalShiftCapacity - filledShiftsCount > 0 
                  ? `${totalShiftCapacity - filledShiftsCount} Volunteer Shifts Open across ${subParts.length} Departments`
                  : `All ${totalShiftCapacity} shifts currently filled!`}
              </h3>
              <p className="text-xs text-slate-300">
                Pick your shift below to register in under 60 seconds. High school students receive signed community service verification!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('shifts-container');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition shrink-0 flex items-center gap-2"
          >
            <span>Pick Shift & Sign Up</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Organizer Announcements Bulletin */}
        {announcements.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-900">
                <Bell className="w-4 h-4 text-amber-700 animate-bounce" />
                Organizer Announcements & Live Updates
              </div>
              <span className="text-[11px] text-amber-700 font-semibold">{announcements.length} updates</span>
            </div>

            <div className="space-y-2.5">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white/80 p-3 rounded-xl border border-amber-200/80 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                    <span className="text-[10px] text-slate-600">{ann.senderName} ({ann.senderRole})</span>
                  </div>
                  <p className="text-slate-700 mt-1 leading-relaxed">{ann.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Department / Category Filter Tabs */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Filter by Committee / Department
            </span>
            <span className="text-xs text-slate-600 font-semibold">
              {subParts.length} Active Committees
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedSubPartId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedSubPartId === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Sections & Opportunities
            </button>
            {subParts.map(sp => (
              <button
                key={sp.id}
                onClick={() => setSelectedSubPartId(sp.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  selectedSubPartId === sp.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{sp.name}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-black/10 text-[10px] font-bold">
                  {sp.shiftIds.length + sp.itemSlotIds.length}
                </span>
              </button>
            ))}
          </div>

          {/* Slot Type Secondary Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-semibold text-slate-600">Showing:</span>
              {[
                { id: 'all', label: 'Everything' },
                { id: 'volunteer', label: 'Volunteer Shifts' },
                { id: 'items', label: 'Supply Wishlist' },
                { id: 'tickets', label: 'Tickets & Sponsorships' },
                { id: 'unfilled', label: '⚠️ Unfilled Roles Only' },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setSlotTypeFilter(type.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    slotTypeFilter === type.id
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Time of Day Shift Schedule Filter */}
            {(slotTypeFilter === 'all' || slotTypeFilter === 'volunteer' || slotTypeFilter === 'unfilled') && (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-500 px-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-600" />
                  Time Slot:
                </span>
                {[
                  { id: 'all', label: 'All Times' },
                  { id: 'morning', label: '🌅 Morning (<12pm)' },
                  { id: 'midday', label: '☀️ Midday (12-3pm)' },
                  { id: 'afternoon_evening', label: '🌙 Eve (3pm+)' },
                ].map(ts => (
                  <button
                    key={ts.id}
                    onClick={() => setTimeSlotFilter(ts.id as any)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                      timeSlotFilter === ts.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {ts.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SUB-PART DEPARTMENTS & SLOTS SECTION */}
        <div className="space-y-8">
          {filteredSubParts.map((subPart) => {
            const subPartShifts = shifts.filter(s => {
              if (s.subPartId !== subPart.id) return false;
              if (slotTypeFilter === 'unfilled' && s.claimedCount >= s.capacity) return false;
              if (timeSlotFilter !== 'all') {
                const hour = parseInt(s.startTime.slice(11, 13)) || 9;
                if (timeSlotFilter === 'morning' && hour >= 12) return false;
                if (timeSlotFilter === 'midday' && (hour < 12 || hour >= 15)) return false;
                if (timeSlotFilter === 'afternoon_evening' && hour < 15) return false;
              }
              return true;
            });

            const subPartItems = itemSlots.filter(i => i.subPartId === subPart.id && (slotTypeFilter === 'unfilled' ? i.quantityPledged < i.quantityNeeded : true));

            const showShifts = slotTypeFilter === 'all' || slotTypeFilter === 'volunteer' || slotTypeFilter === 'unfilled';
            const showItems = slotTypeFilter === 'all' || slotTypeFilter === 'items' || slotTypeFilter === 'unfilled';

            if (!showShifts && !showItems) return null;
            if (subPartShifts.length === 0 && subPartItems.length === 0) return null;

            return (
              <div key={subPart.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Department Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                        {subPart.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-300">
                        Lead: <strong>{subPart.leadName}</strong> ({subPart.leadPhone})
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold mt-1 text-white">{subPart.name}</h3>
                    <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      Reporting Gate: <strong>{subPart.reportingGate}</strong>
                    </p>
                  </div>

                  {subPart.dressCodeNotes && (
                    <div className="text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-slate-200 max-w-xs">
                      <strong className="text-white">Dress Code:</strong> {subPart.dressCodeNotes}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* VOLUNTEER SHIFTS GRID WITH TIME SLOTS */}
                  {showShifts && subPartShifts.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-indigo-600" />
                          Volunteer Shift Time Slots ({subPartShifts.length})
                        </h4>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Click to select your preferred shift time
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {subPartShifts.map((shift) => {
                          const isFull = shift.claimedCount >= shift.capacity;
                          const isSelected = selectedShiftIds.includes(shift.id);
                          const spotsLeft = shift.capacity - shift.claimedCount;

                          // Compute start hour for time badge
                          const startHour = parseInt(shift.startTime.slice(11, 13)) || 9;
                          const timeWindowBadge = startHour < 12 
                            ? '🌅 Morning Shift' 
                            : startHour < 15 
                            ? '☀️ Midday Peak' 
                            : '🌙 Afternoon / Evening';

                          return (
                            <div
                              key={shift.id}
                              onClick={() => !isFull && toggleShiftSelection(shift.id)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                                  : isFull
                                  ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  {/* Shift Title and Badges */}
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-extrabold text-sm text-slate-900">{shift.title}</span>
                                    <span className="px-2 py-0.5 bg-indigo-100/70 text-indigo-800 text-[10px] font-bold rounded-md">
                                      {timeWindowBadge}
                                    </span>
                                    {shift.requiresWaiver && (
                                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded flex items-center gap-0.5">
                                        <ShieldCheck className="w-3 h-3 text-amber-600" />
                                        Waiver
                                      </span>
                                    )}
                                  </div>

                                  {/* Prominent Shift Time Slot & Reporting Location */}
                                  <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                                    <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                      <span>{formatTimeRange(shift.startTime, shift.endTime)}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-400" />
                                      <span>Gate: <strong>{shift.reportingLocationOverride || subPart.reportingGate}</strong></span>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{shift.description}</p>

                                  {/* Requirements badges */}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                    {shift.minAge && (
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                        Ages {shift.minAge}+
                                      </span>
                                    )}
                                    {shift.skillsRequired?.map((skill, sIdx) => (
                                      <span key={sIdx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Select Button / Status */}
                                <div className="text-right shrink-0">
                                  <div className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1 ${
                                    isFull
                                      ? 'bg-slate-200 text-slate-600'
                                      : spotsLeft <= 2
                                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {isFull ? 'FULL' : `${spotsLeft} of ${shift.capacity} spots left`}
                                  </div>

                                  <div className="mt-3">
                                    {!isFull && (
                                      <button
                                        type="button"
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                                          isSelected
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-slate-100 hover:bg-indigo-100 text-slate-700'
                                        }`}
                                      >
                                        {isSelected ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">+</span>}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SUPPLY ITEMS WISHLIST */}
                  {showItems && subPartItems.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-emerald-600" />
                        Supply & Item Donation Wishlist ({subPartItems.length})
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {subPartItems.map((item) => {
                          const pledged = item.quantityPledged;
                          const needed = item.quantityNeeded;
                          const isComplete = pledged >= needed;
                          const isSelected = selectedItemPledges.some(p => p.itemSlotId === item.id);
                          const remainingNeeded = Math.max(0, needed - pledged);

                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-2xl border transition-all ${
                                isSelected
                                  ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                                  : 'bg-white border-slate-200 hover:border-emerald-300'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-slate-900">{item.itemName}</span>
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded">
                                      {item.category}
                                    </span>
                                  </div>

                                  <div className="text-xs text-slate-600 mt-1">
                                    Drop-off: <strong>{item.dropOffLocation}</strong> • By {item.dropOffDeadline}
                                  </div>

                                  {/* Progress bar */}
                                  <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${Math.min(100, formatPercentage(pledged, needed))}%` }}
                                      className="h-full bg-emerald-500 rounded-full"
                                    />
                                  </div>
                                  <div className="flex justify-between text-[10px] font-semibold text-slate-600 mt-1">
                                    <span>{pledged} {item.unit} pledged</span>
                                    <span>{remainingNeeded} more needed</span>
                                  </div>
                                </div>

                                {/* Pledge button */}
                                <div className="text-right shrink-0 pl-3">
                                  <button
                                    onClick={() => toggleItemPledge(item.id, 1)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                      isSelected
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-100 hover:bg-emerald-100 text-slate-700'
                                    }`}
                                  >
                                    {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                                    <span>{isSelected ? 'Pledged' : 'Pledge'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* TICKETS, VENDORS & SPONSORSHIPS SECTION */}
        {(slotTypeFilter === 'all' || slotTypeFilter === 'tickets') && ticketTiers.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-wrap justify-between items-baseline gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  <Store className="w-4 h-4" />
                  Commercial Booths, Tickets & Sponsorships
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Tickets, Vendor Spaces & Sponsor Packages</h3>
              </div>
              <span className="text-xs text-slate-600 font-semibold">
                Official 501(c)(3) tax receipts provided for all contributions.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ticketTiers.map((tier) => {
                const selected = selectedTicketTiers.find(t => t.ticketTierId === tier.id);
                const isVendorTier = tier.type === 'vendor_booth';

                return (
                  <div
                    key={tier.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                          {tier.type.replace('_', ' ')}
                        </span>
                        {tier.boothDimensions && (
                          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {tier.boothDimensions}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mt-2">{tier.title}</h4>
                      <div className="text-2xl font-black text-indigo-600 mt-1">
                        {formatCurrency(tier.price)}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{tier.description}</p>

                      {/* Perks */}
                      {tier.perks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1">
                          {tier.perks.map((perk, pIdx) => (
                            <div key={pIdx} className="text-[11px] text-slate-700 flex items-center gap-1.5 font-medium">
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-200">
                      {isVendorTier ? (
                        <button
                          onClick={() => {
                            setSelectedVendorTier(tier);
                            setIsVendorModalOpen(true);
                          }}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
                        >
                          Apply for Vendor Booth
                        </button>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateTicketQty(tier.id, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center hover:bg-slate-300"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-sm">{selected?.quantity || 0}</span>
                            <button
                              onClick={() => updateTicketQty(tier.id, 1)}
                              className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center hover:bg-indigo-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* STICKY FLOATING ACTION BAR WHEN SELECTIONS ARE MADE */}
      {totalSelectionsCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md text-white p-4 z-40 border-t border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-extrabold text-sm sm:text-base">
                  {selectedShiftIds.length} Shift{selectedShiftIds.length !== 1 ? 's' : ''} + {selectedItemPledges.length} Item{selectedItemPledges.length !== 1 ? 's' : ''} + {selectedTicketTiers.length} Ticket{selectedTicketTiers.length !== 1 ? 's' : ''} Selected
                </span>
              </div>
              <span className="text-xs text-slate-400">
                1-click unified sign-up & digital waiver confirmation
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setSelectedShiftIds([]);
                  setSelectedItemPledges([]);
                  setSelectedTicketTiers([]);
                }}
                className="text-xs text-slate-400 hover:text-white px-3 py-2"
              >
                Clear Selections
              </button>

              <button
                onClick={() => setIsRegModalOpen(true)}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black py-3 px-8 rounded-xl text-sm shadow-lg shadow-indigo-900/40 transition transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign Up</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Registration Modal */}
      {isRegModalOpen && (
        <UnifiedRegistrationModal
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          event={currentEvent}
          selectedShiftIds={selectedShiftIds}
          selectedItemPledges={selectedItemPledges}
          selectedTicketTiers={selectedTicketTiers}
          initialDonation={directDonationAmount}
          onSuccess={(reg) => {
            setIsRegModalOpen(false);
            setSelectedShiftIds([]);
            setSelectedItemPledges([]);
            setSelectedTicketTiers([]);
            setConfirmedReg(reg);
          }}
        />
      )}

      {/* Vendor Application Modal */}
      {isVendorModalOpen && (
        <VendorApplicationModal
          isOpen={isVendorModalOpen}
          onClose={() => setIsVendorModalOpen(false)}
          event={currentEvent}
          selectedTier={selectedVendorTier}
        />
      )}

      {/* Share & QR Flyer Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={currentEvent.title}
        subTitle={currentEvent.tagline}
        url={`https://gatherraise.org/events/${currentEvent.slug}`}
      />

      {/* Self-Service Manage Registration Modal */}
      <ManageRegistration
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />

    </div>
  );
};
