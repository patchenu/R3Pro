import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  Scale, 
  Smartphone, 
  Award,
  Sparkles
} from 'lucide-react';
import { LegalDocType } from '../../content/legal';

interface GlobalAppFooterProps {
  onOpenLegalDoc?: (doc: LegalDocType) => void;
}

export const GlobalAppFooter: React.FC<GlobalAppFooterProps> = ({ onOpenLegalDoc }) => {
  const { isDemoMode, toggleDemoMode } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20 print:hidden">
      
      {/* Sleek Trust & Compliance Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                SOC 2 Type II
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                COPPA Verified
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                IRS 501(c)(3) Compliant
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                A2P 10DLC Certified
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                PostgreSQL RLS
              </span>
            </div>

            {!isDemoMode && (
              <button
                type="button"
                onClick={() => toggleDemoMode(true)}
                className="text-slate-400 hover:text-indigo-400 transition text-[11px] flex items-center gap-1.5 cursor-pointer font-semibold"
                title="Switch to Demo Simulator role sandbox"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to Demo Simulator</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                R
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">REACH</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The unified community operating system for volunteer scheduling, supply wishlists, and multi-stream fundraising.
            </p>
            <p className="text-[11px] text-slate-500">
              Engineered with SOC 2 Type II controls and PostgreSQL Row-Level Security.
            </p>
          </div>

          {/* Legal & Compliance Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal & Compliance</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('terms')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('privacy')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('coppa')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>Children's Privacy (COPPA)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">Safe</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('california')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  California Privacy Notice
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('california')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left text-amber-400 font-semibold"
                >
                  Do Not Sell or Share My Info
                </button>
              </li>
            </ul>
          </div>

          {/* Regulatory Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Regulatory Standards</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('sms')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  SMS A2P 10DLC Messaging Terms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('irs')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  IRS 501(c)(3) Tax Substantiation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('terms')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  E-SIGN Act Vector Signature Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.('privacy')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  Zero Data Broker Selling Guarantee
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Security</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Questions regarding privacy, student records, or compliance?
            </p>
            <div className="space-y-1 text-xs text-slate-300">
              <p>Email: <strong className="text-white">privacy@reachplatform.com</strong></p>
              <p>Support: <strong className="text-white">support@reachplatform.com</strong></p>
              <p>Toll-Free: <strong className="text-white">1-800-555-0199</strong></p>
            </div>
          </div>

        </div>

        {/* Bottom Legal Notice */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} REACH Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>SOC 2 Type II Certified</span>
            <span>•</span>
            <span>COPPA Verified</span>
            <span>•</span>
            <span>IRC § 170(f)(8) Compliant</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
