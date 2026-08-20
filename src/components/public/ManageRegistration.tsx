import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Registration, Shift, SubPart } from '../../types';
import { Modal } from '../common/Modal';
import { 
  KeyRound, Search, CheckCircle2, XCircle, Calendar, 
  MapPin, Phone, ShieldCheck, Download, Trash2, ArrowLeft 
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { generateIcsFile } from '../../utils/calendar';

interface ManageRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageRegistration: React.FC<ManageRegistrationProps> = ({ isOpen, onClose }) => {
  const { registrations, cancelRegistration, shifts, subParts, currentEvent } = useApp();
  const [tokenInput, setTokenInput] = useState('');
  const [activeReg, setActiveReg] = useState<Registration | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = tokenInput.trim();
    const found = registrations.find(r => r.manageToken === cleaned || r.id === cleaned || r.primaryPhone.includes(cleaned) || r.primaryEmail.toLowerCase() === cleaned.toLowerCase());
    
    if (found) {
      setActiveReg(found);
    } else {
      setErrorMsg('No registration found with that token, email, or phone number.');
    }
  };

  const handleCancel = () => {
    if (!activeReg) return;
    if (window.confirm('Are you sure you want to cancel this entire sign-up? Your claimed shifts and pledged items will be released to others.')) {
      cancelRegistration(activeReg.manageToken);
      setActiveReg(null);
      onClose();
    }
  };

  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Your Registration"
      subtitle="View, update, or cancel your sign-up without logging in"
      maxWidth="xl"
    >
      {!activeReg ? (
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Enter Your Manage Token, Email, or Phone</span>
              <span className="text-slate-600">Enter the confirmation code from your booking receipt to modify your details.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmation Code / Email / Phone</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. tok_d83fa9b20184c7e1990a2 or david.chen@gmail.com"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Find Sign-Up
              </button>
            </div>
            {errorMsg && <p className="text-rose-600 text-xs mt-1.5">{errorMsg}</p>}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-start bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Active Sign-Up Record</span>
              <h4 className="text-base font-bold text-slate-900">{activeReg.primaryName}</h4>
              <p className="text-xs text-slate-500">{activeReg.primaryEmail} • {activeReg.primaryPhone}</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg uppercase">
              {activeReg.status}
            </span>
          </div>

          {/* Shifts */}
          <div>
            <h5 className="text-xs font-bold uppercase text-slate-500 mb-2">Claimed Volunteer Shifts</h5>
            <div className="space-y-2">
              {activeReg.shiftClaims.map((claim, idx) => {
                const shift = shiftMap.get(claim.shiftId);
                const subPart = shift ? subPartMap.get(shift.subPartId) : null;
                const member = activeReg.members.find(m => m.id === claim.groupMemberId) || activeReg.members[0];

                return (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{shift?.title}</span>
                      <span className="block text-slate-500">{member.name} • {subPart?.name}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">
                      {shift ? `${shift.startTime.slice(11,16)} - ${shift.endTime.slice(11,16)}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveReg(null)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Look Up Another
            </button>

            <button
              onClick={handleCancel}
              className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Cancel Registration
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
