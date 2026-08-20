import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, Calendar, Users, BarChart3, ShieldCheck, 
  FileText, Plus, ChevronDown, CheckCircle2, Share2, Building2, User as UserIcon 
} from 'lucide-react';
import { OrgOnboardingModal } from '../organizer/OrgOnboardingModal';
import { UserProfileModal } from '../auth/UserProfileModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openEventBuilder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openEventBuilder }) => {
  const { currentOrg, currentEvent, currentUser, organizations, events, switchOrganization, switchEvent, activeRole, approvalRequests, showToast } = useApp();

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;

  const handleCopyShareableLink = () => {
    const url = `${window.location.origin}/?event=${currentEvent.id}&mode=public`;
    navigator.clipboard.writeText(url);
    showToast('success', 'Public Link Copied!', `Shareable link for "${currentEvent.title}" copied to clipboard.`);
  };

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'NEW_ORG') {
      setIsOrgModalOpen(true);
    } else {
      switchOrganization(e.target.value);
    }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'NEW_EVENT') {
      openEventBuilder();
    } else {
      switchEvent(e.target.value);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('public_landing')}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                    R3<span className="text-indigo-600">Pro</span>
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    {currentOrg.type.replace('_', ' ')} Platform
                  </span>
                </div>
              </div>

              {/* Org & Event Selectors */}
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
                {/* Org Selector */}
                <div className="relative group">
                  <select
                    value={currentOrg.id}
                    onChange={handleOrgChange}
                    className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Event Selector */}
                <div className="relative group">
                  <select
                    value={currentEvent.id}
                    onChange={handleEventChange}
                    className="appearance-none bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/60 rounded-lg py-1.5 pl-3 pr-8 text-xs font-semibold text-indigo-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[220px] truncate"
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
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Navigation Links based on active role */}
            <nav className="flex items-center gap-1 overflow-x-auto py-2">
              <button
                onClick={() => setActiveTab('public_landing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'public_landing'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Public Sign-Up Page</span>
              </button>

              {(activeRole === 'org_admin' || activeRole === 'event_planner') && (
                <>
                  <button
                    onClick={() => setActiveTab('planner_dashboard')}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'planner_dashboard'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Planner Hub</span>
                    {pendingApprovalsCount > 0 && (
                      <span className="w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('gap_analysis')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'gap_analysis'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Gap Analysis & Intel</span>
                  </button>
                </>
              )}

              {(activeRole === 'org_admin' || activeRole === 'event_planner' || activeRole === 'committee_lead') && (
                <button
                  onClick={() => setActiveTab('lead_portal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'lead_portal'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Committee Lead Portal</span>
                </button>
              )}

              {activeRole === 'org_admin' && (
                <button
                  onClick={() => setActiveTab('org_admin_view')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'org_admin_view'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Org CRM & Team</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('reports_center')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'reports_center'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Exports & IRS Receipts</span>
              </button>

              <button
                onClick={() => setActiveTab('kiosk_mode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'kiosk_mode'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Check-In Kiosk</span>
              </button>
            </nav>

            {/* Quick Actions & User Profile */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareableLink}
                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition"
                title="Copy shareable public link for this event"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Share Public Link</span>
              </button>

              {(activeRole === 'org_admin' || activeRole === 'event_planner') && (
                <button
                  onClick={openEventBuilder}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Event</span>
                </button>
              )}

              {/* User Account Button */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
                title="My Account, Roles & Volunteer Passes"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                  {currentUser.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold leading-tight">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Org Onboarding Modal */}
      {isOrgModalOpen && (
        <OrgOnboardingModal
          isOpen={isOrgModalOpen}
          onClose={() => setIsOrgModalOpen(false)}
        />
      )}

      {/* User Profile & Multi-Role Hub */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onOpenOrgWizard={() => setIsOrgModalOpen(true)}
        />
      )}
    </>
  );
};
