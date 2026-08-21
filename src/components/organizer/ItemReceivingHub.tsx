import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, CheckCircle2, Clock, MapPin, Search, 
  Printer, FileText, Sparkles, User, Tag, Edit3, DollarSign 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { printInKindTaxLetterHtml, printItemReceivingManifestHtml } from '../../utils/exportPdf';
import { Modal } from '../common/Modal';

export const ItemReceivingHub: React.FC = () => {
  const { currentEvent, currentOrg, itemSlots, subParts, registrations, toggleItemPledgeReceived } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubPartId, setSelectedSubPartId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'delivered' | 'pending'>('all');

  // Modal state for editing receiving verification details
  const [editingPledge, setEditingPledge] = useState<{
    regId: string;
    itemSlotId: string;
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    itemName: string;
    quantity: number;
    unit: string;
    delivered: boolean;
    deliveredAt?: string;
    receivedBy?: string;
    donorNotes?: string;
    estimatedFmv?: number;
    inKindReceiptNumber?: string;
  } | null>(null);

  const [editNotes, setEditNotes] = useState('');
  const [editReceivedBy, setEditReceivedBy] = useState('');
  const [editFmv, setEditFmv] = useState<number>(0);

  // Flatten all item pledges across registrations
  const allPledgeRows = registrations.flatMap(reg => 
    reg.itemPledges.map(pledge => {
      const itemSlot = itemSlots.find(i => i.id === pledge.itemSlotId);
      const subPart = itemSlot ? subParts.find(sp => sp.id === itemSlot.subPartId) : undefined;

      return {
        regId: reg.id,
        primaryName: reg.primaryName,
        primaryEmail: reg.primaryEmail,
        primaryPhone: reg.primaryPhone,
        pledge,
        itemSlot,
        subPart
      };
    })
  );

  const filteredPledges = allPledgeRows.filter(row => {
    const nameMatch = (row.primaryName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (row.itemSlot?.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (row.subPart?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (row.pledge.donorNotes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = selectedSubPartId === 'all' || row.subPart?.id === selectedSubPartId;
    const statusMatch = statusFilter === 'all' ||
                        (statusFilter === 'delivered' && row.pledge.delivered) ||
                        (statusFilter === 'pending' && !row.pledge.delivered);
    return nameMatch && deptMatch && statusMatch;
  });

  const totalPledgedCount = allPledgeRows.reduce((sum, r) => sum + r.pledge.quantity, 0);
  const totalReceivedCount = allPledgeRows.filter(r => r.pledge.delivered).reduce((sum, r) => sum + r.pledge.quantity, 0);
  const totalInKindFmv = allPledgeRows.filter(r => r.pledge.delivered).reduce((sum, r) => sum + (r.pledge.estimatedFmv || 0), 0);

  const handleOpenEditModal = (row: typeof allPledgeRows[0]) => {
    setEditingPledge({
      regId: row.regId,
      itemSlotId: row.pledge.itemSlotId,
      donorName: row.primaryName,
      donorEmail: row.primaryEmail,
      donorPhone: row.primaryPhone,
      itemName: row.itemSlot?.itemName || 'Item',
      quantity: row.pledge.quantity,
      unit: row.itemSlot?.unit || 'units',
      delivered: row.pledge.delivered,
      deliveredAt: row.pledge.deliveredAt,
      receivedBy: row.pledge.receivedBy || currentOrg.name + ' Staff',
      donorNotes: row.pledge.donorNotes || '',
      estimatedFmv: row.pledge.estimatedFmv || (row.itemSlot?.estimatedFmvPerUnit ? row.itemSlot.estimatedFmvPerUnit * row.pledge.quantity : 25),
      inKindReceiptNumber: row.pledge.inKindReceiptNumber
    });
    setEditNotes(row.pledge.donorNotes || '');
    setEditReceivedBy(row.pledge.receivedBy || 'Event Coordinator');
    setEditFmv(row.pledge.estimatedFmv || (row.itemSlot?.estimatedFmvPerUnit ? row.itemSlot.estimatedFmvPerUnit * row.pledge.quantity : 25));
  };

  const handleSaveVerification = (markAsDelivered: boolean) => {
    if (!editingPledge) return;

    toggleItemPledgeReceived(editingPledge.regId, editingPledge.itemSlotId, {
      receivedBy: editReceivedBy,
      donorNotes: editNotes,
      estimatedFmv: Number(editFmv) || 0
    });

    setEditingPledge(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Metric Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase">Total Pledged Items</span>
            <div className="text-xl font-black text-slate-900">{totalPledgedCount} items pledged</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase">Physical Drop-Offs Received</span>
            <div className="text-xl font-black text-emerald-600">{totalReceivedCount} of {totalPledgedCount} received</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase">In-Kind Valuation (FMV)</span>
            <div className="text-xl font-black text-purple-600">{formatCurrency(totalInKindFmv)} Non-Cash Value</div>
          </div>
        </div>
      </div>

      {/* Filter and Action Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search & Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search donor, item, notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <select
            value={selectedSubPartId}
            onChange={(e) => setSelectedSubPartId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Departments ({subParts.length})</option>
            {subParts.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Drop-Off Statuses</option>
            <option value="delivered">Received & Verified ✓</option>
            <option value="pending">Awaiting Drop-Off</option>
          </select>
        </div>

        {/* Print Manifest Action */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => printItemReceivingManifestHtml(currentEvent, currentOrg, registrations, itemSlots, subParts)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Gate Drop-Off Manifest</span>
          </button>
        </div>

      </div>

      {/* Pledged Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">In-Kind Supply & Equipment Drop-Off Manifest</h3>
          <p className="text-xs text-slate-500">
            Track physical delivery of pledged supplies, record receiving volunteer names, and generate IRS non-cash tax acknowledgement receipts.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 font-bold">Item Description</th>
                <th className="pb-3 font-bold">Quantity</th>
                <th className="pb-3 font-bold">Donor & Contact</th>
                <th className="pb-3 font-bold">Drop-Off Gate / Deadline</th>
                <th className="pb-3 font-bold">Receiving Status & Date</th>
                <th className="pb-3 font-bold">Notes / FMV</th>
                <th className="pb-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPledges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No pledged items match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPledges.map((row, idx) => (
                  <tr key={`${row.regId}_${idx}`} className="hover:bg-slate-50 transition">
                    
                    {/* Item Name */}
                    <td className="py-3.5">
                      <strong className="text-slate-900 block font-bold">{row.itemSlot?.itemName || 'Item'}</strong>
                      <span className="text-[10px] text-indigo-600 font-semibold">{row.subPart?.name || 'General'}</span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 font-bold text-slate-800">
                      {row.pledge.quantity} {row.itemSlot?.unit || 'units'}
                    </td>

                    {/* Donor Details */}
                    <td className="py-3.5">
                      <strong className="text-slate-900 font-semibold block">{row.primaryName}</strong>
                      <span className="text-[10px] text-slate-400">{row.primaryPhone}</span>
                    </td>

                    {/* Drop-Off Location & Deadline */}
                    <td className="py-3.5 text-slate-600">
                      <span className="font-semibold block">{row.itemSlot?.dropOffLocation || 'Cafeteria Drop-off'}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                        Due: {row.itemSlot?.dropOffDeadline || 'Morning of Event'}
                      </span>
                    </td>

                    {/* Receiving Status */}
                    <td className="py-3.5">
                      {row.pledge.delivered ? (
                        <div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Received & Verified
                          </span>
                          {row.pledge.deliveredAt && (
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              {formatDate(row.pledge.deliveredAt)} • By {row.pledge.receivedBy || 'Staff'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
                          Awaiting Drop-Off
                        </span>
                      )}
                    </td>

                    {/* Notes & Valuation */}
                    <td className="py-3.5 text-slate-600 max-w-[180px]">
                      {row.pledge.donorNotes && (
                        <span className="italic block text-[11px] truncate" title={row.pledge.donorNotes}>
                          "{row.pledge.donorNotes}"
                        </span>
                      )}
                      {row.pledge.estimatedFmv ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          FMV: {formatCurrency(row.pledge.estimatedFmv)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">FMV unstated</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(row)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] transition"
                        title="Update delivery status and receiving notes"
                      >
                        <Edit3 className="w-3 h-3 inline mr-1" />
                        <span>{row.pledge.delivered ? 'Edit / Notes' : 'Receive Item'}</span>
                      </button>

                      {row.pledge.delivered && (
                        <button
                          onClick={() => printInKindTaxLetterHtml(
                            currentEvent,
                            currentOrg,
                            row.primaryName,
                            row.primaryEmail,
                            row.primaryPhone,
                            row.itemSlot?.itemName || 'Item',
                            row.pledge.quantity,
                            row.itemSlot?.unit || 'units',
                            row.pledge.deliveredAt || new Date().toISOString(),
                            row.pledge.estimatedFmv || 25,
                            row.pledge.inKindReceiptNumber || 'INK-2026-001',
                            row.pledge.donorNotes
                          )}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition"
                          title="Generate official IRS In-Kind non-cash tax acknowledgement receipt"
                        >
                          <FileText className="w-3 h-3 inline mr-1" />
                          <span>IRS Receipt</span>
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Receiving & Verification Modal */}
      {editingPledge && (
        <Modal
          isOpen={Boolean(editingPledge)}
          onClose={() => setEditingPledge(null)}
          title="Verify Item Drop-Off & In-Kind Receipt"
          subtitle={`Pledge: ${editingPledge.quantity} ${editingPledge.unit} of ${editingPledge.itemName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Donor Contributor</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{editingPledge.donorName}</div>
              <div className="text-slate-500">{editingPledge.donorEmail} • {editingPledge.donorPhone}</div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Receiving Staff Volunteer / Gate Lead
              </label>
              <input
                type="text"
                value={editReceivedBy}
                onChange={(e) => setEditReceivedBy(e.target.value)}
                placeholder="e.g. Sarah Jenkins (Committee Lead)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Donor & Receiving Condition Notes
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Received in sealed containers, chilled at cafeteria drop-off table, excellent condition."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Donor's Stated Fair Market Value (FMV) ($)
              </label>
              <input
                type="number"
                value={editFmv}
                onChange={(e) => setEditFmv(Number(e.target.value))}
                placeholder="e.g. 35.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                * Note: Under IRS rules, non-cash property valuation is declared by the donor for tax purposes.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPledge(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveVerification(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Save Verification</span>
              </button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
