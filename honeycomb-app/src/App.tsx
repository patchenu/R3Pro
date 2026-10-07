import React from 'react';
import { HoneycombProvider, useHoneycomb } from './context/HoneycombContext';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { HoneycombCluster } from './components/honeycomb/HoneycombCluster';
import { Step1RegisterModal } from './components/lifecycle/Step1RegisterModal';
import { Step2OrganizerStudio } from './components/lifecycle/Step2OrganizerStudio';
import { Step3OutcomesStudio } from './components/lifecycle/Step3OutcomesStudio';
import { PublicVolunteerPortal } from './components/lifecycle/PublicVolunteerPortal';
import { MinhAssignmentConfirmModal } from './components/lifecycle/MinhAssignmentConfirmModal';
import { SpreadsheetSyncModal } from './components/lifecycle/SpreadsheetSyncModal';
import { CheckCircle2, ShieldCheck, Heart, Sparkles, MapPin, Clock } from 'lucide-react';

const HoneycombAppContent: React.FC = () => {
  const { 
    event, 
    activeRole, 
    currentLifecyclePhase, 
    setCurrentLifecyclePhase,
    needs,
    shifts,
    volunteers,
    setIsMinhModalOpen
  } = useHoneycomb();

  return (
    <div className="min-h-screen flex flex-col bg-honeycomb-pattern text-slate-800">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-6">
        
        {/* Honeycomb Interconnected Lifecycle Cluster (Anchored at Top) */}
        <HoneycombCluster />

        {/* Dynamic Workspace Container based on Role & Lifecycle Phase */}
        <section className="space-y-4">
          
          {/* Volunteer View (Kid & Parent Friendly) */}
          {activeRole === 'volunteer' ? (
            <PublicVolunteerPortal />
          ) : (
            /* Organizer Studio Views */
            <>
              {currentLifecyclePhase === 'planning' && (
                <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Phase 1 of 5
                      </span>
                      <h3 className="font-chunky text-lg font-bold text-slate-800 mt-1">
                        Planning &amp; Foundation
                      </h3>
                      <p className="text-xs text-slate-500">
                        Event date, location, privacy rules, and core goals.
                      </p>
                    </div>

                    <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl">
                      {event.privacy === 'private' ? `🔒 Private Access Code: ${event.accessCode}` : '🌐 Public Community Event'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        <span>Venue &amp; Schedule</span>
                      </div>
                      <div className="text-slate-700"><strong>Location:</strong> {event.location}</div>
                      <div className="text-slate-700"><strong>Date:</strong> {event.date} at {event.startTime} ({event.lengthHours} hrs)</div>
                      <div className="text-slate-700"><strong>Organization:</strong> {event.organizationName}</div>
                    </div>

                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-amber-600" />
                        <span>Community Purpose &amp; Impact</span>
                      </div>
                      <div className="text-slate-700"><strong>Mission:</strong> {event.goals.purpose}</div>
                      <div className="text-slate-700"><strong>Impact:</strong> {event.goals.communityImpact}</div>
                      <div className="text-slate-700"><strong>Target Goal:</strong> ${event.goals.fundraisingTarget.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentLifecyclePhase('setup')}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-chunky font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xs transition cursor-pointer"
                    >
                      Continue to Step 2: Setup (Minh&apos;s Table &amp; Shifts) ➔
                    </button>
                  </div>
                </div>
              )}

              {currentLifecyclePhase === 'setup' && (
                <Step2OrganizerStudio />
              )}

              {currentLifecyclePhase === 'hosting' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 rounded-3xl text-white shadow-honey flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                        Game Day Mode Active
                      </span>
                      <h3 className="font-chunky text-xl font-bold mt-1">
                        🏆 Tournament Game Day &amp; Live Check-In
                      </h3>
                      <p className="text-xs text-amber-100">
                        Volunteers arriving on site at designated reporting gates.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentLifecyclePhase('cleanup')}
                      className="bg-white text-amber-900 font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:bg-amber-50 cursor-pointer"
                    >
                      Move to Cleanup ➔
                    </button>
                  </div>

                  {/* Public Volunteer Opportunities view embedded */}
                  <PublicVolunteerPortal />
                </div>
              )}

              {currentLifecyclePhase === 'cleanup' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Phase 4 of 5
                      </span>
                      <h3 className="font-chunky text-lg font-bold text-slate-800 mt-1">
                        🧹 Post-Event Cleanup &amp; Equipment Returns
                      </h3>
                      <p className="text-slate-500">
                        Check off returned borrowed equipment (e.g. Minh&apos;s table) and verify cleanup crew.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentLifecyclePhase('wrapup')}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                    >
                      Finish Cleanup ➔ Go to Step 3 Wrap-Up
                    </button>
                  </div>

                  {/* Equipment Return Checklist */}
                  <div className="space-y-2">
                    <div className="font-bold text-slate-700 text-xs">
                      Borrowed Equipment Return Checklist:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {needs.filter(n => n.type === 'equipment').map(item => (
                        <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-800">{item.title}</div>
                            <div className="text-[11px] text-slate-500">
                              Borrowed from: <strong>{item.assignedTo?.name || 'Community Donor'}</strong>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-xl">
                            Returned ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentLifecyclePhase === 'wrapup' && (
                <Step3OutcomesStudio />
              )}
            </>
          )}

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/80 bg-white/70 py-4 px-4 text-center text-xs text-slate-500 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🐝</span>
            <span className="font-bold text-slate-700">HiveEvent</span>
            <span>— The Interconnected Planning Hub for Sports Boosters &amp; School PTAs</span>
          </div>
          <div className="text-[11px] text-amber-800 font-medium">
            10-Year-Old Friendly • Zero Passwords • 501(c)(3) Tax Ready
          </div>
        </div>
      </footer>

      {/* Modals & Popups */}
      <Step1RegisterModal />
      <MinhAssignmentConfirmModal />
      <SpreadsheetSyncModal />
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HoneycombProvider>
      <HoneycombAppContent />
    </HoneycombProvider>
  );
};

export default App;
