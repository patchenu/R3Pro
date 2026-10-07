import React, { useState } from 'react';
import { 
  Calendar, MapPin, Clock, Building2, User, Mail, Phone, 
  Sparkles, ShieldCheck, ArrowRight, Send, X, CheckCircle2 
} from 'lucide-react';
import { useHoneycomb } from '../../context/HoneycombContext';

export const Step1RegisterModal: React.FC = () => {
  const { 
    isRegisterModalOpen, 
    setIsRegisterModalOpen, 
    registerEvent, 
    claimEvent 
  } = useHoneycomb();

  // Role Type: Organizer vs Volunteer
  const [roleType, setRoleType] = useState<'organizer' | 'volunteer'>('organizer');

  // Event Basics
  const [eventName, setEventName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('2026-10-24');
  const [startTime, setStartTime] = useState('08:30');
  const [lengthHours, setLengthHours] = useState(4);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [accessCode, setAccessCode] = useState('5821');

  // Submitter Profile
  const [yourName, setYourName] = useState('');
  const [yourEmail, setYourEmail] = useState('');

  // Volunteer Nomination: Organizer Contact
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');

  // Generated Claim Token State
  const [claimTokenGenerated, setClaimTokenGenerated] = useState<string | null>(null);

  if (!isRegisterModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = registerEvent({
      name: eventName || 'New Community Event',
      organizationName: orgName || 'School PTA / Booster Club',
      location: location || 'School Campus Field',
      date,
      startTime,
      lengthHours,
      privacy,
      accessCode: privacy === 'private' ? accessCode : undefined,
      registeredByRole: roleType,
      registeredByName: yourName || 'Organizer',
      registeredByEmail: yourEmail || 'organizer@school.edu',
      organizerName: roleType === 'organizer' ? yourName : organizerName,
      organizerEmail: roleType === 'organizer' ? yourEmail : organizerEmail
    });

    if (roleType === 'volunteer' && res.claimToken) {
      setClaimTokenGenerated(res.claimToken);
    } else {
      setIsRegisterModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-amber-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-5 text-amber-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 clip-hex bg-white/90 flex items-center justify-center text-xl shadow-xs">
              🐝
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-900/20 px-2 py-0.5 rounded-full">
                Step 1: Event Registration
              </span>
              <h2 className="font-chunky text-lg font-bold">
                Register a New Event
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(false)}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Claim Token Notification State (if Volunteer nominated) */}
        {claimTokenGenerated ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-chunky text-lg font-bold text-slate-800">
              Event Registered & Awaiting Claim!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              We dispatched an automated claim email to <strong>{organizerEmail}</strong>. 
              The organizer can tap the link below to claim and setup the event.
            </p>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <Mail className="w-4 h-4" />
                <span>Simulated Email Sent to Organizer:</span>
              </div>
              <p className="text-slate-600">
                &quot;Hi {organizerName}, {yourName} nominated your event: <strong>{eventName}</strong>. Tap below to claim it as Organizer.&quot;
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    claimEvent(claimTokenGenerated);
                    setIsRegisterModalOpen(false);
                    setClaimTokenGenerated(null);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>[Simulate Organizer Tap: Claim Event]</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsRegisterModalOpen(false);
                setClaimTokenGenerated(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Close Window
            </button>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            
            {/* "Who are you?" Forking Toggle */}
            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
              <label className="block text-[11px] font-black uppercase tracking-wider text-amber-900 mb-2">
                Who are you?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoleType('organizer')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                    roleType === 'organizer'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50'
                  }`}
                >
                  <span className="text-lg">👑</span>
                  <div>
                    <div className="font-bold text-xs">I am the Organizer</div>
                    <div className={`text-[10px] ${roleType === 'organizer' ? 'text-amber-100' : 'text-slate-400'}`}>
                      Move to Step 2 Setup
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleType('volunteer')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                    roleType === 'volunteer'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50'
                  }`}
                >
                  <span className="text-lg">🙋</span>
                  <div>
                    <div className="font-bold text-xs">I am a Volunteer</div>
                    <div className={`text-[10px] ${roleType === 'volunteer' ? 'text-amber-100' : 'text-slate-400'}`}>
                      Notify organizer to claim
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Event Essentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cougar Fall Soccer Invitational"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Organization / Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oak Creek Booster Club (501c3)"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Location & Privacy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Location / Venue *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. High School Stadium Pitch"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Event Privacy
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPrivacy('public')}
                    className={`flex-1 py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      privacy === 'public'
                        ? 'bg-amber-100 text-amber-900 border-amber-400'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    🌐 Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy('private')}
                    className={`flex-1 py-2 px-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      privacy === 'private'
                        ? 'bg-amber-100 text-amber-900 border-amber-400'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    🔒 Private Code
                  </button>
                </div>
              </div>
            </div>

            {/* Date, Time & Length */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Length (Hrs)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={lengthHours}
                  onChange={e => setLengthHours(Number(e.target.value))}
                  className="w-full px-2 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                />
              </div>
            </div>

            {/* Submitter Info */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coach Dan Miller"
                  value={yourName}
                  onChange={e => setYourName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. dan@oakcreekboosters.org"
                  value={yourEmail}
                  onChange={e => setYourEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Volunteer-Only: Organizer Details */}
            {roleType === 'volunteer' && (
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-300 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Who is the Event Organizer to Notify?</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Organizer's Name"
                    value={organizerName}
                    onChange={e => setOrganizerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Organizer's Email Address"
                    value={organizerEmail}
                    onChange={e => setOrganizerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
                <p className="text-[10px] text-amber-800">
                  We will email this person an instant 1-click link to claim their event and customize the needs.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-chunky font-bold py-3 px-4 rounded-2xl shadow-honey transition flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>
                  {roleType === 'organizer' ? 'Create & Continue to Step 2 ➔' : 'Register & Email Organizer ➔'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
