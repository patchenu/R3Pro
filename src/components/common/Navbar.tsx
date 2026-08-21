import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, Calendar, Users, BarChart3, 
  Building2, CheckCircle2, Share2, Plus, 
  ChevronDown, User as UserIcon, LogIn, HeartHandshake, Store
} from 'lucide-react';
import { UserProfileModal } from '../auth/UserProfileModal';
import { OrgOnboardingModal } from '../organizer/OrgOnboardingModal';
import { AuthModal } from '../auth/AuthModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openEventBuilder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openEventBuilder
}) => {
  const { 
    currentOrg, currentEvent, organizations, events, 
    activeRole, currentUser, isAuthenticated, approvalRequests, 
    switchOrganization, switchEvent, showToast 
  } = useApp();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOrgWizardOpen, setIsOrgWizardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'NEW_ORG') {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
      } else {
        setIsOrgWizardOpen(true);
      }
    } else {
      switchOrganization(val);
    }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'NEW_EVENT') {
      openEventBuilder();
    } else {
      switchEvent(val);
    }
  };

  const handleCopyShareableLink = () => {
    const url = `${window.location.origin}?org=${currentOrg.id}&event=${currentEvent.id}&tab=public_landing`;
    navigator.clipboard.writeText(url);
    showToast('success', 'Link Copied', 'Copied Event Sign-Up link to clipboard!');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-12 z-40 shadow-sm">
        
        {/* ROW 1: Brand, Organization Context & User Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100">
          <div className="flex justify-between items-center h-14 gap-4">
            
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => setActiveTab('discovery_hub')}
                title="Go to Community Events Hub"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-0.5">
                    R3<span className="text-indigo-600">Pro</span>
                  </span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    GatherRaise
                  </span>
                </div>
              </div>

              {/* Org & Event Selectors */}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                {/* Org Selector */}
                <div className="relative">
                  <select
                    value={currentOrg.id}
                    onChange={handleOrgChange}
                    className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-1 pl-2.5 pr-7 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <optgroup label="Active Organizations">
                      {organizations.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Actions">
                      <option value="NEW_ORG">+ Register New Organization...</option>
                    </optgroup>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Event Selector */}
                <div className="relative">
                  <select
                    value={currentEvent.id}
                    onChange={handleEventChange}
                    className="appearance-none bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 rounded-lg py-1 pl-2.5 pr-7 text-xs font-bold text-indigo-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[200px] truncate"
                  >
                    <optgroup label="Active Events">
                      {events.filter(e => e.orgId === currentOrg.id).map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Actions">
                      <option value="NEW_EVENT">+ Create New Event...</option>
                    </optgroup>
                  </select>
                  <ChevronDown className="w-3 h-3 text-indigo-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareableLink}
                className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                title="Copy shareable public link for this event"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Share Link</span>
              </button>

              {(activeRole === 'org_admin' || activeRole === 'event_planner') && (
                <button
                  onClick={openEventBuilder}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs shadow-sm transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Event</span>
                </button>
              )}

              {/* User Account / Profile */}
              {isAuthenticated ? (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
                  title="My Account, Organizations & Settings"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block leading-none">{currentUser.name}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">{currentUser.role.replace('_', ' ')}</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ROW 2: Primary Workspace Navigation Tabs (Clean, Cohesive, Modern) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2">
            
            {/* 1. Community Events Hub */}
            <button
              onClick={() => setActiveTab('discovery_hub')}
              className={`px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'discovery_hub'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Community Calendar</span>
            </button>

            {/* 2. Public Event Showcase */}
            <button
              onClick={() => setActiveTab('public_landing')}
              className={`px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'public_landing'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
              <span>Event Sign-Up</span>
            </button>

            {/* 3. PLANNER HUB */}
            {(activeRole === 'org_admin' || activeRole === 'event_planner') && (
              <button
                onClick={() => setActiveTab('planner_dashboard')}
                className={`relative px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'planner_dashboard'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                }`}
                title="Event Chair Command Center: Committees, Volunteer Manifest, Marketing & Reports"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Planner Command Hub</span>
                {pendingApprovalsCount > 0 && (
                  <span className="w-4 h-4 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {/* 4. Committee Leads */}
            {(activeRole === 'org_admin' || activeRole === 'event_planner' || activeRole === 'committee_lead') && (
              <button
                onClick={() => setActiveTab('lead_portal')}
                className={`px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'lead_portal'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Committee Leads</span>
              </button>
            )}

            {/* 5. Org CRM */}
            {activeRole === 'org_admin' && (
              <button
                onClick={() => setActiveTab('org_admin_view')}
                className={`px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'org_admin_view'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Org Super Admin</span>
              </button>
            )}

            {/* 6. Vendor & Sponsor Hub (Only visible to Vendors or Admins/Planners) */}
            {(activeRole === 'vendor' || activeRole === 'org_admin' || activeRole === 'event_planner') && (
              <button
                onClick={() => setActiveTab('vendor_portal')}
                className={`px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'vendor_portal'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span>Vendors & Sponsors</span>
              </button>
            )}

            {/* 7. Door Check-In Kiosk (Only visible to Event Planners, Admins, or Kiosk Station) */}
            {(activeRole === 'org_admin' || activeRole === 'event_planner' || activeRole === 'kiosk') && (
              <button
                onClick={() => setActiveTab('kiosk_mode')}
                className={`px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'kiosk_mode'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                }`}
                title="Launch On-Site Door Kiosk Station for Express Tablet Check-In"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Door Kiosk</span>
              </button>
            )}

          </nav>
        </div>

      </header>

      {/* Profile & Account Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onOpenOrgWizard={() => setIsOrgWizardOpen(true)}
        />
      )}

      {/* Org Onboarding Modal */}
      {isOrgWizardOpen && (
        <OrgOnboardingModal
          isOpen={isOrgWizardOpen}
          onClose={() => setIsOrgWizardOpen(false)}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="login"
        />
      )}
    </>
  );
};
