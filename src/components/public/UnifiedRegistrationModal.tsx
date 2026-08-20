import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Event, Shift, ItemSlot, TicketTier, SubPart } from '../../types';
import { Modal } from '../common/Modal';
import { SignaturePad } from '../common/SignaturePad';
import { 
  Users, UserPlus, Trash2, Calendar, Gift, HeartHandshake, 
  CreditCard, ShieldCheck, AlertCircle, Sparkles, Check, ChevronRight 
} from 'lucide-react';
import { formatCurrency, formatTimeRange } from '../../utils/formatters';
import { WAIVER_TEMPLATES_DATA } from '../../data/templates';

interface UnifiedRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  selectedShiftIds: string[];
  selectedItemPledges: { itemSlotId: string; quantity: number }[];
  selectedTicketTiers: { ticketTierId: string; quantity: number }[];
  initialDonation: number;
  onSuccess: (reg: any) => void;
}

export const UnifiedRegistrationModal: React.FC<UnifiedRegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedShiftIds,
  selectedItemPledges,
  selectedTicketTiers,
  initialDonation,
  onSuccess
}) => {
  const { shifts, itemSlots, ticketTiers, subParts, claimSlotsAndRegister } = useApp();

  // Form State
  const [primaryName, setPrimaryName] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Family & Group Members State
  const [members, setMembers] = useState<{
    name: string;
    email: string;
    phone: string;
    relationship: 'Self' | 'Child' | 'Spouse' | 'Team Member';
    isMinor: boolean;
    age?: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    dietaryNotes: string;
  }[]>([
    {
      name: '',
      email: '',
      phone: '',
      relationship: 'Self',
      isMinor: false,
      emergencyContactName: '',
      emergencyContactPhone: '',
      dietaryNotes: ''
    }
  ]);

  // Mapping which member is taking which shift
  const [shiftAssignments, setShiftAssignments] = useState<{ shiftId: string; memberIndex: number }[]>(
    selectedShiftIds.map(id => ({ shiftId: id, memberIndex: 0 }))
  );

  // Financials State
  const [donationAmount, setDonationAmount] = useState(initialDonation);
  const [feeCovered, setFeeCovered] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe_card' | 'paypal' | 'apple_pay'>('stripe_card');

  // Legal Waiver Signatures State
  const [waiverSignatures, setWaiverSignatures] = useState<{
    memberIndex: number;
    waiverTemplateId: string;
    waiverTitle: string;
    waiverText: string;
    signerName: string;
    signerRelationship: string;
    signatureData: string;
  }[]>([]);

  // Stepper state (1: Information & Family, 2: Waivers, 3: Payment & Confirmation)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Calculate ticket total
  const ticketTotal = selectedTicketTiers.reduce((sum, st) => {
    const tier = ticketTiers.find(t => t.id === st.ticketTierId);
    return sum + (tier ? tier.price * st.quantity : 0);
  }, 0);

  const processingFee = (ticketTotal + donationAmount) > 0 ? (ticketTotal + donationAmount) * 0.029 + 0.30 : 0;
  const grandTotal = ticketTotal + donationAmount + (feeCovered ? processingFee : 0);

  // Shifts requiring waivers
  const shiftsRequiringWaivers = selectedShiftIds
    .map(id => shifts.find(s => s.id === id))
    .filter((s): s is Shift => !!s && s.requiresWaiver);

  // Add Family Member
  const addFamilyMember = () => {
    setMembers(prev => [
      ...prev,
      {
        name: '',
        email: '',
        phone: '',
        relationship: 'Child',
        isMinor: true,
        age: 14,
        emergencyContactName: primaryName,
        emergencyContactPhone: primaryPhone,
        dietaryNotes: ''
      }
    ]);
  };

  const removeFamilyMember = (index: number) => {
    if (members.length === 1) return;
    setMembers(prev => prev.filter((_, i) => i !== index));
    setShiftAssignments(prev => prev.map(sa => sa.memberIndex === index ? { ...sa, memberIndex: 0 } : sa));
  };

  const updateMember = (index: number, field: string, value: any) => {
    setMembers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (index === 0 && field === 'name') setPrimaryName(value);
      if (index === 0 && field === 'email') setPrimaryEmail(value);
      if (index === 0 && field === 'phone') setPrimaryPhone(value);
      return updated;
    });
  };

  // Overlap Validation Check
  const checkOverlap = () => {
    for (let i = 0; i < shiftAssignments.length; i++) {
      for (let j = i + 1; j < shiftAssignments.length; j++) {
        if (shiftAssignments[i].memberIndex === shiftAssignments[j].memberIndex) {
          const shift1 = shifts.find(s => s.id === shiftAssignments[i].shiftId);
          const shift2 = shifts.find(s => s.id === shiftAssignments[j].shiftId);
          if (shift1 && shift2) {
            const start1 = new Date(shift1.startTime).getTime();
            const end1 = new Date(shift1.endTime).getTime();
            const start2 = new Date(shift2.startTime).getTime();
            const end2 = new Date(shift2.endTime).getTime();

            if (start1 < end2 && end1 > start2) {
              const memberName = members[shiftAssignments[i].memberIndex]?.name || 'Participant';
              return `Time Conflict: ${memberName} is assigned to both "${shift1.title}" and "${shift2.title}" which overlap in time.`;
            }
          }
        }
      }
    }
    return null;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!primaryName.trim() || !primaryEmail.trim() || !primaryPhone.trim()) {
      setFormError('Please provide your name, email, and mobile phone number.');
      return;
    }

    // Check overlap
    const conflict = checkOverlap();
    if (conflict) {
      setFormError(conflict);
      return;
    }

    // Check if waivers are needed
    if (shiftsRequiringWaivers.length > 0) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleFinalSubmit = () => {
    setFormError(null);

    const payload = {
      primaryName,
      primaryEmail,
      primaryPhone,
      notes,
      members,
      shiftSelections: shiftAssignments.map(sa => ({ shiftId: sa.shiftId, groupMemberIndex: sa.memberIndex })),
      itemSelections: selectedItemPledges,
      ticketSelections: selectedTicketTiers,
      donationAmount,
      feeCovered,
      isAnonymous,
      paymentMethod,
      waiverSignatures
    };

    const res = claimSlotsAndRegister(payload);
    if (res.success && res.registration) {
      onSuccess(res.registration);
    } else {
      setFormError(res.error || 'Failed to complete registration.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Sign-Up & Support"
      subtitle={`Step ${step} of 3 • ${event.title}`}
      maxWidth="3xl"
    >
      {/* Progress Stepper Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</div>
          <span>Contact & Family</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</div>
          <span>Digital Waivers</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 text-xs font-bold ${step === 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</div>
          <span>Confirmation & Checkout</span>
        </div>
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* STEP 1: Participant & Family Information */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-6">
          
          {/* Primary Contact */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Primary Contact & Volunteer Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={members[0].name}
                  onChange={(e) => updateMember(0, 'name', e.target.value)}
                  placeholder="e.g. David Chen"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={members[0].email}
                  onChange={(e) => updateMember(0, 'email', e.target.value)}
                  placeholder="david@example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (For SMS Reminders) *</label>
                <input
                  type="tel"
                  required
                  value={members[0].phone}
                  onChange={(e) => updateMember(0, 'phone', e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Additional Family / Group Members */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  Family & Group Members (Optional)
                </h4>
                <p className="text-[11px] text-slate-500">Sign up your children or team members under your contact.</p>
              </div>

              <button
                type="button"
                onClick={addFamilyMember}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Child / Family Member
              </button>
            </div>

            {members.slice(1).map((member, idx) => {
              const actualIdx = idx + 1;
              return (
                <div key={actualIdx} className="bg-white p-3 rounded-xl border border-slate-200 mb-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-900">Member #{actualIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(actualIdx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={member.name}
                        onChange={(e) => updateMember(actualIdx, 'name', e.target.value)}
                        placeholder="Child / Member Name"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600">Relationship</label>
                      <select
                        value={member.relationship}
                        onChange={(e) => updateMember(actualIdx, 'relationship', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Child">Child (Minor)</option>
                        <option value="Spouse">Spouse / Partner</option>
                        <option value="Team Member">Team Member</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600">Age / Minor Status</label>
                      <input
                        type="number"
                        min={5}
                        max={99}
                        value={member.age || ''}
                        onChange={(e) => updateMember(actualIdx, 'age', parseInt(e.target.value) || 0)}
                        placeholder="Age"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600">Dietary / Medical</label>
                      <input
                        type="text"
                        value={member.dietaryNotes}
                        onChange={(e) => updateMember(actualIdx, 'dietaryNotes', e.target.value)}
                        placeholder="e.g. Nut allergy"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shift Slot Assignments to Members */}
          {selectedShiftIds.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Assign Shift Roles to Participants
              </h4>

              <div className="space-y-2.5">
                {selectedShiftIds.map((shiftId, idx) => {
                  const shift = shifts.find(s => s.id === shiftId);
                  const subPart = shift ? subParts.find(sp => sp.id === shift.subPartId) : null;
                  return (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">{subPart?.name}</span>
                        <h5 className="text-xs font-bold text-slate-900">{shift?.title}</h5>
                        <span className="text-[11px] text-slate-500">
                          {shift ? `${shift.startTime.slice(11,16)} - ${shift.endTime.slice(11,16)}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Assign To:</label>
                        <select
                          value={shiftAssignments.find(sa => sa.shiftId === shiftId)?.memberIndex || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setShiftAssignments(prev => prev.map(sa => sa.shiftId === shiftId ? { ...sa, memberIndex: val } : sa));
                          }}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50"
                        >
                          {members.map((m, mIdx) => (
                            <option key={mIdx} value={mIdx}>
                              {m.name || (mIdx === 0 ? 'Primary Volunteer' : `Member #${mIdx + 1}`)} ({m.relationship})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Organizer Notes / Special Requests (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special accommodations or comments for the planning leads..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-indigo-200 transition"
            >
              <span>Continue to {shiftsRequiringWaivers.length > 0 ? 'Legal Waivers' : 'Checkout'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Legal Digital Waivers */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Mandatory Legal Liability & Parental Consent Verification
            </div>
            Please review and sign the required volunteer agreement(s) below. Electronic signatures are legally binding under federal and state compliance regulations.
          </div>

          {shiftsRequiringWaivers.map((shift, idx) => {
            const assignment = shiftAssignments.find(sa => sa.shiftId === shift.id);
            const memberIdx = assignment?.memberIndex || 0;
            const assignedMember = members[memberIdx];
            const isMinor = assignedMember?.isMinor || assignedMember?.relationship === 'Child';
            const template = isMinor 
              ? WAIVER_TEMPLATES_DATA.find(t => t.type === 'minor_consent') || WAIVER_TEMPLATES_DATA[0]
              : WAIVER_TEMPLATES_DATA.find(t => t.type === 'general_liability') || WAIVER_TEMPLATES_DATA[0];

            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full uppercase">
                      {isMinor ? 'Minor Parental Consent' : 'General Liability Release'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{template.title}</h4>
                    <p className="text-xs text-slate-500">
                      Participant: <strong>{assignedMember?.name || 'Volunteer'}</strong> {isMinor && '(Parent Signature Required)'}
                    </p>
                  </div>
                </div>

                {/* Waiver Legal Text Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-serif leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line">
                  {template.content}
                </div>

                {/* Digital Signature Pad */}
                <SignaturePad
                  signerName={isMinor ? `${primaryName} (Parent/Guardian of ${assignedMember.name})` : (assignedMember.name || primaryName)}
                  onSignatureCapture={(signatureData, isTyped) => {
                    setWaiverSignatures(prev => {
                      const filtered = prev.filter(w => w.memberIndex !== memberIdx);
                      if (!signatureData) return filtered;
                      return [
                        ...filtered,
                        {
                          memberIndex: memberIdx,
                          waiverTemplateId: template.id,
                          waiverTitle: template.title,
                          waiverText: template.content,
                          signerName: isMinor ? `${primaryName} (Parent/Guardian)` : assignedMember.name,
                          signerRelationship: isMinor ? 'Parent / Legal Guardian' : 'Self',
                          signatureData
                        }
                      ];
                    });
                  }}
                />
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Back to Contact
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-indigo-200 transition"
            >
              <span>Accept & Continue to Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Summary, Voluntary Donation & Payment Checkout */}
      {step === 3 && (
        <div className="space-y-6">
          
          {/* Summary of selections */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Sign-Up Order Summary</h4>
            <div className="divide-y divide-slate-200 text-xs space-y-2">
              
              {/* Volunteer Shifts */}
              {selectedShiftIds.map((sId, idx) => {
                const shift = shifts.find(s => s.id === sId);
                const subPart = shift ? subParts.find(sp => sp.id === shift.subPartId) : null;
                const assignment = shiftAssignments.find(sa => sa.shiftId === sId);
                const member = members[assignment?.memberIndex || 0];

                return (
                  <div key={idx} className="pt-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">Volunteer: {shift?.title}</span>
                      <span className="block text-[11px] text-slate-500">{member?.name || primaryName} • {subPart?.name}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">FREE</span>
                  </div>
                );
              })}

              {/* Item Pledges */}
              {selectedItemPledges.map((ip, idx) => {
                const item = itemSlots.find(i => i.id === ip.itemSlotId);
                return (
                  <div key={idx} className="pt-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">Item Supply Pledge: {item?.itemName}</span>
                      <span className="block text-[11px] text-slate-500">Qty: {ip.quantity} {item?.unit}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">PLEDGE</span>
                  </div>
                );
              })}

              {/* Ticket Purchases */}
              {selectedTicketTiers.map((st, idx) => {
                const tier = ticketTiers.find(t => t.id === st.ticketTierId);
                return (
                  <div key={idx} className="pt-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">Ticket: {tier?.title}</span>
                      <span className="block text-[11px] text-slate-500">Qty: {st.quantity} @ {formatCurrency(tier?.price || 0)}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency((tier?.price || 0) * st.quantity)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Monetary Donation Widget */}
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              Add an Optional Direct Donation to {event.title}
            </h4>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[0, 25, 50, 100].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDonationAmount(amt)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    donationAmount === amt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {amt === 0 ? 'No Donation' : `$${amt}`}
                </button>
              ))}
            </div>

            {donationAmount > 0 && (
              <div className="space-y-2 pt-2 border-t border-indigo-100">
                {/* Fee Coverage Toggle */}
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feeCovered}
                    onChange={(e) => setFeeCovered(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>
                    Add <strong>{formatCurrency(processingFee)}</strong> to cover processing fees so 100% of my gift supports the organization.
                  </span>
                </label>

                {/* Anonymous Donation Toggle */}
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Make this donation anonymous on public leaderboards.</span>
                </label>
              </div>
            )}
          </div>

          {/* Payment Method Selector if Total > 0 */}
          {grandTotal > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe_card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'stripe_card'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'apple_pay'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base font-black"> Pay</span>
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'paypal'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base font-black text-blue-600">PayPal</span>
                  <span>PayPal</span>
                </button>
              </div>
            </div>
          )}

          {/* Grand Total Bar */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Amount Due</span>
              <div className="text-xl font-black">{formatCurrency(grandTotal)}</div>
            </div>

            <button
              type="button"
              onClick={handleFinalSubmit}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black py-3 px-6 rounded-xl text-xs shadow-lg shadow-emerald-900/30 transition transform hover:scale-105 active:scale-100 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{grandTotal > 0 ? `Pay ${formatCurrency(grandTotal)} & Confirm` : 'Complete Sign-Up'}</span>
            </button>
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setStep(shiftsRequiringWaivers.length > 0 ? 2 : 1)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ← Back
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
