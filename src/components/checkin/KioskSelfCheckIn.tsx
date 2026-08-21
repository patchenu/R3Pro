import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Registration, Shift, SubPart } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Tablet, Search, CheckCircle2, ShieldCheck, 
  MapPin, Phone, UserCheck, AlertCircle, ArrowLeft, QrCode,
  UserPlus, Sparkles, Clock, Copy, ExternalLink, Smartphone, Check, ChevronRight, Cake
} from 'lucide-react';
import { SignaturePad } from '../common/SignaturePad';
import { WAIVER_TEMPLATES_DATA } from '../../data/templates';
import { calculateAge, formatBirthDate } from '../../utils/formatters';
import confetti from 'canvas-confetti';

export const KioskSelfCheckIn: React.FC = () => {
  const { 
    currentEvent, currentOrg, registrations, shifts, subParts, 
    toggleCheckIn, claimSlotsAndRegister, showToast 
  } = useApp();

  // Kiosk Mental Model: Check-In vs Day-Of Walkup
  const [kioskTab, setKioskTab] = useState<'checkin' | 'walkup_register'>('checkin');

  // Check-In States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [signingWaiverForMember, setSigningWaiverForMember] = useState<{ member: any; shift: any } | null>(null);
  const [checkInSuccessMember, setCheckInSuccessMember] = useState<string | null>(null);
  const [successShiftDetails, setSuccessShiftDetails] = useState<{ shiftTitle: string; subPartName: string; reportingGate: string } | null>(null);

  // Walk-Up Registration Form State
  const [walkupName, setWalkupName] = useState('');
  const [walkupPhone, setWalkupPhone] = useState('');
  const [walkupEmail, setWalkupEmail] = useState('');
  const [walkupBirthDate, setWalkupBirthDate] = useState('1996-03-22');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [walkupSignature, setWalkupSignature] = useState<string>('');
  const [isSubmittingWalkup, setIsSubmittingWalkup] = useState(false);

  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));

  const eventRegistrationUrl = `${window.location.origin}?event=${currentEvent.id}&action=register`;

  // Search Results
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
    const subPart = shift ? subPartMap.get(shift.subPartId) : null;
    const waiver = reg.waivers.find(w => w.groupMemberId === member.id);

    // If shift requires waiver and waiver is not signed, trigger door signature pad
    if (shift?.requiresWaiver && !waiver) {
      setSigningWaiverForMember({ member, shift });
      return;
    }

    toggleCheckIn(reg.id, shiftId, member.id);
    setCheckInSuccessMember(member.name);
    setSuccessShiftDetails({
      shiftTitle: shift?.title || 'Volunteer Shift',
      subPartName: subPart?.name || 'General Operations',
      reportingGate: subPart?.reportingGate || 'Main Check-In Desk'
    });

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setCheckInSuccessMember(null);
      setSuccessShiftDetails(null);
    }, 4500);
  };

  const handleDoorWaiverSigned = (signatureData: string) => {
    if (!signingWaiverForMember || !selectedReg) return;
    const { member, shift } = signingWaiverForMember;
    const subPart = subPartMap.get(shift.subPartId);

    toggleCheckIn(selectedReg.id, shift.id, member.id);
    setSigningWaiverForMember(null);
    setCheckInSuccessMember(member.name);
    setSuccessShiftDetails({
      shiftTitle: shift.title,
      subPartName: subPart?.name || 'General Operations',
      reportingGate: subPart?.reportingGate || 'Main Check-In Desk'
    });

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast('success', 'Waiver Signed & Checked In', `${member.name} is checked in for ${shift.title}.`);

    setTimeout(() => {
      setCheckInSuccessMember(null);
      setSuccessShiftDetails(null);
    }, 4500);
  };

  // Handle Walk-Up Day-Of Form Submission
  const handleWalkupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkupName.trim() || !walkupPhone.trim() || !selectedShiftId) {
      showToast('error', 'Missing Information', 'Please provide your full name, phone number, and choose an open shift.');
      return;
    }

    if (!walkupSignature) {
      showToast('warning', 'Waiver Signature Required', 'Please draw your signature on the screen to complete registration.');
      return;
    }

    setIsSubmittingWalkup(true);

    const chosenShift = shiftMap.get(selectedShiftId);
    const chosenSubPart = chosenShift ? subPartMap.get(chosenShift.subPartId) : null;

    const email = walkupEmail.trim() || `${walkupName.toLowerCase().replace(/\s+/g, '.')}.${Date.now().toString().slice(-4)}@walkup.volunteer`;

    const res = claimSlotsAndRegister({
      primaryName: walkupName.trim(),
      primaryEmail: email,
      primaryPhone: walkupPhone.trim(),
      birthDate: walkupBirthDate,
      notes: 'Day-of Walk-up Registration at Door Check-In Kiosk',
      members: [{
        name: walkupName.trim(),
        email: email,
        phone: walkupPhone.trim(),
        birthDate: walkupBirthDate,
        age: calculateAge(walkupBirthDate) || 30,
        relationship: 'self',
        isMinor: (calculateAge(walkupBirthDate) || 30) < 18
      }],
      shiftSelections: [{ shiftId: selectedShiftId, groupMemberIndex: 0 }],
      itemSelections: [],
      ticketSelections: [],
      donationAmount: 0,
      feeCovered: false,
      isAnonymous: false,
      waiverSignatures: [{
        memberIndex: 0,
        waiverTemplateId: 'wt_general_liability',
        waiverTitle: 'General Liability & Volunteer Waiver',
        waiverText: WAIVER_TEMPLATES_DATA[1].content,
        signerName: walkupName.trim(),
        signerRelationship: 'Self',
        signatureData: walkupSignature
      }]
    });

    setIsSubmittingWalkup(false);

    if (res.success && res.registration) {
      // Immediately check them in
      toggleCheckIn(res.registration.id, selectedShiftId, res.registration.members[0].id);

      setCheckInSuccessMember(walkupName);
      setSuccessShiftDetails({
        shiftTitle: chosenShift?.title || 'Volunteer Shift',
        subPartName: chosenSubPart?.name || 'General Operations',
        reportingGate: chosenSubPart?.reportingGate || 'Main Desk'
      });

      // Reset form
      setWalkupName('');
      setWalkupPhone('');
      setWalkupEmail('');
      setSelectedShiftId('');
      setWalkupSignature('');
      setKioskTab('checkin');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast('success', 'Walk-Up Volunteer Registered & Checked In', `Welcome ${walkupName}! Proceed to ${chosenSubPart?.reportingGate || 'your station'}.`);
    } else {
      showToast('error', 'Registration Failed', res.error || 'Unable to complete walkup registration.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col justify-between">
      
      {/* Top Kiosk Header */}
      <div className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-950">
            <Tablet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE ON-SITE DOOR & GATE STATION
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">{currentEvent.title}</h1>
          </div>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => {
              setKioskTab('checkin');
              setSelectedReg(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition ${
              kioskTab === 'checkin'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>🔍 I Already Signed Up Online</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setKioskTab('walkup_register');
              setSelectedReg(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition ${
              kioskTab === 'walkup_register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>🙋 I Want to Volunteer Day-Of</span>
          </button>
        </div>
      </div>

      {/* Main Kiosk Interaction Center */}
      <div className="max-w-5xl mx-auto w-full my-auto py-6">
        
        {checkInSuccessMember ? (
          /* SUCCESS WELCOME CARD */
          <div className="max-w-2xl mx-auto bg-emerald-950/90 border-2 border-emerald-500 rounded-3xl p-8 text-center space-y-5 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/50">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                Official Check-In Confirmed
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Welcome, {checkInSuccessMember}!</h2>
            </div>

            {successShiftDetails && (
              <div className="p-4 rounded-2xl bg-emerald-900/60 border border-emerald-500/40 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-emerald-700/50 pb-2">
                  <span className="text-emerald-300 font-bold uppercase text-[10px]">Assigned Shift</span>
                  <span className="font-extrabold text-white">{successShiftDetails.shiftTitle}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-700/50 pb-2">
                  <span className="text-emerald-300 font-bold uppercase text-[10px]">Department</span>
                  <span className="font-bold text-white">{successShiftDetails.subPartName}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-emerald-300 font-bold uppercase text-[10px]">Reporting Gate</span>
                  <span className="font-black text-emerald-200 text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {successShiftDetails.reportingGate}
                  </span>
                </div>
              </div>
            )}

            <p className="text-sm text-emerald-200">
              Thank you for supporting {currentOrg.name}! Please proceed to your reporting gate to meet your Department Lead.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setCheckInSuccessMember(null);
                  setSuccessShiftDetails(null);
                  setSelectedReg(null);
                }}
                className="bg-white hover:bg-slate-100 text-slate-950 font-black px-8 py-3 rounded-2xl text-sm shadow-xl transition"
              >
                Next Volunteer
              </button>
            </div>
          </div>
        ) : signingWaiverForMember ? (
          /* ON-SITE DOOR WAIVER SIGNING PAD */
          <div className="max-w-2xl mx-auto bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4 animate-in fade-in shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase text-amber-400">On-Site Door Waiver Required</span>
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
        ) : kioskTab === 'checkin' ? (
          /* MODE 1: PRE-REGISTERED VOLUNTEER SEARCH & CHECK-IN */
          selectedReg ? (
            <div className="max-w-2xl mx-auto bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 space-y-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400">Volunteer Record Found</span>
                  <h2 className="text-2xl font-black text-white">{selectedReg.primaryName}</h2>
                  <p className="text-xs text-slate-400">{selectedReg.primaryPhone} • {selectedReg.primaryEmail}</p>
                </div>

                <button
                  type="button"
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
                        type="button"
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
            <div className="max-w-2xl mx-auto space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Welcome to {currentEvent.title}
                </h2>
                <p className="text-sm text-slate-400">
                  Enter your mobile phone number or full name to check in for your scheduled shift.
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl text-lg sm:text-xl font-bold text-white placeholder-slate-500 focus:outline-none shadow-inner"
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
                      <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl">
                        Select
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Day of prompt */}
              <div className="pt-6 border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Haven't signed up yet?{' '}
                  <button
                    type="button"
                    onClick={() => setKioskTab('walkup_register')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline ml-1"
                  >
                    Click here to register & volunteer day-of
                  </button>
                </p>
              </div>
            </div>
          )
        ) : (
          /* MODE 2: DUAL DAY-OF VOLUNTEER SIGN-UP (QR CODE ON PHONE + TOUCHSCREEN FORM) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: SCAN TO REGISTER ON SMARTPHONE */}
            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 space-y-5 text-center flex flex-col justify-between shadow-xl">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Option A: Scan On Your Phone (Skip The Line)</span>
                </div>

                <h3 className="text-xl font-extrabold text-white">
                  Volunteer & Sign Up in 30 Seconds
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Point your smartphone camera at the QR code to open the live schedule, claim shifts for your family, and sign digital waivers.
                </p>
              </div>

              {/* Big High-Contrast QR Code */}
              <div className="bg-white p-5 rounded-3xl inline-block mx-auto shadow-2xl border-4 border-indigo-500/30">
                <QRCodeSVG
                  value={eventRegistrationUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-3">
                <div className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-800/40 truncate">
                  {eventRegistrationUrl}
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(eventRegistrationUrl);
                      showToast('success', 'Link Copied', 'Event registration URL copied to clipboard.');
                    }}
                    className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: EXPRESS TOUCHSCREEN DAY-OF SIGN-UP FORM */}
            <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400">
                    Option B: Touchscreen Kiosk
                  </span>
                  <h3 className="text-lg font-bold text-white">Express Day-Of Sign-Up</h3>
                </div>
                <span className="text-[10px] text-slate-400">1-Minute Process</span>
              </div>

              <form onSubmit={handleWalkupSubmit} className="space-y-4 text-xs">
                {/* 1. Name & Contact */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-300">1. Your Contact Details *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={walkupName}
                      onChange={(e) => setWalkupName(e.target.value)}
                      placeholder="Full Legal Name *"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
                    />

                    <input
                      type="tel"
                      required
                      value={walkupPhone}
                      onChange={(e) => setWalkupPhone(e.target.value)}
                      placeholder="Mobile Phone Number *"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={walkupEmail}
                      onChange={(e) => setWalkupEmail(e.target.value)}
                      placeholder="Email Address (Optional)"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
                    />

                    <div className="relative">
                      <div className="flex items-center gap-1 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-pink-400 font-bold">
                        <Cake className="w-3 h-3 text-pink-400" />
                        <span>Age: {calculateAge(walkupBirthDate) || 'Adult'}</span>
                      </div>
                      <input
                        type="date"
                        required
                        value={walkupBirthDate}
                        onChange={(e) => setWalkupBirthDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Choose Open Shift */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-300">2. Choose an Open Volunteer Shift *</label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {shifts
                      .filter(s => s.eventId === currentEvent.id)
                      .map(shift => {
                        const subPart = subPartMap.get(shift.subPartId);
                        const isSelected = selectedShiftId === shift.id;
                        const spotsLeft = Math.max(0, shift.capacity - shift.claimedCount);

                        return (
                          <div
                            key={shift.id}
                            onClick={() => setSelectedShiftId(shift.id)}
                            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                              isSelected 
                                ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-xs' 
                                : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 text-slate-300'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs flex items-center gap-1.5">
                                <span>{shift.title}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{subPart?.name}</span>
                                <span>•</span>
                                <span>Gate: {subPart?.reportingGate}</span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                              {spotsLeft} spots open
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 3. On-Screen Touch Waiver */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-300">3. Sign Safety & Liability Agreement *</label>
                  <SignaturePad
                    signerName={walkupName || 'Walk-up Volunteer'}
                    onSignatureCapture={(sig) => setWalkupSignature(sig || '')}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmittingWalkup || !selectedShiftId || !walkupName.trim() || !walkupPhone.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>⚡ Complete Walk-Up Sign-Up & Check In Immediately</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 border-t border-slate-800 pt-3">
        R3Pro Express On-Site Door & Kiosk System • Real-Time Volunteer Check-In & Walk-Up Registration
      </div>
    </div>
  );
};

