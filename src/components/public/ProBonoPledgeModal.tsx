import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Event, SubPart } from '../../types';
import { Modal } from '../common/Modal';
import { 
  Gift, HeartHandshake, CheckCircle2, Building2, Phone, Mail, 
  DollarSign, FileText, Check, ArrowRight, Sparkles, Award
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ProBonoPledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export const ProBonoPledgeModal: React.FC<ProBonoPledgeModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const { subParts, pledgeProBonoService, showToast } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Photography & Media');
  const [serviceDescription, setServiceDescription] = useState('');
  const [estimatedFmv, setEstimatedFmv] = useState<number>(500);
  const [selectedSubPartId, setSelectedSubPartId] = useState<string>('');
  const [confirmedReceiptNum, setConfirmedReceiptNum] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactName.trim() || !email.trim() || !serviceDescription.trim() || estimatedFmv <= 0) {
      showToast('error', 'Incomplete Form', 'Please enter your business contact details, description, and FMV valuation.');
      return;
    }

    const pledge = pledgeProBonoService({
      eventId: event.id,
      subPartId: selectedSubPartId || undefined,
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      serviceCategory,
      serviceDescription: serviceDescription.trim(),
      estimatedFmv: Number(estimatedFmv)
    });

    setConfirmedReceiptNum(pledge.inKindReceiptNumber);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setBusinessName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setServiceDescription('');
    setEstimatedFmv(500);
    setConfirmedReceiptNum('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Offer Pro-Bono Professional Services / Equipment"
      subtitle={`${event.title} • Community Partner In-Kind Giving`}
      maxWidth="2xl"
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header Callout */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-700">
              <h4 className="font-extrabold text-emerald-950 text-sm">Donate Your Business's Professional Services ($0 Net Cash)</h4>
              <p className="mt-0.5 leading-relaxed text-emerald-900/80">
                Local businesses, freelancers, and vendors who donate specialized services (e.g. photography, DJ/audio, event signage, floral decor, catering) receive an official <strong>IRS Publication 526/561 non-cash contribution acknowledgement</strong> and <strong>In-Kind Sponsor recognition</strong> on our campaign materials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Studio / Provider Name *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Pacific Coast Media & Sound"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. David Martinez"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@pacificsound.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
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
              <label className="block font-bold text-slate-700 mb-1">Service Category *</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Photography & Media">📸 Photography & Video Coverage</option>
                <option value="Audio / Visual & DJ">🎵 DJ, Audio & Live Sound Rig</option>
                <option value="Catering & Hospitality">☕ Catering, Bakery & Hospitality</option>
                <option value="Printing & Signage">🖨️ Large-Format Printing & Signage</option>
                <option value="Entertainment & Performers">🎭 Live Entertainment & Performers</option>
                <option value="Equipment & Rentals">🎪 Pop-Up Canopies & Furniture Rentals</option>
                <option value="Professional & Consulting">💼 Legal, Accounting & Marketing Consulting</option>
                <option value="Other">✨ Other Donated Specialty Service</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Fair Market Value (FMV) *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  step="10"
                  required
                  value={estimatedFmv}
                  onChange={(e) => setEstimatedFmv(Number(e.target.value))}
                  placeholder="500"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Used for IRS 501(c)(3) in-kind substantiation receipt.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Specific Committee / Department (Optional)</label>
              <select
                value={selectedSubPartId}
                onChange={(e) => setSelectedSubPartId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="">Event-Wide / General Support</option>
                {subParts.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Detailed Description of Donated Services / Items *</label>
              <textarea
                rows={3}
                required
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Describe what services, equipment, or manpower your company will provide on event day..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Submit Pro-Bono Pledge ({formatCurrency(estimatedFmv)} FMV)</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">Pro-Bono In-Kind Contribution Received!</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Thank you, <strong>{businessName}</strong>! Your generous donation of professional services has been recorded for <strong>{event.title}</strong>.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">In-Kind Receipt #:</span>
              <span className="font-mono font-bold text-slate-900">{confirmedReceiptNum}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Service Category:</span>
              <span className="font-bold text-slate-900">{serviceCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Fair Market Value (FMV):</span>
              <span className="font-black text-emerald-600">{formatCurrency(estimatedFmv)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-indigo-700">
              <span className="font-semibold">Sponsor Recognition:</span>
              <span className="font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>In-Kind Corporate Sponsor</span>
              </span>
            </div>
          </div>

          <div className="pt-3 flex justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
