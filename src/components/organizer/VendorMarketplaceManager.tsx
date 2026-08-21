import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorApplication, TicketTier, TicketType } from '../../types';
import { 
  Store, Check, X, ShieldCheck, Zap, DollarSign, MapPin, 
  Plus, Edit3, Trash2, Tag, Layers, Award, Sparkles, AlertCircle, FileText, CheckCircle2 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';

export const VendorMarketplaceManager: React.FC = () => {
  const { 
    currentEvent, ticketTiers, vendorApplications, 
    approveVendor, rejectVendor, 
    createTicketTier, updateTicketTier, deleteTicketTier 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tiers' | 'applications'>('tiers');
  const [tierFilter, setTierFilter] = useState<'all' | TicketType>('all');

  // Modal State for Add / Edit Tier
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<TicketTier | null>(null);

  // Form Fields
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

  // Delete Confirmation State
  const [deletingTierId, setDeletingTierId] = useState<string | null>(null);

  // Booth allocation state for applications
  const [selectedBoothNumber, setSelectedBoothNumber] = useState('Booth #A-14');

  const boothOptions = [
    'Booth #A-1', 'Booth #A-2', 'Booth #A-3', 'Booth #A-14', 'Booth #A-15',
    'Food Truck Bay #1', 'Food Truck Bay #2', 'Food Truck Bay #3'
  ];

  const handleOpenAddModal = (defaultType: TicketType = 'sponsor_package') => {
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
    setIsTierModalOpen(true);
  };

  const handleOpenEditModal = (tier: TicketTier) => {
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
    setIsTierModalOpen(true);
  };

  const handleAddPerk = () => {
    if (!newPerkInput.trim()) return;
    setTierPerks([...tierPerks, newPerkInput.trim()]);
    setNewPerkInput('');
  };

  const handleRemovePerk = (index: number) => {
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

    setIsTierModalOpen(false);
  };

  const handleDeleteTier = (tierId: string) => {
    deleteTicketTier(tierId);
    setDeletingTierId(null);
  };

  const filteredTiers = ticketTiers.filter(t => {
    if (tierFilter === 'all') return true;
    return t.type === tierFilter;
  });

  const sponsorCount = ticketTiers.filter(t => t.type === 'sponsor_package').length;
  const vendorCount = ticketTiers.filter(t => t.type === 'vendor_booth').length;
  const ticketCount = ticketTiers.filter(t => t.type === 'admission_ticket' || t.type === 'raffle').length;

  return (
    <div className="space-y-6">
      {/* Studio Header & Navigation Tabs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-black text-slate-900">Commercial Sponsors, Vendors & Tickets Studio</h3>
              <p className="text-xs text-slate-500">
                Design corporate underwriting tiers, artisan marketplace spaces, and review incoming intake applications
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'tiers'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Packages & Tiers ({ticketTiers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Intake Applications ({vendorApplications.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SPONSOR PACKAGES & COMMERCIAL TIERS BUILDER */}
      {activeTab === 'tiers' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Filter & Add Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTierFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  tierFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Packages ({ticketTiers.length})
              </button>

              <button
                onClick={() => setTierFilter('sponsor_package')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  tierFilter === 'sponsor_package'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Sponsor Tiers ({sponsorCount})</span>
              </button>

              <button
                onClick={() => setTierFilter('vendor_booth')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  tierFilter === 'vendor_booth'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Vendor Booths ({vendorCount})</span>
              </button>

              <button
                onClick={() => setTierFilter('admission_ticket')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  tierFilter === 'admission_ticket'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Tickets & Wristbands ({ticketCount})</span>
              </button>
            </div>

            {/* Create Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddModal('sponsor_package')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Sponsor Package / Tier</span>
              </button>
            </div>
          </div>

          {/* Packages Grid */}
          {filteredTiers.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No Packages in this Category</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Build high-value corporate sponsor packages or vendor spaces to accelerate your campaign goal.
              </p>
              <button
                onClick={() => handleOpenAddModal('sponsor_package')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Tier</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTiers.map((tier) => {
                const percentSold = tier.capacity > 0 ? Math.round((tier.claimedCount / tier.capacity) * 100) : 0;
                const taxDeductiblePortion = Math.max(0, tier.price - tier.fairMarketValue);

                return (
                  <div
                    key={tier.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition relative group"
                  >
                    <div>
                      {/* Top Header: Badge & Actions */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tier.type === 'sponsor_package' ? 'bg-indigo-100 text-indigo-800' :
                          tier.type === 'vendor_booth' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tier.type.replace('_', ' ')}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(tier)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit / Modify Package"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTierId(tier.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Package Title & Price */}
                      <h4 className="text-base font-extrabold text-slate-900">{tier.title}</h4>
                      
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-indigo-600">
                          {formatCurrency(tier.price)}
                        </span>
                        {tier.type === 'sponsor_package' && (
                          <span className="text-[11px] text-slate-500">
                            ({formatCurrency(taxDeductiblePortion)} tax-deductible)
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {tier.description}
                      </p>

                      {/* Capacity & Claimed Progress */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-500">Capacity & Claimed:</span>
                          <span className="text-slate-800">{tier.claimedCount} / {tier.capacity} claimed ({percentSold}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentSold >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(100, percentSold)}%` }}
                          />
                        </div>
                      </div>

                      {/* Vendor Specs (if vendor booth) */}
                      {tier.type === 'vendor_booth' && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                          {tier.boothDimensions && (
                            <span className="px-2 py-0.5 bg-slate-100 font-mono text-slate-700 rounded-md">
                              Size: {tier.boothDimensions}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold ${
                            tier.powerProvided ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Zap className="w-3 h-3" />
                            {tier.powerProvided ? 'Electric Hookup Included' : 'No Electricity'}
                          </span>
                        </div>
                      )}

                      {/* Perks Checklist */}
                      {tier.perks && tier.perks.length > 0 && (
                        <div className="mt-4 space-y-1.5 bg-slate-50 p-3 rounded-xl">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Package Inclusions:</span>
                          {tier.perks.map((perk, pIdx) => (
                            <div key={pIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Meta & Fast Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {tier.instantCheckout ? '⚡ Instant Checkout' : '📋 Lead Review Required'}
                      </span>
                      <button
                        onClick={() => handleOpenEditModal(tier)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>Modify Package</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTAKE APPLICATIONS & SPACE ALLOCATION */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Commercial Applications Queue</h4>
              <p className="text-xs text-slate-500">Review business Tax IDs, Certificates of Insurance (COI), and assign booth pitches</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
              {vendorApplications.length} Submissions
            </span>
          </div>

          {vendorApplications.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No Incoming Applications</h4>
              <p className="text-xs text-slate-500 mt-1">
                Vendor submissions from the public portal will appear here for 1-click review.
              </p>
            </div>
          ) : (
            vendorApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">{app.businessName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    {app.assignedBoothNumber && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-md">
                        {app.assignedBoothNumber}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600">
                    Contact: <strong>{app.contactName}</strong> ({app.email} • {app.phone})
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>Tax ID / EIN: <strong className="text-slate-800">{app.einTaxId}</strong></span>
                    <span>Space: <strong className="text-slate-800">{app.spaceRequirement}</strong></span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      Power: <strong className="text-slate-800">{app.electricityNeeded.replace('_', ' ')}</strong>
                    </span>
                    {app.coiPolicyNumber && (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        COI: {app.coiPolicyNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Approval / Allocation Actions */}
                {app.status === 'pending_review' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedBoothNumber}
                      onChange={(e) => setSelectedBoothNumber(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-slate-50 font-bold"
                    >
                      {boothOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => rejectVendor(app.id)}
                      className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                      title="Decline Application"
                    >
                      <X className="w-4 h-4 text-rose-500" />
                    </button>

                    <button
                      onClick={() => approveVendor(app.id, selectedBoothNumber)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Issue Invoice
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT SPONSOR PACKAGE OR TICKET TIER */}
      {isTierModalOpen && (
        <Modal
          isOpen={isTierModalOpen}
          onClose={() => setIsTierModalOpen(false)}
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
                      id="powerCheck"
                      checked={tierPowerProvided}
                      onChange={(e) => setTierPowerProvided(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <label htmlFor="powerCheck" className="font-bold text-slate-700 cursor-pointer">
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
                        handleAddPerk();
                      }
                    }}
                    placeholder="e.g. Dedicated Logo on Stage, 4 VIP passes, Social Media Mention..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddPerk}
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
                        onClick={() => handleRemovePerk(pIdx)}
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
                  id="instantCheckoutCheck"
                  checked={tierInstantCheckout}
                  onChange={(e) => setTierInstantCheckout(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="instantCheckoutCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Enable Instant Self-Service Checkout (If unchecked, requires organizer review)
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTierModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{editingTier ? 'Save Package Changes' : 'Publish Package Tier'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: DELETE CONFIRMATION */}
      {deletingTierId && (
        <Modal
          isOpen={!!deletingTierId}
          onClose={() => setDeletingTierId(null)}
          title="Delete Package / Tier"
          subtitle="Are you sure you want to permanently remove this tier from the campaign?"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Removing this package will remove it from the public event page. Existing claimed invoices and payments will remain in your audit ledger.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTierId(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTier(deletingTierId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
