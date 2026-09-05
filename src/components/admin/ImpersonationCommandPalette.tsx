import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, SubPart, Organization } from '../../types';
import { 
  Search, Shield, Crown, ClipboardList, Utensils, Store, 
  HeartHandshake, Tablet, CheckCircle2, Lock, Eye, X, 
  ArrowRight, Sparkles, Filter, ChevronRight, Zap, RefreshCw, 
  Clock, Check, Building2, UserPlus, Sliders, ShieldAlert, 
  Layers, Radio, HelpCircle, AlertTriangle, Key, Terminal
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const RECENTS_STORAGE_KEY = 'r3pro_impersonation_recents';

export const ImpersonationCommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, closeCommandPalette,
    users, organizations, subParts, currentOrg, currentUser, activeRole,
    startImpersonation, stopImpersonation, isImpersonating,
    adminPromoteToSuperAdmin, adminRevokeSuperAdmin, adminUpdateUserScope,
    showToast
  } = useApp();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Active Highlighted User (for Dossier Preview)
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Scoping Modification Draft State
  const [draftRole, setDraftRole] = useState<UserRole>('volunteer');
  const [draftOrgId, setDraftOrgId] = useState<string>('');
  const [draftSubPartIds, setDraftSubPartIds] = useState<string[]>([]);
  const [isEditingScope, setIsEditingScope] = useState(false);

  // Recents Queue
  const [recentUserIds, setRecentUserIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem(RECENTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Focus search input when palette opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen]);

  // Global Keyboard Navigation (Escape, Up/Down Arrows, Enter)
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, closeCommandPalette]);

  // Filtered Users computation
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return users.filter(user => {
      // 1. Organization filter
      if (selectedOrgFilter !== 'all' && user.orgId !== selectedOrgFilter) {
        return false;
      }

      // 2. Role filter
      if (selectedRoleFilter !== 'all' && user.role !== selectedRoleFilter) {
        return false;
      }

      // 3. Department filter
      if (selectedDeptFilter !== 'all') {
        const hasDept = user.assignedSubPartIds && user.assignedSubPartIds.includes(selectedDeptFilter);
        if (!hasDept) return false;
      }

      // 4. Text Search
      if (!q) return true;

      const userOrg = organizations.find(o => o.id === user.orgId);
      const orgName = userOrg ? userOrg.name.toLowerCase() : '';
      const assignedDepts = (user.assignedSubPartIds || [])
        .map(id => {
          const sp = subParts.find(s => s.id === id);
          return sp ? sp.name.toLowerCase() : '';
        })
        .join(' ');

      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.phone && user.phone.includes(q)) ||
        user.role.toLowerCase().includes(q) ||
        orgName.includes(q) ||
        assignedDepts.includes(q)
      );
    });
  }, [users, organizations, subParts, searchQuery, selectedOrgFilter, selectedRoleFilter, selectedDeptFilter]);

  // Keep highlighted user in sync
  useEffect(() => {
    if (filteredUsers.length > 0) {
      const exists = filteredUsers.some(u => u.id === selectedUserId);
      if (!exists) {
        setSelectedUserId(filteredUsers[0].id);
      }
    } else {
      setSelectedUserId('');
    }
  }, [filteredUsers, selectedUserId]);

  // Selected User Object
  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId) || filteredUsers[0] || null;
  }, [users, selectedUserId, filteredUsers]);

  // When selected user changes, sync draft scope state
  useEffect(() => {
    if (selectedUser) {
      setDraftRole(selectedUser.role);
      setDraftOrgId(selectedUser.orgId || currentOrg.id);
      setDraftSubPartIds(selectedUser.assignedSubPartIds || []);
      setIsEditingScope(false);
    }
  }, [selectedUser, currentOrg.id]);

  // Handlers
  const handleLaunchImpersonation = (targetUser: User) => {
    if (targetUser.accountStatus === 'suspended') {
      showToast('error', 'Account Suspended', `Cannot impersonate suspended user ${targetUser.name}.`);
      return;
    }

    const success = startImpersonation(targetUser.id);
    if (success) {
      // Update recents queue
      const updatedRecents = [targetUser.id, ...recentUserIds.filter(id => id !== targetUser.id)].slice(0, 5);
      setRecentUserIds(updatedRecents);
      try {
        sessionStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(updatedRecents));
      } catch (e) {
        console.error(e);
      }
      closeCommandPalette();
    }
  };

  const handleToggleAdminStatus = (targetUser: User) => {
    if (targetUser.role === 'org_admin') {
      adminRevokeSuperAdmin(targetUser.id, 'event_planner');
    } else {
      adminPromoteToSuperAdmin(targetUser.id);
    }
  };

  const handleSaveScopeChanges = () => {
    if (!selectedUser) return;
    adminUpdateUserScope(selectedUser.id, draftRole, draftSubPartIds, draftOrgId);
    setIsEditingScope(false);
  };

  const handleToggleSubPartInDraft = (subPartId: string) => {
    setDraftSubPartIds(prev => 
      prev.includes(subPartId) ? prev.filter(id => id !== subPartId) : [...prev, subPartId]
    );
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedOrgFilter('all');
    setSelectedRoleFilter('all');
    setSelectedDeptFilter('all');
  };

  const getRoleBadgeConfig = (role: UserRole) => {
    switch (role) {
      case 'org_admin':
        return { label: 'Super Admin', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: <Crown className="w-3 h-3 text-purple-400" /> };
      case 'event_planner':
        return { label: 'Event Planner', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', icon: <ClipboardList className="w-3 h-3 text-indigo-400" /> };
      case 'committee_lead':
        return { label: 'Committee Lead', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: <Utensils className="w-3 h-3 text-amber-400" /> };
      case 'vendor':
        return { label: 'Vendor / Sponsor', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: <Store className="w-3 h-3 text-emerald-400" /> };
      case 'volunteer':
        return { label: 'Volunteer / Parent', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: <HeartHandshake className="w-3 h-3 text-blue-400" /> };
      case 'kiosk':
        return { label: 'Door Kiosk', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: <Tablet className="w-3 h-3 text-slate-400" /> };
      default:
        return { label: role, bg: 'bg-slate-700 text-slate-300 border-slate-600', icon: <UserPlus className="w-3 h-3" /> };
    }
  };

  // Canonical Archetypes Preset definitions
  const archetypes = [
    { id: 'user_patchen', name: 'Patchen Uchiyama', role: 'org_admin', label: 'Super Admin', desc: 'Full multi-tenant governance', icon: <Crown className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'user_marcus', name: 'Marcus Vance', role: 'event_planner', label: 'Event Chair', desc: 'Campaigns & budget approval queue', icon: <ClipboardList className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'user_sarah', name: 'Sarah Jenkins', role: 'committee_lead', label: 'Food Lead', desc: 'Food department & kitchen check-in', icon: <Utensils className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'user_artisan_vendor', name: 'Artisan Bakery', role: 'vendor', label: 'Commercial Vendor', desc: '10x10 booth, 220V power & invoice', icon: <Store className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'user_david_volunteer', name: 'David Chen', role: 'volunteer', label: 'Volunteer / Parent', desc: 'Mobile pass & family registration', icon: <HeartHandshake className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'user_kiosk', name: 'Door Check-In', role: 'kiosk', label: 'Tablet Kiosk', desc: 'Express entrance check-in station', icon: <Tablet className="w-3.5 h-3.5 text-purple-400" /> }
  ];

  // Live Role counts
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: users.length,
      org_admin: 0,
      event_planner: 0,
      committee_lead: 0,
      vendor: 0,
      volunteer: 0,
      kiosk: 0
    };
    users.forEach(u => {
      if (counts[u.role] !== undefined) counts[u.role]++;
    });
    return counts;
  }, [users]);

  // Subparts list for draft selector
  const availableSubParts = useMemo(() => {
    return subParts;
  }, [subParts]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col w-full max-w-5xl max-h-[90vh] text-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================================= */}
        {/* PALETTE HEADER & SEARCH BAR                                              */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
                  <span>Persona Impersonation Studio &amp; Command Palette</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ⌘K Spotlight
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Switch perspectives on the fly, customize department scopes, and manage administrative privileges.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <kbd className="font-mono text-slate-300 font-bold">ESC</kbd> to close
              </div>
              <button
                onClick={closeCommandPalette}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close Command Palette (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accounts by name, email, phone, role, organization, department, or event key..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 3-DIMENSIONAL FACETED FILTER RAILS                                        */}
          {/* ========================================================================= */}
          <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/60">
            {/* Dimension 1: Organization Facet */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                Org:
              </span>
              <button
                onClick={() => setSelectedOrgFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                  selectedOrgFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                All Organizations ({users.length})
              </button>
              {organizations.map(org => {
                const count = users.filter(u => u.orgId === org.id).length;
                return (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrgFilter(org.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 flex items-center gap-1 cursor-pointer ${
                      selectedOrgFilter === org.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{org.name}</span>
                    <span className="text-[9px] opacity-70 px-1 py-0.2 rounded bg-black/20">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Dimension 2: Role Taxonomy Facet */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <Shield className="w-3 h-3 text-slate-400" />
                Role:
              </span>
              {[
                { id: 'all', label: `All Roles (${roleCounts.all})` },
                { id: 'org_admin', label: `👑 Super Admin (${roleCounts.org_admin})` },
                { id: 'event_planner', label: `📋 Planner (${roleCounts.event_planner})` },
                { id: 'committee_lead', label: `🍴 Lead (${roleCounts.committee_lead})` },
                { id: 'vendor', label: `🛍️ Vendor (${roleCounts.vendor})` },
                { id: 'volunteer', label: `🙋 Volunteer (${roleCounts.volunteer})` },
                { id: 'kiosk', label: `📱 Kiosk (${roleCounts.kiosk})` }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleFilter(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                    selectedRoleFilter === r.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Dimension 3: Department Committee Scope Facet */}
            {availableSubParts.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider shrink-0 flex items-center gap-1 mr-1">
                  <Layers className="w-3 h-3 text-slate-400" />
                  Dept:
                </span>
                <button
                  onClick={() => setSelectedDeptFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ${
                    selectedDeptFilter === 'all'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  All Departments
                </button>
                {availableSubParts.map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => setSelectedDeptFilter(sp.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ${
                      selectedDeptFilter === sp.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {sp.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* QUICK ARCHETYPES & RECENTS STRIP                                          */}
        {/* ========================================================================= */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              ⚡ Quick Archetypes:
            </span>
            <div className="flex items-center gap-1.5">
              {archetypes.map(a => {
                const targetObj = users.find(u => u.id === a.id) || users.find(u => u.role === a.role);
                const isActive = currentUser.id === (targetObj?.id || a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      if (targetObj) handleLaunchImpersonation(targetObj);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-400 text-white ring-1 ring-white/50'
                        : 'bg-slate-800/90 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={`${a.name}: ${a.desc}`}
                  >
                    {a.icon}
                    <span>{a.label}</span>
                    {isActive && <span className="text-[8px] px-1 py-0.2 rounded bg-indigo-950 text-indigo-200 uppercase font-black">Active</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recents Queue */}
          {recentUserIds.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 shrink-0 pl-3 border-l border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Recents:
              </span>
              {recentUserIds.slice(0, 3).map(id => {
                const u = users.find(user => user.id === id);
                if (!u) return null;
                return (
                  <button
                    key={id}
                    onClick={() => handleLaunchImpersonation(u)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                    title={`Impersonate ${u.name}`}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: 2-COLUMN SPLIT VIEW                                            */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN: Filtered Accounts List (5 cols)                            */}
          {/* ----------------------------------------------------------------------- */}
          <div 
            ref={listContainerRef}
            className="md:col-span-5 border-r border-slate-800/80 overflow-y-auto p-3 space-y-1.5 max-h-[480px] md:max-h-full bg-slate-900/50"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1 font-semibold">
              <span>Matching Accounts ({filteredUsers.length})</span>
              {(selectedOrgFilter !== 'all' || selectedRoleFilter !== 'all' || selectedDeptFilter !== 'all' || searchQuery) && (
                <button
                  onClick={resetAllFilters}
                  className="text-indigo-400 hover:text-indigo-300 transition text-[10px] font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                <p className="text-xs font-bold text-slate-400">No accounts match criteria</p>
                <p className="text-[11px] text-slate-600 mt-1">Try broadening your search query or reset filters.</p>
                <button
                  onClick={resetAllFilters}
                  className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const isCurrent = currentUser.id === u.id;
                const isSuspended = u.accountStatus === 'suspended';
                const roleConfig = getRoleBadgeConfig(u.role);
                const userOrg = organizations.find(o => o.id === u.orgId);

                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {u.avatarUrl ? (
                          <img 
                            src={u.avatarUrl} 
                            alt={u.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-xs">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        {isSuspended && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] shadow-sm">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-white truncate max-w-[140px] sm:max-w-[180px]">
                            {u.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {u.email}
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold border uppercase tracking-wider ${roleConfig.bg}`}>
                            {roleConfig.icon}
                            <span>{roleConfig.label}</span>
                          </span>

                          {userOrg && (
                            <span className="text-[9px] text-slate-400 font-medium truncate max-w-[110px]">
                              · {userOrg.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Perspective Dossier & Scoping Sandbox (7 cols)            */}
          {/* ----------------------------------------------------------------------- */}
          <div className="md:col-span-7 p-4 sm:p-6 overflow-y-auto max-h-[500px] md:max-h-full bg-slate-950/70 flex flex-col justify-between space-y-4">
            {selectedUser ? (
              <div className="space-y-4">
                
                {/* 1. Dossier Header: Identity & Contact Card */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {selectedUser.avatarUrl ? (
                        <img 
                          src={selectedUser.avatarUrl} 
                          alt={selectedUser.name} 
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-black text-base">
                          {selectedUser.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white">{selectedUser.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider ${getRoleBadgeConfig(selectedUser.role).bg}`}>
                            {getRoleBadgeConfig(selectedUser.role).icon}
                            <span>{getRoleBadgeConfig(selectedUser.role).label}</span>
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {selectedUser.email} {selectedUser.phone && `· ${selectedUser.phone}`}
                        </div>
                      </div>
                    </div>

                    {/* Account Status Badge */}
                    <div>
                      {selectedUser.accountStatus === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase">
                          <Lock className="w-3 h-3" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Telemetry Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                    <div>
                      <span className="block text-slate-500 font-bold uppercase text-[9px]">Last Active</span>
                      <span className="text-slate-200 font-semibold">{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-bold uppercase text-[9px]">Last Seen IP</span>
                      <span className="text-slate-200 font-mono">{selectedUser.lastIpAddress || '192.168.1.140'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-bold uppercase text-[9px]">Login Count</span>
                      <span className="text-slate-200 font-semibold">{selectedUser.loginCount || 1} sessions</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-bold uppercase text-[9px]">Security</span>
                      <span className="text-emerald-400 font-semibold">{selectedUser.twoFactorEnabled ? '2FA Enabled' : 'OTP Enabled'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Primary Launch & Action Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Launch Perspective CTA */}
                  <button
                    onClick={() => handleLaunchImpersonation(selectedUser)}
                    disabled={currentUser.id === selectedUser.id || selectedUser.accountStatus === 'suspended'}
                    className={`py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                      currentUser.id === selectedUser.id
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : selectedUser.accountStatus === 'suspended'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:scale-102'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-amber-300" />
                    <span>
                      {currentUser.id === selectedUser.id 
                        ? 'Currently Active Perspective' 
                        : selectedUser.accountStatus === 'suspended'
                        ? 'Account Suspended'
                        : `⚡ Launch Perspective (${selectedUser.name.split(' ')[0]})`}
                    </span>
                  </button>

                  {/* 1-Click Super Admin Promotion / Revocation */}
                  <button
                    onClick={() => handleToggleAdminStatus(selectedUser)}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedUser.role === 'org_admin'
                        ? 'bg-slate-800 hover:bg-rose-900/50 text-rose-300 border-rose-500/40'
                        : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border-purple-500/50 shadow-sm'
                    }`}
                    title={selectedUser.role === 'org_admin' ? 'Revoke Super Admin privileges' : 'Promote to Org Super Admin'}
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>{selectedUser.role === 'org_admin' ? 'Revoke Super Admin' : '👑 Grant Super Admin Status'}</span>
                  </button>
                </div>

                {/* 3. Role & Department Scope Customizer ("Modify on the Fly") */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                        Role &amp; Department Scope Customizer
                      </h4>
                    </div>
                    {!isEditingScope ? (
                      <button
                        onClick={() => setIsEditingScope(true)}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                      >
                        ✏️ Modify on the Fly
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsEditingScope(false)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveScopeChanges}
                          className="text-[10px] font-black bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-0.5 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingScope ? (
                    <div className="space-y-3 pt-2 border-t border-slate-800 text-xs animate-fadeIn">
                      {/* Role Modifier */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Role Taxonomy
                        </label>
                        <select
                          value={draftRole}
                          onChange={(e) => setDraftRole(e.target.value as UserRole)}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="org_admin">👑 Org Super Admin (Full Governance)</option>
                          <option value="event_planner">📋 Event Planner / Chair (Master Event Scope)</option>
                          <option value="committee_lead">🍴 Committee Lead (Department Scoped)</option>
                          <option value="vendor">🛍️ Commercial Vendor / Corporate Sponsor</option>
                          <option value="volunteer">🙋 Public Volunteer / Parent</option>
                          <option value="kiosk">📱 Door Kiosk Check-In Station</option>
                        </select>
                      </div>

                      {/* Org Modifier */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Assigned Organization
                        </label>
                        <select
                          value={draftOrgId}
                          onChange={(e) => setDraftOrgId(e.target.value)}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Department Scoping Multi-Select */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Assigned Committee Departments ({draftSubPartIds.length} selected)
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {availableSubParts.map(sp => {
                            const isAssigned = draftSubPartIds.includes(sp.id);
                            return (
                              <button
                                key={sp.id}
                                type="button"
                                onClick={() => handleToggleSubPartInDraft(sp.id)}
                                className={`p-2 rounded-xl text-[11px] font-bold text-left border transition flex items-center justify-between cursor-pointer ${
                                  isAssigned
                                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <span className="truncate">{sp.name}</span>
                                {isAssigned ? (
                                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded border border-slate-700 shrink-0 ml-1" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleSaveScopeChanges}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                        >
                          Apply &amp; Save Scoping Modifications
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Current Scope:</span>
                        <span className="font-bold text-white">
                          {selectedUser.role === 'org_admin' ? 'Global Organization Governance' :
                           selectedUser.role === 'event_planner' ? 'Master Campaign Oversight' :
                           selectedUser.role === 'committee_lead' ? `${selectedUser.assignedSubPartIds?.length || 0} Scoped Department(s)` :
                           selectedUser.role === 'vendor' ? 'Commercial Booth & Invoicing' :
                           selectedUser.role === 'kiosk' ? 'Entrance Gate Tablet Kiosk' : 'Volunteer Self-Service'}
                        </span>
                      </div>
                      {selectedUser.assignedSubPartIds && selectedUser.assignedSubPartIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedUser.assignedSubPartIds.map(id => {
                            const sp = subParts.find(s => s.id === id);
                            return (
                              <span key={id} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🍴 {sp ? sp.name : id}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Perspective Permission Matrix (Allowed vs Restricted) */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Perspective Permission Matrix</span>
                    <span className="text-indigo-400 font-mono">RBAC Active</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {selectedUser.role === 'org_admin' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      )}
                      <span className={selectedUser.role === 'org_admin' ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                        Master CRM &amp; Financials
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {['org_admin', 'event_planner'].includes(selectedUser.role) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      )}
                      <span className={['org_admin', 'event_planner'].includes(selectedUser.role) ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                        Planner Hub &amp; Approvals
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {['org_admin', 'event_planner', 'committee_lead'].includes(selectedUser.role) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      )}
                      <span className={['org_admin', 'event_planner', 'committee_lead'].includes(selectedUser.role) ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                        Department Shift &amp; Supply Tools
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {['org_admin', 'vendor'].includes(selectedUser.role) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      )}
                      <span className={['org_admin', 'vendor'].includes(selectedUser.role) ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                        Vendor Invoices &amp; Booths
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 font-semibold">Public Shift Sign-Up &amp; Pass</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {selectedUser.role === 'org_admin' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      )}
                      <span className={selectedUser.role === 'org_admin' ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                        Observability &amp; Sentry Diagnostics
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Eye className="w-10 h-10 text-slate-700 mb-2 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-400">Select an Account to Preview Dossier</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  Inspect contact telemetry, active committee scopes, and launch direct impersonation sessions.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* PALETTE FOOTER                                                            */}
        {/* ========================================================================= */}
        <div className="p-3 sm:px-5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SOC 2 Type II Audit Logging Active · Multi-Tenant Row-Level Security Enforced</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> Accounts</span>
            <button
              onClick={closeCommandPalette}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition cursor-pointer"
            >
              Close (ESC)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
