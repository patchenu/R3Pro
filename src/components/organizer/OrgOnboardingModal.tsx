import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORG_TEMPLATES, OrgTemplatePreset } from '../../data/templates';
import { Modal } from '../common/Modal';
import { Building2, Sparkles, Shield, Mail, Phone, MapPin, Check } from 'lucide-react';

interface OrgOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrgOnboardingModal: React.FC<OrgOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { createOrganization } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<OrgTemplatePreset>(ORG_TEMPLATES[0]);
  const [name, setName] = useState('');
  const [ein, setEin] = useState('12-3456789');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('(555) 000-1234');
  const [address, setAddress] = useState('100 Community Ave, City, State');
  const [adminName, setAdminName] = useState('');

  const handleSelectTemplate = (tmpl: OrgTemplatePreset) => {
    setSelectedTemplate(tmpl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createOrganization({
      name,
      type: selectedTemplate.type,
      ein,
      contactEmail: email || 'admin@' + name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.org',
      phone,
      address,
      primaryColor: '#4f46e5'
    }, selectedTemplate.id, adminName || 'Super Admin');

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Organization"
      subtitle="Create a fresh multi-tenant workspace with Turnkey Department Presets"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Template Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Organization Type / Industry Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ORG_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedTemplate.id === tmpl.id
                    ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    {tmpl.badge}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">{tmpl.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tmpl.description}</p>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 font-medium">
                  {tmpl.defaultDepartments.length} standard committees
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Form */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Legal Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oakridge Youth Foundation, West High Athletic Boosters"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">501(c)(3) EIN / Tax ID *</label>
              <input
                type="text"
                required
                value={ein}
                onChange={(e) => setEin(e.target.value)}
                placeholder="XX-XXXXXXX"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Admin Name *</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Jennifer Smith"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourorg.org"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Organization Workspace</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
