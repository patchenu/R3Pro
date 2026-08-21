import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Crown, ClipboardList, Utensils, Store, HeartHandshake, Tablet, RotateCcw, Sparkles, Globe, UserCheck, CheckCircle2 } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { activeRole, switchRole, currentOrg, currentUser, isAuthenticated, isDemoMode, toggleDemoMode, resetDemoData, approvalRequests } = useApp();

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
      persona: 'Elena Rostova',
      desc: 'Full organization control, team invitations, Master CRM & branding'
    },
    {
      role: 'committee_lead',
      label: 'Hospitality Lead',
      icon: <Utensils className="w-4 h-4" />,
      color: 'bg-amber-600 text-white',
      persona: 'Sarah Jenkins',
      desc: 'Department-scoped Lead Portal, bake sale & volunteer check-in'
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
                Signed in as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
              </span>
            ) : (
              <span className="text-slate-400">
                Viewing as <strong>Unauthenticated Guest Visitor</strong> (Create real account & org from scratch)
              </span>
            )}
          </span>
        </div>

        <button
          onClick={() => toggleDemoMode(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-2 shadow-sm"
          title="Switch back to interactive Role Simulator sandbox"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Switch to Interactive Demo Simulator</span>
        </button>
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
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
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
            onClick={resetDemoData}
            className="text-slate-300 hover:text-rose-300 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition"
            title="Restore original sample events and rosters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>

          <button
            onClick={() => toggleDemoMode(false)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
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
