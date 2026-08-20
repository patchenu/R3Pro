import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Event, TicketTier } from '../../types';
import { Modal } from '../common/Modal';
import { Store, FileText, Zap, ShieldCheck, Check, DollarSign } from 'lucide-react';
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
  const { submitVendorApplication } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [einTaxId, setEinTaxId] = useState('');
  const [website, setWebsite] = useState('');
  const [electricityNeeded, setElectricityNeeded] = useState<'none' | '110v_standard' | '220v_heavy' | 'self_generator'>('none');
  const [spaceRequirement, setSpaceRequirement] = useState(selectedTier?.boothDimensions || '10x10');
  const [coiPolicyNumber, setCoiPolicyNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
