import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorApplication, TicketTier, Event } from '../../types';
import { 
  Store, Award, CheckCircle2, ShieldCheck, Zap, FileText, 
  MapPin, Clock, Phone, Mail, Download, ArrowRight, Sparkles, 
  Building2, AlertTriangle, ChevronRight, Plus, Check, Globe
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CommercialMarketplaceModal } from '../public/CommercialMarketplaceModal';

export const VendorSponsorDashboard: React.FC = () => {
  const { 
    currentOrg, currentEvent, vendorApplications, ticketTiers, 
    currentUser, showToast 
  } = useApp();

  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_passes' | 'available_packages' | 'compliance'>('my_passes');

  // Filter vendor applications for current event
  const myApplications = vendorApplications.filter(v => v.eventId === currentEvent.id);
  const eventTiers = ticketTiers.filter(t => t.eventId === currentEvent.id && (t.type === 'vendor_booth' || t.type === 'sponsor_package'));

  const handleDownloadInvoice = (app: VendorApplication) => {
    showToast('success', 'Invoice Downloaded', `Downloaded commercial invoice ${app.invoiceNumber || 'INV-2026-001'}.pdf`);
  };

  const handleDownloadTaxReceipt = (app: VendorApplication) => {
    showToast('success', 'Tax Receipt Downloaded', `Downloaded official IRS 501(c)(3) acknowledgement for ${app.businessName}.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>Commercial Vendor & Corporate Sponsor Hub</span>
            </span>
            <span className="text-xs text-indigo-300">
              Host: <strong>{currentOrg.name}</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            {currentEvent.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage your commercial booth assignments, electrical hookups, Certificate of Insurance (COI), load-in logistics, and official IRS 501(c)(3) tax receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCommercialModalOpen(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer group"
          >
            <Plus className="w-4 h-4" />
            <span>Book Booth or Sponsorship</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* TOP WORKSPACE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('my_passes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'my_passes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>My Booths & Sponsorship Passes ({myApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('available_packages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'available_packages'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Available Commercial Tiers & Booths ({eventTiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'compliance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>COI & Tax Receipts Vault</span>
        </button>
      </div>

      {/* TAB 1: MY BOOTHS & PASSES */}
      {activeTab === 'my_passes' && (
        <div className="space-y-6">
          {myApplications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">No Active Commercial Registrations</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You do not have any registered vendor booth spaces or corporate sponsorship tiers for <strong>{currentEvent.title}</strong>.
              </p>
              <button
                onClick={() => setIsCommercialModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Explore & Book a Commercial Pitch</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myApplications.map(app => {
                const tier = ticketTiers.find(t => t.id === app.ticketTierId);
                const isApproved = app.status === 'approved' || app.status === 'paid';

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5 hover:border-slate-300 transition"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isApproved ? '✓ Confirmed & Assigned' : '⏳ Application Under Review'}
                          </span>
                          <span className="font-mono text-xs text-slate-400 font-bold">{app.invoiceNumber || 'INV-PENDING'}</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-1">{app.businessName}</h3>
                        <div className="text-xs text-indigo-600 font-bold mt-0.5">
                          {tier?.title || 'Commercial Package'}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Package Fee</span>
                        <div className="text-xl font-black text-slate-900">
                          {tier ? formatCurrency(tier.price) : '$0'}
                        </div>
                      </div>
                    </div>

                    {/* Operational Logistics Bento */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Pitch / Space</span>
                        <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                          {app.assignedBoothNumber || 'Pending Space Allocation'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Power Hookup</span>
                        <span className="font-bold text-amber-700 mt-0.5 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{app.electricityNeeded === 'none' ? 'Self-Contained (No Power)' : app.electricityNeeded.replace('_', ' ')}</span>
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Space Dimensions</span>
                        <span className="font-semibold text-slate-800 mt-0.5 block">{app.spaceRequirement}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Load-In Window</span>
                        <span className="font-semibold text-slate-800 mt-0.5 block">7:00 AM – 8:30 AM</span>
                      </div>
                    </div>

                    {/* Compliance & Safety Verification */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-900 block">Insurance & EIN Verified</span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            COI: {app.coiPolicyNumber || 'Verified on file'} • EIN: {app.einTaxId}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Cleared for Gate
                      </span>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(app)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Download Invoice</span>
                        </button>

                        <button
                          onClick={() => handleDownloadTaxReceipt(app)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          <span>501(c)(3) Receipt</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium">
                        Submitted: {formatDate(app.submittedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AVAILABLE PACKAGES */}
      {activeTab === 'available_packages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Commercial Packages & Corporate Tiers</h3>
              <p className="text-xs text-slate-500">Book artisan vendor spaces, food truck pitches, or corporate underwriting tiers.</p>
            </div>
            <button
              onClick={() => setIsCommercialModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Open Commercial Registration</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {eventTiers.map(tier => (
              <div
                key={tier.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tier.type === 'sponsor_package' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tier.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {tier.capacity - tier.claimedCount} spots left
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">{tier.title}</h4>
                  <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(tier.price)}</div>
                  {tier.fairMarketValue > 0 && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      ✓ Tax Deduction: {formatCurrency(Math.max(0, tier.price - tier.fairMarketValue))}
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">{tier.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsCommercialModalOpen(true)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>Apply & Book Space</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COI & TAX VAULT */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Commercial Compliance & IRS Tax Receipt Vault</h3>
            <p className="text-xs text-slate-500">Official tax substantiation letters and Certificate of Insurance verification documents.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-extrabold text-sm text-slate-900">Certificate of Insurance (COI) Guidelines</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Commercial vendors and food trucks operating on premises must provide a Certificate of General Liability Insurance ($1,000,000 minimum) naming <strong>{currentOrg.name}</strong> as an Additional Insured.
              </p>
              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                ✓ Commercial COI verified on file for active registrations.
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-sm text-slate-900">IRS 501(c)(3) Corporate Contribution Rules</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Corporate underwriting contributions are tax-deductible to the full extent of the law minus the Fair Market Value (FMV) of perks or meals received. Official receipt numbers are provided instantly.
              </p>
              <div className="text-xs font-semibold text-indigo-800 bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                ✓ Signed by {currentOrg.signatoryOfficerName || 'Authorized Executive Officer'}.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commercial Marketplace Modal */}
      {isCommercialModalOpen && (
        <CommercialMarketplaceModal
          isOpen={isCommercialModalOpen}
          onClose={() => setIsCommercialModalOpen(false)}
          event={currentEvent}
        />
      )}

    </div>
  );
};
