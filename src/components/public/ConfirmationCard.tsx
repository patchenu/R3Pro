import React from 'react';
import { Registration, Event, SubPart, Shift } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle2, Calendar, MapPin, Phone, ShieldCheck, 
  Download, Printer, HeartHandshake, ArrowRight, Share2 
} from 'lucide-react';
import { formatDate, formatTimeRange, formatCurrency } from '../../utils/formatters';
import { generateIcsFile, getGoogleCalendarUrl } from '../../utils/calendar';

interface ConfirmationCardProps {
  registration: Registration;
  event: Event;
  subParts: SubPart[];
  shifts: Shift[];
  onClose: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  registration,
  event,
  subParts,
  shifts,
  onClose
}) => {
  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const subPartMap = new Map(subParts.map(sp => [sp.id, sp]));

  const downloadCalendar = () => {
    const firstClaim = registration.shiftClaims[0];
    const shift = firstClaim ? shiftMap.get(firstClaim.shiftId) : null;
    const subPart = shift ? subPartMap.get(shift.subPartId) : null;

    generateIcsFile({
      title: `${event.title} - ${shift?.title || 'Volunteer Shift'}`,
      description: `Reporting Gate: ${subPart?.reportingGate || 'Main Desk'}\nLead Contact: ${subPart?.leadName} (${subPart?.leadPhone})\nDress Code: ${subPart?.dressCodeNotes}`,
      location: event.venueAddress,
      startTime: shift?.startTime || event.startDate,
      endTime: shift?.endTime || event.endDate
    });
  };

  const googleCalUrl = () => {
    const firstClaim = registration.shiftClaims[0];
    const shift = firstClaim ? shiftMap.get(firstClaim.shiftId) : null;
    const subPart = shift ? subPartMap.get(shift.subPartId) : null;

    return getGoogleCalendarUrl({
      title: `${event.title} - ${shift?.title || 'Volunteer Shift'}`,
      description: `Reporting Gate: ${subPart?.reportingGate || 'Main Desk'}\nLead Contact: ${subPart?.leadName} (${subPart?.leadPhone})\nDress Code: ${subPart?.dressCodeNotes}`,
      location: event.venueAddress,
      startTime: shift?.startTime || event.startDate,
      endTime: shift?.endTime || event.endDate
    });
  };

  const totalDonations = registration.donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-inner">
          <CheckCircle2 className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">You're All Set, {registration.primaryName}!</h2>
        <p className="text-sm text-emerald-100 mt-1 max-w-md mx-auto">
          Thank you for signing up to support <strong className="text-white">{event.title}</strong>.
        </p>

        <div className="inline-block mt-4 px-3.5 py-1 rounded-full bg-black/20 text-xs font-mono tracking-wider border border-white/20">
          CONFIRMATION #{registration.id.toUpperCase()}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        
        {/* QR Pass & Digital Check-In Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
            <QRCodeSVG 
              value={`https://gatherraise.org/checkin/${registration.manageToken}`} 
              size={110} 
              level="M" 
            />
            <span className="block text-[9px] font-mono text-center text-slate-400 mt-1">EXPRESS PASS</span>
          </div>

          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="w-4 h-4" />
              Express Day-of-Event Check-In
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">Show this QR Code at the Entrance</h4>
            <p className="text-xs text-slate-500 mt-1">
              Keep this screen open or save the confirmation link. You can also self check-in using your phone number <strong>{registration.primaryPhone}</strong> at the front door tablet kiosk.
            </p>
          </div>
        </div>

        {/* Claimed Shifts with Reporting Instructions */}
        {registration.shiftClaims.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Your Scheduled Volunteer Shifts
            </h4>

            <div className="space-y-3">
              {registration.shiftClaims.map((claim, idx) => {
                const shift = shiftMap.get(claim.shiftId);
                const subPart = shift ? subPartMap.get(shift.subPartId) : null;
                const member = registration.members.find(m => m.id === claim.groupMemberId) || registration.members[0];

                return (
                  <div key={idx} className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
                          {subPart?.name || 'General Team'}
                        </span>
                        <h5 className="text-base font-bold text-slate-900">{shift?.title}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Assigned to: <strong>{member.name}</strong> {member.isMinor && '(Minor / Student)'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-white text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 shadow-sm">
                        {shift ? `${shift.startTime.slice(11,16)} - ${shift.endTime.slice(11,16)}` : 'Confirmed'}
                      </span>
                    </div>

                    {/* Reporting Logistics Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-indigo-100/80 text-xs">
                      <div className="flex items-start gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <strong>Report To:</strong> {subPart?.reportingGate || event.venueAddress}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-slate-700">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Lead on Duty:</strong> {subPart?.leadName} ({subPart?.leadPhone})
                        </div>
                      </div>

                      {subPart?.dressCodeNotes && (
                        <div className="col-span-full text-slate-600 bg-white/70 p-2 rounded-lg border border-indigo-100/60 text-[11px]">
                          <strong>Dress Code & Gear:</strong> {subPart.dressCodeNotes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pledged Items Summary */}
        {registration.itemPledges.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pledged Supplies & Items
            </h4>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 divide-y divide-slate-200 text-xs">
              {registration.itemPledges.map((p, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                  <span className="font-semibold text-slate-800">Item Pledge #{idx + 1}</span>
                  <span className="font-bold text-indigo-600">{p.quantity} Promised</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donations & Tax Receipt */}
        {totalDonations > 0 && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" />
                Donation Received
              </span>
              <div className="text-lg font-black text-slate-900">{formatCurrency(totalDonations)}</div>
              <p className="text-[11px] text-emerald-800">
                Receipt #{registration.donations[0]?.taxReceiptNumber} issued. 501(c)(3) eligible.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons: Add to Calendar & Print */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={downloadCalendar}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-indigo-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Apple / .iCal File</span>
          </button>

          <a
            href={googleCalUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs transition"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Add to Google Calendar</span>
          </a>
        </div>

        {/* Footer Close */}
        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Return to Event Page
          </button>
        </div>

      </div>
    </div>
  );
};
