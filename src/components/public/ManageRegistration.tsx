import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Registration, Shift, SubPart, ItemSlot, TicketTier } from '../../types';
import { Modal } from '../common/Modal';
import { 
  KeyRound, Search, CheckCircle2, XCircle, Calendar, 
  MapPin, Phone, ShieldCheck, Download, Trash2, ArrowLeft,
  Gift, Ticket, HeartHandshake, Clock, FileText 
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { generateIcsFile } from '../../utils/calendar';

interface ManageRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageRegistration: React.FC<ManageRegistrationProps> = ({ isOpen, onClose }) => {
  const { registrations, cancelRegistration, shifts, subParts, itemSlots, ticketTiers, currentEvent } = useApp();
  const [tokenInput, setTokenInput] = useState('');
  const [activeReg, setActiveReg] = useState<Registration | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = tokenInput.trim();
    const found = registrations.find(r => 
      r.manageToken === cleaned || 
      r.id.toLowerCase() === cleaned.toLowerCase() || 
      r.primaryPhone.includes(cleaned) || 
      r.primaryEmail.toLowerCase() === cleaned.toLowerCase()
    );
    
    if (found) {
      setActiveReg(found);
    } else {
      setErrorMsg('No registration found matching that manage token, confirmation ID, email, or phone number.');
    }
  };

  const handleCancel = () => {
    if (!activeReg) return;
    if (window.confirm('Are you sure you want to cancel this entire sign-up? Your claimed shifts and pledged items will be released to others.')) {
      cancelRegistration(activeReg.manageToken);
      setActiveReg(null);
      onClose();
    }
  };

  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));
  const itemMap = new Map(itemSlots.map(i => [i.id, i]));
  const tierMap = new Map(ticketTiers.map(t => [t.id, t]));

  const handleDownloadCalendar = () => {
    if (!activeReg) return;
    const firstClaim = activeReg.shiftClaims[0];
    const shift = firstClaim ? shiftMap.get(firstClaim.shiftId) : null;
    const subPart = shift ? subPartMap.get(shift.subPartId) : null;

    generateIcsFile({
      title: `${currentEvent.title} - ${shift?.title || 'Volunteer Sign-Up'}`,
      description: `Reporting Gate: ${subPart?.reportingGate || currentEvent.venueName}\nLead on Duty: ${subPart?.leadName || 'Event Coordinator'} (${subPart?.leadPhone || ''})\nDress Code: ${subPart?.dressCodeNotes || 'Comfortable attire'}`,
      location: currentEvent.venueAddress,
      startTime: shift?.startTime || currentEvent.startDate,
      endTime: shift?.endTime || currentEvent.endDate
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Your Registration & Pass"
      subtitle="View, update, or cancel your sign-up, download calendar appointments, or inspect pass details"
      maxWidth="2xl"
      resetScrollKey={activeReg ? activeReg.id : 'lookup'}
    >
      {!activeReg ? (
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Enter Your Manage Token, Email, or Phone</span>
              <span className="text-slate-600">Enter the confirmation code, manage token, email, or phone number from your booking confirmation.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Manage Token / Email / Phone Number *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. tok_d83fa9b20184c7e1990a2 or david.chen@gmail.com"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Sign-Up</span>
              </button>
            </div>
            {errorMsg && <p className="text-rose-600 text-xs mt-1.5">{errorMsg}</p>}
          </div>
        </form>
      ) : (
        <div className="space-y-5 text-xs">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Active Booking Record</span>
                <span className="text-[10px] font-mono text-slate-400">ID: {activeReg.id.toUpperCase()}</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{activeReg.primaryName}</h4>
              <p className="text-xs text-slate-500">{activeReg.primaryEmail} • {activeReg.primaryPhone}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                activeReg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {activeReg.status}
              </span>
            </div>
          </div>

          {/* 1. Claimed Volunteer Shifts */}
          {activeReg.shiftClaims && activeReg.shiftClaims.length > 0 && (
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Claimed Volunteer Shifts ({activeReg.shiftClaims.length})</span>
              </h5>
              <div className="space-y-2">
                {activeReg.shiftClaims.map((claim, idx) => {
                  const shift = shiftMap.get(claim.shiftId);
                  const subPart = shift ? subPartMap.get(shift.subPartId) : null;
                  const member = activeReg.members.find(m => m.id === claim.groupMemberId) || activeReg.members[0];

                  return (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{shift?.title || 'Volunteer Shift'}</span>
                          {member && member.name !== activeReg.primaryName && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md">
                              For: {member.name}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Committee: <strong>{subPart?.name || 'General Operations'}</strong> • Reporting Gate: <strong>{subPart?.reportingGate || 'Main Desk'}</strong>
                        </div>
                        {subPart?.leadName && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Lead: {subPart.leadName} ({subPart.leadPhone})
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold block text-xs">
                          {shift ? `${shift.startTime.slice(11,16)} - ${shift.endTime.slice(11,16)}` : 'Scheduled'}
                        </span>
                        <span className={`text-[10px] font-semibold mt-1 inline-block ${claim.checkedIn ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {claim.checkedIn ? '✓ Checked In' : 'Pending Check-In'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Pledged Supplies & Equipment */}
          {activeReg.itemPledges && activeReg.itemPledges.length > 0 && (
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Pledged Wishlist Supplies & Equipment ({activeReg.itemPledges.length})</span>
              </h5>
              <div className="space-y-2">
                {activeReg.itemPledges.map((p, idx) => {
                  const item = itemMap.get(p.itemSlotId);
                  return (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                      <div>
                        <h6 className="font-extrabold text-slate-900 text-xs">{item?.itemName || `Pledged Item #${idx + 1}`}</h6>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Drop-Off Gate: <strong>{item?.dropOffLocation || 'Main Receiving Gate'}</strong> • Deadline: <strong>{item?.dropOffDeadline || 'Day of Event'}</strong>
                        </p>
                        {item?.estimatedFmvPerUnit && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            Est. FMV: ${item.estimatedFmvPerUnit * p.quantity} (${item.estimatedFmvPerUnit}/{item.unit})
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-xs block">
                          {p.quantity} {item?.unit || 'units'} Promised
                        </span>
                        <span className={`text-[10px] font-semibold mt-1 inline-block ${p.delivered ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {p.delivered ? '✓ Delivered & Received' : 'Pending Drop-Off'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Admission & Commercial Tickets */}
          {activeReg.ticketPurchases && activeReg.ticketPurchases.length > 0 && (
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-indigo-600" />
                <span>Admission & Sponsorship Packages ({activeReg.ticketPurchases.length})</span>
              </h5>
              <div className="space-y-2">
                {activeReg.ticketPurchases.map((tp, idx) => {
                  const tier = tierMap.get(tp.ticketTierId);
                  return (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs">{tier?.title || 'Admission Package'}</span>
                        <p className="text-[11px] text-slate-500">{tp.quantity}x Tickets / Packages</p>
                        {tp.boothAssignedNumber && (
                          <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                            Assigned Booth: {tp.boothAssignedNumber}
                          </div>
                        )}
                      </div>
                      <span className="font-black text-slate-900 text-xs">
                        {tier ? formatCurrency(tier.price * tp.quantity) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Direct Donations */}
          {activeReg.donations && activeReg.donations.length > 0 && (
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Direct Charitable Donations</span>
              </h5>
              <div className="space-y-2">
                {activeReg.donations.map((d, idx) => (
                  <div key={idx} className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-emerald-950 text-xs">Direct Contribution</span>
                      <p className="text-[11px] text-emerald-800">
                        Official 501(c)(3) Receipt #{d.taxReceiptNumber} • {d.feeCovered ? 'Processing fee covered by donor' : 'Standard processing'}
                      </p>
                    </div>
                    <span className="text-sm font-black text-emerald-800">
                      {formatCurrency(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveReg(null)}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Look Up Another</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCalendar}
                className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-bold flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .iCal</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancel Sign-Up</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
