import React, { useState } from 'react';
import { 
  Clock, MapPin, Users, CheckCircle2, ShieldCheck, Heart, 
  Sparkles, X, Check, ArrowRight, UserCheck, Smartphone, AlertCircle 
} from 'lucide-react';
import { useHoneycomb } from '../../context/HoneycombContext';
import { Shift, DUTY_CATEGORIES, DutyCategory } from '../../types';

export const PublicVolunteerPortal: React.FC = () => {
  const { 
    event, 
    shifts, 
    needs, 
    registerVolunteerForShift, 
    confirmNeedResponse,
    showToast 
  } = useHoneycomb();

  const [selectedCategory, setSelectedCategory] = useState<DutyCategory | 'all'>('all');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Volunteer Sign Up Modal Form
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerPhone, setVolunteerPhone] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [parentName, setParentName] = useState('');
  
  // Option B Audit-Ready Compliance Fields
  const [credentialId, setCredentialId] = useState('');
  const [documentName, setDocumentName] = useState('');

  // Generated pass state
  const [claimedPassToken, setClaimedPassToken] = useState<string | null>(null);

  const filteredShifts = selectedCategory === 'all'
    ? shifts
    : shifts.filter(s => s.dutyCategory === selectedCategory);

  const openWishlistNeeds = needs.filter(n => !n.assignedTo && n.quantityFulfilled < n.quantityNeeded);

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShift || !volunteerName.trim()) return;

    if (selectedShift.compliance.requiresUploadOrId && !credentialId.trim() && !documentName) {
      showToast('warning', 'Credential Required', `Please provide your ${selectedShift.compliance.title} number or upload proof.`);
      return;
    }

    const res = registerVolunteerForShift(selectedShift.id, {
      name: volunteerName.trim(),
      email: volunteerEmail.trim() || 'volunteer@student.oakcreek.edu',
      phone: volunteerPhone.trim() || '(555) 000-1234',
      isMinor,
      parentName: isMinor ? parentName : undefined,
      credentialId: credentialId.trim() || undefined,
      documentName: documentName || (credentialId ? 'card_verified.pdf' : undefined)
    });

    if (res.success) {
      setClaimedPassToken(res.magicToken);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Friendly Banner for Kids & Parents */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-3xl p-5 sm:p-6 text-amber-950 shadow-honey flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/70 px-2.5 py-1 rounded-full border border-amber-400/60">
            Simple 1-Tap Sign-Up
          </span>
          <h2 className="font-chunky text-xl sm:text-2xl font-bold">
            Join the Hive &amp; Support our Team!
          </h2>
          <p className="text-xs font-medium text-amber-900 max-w-md">
            Students earn verified school service hours. Parents help make tournament day unforgettable.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-300 text-center shrink-0 shadow-xs">
          <div className="text-[10px] font-extrabold uppercase text-amber-800">
            Spots Remaining
          </div>
          <div className="font-chunky text-2xl font-bold text-amber-950">
            {shifts.reduce((acc, s) => acc + (s.capacity - s.filledCount), 0)}
          </div>
          <div className="text-[9px] text-slate-500">
            across {shifts.length} roles
          </div>
        </div>
      </div>

      {/* Duty Category Filter Bubbles (Kid-Friendly 48px Touch Targets) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Choose what you&apos;d like to do:
          </span>
          <span className="text-[11px] text-slate-400">
            Showing {filteredShifts.length} opportunities
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-2xl font-chunky text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-white shadow-honey ring-2 ring-amber-300'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            <span>🐝 All Opportunities</span>
          </button>

          {DUTY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl font-chunky text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-honey ring-2 ring-amber-300'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredShifts.map(shift => {
          const isFull = shift.filledCount >= shift.capacity;
          const openSpots = shift.capacity - shift.filledCount;

          return (
            <div
              key={shift.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                isFull
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : 'bg-white border-amber-200/90 shadow-hex hover:shadow-honey hover:-translate-y-1'
              }`}
            >
              <div className="space-y-2.5">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {DUTY_CATEGORIES.find(d => d.id === shift.dutyCategory)?.icon}{' '}
                    {DUTY_CATEGORIES.find(d => d.id === shift.dutyCategory)?.label}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isFull
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isFull ? 'Filled' : `${openSpots} spot${openSpots === 1 ? '' : 's'} left`}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-chunky text-base font-bold text-slate-800 leading-tight">
                  {shift.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2">
                  {shift.dutiesDescription}
                </p>

                {/* Logistics */}
                <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-bold text-slate-800">{shift.startTime} – {shift.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="line-clamp-1">{shift.reportLocation}</span>
                  </div>
                </div>

                {/* Compliance Badge */}
                <div className="text-[10px] text-amber-900 bg-amber-100/60 p-2 rounded-xl flex items-center gap-1.5">
                  <span className="text-xs">{shift.compliance.badge}</span>
                  <span className="font-bold">{shift.compliance.title}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => setSelectedShift(shift)}
                  className={`w-full py-2.5 px-3 rounded-2xl font-chunky font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isFull
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isFull ? 'Shift Filled' : 'Claim This Spot ➔'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Open Wishlist Needs (Items anyone can bring) */}
      {openWishlistNeeds.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-chunky font-bold text-base">
            <span className="text-xl">🎁</span>
            <span>Can you bring an item or supply instead?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {openWishlistNeeds.map(item => (
              <div key={item.id} className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800">{item.title}</div>
                  <div className="text-slate-500 text-[11px]">{item.details}</div>
                  <div className="text-[10px] text-amber-800 font-bold mt-1">Due {item.dueDate} at {item.dueTime}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt('Your name:');
                    if (name) {
                      showToast('success', 'Item Pledged! 🎁', `Thank you ${name}! We marked ${item.title} as pledged.`);
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl shrink-0 cursor-pointer shadow-xs text-xs"
                >
                  I&apos;ll Bring This
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIGN UP MODAL (Easy enough for 10-year-olds!) */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-amber-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 text-amber-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 clip-hex bg-white/90 flex items-center justify-center text-base shadow-xs">
                  🐝
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-900/20 px-2 py-0.5 rounded-full">
                    15-Second Sign-Up
                  </span>
                  <h3 className="font-chunky text-base font-bold">
                    Claim Volunteer Spot
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedShift(null);
                  setClaimedPassToken(null);
                }}
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If pass claimed, show Digital Honeycomb Pass! */}
            {claimedPassToken ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 clip-hex bg-amber-500 text-white flex items-center justify-center mx-auto text-3xl shadow-honey">
                  ✓
                </div>
                <h3 className="font-chunky text-xl font-bold text-slate-800">
                  You&apos;re All Set, {volunteerName}!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Your pass has been saved to this device. No password needed!
                </p>

                {/* Digital Pass Card */}
                <div className="bg-gradient-to-b from-amber-50 to-white p-4 rounded-2xl border-2 border-dashed border-amber-300 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-extrabold text-amber-900 uppercase text-[10px]">
                      Digital Volunteer Pass
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {claimedPassToken}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{selectedShift.title}</div>
                    <div className="text-slate-500 text-[11px]">{event.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>Time: <strong>{selectedShift.startTime} – {selectedShift.endTime}</strong></div>
                    <div>Location: <strong>{selectedShift.reportLocation}</strong></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedShift(null);
                    setClaimedPassToken(null);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-chunky font-bold py-2.5 px-4 rounded-xl shadow-xs"
                >
                  Done ➔
                </button>
              </div>
            ) : (
              /* Sign up form */
              <form onSubmit={handleSignUpSubmit} className="p-5 space-y-3.5 text-xs">
                
                {/* Role Pill */}
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  <div className="font-bold text-slate-800 text-xs">{selectedShift.title}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {selectedShift.startTime} – {selectedShift.endTime} • {selectedShift.reportLocation}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First &amp; Last Name"
                    value={volunteerName}
                    onChange={e => setVolunteerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                  />
                </div>

                {/* Email or Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={volunteerEmail}
                      onChange={e => setVolunteerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Phone (for SMS alerts)
                    </label>
                    <input
                      type="text"
                      placeholder="(555) 000-0000"
                      value={volunteerPhone}
                      onChange={e => setVolunteerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Minor Checkbox */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-xs">
                    <input
                      type="checkbox"
                      checked={isMinor}
                      onChange={e => setIsMinor(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                    />
                    <span>I am a student / minor under 18</span>
                  </label>

                  {isMinor && (
                    <div className="animate-in fade-in pt-1">
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                        Parent or Legal Guardian Name:
                      </label>
                      <input
                        type="text"
                        required={isMinor}
                        placeholder="Parent Full Legal Name"
                        value={parentName}
                        onChange={e => setParentName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  )}
                </div>

                {/* Option B Audit-Ready Compliance Input */}
                {selectedShift.compliance.requiresUploadOrId && (
                  <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-300 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[11px]">
                      <span>{selectedShift.compliance.badge}</span>
                      <span>{selectedShift.compliance.title} (Option B Audit-Ready)</span>
                    </div>
                    <p className="text-[10px] text-amber-800">
                      This role requires verification. Please enter your credential ID number or upload your certification card.
                    </p>
                    
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Member / Credential ID # (e.g. SF-88192)"
                        value={credentialId}
                        onChange={e => setCredentialId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-2 py-1 rounded-md cursor-pointer border border-amber-300">
                          📁 Upload Card (PDF/Photo)
                          <input
                            type="file"
                            className="hidden"
                            onChange={e => {
                              if (e.target.files?.[0]) {
                                setDocumentName(e.target.files[0].name);
                              }
                            }}
                          />
                        </label>
                        {documentName && (
                          <span className="text-[10px] text-emerald-700 font-bold truncate">
                            ✓ {documentName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-chunky font-bold py-3 px-4 rounded-2xl shadow-honey transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <span>Claim My Spot Now! 🐝</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
