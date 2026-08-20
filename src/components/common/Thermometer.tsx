import React, { useEffect, useState } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { Trophy, TrendingUp, Users, HeartHandshake, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThermometerProps {
  currentAmount: number;
  goalAmount: number;
  donorCount: number;
  volunteerFillRate: number;
  currency?: string;
  themeColor?: string;
}

export const Thermometer: React.FC<ThermometerProps> = ({
  currentAmount,
  goalAmount,
  donorCount,
  volunteerFillRate,
  currency = 'USD',
  themeColor = '#4f46e5'
}) => {
  const percentage = formatPercentage(currentAmount, goalAmount);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (percentage >= 100 && !hasCelebrated) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setHasCelebrated(true);
    }
  }, [percentage, hasCelebrated]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div 
        className="absolute top-0 right-0 w-48 h-48 opacity-5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"
        style={{ backgroundColor: themeColor }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Live Campaign Progress
            </span>
            {percentage >= 100 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                <Trophy className="w-3 h-3 text-emerald-600" />
                Goal Reached! 🎉
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(currentAmount, currency)}
            </span>
            <span className="text-sm font-semibold text-slate-700">
              raised of {formatCurrency(goalAmount, currency)} goal
            </span>
          </div>
        </div>

        {/* Milestone Badge */}
        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-black text-indigo-600">
            {percentage}%
          </span>
          <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-600">
            Funded
          </span>
        </div>
      </div>

      {/* Progress Bar with Milestone Markers */}
      <div className="relative pt-1">
        <div className="overflow-hidden h-4 text-xs flex rounded-full bg-slate-100 p-0.5 border border-slate-200">
          <div
            style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: themeColor }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full transition-all duration-700 ease-out relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>

        {/* 25%, 50%, 75%, 100% Milestone Ticks */}
        <div className="flex justify-between text-[10px] font-bold text-slate-600 mt-1.5 px-1">
          <span>$0</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span className="flex items-center gap-0.5 text-indigo-600 font-bold">
            <Sparkles className="w-2.5 h-2.5" /> 100%
          </span>
        </div>
      </div>

      {/* Mini Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{donorCount}</div>
            <div className="text-[11px] text-slate-600">Generous Donors</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{volunteerFillRate}%</div>
            <div className="text-[11px] text-slate-600">Volunteer Slots Filled</div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{formatCurrency(Math.max(0, goalAmount - currentAmount), currency)}</div>
            <div className="text-[11px] text-slate-600">Remaining to Goal</div>
          </div>
        </div>
      </div>
    </div>
  );
};
