import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Registration, Shift, SubPart } from '../../types';
import { 
  Tablet, Search, CheckCircle2, ShieldCheck, 
  MapPin, Phone, UserCheck, AlertCircle, ArrowLeft, QrCode 
} from 'lucide-react';
import { SignaturePad } from '../common/SignaturePad';
import { WAIVER_TEMPLATES_DATA } from '../../data/templates';
import confetti from 'canvas-confetti';

export const KioskSelfCheckIn: React.FC = () => {
  const { currentEvent, currentOrg, registrations, shifts, subParts, toggleCheckIn, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [signingWaiverForMember, setSigningWaiverForMember] = useState<{ member: any; shift: any } | null>(null);
  const [checkInSuccessMember, setCheckInSuccessMember] = useState<string | null>(null);

  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));

  const matchingRegistrations = searchQuery.trim().length >= 2
    ? registrations.filter(r => 
        r.primaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.primaryPhone.includes(searchQuery) ||
        r.members.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelectRegistration = (reg: Registration) => {
    setSelectedReg(reg);
    setSearchQuery('');
  };

  const handleCheckInMember = (reg: Registration, shiftId: string, memberId: string) => {
    const member = reg.members.find(m => m.id === memberId) || reg.members[0];
    const shift = shiftMap.get(shiftId);
    const waiver = reg.waivers.find(w => w.groupMemberId === member.id);

    // If shift requires waiver and waiver is not signed, trigger door signature pad
    if (shift?.requiresWaiver && !waiver) {
      setSigningWaiverForMember({ member, shift });
      return;
    }

    toggleCheckIn(reg.id, shiftId, member.id);
    setCheckInSuccessMember(member.name);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    setTimeout(() => {
      setCheckInSuccessMember(null);
    }, 4000);
  };

  const handleDoorWaiverSigned = (signatureData: string) => {
    if (!signingWaiverForMember || !selectedReg) return;
    const { member, shift } = signingWaiverForMember;

    // Toggle check in
    toggleCheckIn(selectedReg.id, shift.id, member.id);
    setSigningWaiverForMember(null);
    setCheckInSuccessMember(member.name);

    showToast('success', 'Waiver Signed & Checked In', `${member.name} is now checked in for ${shift.title}.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col justify-between">
      
      {/* Top Kiosk Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE ON-SITE CHECK-IN KIOSK
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">{currentEvent.title}</h1>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold">{currentOrg.name}</span>
          <div className="text-[11px] font-mono text-slate-500">Kiosk Station #1</div>
        </div>
      </div>

      {/* Main Kiosk Interaction Center */}
      <div className="max-w-2xl mx-auto w-full my-auto py-8">
        
        {checkInSuccessMember ? (
          <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-3xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/50">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white">Welcome, {checkInSuccessMember}!</h2>
            <p className="text-base text-emerald-200">
              You are officially checked in! Please proceed to your designated shift location.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setCheckInSuccessMember(null);
                  setSelectedReg(null);
                }}
                className="bg-white text-slate-950 font-bold px-8 py-3 rounded-2xl text-sm shadow-md"
              >
                Check In Next Person
              </button>
            </div>
          </div>
        ) : signingWaiverForMember ? (
          /* ON-SITE DOOR WAIVER SIGNING PAD */
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase text-amber-400">On-Site Waiver Required</span>
                <h3 className="text-lg font-bold text-white">
                  Liability Agreement for {signingWaiverForMember.member.name}
                </h3>
              </div>
              <button
                onClick={() => setSigningWaiverForMember(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 font-serif leading-relaxed max-h-32 overflow-y-auto">
              {WAIVER_TEMPLATES_DATA[1].content}
            </div>

            <SignaturePad
              signerName={signingWaiverForMember.member.name}
              onSignatureCapture={(sig) => sig && handleDoorWaiverSigned(sig)}
            />
          </div>
        ) : selectedReg ? (
          /* REGISTRATION DETAILS & CHECK-IN BUTTONS */
          <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-400">Volunteer Record Found</span>
                <h2 className="text-2xl font-black text-white">{selectedReg.primaryName}</h2>
                <p className="text-xs text-slate-400">{selectedReg.primaryPhone} • {selectedReg.primaryEmail}</p>
              </div>

              <button
                onClick={() => setSelectedReg(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
              </button>
            </div>

            {/* Shift Claims for this registration */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Assigned Volunteer Shifts
              </span>

              {selectedReg.shiftClaims.map((claim, idx) => {
                const shift = shiftMap.get(claim.shiftId);
                const subPart = shift ? subPartMap.get(shift.subPartId) : null;
                const member = selectedReg.members.find(m => m.id === claim.groupMemberId) || selectedReg.members[0];
                const waiver = selectedReg.waivers.find(w => w.groupMemberId === member.id);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold text-indigo-400 uppercase">{subPart?.name}</span>
                      <h4 className="text-base font-bold text-white">{shift?.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Volunteer: <strong className="text-white">{member.name}</strong> • Gate: <strong>{subPart?.reportingGate}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleCheckInMember(selectedReg, claim.shiftId, member.id)}
                      className={`px-6 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 shadow-lg ${
                        claim.checkedIn
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{claim.checkedIn ? 'Already Checked In ✓' : 'TAP TO CHECK IN NOW'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* SEARCH FORM (LARGE TAP TARGETS) */
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Welcome to {currentEvent.title}
              </h2>
              <p className="text-sm text-slate-400">
                Enter your mobile phone number or name to check in for your volunteer shift.
              </p>
            </div>

            <div className="relative max-w-lg mx-auto">
              <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Phone # or Name..."
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-slate-700 focus:border-indigo-500 rounded-2xl text-lg sm:text-xl font-bold text-white placeholder-slate-500 focus:outline-none shadow-inner"
              />
            </div>

            {/* Results Grid */}
            {matchingRegistrations.length > 0 && (
              <div className="max-w-lg mx-auto bg-slate-800 rounded-2xl border border-slate-700 divide-y divide-slate-700 overflow-hidden text-left animate-in fade-in">
                {matchingRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => handleSelectRegistration(reg)}
                    className="p-4 hover:bg-slate-700/60 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-base text-white">{reg.primaryName}</div>
                      <div className="text-xs text-slate-400">{reg.primaryPhone} • {reg.shiftClaims.length} shift(s)</div>
                    </div>
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600">
        R3Pro Express On-Site Kiosk • Fast Touch Interface
      </div>
    </div>
  );
};
