import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Event, TicketTier } from '../../types';
import { Modal } from '../common/Modal';
import { 
  Store, Award, CheckCircle2, ShieldCheck, Zap, FileText, 
  ArrowRight, Download, Sparkles, Building2, Phone, Mail, Globe, Check
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface CommercialMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export const CommercialMarketplaceModal: React.FC<CommercialMarketplaceModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const { ticketTiers, submitVendorApplication, showToast } = useApp();

  const eventTiers = ticketTiers.filter(t => t.eventId === event.id && (t.type === 'vendor_booth' || t.type === 'sponsor_package'));

  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(eventTiers[0] || null);
  const [activeTab, setActiveTab] = useState<'all' | 'vendor_booth' | 'sponsor_package'>('all');
  const [step, setStep] = useState<'select' | 'details' | 'success'>('select');

  // Business Details Form State
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [einTaxId, setEinTaxId] = useState('');
  const [website, setWebsite] = useState('');
  const [electricityNeeded, setElectricityNeeded] = useState<'none' | '110v_standard' | '220v_heavy' | 'self_generator'>('none');
  const [spaceRequirement, setSpaceRequirement] = useState('10x10 Canopy Space');
  const [coiPolicyNumber, setCoiPolicyNumber] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [confirmedAppId, setConfirmedAppId] = useState('');

  const filteredTiers = eventTiers.filter(t => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  const handleSelectTier = (tier: TicketTier) => {
    setSelectedTier(tier);
    if (tier.type === 'vendor_booth') {
      setSpaceRequirement(tier.boothDimensions || '10x10 Booth');
      setElectricityNeeded(tier.powerProvided ? '110v_standard' : 'none');
    }
    setStep('details');
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier || !businessName.trim() || !contactName.trim() || !email.trim()) {
      showToast('error', 'Missing Information', 'Please fill out all required business fields.');
      return;
    }

    submitVendorApplication({
      eventId: event.id,
      ticketTierId: selectedTier.id,
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      einTaxId: einTaxId.trim() || 'Pending on file',
      website: website.trim(),
      electricityNeeded,
      spaceRequirement: spaceRequirement.trim(),
      coiPolicyNumber: coiPolicyNumber.trim() || undefined
    });

    const generatedId = 'INV-VEND-' + Math.floor(1000 + Math.random() * 9000);
    setConfirmedAppId(generatedId);
    setStep('success');
  };

  const handleReset = () => {
    setStep('select');
    setSelectedTier(eventTiers[0] || null);
    setBusinessName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setEinTaxId('');
    setWebsite('');
    setCoiPolicyNumber('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Commercial Vendor & Corporate Sponsorship Hub"
      subtitle={`${event.title} • Commercial Marketplace & Partner Opportunities`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Business & Underwriting Portal</div>
              <h3 className="text-base font-extrabold text-white">Commercial Partner Registration</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className={`px-2.5 py-1 rounded-lg ${step === 'select' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              1. Select Package
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className={`px-2.5 py-1 rounded-lg ${step === 'details' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              2. Business Details & COI
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className={`px-2.5 py-1 rounded-lg ${step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              3. Confirmation
            </span>
          </div>
        </div>

        {/* STEP 1: SELECT PACKAGE */}
        {step === 'select' && (
          <div className="space-y-5">
            {/* Category Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Opportunities ({eventTiers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vendor_booth')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'vendor_booth' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>🎪 Vendor Booths & Food Trucks</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sponsor_package')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'sponsor_package' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>💎 Corporate Underwriting Tiers</span>
              </button>
            </div>

            {filteredTiers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">No commercial packages currently open</div>
                <p className="text-[11px] text-slate-500 mt-1">Please contact the event organizer for custom sponsorship arrangements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                      tier.type === 'sponsor_package' 
                        ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-400' 
                        : 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tier.type === 'sponsor_package' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tier.type.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {tier.capacity - tier.claimedCount} of {tier.capacity} spots left
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900">{tier.title}</h4>
                      <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(tier.price)}</div>
                      {tier.fairMarketValue > 0 && (
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          ✓ Est. Tax-Deductible Contribution: {formatCurrency(Math.max(0, tier.price - tier.fairMarketValue))}
                        </div>
                      )}
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3">{tier.description}</p>

                      {tier.perks && tier.perks.length > 0 && (
                        <div className="mt-3 space-y-1.5 pt-3 border-t border-slate-200/60">
                          {tier.perks.map((perk, pIdx) => (
                            <div key={pIdx} className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      {tier.boothDimensions && (
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" />
                          <span>Space: {tier.boothDimensions}</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelectTier(tier)}
                        className={`px-4 py-2 text-xs font-extrabold text-white rounded-xl shadow-md transition flex items-center gap-1.5 ml-auto ${
                          tier.type === 'sponsor_package' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        <span>Select & Enter Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: BUSINESS DETAILS & COI INTAKE */}
        {step === 'details' && selectedTier && (
          <form onSubmit={handleSubmitApplication} className="space-y-5">
            {/* Selected Tier Banner */}
            <div className="p-4 bg-slate-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Selected Opportunity:</span>
                <div className="text-sm font-black text-slate-900">{selectedTier.title} — {formatCurrency(selectedTier.price)}</div>
              </div>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Change Selection &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Business Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Artisan Bakery LLC"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authorized Representative Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jane Doe (Owner / Marketing Director)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Contact Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Federal EIN / Tax ID (For 501c3 Receipt)</label>
                <input
                  type="text"
                  value={einTaxId}
                  onChange={(e) => setEinTaxId(e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Website / Social URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://mybusiness.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Vendor Specific Questions */}
              {selectedTier.type === 'vendor_booth' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Electrical Power Requirements *</span>
                    </label>
                    <select
                      value={electricityNeeded}
                      onChange={(e) => setElectricityNeeded(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="none">No Electricity Needed (Self-contained)</option>
                      <option value="110v_standard">Standard 110V 20A Outlet (Lights/Point of Sale)</option>
                      <option value="220v_heavy">Heavy Duty 220V 50A Hookup (Commercial Ovens/Heaters)</option>
                      <option value="self_generator">Bringing Whisper-Quiet Inverter Generator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Space Footprint Requirement</label>
                    <input
                      type="text"
                      value={spaceRequirement}
                      onChange={(e) => setSpaceRequirement(e.target.value)}
                      placeholder="e.g. 10x10 Tent or 28ft Food Truck"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Certificate of Insurance (COI) Policy Number & Insurer</span>
                    </label>
                    <input
                      type="text"
                      value={coiPolicyNumber}
                      onChange={(e) => setCoiPolicyNumber(e.target.value)}
                      placeholder="e.g. State Farm Policy #94820-A (Must name organization as additional insured)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Products / Offerings Description</label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Describe items being sold or company logo/marketing assets provided..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                &larr; Back to Packages
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Submit Application & Order ({formatCurrency(selectedTier.price)})</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS & CONFIRMATION */}
        {step === 'success' && selectedTier && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">Commercial Registration Submitted!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Thank you, <strong>{businessName}</strong>. Your commercial registration for <strong>{selectedTier.title}</strong> has been received by the event committee.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Reference / Invoice #:</span>
                <span className="font-mono font-bold text-slate-900">{confirmedAppId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Package / Pitch:</span>
                <span className="font-bold text-slate-900">{selectedTier.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Total Cost:</span>
                <span className="font-black text-emerald-600">{formatCurrency(selectedTier.price)}</span>
              </div>
              {selectedTier.fairMarketValue > 0 && (
                <div className="flex justify-between pt-2 border-t border-slate-200 text-emerald-800">
                  <span className="font-semibold">IRS 501(c)(3) Tax Deduction:</span>
                  <span className="font-bold">{formatCurrency(selectedTier.price - selectedTier.fairMarketValue)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
