import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, ErrorLogRecord, ErrorSeverity, ErrorResolutionStatus, HealthCheckItem } from '../../types';
import { 
  Shield, Activity, Users, AlertTriangle, CheckCircle2, 
  Server, Cpu, Eye, UserPlus, Lock, Unlock, Key, Trash2, 
  Edit3, RefreshCw, Search, Filter, ArrowUpRight, Zap, 
  Flame, Check, X, Clock, Terminal, Globe, Download,
  Radio, Database, Mail, Smartphone, Layers, AlertCircle,
  ExternalLink, BarChart3, ChevronRight, UserCheck, ShieldAlert,
  Crown, Sparkles, Sliders
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AdminObservabilityHubProps {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminObservabilityHub: React.FC<AdminObservabilityHubProps> = ({
  onNavigateToTab
}) => {
  const { 
    users, currentUser, currentOrg, activeRole, auditLogs, subParts,
    isImpersonating, startImpersonation, stopImpersonation,
    openCommandPalette, adminPromoteToSuperAdmin, adminRevokeSuperAdmin, adminUpdateUserScope,
    adminCreateUser, adminUpdateUser, adminToggleUserSuspension, 
    adminResetUserPassword, adminDeleteUser,
    errorLogs, webVitalsMetrics, apiLatencyMetrics, healthChecks, healthSuiteStatus,
    simulateException, resolveErrorLog, clearErrorLogs, runInfrastructureHealthCheck,
    showToast 
  } = useApp();

  const [activeHubTab, setActiveHubTab] = useState<'accounts' | 'sentry' | 'web_vitals' | 'uptime' | 'audit'>('accounts');

  // Accounts & Users State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUserCode, setResettingUserCode] = useState<{ user: User; code: string } | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [suspensionReasonInput, setSuspensionReasonInput] = useState('');
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('volunteer');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUser2FA, setNewUser2FA] = useState(false);

  // Sentry / Exception State
  const [sentrySeverityFilter, setSentrySeverityFilter] = useState<'all' | ErrorSeverity>('all');
  const [sentryStatusFilter, setSentryStatusFilter] = useState<'all' | ErrorResolutionStatus>('all');
  const [sentrySearchQuery, setSentrySearchQuery] = useState('');
  const [selectedErrorDetail, setSelectedErrorDetail] = useState<ErrorLogRecord | null>(null);
  const [isSimulatingException, setIsSimulatingException] = useState(false);
  const [customSimSeverity, setCustomSimSeverity] = useState<ErrorSeverity>('error');
  const [customSimMessage, setCustomSimMessage] = useState('TypeError: Failed to execute fetch on Window: NetworkError when attempting to fetch resource.');
  const [customSimComponent, setCustomSimComponent] = useState('PublicEventLanding.tsx');

  // Uptime / Health Probing State
  const [isProbingHealth, setIsProbingHealth] = useState(false);

  // Audit Log State
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !userSearchQuery.trim() || 
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(userSearchQuery));
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === 'all' || 
        (userStatusFilter === 'suspended' ? u.accountStatus === 'suspended' : u.accountStatus !== 'suspended');
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userSearchQuery, userRoleFilter, userStatusFilter]);

  // Account Statistics
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.accountStatus !== 'suspended').length;
  const suspendedUsersCount = users.filter(u => u.accountStatus === 'suspended').length;
  const twoFaUsersCount = users.filter(u => u.twoFactorEnabled).length;

  // Filtered Errors List
  const filteredErrors = useMemo(() => {
    return errorLogs.filter(err => {
      const matchSev = sentrySeverityFilter === 'all' || err.severity === sentrySeverityFilter;
      const matchStatus = sentryStatusFilter === 'all' || err.status === sentryStatusFilter;
      const matchSearch = !sentrySearchQuery.trim() ||
        err.message.toLowerCase().includes(sentrySearchQuery.toLowerCase()) ||
        (err.component && err.component.toLowerCase().includes(sentrySearchQuery.toLowerCase())) ||
        (err.userContext?.userName && err.userContext.userName.toLowerCase().includes(sentrySearchQuery.toLowerCase()));
      return matchSev && matchStatus && matchSearch;
    });
  }, [errorLogs, sentrySeverityFilter, sentryStatusFilter, sentrySearchQuery]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = !auditSearchQuery.trim() ||
        log.actorName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearchQuery.toLowerCase());
      const matchAction = auditActionFilter === 'all' || log.action.includes(auditActionFilter);
      return matchSearch && matchAction;
    });
  }, [auditLogs, auditSearchQuery, auditActionFilter]);

  // Handlers
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('error', 'Validation Error', 'Please provide a full legal name and email address.');
      return;
    }
    adminCreateUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || undefined,
      role: newUserRole,
      orgId: currentOrg.id,
      twoFactorEnabled: newUser2FA,
      initialPassword: newUserPassword || undefined
    });
    // Reset
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('volunteer');
    setNewUserPassword('');
    setNewUser2FA(false);
    setIsCreateUserModalOpen(false);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    adminUpdateUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      phone: editingUser.phone,
      role: editingUser.role,
      assignedSubPartIds: editingUser.assignedSubPartIds || [],
      twoFactorEnabled: editingUser.twoFactorEnabled
    });
    setEditingUser(null);
  };

  const handleConfirmSuspension = () => {
    if (!suspendingUser) return;
    adminToggleUserSuspension(suspendingUser.id, suspensionReasonInput.trim() || 'Suspended by Administrator');
    setSuspendingUser(null);
    setSuspensionReasonInput('');
  };

  const handleTriggerSimulatedException = () => {
    simulateException(customSimSeverity, customSimMessage, customSimComponent);
    setIsSimulatingException(false);
  };

  const handleRunDiagnosticsPing = async () => {
    setIsProbingHealth(true);
    await runInfrastructureHealthCheck();
    setIsProbingHealth(false);
  };

  const handleImpersonateClick = (user: User) => {
    const success = startImpersonation(user.id);
    if (success && onNavigateToTab) {
      if (user.role === 'committee_lead') onNavigateToTab('lead_portal');
      else if (user.role === 'event_planner') onNavigateToTab('planner_dashboard');
      else if (user.role === 'vendor') onNavigateToTab('vendor_portal');
      else if (user.role === 'volunteer') onNavigateToTab('public_landing');
      else if (user.role === 'org_admin') onNavigateToTab('org_admin_view');
      else if (user.role === 'kiosk') onNavigateToTab('kiosk_mode');
    }
  };

  const exportAuditLogsToCsv = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action Type', 'Details', 'Organization ID'];
    const rows = filteredAuditLogs.map(l => [
      l.timestamp,
      `"${l.actorName.replace(/"/g, '""')}"`,
      l.actorRole,
      l.action,
      `"${l.details.replace(/"/g, '""')}"`,
      l.orgId
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gatherraise_audit_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Audit Export Downloaded', 'Exported immutable SOC 2 audit ledger to CSV.');
  };

  const getSeverityBadgeClass = (sev: ErrorSeverity) => {
    switch (sev) {
      case 'fatal': return 'bg-rose-600 text-white font-black';
      case 'error': return 'bg-red-500 text-white font-bold';
      case 'warning': return 'bg-amber-500 text-slate-950 font-bold';
      case 'info': return 'bg-blue-500 text-white font-semibold';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'org_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event_planner': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'committee_lead': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'vendor': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'volunteer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'kiosk': return 'bg-slate-100 text-slate-800 border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. TOP HEADER & TELEMETRY SUMMARY */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enterprise Command &amp; Control</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Production Health: 100% SLA</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Admin Observability, Accounts &amp; Diagnostics Hub</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Full-spectrum real-time administrative command: User account lifecycle control, live user impersonation (&quot;See What They See&quot;), Sentry exception diagnostics, Core Web Vitals telemetry, and infrastructure heartbeat monitors.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openCommandPalette}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer hover:scale-105"
              title="Open Persona Impersonation Studio & Command Palette (⌘K)"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>⌘K Impersonation Studio</span>
            </button>
            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Create Account</span>
            </button>
            <button
              onClick={handleRunDiagnosticsPing}
              disabled={isProbingHealth}
              className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              title="Run instant latency and health check probe across all 6 dependencies"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isProbingHealth ? 'animate-spin' : ''}`} />
              <span>{isProbingHealth ? 'Probing...' : 'Ping Diagnostics'}</span>
            </button>
          </div>
        </div>

        {/* Real-Time Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Total Accounts</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">{totalUsersCount}</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{activeUsersCount} Active · {suspendedUsersCount} Suspended</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Uptime SLA</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-300 mt-1">99.99%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">6/6 Systems Operational</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Sentry Errors</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-300 mt-1">
              {errorLogs.filter(e => e.status !== 'resolved').length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{errorLogs.length} Total Logged</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Largest Contentful Paint</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-cyan-300 mt-1">{webVitalsMetrics.lcp.value}s</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Rating: Good (&lt;2.5s)</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>PostgreSQL RLS</span>
              <Database className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black text-purple-300 mt-1">20/20</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Row-Level Security Active</div>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY TAB NAVIGATION */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveHubTab('accounts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            activeHubTab === 'accounts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Accounts &amp; Impersonation ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveHubTab('sentry')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer relative ${
            activeHubTab === 'sentry'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Sentry Exception Diagnostics</span>
          {errorLogs.filter(e => e.status !== 'resolved').length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {errorLogs.filter(e => e.status !== 'resolved').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveHubTab('web_vitals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            activeHubTab === 'web_vitals'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-500" />
          <span>Core Web Vitals &amp; API Latency</span>
        </button>

        <button
          onClick={() => setActiveHubTab('uptime')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            activeHubTab === 'uptime'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4 text-emerald-500" />
          <span>Uptime Heartbeat &amp; Probes</span>
        </button>

        <button
          onClick={() => setActiveHubTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            activeHubTab === 'audit'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4 text-purple-500" />
          <span>SOC 2 Security Audit Stream</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACCOUNTS, USERS & IMPERSONATION HUB                                */}
      {/* ========================================================================= */}
      {activeHubTab === 'accounts' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Quick Impersonation Persona Cards Row */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                    ⚡ 1-Click Persona Impersonation (&quot;See What They See&quot;)
                  </h2>
                  <p className="text-[11px] text-indigo-800">
                    Instantly view and test the application from different role perspectives with complete permission scoping.
                  </p>
                </div>
              </div>

              <button
                onClick={openCommandPalette}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-105 shrink-0"
                title="Open Persona Impersonation Studio with 3D faceted filters (⌘K)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Search All Accounts (⌘K)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {[
                { id: 'user_elena', name: 'Elena Rostova', role: 'org_admin', title: 'Org Super Admin', desc: 'Executive governance & branding' },
                { id: 'user_marcus', name: 'Marcus Vance', role: 'event_planner', title: 'Event Planner / Chair', desc: 'Budgets & approval queues' },
                { id: 'user_sarah', name: 'Sarah Jenkins', role: 'committee_lead', title: 'Food Lead', desc: 'Scoped to Food Department only' },
                { id: 'user_artisan_vendor', name: 'Artisan Bakery', role: 'vendor', title: 'Commercial Vendor', desc: 'Booth selection & invoices' },
                { id: 'user_david_volunteer', name: 'David Chen', role: 'volunteer', title: 'Volunteer / Parent', desc: 'Passes & family registration' }
              ].map(p => {
                const isTargetActive = currentUser.id === p.id;
                return (
                  <div key={p.id} className={`p-3 bg-white rounded-2xl border transition-all ${isTargetActive ? 'ring-2 ring-indigo-600 border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
                    <div className="flex justify-between items-start">
                      <div className="font-extrabold text-xs text-slate-900">{p.name}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getRoleBadgeClass(p.role as UserRole)}`}>
                        {p.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug">{p.desc}</div>
                    <button
                      onClick={() => handleImpersonateClick({ id: p.id, name: p.name, role: p.role as UserRole, email: '', orgId: currentOrg.id })}
                      disabled={isTargetActive}
                      className={`w-full mt-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1 cursor-pointer ${
                        isTargetActive
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isTargetActive ? 'Currently Active' : 'Impersonate'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Filter & Search Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search accounts by name, email, or phone..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="org_admin">Org Super Admin</option>
                  <option value="event_planner">Event Planner</option>
                  <option value="committee_lead">Committee Lead</option>
                  <option value="vendor">Vendor / Sponsor</option>
                  <option value="volunteer">Volunteer / Donor</option>
                  <option value="kiosk">Kiosk Station</option>
                </select>
                <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only ({activeUsersCount})</option>
                  <option value="suspended">Suspended Only ({suspendedUsersCount})</option>
                </select>
                <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold shrink-0">
              Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> accounts
            </div>
          </div>

          {/* Master Accounts Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">User &amp; Identity</th>
                    <th className="px-4 py-3.5">Role &amp; Scope</th>
                    <th className="px-4 py-3.5">Account Status</th>
                    <th className="px-4 py-3.5">Last Active / IP</th>
                    <th className="px-4 py-3.5">Security / 2FA</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold">No user accounts matched your search criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isSuspended = u.accountStatus === 'suspended';
                      const isCurrent = currentUser.id === u.id;

                      return (
                        <tr key={u.id} className={`hover:bg-slate-50/80 transition ${isSuspended ? 'bg-rose-50/30' : ''}`}>
                          {/* User & Contact */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                {u.avatarUrl ? (
                                  <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                  u.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[9px] font-black">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-[11px]">{u.email}</div>
                                {u.phone && <div className="text-slate-400 text-[10px]">{u.phone}</div>}
                              </div>
                            </div>
                          </td>

                          {/* Role & Scope */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider ${getRoleBadgeClass(u.role)}`}>
                              {u.role.replace('_', ' ')}
                            </span>
                            {u.assignedSubPartIds && u.assignedSubPartIds.length > 0 && (
                              <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                                Scoped: {u.assignedSubPartIds.length} Department(s)
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            {isSuspended ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                                  <Lock className="w-3 h-3" />
                                  Suspended
                                </span>
                                {u.suspensionReason && (
                                  <div className="text-[10px] text-rose-600 mt-0.5 max-w-xs truncate" title={u.suspensionReason}>
                                    {u.suspensionReason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </td>

                          {/* Last Active & IP */}
                          <td className="px-4 py-3.5">
                            {u.lastLoginAt ? (
                              <div>
                                <div className="text-slate-800 font-bold text-[11px]">{formatDate(u.lastLoginAt)}</div>
                                <div className="text-slate-400 text-[10px]">
                                  {u.lastIpAddress || '192.168.1.140'} · {u.loginCount || 1} logins
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Never logged in</span>
                            )}
                          </td>

                          {/* 2FA Status */}
                          <td className="px-4 py-3.5">
                            {u.twoFactorEnabled ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                <Shield className="w-3 h-3 text-emerald-600" />
                                2FA Enabled
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Passwordless OTP</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Impersonate */}
                              <button
                                onClick={() => handleImpersonateClick(u)}
                                disabled={isCurrent || isSuspended}
                                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                  isCurrent || isSuspended
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 cursor-pointer'
                                }`}
                                title={isSuspended ? 'Cannot impersonate suspended account' : `Impersonate ${u.name}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Impersonate</span>
                              </button>

                              {/* Grant / Revoke Super Admin */}
                              <button
                                onClick={() => {
                                  if (u.role === 'org_admin') {
                                    adminRevokeSuperAdmin(u.id, 'event_planner');
                                  } else {
                                    adminPromoteToSuperAdmin(u.id);
                                  }
                                }}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  u.role === 'org_admin'
                                    ? 'bg-purple-100 hover:bg-rose-100 text-purple-700 hover:text-rose-700'
                                    : 'bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700'
                                }`}
                                title={u.role === 'org_admin' ? 'Revoke Super Admin privileges' : '👑 Grant App Super Admin Status'}
                              >
                                <Crown className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                title="Edit user details and roles"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  const res = adminResetUserPassword(u.id);
                                  setResettingUserCode({ user: u, code: res.temporaryCode });
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-lg transition cursor-pointer"
                                title="Issue 6-digit emergency password reset passcode"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Reactivate */}
                              <button
                                onClick={() => {
                                  if (isSuspended) {
                                    adminToggleUserSuspension(u.id);
                                  } else {
                                    setSuspendingUser(u);
                                  }
                                }}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isSuspended
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                }`}
                                title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                              >
                                {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeletingUser(u)}
                                disabled={isCurrent}
                                className={`p-1.5 rounded-lg transition ${
                                  isCurrent 
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 cursor-pointer'
                                }`}
                                title="Delete user account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SENTRY EXCEPTION TRACKING & ERROR DIAGNOSTICS                      */}
      {/* ========================================================================= */}
      {activeHubTab === 'sentry' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Controls & Simulator Header */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">
                  🚨 Real-Time Sentry Exception Ingestion &amp; Diagnostics Engine
                </h2>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Captures client-side React exceptions, unhandled Promise rejections, and serverless API faults with stack traces and prior user breadcrumbs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimulatingException(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer hover:scale-105"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>⚡ Simulate Sentry Exception</span>
              </button>

              <button
                onClick={clearErrorLogs}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Clear Feed
              </button>
            </div>
          </div>

          {/* Sentry Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={sentrySearchQuery}
                  onChange={(e) => setSentrySearchQuery(e.target.value)}
                  placeholder="Search exceptions by message, component, or user..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Severity Filter */}
              <div className="relative">
                <select
                  value={sentrySeverityFilter}
                  onChange={(e) => setSentrySeverityFilter(e.target.value as any)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Severities</option>
                  <option value="fatal">Fatal Only</option>
                  <option value="error">Errors Only</option>
                  <option value="warning">Warnings Only</option>
                  <option value="info">Info Logs Only</option>
                </select>
                <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={sentryStatusFilter}
                  onChange={(e) => setSentryStatusFilter(e.target.value as any)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="unresolved">Unresolved</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="ignored">Ignored</option>
                </select>
                <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold shrink-0">
              Showing <strong>{filteredErrors.length}</strong> logged issues
            </div>
          </div>

          {/* Exceptions Feed */}
          <div className="space-y-3">
            {filteredErrors.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-extrabold text-slate-800 text-sm">No Active Exceptions Found</h3>
                <p className="text-xs text-slate-500 mt-1">Zero unhandled runtime errors match your current filter settings.</p>
              </div>
            ) : (
              filteredErrors.map(err => {
                return (
                  <div 
                    key={err.id} 
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-4 shadow-xs transition hover:shadow-md space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getSeverityBadgeClass(err.severity)}`}>
                          {err.severity}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 font-mono">
                          {err.component || 'Application Runtime'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(err.timestamp)} ({err.occurrencesCount} occurrence{err.occurrencesCount > 1 ? 's' : ''})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={err.status}
                          onChange={(e) => resolveErrorLog(err.id, e.target.value as ErrorResolutionStatus)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-700 cursor-pointer focus:outline-none"
                        >
                          <option value="unresolved">Unresolved</option>
                          <option value="investigating">Investigating</option>
                          <option value="resolved">Resolved ✓</option>
                          <option value="ignored">Ignored</option>
                        </select>

                        <button
                          onClick={() => setSelectedErrorDetail(err)}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Inspect Stack Trace</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 text-rose-300 p-3 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                      <code>{err.message}</code>
                    </div>

                    {err.userContext && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Affected User: <strong>{err.userContext.userName}</strong> ({err.userContext.role})</span>
                        {err.deviceContext && (
                          <span>Environment: <strong>{err.deviceContext.browser}</strong> on {err.deviceContext.os}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CORE WEB VITALS & REAL USER TELEMETRY                              */}
      {/* ========================================================================= */}
      {activeHubTab === 'web_vitals' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Core Web Vitals Gauges */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-600" />
                  <span>Core Web Vitals Performance Telemetry (Vercel Speed Insights)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-user experience metrics collected from live desktop and mobile devices.</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                100% Passed Google CWV
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">LCP (Largest Contentful Paint)</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{webVitalsMetrics.lcp.value}s</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Good (Threshold &lt; 2.5s)</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '44%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">INP (Interaction to Next Paint)</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{webVitalsMetrics.inp.value}ms</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Good (Threshold &lt; 200ms)</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">CLS (Cumulative Layout Shift)</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{webVitalsMetrics.cls.value}</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Good (Threshold &lt; 0.1)</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '5%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">FCP (First Contentful Paint)</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{webVitalsMetrics.fcp.value}s</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Good (Threshold &lt; 1.8s)</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">TTFB (Time to First Byte)</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{webVitalsMetrics.ttfb.value}ms</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Good (Threshold &lt; 800ms)</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* API Latency Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  ⚡ API Endpoint Latency &amp; Throughput Percentiles
                </h3>
                <p className="text-[11px] text-slate-500">Live response times measured at the serverless edge runtime.</p>
              </div>
              <span className="text-xs font-bold text-slate-500">0.0% Error Rate</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Endpoint Route</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">P50 (Median)</th>
                    <th className="px-4 py-3">P95</th>
                    <th className="px-4 py-3">P99</th>
                    <th className="px-4 py-3">Throughput</th>
                    <th className="px-5 py-3 text-right">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {apiLatencyMetrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3 font-bold text-slate-900">{m.endpoint}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{m.method}</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">{m.p50Ms} ms</td>
                      <td className="px-4 py-3 text-slate-700">{m.p95Ms} ms</td>
                      <td className="px-4 py-3 text-slate-700">{m.p99Ms} ms</td>
                      <td className="px-4 py-3 text-slate-700">{m.requestsPerSec} req/sec</td>
                      <td className="px-5 py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ Healthy
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Device & Browser Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Device Distribution</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Desktop (macOS / Windows)</span>
                    <span className="font-bold">62%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Mobile (iOS / Android)</span>
                    <span className="font-bold">34%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '34%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Tablet &amp; Door Kiosks</span>
                    <span className="font-bold">4%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '4%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Browser Telemetry</h4>
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Google Chrome</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">68.4%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Apple Safari</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">23.8%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Mozilla Firefox</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">4.9%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Microsoft Edge</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">2.9%</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UPTIME HEARTBEAT & INFRASTRUCTURE PROBES                           */}
      {/* ========================================================================= */}
      {activeHubTab === 'uptime' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Heartbeat Action Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300">
                  All Systems Operational · 100% Architecture SLA
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Real-time active telemetry probes across database pools, edge runtime nodes, communication gateways, and disaster recovery snapshot storage.
              </p>
            </div>

            <button
              onClick={handleRunDiagnosticsPing}
              disabled={isProbingHealth}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-105 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProbingHealth ? 'animate-spin' : ''}`} />
              <span>{isProbingHealth ? 'Pinging Infrastructure...' : 'Run Diagnostics Ping'}</span>
            </button>
          </div>

          {/* Infrastructure Dependency Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthChecks.map(check => {
              return (
                <div key={check.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        {check.category === 'database' && <Database className="w-4 h-4" />}
                        {check.category === 'edge_runtime' && <Server className="w-4 h-4" />}
                        {check.category === 'email_gateway' && <Mail className="w-4 h-4" />}
                        {check.category === 'sms_gateway' && <Smartphone className="w-4 h-4" />}
                        {check.category === 'queue_worker' && <Layers className="w-4 h-4" />}
                        {check.category === 'backup_storage' && <Shield className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{check.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{check.region || 'Global'}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Operational
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{check.details}</p>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-semibold text-slate-500">
                    <span>Latency: <strong className="text-slate-900 font-mono">{check.latencyMs} ms</strong></span>
                    <span>Uptime: <strong className="text-emerald-700 font-bold">{check.uptimePercent}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SOC 2 SECURITY AUDIT STREAM                                        */}
      {/* ========================================================================= */}
      {activeHubTab === 'audit' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  placeholder="Search SOC 2 audit ledger by actor, action type, or details..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="relative">
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="all">All Action Types</option>
                  <option value="IMPERSONATION">User Impersonation Events</option>
                  <option value="USER">User Account Management</option>
                  <option value="INVITE">Team Invitations</option>
                  <option value="PASSWORD">Password &amp; OTP Resets</option>
                </select>
                <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={exportAuditLogsToCsv}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export SOC 2 CSV</span>
            </button>
          </div>

          {/* Audit Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Actor</th>
                    <th className="px-4 py-3.5">Action Event</th>
                    <th className="px-5 py-3.5">Audit Record Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-400">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold">No audit entries found matching criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{log.actorName}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">{log.actorRole}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            log.action.includes('IMPERSONATION') 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : log.action.includes('DELETE') || log.action.includes('SUSPEND')
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-50 text-indigo-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600 leading-relaxed font-sans text-xs">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE USER ACCOUNT                                              */}
      {/* ========================================================================= */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Create New Account</h3>
                  <p className="text-[11px] text-slate-500">Provision a verified user account with assigned RBAC roles.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="jordan.m@example.org"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="org_admin">Org Super Admin</option>
                    <option value="event_planner">Event Planner / Chair</option>
                    <option value="committee_lead">Committee Lead</option>
                    <option value="vendor">Vendor / Sponsor</option>
                    <option value="volunteer">Volunteer / Supporter</option>
                    <option value="kiosk">Door Kiosk Station</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password (Optional / Defaults to Passwordless OTP)</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Leave blank for passwordless 6-digit OTP login"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newUser2fa"
                  checked={newUser2FA}
                  onChange={(e) => setNewUser2FA(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="newUser2fa" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Require Mandatory Two-Factor Authentication (2FA) for this user
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT USER ACCOUNT                                                */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Edit User Account</h3>
                  <p className="text-[11px] text-slate-500">Modify contact details and role permissions.</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="org_admin">Org Super Admin</option>
                    <option value="event_planner">Event Planner / Chair</option>
                    <option value="committee_lead">Committee Lead</option>
                    <option value="vendor">Vendor / Sponsor</option>
                    <option value="volunteer">Volunteer / Supporter</option>
                    <option value="kiosk">Door Kiosk Station</option>
                  </select>
                </div>
              </div>

              {/* Committee Department Scoping (if Lead) */}
              {editingUser.role === 'committee_lead' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-amber-950">
                    🍴 Assigned Committee Departments
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                    {subParts.map(sp => {
                      const isChecked = (editingUser.assignedSubPartIds || []).includes(sp.id);
                      return (
                        <label
                          key={sp.id}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            isChecked
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const currentIds = editingUser.assignedSubPartIds || [];
                              const newIds = e.target.checked
                                ? [...currentIds, sp.id]
                                : currentIds.filter(id => id !== sp.id);
                              setEditingUser({ ...editingUser, assignedSubPartIds: newIds });
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="truncate">{sp.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editUser2fa"
                  checked={editingUser.twoFactorEnabled || false}
                  onChange={(e) => setEditingUser({ ...editingUser, twoFactorEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="editUser2fa" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Require Mandatory Two-Factor Authentication (2FA)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SUSPEND USER CONFIRMATION                                        */}
      {/* ========================================================================= */}
      {suspendingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Suspend Account Access</h3>
                <p className="text-xs text-slate-500">Deactivate login credentials for {suspendingUser.name}.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When suspended, this user will be immediately blocked from signing in, claiming volunteer shifts, or modifying committee data.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Suspension *</label>
              <textarea
                value={suspensionReasonInput}
                onChange={(e) => setSuspensionReasonInput(e.target.value)}
                placeholder="e.g. Unverified Certificate of Insurance (COI) / Terms of Service violation..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspension}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TEMPORARY PASSWORD / OTP ISSUED                                   */}
      {/* ========================================================================= */}
      {resettingUserCode && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-slate-900 text-base">Emergency Passcode Issued</h3>
              <p className="text-xs text-slate-500 mt-1">
                Generated temporary 6-digit verification code for <strong>{resettingUserCode.user.name}</strong> ({resettingUserCode.user.email}).
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl text-amber-400 font-mono text-2xl font-black tracking-widest border border-slate-800">
              {resettingUserCode.code}
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              This code expires in 15 minutes and has been recorded in the SOC 2 security audit ledger.
            </p>

            <button
              onClick={() => setResettingUserCode(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
            >
              Done / Copy to User
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE USER CONFIRMATION                                         */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Confirm Permanent Deletion</h3>
                <p className="text-xs text-slate-500">Purge account for {deletingUser.name} ({deletingUser.email}).</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this user account? All associated login sessions will be terminated immediately.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  adminDeleteUser(deletingUser.id);
                  setDeletingUser(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: SENTRY EXCEPTION SIMULATOR                                       */}
      {/* ========================================================================= */}
      {isSimulatingException && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-600 text-white flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Simulate Sentry Exception</h3>
                  <p className="text-[11px] text-slate-500">Test the real-time exception tracking and ingestion pipeline.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSimulatingException(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preset Quick Scenarios</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSimSeverity('fatal');
                      setCustomSimMessage('PostgreSQLError: Connection pool saturated (500/500 connections active).');
                      setCustomSimComponent('api/_lib/db.ts');
                    }}
                    className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl text-[11px] font-bold text-left text-slate-800 transition"
                  >
                    🔥 Fatal DB Pool Saturation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSimSeverity('error');
                      setCustomSimMessage('TypeError: Cannot read properties of undefined (reading calculateTaxReceiptDeduction)');
                      setCustomSimComponent('ReportsExportCenter.tsx');
                    }}
                    className="p-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl text-[11px] font-bold text-left text-slate-800 transition"
                  >
                    ⚠️ Unhandled Render Exception
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSimSeverity('warning');
                      setCustomSimMessage('RateLimitExceededException: IP 198.51.100.42 triggered auth throttle');
                      setCustomSimComponent('api/_lib/rateLimiter.ts');
                    }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-left text-slate-800 transition"
                  >
                    🛑 Rate Limit Throttle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSimSeverity('error');
                      setCustomSimMessage('StripeGatewayTimeout: Webhook delivery exceeded 5000ms SLA');
                      setCustomSimComponent('api/payments/webhook.ts');
                    }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-left text-slate-800 transition"
                  >
                    💳 Payment Gateway Timeout
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level</label>
                <select
                  value={customSimSeverity}
                  onChange={(e) => setCustomSimSeverity(e.target.value as ErrorSeverity)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="fatal">FATAL (Service Halting)</option>
                  <option value="error">ERROR (Functional Exception)</option>
                  <option value="warning">WARNING (Degraded Performance)</option>
                  <option value="info">INFO (Diagnostic Telemetry)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Error Message Payload</label>
                <textarea
                  value={customSimMessage}
                  onChange={(e) => setCustomSimMessage(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Component Context</label>
                <input
                  type="text"
                  value={customSimComponent}
                  onChange={(e) => setCustomSimComponent(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSimulatingException(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerSimulatedException}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                Dispatch Sentry Exception Payload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: SENTRY ERROR DETAILS INSPECTOR                                   */}
      {/* ========================================================================= */}
      {selectedErrorDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getSeverityBadgeClass(selectedErrorDetail.severity)}`}>
                    {selectedErrorDetail.severity}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    ID: {selectedErrorDetail.id}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-sm mt-1">
                  {selectedErrorDetail.component || 'Application Fault'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedErrorDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Exception Message:</div>
              <div className="p-3 bg-slate-950 text-rose-300 font-mono text-xs rounded-xl border border-slate-800">
                {selectedErrorDetail.message}
              </div>
            </div>

            {selectedErrorDetail.stackTrace && (
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1">Stack Trace:</div>
                <pre className="p-3 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-48">
                  {selectedErrorDetail.stackTrace}
                </pre>
              </div>
            )}

            {selectedErrorDetail.breadcrumbs && selectedErrorDetail.breadcrumbs.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1">Prior User Breadcrumbs Trail:</div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                  {selectedErrorDetail.breadcrumbs.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2 text-slate-700">
                      <span className="text-slate-400">{b.timestamp.split('T')[1]?.split('.')[0] || b.timestamp}</span>
                      <span className="px-1.5 py-0.2 bg-slate-200 rounded text-[9px] font-bold text-slate-800 uppercase">{b.category}</span>
                      <span>{b.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedErrorDetail(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
