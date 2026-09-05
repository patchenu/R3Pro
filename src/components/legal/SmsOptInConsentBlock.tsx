import React from 'react';
import { Smartphone, ShieldCheck, Lock } from 'lucide-react';
import { LegalDocType } from '../../content/legal';

interface SmsOptInConsentBlockProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  organizationName?: string;
  onOpenLegalDoc?: (doc: LegalDocType) => void;
}

export const SmsOptInConsentBlock: React.FC<SmsOptInConsentBlockProps> = ({
  checked,
  onChange,
  organizationName = 'the event organizers',
  onOpenLegalDoc
}) => {
  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          id="sms-opt-in-checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="sms-opt-in-checkbox" className="text-xs font-semibold text-slate-800 cursor-pointer leading-snug">
          <span>Yes, send me automated shift reminders, gate check-in passes, and event updates via SMS.</span>
        </label>
      </div>

      {/* Required A2P 10DLC Carrier & TCPA Disclosures */}
      <div className="text-[11px] text-slate-500 leading-relaxed pl-6 space-y-1.5 border-t border-slate-200/60 pt-2">
        <p>
          By checking this box and providing your mobile number, you expressly consent to receive automated transactional text messages from <strong>{organizationName}</strong> and REACH. Consent is not a condition of registration, donation, or volunteering.
        </p>
        <p>
          • <strong>Message Frequency</strong>: Approx. 3–5 messages per event (Confirmation, T-72h gate details, T-24h shift reminder, T-2h check-in pass).<br/>
          • <strong>Rates & Opt-Out</strong>: Msg & data rates may apply. Reply <strong>HELP</strong> for help, <strong>STOP</strong> to cancel at any time.
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-slate-600 font-medium">
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
            <Lock className="w-3 h-3" />
            Zero Data Selling Guarantee
          </span>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegalDoc?.('sms')}
            className="text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
          >
            SMS Terms
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegalDoc?.('privacy')}
            className="text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegalDoc?.('terms')}
            className="text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};
