import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Crown, ClipboardList, Utensils, Wrench, Store, HeartHandshake, Tablet, RotateCcw, Sparkles, Globe, UserCheck, ShieldAlert } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { activeRole, switchRole, currentOrg, currentUser, isAuthenticated, isDemoMode, toggleDemoMode, resetDemoData, approvalRequests } = useApp();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string; desc: string; badgeCount?: number }[] = [
    {
      role: 'org_admin',
      label: 'Org Super Admin',
      icon: <Crown className="w-3.5 h-3.5" />,
      color: 'bg-purple-600 text-white',
      desc: 'Elena (PTA President)'
    },
    {
      role: 'event_planner',
      label: 'Event Planner / Chair',
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      color: 'bg-indigo-600 text-white',
      desc: 'Marcus (Carnival Chair)',
      badgeCount: approvalRequests.filter(r => r.status === 'pending').length
    },
    {
      role: 'committee_lead',
      label: 'Hospitality Lead',
      icon: <Utensils className="w-3.5 h-3.5" />,
      color: 'bg-amber-600 text-white',
      desc: 'Sarah (Food & Bake Sale)'
    },
    {
      role: 'vendor',
      label: 'Vendor / Sponsor',
      icon: <Store className="w-3.5 h-3.5" />,
      color: 'bg-emerald-600 text-white',
      desc: 'Artisan Bakery'
    },
    {
      role: 'volunteer',
      label: 'Public Volunteer / Donor',
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      color: 'bg-blue-600 text-white',
      desc: 'David (Parent Sign-up)'
    },
    {
      role: 'kiosk',
      label: 'On-Site Tablet Kiosk',
      icon: <Tablet className="w-3.5 h-3.5" />,
      color: 'bg-slate-900 text-white',
      desc: 'Door Check-in Station'
    }
  ];

  // 1. LIVE / CLEAN PRODUCTION MODE BAR
  if (!isDemoMode) {
    return (
      <div className="bg-slate-900 text-white text-xs border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>Live Clean Mode</span>
          </div>

          <span className="text-slate-300 text-xs hidden sm:inline">
            {isAuthenticated ? (
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Signed in as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
              </span>
            ) : (
              <span className="text-slate-400">
                Viewing as <strong>Unauthenticated Guest Visitor</strong> (Register/Login to create your own org & events)
              </span>
            )}
          </span>
        </div>

        <button
          onClick={() => toggleDemoMode(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition flex items-center gap-1.5 shadow-sm"
          title="Switch back to interactive Role Simulator sandbox"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Switch to Demo Simulator</span>
        </button>
      </div>
    );
  }

  // 2. DEMO SIMULATOR SANDBOX BAR
  return (
    <div className="bg-slate-950 text-white text-xs border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-inner sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          Demo Sandbox:
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {roles.map(r => {
            const isActive = activeRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`relative px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? `${r.color} ring-2 ring-white/30 shadow-sm font-semibold scale-105`
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={r.desc}
              >
                {r.icon}
                <span>{r.label}</span>
                {r.badgeCount !== undefined && r.badgeCount > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {r.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={resetDemoData}
          className="text-slate-400 hover:text-rose-300 flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          title="Reset sample events and rosters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Sample Data</span>
        </button>

        <button
          onClick={() => toggleDemoMode(false)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition flex items-center gap-1.5 shadow-sm"
          title="Test real unauthenticated registration flow"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Exit to Live Clean Mode</span>
        </button>
      </div>
    </div>
  );
};
