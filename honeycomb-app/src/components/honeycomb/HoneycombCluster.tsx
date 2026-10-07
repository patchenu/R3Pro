import React from 'react';
import { HexagonCell } from './HexagonCell';
import { useHoneycomb } from '../../context/HoneycombContext';
import { LifecyclePhase } from '../../types';

export const HoneycombCluster: React.FC = () => {
  const { 
    event, 
    needs, 
    shifts, 
    volunteers, 
    currentLifecyclePhase, 
    setCurrentLifecyclePhase 
  } = useHoneycomb();

  // Metrics for badges
  const confirmedNeeds = needs.filter(n => n.quantityFulfilled >= n.quantityNeeded).length;
  const totalSpots = shifts.reduce((acc, s) => acc + s.capacity, 0);
  const filledSpots = shifts.reduce((acc, s) => acc + s.filledCount, 0);
  const cleanupCrew = shifts
    .filter(s => s.dutyCategory === 'cleanup')
    .reduce((acc, s) => acc + s.filledCount, 0);
  const verifiedVolunteers = volunteers.filter(v => v.hoursVerified).length;

  const getStatus = (phase: LifecyclePhase): 'completed' | 'active' | 'pending' | 'locked' => {
    if (phase === currentLifecyclePhase) return 'active';
    
    // Simple progression logic
    const phases: LifecyclePhase[] = ['planning', 'setup', 'hosting', 'cleanup', 'wrapup'];
    const currentIndex = phases.indexOf(currentLifecyclePhase);
    const targetIndex = phases.indexOf(phase);

    if (targetIndex < currentIndex) return 'completed';
    if (targetIndex === currentIndex + 1) return 'pending';
    return 'locked';
  };

  return (
    <div className="w-full bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50 rounded-3xl p-4 sm:p-6 border border-amber-200/80 shadow-sm relative overflow-hidden">
      
      {/* Decorative Bee / Hexagon Accents */}
      <div className="absolute top-2 right-4 text-xs font-bold text-amber-700/60 flex items-center gap-1.5 select-none pointer-events-none">
        <span>Interconnected Hive Lifecycle</span>
        <span className="text-base animate-bounce">🐝</span>
      </div>

      {/* Title & Micro-Explainer for 10-year-olds */}
      <div className="text-center mb-5">
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/60">
          Tap any cell to jump into action
        </span>
        <h2 className="font-chunky text-lg sm:text-xl font-bold text-slate-800 mt-1.5">
          {event.name}
        </h2>
        <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
          {event.organizationName} • {event.date} • {event.location}
        </p>
      </div>

      {/* Honeycomb Geometry Layout:
          Desktop: Honeycomb arrangement (2 rows: Row 1 = 3 cells, Row 2 = 2 cells)
          Mobile: Horizontal swipeable or wrapped friendly grid
      */}
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 my-2">
        
        {/* ROW 1: Planning, Setup, Hosting */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 flex-wrap">
          <HexagonCell
            phase="planning"
            stepNumber={1}
            title="Planning"
            subtitle="Goals & Privacy"
            icon="📋"
            status={getStatus('planning')}
            badgeText={event.privacy === 'private' ? '🔒 Private' : '🌐 Public'}
            isSelected={currentLifecyclePhase === 'planning'}
            onClick={() => setCurrentLifecyclePhase('planning')}
          />

          <HexagonCell
            phase="setup"
            stepNumber={2}
            title="Setup"
            subtitle="Minh's Table & Gear"
            icon="🔨"
            status={getStatus('setup')}
            badgeText={`${confirmedNeeds}/${needs.length} Items Ready`}
            isSelected={currentLifecyclePhase === 'setup'}
            onClick={() => setCurrentLifecyclePhase('setup')}
          />

          <HexagonCell
            phase="hosting"
            stepNumber={3}
            title="Hosting"
            subtitle="Game Day Shifts"
            icon="🏆"
            status={getStatus('hosting')}
            badgeText={`${filledSpots}/${totalSpots} Filled`}
            isSelected={currentLifecyclePhase === 'hosting'}
            onClick={() => setCurrentLifecyclePhase('hosting')}
          />
        </div>

        {/* ROW 2: Cleanup, Wrap-Up & Outcomes */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 flex-wrap sm:-mt-5">
          <HexagonCell
            phase="cleanup"
            stepNumber={4}
            title="Cleanup"
            subtitle="Teardown & Returns"
            icon="🧹"
            status={getStatus('cleanup')}
            badgeText={`${cleanupCrew} Helper${cleanupCrew === 1 ? '' : 's'}`}
            isSelected={currentLifecyclePhase === 'cleanup'}
            onClick={() => setCurrentLifecyclePhase('cleanup')}
          />

          <HexagonCell
            phase="wrapup"
            stepNumber={5}
            title="Wrap-Up"
            subtitle="Hours & Tax Letters"
            icon="📜"
            status={getStatus('wrapup')}
            badgeText={`${verifiedVolunteers}/${volunteers.length} Verified`}
            isSelected={currentLifecyclePhase === 'wrapup'}
            onClick={() => setCurrentLifecyclePhase('wrapup')}
          />
        </div>
      </div>

      {/* Active Phase Pill Banner */}
      <div className="mt-4 pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="font-bold text-slate-700">
            Active Phase: <span className="text-amber-800 uppercase font-extrabold">{currentLifecyclePhase}</span>
          </span>
        </div>

        {/* Quick Lifecycle Advance Button */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Lifecycle Progress:</span>
          {['planning', 'setup', 'hosting', 'cleanup', 'wrapup'].map((p, idx) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentLifecyclePhase(p as LifecyclePhase)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                p === currentLifecyclePhase
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
