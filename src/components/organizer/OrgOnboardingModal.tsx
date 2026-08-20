import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORG_TEMPLATES, OrgTemplatePreset } from '../../data/templates';
import { Modal } from '../common/Modal';
import { Building2, Sparkles, Shield, Mail, Phone, MapPin, Check, AlertTriangle, Lock, User as UserIcon } from 'lucide-react';

interface OrgOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrgOnboardingModal: React.FC<OrgOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { createOrganization, organizations, isAuthenticated, currentUser, login, registerUser, showToast } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<OrgTemplatePreset>(ORG_TEMPLATES[0]);
  const [name, setName] = useState('');
  const [ein, setEin] = useState('12-3456789');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '(555) 000-1234');
  const [address, setAddress] = useState('100 Community Ave, City, State');
  const [adminName, setAdminName] = useState(currentUser?.name || '');

  // Auth gate state (if user is not signed in)
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Deduplication checks
  const cleanEin = ein.replace(/\D/g, '');
  const existingOrgWithEin = organizations.find(o => o.ein.replace(/\D/g, '') === cleanEin && cleanEin.length > 0);
  const existingOrgWithName = organizations.find(o => o.name.toLowerCase().trim() === name.toLowerCase().trim() && name.trim().length > 0);

  const handleSelectTemplate = (tmpl: OrgTemplatePreset) => {
    setSelectedTemplate(tmpl);
  };

  const handleInlineAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      if (!authName || !authEmail || !authPassword) return;
      registerUser({
        name: authName,
        email: authEmail,
        password: authPassword,
        role: 'org_admin'
      });
      setAdminName(authName);
      setEmail(authEmail);
    } else {
      if (!authEmail) return;
      login(authEmail, authPassword || 'password123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (existingOrgWithEin) {
      showToast('error', 'Duplicate EIN Detected', `Organization "${existingOrgWithEin.name}" is already registered with EIN ${ein}.`);
      return;
    }

    if (existingOrgWithName) {
      showToast('error', 'Duplicate Name', `An organization named "${existingOrgWithName.name}" already exists.`);
      return;
    }

    createOrganization({
      name,
      type: selectedTemplate.type,
      ein,
      contactEmail: email || currentUser?.email || 'admin@' + name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.org',
      phone,
      address,
      primaryColor: '#4f46e5'
    }, selectedTemplate.id, adminName || currentUser?.name || 'Super Admin');

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Organization"
      subtitle="Create a verified multi-tenant workspace with Turnkey Department Presets"
      maxWidth="3xl"
    >
      {/* 1. AUTH GATE (If unauthenticated user arrives) */}
      {!isAuthenticated ? (
        <div className="space-y-5 p-2">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase text-indigo-900">User Account Required</h4>
              <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                To maintain 501(c)(3) security and audit integrity, you must be a registered user before creating an organization workspace.
              </p>
            </div>
          </div>

          <form onSubmit={handleInlineAuth} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {authMode === 'register' ? 'Create Your Admin Account' : 'Sign In with Existing Account'}
              </span>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                {authMode === 'register' ? 'Already registered? Sign In' : 'Need an account? Register'}
              </button>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
            >
              {authMode === 'register' ? 'Create Account & Continue to Org Setup' : 'Sign In & Continue to Org Setup'}
            </button>
          </form>
        </div>
      ) : (

        /* 2. ORGANIZATION REGISTRATION WIZARD */
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

          {/* Deduplication Warning Alerts */}
          {existingOrgWithEin && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Duplicate Tax ID / EIN Detected</strong>
                An organization with EIN <strong>{ein}</strong> already exists: <strong>{existingOrgWithEin.name}</strong>. If you are a staff member, request an invite from the Org Admin.
              </div>
            </div>
          )}

          {existingOrgWithName && !existingOrgWithEin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Similar Organization Name Detected</strong>
                An organization named <strong>"{existingOrgWithName.name}"</strong> is already registered.
              </div>
            </div>
          )}

          {/* Org Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Organization Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Westside Youth Soccer Association"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                501(c)(3) Tax ID / EIN *
              </label>
              <input
                type="text"
                required
                value={ein}
                onChange={(e) => setEin(e.target.value)}
                placeholder="12-3456789"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Super Admin Contact Name *
              </label>
              <input
                type="text"
                required
                value={adminName || currentUser?.name || ''}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Contact Email *
              </label>
              <input
                type="email"
                required
                value={email || currentUser?.email || ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="treasurer@organization.org"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-1234"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headquarters Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Springfield, IL"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!existingOrgWithEin || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-indigo-100 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Organization Workspace</span>
            </button>
          </div>

        </form>
      )}
    </Modal>
  );
};
