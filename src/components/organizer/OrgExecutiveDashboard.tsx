import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ORG_TEMPLATES } from '../../data/templates';
import { Event, User, OrganizationType, OrgCommunicationSettings, OrgCommunicationDnsRecord } from '../../types';
import { VolunteerCrm } from './VolunteerCrm';
import { LegalComplianceStudio } from './LegalComplianceStudio';
import { AdminObservabilityHub } from '../admin/AdminObservabilityHub';
import { Modal } from '../common/Modal';
import { 
  Building2, Users, Shield, Award, DollarSign, 
  History, Plus, Check, Settings, Sparkles, Image, Palette, 
  Upload, FileText, CheckCircle2, ShieldCheck, UserPlus, Trash2, Mail, Phone, Briefcase,
  Calendar, BarChart3, TrendingUp, CheckCircle, ExternalLink, Printer, FileSpreadsheet, Eye, ChevronRight, Package, ArrowUpRight,
  Filter, Search, Hash, Layers, PieChart, ArrowDownRight, Edit3, X, MessageSquare, Key, Send, RefreshCw, Activity,
  Copy, HelpCircle, Smartphone, Radio, Zap, Lock, Unlock, Info, Sliders, Clock, Bell, AlertCircle, CheckSquare, Square,
  Globe, Server
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

interface OrgExecutiveDashboardProps {
  initialTab?: 'events' | 'crm' | 'branding' | 'legal' | 'team' | 'templates' | 'audit' | 'integrations' | 'observability';
}

export const OrgExecutiveDashboard: React.FC<OrgExecutiveDashboardProps> = ({ initialTab = 'events' }) => {
  const { 
    currentOrg, users, currentUser, auditLogs, events, volunteerCrm, 
    registrations, shifts, subParts, donations, itemSlots,
    updateOrganizationBranding, inviteTeamMember, updateTeamMember, removeTeamMember, 
    updateEvent, deleteEvent,
    switchEvent, switchRole, showToast 
  } = useApp();
  
  const [activeAdminTab, setActiveAdminTab] = useState<'events' | 'crm' | 'branding' | 'legal' | 'team' | 'templates' | 'audit' | 'integrations' | 'observability'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveAdminTab(initialTab);
    }
  }, [initialTab]);

  // Email & SMS Communication Studio State
  const initialComm = currentOrg.communicationSettings;
  const [emailDeliveryMode, setEmailDeliveryMode] = useState<'managed' | 'custom_domain'>(initialComm?.emailDeliveryMode || 'custom_domain');
  const [emailProvider, setEmailProvider] = useState<'resend' | 'postmark' | 'ses' | 'smtp' | 'managed'>(initialComm?.emailProvider || 'resend');
  const [emailApiKey, setEmailApiKey] = useState(initialComm?.emailApiKey || 're_839f28a9b1c04d5e9821');
  const [showApiKey, setShowApiKey] = useState(false);
  const [customSendingDomain, setCustomSendingDomain] = useState(initialComm?.customSendingDomain || 'mail.lincolnpta.org');
  const [customFromName, setCustomFromName] = useState(initialComm?.customFromName || currentOrg.name || 'Lincoln High PTA Events');
  const [customFromEmail, setCustomFromEmail] = useState(initialComm?.customFromEmail || 'events@mail.lincolnpta.org');
  const [customReplyTo, setCustomReplyTo] = useState(initialComm?.customReplyTo || currentOrg.contactEmail || 'treasurer@lincolnpta.org');
  const [dnsVerified, setDnsVerified] = useState(initialComm?.dnsVerified ?? true);
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);

  // Dynamic DNS Records
  const [dnsRecords, setDnsRecords] = useState<OrgCommunicationDnsRecord[]>(initialComm?.dnsRecords || [
    { type: 'CNAME', name: `resend._domainkey.${initialComm?.customSendingDomain || 'mail.lincolnpta.org'}`, value: 'dkim.resend.com', status: 'verified', purpose: 'DKIM' },
    { type: 'TXT', name: initialComm?.customSendingDomain || 'mail.lincolnpta.org', value: 'v=spf1 include:_spf.resend.com ~all', status: 'verified', purpose: 'SPF' },
    { type: 'TXT', name: `_dmarc.${initialComm?.customSendingDomain || 'mail.lincolnpta.org'}`, value: `v=DMARC1; p=none; rua=mailto:dmarc-reports@${initialComm?.customSendingDomain || 'lincolnpta.org'}`, status: 'verified', purpose: 'DMARC' },
    { type: 'MX', name: `feedback.${initialComm?.customSendingDomain || 'mail.lincolnpta.org'}`, value: 'feedback.resend.com', status: 'verified', purpose: 'Return-Path', priority: 10 }
  ]);
  const [copiedRecordKey, setCopiedRecordKey] = useState<string | null>(null);

  // SMS 10DLC Gateway State
  const [smsDeliveryMode, setSmsDeliveryMode] = useState<'managed_10dlc' | 'dedicated_10dlc'>(initialComm?.smsDeliveryMode || 'managed_10dlc');
  const [smsBrandPrefix, setSmsBrandPrefix] = useState(initialComm?.smsBrandPrefix || `[${currentOrg.name || 'Lincoln High PTA'}]`);
  const [smsDedicatedNumber, setSmsDedicatedNumber] = useState(initialComm?.smsDedicatedNumber || '+1 (555) 234-8900');
  const [smsCadenceT72h, setSmsCadenceT72h] = useState(initialComm?.smsCadenceT72h ?? true);
  const [smsCadenceT24h, setSmsCadenceT24h] = useState(initialComm?.smsCadenceT24h ?? true);
  const [smsCadenceT2h, setSmsCadenceT2h] = useState(initialComm?.smsCadenceT2h ?? true);
  const [smsEmergencyBroadcasts, setSmsEmergencyBroadcasts] = useState(initialComm?.smsEmergencyBroadcasts ?? true);
  const [smsTaxReceipts, setSmsTaxReceipts] = useState(initialComm?.smsTaxReceipts ?? true);
  const [smsOptInStatus, setSmsOptInStatus] = useState(initialComm?.smsOptInStatus ?? true);

  // Interactive Test Sandbox State
  const [testEmailRecipient, setTestEmailRecipient] = useState(currentUser.email || 'coordinator@lincolnpta.org');
  const [testEmailType, setTestEmailType] = useState<'volunteer_pass' | 'shift_reminder' | 'tax_receipt'>('volunteer_pass');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [lastEmailDispatchLog, setLastEmailDispatchLog] = useState<{ id: string; timestamp: string; latencyMs: number; status: string } | null>(null);

  const [testSmsPhone, setTestSmsPhone] = useState('(555) 234-8900');
  const [testSmsType, setTestSmsType] = useState<'shift_reminder' | 'gate_pass' | 'emergency'>('gate_pass');
  const [isSendingTestSms, setIsSendingTestSms] = useState(false);
  const [lastSmsDispatchLog, setLastSmsDispatchLog] = useState<{ sid: string; timestamp: string; carrierAck: string; latencyMs: number } | null>(null);

  // Active Tooltip / Help Drawer State
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  
  // Outcome Report View Mode: By Event, By Quarter, By Calendar Year
  const [outcomeViewMode, setOutcomeViewMode] = useState<'by_event' | 'by_quarter' | 'by_year'>('by_event');
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [selectedEventReport, setSelectedEventReport] = useState<Event | null>(null);

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventTagline, setEditEventTagline] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventGoal, setEditEventGoal] = useState(10000);
  const [editEventStartDate, setEditEventStartDate] = useState('');
  const [editEventEndDate, setEditEventEndDate] = useState('');
  const [editEventVenueName, setEditEventVenueName] = useState('');
  const [editEventVenueAddress, setEditEventVenueAddress] = useState('');
  const [editEventMapUrl, setEditEventMapUrl] = useState('');
  const [editEventIsVirtual, setEditEventIsVirtual] = useState(false);
  const [editEventVirtualLink, setEditEventVirtualLink] = useState('');
  const [editEventCoverUrl, setEditEventCoverUrl] = useState('');
  const [editEventDressCode, setEditEventDressCode] = useState('');
  const [editEventTags, setEditEventTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editThresholdBudget, setEditThresholdBudget] = useState(250);
  const [editThresholdSlots, setEditThresholdSlots] = useState(5);
  const [editReminderCadence, setEditReminderCadence] = useState<'standard' | 'intensive' | 'same_day' | 'custom'>('standard');
  const [editAllowFeeCoverage, setEditAllowFeeCoverage] = useState(true);

  // Edit Team Member State
  const [editingTeamMember, setEditingTeamMember] = useState<User | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberEmail, setEditMemberEmail] = useState('');
  const [editMemberPhone, setEditMemberPhone] = useState('');
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

  // Organization Legal Governance & Branding Form State
  const [orgName, setOrgName] = useState(currentOrg.name || '');
  const [orgEin, setOrgEin] = useState(currentOrg.ein || '');
  const [orgType, setOrgType] = useState<OrganizationType>(currentOrg.type || 'school_pta');
  const [orgCurrency, setOrgCurrency] = useState(currentOrg.settings?.defaultCurrency || 'USD');
  const [orgApprovalThresholdBudget, setOrgApprovalThresholdBudget] = useState(currentOrg.settings?.approvalThresholdBudget ?? 250);
  const [orgApprovalThresholdSlots, setOrgApprovalThresholdSlots] = useState(currentOrg.settings?.approvalThresholdSlots ?? 5);
  const [orgReminderCadence, setOrgReminderCadence] = useState<'standard' | 'intensive' | 'same_day' | 'custom'>(currentOrg.settings?.defaultReminderCadence || 'standard');

  const [logoUrl, setLogoUrl] = useState(currentOrg.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(currentOrg.primaryColor || '#4f46e5');
  const [signatoryName, setSignatoryName] = useState(currentOrg.signatoryOfficerName || 'Elena Rostova');
  const [signatoryTitle, setSignatoryTitle] = useState(currentOrg.signatoryOfficerTitle || 'President & Authorized Signatory');
  const [signatorySigUrl, setSignatorySigUrl] = useState(currentOrg.signatorySignatureUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80');
  const [orgAddress, setOrgAddress] = useState(currentOrg.address || '');
  const [orgPhone, setOrgPhone] = useState(currentOrg.phone || '');
  const [orgEmail, setOrgEmail] = useState(currentOrg.contactEmail || '');
  const [orgWebsite, setOrgWebsite] = useState(currentOrg.website || 'https://lincolnpta.org');

  useEffect(() => {
    setOrgName(currentOrg.name || '');
    setOrgEin(currentOrg.ein || '');
    setOrgType(currentOrg.type || 'school_pta');
    setOrgCurrency(currentOrg.settings?.defaultCurrency || 'USD');
    setOrgApprovalThresholdBudget(currentOrg.settings?.approvalThresholdBudget ?? 250);
    setOrgApprovalThresholdSlots(currentOrg.settings?.approvalThresholdSlots ?? 5);
    setOrgReminderCadence(currentOrg.settings?.defaultReminderCadence || 'standard');
    setLogoUrl(currentOrg.logoUrl || '');
    setPrimaryColor(currentOrg.primaryColor || '#4f46e5');
    setSignatoryName(currentOrg.signatoryOfficerName || 'Elena Rostova');
    setSignatoryTitle(currentOrg.signatoryOfficerTitle || 'President & Authorized Signatory');
    setSignatorySigUrl(currentOrg.signatorySignatureUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80');
    setOrgAddress(currentOrg.address || '');
    setOrgPhone(currentOrg.phone || '');
    setOrgEmail(currentOrg.contactEmail || '');
    setOrgWebsite(currentOrg.website || 'https://lincolnpta.org');

    if (currentOrg.communicationSettings) {
      const c = currentOrg.communicationSettings;
      setEmailDeliveryMode(c.emailDeliveryMode || 'custom_domain');
      setEmailProvider(c.emailProvider || 'resend');
      setEmailApiKey(c.emailApiKey || 're_839f28a9b1c04d5e9821');
      setCustomSendingDomain(c.customSendingDomain || 'mail.lincolnpta.org');
      setCustomFromName(c.customFromName || currentOrg.name || 'Lincoln High PTA Events');
      setCustomFromEmail(c.customFromEmail || 'events@mail.lincolnpta.org');
      setCustomReplyTo(c.customReplyTo || currentOrg.contactEmail || 'treasurer@lincolnpta.org');
      setDnsVerified(c.dnsVerified ?? true);
      if (c.dnsRecords) setDnsRecords(c.dnsRecords);
      setSmsDeliveryMode(c.smsDeliveryMode || 'managed_10dlc');
      setSmsBrandPrefix(c.smsBrandPrefix || `[${currentOrg.name || 'Lincoln High PTA'}]`);
      setSmsDedicatedNumber(c.smsDedicatedNumber || '+1 (555) 234-8900');
      setSmsCadenceT72h(c.smsCadenceT72h ?? true);
      setSmsCadenceT24h(c.smsCadenceT24h ?? true);
      setSmsCadenceT2h(c.smsCadenceT2h ?? true);
      setSmsEmergencyBroadcasts(c.smsEmergencyBroadcasts ?? true);
      setSmsTaxReceipts(c.smsTaxReceipts ?? true);
      setSmsOptInStatus(c.smsOptInStatus ?? true);
    }
  }, [currentOrg]);

  // Helper: Copy DNS record to clipboard
  const handleCopyDnsRecord = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRecordKey(key);
    setTimeout(() => setCopiedRecordKey(null), 2000);
    showToast('info', 'Copied to Clipboard', `"${text}" copied to clipboard.`);
  };

  // Helper: Verify DNS Records
  const handleVerifyDns = () => {
    setIsVerifyingDns(true);
    setTimeout(() => {
      setIsVerifyingDns(false);
      setDnsVerified(true);
      setDnsRecords(prev => prev.map(r => ({ ...r, status: 'verified' as const })));
      showToast('success', 'DNS Records 100% Verified', `All DKIM, SPF, and DMARC records for "${customSendingDomain}" are active and aligned.`);
    }, 1200);
  };

  // Helper: Send Live Test Email
  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient) return;
    setIsSendingTestEmail(true);
    setTimeout(() => {
      setIsSendingTestEmail(false);
      const msgId = `msg_${Math.random().toString(36).substring(2, 11)}`;
      setLastEmailDispatchLog({
        id: msgId,
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: Math.floor(Math.random() * 90) + 120,
        status: 'Delivered (HTTP 200)'
      });
      showToast('success', 'Test Email Dispatched', `Delivered test template to ${testEmailRecipient} via ${emailProvider.toUpperCase()} (<2s latency).`);
    }, 900);
  };

  // Helper: Send Live Test SMS
  const handleSendTestSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSmsPhone) return;
    setIsSendingTestSms(true);
    setTimeout(() => {
      setIsSendingTestSms(false);
      const sid = `SM${Math.random().toString(36).substring(2, 12)}`;
      setLastSmsDispatchLog({
        sid,
        timestamp: new Date().toLocaleTimeString(),
        carrierAck: 'Verizon / AT&T ACK (Delivered)',
        latencyMs: Math.floor(Math.random() * 150) + 260
      });
      showToast('success', 'Test SMS Dispatched', `A2P 10DLC message delivered to ${testSmsPhone} with prefix "${smsBrandPrefix}".`);
    }, 1000);
  };

  // Helper: Save Communication Settings
  const handleSaveCommunicationSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedCommSettings: OrgCommunicationSettings = {
      emailDeliveryMode,
      customSendingDomain,
      customFromName,
      customFromEmail,
      customReplyTo,
      emailProvider,
      emailApiKey,
      dnsVerified,
      dnsRecords,
      smsDeliveryMode,
      smsBrandPrefix,
      smsDedicatedNumber,
      smsCadenceT72h,
      smsCadenceT24h,
      smsCadenceT2h,
      smsEmergencyBroadcasts,
      smsTaxReceipts,
      smsOptInStatus
    };

    updateOrganizationBranding(currentOrg.id, {
      communicationSettings: updatedCommSettings
    });
    showToast('success', 'Communication Settings Saved', `Email dispatch and SMS 10DLC configuration successfully updated for ${currentOrg.name}.`);
  };

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
    setEditEventDescription(evt.description || evt.tagline);
    setEditEventGoal(evt.fundraisingGoal);
    setEditEventStartDate(evt.startDate.slice(0, 16));
    setEditEventEndDate(evt.endDate.slice(0, 16));
    setEditEventVenueName(evt.venueName);
    setEditEventVenueAddress(evt.venueAddress);
    setEditEventMapUrl(evt.mapUrl || '');
    setEditEventIsVirtual(!!evt.isVirtual);
    setEditEventVirtualLink(evt.virtualLink || '');
    setEditEventCoverUrl(evt.coverImageUrl);
    setEditEventDressCode(evt.dressCode || '');
    setEditEventTags([...(evt.tags || [])]);
    setNewTagInput('');
    setEditThresholdBudget(evt.approvalThresholdBudget || 250);
    setEditThresholdSlots(evt.approvalThresholdSlots || 5);
    setEditReminderCadence(evt.reminderCadence || 'standard');
    setEditAllowFeeCoverage(evt.allowFeeCoverage !== undefined ? evt.allowFeeCoverage : true);
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
      description: editEventDescription.trim() || editEventTagline.trim(),
      fundraisingGoal: Number(editEventGoal) || 1000,
      startDate: editEventStartDate,
      endDate: editEventEndDate,
      venueName: editEventVenueName.trim(),
      venueAddress: editEventVenueAddress.trim(),
      mapUrl: editEventMapUrl.trim() || undefined,
      isVirtual: editEventIsVirtual,
      virtualLink: editEventIsVirtual ? editEventVirtualLink.trim() : undefined,
      coverImageUrl: editEventCoverUrl.trim(),
      dressCode: editEventDressCode.trim() || undefined,
      tags: editEventTags,
      reminderCadence: editReminderCadence,
      allowFeeCoverage: editAllowFeeCoverage,
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
    setEditMemberName(user.name);
    setEditMemberEmail(user.email);
    setEditMemberPhone(user.phone || '');
    setEditMemberRole(user.role as any);
    setEditMemberSubPartId(user.assignedSubPartIds?.[0] || '');
  };

  const handleSaveEditTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamMember) return;

    updateTeamMember(editingTeamMember.id, {
      name: editMemberName.trim() || editingTeamMember.name,
      email: editMemberEmail.trim() || editingTeamMember.email,
      phone: editMemberPhone.trim() || undefined,
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
      name: orgName.trim() || currentOrg.name,
      ein: orgEin.trim() || currentOrg.ein,
      type: orgType,
      logoUrl,
      primaryColor,
      signatoryOfficerName: signatoryName,
      signatoryOfficerTitle: signatoryTitle,
      signatorySignatureUrl: signatorySigUrl,
      address: orgAddress,
      phone: orgPhone,
      contactEmail: orgEmail,
      website: orgWebsite,
      settings: {
        defaultCurrency: orgCurrency,
        approvalThresholdBudget: Number(orgApprovalThresholdBudget) || 250,
        approvalThresholdSlots: Number(orgApprovalThresholdSlots) || 5,
        defaultReminderCadence: orgReminderCadence
      }
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

      {/* Consolidated 5 Master Executive Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('events')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'events' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>🎯 Campaign Portfolio & 990s ({orgEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('crm')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'crm' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Supporter & Donor CRM ({volunteerCrm.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('team')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'team' || activeAdminTab === 'templates' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>👑 Leadership & Committee Delegation ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('branding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'branding' || activeAdminTab === 'legal' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>🛡️ Brand, Signatories & Waivers</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('integrations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'integrations' || activeAdminTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>⚡ Email & SMS Dispatch</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('observability')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'observability' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>🔍 Observability & Accounts</span>
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
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Organization Profile, Governance & Document Branding</h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage your legal entity registration, EIN tax status, organization-wide variable approval thresholds, brand logo assets, and authorized signatories for automated IRS tax receipts and volunteer verification.
              </p>
            </div>

            {/* Quick Dispatch Setup Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs mt-0.5 sm:mt-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Email & SMS Dispatch Infrastructure</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full font-bold">New Studio</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Configure custom sending domains (DKIM/SPF), R3Pro hosted shared pool, SMS 10DLC brand prefixes, and automated reminder cadences.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminTab('integrations')}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
              >
                <span>Email & SMS Settings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-6">
              
              {/* 1. Legal Entity & Tax Classification */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Legal Organization Entity & Tax Status</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-600 font-medium block mb-1">Legal Organization Name *</span>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Lincoln High School PTA"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">EIN (Tax ID Number) *</span>
                    <input
                      type="text"
                      required
                      value={orgEin}
                      onChange={(e) => setOrgEin(e.target.value)}
                      placeholder="e.g. 94-2849102"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-600 font-medium block mb-1">Organization Type</span>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="school_pta">School PTA / Booster Club</option>
                      <option value="non_profit">501(c)(3) Non-Profit Charity</option>
                      <option value="youth_sports">Youth Sports League</option>
                      <option value="church_faith">Faith Community / Church</option>
                      <option value="corporate_giving">Corporate Giving / Foundation</option>
                      <option value="other">Other Community Entity</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Default Currency</span>
                    <select
                      value={orgCurrency}
                      onChange={(e) => setOrgCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Organization-Wide Variable Approval & Automation Policies */}
              <div className="space-y-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Default Campaign Governance & Variable Approval Thresholds</span>
                </span>
                <p className="text-[11px] text-slate-600">
                  Lead budget or shift additions within limits are auto-approved; requests exceeding limits require Planner approval.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-xs text-slate-700 font-semibold block mb-1">Budget Auto-Approval Limit</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        value={orgApprovalThresholdBudget}
                        onChange={(e) => setOrgApprovalThresholdBudget(Number(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-700 font-semibold block mb-1">Shift Slots Auto-Approval Limit</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={orgApprovalThresholdSlots}
                        onChange={(e) => setOrgApprovalThresholdSlots(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-700 font-semibold block mb-1">Default Reminder Cadence</span>
                    <select
                      value={orgReminderCadence}
                      onChange={(e) => setOrgReminderCadence(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="standard">Standard (72h, 24h, 2h)</option>
                      <option value="intensive">Intensive (7d, 72h, 24h, 2h)</option>
                      <option value="same_day">Same-Day Only (4h, 1h)</option>
                      <option value="custom">Custom Configuration</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Logo Upload & Presets */}
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
                  <span>Save Organization Profile & Governance Settings</span>
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

      {/* TAB 8: EMAIL & SMS DISPATCH STUDIO */}
      {activeAdminTab === 'integrations' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                  Tenant Delivery & Multi-Channel Gateway
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                  Email & SMS Communication Infrastructure
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Configure high-deliverability transactional email (R3Pro Hosted Cloud Pool vs Custom Sending Domain), automated DKIM/SPF/DMARC DNS authentication, and multi-tenant A2P 10DLC SMS messaging.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveCommunicationSettings()}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Communication Settings</span>
                </button>
              </div>
            </div>

            {/* Current Active Mode & Health Chips */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
              <div className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {emailDeliveryMode === 'custom_domain' 
                    ? `Custom Sending Domain (${customSendingDomain})` 
                    : 'R3Pro Cloud Hosted (Shared Pool)'}
                </span>
              </div>

              <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{dnsVerified ? 'DKIM / SPF 100% Aligned' : 'Pending DNS Verification'}</span>
              </div>

              <div className="px-3 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>A2P 10DLC Registered ({smsBrandPrefix})</span>
              </div>
            </div>

            {/* SLA Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Queue P0 (Auth OTP)</span>
                  <Zap className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-base font-extrabold text-white mt-0.5">&lt; 2.0s SLA</div>
                <span className="text-[10px] text-emerald-400">Bypasses marketing queues</span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Queue P1 (Gate Passes)</span>
                  <Smartphone className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="text-base font-extrabold text-white mt-0.5">Instant Push</div>
                <span className="text-[10px] text-indigo-300">Live QR Mobile Passes</span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Queue P2 (501c3 Receipts)</span>
                  <FileText className="w-3 h-3 text-purple-400" />
                </div>
                <div className="text-base font-extrabold text-white mt-0.5">Real-Time</div>
                <span className="text-[10px] text-purple-300">IRS Pub 526/561 Compliant</span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Queue P3 (Broadcasts)</span>
                  <Radio className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-base font-extrabold text-white mt-0.5">50 / sec Limit</div>
                <span className="text-[10px] text-amber-300">Tenant Reputation Guard</span>
              </div>
            </div>
          </div>

          {/* Interactive Tooltips & Educational Knowledge Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div 
              onClick={() => setActiveTooltipId(activeTooltipId === 'spf_dkim' ? null : 'spf_dkim')}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                activeTooltipId === 'spf_dkim' ? 'bg-purple-50 border-purple-300 shadow-sm' : 'bg-white border-slate-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>What is SPF & DKIM?</span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Cryptographic authentication that proves emails genuinely originate from your organization and prevents spam filters.
              </p>
              {activeTooltipId === 'spf_dkim' && (
                <div className="mt-2 pt-2 border-t border-purple-200 text-[11px] text-purple-900 leading-relaxed">
                  <strong>SPF</strong> authorizes dispatch IP addresses. <strong>DKIM</strong> signs every outbound email with a 2048-bit cryptographic key matching your public DNS record.
                </div>
              )}
            </div>

            <div 
              onClick={() => setActiveTooltipId(activeTooltipId === 'dmarc' ? null : 'dmarc')}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                activeTooltipId === 'dmarc' ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>What is DMARC?</span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Domain-based Message Authentication that protects your brand from phishing and unauthorized spoofing.
              </p>
              {activeTooltipId === 'dmarc' && (
                <div className="mt-2 pt-2 border-t border-indigo-200 text-[11px] text-indigo-900 leading-relaxed">
                  Tells mailbox providers (Gmail, Microsoft 365, Yahoo) how to handle failed authentication and sends daily deliverability reports to your security email.
                </div>
              )}
            </div>

            <div 
              onClick={() => setActiveTooltipId(activeTooltipId === '10dlc' ? null : '10dlc')}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                activeTooltipId === '10dlc' ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>A2P 10DLC Registration</span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                US telecom regulation for Application-to-Person SMS messaging for Non-Profits, PTAs, and charities.
              </p>
              {activeTooltipId === '10dlc' && (
                <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                  REACH acts as a registered ISV partner with The Campaign Registry (TCR). We register your EIN so carriers don&apos;t throttle or block your shift arrival reminders.
                </div>
              )}
            </div>

            <div 
              onClick={() => setActiveTooltipId(activeTooltipId === 'hosted_vs_custom' ? null : 'hosted_vs_custom')}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                activeTooltipId === 'hosted_vs_custom' ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Hosted vs Custom Domain</span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Compare R3Pro Hosted shared cloud delivery vs full white-labeled custom domain authentication.
              </p>
              {activeTooltipId === 'hosted_vs_custom' && (
                <div className="mt-2 pt-2 border-t border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  <strong>Hosted:</strong> Instant 0-second setup, pre-warmed IP pool. <strong>Custom Domain:</strong> Sends directly from <code>@mail.yourorg.org</code> with 100% brand white-labeling.
                </div>
              )}
            </div>
          </div>

          {/* SECTION 1: EMAIL DELIVERY CONFIGURATION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <span>Email Dispatch Architecture & Sending Identity</span>
                </h4>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
                  Step 1 of 2
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Choose how outbound transactional receipts, volunteer check-in passes, and reminder emails are delivered to your supporters.
              </p>
            </div>

            {/* Dual Delivery Mode Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option A: R3Pro Hosted Cloud Pool */}
              <div
                onClick={() => setEmailDeliveryMode('managed')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative ${
                  emailDeliveryMode === 'managed'
                    ? 'border-purple-600 bg-purple-50/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${emailDeliveryMode === 'managed' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">R3Pro Hosted Cloud Pool</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                          Zero-Config
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Shared High-Reputation IP Pool</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    emailDeliveryMode === 'managed' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                  }`}>
                    {emailDeliveryMode === 'managed' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Dispatches transactional emails via R3Pro&apos;s pre-authenticated AWS SES &amp; Resend cloud infrastructure. No DNS setup required. Replies automatically route back to your coordinator inbox.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200/60 font-mono text-[11px] text-slate-600 space-y-1">
                  <div><strong>From:</strong> &quot;{customFromName || currentOrg.name} via REACH&quot; &lt;notifications@mail.reachplatform.com&gt;</div>
                  <div><strong>Reply-To:</strong> {customReplyTo || currentOrg.contactEmail || 'chair@lincolnpta.org'}</div>
                </div>
              </div>

              {/* Option B: Custom Branded Organization Domain */}
              <div
                onClick={() => setEmailDeliveryMode('custom_domain')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative ${
                  emailDeliveryMode === 'custom_domain'
                    ? 'border-purple-600 bg-purple-50/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${emailDeliveryMode === 'custom_domain' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Custom Branded Domain</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-full">
                          100% White-Labeled
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Dedicated DKIM &amp; SPF Signing</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    emailDeliveryMode === 'custom_domain' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                  }`}>
                    {emailDeliveryMode === 'custom_domain' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Send emails directly from your domain (e.g. <code>events@{customSendingDomain}</code>) using your own API credentials with dedicated domain reputation, custom DKIM signing keys, and zero REACH branding.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200/60 font-mono text-[11px] text-slate-600 space-y-1">
                  <div><strong>From:</strong> &quot;{customFromName || currentOrg.name}&quot; &lt;{customFromEmail || `events@${customSendingDomain}`}&gt;</div>
                  <div><strong>Reply-To:</strong> {customReplyTo || currentOrg.contactEmail || 'chair@lincolnpta.org'}</div>
                </div>
              </div>

            </div>

            {/* Detailed Email Configuration Form */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Sender Display Name *</label>
                  <input
                    type="text"
                    value={customFromName}
                    onChange={(e) => setCustomFromName(e.target.value)}
                    placeholder="e.g. Lincoln High PTA Events"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Appears in supporter inboxes as the sender name</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Reply-To Email Address *</label>
                  <input
                    type="email"
                    value={customReplyTo}
                    onChange={(e) => setCustomReplyTo(e.target.value)}
                    placeholder="e.g. treasurer@lincolnpta.org"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Volunteer responses and inquiries route directly here</span>
                </div>
              </div>

              {/* White-Label Custom Domain & API Provider Settings */}
              {emailDeliveryMode === 'custom_domain' && (
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Dispatch Provider API *</label>
                      <select
                        value={emailProvider}
                        onChange={(e) => setEmailProvider(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                      >
                        <option value="resend">Resend API (React Email SDK — Recommended)</option>
                        <option value="postmark">Postmark (Transactional High-Deliverability)</option>
                        <option value="ses">Amazon SES (High-Volume Dedicated IP)</option>
                        <option value="smtp">Custom SMTP Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Custom Sending Domain *</label>
                      <input
                        type="text"
                        value={customSendingDomain}
                        onChange={(e) => setCustomSendingDomain(e.target.value)}
                        placeholder="e.g. mail.lincolnpta.org"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Custom From Email Address *</label>
                      <input
                        type="email"
                        value={customFromEmail}
                        onChange={(e) => setCustomFromEmail(e.target.value)}
                        placeholder="e.g. events@mail.lincolnpta.org"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {emailProvider.toUpperCase()} API Key / Secret Token *
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={emailApiKey}
                        onChange={(e) => setEmailApiKey(e.target.value)}
                        placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-semibold pr-20 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2.5 top-2.5 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition"
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Interactive DNS Records Setup Table */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Server className="w-4 h-4 text-purple-600" />
                          <span>DNS Authentication Records for {customSendingDomain}</span>
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Add these 4 records to your DNS manager (Cloudflare, GoDaddy, Namecheap, Route 53)
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isVerifyingDns}
                        onClick={handleVerifyDns}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition"
                      >
                        {isVerifyingDns ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        <span>{isVerifyingDns ? 'Querying DNS...' : 'Verify DNS Records'}</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                            <th className="pb-2">Type</th>
                            <th className="pb-2">Hostname / Host</th>
                            <th className="pb-2">Value / Target</th>
                            <th className="pb-2">Purpose</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {dnsRecords.map((rec, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 font-bold text-purple-700">{rec.type}</td>
                              <td className="py-2.5 text-slate-800 truncate max-w-[160px]" title={rec.name}>{rec.name}</td>
                              <td className="py-2.5 text-slate-600 truncate max-w-[200px]" title={rec.value}>{rec.value}</td>
                              <td className="py-2.5 font-sans">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                                  {rec.purpose}
                                </span>
                              </td>
                              <td className="py-2.5 font-sans">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                                  dnsVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{dnsVerified ? 'Verified' : 'Pending'}</span>
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-sans">
                                <button
                                  type="button"
                                  onClick={() => handleCopyDnsRecord(`rec_${idx}`, rec.value)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1 ml-auto"
                                >
                                  {copiedRecordKey === `rec_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedRecordKey === `rec_${idx}` ? 'Copied' : 'Copy'}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* SECTION 2: SMS GATEWAY & A2P 10DLC INFRASTRUCTURE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <span>SMS Gateway, A2P 10DLC Compliance &amp; Delivery Cadence</span>
                </h4>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold">
                  Step 2 of 2
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure automated SMS notification cadences (T-72h, T-24h, T-2h mobile QR passes) and brand identifier prefixes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: SMS Gateway Settings */}
              <div className="lg:col-span-2 space-y-5 text-xs">
                
                {/* 1. SMS Brand Identifier Prefix */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">
                      SMS Brand Identifier Prefix *
                    </label>
                    <span className="text-[10px] text-indigo-600 font-bold">Carrier Compliance Required</span>
                  </div>
                  <input
                    type="text"
                    value={smsBrandPrefix}
                    onChange={(e) => setSmsBrandPrefix(e.target.value)}
                    placeholder="e.g. [Lincoln High PTA]"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500">
                    A2P 10DLC regulations mandate identifying your organization at the start of every message to ensure delivery through carrier anti-spam filters.
                  </p>
                </div>

                {/* 2. Automated Delivery Cadence & Event Triggers */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>Automated SMS Delivery Schedule Cadence</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-semibold">T-minus Event Triggers</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    <div 
                      onClick={() => setSmsCadenceT72h(!smsCadenceT72h)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                        smsCadenceT72h ? 'bg-white border-purple-300 shadow-xs' : 'bg-slate-100/60 border-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                        smsCadenceT72h ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {smsCadenceT72h && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">⏰ T-72 Hours Reminder</span>
                        <span className="text-[10px] text-slate-500">3-day briefing with shift recap and venue arrival notes.</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSmsCadenceT24h(!smsCadenceT24h)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                        smsCadenceT24h ? 'bg-white border-purple-300 shadow-xs' : 'bg-slate-100/60 border-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                        smsCadenceT24h ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {smsCadenceT24h && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">⏰ T-24 Hours Reminder</span>
                        <span className="text-[10px] text-slate-500">1-day alert with gate reporting directions &amp; weather advisory.</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSmsCadenceT2h(!smsCadenceT2h)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                        smsCadenceT2h ? 'bg-white border-purple-300 shadow-xs' : 'bg-slate-100/60 border-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                        smsCadenceT2h ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {smsCadenceT2h && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">📱 T-2 Hours Gate Pass Delivery</span>
                        <span className="text-[10px] text-slate-500">Direct mobile link with personal 1-tap QR check-in pass.</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSmsEmergencyBroadcasts(!smsEmergencyBroadcasts)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                        smsEmergencyBroadcasts ? 'bg-white border-purple-300 shadow-xs' : 'bg-slate-100/60 border-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                        smsEmergencyBroadcasts ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {smsEmergencyBroadcasts && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">🚨 Day-Of Emergency Alerts</span>
                        <span className="text-[10px] text-slate-500">Instant SMS broadcast for rain delays and gate reassignments.</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => setSmsTaxReceipts(!smsTaxReceipts)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 sm:col-span-2 ${
                        smsTaxReceipts ? 'bg-white border-purple-300 shadow-xs' : 'bg-slate-100/60 border-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                        smsTaxReceipts ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {smsTaxReceipts && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">🧾 IRS 501(c)(3) Instant Donation Acknowledgement</span>
                        <span className="text-[10px] text-slate-500">Real-time SMS acknowledgement containing statutory tax deduction receipt link.</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. TCPA Opt-Out & Suppression Isolation */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] text-indigo-950 leading-relaxed">
                    <strong>Tenant-Isolated TCPA Compliance:</strong> Inbound carrier <code className="bg-white px-1 rounded font-bold">STOP</code> and <code className="bg-white px-1 rounded font-bold">START</code> keywords are strictly scoped to <code>org_{currentOrg.id}</code>. Unsubscribing from your PTA will never suppress notifications from another community organization.
                  </div>
                </div>

              </div>

              {/* Right Col: Live Smartphone SMS Preview Mockup */}
              <div className="space-y-3">
                <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>Live Smartphone SMS Preview</span>
                  <span className="text-[10px] text-slate-500">GSM-7 Standard</span>
                </div>

                {/* Realistic Phone Frame */}
                <div className="bg-slate-950 p-4 rounded-3xl shadow-xl border-4 border-slate-800 text-white font-sans max-w-xs mx-auto">
                  {/* Speaker / Camera Notch */}
                  <div className="w-24 h-3 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
                  </div>

                  {/* Header Bar */}
                  <div className="text-center pb-2 border-b border-slate-800 mb-3">
                    <span className="text-[10px] text-slate-400 font-medium">Messages • Today 8:00 AM</span>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">REACH Alerts (10DLC)</div>
                  </div>

                  {/* SMS Bubble */}
                  <div className="space-y-3 min-h-[160px] flex flex-col justify-end">
                    <div className="bg-emerald-600 text-white p-3 rounded-2xl rounded-tl-xs text-[11px] leading-relaxed shadow-sm">
                      <strong>{smsBrandPrefix}</strong> Hi Jordan! Your Morning Setup shift starts at 8:00 AM at Gate 2. View Pass: <span className="underline text-emerald-200">https://reachplatform.com/p/x94827</span> Reply STOP to opt out.
                    </div>
                  </div>

                  {/* Character Counter Ribbon */}
                  <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{`${smsBrandPrefix} Hi Jordan! Your Morning Setup shift starts at 8:00 AM at Gate 2. View Pass: https://reachplatform.com/p/x94827 Reply STOP to opt out.`.length} / 160 chars</span>
                    <span className="text-emerald-400 font-bold">1 SMS Segment</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: LIVE INTERACTIVE TEST DISPATCH SANDBOXES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Email Test Dispatcher */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-purple-600" />
                    <span>Live Transactional Email Dispatcher</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Test deliverability and review provider response headers</p>
                </div>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg">
                  {emailProvider.toUpperCase()}
                </span>
              </div>

              <form onSubmit={handleSendTestEmail} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Email Address *</label>
                  <input
                    type="email"
                    required
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="coordinator@lincolnpta.org"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Email Template</label>
                  <select
                    value={testEmailType}
                    onChange={(e) => setTestEmailType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="volunteer_pass">🎟️ 1-Click QR Mobile Check-In Pass</option>
                    <option value="shift_reminder">⏰ T-24h Shift Arrival Instructions</option>
                    <option value="tax_receipt">🧾 IRS 501(c)(3) Official Tax Receipt</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSendingTestEmail}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSendingTestEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSendingTestEmail ? 'Dispatching Test Email...' : 'Send Test Email Now'}</span>
                </button>
              </form>

              {/* Delivery Receipt Log */}
              {lastEmailDispatchLog && (
                <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-[11px] space-y-1">
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase flex items-center justify-between">
                    <span>Dispatch Receipt Log</span>
                    <span className="text-emerald-400">{lastEmailDispatchLog.status}</span>
                  </div>
                  <div className="text-slate-300">Message-ID: &lt;{lastEmailDispatchLog.id}@{customSendingDomain}&gt;</div>
                  <div className="text-slate-300">Timestamp: {lastEmailDispatchLog.timestamp} | Latency: {lastEmailDispatchLog.latencyMs}ms</div>
                </div>
              )}
            </div>

            {/* SMS Test Dispatcher */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>Live A2P 10DLC SMS Dispatcher</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Test carrier acknowledgment and mobile pass links</p>
                </div>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg">
                  10DLC ISV
                </span>
              </div>

              <form onSubmit={handleSendTestSms} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={testSmsPhone}
                    onChange={(e) => setTestSmsPhone(e.target.value)}
                    placeholder="(555) 234-8900"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select SMS Message Type</label>
                  <select
                    value={testSmsType}
                    onChange={(e) => setTestSmsType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="gate_pass">📱 T-2h Gate Check-In Pass &amp; Directions</option>
                    <option value="shift_reminder">⏰ T-24h Shift Arrival Reminder</option>
                    <option value="emergency">🚨 Urgent Day-Of Rain Advisory</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSendingTestSms}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSendingTestSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                  <span>{isSendingTestSms ? 'Dispatching A2P SMS...' : 'Send Test SMS Now'}</span>
                </button>
              </form>

              {/* Delivery Receipt Log */}
              {lastSmsDispatchLog && (
                <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-[11px] space-y-1">
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase flex items-center justify-between">
                    <span>Carrier Delivery Receipt</span>
                    <span className="text-emerald-400">ACK Confirmed</span>
                  </div>
                  <div className="text-slate-300">SID: {lastSmsDispatchLog.sid} | Carrier: Verizon/AT&amp;T</div>
                  <div className="text-slate-300">Timestamp: {lastSmsDispatchLog.timestamp} | Latency: {lastSmsDispatchLog.latencyMs}ms</div>
                </div>
              )}
            </div>

          </div>

          {/* Sticky Bottom Save Action Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Settings apply immediately across all {orgEvents.length} campaigns hosted by {currentOrg.name}.</span>
            </div>

            <button
              type="button"
              onClick={() => handleSaveCommunicationSettings()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Communication Settings</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 9: ADMIN OBSERVABILITY, ACCOUNTS & IMPERSONATION HUB */}
      {activeAdminTab === 'observability' && (
        <AdminObservabilityHub />
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
                <label className="block font-bold text-slate-700 mb-1">Tagline / Mission Subtitle</label>
                <input
                  type="text"
                  value={editEventTagline}
                  onChange={(e) => setEditEventTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Campaign Story & Marketing Pitch (Detailed Overview) *</label>
                <textarea
                  rows={3}
                  required
                  value={editEventDescription}
                  onChange={(e) => setEditEventDescription(e.target.value)}
                  placeholder="Detail what the campaign funds, community impact, attractions, and why volunteers and families should attend..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Google Maps / Directions Link</label>
                <input
                  type="url"
                  value={editEventMapUrl}
                  onChange={(e) => setEditEventMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Virtual / Live Streaming</label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editEventIsVirtual}
                      onChange={(e) => setEditEventIsVirtual(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-purple-600"
                    />
                    <span className="text-[11px] font-bold text-purple-700">Hybrid / Virtual</span>
                  </label>
                </div>
                <input
                  type="url"
                  disabled={!editEventIsVirtual}
                  value={editEventVirtualLink}
                  onChange={(e) => setEditEventVirtualLink(e.target.value)}
                  placeholder={editEventIsVirtual ? "https://zoom.us/j/... or stream link" : "Disabled"}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px] ${
                    editEventIsVirtual ? 'bg-slate-50 text-slate-900' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Global Event Volunteer Dress Code / Attire */}
              <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Global Volunteer Dress Code / Baseline Attire</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Defaults to all departments unless customized</span>
                </div>
                <input
                  type="text"
                  value={editEventDressCode}
                  onChange={(e) => setEditEventDressCode(e.target.value)}
                  placeholder="e.g. Official Event Volunteer T-Shirt (provided) + comfortable sneakers"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Presets:</span>
                  {[
                    '👕 Casual Spirit / T-Shirt & Sneakers',
                    '👔 Business Casual / Staff Polo',
                    '🤵 Black-Tie / Formal Evening Attire',
                    '🦺 Safety Vest & Work Boots',
                    '🧑‍🍳 Food Safe Apron & Closed Shoes'
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setEditEventDressCode(preset)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition shadow-2xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variable Approval Limits & Reminders */}
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Automated Reminder Cadence</label>
                <select
                  value={editReminderCadence}
                  onChange={(e) => setEditReminderCadence(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs"
                >
                  <option value="standard">Standard Cadence (72h, 24h, 2h before shift)</option>
                  <option value="intensive">Intensive Cadence (7d, 72h, 24h, 2h)</option>
                  <option value="same_day">Same-Day Urgent Only (2h before shift)</option>
                  <option value="custom">Custom Schedule</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="editFeeCoverage"
                  checked={editAllowFeeCoverage}
                  onChange={(e) => setEditAllowFeeCoverage(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <label htmlFor="editFeeCoverage" className="font-semibold text-slate-700 cursor-pointer text-xs">
                  Allow Donors & Buyers to Cover 2.9% + 30¢ Processing Fees
                </label>
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

      {/* MODAL: EDIT TEAM MEMBER PROFILE & ROLE */}
      {editingTeamMember && (
        <Modal
          isOpen={Boolean(editingTeamMember)}
          onClose={() => setEditingTeamMember(null)}
          title={`Edit Team Member: ${editingTeamMember.name}`}
          subtitle={`Update contact info, leadership permissions, and committee assignments for ${currentOrg.name}`}
        >
          <form onSubmit={handleSaveEditTeamMember} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editMemberName}
                  onChange={(e) => setEditMemberName(e.target.value)}
                  placeholder="e.g. Rachel Green"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editMemberEmail}
                  onChange={(e) => setEditMemberEmail(e.target.value)}
                  placeholder="rachel@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editMemberPhone}
                  onChange={(e) => setEditMemberPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

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
                Save Member Details
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
