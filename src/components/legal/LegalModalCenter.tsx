import React, { useState, useMemo } from 'react';
import { 
  X, 
  Shield, 
  FileText, 
  Lock, 
  Smartphone, 
  Scale, 
  Award, 
  Search, 
  Printer, 
  Copy, 
  Check, 
  Download,
  AlertCircle
} from 'lucide-react';
import { 
  TERMS_OF_SERVICE_CONTENT, 
  PRIVACY_POLICY_CONTENT, 
  COPPA_MINOR_PRIVACY_CONTENT, 
  CALIFORNIA_PRIVACY_NOTICE_CONTENT, 
  SMS_A2P_COMPLIANCE_CONTENT, 
  IRS_TAX_SUBSTANTIATION_CONTENT,
  LegalDocType 
} from '../../content/legal';

interface LegalModalCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalDocType;
}

export const LegalModalCenter: React.FC<LegalModalCenterProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  const docMap: Record<LegalDocType, { title: string; lastUpdated: string; version: string; summary: string; sections: { id: string; title: string; content: string }[] }> = {
    terms: TERMS_OF_SERVICE_CONTENT,
    privacy: PRIVACY_POLICY_CONTENT,
    coppa: COPPA_MINOR_PRIVACY_CONTENT,
    california: CALIFORNIA_PRIVACY_NOTICE_CONTENT,
    sms: SMS_A2P_COMPLIANCE_CONTENT,
    irs: IRS_TAX_SUBSTANTIATION_CONTENT
  };

  const currentDoc = docMap[activeTab];

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return currentDoc.sections;
    const q = searchQuery.toLowerCase();
    return currentDoc.sections.filter(
      s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [currentDoc, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const fullText = `${currentDoc.title}\nVersion ${currentDoc.version} | Last Updated: ${currentDoc.lastUpdated}\n\n${currentDoc.summary}\n\n` +
      currentDoc.sections.map(s => `${s.title}\n${s.content}\n`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">REACH Legal & Compliance Studio</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                  v{currentDoc.version} Live
                </span>
              </div>
              <p className="text-xs text-slate-400">Official statutory policies, minor protections, and regulatory compliance standards.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
              title="Copy policy text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
              title="Print policy"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-400 flex items-center justify-center transition border border-slate-700 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'terms' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'privacy' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('coppa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'coppa' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>COPPA & Minor Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('california')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'california' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>California Notice & Do Not Sell</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sms' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS A2P 10DLC Terms</span>
          </button>

          <button
            onClick={() => setActiveTab('irs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'irs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>IRS 501(c)(3) Substantiation</span>
          </button>
        </div>

        {/* Search Ribbon */}
        <div className="bg-white px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4 print:hidden">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search within ${currentDoc.title}...`}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            />
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <span>Last Updated: <strong>{currentDoc.lastUpdated}</strong></span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed">
          
          {/* Doc Title & Summary Callout */}
          <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{currentDoc.title}</h1>
            <p className="text-xs text-slate-600 font-medium">{currentDoc.summary}</p>
          </div>

          {filteredSections.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No matching sections found for "{searchQuery}".</p>
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.id} className="space-y-2 pb-6 border-b border-slate-100 last:border-b-0">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  <span>{section.title}</span>
                </h3>
                <div className="text-slate-600 whitespace-pre-line text-xs font-normal pl-3 border-l-2 border-slate-100">
                  {section.content}
                </div>
              </div>
            ))
          )}

          {/* Footer Notice */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} REACH (R3Pro). All rights reserved. Platform security compliant with SOC 2 Type II, COPPA, and IRS 501(c)(3) standards.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
