import React, { useState } from 'react';
import { 
  Package, CheckCircle2, Clock, Calendar, MapPin, 
  X, Check, AlertCircle, Sparkles, Send, Mail, User, ShieldCheck, HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ItemSlot, Event, Organization } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface NeedConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  itemSlot?: ItemSlot;
}

export const NeedConfirmationModal: React.FC<NeedConfirmationModalProps> = ({
  isOpen,
  onClose,
  token,
  itemSlot: propItemSlot
}) => {
  const { itemSlots, events, organizations, confirmItemNeed, showToast } = useApp();
  const [responseNotes, setResponseNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'confirmation' | 'email_preview'>('confirmation');

  // Find matching item slot either from prop or token
  const item = propItemSlot || (token ? itemSlots.find(i => i.assignedTo?.confirmationToken === token) : undefined);
  const event = item ? events.find(e => e.id === item.eventId) : undefined;
  const org = event ? organizations.find(o => o.id === event.orgId) : undefined;

  if (!isOpen || !item) return null;

  const assignment = item.assignedTo;
  const isConfirmed = assignment?.status === 'confirmed';
  const isDeclined = assignment?.status === 'declined';
  const isPending = !isConfirmed && !isDeclined;

  const handleConfirm = () => {
    if (!assignment?.confirmationToken) return;
    confirmItemNeed(assignment.confirmationToken, 'confirm', responseNotes);
  };

  const handleDecline = () => {
    if (!assignment?.confirmationToken) return;
    confirmItemNeed(assignment.confirmationToken, 'decline', responseNotes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Support Need Delivery Confirmation"
      subtitle={event?.title || 'Community Event Equipment & Support'}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        
        {/* Sub-Tabs: 1-Click Confirmation vs Email Dispatch Preview */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('confirmation')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'confirmation'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>1-Click Confirmation Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email_preview')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'email_preview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulated Email Notification</span>
          </button>
        </div>

        {/* TAB 1: 1-CLICK CONFIRMATION PASS */}
        {activeTab === 'confirmation' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Status Header Banner */}
            <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
              isConfirmed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              isDeclined ? 'bg-rose-50 border-rose-200 text-rose-900' :
              'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-start gap-2.5">
                {isConfirmed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : isDeclined ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm">
                    {isConfirmed ? 'Delivery Confirmed! ✓' :
                     isDeclined ? 'Adjustment Requested' :
                     'Pending Your Confirmation'}
                  </h4>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    {isConfirmed ? `Thank you, ${assignment?.assignedToName}! The event coordinators have been notified.` :
                     isDeclined ? `You indicated you cannot fulfill this need. Coordinators will reassign.` :
                     `Hello ${assignment?.assignedToName || 'Supporter'}! You have been requested to provide this equipment item.`}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                isConfirmed ? 'bg-emerald-200 text-emerald-900' :
                isDeclined ? 'bg-rose-200 text-rose-900' :
                'bg-amber-200 text-amber-900'
              }`}>
                {assignment?.status.replace('_', ' ') || 'Pending'}
              </span>
            </div>

            {/* Need Details Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px] uppercase tracking-wider">
                    {item.needType || 'Equipment Need'}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{item.itemName}</h3>
                  <div className="text-xs font-extrabold text-indigo-700 mt-0.5">
                    Quantity: {item.quantityNeeded} {item.unit}
                  </div>
                </div>

                {item.estimatedFmvPerUnit && item.estimatedFmvPerUnit > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">IRS Non-Cash FMV Value</span>
                    <span className="font-black text-sm text-emerald-700">
                      {formatCurrency(item.estimatedFmvPerUnit * item.quantityNeeded)}
                    </span>
                  </div>
                )}
              </div>

              {/* Logistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Drop-Off Deadline & Time:</strong>
                    <span>{item.dropOffDeadline || 'Event Morning Setup'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Drop-Off Gate Location:</strong>
                    <span>{item.dropOffLocation || 'Main Check-In Desk'}</span>
                  </div>
                </div>
              </div>

              {assignment?.confirmationNotes && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <strong>Coordinator Note:</strong> &quot;{assignment.confirmationNotes}&quot;
                </div>
              )}
            </div>

            {/* Response Form */}
            {!isConfirmed && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Optional Note to Event Coordinator (e.g. "I can bring 2 tables instead of 1")
                  </label>
                  <input
                    type="text"
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="Add notes, dimensions, or ETA..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs"
                  />
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>✓ I Confirm I Will Bring This ({item.itemName})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDecline}
                    className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline / Request Adjustment</span>
                  </button>
                </div>
              </div>
            )}

            {isConfirmed && (
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-2 text-indigo-950">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <HeartHandshake className="w-4 h-4 text-indigo-600" />
                  <span>501(c)(3) In-Kind Contribution Substantiation</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Your physical contribution qualifies for an official IRS Publication 526 non-cash contribution acknowledgement letter upon drop-off verification at {event?.venueName || 'the event'}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SIMULATED EMAIL DISPATCH PREVIEW */}
        {activeTab === 'email_preview' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-3 font-mono text-[11px]">
              <div className="space-y-1 pb-3 border-b border-slate-700">
                <div><span className="text-slate-400">From:</span> &quot;{org?.name || 'Community Event'} via REACH&quot; &lt;notifications@mail.reachplatform.com&gt;</div>
                <div><span className="text-slate-400">To:</span> {assignment?.assignedToName} &lt;{assignment?.assignedToEmail}&gt;</div>
                <div><span className="text-slate-400">Subject:</span> Action Requested: Confirm {item.itemName} delivery for {event?.title}</div>
                <div><span className="text-slate-400">Priority:</span> P1 (Operational Logistics Fast-Lane)</div>
              </div>

              <div className="space-y-3 text-slate-200 font-sans text-xs pt-1">
                <p>Hello <strong>{assignment?.assignedToName}</strong>,</p>
                <p>
                  You have been assigned to provide <strong>{item.quantityNeeded} {item.unit} of {item.itemName}</strong> for <strong>{event?.title}</strong> on behalf of <strong>{org?.name}</strong>.
                </p>

                <div className="p-3 bg-slate-800 rounded-xl space-y-1 border border-slate-700">
                  <div>📅 <strong>Required By:</strong> {item.dropOffDeadline}</div>
                  <div>📍 <strong>Reporting Gate:</strong> {item.dropOffLocation}</div>
                  {item.estimatedFmvPerUnit && (
                    <div>💎 <strong>Estimated Fair Market Value (FMV):</strong> {formatCurrency(item.estimatedFmvPerUnit * item.quantityNeeded)}</div>
                  )}
                </div>

                <div className="py-2 text-center">
                  <div className="inline-block bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                    👉 Click to 1-Tap Confirm Table / Item Delivery
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  Automated reminders will be dispatched at T-72h, T-24h, and T-2h before the drop-off deadline.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
