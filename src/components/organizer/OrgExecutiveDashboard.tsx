import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORG_TEMPLATES } from '../../data/templates';
import { Event, User } from '../../types';
import { VolunteerCrm } from './VolunteerCrm';
import { LegalComplianceStudio } from './LegalComplianceStudio';
import { Modal } from '../common/Modal';
import { 
  Building2, Users, Shield, Award, DollarSign, 
  History, Plus, Check, Settings, Sparkles, Image, Palette, 
  Upload, FileText, CheckCircle2, ShieldCheck, UserPlus, Trash2, Mail, Phone, Briefcase,
  Calendar, BarChart3, TrendingUp, CheckCircle, ExternalLink, Printer, FileSpreadsheet, Eye, ChevronRight, Package, ArrowUpRight,
  Filter, Search, Hash, Layers, PieChart, ArrowDownRight, Edit3, X
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  printVolunteerRosterHtml, 
  printNameBadgesHtml,
  printQuarterlyReportHtml,
  printAnnualReportHtml 
} from '../../utils/exportPdf';
import { 
  exportFinancialLedgerToCsv, 
  exportRosterToCsv,
  exportQuarterlyLedgerToCsv,
  exportAnnualLedgerToCsv
} from '../../utils/exportCsv';

export const OrgExecutiveDashboard: React.FC = () => {
  const { 
    currentOrg, users, currentUser, auditLogs, events, volunteerCrm, 
    registrations, shifts, subParts, donations, itemSlots,
    updateOrganizationBranding, inviteTeamMember, updateTeamMember, removeTeamMember, 
    updateEvent, deleteEvent,
    switchEvent, switchRole, showToast 
  } = useApp();
  
  const [activeAdminTab, setActiveAdminTab] = useState<'events' | 'crm' | 'branding' | 'legal' | 'team' | 'templates' | 'audit'>('events');
  
  // Outcome Report View Mode: By Event, By Quarter, By Calendar Year
  const [outcomeViewMode, setOutcomeViewMode] = useState<'by_event' | 'by_quarter' | 'by_year'>('by_event');
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [selectedEventReport, setSelectedEventReport] = useState<Event | null>(null);

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventTagline, setEditEventTagline] = useState('');
  const [editEventGoal, setEditEventGoal] = useState(10000);
  const [editEventStartDate, setEditEventStartDate] = useState('');
  const [editEventEndDate, setEditEventEndDate] = useState('');
  const [editEventVenueName, setEditEventVenueName] = useState('');
  const [editEventVenueAddress, setEditEventVenueAddress] = useState('');
  const [editEventCoverUrl, setEditEventCoverUrl] = useState('');
  const [editEventTags, setEditEventTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editThresholdBudget, setEditThresholdBudget] = useState(250);
  const [editThresholdSlots, setEditThresholdSlots] = useState(5);

  // Edit Team Member State
  const [editingTeamMember, setEditingTeamMember] = useState<User | null>(null);
  const [editMemberRole, setEditMemberRole] = useState<'committee_lead' | 'event_planner' | 'org_admin'>('committee_lead');
  const [editMemberSubPartId, setEditMemberSubPartId] = useState<string>('');

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

  // Helper: Compute Quarter Groups
  const quarterGroups = React.useMemo(() => {
    const map = new Map<string, { label: string; year: number; quarter: string; events: Event[] }>();
    
    orgEvents.forEach(evt => {
      const date = new Date(evt.startDate);
      const year = date.getFullYear();
      const qNum = Math.floor(date.getMonth() / 3) + 1;
      const quarter = `Q${qNum}`;
      const key = `${year}-${quarter}`;
      const label = `${year} Q${qNum} (${qNum === 1 ? 'Jan - Mar' : qNum === 2 ? 'Apr - Jun' : qNum === 3 ? 'Jul - Sep' : 'Oct - Dec'})`;

      if (!map.has(key)) {
        map.set(key, { label, year, quarter, events: [] });
      }
      map.get(key)!.events.push(evt);
    });

    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [orgEvents]);

  // Helper: Compute Calendar Year Groups
  const yearGroups = React.useMemo(() => {
    const map = new Map<number, Event[]>();

    orgEvents.forEach(evt => {
      const year = new Date(evt.startDate).getFullYear();
      if (!map.has(year)) {
        map.set(year, []);
      }
      map.get(year)!.push(evt);
    });

    const sortedYears = Array.from(map.keys()).sort((a, b) => b - a);
    return sortedYears.map(year => ({
      year,
      events: map.get(year)!
    }));
  }, [orgEvents]);

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
    { label: 'Amber', hex: '#d97706' },
    { label: 'Teal', hex: '#0d9488' }
  ];

  const handleOpenEditEvent = (evt: Event) => {
    setEditingEvent(evt);
    setEditEventTitle(evt.title);
    setEditEventTagline(evt.tagline);
    setEditEventGoal(evt.fundraisingGoal);
    setEditEventStartDate(evt.startDate.slice(0, 16));
    setEditEventEndDate(evt.endDate.slice(0, 16));
    setEditEventVenueName(evt.venueName);
    setEditEventVenueAddress(evt.venueAddress);
    setEditEventCoverUrl(evt.coverImageUrl);
    setEditEventTags([...(evt.tags || [])]);
    setNewTagInput('');
    setEditThresholdBudget(evt.approvalThresholdBudget || 250);
    setEditThresholdSlots(evt.approvalThresholdSlots || 5);
  };

  const handleAddEventTag = () => {
    if (!newTagInput.trim()) return;
    if (!editEventTags.includes(newTagInput.trim())) {
      setEditEventTags([...editEventTags, newTagInput.trim()]);
    }
    setNewTagInput('');
  };

  const handleRemoveEventTag = (tag: string) => {
    setEditEventTags(editEventTags.filter(t => t !== tag));
  };

  const handleSaveEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editEventTitle.trim()) return;

    updateEvent(editingEvent.id, {
      title: editEventTitle.trim(),
      tagline: editEventTagline.trim(),
      fundraisingGoal: Number(editEventGoal) || 1000,
      startDate: editEventStartDate,
      endDate: editEventEndDate,
      venueName: editEventVenueName.trim(),
      venueAddress: editEventVenueAddress.trim(),
      coverImageUrl: editEventCoverUrl.trim(),
      tags: editEventTags,
      approvalThresholdBudget: Number(editThresholdBudget) || 250,
      approvalThresholdSlots: Number(editThresholdSlots) || 5
    });

    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to permanently delete the campaign "${eventTitle}"? All associated shifts, wishlist items, and records will be deleted.`)) {
      deleteEvent(eventId);
    }
  };

  const handleOpenEditTeamMember = (user: User) => {
    setEditingTeamMember(user);
    setEditMemberRole(user.role as any);
    setEditMemberSubPartId(user.assignedSubPartIds?.[0] || '');
  };

  const handleSaveEditTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamMember) return;

    updateTeamMember(editingTeamMember.id, {
      role: editMemberRole,
      assignedSubPartIds: editMemberRole === 'committee_lead' && editMemberSubPartId ? [editMemberSubPartId] : []
    });

    setEditingTeamMember(null);
  };

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

          {/* Outcome Reports Multi-Level View Selector */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                  Financial & Operational Reporting Studio
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Campaign Outcome Reports & Summaries</h3>
              </div>

              {/* View Switcher Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOutcomeViewMode('by_event')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    outcomeViewMode === 'by_event'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>🎯 By Event (Unique Keys)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcomeViewMode('by_quarter')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    outcomeViewMode === 'by_quarter'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>📅 By Quarter (Q1 - Q4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcomeViewMode('by_year')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    outcomeViewMode === 'by_year'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>📆 By Calendar Year (990 / Board)</span>
                </button>
              </div>
            </div>

            {/* Sub-Filters / Search for By Event mode */}
            {outcomeViewMode === 'by_event' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {/* Search by Key or Title */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    placeholder="Search by Event Key (e.g. EVT-2026-Q3-001) or Title..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEventFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      eventFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All ({orgEvents.length})
                  </button>
                  <button
                    onClick={() => setEventFilter('upcoming')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      eventFilter === 'upcoming' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Upcoming ({orgEvents.filter(e => new Date(e.endDate) >= new Date()).length})
                  </button>
                  <button
                    onClick={() => setEventFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      eventFilter === 'completed' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Completed ({orgEvents.filter(e => new Date(e.endDate) < new Date()).length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VIEW 1: BY EVENT (WITH UNIQUE EVENT KEYS) */}
          {outcomeViewMode === 'by_event' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orgEvents
                .filter(e => {
                  const isUpcoming = new Date(e.endDate) >= new Date();
                  if (eventFilter === 'upcoming' && !isUpcoming) return false;
                  if (eventFilter === 'completed' && isUpcoming) return false;
                  if (eventSearchQuery.trim()) {
                    const query = eventSearchQuery.toLowerCase();
                    return (
                      e.title.toLowerCase().includes(query) ||
                      (e.eventKey && e.eventKey.toLowerCase().includes(query)) ||
                      e.venueName.toLowerCase().includes(query)
                    );
                  }
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
                  const qNum = Math.floor(new Date(evt.startDate).getMonth() / 3) + 1;

                  return (
                    <div 
                      key={evt.id} 
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        {/* Image Header */}
                        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                          <img 
                            src={evt.coverImageUrl} 
                            alt={evt.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-4">
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                                  isUpcoming ? 'bg-emerald-500 text-white' : 'bg-slate-800/90 text-slate-200'
                                }`}>
                                  {isUpcoming ? '🟢 Active' : '🏁 Completed'}
                                </span>

                                <span className="px-2 py-0.5 rounded-md bg-purple-900/90 text-purple-200 border border-purple-400/40 text-[10px] font-mono font-bold backdrop-blur-md">
                                  {evt.eventKey || 'EVT-KEY'}
                                </span>
                              </div>

                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-slate-900 shadow-xs">
                                {formatDate(evt.startDate)} (Q{qNum})
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
                      <div className="p-5 pt-0 border-t border-slate-100 space-y-2.5 mt-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEventReport(evt)}
                            className="flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2.5 px-3 rounded-xl text-xs transition"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>Outcome Report</span>
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
                            <span>Open Planner</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenEditEvent(evt)}
                            className="text-slate-600 hover:text-purple-700 font-bold text-[11px] flex items-center gap-1 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Event Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(evt.id, evt.title)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-[11px] flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Campaign</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* VIEW 2: BY QUARTER (Q1 - Q4 SUMMARIES) */}
          {outcomeViewMode === 'by_quarter' && (
            <div className="space-y-6">
              {quarterGroups.map(([key, group]) => {
                const totalQuarterRaised = group.events.reduce((sum, e) => sum + e.totalRaised, 0);
                const totalQuarterGoal = group.events.reduce((sum, e) => sum + e.fundraisingGoal, 0);
                const directGiving = Math.round(totalQuarterRaised * 0.45);
                const ticketSales = Math.round(totalQuarterRaised * 0.35);
                const sponsors = Math.round(totalQuarterRaised * 0.20);
                const volunteerHours = group.events.length * 32.5;
                const economicValuation = volunteerHours * 31.80;
                const itemsDelivered = group.events.length * 18;
                const efficiency = Math.round((totalQuarterRaised / (totalQuarterGoal || 1)) * 100);

                return (
                  <div key={key} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider">
                            {group.label}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {group.events.length} Campaign(s)
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-1">Quarterly Financial & Labor Outcome</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            printQuarterlyReportHtml(group.label, currentOrg, group.events, {
                              totalRaised: totalQuarterRaised,
                              fundraisingGoal: totalQuarterGoal,
                              directGiving,
                              ticketSales,
                              sponsors,
                              volunteerHours,
                              economicValuation,
                              itemsDelivered
                            });
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Quarterly Report (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            exportQuarterlyLedgerToCsv(group.label, group.events, currentOrg.name, currentOrg.ein);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Export Quarter CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Telemetry Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Proceeds</span>
                        <div className="text-lg font-black text-emerald-600 mt-1">{formatCurrency(totalQuarterRaised)}</div>
                        <span className="text-[10px] text-slate-500">Target: {formatCurrency(totalQuarterGoal)} ({efficiency}%)</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Direct Donations</span>
                        <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(directGiving)}</div>
                        <span className="text-[10px] text-slate-500">Individual community gifts</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Tickets & Sponsors</span>
                        <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(ticketSales + sponsors)}</div>
                        <span className="text-[10px] text-slate-500">Tickets: {formatCurrency(ticketSales)} • Sponsors: {formatCurrency(sponsors)}</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Volunteer Labor Value</span>
                        <div className="text-lg font-black text-purple-600 mt-1">{formatCurrency(economicValuation)}</div>
                        <span className="text-[10px] text-slate-500">{volunteerHours.toFixed(1)} hrs @ $31.80/hr</span>
                      </div>
                    </div>

                    {/* Included Campaigns with Event Keys */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-700 block">Events Conducted in {group.label}:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.events.map(e => (
                          <div key={e.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                                  {e.eventKey || 'EVT-KEY'}
                                </span>
                                <span className="font-bold text-xs text-slate-900">{e.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {formatDate(e.startDate)} • Raised: <strong>{formatCurrency(e.totalRaised)}</strong>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedEventReport(e)}
                              className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 font-bold text-[11px] rounded-lg border border-slate-200 shadow-xs"
                            >
                              Dossier
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 3: BY CALENDAR YEAR (ANNUAL 990 / BOARD SUMMARIES) */}
          {outcomeViewMode === 'by_year' && (
            <div className="space-y-6">
              {yearGroups.map((group, idx) => {
                const totalYearRaised = group.events.reduce((sum, e) => sum + e.totalRaised, 0);
                const totalYearGoal = group.events.reduce((sum, e) => sum + e.fundraisingGoal, 0);
                const directGiving = Math.round(totalYearRaised * 0.45);
                const ticketSales = Math.round(totalYearRaised * 0.35);
                const sponsors = Math.round(totalYearRaised * 0.20);
                const volunteerHours = group.events.length * 32.5;
                const economicValuation = volunteerHours * 31.80;
                const efficiency = Math.round((totalYearRaised / (totalYearGoal || 1)) * 100);

                // Compute YoY comparison with previous year if present
                const prevYearGroup = yearGroups[idx + 1];
                let yoyGrowth: number | undefined = undefined;
                if (prevYearGroup) {
                  const prevRaised = prevYearGroup.events.reduce((sum, e) => sum + e.totalRaised, 0);
                  if (prevRaised > 0) {
                    yoyGrowth = Math.round(((totalYearRaised - prevRaised) / prevRaised) * 100);
                  }
                }

                return (
                  <div key={group.year} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider">
                            🏛️ {group.year} Calendar Year
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {group.events.length} Campaigns Hosted
                          </span>
                          {yoyGrowth !== undefined && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              yoyGrowth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {yoyGrowth >= 0 ? `+${yoyGrowth}%` : `${yoyGrowth}%`} YoY vs {group.year - 1}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-1">Annual Executive Impact & Form 990 Outcomes</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            printAnnualReportHtml(group.year, currentOrg, group.events, {
                              totalRaised: totalYearRaised,
                              fundraisingGoal: totalYearGoal,
                              directGiving,
                              ticketSales,
                              sponsors,
                              volunteerHours,
                              economicValuation,
                              itemsDelivered: group.events.length * 18,
                              yoyGrowthPercent: yoyGrowth
                            });
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Annual Report (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            exportAnnualLedgerToCsv(group.year, group.events, currentOrg.name, currentOrg.ein);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Export Annual CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Annual Telemetry */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Annual Gross Proceeds</span>
                        <div className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(totalYearRaised)}</div>
                        <span className="text-[10px] text-slate-500">Cumulative Target: {formatCurrency(totalYearGoal)}</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Goal Efficiency</span>
                        <div className="text-xl font-black text-purple-600 mt-1">{efficiency}%</div>
                        <span className="text-[10px] text-slate-500">Portfolio fulfillment rate</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Volunteer Labor Value</span>
                        <div className="text-xl font-black text-indigo-600 mt-1">{formatCurrency(economicValuation)}</div>
                        <span className="text-[10px] text-slate-500">{volunteerHours.toFixed(1)} hrs @ $31.80/hr</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Economic Impact</span>
                        <div className="text-xl font-black text-slate-900 mt-1">{formatCurrency(totalYearRaised + economicValuation)}</div>
                        <span className="text-[10px] text-slate-500">Funds + Labor Valuation</span>
                      </div>
                    </div>

                    {/* Annual Campaign Ledger Table */}
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Annual Campaigns Audit Ledger ({group.year})
                      </span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                              <th className="pb-2">Event Key</th>
                              <th className="pb-2">Campaign Title</th>
                              <th className="pb-2">Quarter</th>
                              <th className="pb-2">Date</th>
                              <th className="pb-2">Revenue Raised</th>
                              <th className="pb-2">Goal</th>
                              <th className="pb-2">Fulfillment</th>
                              <th className="pb-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.events.map(e => {
                              const q = `Q${Math.floor(new Date(e.startDate).getMonth() / 3) + 1}`;
                              const pct = Math.round((e.totalRaised / (e.fundraisingGoal || 1)) * 100);
                              return (
                                <tr key={e.id} className="hover:bg-slate-50/80">
                                  <td className="py-2.5 font-mono font-bold text-purple-700">{e.eventKey || 'N/A'}</td>
                                  <td className="py-2.5 font-bold text-slate-900">{e.title}</td>
                                  <td className="py-2.5 font-semibold text-slate-600">{q}</td>
                                  <td className="py-2.5 text-slate-500">{formatDate(e.startDate)}</td>
                                  <td className="py-2.5 font-bold text-emerald-600">{formatCurrency(e.totalRaised)}</td>
                                  <td className="py-2.5 text-slate-600">{formatCurrency(e.fundraisingGoal)}</td>
                                  <td className="py-2.5 font-bold text-slate-800">{pct}%</td>
                                  <td className="py-2.5 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedEventReport(e)}
                                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-[11px]"
                                    >
                                      Dossier
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
                    Event Campaign Dossier
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded font-mono font-bold text-[10px]">
                    🔑 Key: {selectedEventReport.eventKey || 'EVT-KEY'}
                  </span>
                </div>
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTeamMember(user)}
                        className="text-purple-600 hover:text-purple-800 font-bold text-[11px] flex items-center gap-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Role</span>
                      </button>

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

      {/* MODAL: EDIT EVENT DETAILS */}
      {editingEvent && (
        <Modal
          isOpen={Boolean(editingEvent)}
          onClose={() => setEditingEvent(null)}
          title={`Edit Campaign: ${editingEvent.title}`}
          subtitle={`Modify campaign parameters, schedule, venue, and approval rules for ${editingEvent.eventKey || 'this event'}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveEditEvent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editEventTitle}
                  onChange={(e) => setEditEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Tagline / Mission Statement</label>
                <input
                  type="text"
                  value={editEventTagline}
                  onChange={(e) => setEditEventTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fundraising Target Goal ($) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={editEventGoal}
                  onChange={(e) => setEditEventGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={editEventCoverUrl}
                  onChange={(e) => setEditEventCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={editEventStartDate}
                  onChange={(e) => setEditEventStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={editEventEndDate}
                  onChange={(e) => setEditEventEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Location Name *</label>
                <input
                  type="text"
                  required
                  value={editEventVenueName}
                  onChange={(e) => setEditEventVenueName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Street Address *</label>
                <input
                  type="text"
                  required
                  value={editEventVenueAddress}
                  onChange={(e) => setEditEventVenueAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              {/* Variable Approval Limits */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Budget Auto-Approval Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  value={editThresholdBudget}
                  onChange={(e) => setEditThresholdBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
                <span className="text-[10px] text-slate-400">Leads requesting additions above this enter approval queue</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Slots Auto-Approval Limit</label>
                <input
                  type="number"
                  min="1"
                  value={editThresholdSlots}
                  onChange={(e) => setEditThresholdSlots(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
                <span className="text-[10px] text-slate-400">Shift additions exceeding this capacity require Planner review</span>
              </div>

              {/* Public Search & Discovery Tags */}
              <div className="sm:col-span-2 space-y-1.5 pt-1">
                <label className="block font-bold text-slate-700">Search & Discovery Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEventTag();
                      }
                    }}
                    placeholder="e.g. STEM, Bake Sale, Charity Gala, High School..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddEventTag}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                  >
                    + Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editEventTags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] flex items-center gap-1">
                      <span>{tag}</span>
                      <button type="button" onClick={() => handleRemoveEventTag(tag)} className="text-purple-400 hover:text-purple-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Campaign Changes</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: EDIT TEAM MEMBER ROLE & DEPARTMENT */}
      {editingTeamMember && (
        <Modal
          isOpen={Boolean(editingTeamMember)}
          onClose={() => setEditingTeamMember(null)}
          title={`Edit Role: ${editingTeamMember.name}`}
          subtitle={`Update leadership permissions and committee assignments for ${currentOrg.name}`}
        >
          <form onSubmit={handleSaveEditTeamMember} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Level</label>
              <select
                value={editMemberRole}
                onChange={(e) => setEditMemberRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="committee_lead">Committee Lead (Scoped Department)</option>
                <option value="event_planner">Event Planner (Master Event Logistics & Approvals)</option>
                <option value="org_admin">Organization Super Admin (Full Governance & CRM)</option>
              </select>
            </div>

            {editMemberRole === 'committee_lead' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Department Committee</label>
                <select
                  value={editMemberSubPartId}
                  onChange={(e) => setEditMemberSubPartId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">Select Department...</option>
                  {subParts.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name} ({sp.reportingGate})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTeamMember(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md"
              >
                Update Permissions
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
