import React from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, ShieldAlert, ArrowLeft, UserCheck, Shield } from 'lucide-react';

interface StickyImpersonationBannerProps {
  onReturnToAdmin?: () => void;
}

export const StickyImpersonationBanner: React.FC<StickyImpersonationBannerProps> = ({
  onReturnToAdmin
}) => {
  const { isImpersonating, currentUser, currentOrg, impersonatedOriginalUser, stopImpersonation } = useApp();

  if (!isImpersonating) return null;

  const handleExit = () => {
    stopImpersonation();
    if (onReturnToAdmin) {
      onReturnToAdmin();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'org_admin': return 'bg-purple-500 text-white';
      case 'event_planner': return 'bg-indigo-500 text-white';
      case 'committee_lead': return 'bg-amber-500 text-slate-950 font-black';
      case 'vendor': return 'bg-emerald-500 text-white';
      case 'volunteer': return 'bg-blue-500 text-white';
      case 'kiosk': return 'bg-slate-700 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <aside aria-label="Impersonation Status" className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 text-white px-4 py-2.5 shadow-xl border-b-2 border-amber-300 sticky top-0 z-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Active Impersonation Context */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 animate-pulse">
            <Eye className="w-5 h-5 text-amber-200" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded text-amber-200 border border-amber-200/30 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                ACTIVE IMPERSONATION SESSION
              </span>
              <span className="text-xs text-white/90">
                Viewing as: <strong className="text-white font-black">{currentUser.name}</strong> ({currentUser.email})
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-[11px] text-amber-100/90 hidden md:block">
              You are experiencing GatherRaise with {currentUser.name}&apos;s exact permissions, scoped committee departments, and registrations.
              {impersonatedOriginalUser && (
                <span className="text-white/80 ml-1">
                  (Original Admin: <strong>{impersonatedOriginalUser.name}</strong>)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Exit Impersonation CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExit}
            className="px-4 py-1.5 bg-white hover:bg-amber-50 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer"
            title="End impersonation session and return to Admin Observability Hub"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
            <span>Exit Impersonation & Return to Admin</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
