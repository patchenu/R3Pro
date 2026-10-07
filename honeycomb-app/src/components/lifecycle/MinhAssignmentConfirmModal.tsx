import React, { useState } from 'react';
import { 
  Package, CheckCircle2, Clock, Calendar, MapPin, 
  X, Check, AlertCircle, Sparkles, Send, Mail, User, ShieldCheck, HeartHandshake 
} from 'lucide-react';
import { useHoneycomb } from '../../context/HoneycombContext';

export const MinhAssignmentConfirmModal: React.FC = () => {
  const { 
    isMinhModalOpen, 
    setIsMinhModalOpen, 
    needs, 
    event, 
    confirmNeedResponse,
    sendNeedReminder
  } = useHoneycomb();

  const [notes, setNotes] = useState('I will bring the white plastic folding table from my garage!');
  const [activeSubTab, setActiveSubTab] = useState<'pass' | 'email_preview'>('pass');

  if (!isMinhModalOpen) return null;

  // Find the table assigned to Minh or first assigned item
  const minhNeed = needs.find(n => n.assignedTo?.name.toLowerCase().includes('minh')) || needs.find(n => n.assignedTo);
  const assignment = minhNeed?.assignedTo;

  const isConfirmed = assignment?.status === 'confirmed';
  const isDeclined = assignment?.status === 'declined';

  const handleConfirm = () => {
    if (!assignment?.confirmationToken) return;
    confirmNeedResponse(assignment.confirmationToken, 'confirm', notes);
  };

  const handleDecline = () => {
    if (!assignment?.confirmationToken) return;
    confirmNeedResponse(assignment.confirmationToken, 'decline', 'Unable to bring it unfortunately.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-amber-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 text-amber-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 clip-hex bg-white/90 flex items-center justify-center text-lg shadow-xs">
              📦
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-900/20 px-2 py-0.5 rounded-full">
                Interactive Simulation
              </span>
              <h3 className="font-chunky text-base font-bold">
                Minh&apos;s 1-Click Equipment RSVP Pass
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMinhModalOpen(false)}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs: 1-Click Pass vs Simulated Email */}
        <div className="flex border-b border-slate-200 bg-amber-50/50 p-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('pass')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'pass'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-600" />
            <span>Minh&apos;s Mobile Screen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('email_preview')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'email_preview'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulated Email Notification</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {activeSubTab === 'email_preview' ? (
            /* EMAIL SIMULATION */
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-mono text-[11px]">
              <div className="border-b pb-2 space-y-1 text-slate-500 font-sans">
                <div><strong>To:</strong> {assignment?.email || 'minh.volunteer@gmail.com'}</div>
                <div><strong>From:</strong> &quot;{event.organizerName}&quot; &lt;notifications@hivebooster.org&gt;</div>
                <div><strong>Subject:</strong> 🐝 Can you bring the table for {event.name}?</div>
              </div>
              <div className="space-y-2 font-sans text-xs text-slate-800">
                <p>Hi <strong>{assignment?.name || 'Minh'}</strong>,</p>
                <p>
                  We are organizing the <strong>{event.name}</strong> for {event.organizationName}. 
                  Could you please help us by bringing the following equipment?
                </p>
                <div className="bg-white p-3 rounded-xl border border-amber-200 my-2">
                  <div className="font-bold text-amber-950">📦 {minhNeed?.title}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{minhNeed?.details}</div>
                  <div className="text-amber-800 font-bold text-[10px] mt-1">
                    📅 Needed by: {minhNeed?.dueDate} at {minhNeed?.dueTime}
                  </div>
                </div>
                <p>Tap below to confirm with 1 tap (no login or password needed):</p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('pass')}
                    className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                  >
                    [✓ Yes, I&apos;ll Bring It]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('pass')}
                    className="bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs"
                  >
                    [Decline]
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* MOBILE PASS */
            <div className="space-y-4">
              
              {/* Status Header */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                isConfirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
                isDeclined ? 'bg-rose-50 border-rose-300 text-rose-950' :
                'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                {isConfirmed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : isDeclined ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                )}
                <div>
                  <h4 className="font-chunky font-bold text-sm">
                    {isConfirmed ? 'Delivery Confirmed! 🥳' :
                     isDeclined ? 'Delivery Declined' :
                     'Action Requested: Confirm Your Support Need'}
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {isConfirmed ? 'Your pledge is recorded. The organizer has been notified.' :
                     isDeclined ? 'Organizer alerted. Fallback rule applied.' :
                     `Organizer ${event.organizerName} assigned this item to you.`}
                  </p>
                </div>
              </div>

              {/* Need Details Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Requested Item
                  </span>
                  {minhNeed?.estimatedFmv && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      IRS In-Kind FMV: ${minhNeed.estimatedFmv}
                    </span>
                  )}
                </div>

                <h3 className="font-chunky text-base font-bold text-slate-900">
                  {minhNeed?.title || '6-ft Heavy Duty Folding Table'}
                </h3>
                <p className="text-xs text-slate-600">
                  {minhNeed?.details || 'Need 1 folding table for the Visitor Team Check-In Gate.'}
                </p>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Due Date:</span>
                    <strong className="text-slate-800">{minhNeed?.dueDate} at {minhNeed?.dueTime}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Location:</span>
                    <strong className="text-slate-800 line-clamp-1">{event.location}</strong>
                  </div>
                </div>
              </div>

              {/* Note Input */}
              {!isConfirmed && (
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Add a quick note to the organizer (optional):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Bringing my white plastic folding table"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`flex-1 py-3 px-4 rounded-2xl font-chunky font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    isConfirmed 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-honey'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isConfirmed ? 'Confirmed ✓' : 'I\'ll Bring It! ✓'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDecline}
                  className="py-3 px-4 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition cursor-pointer"
                >
                  {isDeclined ? 'Declined' : 'Can\'t Bring It'}
                </button>
              </div>

              {/* Fallback rule indicator */}
              <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-[10px] text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Fallback Enabled:</strong> If declined, system immediately alerts Coach Dan AND offers to release to the public parent wishlist.
                </span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
