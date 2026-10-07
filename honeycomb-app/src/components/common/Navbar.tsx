import React from 'react';
import { 
  Sparkles, Plus, Eye, RefreshCw, Table, ShieldCheck, 
  User, CheckCircle2 
} from 'lucide-react';
import { useHoneycomb } from '../../context/HoneycombContext';

export const Navbar: React.FC = () => {
  const { 
    event, 
    activeRole, 
    setActiveRole, 
    setIsRegisterModalOpen, 
    setIsMinhModalOpen, 
    setIsSpreadsheetModalOpen,
    resetToDefaultData 
  } = useHoneycomb();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-10 h-10 clip-hex bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-xl shadow-honey">
            🐝
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-chunky text-lg sm:text-xl font-bold tracking-tight text-amber-950">
                HiveEvent
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                Booster &amp; PTA MVP
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Interconnected Event Lifecycle for Sports Boosters &amp; School PTAs
            </p>
          </div>
        </div>

        {/* Persona Role Switcher (Kid & Parent vs Organizer vs Minh) */}
        <div className="bg-amber-50 p-1 rounded-2xl border border-amber-200 flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveRole('organizer')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeRole === 'organizer'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👑 Organizer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('volunteer')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeRole === 'volunteer'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🙋 Volunteer (10-Yr Old View)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMinhModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl font-bold text-amber-900 hover:bg-amber-200/60 transition flex items-center gap-1 cursor-pointer"
          >
            <span>📦 Minh&apos;s RSVP</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* New Event Button */}
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-chunky font-bold text-xs px-3.5 py-2 rounded-2xl shadow-honey transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Register Event</span>
            <span className="sm:hidden">+ Event</span>
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={resetToDefaultData}
            title="Reset to default sample data"
            className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
