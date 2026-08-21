import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORG_TEMPLATES } from '../../data/templates';
import { Event } from '../../types';
import { VolunteerCrm } from './VolunteerCrm';
import { LegalComplianceStudio } from './LegalComplianceStudio';
import { Modal } from '../common/Modal';
import { 
  Building2, Users, Shield, Award, DollarSign, 
  History, Plus, Check, Settings, Sparkles, Image, Palette, 
  Upload, FileText, CheckCircle2, ShieldCheck, UserPlus, Trash2, Mail, Phone, Briefcase,
  Calendar, BarChart3, TrendingUp, CheckCircle, ExternalLink, Printer, FileSpreadsheet, Eye, ChevronRight, Package, ArrowUpRight 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { printVolunteerRosterHtml, printNameBadgesHtml } from '../../utils/exportPdf';
import { exportFinancialLedgerToCsv, exportRosterToCsv } from '../../utils/exportCsv';

export const OrgExecutiveDashboard: React.FC = () => {
  const { 
    currentOrg, users, auditLogs, events, volunteerCrm, 
    registrations, shifts, subParts, donations, itemSlots,
    updateOrganizationBranding, inviteTeamMember, removeTeamMember, 
    switchEvent, switchRole, showToast 
  } = useApp();
  
  const [activeAdminTab, setActiveAdminTab] = useState<'events' | 'crm' | 'branding' | 'legal' | 'team' | 'templates' | 'audit'>('events');
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedEventReport, setSelectedEventReport] = useState<Event | null>(null);

  const orgEvents = events.filter(e => e.orgId === currentOrg.id);
  const totalOrgFunds = orgEvents.reduce((sum, e) => sum + e.totalRaised, 0);

  // Invite Team Member State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<'committee_lead' | 'event_planner' | 'org_admin'>('committee_lead');
  const [inviteDept, setInviteDept] = useState('Hospitality & Food Services');

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
          onClick={() => setActiveAdminTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'events' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>🎪 All Events Portfolio & Outcomes ({orgEvents.length})</span>
        </button>

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
          Organization Blueprints ({ORG_TEMPLATES.length})
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

      {/* TAB 0: MASTER EVENTS PORTFOLIO & OUTCOMES */}
      {activeAdminTab === 'events' && (
        <div className="space-y-6">
          
          {/* Master Portfolio KPI Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifetime Funds Raised</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{formatCurrency(totalOrgFunds)}</div>
              <span className="text-[10px] text-slate-500 font-semibold">Across {orgEvents.length} organization campaigns</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Master CRM Volunteers</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-0.5">{volunteerCrm.length} Profiles</div>
              <span className="text-[10px] text-slate-500 font-semibold">Active community participants</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Active vs Completed</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {orgEvents.filter(e => new Date(e.endDate) >= new Date()).length} Active
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                {orgEvents.filter(e => new Date(e.endDate) < new Date()).length} Past historical campaigns
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Average Goal Fulfillment</span>
              <div className="text-xl sm:text-2xl font-black text-purple-600 mt-0.5">
                {Math.round((totalOrgFunds / (orgEvents.reduce((s, e) => s + e.fundraisingGoal, 0) || 1)) * 100)}%
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Portfolio financial performance</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Portfolio:</span>
              <button
                onClick={() => setEventFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  eventFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Campaigns ({orgEvents.length})
              </button>
              <button
                onClick={() => setEventFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  eventFilter === 'upcoming' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Upcoming & Active ({orgEvents.filter(e => new Date(e.endDate) >= new Date()).length})
              </button>
              <button
                onClick={() => setEventFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  eventFilter === 'completed' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Completed & Archived ({orgEvents.filter(e => new Date(e.endDate) < new Date()).length})
              </button>
            </div>
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orgEvents
              .filter(e => {
                const isUpcoming = new Date(e.endDate) >= new Date();
                if (eventFilter === 'upcoming') return isUpcoming;
                if (eventFilter === 'completed') return !isUpcoming;
                return true;
              })
              .map(evt => {
                const isUpcoming = new Date(evt.endDate) >= new Date();
                const evtShifts = shifts.filter(s => s.eventId === evt.id);
                const totalSlots = evtShifts.reduce((sum, s) => sum + s.capacity, 0);
                const claimedSlots = evtShifts.reduce((sum, s) => sum + s.claimedCount, 0);
                const shiftFulfillPercent = totalSlots > 0 ? Math.round((claimedSlots / totalSlots) * 100) : 100;
                const percentRaised = Math.round((evt.totalRaised / evt.fundraisingGoal) * 100);
                const evtSubParts = subParts.filter(sp => sp.eventId === evt.id);

                return (
                  <div 
                    key={evt.id} 
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img 
                          src={evt.coverImageUrl} 
                          alt={evt.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-4">
                          <div className="flex justify-between items-center">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                              isUpcoming ? 'bg-emerald-500 text-white' : 'bg-slate-800/90 text-slate-200'
                            }`}>
                              {isUpcoming ? '🟢 Active Campaign' : '🏁 Completed & Archived'}
                            </span>

                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-slate-900 shadow-xs">
                              {formatDate(evt.startDate)}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-white leading-tight drop-shadow-sm">{evt.title}</h3>
                            <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{evt.venueName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Financial & Logistics Performance */}
                      <div className="p-5 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">Financial Progress</span>
                            <span className="font-extrabold text-emerald-600">
                              {formatCurrency(evt.totalRaised)} / {formatCurrency(evt.fundraisingGoal)} ({percentRaised}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(percentRaised, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Volunteer Shifts</span>
                            <div className="text-sm font-bold text-slate-900 mt-0.5">
                              {totalSlots > 0 ? `${claimedSlots}/${totalSlots} spots (${shiftFulfillPercent}%)` : 'Fully Staffed'}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Committees & Leads</span>
                            <div className="text-sm font-bold text-purple-700 mt-0.5">
                              {evtSubParts.length > 0 ? `${evtSubParts.length} Departments` : 'General Operations'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 pt-0 border-t border-slate-100 grid grid-cols-2 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedEventReport(evt)}
                        className="flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2.5 px-3 rounded-xl text-xs transition"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>View Outcome Report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          switchEvent(evt.id);
                          switchRole('event_planner');
                          showToast('success', 'Switched Event Context', `Planner Hub opened for ${evt.title}`);
                        }}
                        className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition"
                      >
                        <span>Open Planner Hub</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL: COMPREHENSIVE EVENT OUTCOME & PERFORMANCE REPORT */}
      {selectedEventReport && (
        <Modal
          isOpen={Boolean(selectedEventReport)}
          onClose={() => setSelectedEventReport(null)}
          title={`${selectedEventReport.title} — Comprehensive Outcome Report`}
          subtitle={`Organization Master Financial & Operational Performance Ledger • ${formatDate(selectedEventReport.startDate)}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
                  Event Campaign Dossier
                </span>
                <h3 className="text-lg font-black mt-1 text-white">{selectedEventReport.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedEventReport.venueName} • {selectedEventReport.venueAddress}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Funds Raised</span>
                <div className="text-2xl font-black text-emerald-400">{formatCurrency(selectedEventReport.totalRaised)}</div>
                <span className="text-[10px] text-slate-300">Goal: {formatCurrency(selectedEventReport.fundraisingGoal)}</span>
              </div>
            </div>

            {/* Financial Performance Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Revenue Breakdown & Financial Substantiation</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Direct Community Giving</span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">
                    {formatCurrency(Math.round(selectedEventReport.totalRaised * 0.45))}
                  </div>
                  <span className="text-[10px] text-slate-500">Individual donor receipts</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Ticket & Activity Sales</span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">
                    {formatCurrency(Math.round(selectedEventReport.totalRaised * 0.35))}
                  </div>
                  <span className="text-[10px] text-slate-500">Carnival wristbands & tokens</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Corporate & Sponsor Booths</span>
                  <div className="text-base font-extrabold text-slate-900 mt-1">
                    {formatCurrency(Math.round(selectedEventReport.totalRaised * 0.20))}
                  </div>
                  <span className="text-[10px] text-slate-500">Local business marketplace</span>
                </div>
              </div>
            </div>

            {/* Volunteer Labor & Wishlist Supplies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Volunteer Labor & Service</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Total community volunteer hours delivered for this event exceeded <strong>32.5 hours</strong>, representing over <strong>$1,033.50</strong> in statutory independent sector economic value.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>In-Kind Equipment & Wishlist</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Collected <strong>18 physical supply wishlist pledges</strong> (cookies, brownie trays, sound cables, face paint kits) with official IRS Pub 526 in-kind acknowledgements issued.
                </p>
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    printVolunteerRosterHtml(selectedEventReport, currentOrg, registrations, shifts, subParts);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Volunteer Roster (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportFinancialLedgerToCsv(donations, selectedEventReport.title, currentOrg.ein);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Financial Ledger (CSV)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEventReport(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}

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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Organization Staff & Committee Leaders</h3>
              <p className="text-xs text-slate-500">Manage role-based access control, leadership invitations, and scoped department lead assignments</p>
            </div>

            <button
              onClick={() => {
                setInviteName('');
                setInviteEmail('');
                setInvitePhone('');
                setInviteRole('committee_lead');
                setInviteDept('Hospitality & Food Services');
                setIsInviteModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs shadow-sm transition whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Invite Leader / Committee Lead</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.filter(u => u.orgId === currentOrg.id).map(user => {
              const isSuperAdmin = user.role === 'org_admin';
              return (
                <div key={user.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm shadow-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] ${
                      user.role === 'org_admin' ? 'bg-purple-600 text-white shadow-xs' :
                      user.role === 'event_planner' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      {user.role === 'org_admin' ? 'Full Organization Scope' :
                       user.role === 'event_planner' ? 'All Event Logistics & Approvals' :
                       'Scoped Department Committee'}
                    </span>

                    {!isSuperAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${user.name} from organization roles?`)) {
                            removeTeamMember(user.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: INVITE LEADERSHIP / COMMITTEE LEAD */}
      {isInviteModalOpen && (
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Leadership Member or Committee Lead"
          subtitle={`Assign roles and department responsibilities for ${currentOrg.name}`}
          maxWidth="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!inviteName.trim() || !inviteEmail.trim()) return;

              inviteTeamMember({
                orgId: currentOrg.id,
                name: inviteName,
                email: inviteEmail,
                phone: invitePhone || '(555) 000-0000',
                role: inviteRole,
                assignedSubPartIds: []
              });

              setIsInviteModalOpen(false);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Rachel Adams, John Davis"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Login ID) *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="rachel@lincolnpta.org"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="(555) 234-8900"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Leadership Role *</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="committee_lead">Committee / Sub-Part Lead (Scoped to 1 Department)</option>
                <option value="event_planner">Event Planner / Chair (Master Event & Approval Queue)</option>
                <option value="org_admin">Organization Super Admin (Full Governance & CRM)</option>
              </select>
            </div>

            {inviteRole === 'committee_lead' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Department Committee *</label>
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Hospitality & Food Services">Hospitality & Food Services (Concessions/Bake Sale)</option>
                  <option value="Labor & Physical Setup">Labor & Physical Setup (Tents, Sound, Logistics)</option>
                  <option value="Vendor Marketplace & Sponsors">Vendor Marketplace & Corporate Sponsors</option>
                  <option value="Auction & Fundraising Games">Auction & Fundraising Games (Raffle/Silent Auction)</option>
                  <option value="Registration & Greeters">Registration & Door Greeters</option>
                  <option value="General Operations">General Operations</option>
                </select>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Send Invitation & Grant Role</span>
              </button>
            </div>
          </form>
        </Modal>
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
