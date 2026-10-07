import React, { useState } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, AlertTriangle, FileText, 
  Award, Clock, User, Phone, Mail, MapPin, Calendar, 
  Printer, PenTool, Check, AlertCircle, Sparkles, Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Registration, Shift, SubPart, GroupMember, SignedWaiver } from '../../types';
import { SignaturePad } from '../common/SignaturePad';
import { printStudentServiceLetterHtml } from '../../utils/exportPdf';
import { formatDate } from '../../utils/formatters';

interface ParticipantVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
  shiftId: string;
  groupMemberId: string;
}

export const ParticipantVerificationModal: React.FC<ParticipantVerificationModalProps> = ({
  isOpen,
  onClose,
  registration,
  shiftId,
  groupMemberId
}) => {
  const { 
    currentOrg, 
    currentEvent, 
    currentUser, 
    shifts, 
    subParts, 
    verifyParticipant, 
    flagParticipantForReview, 
    showToast 
  } = useApp();

  const shift = shifts.find(s => s.id === shiftId);
  const subPart = subParts.find(sp => sp.id === shift?.subPartId);
  const member = registration.members.find(m => m.id === groupMemberId) || registration.members[0];
  const claim = registration.shiftClaims.find(sc => sc.shiftId === shiftId && sc.groupMemberId === groupMemberId) || registration.shiftClaims[0];
  const waiver = registration.waivers.find(w => w.groupMemberId === groupMemberId) || registration.waivers[0];

  const [hoursAwarded, setHoursAwarded] = useState<number>(
    claim?.serviceHoursAwarded || 
    (shift ? 3.0 : 2.5)
  );

  const [verificationNotes, setVerificationNotes] = useState<string>(
    claim?.verificationNotes || 'Demonstrated excellent punctuality, safety compliance, and community service contribution.'
  );

  const [supervisorName, setSupervisorName] = useState<string>(
    currentUser.name || currentOrg.signatoryOfficerName || 'Authorized Event Coordinator'
  );

  const [signatureData, setSignatureData] = useState<string>(
    claim?.supervisorSignatureData || ''
  );

  const [isFlagging, setIsFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('Requires attendance confirmation with committee lead');
  const [activeTab, setActiveTab] = useState<'dossier' | 'sign_off' | 'certificate'>('dossier');

  if (!isOpen || !registration || !shift || !member) return null;

  const isVerified = claim?.verificationStatus === 'supervisor_signed';
  const certNumber = claim?.certificateNumber || `CERT-${new Date().getFullYear()}-X${Math.floor(1000 + Math.random() * 9000)}`;

  const handleVerify = () => {
    if (hoursAwarded <= 0) {
      showToast('warning', 'Invalid Hours', 'Please enter a valid number of service hours.');
      return;
    }

    verifyParticipant({
      registrationId: registration.id,
      shiftId: shift.id,
      groupMemberId: member.id,
      hoursAwarded: Number(hoursAwarded),
      notes: verificationNotes,
      supervisorSignatureData: signatureData,
      supervisorName: supervisorName
    });

    setActiveTab('certificate');
  };

  const handleFlag = () => {
    if (!flagReason.trim()) {
      showToast('warning', 'Reason Required', 'Please provide a reason for flagging this registration.');
      return;
    }

    flagParticipantForReview(
      registration.id,
      shift.id,
      member.id,
      flagReason
    );
    setIsFlagging(false);
  };

  const handlePrintCertificate = () => {
    printStudentServiceLetterHtml(
      member.name,
      hoursAwarded,
      currentEvent,
      currentOrg
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  4-Pillar Participant Verification
                </span>
                {isVerified && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Certified & Signed
                  </span>
                )}
                {claim?.verificationStatus === 'flagged_review' && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Under Review
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {member.name} • {shift.title}
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/15">
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'dossier' 
                  ? 'bg-white text-slate-900 shadow' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Verification Dossier (4 Pillars)
            </button>

            <button
              onClick={() => setActiveTab('sign_off')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sign_off' 
                  ? 'bg-white text-slate-900 shadow' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              2. Supervisor Sign-Off
            </button>

            {isVerified && (
              <button
                onClick={() => setActiveTab('certificate')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'certificate' 
                    ? 'bg-teal-400 text-slate-950 shadow' 
                    : 'text-teal-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                3. Service Certificate
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: 4-PILLAR VERIFICATION DOSSIER */}
          {activeTab === 'dossier' && (
            <div className="space-y-6">
              
              {/* Pillar 1: Identity & Account Authenticity */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                      1
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Pillar 1: Identity & Account Authenticity
                    </span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Verified Contact
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Legal Name:</span>
                    <div className="font-bold text-slate-800 text-sm">{member.name}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Email:</span>
                    <div className="font-medium text-slate-700">{member.email || registration.primaryEmail}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Phone:</span>
                    <div className="font-medium text-slate-700">{member.phone || registration.primaryPhone}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Household Role:</span>
                    <div className="font-medium text-slate-700">
                      {member.relationship} {member.isMinor && <b className="text-amber-600">(Minor / Age {member.age || 'Under 18'})</b>}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Primary Registrant:</span>
                    <div className="font-medium text-slate-700">{registration.primaryName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Security Token:</span>
                    <div className="font-mono text-[11px] text-slate-500">{registration.manageToken.slice(0, 16)}...</div>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Legal & Safety Waiver Compliance */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                      2
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Pillar 2: Legal & Safety Waiver Compliance
                    </span>
                  </div>
                  {waiver ? (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      E-Signature On File
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                      No Waiver Required
                    </span>
                  )}
                </div>

                {waiver ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-xs space-y-1.5 text-slate-700">
                      <div><span className="text-slate-500">Agreement Title:</span> <b>{waiver.waiverTitle}</b></div>
                      <div><span className="text-slate-500">Signer Legal Name:</span> <b>{waiver.signerName}</b> ({waiver.signerRelationship})</div>
                      <div><span className="text-slate-500">Signed Timestamp:</span> {formatDate(waiver.signedAt)}</div>
                      <div><span className="text-slate-500">Audit IP Address:</span> <span className="font-mono text-[11px] bg-slate-200 px-1.5 py-0.5 rounded">{waiver.ipAddress}</span></div>
                      {member.emergencyContactName && (
                        <div className="pt-1 text-slate-600">
                          <span className="text-slate-500">Emergency Contact:</span> {member.emergencyContactName} ({member.emergencyContactPhone || 'On file'})
                        </div>
                      )}
                    </div>

                    {/* Signature Preview Canvas Box */}
                    <div className="border border-slate-300 rounded-xl p-3 bg-white flex flex-col justify-between">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Digital Vector Canvas Signature
                      </div>
                      <div className="h-16 flex items-center justify-center bg-slate-50 rounded border border-dashed border-slate-200 p-1">
                        {waiver.signatureData.startsWith('data:image') ? (
                          <img src={waiver.signatureData} alt="Signature" className="max-h-14 object-contain" />
                        ) : (
                          <span className="font-serif italic text-lg text-slate-800 font-bold">
                            {waiver.signatureData || waiver.signerName}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold text-right mt-1 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Cryptographically Bound
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    This shift does not require a formal liability waiver release.
                  </div>
                )}
              </div>

              {/* Pillar 3: Door & Gate Check-In Presence */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-black">
                      3
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Pillar 3: Gate Presence & Attendance Integrity
                    </span>
                  </div>
                  {claim?.checkedIn ? (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Checked-In at Gate
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                      Not Scanned at Door
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Department / Committee:</span>
                    <div className="font-bold text-slate-800">{subPart?.name || 'General Operations'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Reporting Gate:</span>
                    <div className="font-medium text-slate-700">{subPart?.reportingGate || 'Main Gate'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Check-In Timestamp:</span>
                    <div className="font-medium text-slate-700">
                      {claim?.checkedInAt ? formatDate(claim.checkedInAt) : 'Pending arrival'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Verified By Gate Operator:</span>
                    <div className="font-medium text-slate-700">{claim?.checkedInBy || subPart?.leadName || 'Organizer'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Shift Window:</span>
                    <div className="font-medium text-slate-700">
                      {shift.startTime.slice(11, 16)} - {shift.endTime.slice(11, 16)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Attendance Standing:</span>
                    <div className="font-bold text-emerald-600">100% On-Time Record</div>
                  </div>
                </div>
              </div>

              {/* Pillar 4: Supervisor Sign-Off Summary Banner */}
              <div className="border border-teal-300 rounded-2xl p-5 bg-gradient-to-r from-teal-50 to-sky-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                      4
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-950">
                      Pillar 4: Supervisor Sign-Off & Official Certificate
                    </span>
                  </div>
                  {isVerified ? (
                    <span className="text-xs font-mono font-bold bg-teal-200/80 text-teal-900 px-2.5 py-0.5 rounded-full">
                      {claim.certificateNumber}
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-200/80 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                      Pending Supervisor Signature
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3">
                  <div>
                    <div className="text-sm font-black text-teal-950">
                      {hoursAwarded} Verified Community Service Hours
                    </div>
                    <p className="text-xs text-teal-800 mt-0.5">
                      {isVerified 
                        ? `Officially signed by ${claim?.verifiedByName || supervisorName} on ${formatDate(claim?.verifiedAt || '')}.`
                        : 'Ready to sign off and issue student service verification certificate.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('sign_off')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      {isVerified ? 'Edit Supervisor Sign-Off' : 'Sign Off & Approve Hours'}
                    </button>
                    {isVerified && (
                      <button
                        onClick={handlePrintCertificate}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Flag for Review Option */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                {!isFlagging ? (
                  <button
                    onClick={() => setIsFlagging(true)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Flag Registration for Inquiry / Audit
                  </button>
                ) : (
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">Flag for Inquiry</span>
                      <button onClick={() => setIsFlagging(false)} className="text-xs text-amber-700 hover:text-amber-900">Cancel</button>
                    </div>
                    <input
                      type="text"
                      value={flagReason}
                      onChange={e => setFlagReason(e.target.value)}
                      placeholder="Reason for audit flag..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white"
                    />
                    <button
                      onClick={handleFlag}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg"
                    >
                      Apply Audit Flag
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SUPERVISOR SIGN-OFF WORKSPACE */}
          {activeTab === 'sign_off' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-xs text-sky-900">
                <span className="font-bold">Supervisor Official Verification Sign-Off</span>
                <p className="mt-0.5">
                  Confirm the total service hours awarded to <b>{member.name}</b> and provide your digital signature to authorize their Student Community Service Certificate.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Verified Hours Awarded *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={hoursAwarded}
                      onChange={e => setHoursAwarded(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Supervisor / Coordinator Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={supervisorName}
                      onChange={e => setSupervisorName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Supervisor Commendation & Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={e => setVerificationNotes(e.target.value)}
                  placeholder="Notes printed on verification certificate..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
                />
              </div>

              {/* Signature Capture Canvas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Supervisor Digital Vector Signature *
                </label>
                <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                  <SignaturePad
                    signerName={supervisorName}
                    onSignatureCapture={(data) => setSignatureData(data)}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('dossier')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={handleVerify}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Approve Hours & Generate Certificate
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL CERTIFICATE PREVIEW */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="border-4 border-double border-slate-800 rounded-2xl p-6 bg-slate-50/50 text-slate-900 relative shadow-inner">
                
                {/* Certificate Header */}
                <div className="text-center border-b border-slate-300 pb-4 mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {currentOrg.name} • Non-Profit 501(c)(3)
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-wide mt-1 uppercase">
                    Official Student Community Service Certificate
                  </h3>
                  <div className="text-[11px] font-mono text-teal-700 mt-1 font-bold">
                    Certificate #{certNumber} • Verifiable Record
                  </div>
                </div>

                {/* Body */}
                <div className="text-center py-3 space-y-3">
                  <p className="text-xs text-slate-600">This official document certifies that</p>
                  <div className="text-2xl font-black text-slate-950 font-serif underline decoration-teal-500 decoration-2">
                    {member.name}
                  </div>
                  <p className="text-xs text-slate-600">has successfully completed and verified</p>
                  <div className="inline-block px-4 py-1.5 bg-teal-100/80 border border-teal-300 rounded-full text-teal-900 font-black text-base">
                    ★ {hoursAwarded.toFixed(1)} Verified Service Hours ★
                  </div>
                </div>

                {/* Event & Task Info */}
                <div className="my-4 p-3.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-700 text-left">
                  <div><b>Campaign / Event:</b> {currentEvent.title}</div>
                  <div><b>Duty / Role Contributed:</b> {shift.title}</div>
                  <div><b>Date of Service:</b> {formatDate(currentEvent.startDate)}</div>
                  <div><b>Supervisor Notes:</b> <i>"{verificationNotes}"</i></div>
                </div>

                {/* Signatures */}
                <div className="mt-6 pt-4 border-t border-slate-300 flex items-end justify-between text-xs">
                  <div>
                    <div className="font-mono text-[10px] text-slate-400">Tamper-Proof Verification QR</div>
                    <div className="w-14 h-14 bg-slate-900 text-white rounded flex items-center justify-center font-mono text-[8px] font-bold mt-1">
                      [VERIFY]
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="h-10 flex items-center justify-end mb-1">
                      {signatureData.startsWith('data:image') ? (
                        <img src={signatureData} alt="Signature" className="max-h-8 object-contain" />
                      ) : (
                        <span className="font-serif italic text-base font-bold text-slate-800">
                          {supervisorName}
                        </span>
                      )}
                    </div>
                    <div className="border-t border-slate-800 pt-1 w-48 font-bold text-slate-900 text-[11px]">
                      {supervisorName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Authorized Signatory • {currentOrg.name}
                    </div>
                  </div>
                </div>

              </div>

              {/* Certificate Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveTab('dossier')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
                >
                  ← Back to Dossier
                </button>

                <button
                  onClick={handlePrintCertificate}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4 text-teal-400" />
                  Print Official PDF Certificate
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
