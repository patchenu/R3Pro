import React, { useState } from 'react';
import { KeyRound, Lock, ArrowRight, X, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Event } from '../../types';

interface PrivateAccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: (event: Event) => void;
}

export const PrivateAccessCodeModal: React.FC<PrivateAccessCodeModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess
}) => {
  const { unlockPrivateEventByCode } = useApp();
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!passcode.trim()) {
      setErrorMessage('Please enter an access passcode.');
      return;
    }

    const result = unlockPrivateEventByCode(passcode);
    if (result.success && result.event) {
      onUnlockSuccess(result.event);
      onClose();
    } else {
      setErrorMessage(result.error || 'Invalid access code. Please verify the code on your invitation.');
    }
  };

  const handlePresetCode = (preset: string) => {
    setPasscode(preset);
    const result = unlockPrivateEventByCode(preset);
    if (result.success && result.event) {
      onUnlockSuccess(result.event);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Private Access Portal
          </span>

          <h2 className="text-xl font-black text-white mt-1.5">
            Enter Private Campaign Passcode
          </h2>

          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            This campaign is unlisted and requires an authorized invitation code to access registration and tickets.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleUnlock} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Access Passcode / VIP Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                autoFocus
                placeholder="e.g. VIP2026"
                value={passcode}
                onChange={e => {
                  setPasscode(e.target.value.toUpperCase());
                  setErrorMessage('');
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-mono uppercase tracking-widest font-bold"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Preset Tag */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
            <span className="font-bold text-slate-700">Demo Testing Preset:</span>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePresetCode('VIP2026')}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-mono font-bold rounded text-xs transition-colors border border-amber-300 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                VIP2026 (Board Gala)
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Unlock Campaign Access <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
