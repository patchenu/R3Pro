import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORG_TEMPLATES } from '../../data/templates';
import { VolunteerCrm } from './VolunteerCrm';
import { LegalComplianceStudio } from './LegalComplianceStudio';
import { 
  Building2, Users, Shield, Award, DollarSign, 
  History, Plus, Check, Settings, Sparkles, Image, Palette, 
  Upload, FileText, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrgExecutiveDashboard: React.FC = () => {
  const { currentOrg, users, auditLogs, events, volunteerCrm, updateOrganizationBranding } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'crm' | 'branding' | 'legal' | 'team' | 'templates' | 'audit'>('crm');

  const totalOrgFunds = events.filter(e => e.orgId === currentOrg.id).reduce((sum, e) => sum + e.totalRaised, 0);

  // Branding Form State
  const [logoUrl, setLogoUrl] = useState(currentOrg.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(currentOrg.primaryColor || '#4f46e5');
  const [signatoryName, setSignatoryName] = useState(currentOrg.signatoryOfficerName || 'Elena Rostova');
  const [signatoryTitle, setSignatoryTitle] = useState(currentOrg.signatoryOfficerTitle || 'President & Authorized Signatory');
  const [signatorySigUrl, setSignatorySigUrl] = useState(currentOrg.signatorySignatureUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80');
  const [orgAddress, setOrgAddress] = useState(currentOrg.address || '');
  const [orgPhone, setOrgPhone] = useState(currentOrg.phone || '');
  const [orgEmail, setOrgEmail] = useState(currentOrg.contactEmail || '');
  const [orgWebsite, setOrgWebsite] = useState(currentOrg.website || 'https://lincolnpta.org');

  const presetLogos = [
    { label: 'School Crest', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80' },
    { label: 'Foundation Tree', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=120&auto=format&fit=crop&q=80' },
    { label: 'Sports Shield', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80' },
    { label: 'Helping Hands', url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=120&auto=format&fit=crop&q=80' }
  ];

  const presetColors = [
    { label: 'Indigo', hex: '#4f46e5' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Navy', hex: '#1e3a8a' },
    { label: 'Crimson', hex: '#dc2626' },
    { label: 'Royal Purple', hex: '#9333ea' },
    { label: 'Amber Gold', hex: '#d97706' },
    { label: 'Slate', hex: '#0f172a' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationBranding(currentOrg.id, {
      logoUrl,
      primaryColor,
      signatoryOfficerName: signatoryName,
      signatoryOfficerTitle: signatoryTitle,
      signatorySignatureUrl: signatorySigUrl,
      address: orgAddress,
      phone: orgPhone,
      contactEmail: orgEmail,
      website: orgWebsite
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Executive Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                Executive Super Admin Portal
              </span>
              <span className="text-xs text-slate-300">
                EIN: <strong>{currentOrg.ein}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {currentOrg.name} Executive Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Cross-event organization memory, brand logo assets, team role delegations, 501(c)(3) compliance settings, and permanent audit logs.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Lifetime Org Revenue</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatCurrency(totalOrgFunds)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('crm')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'crm' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Volunteer & Donor CRM Directory ({volunteerCrm.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('branding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'branding' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>🎨 Branding, Logos & Signatory</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('legal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'legal' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>⚖️ Legal Waivers & E-Sign Studio</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'team' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Leadership & Committee Leads ({users.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'templates' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Organization Setup Templates
        </button>

        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: CRM */}
      {activeAdminTab === 'crm' && (
        <VolunteerCrm />
      )}

      {/* TAB 2: BRANDING, LOGOS & SIGNATORY */}
      {activeAdminTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Branding Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Organization Branding & Document Assets</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload your official organization logo, select brand colors, and configure authorized executive signatories for automated IRS tax acknowledgement letters, student service certificates, and volunteer lanyards.
              </p>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-6">
              
              {/* 1. Logo Upload & Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Organization Logo (Appears on Tax Receipts, Badges & Flyers)
                </label>
                
                <div className="flex flex-wrap items-center gap-4">
                  {logoUrl ? (
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-indigo-200 bg-slate-50 p-2 flex items-center justify-center relative group">
                      <img src={logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                      <Image className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo File (PNG/SVG/JPG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setLogoUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-semibold">Or use preset:</span>
                      {presetLogos.map(p => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setLogoUrl(p.url)}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Brand Color Palette */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Primary Brand Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {presetColors.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setPrimaryColor(c.hex)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                        primaryColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-sm' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {primaryColor === c.hex && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 pl-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-xl cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-slate-600">{primaryColor}</span>
                  </div>
                </div>
              </div>

              {/* 3. Authorized Executive Signatory */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Authorized Signatory (Signs IRS Tax Letters & Service Certificates)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Officer Legal Name</span>
                    <input
                      type="text"
                      required
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Officer Title / Position</span>
                    <input
                      type="text"
                      required
                      value={signatoryTitle}
                      onChange={(e) => setSignatoryTitle(e.target.value)}
                      placeholder="e.g. PTA President / Executive Director"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-xs text-slate-600 font-medium block mb-1">Digital Signature Vector / Image</span>
                  <div className="flex items-center gap-3">
                    {signatorySigUrl && (
                      <div className="h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                        <img src={signatorySigUrl} alt="Signature" className="max-h-7 object-contain" />
                      </div>
                    )}
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs transition flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Signature Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setSignatorySigUrl)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Entity Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Official Entity Contact & Website
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Street Address</span>
                    <input
                      type="text"
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                      placeholder="1420 Lincoln Blvd, Springfield, IL"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Website URL</span>
                    <input
                      type="text"
                      value={orgWebsite}
                      onChange={(e) => setOrgWebsite(e.target.value)}
                      placeholder="https://lincolnpta.org"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Official Phone</span>
                    <input
                      type="text"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      placeholder="(555) 234-8900"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Official Email</span>
                    <input
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      placeholder="contact@lincolnpta.org"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 px-6 rounded-2xl text-xs shadow-md transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Branding & Signatory Settings</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right: Live Document Preview */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                Live Document Render Preview
              </span>
              <h4 className="text-base font-bold text-white">How Your Letters Will Look</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When generating IRS written substantiation receipts or student hours letters, your logo, brand color, and authorized signature will be rendered directly on the PDF:
              </p>

              {/* Preview Card */}
              <div className="bg-white text-slate-900 p-4 rounded-2xl border-2 border-slate-200 text-left space-y-2 text-[11px] shadow-sm">
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: primaryColor }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
                  ) : (
                    <span className="font-bold uppercase text-[10px] text-slate-400">NO LOGO</span>
                  )}
                  <span className="font-bold text-[10px]" style={{ color: primaryColor }}>{currentOrg.name}</span>
                </div>

                <div className="text-[10px] text-slate-500">
                  EIN: <strong>{currentOrg.ein}</strong> • {orgAddress}
                </div>

                <div className="bg-slate-50 p-2 rounded border border-slate-100 font-serif">
                  <div className="font-bold text-center text-[10px] underline">OFFICIAL CHARITABLE CONTRIBUTION RECEIPT</div>
                  <div className="mt-1 text-[9px] text-slate-600">
                    Gross Contribution: $500.00 • Tax-Deductible: $500.00
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-[9px] text-slate-400">{new Date().toLocaleDateString()}</span>
                  <div className="text-right">
                    {signatorySigUrl && <img src={signatorySigUrl} alt="Sig" className="h-4 ml-auto" />}
                    <strong className="block text-[9px]">{signatoryName}</strong>
                    <span className="text-[8px] text-slate-500">{signatoryTitle}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Team Members & Roles */}
      {activeAdminTab === 'team' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Organization Staff & Committee Leaders</h3>
              <p className="text-xs text-slate-500">Manage role-based access control and scoped department assignments</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {users.filter(u => u.orgId === currentOrg.id).map(user => (
              <div key={user.id} className="py-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{user.name}</h4>
                    <p className="text-slate-500">{user.email} • {user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold uppercase text-[10px]">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Organization Setup Templates */}
      {activeAdminTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900">Turnkey Organization Onboarding Templates</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-5">Pre-configured industry presets with standard waivers, approval thresholds, and committee departments</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ORG_TEMPLATES.map(tmpl => (
                <div
                  key={tmpl.id}
                  className={`p-5 rounded-2xl border ${
                    currentOrg.type === tmpl.type
                      ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {tmpl.badge}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1.5">{tmpl.name}</h4>
                    </div>
                    {currentOrg.type === tmpl.type && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold">
                        ACTIVE TEMPLATE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{tmpl.description}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <strong>Default Committees:</strong> {tmpl.defaultDepartments.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Immutable Audit Trail */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Security & Compliance Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger recording all financial and role operations</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Actor / User</th>
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-500">{formatDate(log.timestamp)}</td>
                    <td className="py-3 font-bold text-slate-900 font-sans">{log.actorName} ({log.actorRole})</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEGAL WAIVERS & COMPLIANCE */}
      {activeAdminTab === 'legal' && (
        <LegalComplianceStudio />
      )}

    </div>
  );
};
