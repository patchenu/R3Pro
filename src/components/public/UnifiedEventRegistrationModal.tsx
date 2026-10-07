import React, { useState } from 'react';
import { 
  Calendar, MapPin, Clock, Building2, User, Mail, Phone, 
  Sparkles, CheckCircle2, ShieldCheck, ChevronRight, ArrowRight, 
  Send, HelpCircle, HeartHandshake, Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

interface UnifiedEventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToOrganizerSetup: (eventBasics: {
    title: string;
    organizationName: string;
    venueName: string;
    venueAddress: string;
    startDate: string;
    endDate: string;
    durationHours: number;
    organizerName: string;
    organizerEmail: string;
  }) => void;
}

export const UnifiedEventRegistrationModal: React.FC<UnifiedEventRegistrationModalProps> = ({
  isOpen,
  onClose,
  onContinueToOrganizerSetup
}) => {
  const { nominateUnlistedEvent, showToast, currentUser, isAuthenticated } = useApp();

  // Role Type: Organizer vs Volunteer
  const [roleType, setRoleType] = useState<'organizer' | 'volunteer'>('organizer');

  // Event Basics
  const [eventName, setEventName] = useState('');
  const [eventOrgName, setEventOrgName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-15');
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventDurationHours, setEventDurationHours] = useState<number>(3);

  // Submitter Profile
  const [yourName, setYourName] = useState(currentUser.name || '');
  const [yourEmail, setYourEmail] = useState(currentUser.email || '');
  const [yourPhone, setYourPhone] = useState(currentUser.phone || '');

  // Volunteer-Only Organizer Contact Fields
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [hoursServed, setHoursServed] = useState<number>(3.0);
  const [volunteerRoleClaimed, setVolunteerRoleClaimed] = useState('Event Volunteer & Setup Crew');
  const [proofNotes, setProofNotes] = useState('');

  // Post-submission state for volunteer
  const [submittedClaimToken, setSubmittedClaimToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName.trim() || !eventOrgName.trim() || !eventLocation.trim()) {
      showToast('warning', 'Missing Details', 'Please complete the event name, organization, and location.');
      return;
    }

    if (!yourName.trim() || !yourEmail.trim()) {
      showToast('warning', 'Missing Contact', 'Please provide your full name and email address.');
      return;
    }

    const startDateTime = `${eventDate}T${eventStartTime}:00`;
    const endHour = Math.min(23, parseInt(eventStartTime.split(':')[0], 10) + eventDurationHours);
    const endMinute = eventStartTime.split(':')[1] || '00';
    const endDateTime = `${eventDate}T${endHour.toString().padStart(2, '0')}:${endMinute}:00`;

    if (roleType === 'organizer') {
      // Transition smoothly into Step 2 of the Event Builder Wizard
      onContinueToOrganizerSetup({
        title: eventName.trim(),
        organizationName: eventOrgName.trim(),
        venueName: eventLocation.trim(),
        venueAddress: eventLocation.trim(),
        startDate: startDateTime,
        endDate: endDateTime,
        durationHours: eventDurationHours,
        organizerName: yourName.trim(),
        organizerEmail: yourEmail.trim()
      });
      onClose();
    } else {
      // Volunteer nominating an unlisted event
      if (!organizerName.trim() || !organizerEmail.trim()) {
        showToast('warning', 'Organizer Contact Required', 'Please enter the organizer name and email so we can notify them to claim the event.');
        return;
      }

      const result = nominateUnlistedEvent({
        organizationName: eventOrgName.trim(),
        eventTitle: eventName.trim(),
        eventDescription: `Grassroots event created by volunteer ${yourName.trim()} on behalf of organizer ${organizerName.trim()}.`,
        startDate: startDateTime,
        endDate: endDateTime,
        venueName: eventLocation.trim(),
        venueAddress: eventLocation.trim(),
        organizerName: organizerName.trim(),
        organizerEmail: organizerEmail.trim(),
        organizerPhone: organizerPhone.trim() || undefined,
        volunteerName: yourName.trim(),
        volunteerEmail: yourEmail.trim(),
        volunteerPhone: yourPhone.trim() || undefined,
        volunteerRoleClaimed: volunteerRoleClaimed.trim(),
        volunteerHoursServed: Number(hoursServed),
        volunteerServiceDate: eventDate,
        volunteerProofNotes: proofNotes.trim() || undefined
      });

      setSubmittedClaimToken(result.claimToken);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register an Event / Campaign"
      subtitle="Register an official event as an organizer, or log off-platform volunteer hours"
      maxWidth="3xl"
    >
      {submittedClaimToken ? (
        <div className="space-y-5 text-center p-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">Event Nominated & Invitation Dispatched!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              We dispatched a secure 1-click claim invitation to <strong>{organizerEmail}</strong>. Once <strong>{organizerName}</strong> claims the workspace, your <strong>{hoursServed} volunteer hours</strong> will be verified with an official certificate.
            </p>
          </div>

          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-left font-mono text-[11px] space-y-2">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Simulated Claim URL Dispatched:</div>
            <div className="p-2 bg-slate-800 rounded-xl break-all text-amber-300">
              {window.location.origin}/?claimToken={submittedClaimToken}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
          >
            Done & Return to Discovery
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* WHO ARE YOU SELECTOR */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Who Are You? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setRoleType('organizer')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  roleType === 'organizer'
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">👔 I am the Event Organizer / Chair</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    I am creating a formal event campaign. Proceed to Step 2 to configure goals, support needs, volunteer shifts, and sponsor packages.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setRoleType('volunteer')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  roleType === 'volunteer'
                    ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">🙋 I am a Volunteer / Supporter</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    I volunteered for an off-platform event that isn't on the site yet. Add event details and dispatch an email to the organizer to claim it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* EVENT BASICS */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Event Details & Logistics</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Annual Community Carnival & STEM Fair"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Organization / Host Name *</label>
                <input
                  type="text"
                  required
                  value={eventOrgName}
                  onChange={(e) => setEventOrgName(e.target.value)}
                  placeholder="e.g. Lincoln High PTA or Youth Soccer League"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Event Location / Venue *</label>
                <input
                  type="text"
                  required
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Lincoln High Main Campus, 1420 Lincoln Blvd, Springfield, IL"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Length (Hours)</label>
                  <select
                    value={eventDurationHours}
                    onChange={(e) => setEventDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={5}>5 hours</option>
                    <option value={6}>6 hours</option>
                    <option value={8}>8 hours (Full Day)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* YOUR CONTACT INFO */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Your Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Email Address *</label>
                <input
                  type="email"
                  required
                  value={yourEmail}
                  onChange={(e) => setYourEmail(e.target.value)}
                  placeholder="e.g. jordan@example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Phone Number</label>
                <input
                  type="tel"
                  value={yourPhone}
                  onChange={(e) => setYourPhone(e.target.value)}
                  placeholder="e.g. (555) 019-2834"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-xs"
                />
              </div>
            </div>
          </div>

          {/* VOLUNTEER NOMINATION EXTENSION (ORGANIZER CONTACT & HOURS CLAIM) */}
          {roleType === 'volunteer' && (
            <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-700" />
                  <span>Event Organizer Details (To Dispatch Claim Link)</span>
                </h4>
                <span className="text-[10px] text-purple-700 font-semibold">Formalizes organization upon claim</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-purple-900 mb-1">Organizer's Full Name *</label>
                  <input
                    type="text"
                    required={roleType === 'volunteer'}
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins (Event Chair)"
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-900 mb-1">Organizer's Email Address *</label>
                  <input
                    type="email"
                    required={roleType === 'volunteer'}
                    value={organizerEmail}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                    placeholder="e.g. sarah@lincolnhighpta.org"
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-900 mb-1">Organizer's Phone (Optional)</label>
                  <input
                    type="tel"
                    value={organizerPhone}
                    onChange={(e) => setOrganizerPhone(e.target.value)}
                    placeholder="e.g. (555) 928-1123"
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-900 mb-1">Your Volunteer Role Claimed</label>
                  <input
                    type="text"
                    value={volunteerRoleClaimed}
                    onChange={(e) => setVolunteerRoleClaimed(e.target.value)}
                    placeholder="e.g. Booth Greeter & Setup Crew"
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-900 mb-1">Service Hours Completed</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={hoursServed}
                    onChange={(e) => setHoursServed(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-xs text-purple-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-900 mb-1">Verification / Context Notes</label>
                  <input
                    type="text"
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="e.g. Worked with setup committee lead"
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-medium text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT / CONTINUE ACTIONS */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>

            {roleType === 'organizer' ? (
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Step 2: Goals, Needs & Staffing</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit & Send Claim Email to Organizer</span>
              </button>
            )}
          </div>

        </form>
      )}
    </Modal>
  );
};
