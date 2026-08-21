import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { CommunityDiscoveryHub } from './components/discovery/CommunityDiscoveryHub';
import { PublicEventLanding } from './components/public/PublicEventLanding';
import { MasterPlannerDashboard } from './components/organizer/MasterPlannerDashboard';
import { LeadPortal } from './components/lead/LeadPortal';
import { OrgExecutiveDashboard } from './components/organizer/OrgExecutiveDashboard';
import { VendorSponsorDashboard } from './components/vendor/VendorSponsorDashboard';
import { GapAnalysisDashboard } from './components/intelligence/GapAnalysisDashboard';
import { ReportsExportCenter } from './components/organizer/ReportsExportCenter';
import { EventMarketingHub } from './components/marketing/EventMarketingHub';
import { KioskSelfCheckIn } from './components/checkin/KioskSelfCheckIn';
import { EventBuilderWizard } from './components/organizer/EventBuilderWizard';
import { OrgOnboardingModal } from './components/organizer/OrgOnboardingModal';
import { AuthModal } from './components/auth/AuthModal';

const MainLayout: React.FC = () => {
  const { activeRole, switchEvent, switchOrganization, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<string>('discovery_hub');
  const [isEventBuilderOpen, setIsEventBuilderOpen] = useState(false);
  const [isOrgWizardOpen, setIsOrgWizardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRoleIntent, setAuthRoleIntent] = useState<'org_admin' | 'volunteer'>('org_admin');
  const [showRoleSimulator, setShowRoleSimulator] = useState(true);

  const handleOpenOrgWizard = () => {
    if (!isAuthenticated) {
      setAuthRoleIntent('org_admin');
      setIsAuthModalOpen(true);
    } else {
      setIsOrgWizardOpen(true);
    }
  };

  const handleOpenAuth = (roleIntent: 'org_admin' | 'volunteer' = 'volunteer') => {
    setAuthRoleIntent(roleIntent);
    setIsAuthModalOpen(true);
  };

  // Check URL query parameters on boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const orgId = params.get('org');
    const mode = params.get('mode');
    const tab = params.get('tab');

    if (eventId) {
      switchEvent(eventId);
      setActiveTab('public_landing');
    }
    if (orgId) {
      switchOrganization(orgId);
    }
    if (mode === 'public') {
      setShowRoleSimulator(false);
      setActiveTab('public_landing');
    }
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  // If in kiosk role or kiosk tab, render fullscreen Kiosk
  if (activeRole === 'kiosk' || activeTab === 'kiosk_mode') {
    return (
      <div className="min-h-screen bg-slate-900">
        <RoleSwitcherBar setActiveTab={setActiveTab} />
        <div className="p-2 bg-slate-950 text-right">
          <button
            onClick={() => setActiveTab('discovery_hub')}
            className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg"
          >
            Exit Kiosk Fullscreen
          </button>
        </div>
        <KioskSelfCheckIn />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Role Simulator Switcher Bar */}
      {showRoleSimulator && <RoleSwitcherBar setActiveTab={setActiveTab} />}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openEventBuilder={() => setIsEventBuilderOpen(true)}
      />

      {/* Main Tab Routing */}
      <main className="flex-1">
        {activeTab === 'discovery_hub' && (
          <CommunityDiscoveryHub
            onSelectEvent={(eventId) => setActiveTab('public_landing')}
            onOpenOrgWizard={handleOpenOrgWizard}
            onOpenEventBuilder={() => setIsEventBuilderOpen(true)}
            onOpenAuth={handleOpenAuth}
            onNavigateToVendorHub={() => setActiveTab('vendor_portal')}
          />
        )}
        
        {activeTab === 'public_landing' && <PublicEventLanding />}
        
        {activeTab === 'planner_dashboard' && (
          <MasterPlannerDashboard
            onOpenEventBuilder={() => setIsEventBuilderOpen(true)}
            onOpenGapAnalysis={() => setActiveTab('gap_analysis')}
            onOpenReports={() => setActiveTab('reports_center')}
          />
        )}
        
        {activeTab === 'marketing_hub' && <EventMarketingHub />}

        {activeTab === 'lead_portal' && <LeadPortal />}
        
        {activeTab === 'org_admin_view' && <OrgExecutiveDashboard />}

        {activeTab === 'vendor_portal' && <VendorSponsorDashboard />}
        
        {activeTab === 'gap_analysis' && (
          <GapAnalysisDashboard onOpenBroadcast={() => setActiveTab('lead_portal')} />
        )}
        
        {activeTab === 'reports_center' && <ReportsExportCenter />}
      </main>

      {/* Auth Modal Gate */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="register"
          initialRoleIntent={authRoleIntent}
          onRegisterSuccess={(role) => {
            if (role === 'org_admin') {
              setIsOrgWizardOpen(true);
            }
          }}
        />
      )}

      {/* Event Builder Modal */}
      {isEventBuilderOpen && (
        <EventBuilderWizard
          isOpen={isEventBuilderOpen}
          onClose={() => setIsEventBuilderOpen(false)}
        />
      )}

      {/* Org Onboarding Modal */}
      {isOrgWizardOpen && (
        <OrgOnboardingModal
          isOpen={isOrgWizardOpen}
          onClose={() => setIsOrgWizardOpen(false)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
