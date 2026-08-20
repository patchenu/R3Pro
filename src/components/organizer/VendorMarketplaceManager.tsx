import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorApplication } from '../../types';
import { Store, Check, X, ShieldCheck, Zap, DollarSign, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const VendorMarketplaceManager: React.FC = () => {
  const { vendorApplications, approveVendor, rejectVendor, currentEvent } = useApp();

  const [selectedBoothNumber, setSelectedBoothNumber] = useState('Booth #A-14');

  const boothOptions = [
    'Booth #A-1', 'Booth #A-2', 'Booth #A-3', 'Booth #A-14', 'Booth #A-15',
    'Food Truck Bay #1', 'Food Truck Bay #2', 'Food Truck Bay #3'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Commercial Vendor & Sponsor Applications</h3>
          <p className="text-xs text-slate-500">Review Certificate of Insurance compliance and assign numbered booth spaces</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
          {vendorApplications.length} Applications Received
        </span>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {vendorApplications.map((app) => (
          <div
            key={app.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900">{app.businessName}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  app.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {app.status.replace('_', ' ')}
                </span>
                {app.assignedBoothNumber && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-md">
                    {app.assignedBoothNumber}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600">
                Contact: <strong>{app.contactName}</strong> ({app.email} • {app.phone})
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span>Tax ID / EIN: <strong className="text-slate-800">{app.einTaxId}</strong></span>
                <span>Space: <strong className="text-slate-800">{app.spaceRequirement}</strong></span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Power: <strong className="text-slate-800">{app.electricityNeeded.replace('_', ' ')}</strong>
                </span>
                {app.coiPolicyNumber && (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    COI: {app.coiPolicyNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Approval / Allocation Actions */}
            {app.status === 'pending_review' && (
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedBoothNumber}
                  onChange={(e) => setSelectedBoothNumber(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-slate-50 font-bold"
                >
                  {boothOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <button
                  onClick={() => rejectVendor(app.id)}
                  className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                  title="Decline Application"
                >
                  <X className="w-4 h-4 text-rose-500" />
                </button>

                <button
                  onClick={() => approveVendor(app.id, selectedBoothNumber)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve & Issue Invoice
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
