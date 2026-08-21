import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WaiverTemplate, SignedWaiver } from '../../types';
import { 
  ShieldCheck, FileText, Plus, Edit3, Trash2, CheckCircle2, 
  Search, Filter, Printer, Eye, Lock, Sparkles, User, AlertTriangle, 
  PenTool, Calendar, MapPin, Download 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SignaturePad } from '../common/SignaturePad';
import { formatDate } from '../../utils/formatters';

export const LegalComplianceStudio: React.FC = () => {
  const { currentOrg, currentEvent, waiverTemplates, registrations, addWaiverTemplate, updateWaiverTemplate, deleteWaiverTemplate, showToast } = useApp();

  // Active view: Document Templates vs Executed Signed Audit Ledger
  const [activeTab, setActiveTab] = useState<'templates' | 'signed_ledger'>('templates');

  // Modals
  const [isAddWaiverModalOpen, setIsAddWaiverModalOpen] = useState(false);
  const [editingWaiver, setEditingWaiver] = useState<WaiverTemplate | null>(null);
  const [previewingWaiver, setPreviewingWaiver] = useState<WaiverTemplate | null>(null);
  const [viewingSignedWaiver, setViewingSignedWaiver] = useState<SignedWaiver | null>(null);

  // Add / Edit Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WaiverTemplate['type']>('general_liability');
  const [content, setContent] = useState('');
  const [requiresMinorParentSignature, setRequiresMinorParentSignature] = useState(false);
  const [requiresEmergencyContact, setRequiresEmergencyContact] = useState(true);

  // Signed Ledger Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Flatten all signed waivers across all registrations
  const allSignedWaivers = registrations.flatMap(reg => reg.waivers || []);

  const filteredSignedWaivers = allSignedWaivers.filter(w => {
    const term = searchTerm.toLowerCase();
    const matchName = (w.signerName || '').toLowerCase().includes(term) ||
                      (w.waiverTitle || '').toLowerCase().includes(term) ||
                      (w.signerRelationship || '').toLowerCase().includes(term);
    const matchType = typeFilter === 'all' || w.waiverTemplateId.includes(typeFilter);
    return matchName && matchType;
  });

  const handleOpenAddWaiver = () => {
    setEditingWaiver(null);
    setTitle('');
    setType('general_liability');
    setContent(`In consideration of being allowed to volunteer at this event, I voluntarily assume all risks associated with my participation. I hereby release and hold harmless the organization, its officers, property owners, and coordinators from all liability, damages, or claims for personal injury or property damage.\n\nI agree to follow all safety instructions provided by designated coordinators on duty.`);
    setRequiresMinorParentSignature(false);
    setRequiresEmergencyContact(true);
    setIsAddWaiverModalOpen(true);
  };

  const handleOpenEditWaiver = (w: WaiverTemplate) => {
    setEditingWaiver(w);
    setTitle(w.title);
    setType(w.type);
    setContent(w.content);
    setRequiresMinorParentSignature(w.requiresMinorParentSignature);
    setRequiresEmergencyContact(w.requiresEmergencyContact);
    setIsAddWaiverModalOpen(true);
  };

  const handleSaveWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingWaiver) {
      updateWaiverTemplate(editingWaiver.id, {
        title,
        type,
        content,
        requiresMinorParentSignature,
        requiresEmergencyContact
      });
    } else {
      addWaiverTemplate({
        orgId: currentOrg.id,
        title,
        type,
        content,
        requiresMinorParentSignature,
        requiresEmergencyContact
      });
    }

    setIsAddWaiverModalOpen(false);
  };

  const handleDeleteWaiver = (id: string) => {
    if (confirm('Are you sure you want to delete this legal document template?')) {
      deleteWaiverTemplate(id);
      setIsAddWaiverModalOpen(false);
    }
  };

  const handlePrintAuditLedger = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Legal Compliance & E-Signature Audit Ledger - ${currentOrg.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 32px; font-size: 11px; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${currentOrg.name} — Legal Compliance & E-Signature Audit Ledger</h2>
            <div>EIN: <strong>${currentOrg.ein}</strong> • Generated: ${new Date().toLocaleString()}</div>
            <div>Total Executed Digital Signatures: <strong>${allSignedWaivers.length}</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Signer Legal Name</th>
                <th>Signer Relationship</th>
                <th>Agreement Title</th>
                <th>Signed Timestamp</th>
                <th>IP Address</th>
                <th>Door Status</th>
              </tr>
            </thead>
            <tbody>
              ${allSignedWaivers.map(w => `
                <tr>
                  <td><strong>${w.signerName}</strong></td>
                  <td>${w.signerRelationship}</td>
                  <td>${w.waiverTitle}</td>
                  <td>${formatDate(w.signedAt)}</td>
                  <td><code>${w.ipAddress}</code></td>
                  <td>${w.isVerifiedAtDoor ? 'Verified Door ✓' : 'Online Signed'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Legal Waivers & Minor Consent Studio
            </span>
            <span className="text-xs text-slate-300">
              Organization: <strong>{currentOrg.name}</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Digital Legal Agreements & Compliance Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Upload custom legal releases, configure parental co-signing rules for minors, preview interactive vector signature pads, and review executed audit ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddWaiver}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Legal Document</span>
          </button>

          <button
            onClick={handlePrintAuditLedger}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Active Legal Documents ({waiverTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('signed_ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'signed_ledger' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Executed E-Signatures Audit Ledger ({allSignedWaivers.length})</span>
        </button>
      </div>

      {/* TAB 1: WAIVER TEMPLATES CATALOG */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {waiverTemplates.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-md uppercase">
                        {w.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1.5">{w.title}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewingWaiver(w)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="Live E-Sign Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditWaiver(w)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="Edit Legal Terms"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Enforcement Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {w.requiresMinorParentSignature && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-md flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-700" />
                        Minor Parental Co-Signature Required
                      </span>
                    )}
                    {w.requiresEmergencyContact && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded-md flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-700" />
                        Emergency Contact Required
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded-md flex items-center gap-1">
                      <PenTool className="w-3 h-3 text-emerald-700" />
                      Vector Stroke + IP Audit Capture
                    </span>
                  </div>

                  {/* Legal Prose Preview */}
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-700 font-serif leading-relaxed line-clamp-4 whitespace-pre-line">
                    {w.content}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Enforced at Online Checkout & Kiosks
                  </span>
                  <button
                    onClick={() => setPreviewingWaiver(w)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1"
                  >
                    <span>Test E-Sign Pad</span>
                    <PenTool className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTED SIGNED AUDIT LEDGER */}
      {activeTab === 'signed_ledger' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Executed Digital E-Signatures Ledger</h3>
              <p className="text-xs text-slate-500">
                Immutable compliance ledger recording all digital signature vector strokes, timestamps, IP addresses, and parental minor consent co-signatures.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search signer name, agreement..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 font-bold">Signer Legal Name</th>
                  <th className="pb-3 font-bold">Signer Role / Relationship</th>
                  <th className="pb-3 font-bold">Agreement Title</th>
                  <th className="pb-3 font-bold">Execution Timestamp</th>
                  <th className="pb-3 font-bold">Audit IP & Verification</th>
                  <th className="pb-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSignedWaivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No signed waivers match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSignedWaivers.map((w, idx) => (
                    <tr key={`${w.id}_${idx}`} className="hover:bg-slate-50 transition">
                      <td className="py-3.5">
                        <strong className="text-slate-900 font-bold block">{w.signerName}</strong>
                        <span className="text-[10px] text-slate-400">ID: {w.id}</span>
                      </td>

                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          w.signerRelationship.includes('Parent') || w.signerRelationship.includes('Guardian')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {w.signerRelationship}
                        </span>
                      </td>

                      <td className="py-3.5 font-semibold text-slate-800">
                        {w.waiverTitle}
                      </td>

                      <td className="py-3.5 text-slate-600 font-mono text-[11px]">
                        {formatDate(w.signedAt)}
                      </td>

                      <td className="py-3.5">
                        <span className="font-mono text-[10px] text-slate-500 block">{w.ipAddress}</span>
                        {w.isVerifiedAtDoor ? (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified at Door Kiosk
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Online Pre-Event</span>
                        )}
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setViewingSignedWaiver(w)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Signed Certificate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT LEGAL DOCUMENT */}
      {isAddWaiverModalOpen && (
        <Modal
          isOpen={isAddWaiverModalOpen}
          onClose={() => setIsAddWaiverModalOpen(false)}
          title={editingWaiver ? `Edit Document: ${editingWaiver.title}` : "Upload / Add Custom Legal Document"}
          subtitle="Configure legal terms, clauses, and participant signature enforcement rules"
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveWaiver} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Parental Consent & Minor Safety Release..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Legal Category / Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="general_liability">General Volunteer Liability Release</option>
                  <option value="minor_consent">Minor Consent & Parental Release</option>
                  <option value="food_safety">Food Handler & Hospitality Safety</option>
                  <option value="photo_media">Photo, Video & Media Release</option>
                </select>
              </div>

              <div className="space-y-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={requiresMinorParentSignature}
                    onChange={(e) => setRequiresMinorParentSignature(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Require Parental Co-Sign for Minors (&lt;18)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={requiresEmergencyContact}
                    onChange={(e) => setRequiresEmergencyContact(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Require Emergency Medical Contact</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Legal Agreement & Release Prose *</label>
              <textarea
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter complete legal release terms and assumption of risk..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-serif leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              {editingWaiver ? (
                <button
                  type="button"
                  onClick={() => handleDeleteWaiver(editingWaiver.id)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Document</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWaiverModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingWaiver ? 'Save Document Changes' : 'Publish Legal Document'}</span>
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: LIVE E-SIGN PREVIEW MODAL */}
      {previewingWaiver && (
        <Modal
          isOpen={Boolean(previewingWaiver)}
          onClose={() => setPreviewingWaiver(null)}
          title={`E-Sign Preview: ${previewingWaiver.title}`}
          subtitle="Test how participants and legal guardians view and digitally sign this document"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-serif text-slate-800 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line">
              {previewingWaiver.content}
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
              <span className="font-bold uppercase text-[10px] text-indigo-900 block">
                Interactive E-Signature Canvas Test
              </span>
              <SignaturePad
                signerName="Jane Doe (Sample Signer / Parent)"
                onSignatureCapture={(data) => {
                  if (data) {
                    showToast('success', 'Signature Captured', 'Vector signature stroke saved in test sandbox.');
                  }
                }}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewingWaiver(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: EXECUTED SIGNED CERTIFICATE VIEW */}
      {viewingSignedWaiver && (
        <Modal
          isOpen={Boolean(viewingSignedWaiver)}
          onClose={() => setViewingSignedWaiver(null)}
          title="Executed Legal E-Signature Certificate"
          subtitle={`Audit Record ID: ${viewingSignedWaiver.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Signer Legal Name</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{viewingSignedWaiver.signerName}</div>
                <div className="text-slate-500 font-semibold">{viewingSignedWaiver.signerRelationship}</div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Execution Timestamp & IP</span>
                <div className="font-mono text-slate-900 mt-0.5">{formatDate(viewingSignedWaiver.signedAt)}</div>
                <div className="font-mono text-slate-500 text-[11px]">{viewingSignedWaiver.ipAddress}</div>
              </div>
            </div>

            {/* Document Prose */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-serif text-slate-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line text-[11px]">
              {viewingSignedWaiver.waiverText}
            </div>

            {/* Captured Vector Signature Stroke */}
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">
                Recorded Digital Vector Signature
              </span>
              <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-2">
                {viewingSignedWaiver.signatureData ? (
                  <img
                    src={viewingSignedWaiver.signatureData}
                    alt="Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-slate-400 font-serif italic">Typed Legal Signature on File</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSignedWaiver(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
