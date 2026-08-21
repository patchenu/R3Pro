import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Event, TicketTier } from '../../types';
import { Modal } from '../common/Modal';
import { Store, FileText, Zap, ShieldCheck, Check, DollarSign, UserCheck, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface VendorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  selectedTier: TicketTier | null;
}

export const VendorApplicationModal: React.FC<VendorApplicationModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedTier
}) => {
  const { currentUser, vendorApplications, submitVendorApplication } = useApp();

  const isLoggedIn = Boolean(currentUser && currentUser.id !== 'user_guest' && currentUser.name && currentUser.name !== 'Guest Visitor');

  // Lookup prior vendor submissions
  const pastVendorApp = vendorApplications.find(v => 
    (currentUser.email && v.email && v.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser.name && (v.contactName.toLowerCase() === currentUser.name.toLowerCase() || v.businessName.toLowerCase() === currentUser.name.toLowerCase()))
  );

  const initialBusiness = currentUser.role === 'vendor' ? currentUser.name : (pastVendorApp?.businessName || '');
  const initialContact = isLoggedIn ? currentUser.name : (pastVendorApp?.contactName || '');
  const initialEmail = isLoggedIn ? currentUser.email : (pastVendorApp?.email || '');
  const initialPhone = (isLoggedIn && currentUser.phone) ? currentUser.phone : (pastVendorApp?.phone || '');
  const initialEin = pastVendorApp?.einTaxId || (currentUser.role === 'vendor' ? '82-1928401' : '');
  const initialWeb = pastVendorApp?.website || (currentUser.role === 'vendor' ? 'https://artisanbakes.com' : '');
  const initialCoi = pastVendorApp?.coiPolicyNumber || (currentUser.role === 'vendor' ? 'STATE-FARM-9812401' : '');

  const [businessName, setBusinessName] = useState(initialBusiness);
  const [contactName, setContactName] = useState(initialContact);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [einTaxId, setEinTaxId] = useState(initialEin);
  const [website, setWebsite] = useState(initialWeb);
  const [electricityNeeded, setElectricityNeeded] = useState<'none' | '110v_standard' | '220v_heavy' | 'self_generator'>('none');
  const [spaceRequirement, setSpaceRequirement] = useState(selectedTier?.boothDimensions || '10x10');
  const [coiPolicyNumber, setCoiPolicyNumber] = useState(initialCoi);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const bName = currentUser.role === 'vendor' ? currentUser.name : (pastVendorApp?.businessName || '');
      const cName = isLoggedIn ? currentUser.name : (pastVendorApp?.contactName || '');
      const mail = isLoggedIn ? currentUser.email : (pastVendorApp?.email || '');
      const ph = (isLoggedIn && currentUser.phone) ? currentUser.phone : (pastVendorApp?.phone || '');
      const ein = pastVendorApp?.einTaxId || (currentUser.role === 'vendor' ? '82-1928401' : '');
      const web = pastVendorApp?.website || (currentUser.role === 'vendor' ? 'https://artisanbakes.com' : '');
      const coi = pastVendorApp?.coiPolicyNumber || (currentUser.role === 'vendor' ? 'STATE-FARM-9812401' : '');

      setBusinessName(bName);
      setContactName(cName);
      setEmail(mail);
      setPhone(ph);
      setEinTaxId(ein);
      setWebsite(web);
      setCoiPolicyNumber(coi);
      setSpaceRequirement(selectedTier?.boothDimensions || '10x10');
      setSubmitted(false);
    }
  }, [isOpen, currentUser.id, selectedTier?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    submitVendorApplication({
      eventId: event.id,
      ticketTierId: selectedTier.id,
      businessName,
      contactName,
      email,
      phone,
      einTaxId,
      website,
      electricityNeeded,
      spaceRequirement,
      coiPolicyNumber
    });

    setSubmitted(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={submitted ? 'Application Received!' : `Vendor & Sponsor Application`}
      subtitle={selectedTier ? `${selectedTier.title} • ${formatCurrency(selectedTier.price)}` : event.title}
      maxWidth="2xl"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Thank You, {businessName}!</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your vendor application and Certificate of Insurance details have been received. The Committee Lead for Vendors & Sponsorships will review your submission and issue an official placement invoice and booth number.
          </p>
          <div className="pt-4">
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition"
            >
              Close Window
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLoggedIn && (
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Pre-filled from Vendor Profile ({currentUser.name})
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Contact and tax info pre-populated. Please validate and select electrical specifications below.
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 font-bold text-[10px] rounded-md shrink-0">
                ✓ Auto-Populated
              </span>
            </div>
          )}

          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
            <Store className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">{selectedTier?.title}</strong>
              <span>Fee: <strong>{formatCurrency(selectedTier?.price || 0)}</strong> • Capacity: {selectedTier?.capacity} spaces • 501(c)(3) business tax deductible.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Legal Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Artisan Bakery LLC"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Contact Name *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Manager / Owner Name"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="events@business.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tax ID / EIN *</label>
              <input
                type="text"
                required
                value={einTaxId}
                onChange={(e) => setEinTaxId(e.target.value)}
                placeholder="XX-XXXXXXX"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website / Instagram (Optional)</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Power / Electricity Requirements</label>
              <select
                value={electricityNeeded}
                onChange={(e) => setElectricityNeeded(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              >
                <option value="none">No Power Needed (Standard Setup)</option>
                <option value="110v_standard">110V 20A Standard Outlet</option>
                <option value="220v_heavy">220V 50A Heavy (Food Trucks / Commercial Grills)</option>
                <option value="self_generator">Self-Contained Quiet Inverter Generator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate of Insurance (COI) Policy #</label>
              <input
                type="text"
                value={coiPolicyNumber}
                onChange={(e) => setCoiPolicyNumber(e.target.value)}
                placeholder="Policy # / Carrier Name"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition"
            >
              Submit Application & Reserve Booth
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
