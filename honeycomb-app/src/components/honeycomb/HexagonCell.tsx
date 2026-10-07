import React from 'react';
import { LifecyclePhase } from '../../types';

interface HexagonCellProps {
  phase: LifecyclePhase;
  title: string;
  subtitle: string;
  stepNumber: number;
  icon: string;
  status: 'completed' | 'active' | 'pending' | 'locked';
  badgeText?: string;
  isSelected: boolean;
  onClick: () => void;
}

export const HexagonCell: React.FC<HexagonCellProps> = ({
  phase,
  title,
  subtitle,
  stepNumber,
  icon,
  status,
  badgeText,
  isSelected,
  onClick
}) => {
  // Styling based on status & selection
  const getColors = () => {
    if (isSelected) {
      return {
        bg: 'from-amber-400 to-amber-500 shadow-honey ring-4 ring-amber-300 ring-offset-2',
        border: 'border-amber-500',
        text: 'text-amber-950',
        badge: 'bg-amber-900 text-amber-100'
      };
    }
    switch (status) {
      case 'completed':
        return {
          bg: 'from-emerald-400 to-emerald-500 shadow-md hover:from-emerald-300 hover:to-emerald-400',
          border: 'border-emerald-600',
          text: 'text-emerald-950',
          badge: 'bg-emerald-900 text-emerald-100'
        };
      case 'active':
        return {
          bg: 'from-amber-300 to-amber-400 shadow-honey animate-pulse-subtle hover:from-amber-200',
          border: 'border-amber-400',
          text: 'text-amber-950',
          badge: 'bg-amber-900 text-amber-100'
        };
      case 'pending':
        return {
          bg: 'from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300',
          border: 'border-amber-300',
          text: 'text-amber-900',
          badge: 'bg-amber-800 text-amber-50'
        };
      case 'locked':
      default:
        return {
          bg: 'from-slate-100 to-slate-200 opacity-70 hover:opacity-90',
          border: 'border-slate-300',
          text: 'text-slate-600',
          badge: 'bg-slate-700 text-slate-100'
        };
    }
  };

  const colors = getColors();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`hex-node group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none focus:outline-none ${
        isSelected ? 'scale-105 z-20' : 'hover:scale-102 z-10'
      }`}
      style={{ width: '135px', height: '150px' }}
      aria-label={`${title} (${status})`}
    >
      {/* Outer Hexagon Shape */}
      <div 
        className={`w-full h-full clip-hex bg-gradient-to-b ${colors.bg} p-1 flex items-center justify-center transition-all`}
      >
        {/* Inner Hexagon Core */}
        <div className="w-[94%] h-[94%] clip-hex bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center">
          
          {/* Step Pill */}
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mb-1">
            Step {stepNumber}
          </span>

          {/* Emoji Icon */}
          <span className="text-2xl my-0.5 transform group-hover:scale-110 transition-transform">
            {icon}
          </span>

          {/* Title */}
          <h3 className="font-chunky text-xs font-bold leading-tight text-slate-800 line-clamp-1">
            {title}
          </h3>

          {/* Subtitle / Stat */}
          <p className="text-[9px] font-medium text-slate-500 mt-0.5 line-clamp-1">
            {subtitle}
          </p>

          {/* Badge text if any */}
          {badgeText && (
            <span className={`mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${colors.badge}`}>
              {badgeText}
            </span>
          )}
        </div>
      </div>
      
      {/* Indicator Dot on Bottom */}
      {status === 'completed' && (
        <span className="absolute -bottom-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-[8px] text-white font-bold">
          ✓
        </span>
      )}
      {status === 'active' && (
        <span className="absolute -bottom-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs animate-ping" />
      )}
    </button>
  );
};
