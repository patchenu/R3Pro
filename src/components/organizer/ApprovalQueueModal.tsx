import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Check, X, ShieldAlert, Clock, DollarSign, Users } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface ApprovalQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApprovalQueueModal: React.FC<ApprovalQueueModalProps> = ({ isOpen, onClose }) => {
  const { approvalRequests, approveRequest, rejectRequest, currentEvent } = useApp();

  const pendingRequests = approvalRequests.filter(r => r.status === 'pending');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Planner Approval Queue"
      subtitle={`Review requests submitted by Committee Leads exceeding the $${currentEvent.approvalThresholdBudget} budget or ${currentEvent.approvalThresholdSlots}-slot threshold`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            No pending approval requests. All committee actions are currently within policy thresholds.
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-full">
                    {req.type === 'budget_increase' ? 'Budget Addition Request' : 'Volunteer Shift Addition'}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{req.title}</h4>
                  <p className="text-xs text-slate-600">
                    Requested by: <strong>{req.requestedByName}</strong> • Department: <strong>{req.subPartName}</strong>
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {formatDate(req.requestedAt)}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200/80 text-xs text-slate-700 leading-relaxed">
                <strong>Justification:</strong> {req.description}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs font-bold text-slate-700">
                  {req.type === 'budget_increase' ? `Amount: +${formatCurrency(req.amountOrCount)}` : `Capacity: +${req.amountOrCount} volunteers`}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5 text-rose-500" />
                    Decline
                  </button>

                  <button
                    onClick={() => approveRequest(req.id)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve & Apply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Close Queue
          </button>
        </div>
      </div>
    </Modal>
  );
};
