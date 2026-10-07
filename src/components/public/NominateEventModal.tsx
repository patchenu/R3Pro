import React, { useState } from 'react';
import { 
  X, Sparkles, Building2, Calendar, MapPin, User, Mail, Phone, 
  Clock, CheckCircle2, Copy, ArrowRight, ArrowLeft, Send, ShieldCheck,
  FileText, Award, AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NominateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (claimToken: string, claimUrl: string) => void;
}

export const NominateEventModal: React.FC<NominateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const { nominateUnlistedEvent, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDescription: '',
    startDate: '2026-09-26T09:00',
    endDate: '2026-09-26T13:00',
    venueName: '',
    venueAddress: '',
    category: 'Environmental & Conservation',
    
    // Organizer Details
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    organizerTitle: 'Event Director / Coordinator',
    organizationName: '',

    // Volunteer Claim Details
    volunteerName: '',
    volunteerEmail: '',
    volunteerPhone: '',
    volunteerRoleClaimed: 'Volunteer Crew Lead',
    volunteerHoursServed: 4.0,
    volunteerServiceDate: '2026-09-26',
    volunteerProofNotes: ''
  });

  const [createdResult, setCreatedResult] = useState<{
    claimToken: string;
    claimUrl: string;
    eventTitle: string;
    organizerEmail: string;
    volunteerHours: number;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!formData.eventTitle.trim() || !formData.venueName.trim()) {
        showToast('warning', 'Missing Details', 'Please enter the event title and venue location.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.organizerName.trim() || !formData.organizerEmail.trim() || !formData.organizationName.trim()) {
        showToast('warning', 'Missing Organizer Info', 'Please enter the organizer name, email, and organization.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.volunteerName.trim() || !formData.volunteerEmail.trim() || !formData.volunteerRoleClaimed.trim() || formData.volunteerHoursServed <= 0) {
        showToast('warning', 'Missing Service Details', 'Please specify your name, email, volunteer role, and hours served.');
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const result = nominateUnlistedEvent({
      eventTitle: formData.eventTitle,
      eventDescription: formData.eventDescription,
      startDate: formData.startDate,
      endDate: formData.endDate,
      venueName: formData.venueName,
      venueAddress: formData.venueAddress || formData.venueName,
      category: formData.category,
      organizerName: formData.organizerName,
      organizerEmail: formData.organizerEmail,
      organizerPhone: formData.organizerPhone,
      organizerTitle: formData.organizerTitle,
      organizationName: formData.organizationName,
      volunteerName: formData.volunteerName,
      volunteerEmail: formData.volunteerEmail,
      volunteerPhone: formData.volunteerPhone,
      volunteerRoleClaimed: formData.volunteerRoleClaimed,
      volunteerHoursServed: Number(formData.volunteerHoursServed),
      volunteerServiceDate: formData.volunteerServiceDate,
      volunteerProofNotes: formData.volunteerProofNotes
    });

    if (result.success) {
      setCreatedResult({
        claimToken: result.claimToken,
        claimUrl: result.claimUrl,
        eventTitle: formData.eventTitle,
        organizerEmail: formData.organizerEmail,
        volunteerHours: Number(formData.volunteerHoursServed)
      });
      setStep(4);
      if (onEventCreated) {
        onEventCreated(result.claimToken, result.claimUrl);
      }
    }
  };

  const handleCopy = () => {
    if (createdResult?.claimUrl) {
      navigator.clipboard.writeText(createdResult.claimUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      showToast('success', 'Claim Link Copied', 'Organizer claim link copied to clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-600 via-sky-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-200 bg-sky-900/40 px-2.5 py-0.5 rounded-full">
                Grassroots Volunteer Community
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                {step === 4 ? '🎉 Campaign Registered on Organizer’s Behalf!' : 'Add Unlisted Event & Claim Volunteer Hours'}
              </h2>
            </div>
          </div>

          <p className="text-sm text-sky-100 mt-2 max-w-xl">
            {step === 4
              ? 'The event has been provisionally registered. An official verification invite was dispatched to the organizer.'
              : 'Volunteered for an off-platform event? Add the campaign details and we will notify the organizer to formally claim the event and verify your service hours.'}
          </p>

          {/* Stepper Dots */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20 text-xs font-semibold">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-sky-700 font-bold' : 'bg-white/20'}`}>1</span>
                <span>Event Info</span>
              </div>
              <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-white/50'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-sky-700 font-bold' : 'bg-white/20'}`}>2</span>
                <span>Organizer Details</span>
              </div>
              <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-white' : 'text-white/50'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-white text-sky-700 font-bold' : 'bg-white/20'}`}>3</span>
                <span>Claim Your Hours</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: EVENT DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Event / Campaign Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clearwater Bay Coastal Cleanup & Restoration"
                  value={formData.eventTitle}
                  onChange={e => setFormData({ ...formData, eventTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Organization / School / Initiative Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clearwater Coastal Conservancy"
                  value={formData.organizationName}
                  onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Event Category / Focus
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium bg-white"
                  >
                    <option value="Environmental & Conservation">🌱 Environmental & Conservation</option>
                    <option value="School & Education">🎓 School & Education</option>
                    <option value="Youth Sports & Athletics">⚽ Youth Sports & Athletics</option>
                    <option value="Community Food Drive">🥫 Community Food & Shelter</option>
                    <option value="Arts, Culture & Music">🎨 Arts & Culture</option>
                    <option value="Civic & General Service">🏛️ Civic & General Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Venue / Park / School Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pier 60 & Dune Trail"
                    value={formData.venueName}
                    onChange={e => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Physical Address / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. 100 Pier 60 Dr, Clearwater, FL 33767"
                    value={formData.venueAddress}
                    onChange={e => setFormData({ ...formData, venueAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Brief Description & Mission
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the volunteer duties, mission, and community impact..."
                  value={formData.eventDescription}
                  onChange={e => setFormData({ ...formData, eventDescription: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ORGANIZER CONTACT DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-800">
                  <span className="font-bold">Why do we need the organizer's contact?</span>
                  <p className="mt-0.5">
                    We will send an official notification with a secure 1-click claim link to this organizer so they can verify your service hours and formalize their organization workspace.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Organizer Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Captain Dave Miller"
                      value={formData.organizerName}
                      onChange={e => setFormData({ ...formData, organizerName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Organizer Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. dave@clearwaterconservancy.org"
                      value={formData.organizerEmail}
                      onChange={e => setFormData({ ...formData, organizerEmail: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Organizer Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. (555) 912-3847"
                      value={formData.organizerPhone}
                      onChange={e => setFormData({ ...formData, organizerPhone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Organizer Official Title / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Director of Marine Conservation"
                    value={formData.organizerTitle}
                    onChange={e => setFormData({ ...formData, organizerTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VOLUNTEER SERVICE CLAIM */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">Your Volunteer Service Claim</span>
                  <p className="mt-0.5">
                    Enter the details of the service you performed. Once the organizer claims the event, they will be prompted to approve your verified service hours certificate.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Full Legal Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maya Lin"
                    value={formData.volunteerName}
                    onChange={e => setFormData({ ...formData, volunteerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. maya.lin@earthcare.org"
                    value={formData.volunteerEmail}
                    onChange={e => setFormData({ ...formData, volunteerEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Hours Contributed *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={formData.volunteerHoursServed}
                      onChange={e => setFormData({ ...formData, volunteerHoursServed: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Role / Tasks Performed *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coastal Debris Triage Lead"
                    value={formData.volunteerRoleClaimed}
                    onChange={e => setFormData({ ...formData, volunteerRoleClaimed: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Date Service Was Completed
                </label>
                <input
                  type="date"
                  value={formData.volunteerServiceDate}
                  onChange={e => setFormData({ ...formData, volunteerServiceDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Proof Notes / Supervisor Context (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Collected 180 lbs of plastic trash along North Beach Dunes with team of 6."
                  value={formData.volunteerProofNotes}
                  onChange={e => setFormData({ ...formData, volunteerProofNotes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 4: SUBMISSION CONFIRMATION & CLAIM LINK PREVIEW */}
          {step === 4 && createdResult && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">
                  Event Successfully Added!
                </h3>
                <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                  A provisional organization workspace and campaign have been generated. An invitation email was simulated to <b>{createdResult.organizerEmail}</b>.
                </p>
              </div>

              {/* Copyable Claim Link Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Organizer 1-Click Formal Claim Link:
                  </span>
                  <span className="text-[11px] text-slate-500">256-bit Secure Token</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.claimUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-700 select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Simulated Email Invite Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-slate-500" />
                    Simulated Email Dispatched to Organizer
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                    Priority Queue: P1
                  </span>
                </div>

                <div className="p-4 text-xs text-slate-700 space-y-2 bg-white font-sans">
                  <div><b>To:</b> {createdResult.organizerEmail}</div>
                  <div><b>Subject:</b> Action Required: Claim "{createdResult.eventTitle}" and verify {formData.volunteerName}'s {createdResult.volunteerHours} volunteer hours</div>
                  <div className="pt-2 border-t border-slate-100 text-slate-600 leading-relaxed">
                    Hello {formData.organizerName},<br />
                    <b>{formData.volunteerName}</b> added your event <b>"{createdResult.eventTitle}"</b> on REACH and claimed <b>{createdResult.volunteerHours} hours</b> for their service as <i>{formData.volunteerRoleClaimed}</i>.
                    <br /><br />
                    Please click below to claim your organization workspace, verify the volunteer's hours, and activate your campaign dashboard:
                    <div className="my-3">
                      <a
                        href={createdResult.claimUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors"
                      >
                        🚀 Claim Organization & Verify Service Hours
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              {step === 3 ? (
                <>
                  <Send className="w-4 h-4" /> Submit & Notify Organizer
                </>
              ) : (
                <>
                  Next Step <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Done & Return to Discovery
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
