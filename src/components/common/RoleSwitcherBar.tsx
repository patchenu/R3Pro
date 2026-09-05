import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Crown, ClipboardList, Utensils, Store, HeartHandshake, Tablet, RotateCcw, Sparkles, Globe, UserCheck, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RoleSwitcherBarProps {
  setActiveTab?: (tab: string) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ setActiveTab }) => {
  const { activeRole, switchRole, isDemoMode, toggleDemoMode, resetDemoData, approvalRequests } = useApp();

  // In Live Production Mode, do NOT render any simulator bar.
  if (!isDemoMode) {
    return null;
  }

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string; persona: string; badgeCount?: number }[] = [
    {
      role: 'org_admin',
      label: 'Org Admin',
      icon: <Crown className="w-3.5 h-3.5" />,
      color: 'bg-purple-600 text-white',
      persona: 'Patchen Uchiyama'
    },
    {
      role: 'event_planner',
      label: 'Event Planner',
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      color: 'bg-indigo-600 text-white',
      persona: 'Marcus Vance',
      badgeCount: approvalRequests.filter(r => r.status === 'pending').length
    },
    {
      role: 'committee_lead',
      label: 'Committee Lead',
      icon: <Utensils className="w-3.5 h-3.5" />,
      color: 'bg-amber-600 text-white',
      persona: 'Sarah Jenkins'
    },
    {
      role: 'vendor',
      label: 'Vendor',
      icon: <Store className="w-3.5 h-3.5" />,
      color: 'bg-emerald-600 text-white',
      persona: 'Artisan Bakery'
    },
    {
      role: 'volunteer',
      label: 'Volunteer',
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      color: 'bg-blue-600 text-white',
      persona: 'David Chen'
    },
    {
      role: 'kiosk',
      label: 'Kiosk',
      icon: <Tablet className="w-3.5 h-3.5" />,
      color: 'bg-slate-900 text-white',
      persona: 'Front Gate'
    }
  ];

  return (
    <div className="bg-slate-950 text-white border-b border-indigo-500/30 px-4 py-2 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Demo Sandbox Label */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
            Demo Simulator
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">Role Sandbox:</span>
        </div>

        {/* Center: Clean Role Switcher Chips */}
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
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 text-xs cursor-pointer ${
                  isActive
                    ? `${r.color} shadow-xs`
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
                title={`Simulate ${r.persona} (${r.label})`}
              >
                {r.icon}
                <span>{r.label}</span>
                {r.badgeCount !== undefined && r.badgeCount > 0 && (
                  <span className="w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {r.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Reset Data & Live Mode Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetDemoData}
            className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="Restore sample demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          <button
            onClick={() => toggleDemoMode(false)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Switch to Live Clean Mode"
          >
            <Globe className="w-3 h-3" />
            <span>Live Mode</span>
          </button>
        </div>

      </div>
    </div>
  );
};
