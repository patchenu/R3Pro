import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, Shield, Sparkles, Award, Clock, 
  MapPin, Calendar, User, Mail, Phone, ArrowRight, ArrowLeft,
  PenTool, Check, AlertCircle, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Event, Organization } from '../../types';

interface OrganizerClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimToken?: string;
  onClaimSuccess?: (event: Event) => void;
}

export const OrganizerClaimModal: React.FC<OrganizerClaimModalProps> = ({
  isOpen,
  onClose,
  claimToken,
  onClaimSuccess
}) => {
  const { events, organizations, claimProvisionalEvent, showToast } = useApp();

  // Look up provisional event & organization matching the claimToken (or fallback to any provisional event)
  const targetEvent = events.find(e => 
    (claimToken && e.organizerClaimToken === claimToken) || e.isProvisional
  ) || events[0];

  const targetOrg = organizations.find(o => 
    o.id === targetEvent?.orgId || (claimToken && o.organizerClaimToken === claimToken) || o.isProvisional
  ) || organizations[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    orgName: targetOrg?.name || targetEvent?.title || 'Community Initiative',
    ein: targetOrg?.ein && targetOrg.ein !== 'PENDING-CLAIM' ? targetOrg.ein : '84-9284102',
    address: targetOrg?.address || targetEvent?.venueAddress || '100 Ocean Blvd, Suite 200, Clearwater, FL 33767',
    phone: targetOrg?.phone || targetEvent?.organizerContact?.phone || '(555) 912-3847',
    signatoryName: targetEvent?.organizerContact?.name || targetOrg?.signatoryOfficerName || 'Captain Dave Miller',
    signatoryTitle: targetEvent?.organizerContact?.title || targetOrg?.signatoryOfficerTitle || 'Director of Conservation',
    primaryColor: targetOrg?.primaryColor || '#0ea5e9',
    
    // Volunteer Verification Controls
    verifyVolunteerHours: true,
    approvedHours: targetEvent?.nominatedByVolunteer?.hoursServed || 4.5,
    verificationNotes: 'Thank you for your dedicated service to our coastal conservation initiative. Hours officially verified.',
    supervisorSignatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetEvent) return null;

  const handleClaim = () => {
    if (!formData.signatoryName.trim() || !formData.orgName.trim()) {
      showToast('warning', 'Missing Details', 'Please provide signatory officer name and organization name.');
      return;
    }

    setIsSubmitting(true);
    const tokenToUse = claimToken || targetEvent.organizerClaimToken || 'claim_cw928471029';

    const result = claimProvisionalEvent({
      claimToken: tokenToUse,
      orgName: formData.orgName,
      ein: formData.ein,
      address: formData.address,
      phone: formData.phone,
      signatoryName: formData.signatoryName,
      signatoryTitle: formData.signatoryTitle,
      primaryColor: formData.primaryColor,
      verifyVolunteerHours: formData.verifyVolunteerHours,
      approvedHours: Number(formData.approvedHours),
      verificationNotes: formData.verificationNotes,
      supervisorSignatureData: formData.supervisorSignatureData
    });

    setIsSubmitting(false);

    if (result.success && result.event) {
      if (onClaimSuccess) onClaimSuccess(result.event);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-sky-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md">
              <Shield className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200 bg-teal-900/50 px-2.5 py-0.5 rounded-full">
                Organizer Verification & Workspace Claim Portal
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                Claim Workspace & Verify Volunteer Hours
              </h2>
            </div>
          </div>

          <p className="text-xs text-sky-100 mt-2 max-w-xl">
            You've been invited by a volunteer to formally claim <b>"{targetEvent.title}"</b>, verify their service contribution, and activate your verified organization dashboard.
          </p>

          {/* Steps */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/20 text-xs font-semibold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-teal-800 font-bold' : 'bg-white/20'}`}>1</span>
              <span>Review Volunteer Claim</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-white' : 'text-white/50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-teal-800 font-bold' : 'bg-white/20'}`}>2</span>
              <span>Organization Formalization</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-white' : 'bg-white/20'}`} />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-white' : 'text-white/50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-white text-teal-800 font-bold' : 'bg-white/20'}`}>3</span>
              <span>Activate & Launch</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* STEP 1: REVIEW VOLUNTEER'S CLAIM */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{targetEvent.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {targetEvent.venueName}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {targetEvent.startDate.slice(0, 10)}</span>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
                    Awaiting Claim
                  </span>
                </div>

                {targetEvent.nominatedByVolunteer ? (
                  <div className="bg-white border border-teal-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                          {targetEvent.nominatedByVolunteer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {targetEvent.nominatedByVolunteer.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {targetEvent.nominatedByVolunteer.email} • {targetEvent.nominatedByVolunteer.phone || 'No phone'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-teal-600">
                          {targetEvent.nominatedByVolunteer.hoursServed} Hours
                        </span>
                        <div className="text-[11px] text-slate-400">Claimed Service</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Role Contributed:</span>{' '}
                        <b className="text-slate-800">{targetEvent.nominatedByVolunteer.roleClaimed}</b>
                      </div>
                      <div>
                        <span className="text-slate-500">Service Date:</span>{' '}
                        <b className="text-slate-800">{targetEvent.nominatedByVolunteer.serviceDate}</b>
                      </div>
                    </div>

                    {targetEvent.nominatedByVolunteer.proofNotes && (
                      <div className="mt-2.5 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 italic">
                        "{targetEvent.nominatedByVolunteer.proofNotes}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    No initial volunteer claim attached. You can claim the event and publish opportunities for the community.
                  </div>
                )}
              </div>

              {/* 1-Click Verification Toggle */}
              {targetEvent.nominatedByVolunteer && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.verifyVolunteerHours}
                      onChange={e => setFormData({ ...formData, verifyVolunteerHours: e.target.checked })}
                      className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        1-Click Officially Verify Volunteer Hours & Issue Certificate
                      </span>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Approves {targetEvent.nominatedByVolunteer.name}'s service hours and issues an official verifiable Student Community Service Verification Certificate with your supervisor sign-off.
                      </p>
                    </div>
                  </label>

                  {formData.verifyVolunteerHours && (
                    <div className="pl-7 space-y-2 pt-2 border-t border-emerald-200/60">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-emerald-900 shrink-0">
                          Approved Service Hours:
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="24"
                          value={formData.approvedHours}
                          onChange={e => setFormData({ ...formData, approvedHours: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-3 py-1.5 bg-white rounded-lg border border-emerald-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                          Supervisor Verification Notes (Printed on Certificate):
                        </label>
                        <input
                          type="text"
                          value={formData.verificationNotes}
                          onChange={e => setFormData({ ...formData, verificationNotes: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-emerald-300 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: FORMALIZE ORGANIZATION DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-xl text-xs text-sky-900 flex items-start gap-2.5">
                <Building2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Organization Workspace Setup</span>
                  <p className="mt-0.5">
                    Formalize your non-profit, school, or community organization details. These credentials will appear on IRS 501(c)(3) tax receipts and volunteer verification certificates.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Organization Legal Name *
                </label>
                <input
                  type="text"
                  value={formData.orgName}
                  onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    EIN / Tax ID / School Code *
                  </label>
                  <input
                    type="text"
                    value={formData.ein}
                    onChange={e => setFormData({ ...formData, ein: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Official Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mailing / Headquarters Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Signatory Officer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.signatoryName}
                    onChange={e => setFormData({ ...formData, signatoryName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Signatory Officer Title *
                  </label>
                  <input
                    type="text"
                    value={formData.signatoryTitle}
                    onChange={e => setFormData({ ...formData, signatoryTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACTIVATE & LAUNCH */}
          {step === 3 && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-sky-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
                <Sparkles className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-black text-slate-900">
                Ready to Claim & Publish Campaign
              </h3>

              <p className="text-xs text-slate-600 max-w-md mx-auto">
                By clicking <b>Activate Workspace & Claim Campaign</b>, <b>{formData.orgName}</b> will be registered under your administrator account. 
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-lg mx-auto text-xs space-y-2 text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Organization:</span>
                  <span className="font-bold">{formData.orgName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Tax ID / EIN:</span>
                  <span className="font-mono font-bold">{formData.ein}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Signatory Officer:</span>
                  <span className="font-bold">{formData.signatoryName} ({formData.signatoryTitle})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Volunteer Verification:</span>
                  <span className="font-bold text-emerald-600">
                    {formData.verifyVolunteerHours ? `✓ ${formData.approvedHours} Hours Verified` : 'Skipped'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              Continue to Organization Setup <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleClaim}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Activating...' : '🚀 Activate Workspace & Claim Campaign'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
