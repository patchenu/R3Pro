import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useHoneycomb } from '../../context/HoneycombContext';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useHoneycomb();

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'warning':
        return 'bg-amber-600 text-white border-amber-700';
      case 'error':
        return 'bg-rose-600 text-white border-rose-700';
      case 'info':
      default:
        return 'bg-slate-900 text-white border-slate-800';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-200" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-200" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-200" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5">
      <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 ${getStyle()}`}>
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 text-xs">
          <div className="font-bold">{toast.title}</div>
          <div className="text-[11px] opacity-90 mt-0.5">{toast.message}</div>
        </div>
        <button
          type="button"
          onClick={dismissToast}
          className="text-white/70 hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
