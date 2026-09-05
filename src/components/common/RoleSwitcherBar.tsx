import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Crown, ClipboardList, Utensils, Store, HeartHandshake, Tablet, RotateCcw, Sparkles, Globe, UserCheck, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RoleSwitcherBarProps {
  setActiveTab?: (tab: string) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ setActiveTab }) => {
  const { activeRole, switchRole, currentOrg, currentUser, isAuthenticated, isDemoMode, toggleDemoMode, resetDemoData, approvalRequests, openCommandPalette } = useApp();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string; desc: string; persona: string; badgeCount?: number }[] = [
    {
      role: 'event_planner',
      label: 'Event Planner / Chair',
      icon: <ClipboardList className="w-4 h-4" />,
      color: 'bg-indigo-600 text-white',
      persona: 'Marcus Vance',
      desc: 'Controls total budget, Planner Hub, approvals & volunteer manifest',
      badgeCount: approvalRequests.filter(r => r.status === 'pending').length
    },
    {
      role: 'org_admin',
      label: 'Org Super Admin',
      icon: <Crown className="w-4 h-4" />,
      color: 'bg-purple-600 text-white',
      persona: 'Patchen Uchiyama',
      desc: 'Full organization control, Accounts & Observability, Team Delegation, Master CRM'
    },
    {
      role: 'committee_lead',
      label: 'Committee Lead',
      icon: <Utensils className="w-4 h-4" />,
      color: 'bg-amber-600 text-white',
      persona: 'Sarah Jenkins',
      desc: 'Department-scoped Lead Portal, shifts, supplies & volunteer check-in'
    },
    {
      role: 'vendor',
      label: 'Vendor / Sponsor',
      icon: <Store className="w-4 h-4" />,
      color: 'bg-emerald-600 text-white',
      persona: 'Artisan Bakery',
      desc: 'Vendor intake questionnaire, booth selection & tax receipts'
    },
    {
      role: 'volunteer',
      label: 'Volunteer / Parent',
      icon: <HeartHandshake className="w-4 h-4" />,
      color: 'bg-blue-600 text-white',
      persona: 'David Chen',
      desc: 'Public 60s shift sign-up, family registration & QR check-in pass'
    },
    {
      role: 'kiosk',
      label: 'On-Site Tablet Kiosk',
      icon: <Tablet className="w-4 h-4" />,
      color: 'bg-slate-900 text-white',
      persona: 'Door Kiosk',
      desc: 'Express on-site check-in via QR scan, phone lookup & touch waivers'
    }
  ];

  const currentRoleObj = roles.find(r => r.role === activeRole) || roles[0];

  // 1. LIVE / CLEAN PRODUCTION MODE BAR
  if (!isDemoMode) {
    return (
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>LIVE PRODUCTION MODE</span>
          </div>

          <span className="text-slate-300 text-xs hidden sm:inline">
            {isAuthenticated ? (
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Signed in as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}) —{' '}
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 text-[10px] font-black uppercase">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </span>
            ) : (
              <span className="text-slate-400">
                Viewing as <strong>Unauthenticated Guest Visitor</strong> (Create real account & org from scratch)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              {activeRole !== 'org_admin' ? (
                <button
                  onClick={() => {
                    switchRole('org_admin');
                    if (setActiveTab) setActiveTab('admin_observability');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Elevate this session to Org Super Admin"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>👑 Elevate to Super Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (setActiveTab) setActiveTab('admin_observability');
                  }}
                  className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Open Admin Observability & User Impersonation Hub"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  <span>🛡️ Accounts &amp; Observability</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={openCommandPalette}
            className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-extrabold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-105"
            title="Open Persona Impersonation Studio & Command Palette (⌘K)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>⌘K Persona Studio</span>
          </button>

          <button
            onClick={() => toggleDemoMode(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            title="Switch back to interactive Role Simulator sandbox"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Switch to Demo Simulator</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. INTERACTIVE DEMO SIMULATOR BANNER (HIGH VISIBILITY)
  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b-2 border-indigo-500/40 px-4 py-2.5 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        
        {/* Left: Active Persona Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DEMO SIMULATOR</span>
          </div>

          <div className="text-xs">
            <span className="text-slate-300">Active Persona: </span>
            <strong className="text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
              {currentRoleObj.persona} ({currentRoleObj.label})
            </strong>
          </div>
        </div>

        {/* Center: Role Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {roles.map(r => {
            const isActive = activeRole === r.role;
            const handleSelectRole = () => {
              switchRole(r.role);
              if (setActiveTab) {
                if (r.role === 'event_planner') setActiveTab('planner_dashboard');
                else if (r.role === 'org_admin') setActiveTab('org_admin_view');
                else if (r.role === 'committee_lead') setActiveTab('lead_portal');
                else if (r.role === 'vendor') setActiveTab('vendor_portal');
                else if (r.role === 'volunteer') setActiveTab('public_landing');
                else if (r.role === 'kiosk') setActiveTab('kiosk_mode');
              }
            };

            return (
              <button
                key={r.role}
                onClick={handleSelectRole}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs ${
                  isActive
                    ? `${r.color} ring-2 ring-white shadow-md scale-105`
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
                title={`${r.persona}: ${r.desc}`}
              >
                {r.icon}
                <span>{r.label}</span>
                {r.badgeCount !== undefined && r.badgeCount > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {r.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Reset & Exit Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openCommandPalette}
            className="text-amber-300 hover:text-white flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 hover:bg-indigo-900 transition cursor-pointer"
            title="Open Persona Impersonation Studio & Command Palette (⌘K)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>⌘K Studio</span>
          </button>

          <button
            onClick={resetDemoData}
            className="text-slate-300 hover:text-rose-300 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
            title="Restore original sample events and rosters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>

          <button
            onClick={() => toggleDemoMode(false)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Test real unauthenticated registration flow"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Exit Demo (Live Mode)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
