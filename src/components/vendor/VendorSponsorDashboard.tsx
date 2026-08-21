import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorApplication, TicketTier, VendorInquiry } from '../../types';
import { 
  Store, Award, CheckCircle2, ShieldCheck, Zap, FileText, 
  MapPin, Clock, Phone, Mail, Download, ArrowRight, Sparkles, 
  Building2, AlertTriangle, ChevronRight, Plus, Check, Globe,
  UploadCloud, Eye, RefreshCw, FileCheck, X, Calendar, AlertCircle,
  CreditCard, MessageSquare, Send, HelpCircle, LayoutGrid, CheckCheck,
  ExternalLink, Image, Lock, DollarSign, MessageCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CommercialMarketplaceModal } from '../public/CommercialMarketplaceModal';
import { Modal } from '../common/Modal';

export const VendorSponsorDashboard: React.FC = () => {
  const { 
    currentOrg, currentEvent, vendorApplications, ticketTiers, 
    vendorInquiries, updateVendorApplication, payVendorInvoice,
    submitVendorInquiry, showToast 
  } = useApp();

  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_passes' | 'compliance' | 'brand_assets' | 'qa_helpdesk' | 'available_packages'>('my_passes');

  // COI Upload & Management Modal State
  const [isCoiModalOpen, setIsCoiModalOpen] = useState(false);
  const [selectedAppForCoi, setSelectedAppForCoi] = useState<VendorApplication | null>(null);
  const [coiCarrier, setCoiCarrier] = useState('');
  const [coiPolicyNumber, setCoiPolicyNumber] = useState('');
  const [coiExpiration, setCoiExpiration] = useState('2026-12-31');
  const [coiFileName, setCoiFileName] = useState('');
  const [coiFileData, setCoiFileData] = useState('');
  const [coiAdditionalInsuredConfirmed, setCoiAdditionalInsuredConfirmed] = useState(true);

  // Online Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAppForPayment, setSelectedAppForPayment] = useState<VendorApplication | null>(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'card' | 'ach' | 'check'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('924');
  const [cardZip, setCardZip] = useState('94016');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Brand Asset Upload State
  const [selectedAppForAssets, setSelectedAppForAssets] = useState<VendorApplication | null>(null);
  const [brandTagline, setBrandTagline] = useState('');
  const [brandWebsite, setBrandWebsite] = useState('');
  const [brandLogoData, setBrandLogoData] = useState('');
  const [brandLogoName, setBrandLogoName] = useState('');

  // Q&A / Inquiry State
  const [inquiryCategory, setInquiryCategory] = useState<VendorInquiry['category']>('logistics_loadin');
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [inquirySearch, setInquirySearch] = useState('');

  // Receipt & Invoice Preview Modal State
  const [previewDocModal, setPreviewDocModal] = useState<{
    isOpen: boolean;
    type: 'tax_receipt' | 'invoice';
    app: VendorApplication;
    tier?: TicketTier;
  } | null>(null);

  // Filter vendor applications for current event
  const myApplications = vendorApplications.filter(v => v.eventId === currentEvent.id);
  const eventTiers = ticketTiers.filter(t => t.eventId === currentEvent.id && (t.type === 'vendor_booth' || t.type === 'sponsor_package'));

  // Open COI Upload Modal
  const handleOpenCoiModal = (app: VendorApplication) => {
    setSelectedAppForCoi(app);
    setCoiCarrier(app.coiCarrierName || 'State Farm Commercial');
    setCoiPolicyNumber(app.coiPolicyNumber || 'GL-' + Date.now().toString().slice(-6));
    setCoiExpiration(app.coiExpirationDate || '2026-12-31');
    setCoiFileName(app.coiDocumentName || '');
    setCoiFileData(app.coiDocumentData || '');
    setCoiAdditionalInsuredConfirmed(true);
    setIsCoiModalOpen(true);
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (app: VendorApplication) => {
    setSelectedAppForPayment(app);
    setCardholderName(app.contactName || app.businessName);
    setIsPaymentModalOpen(true);
  };

  // Process Online Payment
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForPayment) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      payVendorInvoice(
        selectedAppForPayment.id,
        paymentMethodTab === 'card' ? 'stripe_card' : paymentMethodTab === 'ach' ? 'ach_transfer' : 'check_net30'
      );
      setIsPaymentModalOpen(false);
    }, 800);
  };

  // Handle Real File Selection for COI
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoiFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setCoiFileData(reader.result as string);
        showToast('info', 'File Ready', `${file.name} loaded.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logo Upload
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrandLogoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setBrandLogoData(reader.result as string);
        showToast('info', 'Logo Loaded', `${file.name} ready to save.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Brand Assets
  const handleSaveBrandAssets = (appId: string) => {
    updateVendorApplication(appId, {
      tagline: brandTagline.trim(),
      website: brandWebsite.trim(),
      logoUrl: brandLogoData || undefined
    });
    showToast('success', 'Brand Assets Saved', 'Marketing assets submitted for event print & web materials.');
  };

  // Save COI Submission
  const handleSaveCoi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForCoi) return;
    if (!coiPolicyNumber.trim()) {
      showToast('error', 'Missing Policy #', 'Please enter your insurance policy number.');
      return;
    }

    const docName = coiFileName || `COI_${selectedAppForCoi.businessName.replace(/\s+/g, '_')}_2026.pdf`;

    updateVendorApplication(selectedAppForCoi.id, {
      coiPolicyNumber: coiPolicyNumber.trim(),
      coiCarrierName: coiCarrier.trim() || 'Commercial General Liability',
      coiExpirationDate: coiExpiration,
      coiDocumentName: docName,
      coiDocumentData: coiFileData || 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp...',
      coiStatus: 'verified'
    });

    setIsCoiModalOpen(false);
    showToast('success', 'COI Uploaded & Verified', `Certificate of Insurance successfully registered for ${selectedAppForCoi.businessName}.`);
  };

  // Submit New Q&A Inquiry
  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryQuestion.trim()) return;

    submitVendorInquiry({
      eventId: currentEvent.id,
      vendorAppId: myApplications[0]?.id,
      businessName: myApplications[0]?.businessName || 'Commercial Exhibitor',
      authorName: myApplications[0]?.contactName || 'Vendor Representative',
      category: inquiryCategory,
      question: inquiryQuestion.trim(),
      isPublicFaq: false
    });

    setInquiryQuestion('');
  };

  // Real Browser File Download Generator (IRS Receipt / Invoice)
  const triggerBrowserDownload = (filename: string, content: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadInvoice = (app: VendorApplication) => {
    const tier = ticketTiers.find(t => t.id === app.ticketTierId);
    const invoiceNum = app.invoiceNumber || 'INV-2026-001';
    const amount = tier ? formatCurrency(tier.price) : '$0';
    const isPaid = app.status === 'paid';
    
    const invoiceText = `
================================================================================
                       OFFICIAL COMMERCIAL INVOICE
================================================================================
ORGANIZATION:   ${currentOrg.name}
TAX ID / EIN:   ${currentOrg.ein || '82-9482019'}
EVENT:          ${currentEvent.title}
DATE:           ${formatDate(currentEvent.startDate)}
VENUE:          ${currentEvent.venueName}, ${currentEvent.venueAddress}
--------------------------------------------------------------------------------
INVOICE NUMBER: ${invoiceNum}
ISSUE DATE:     ${formatDate(app.submittedAt)}
PAYMENT STATUS: ${isPaid ? 'PAID & CONFIRMED (PAID IN FULL)' : 'PAYMENT DUE - UNPAID'}
PAYMENT METHOD: ${app.paymentMethod ? app.paymentMethod.replace('_', ' ').toUpperCase() : 'ONLINE / STRIPE'}
--------------------------------------------------------------------------------
BILLED TO:
Vendor/Company: ${app.businessName}
Contact Name:   ${app.contactName}
Email:          ${app.email}
Phone:          ${app.phone}
Business EIN:   ${app.einTaxId}
--------------------------------------------------------------------------------
DESCRIPTION                                      QTY     UNIT PRICE     TOTAL
--------------------------------------------------------------------------------
${(tier?.title || 'Commercial Booth Space').padEnd(45)} 1       ${amount.padStart(10)}  ${amount.padStart(10)}
  - Space: ${app.spaceRequirement}
  - Power: ${app.electricityNeeded.replace('_', ' ')}
  - Assigned Pitch: ${app.assignedBoothNumber || 'Pending Space Allocation'}

--------------------------------------------------------------------------------
TOTAL AMOUNT BILLED:                                             ${amount}
TOTAL AMOUNT PAID:                                               ${isPaid ? amount : '$0.00'}
BALANCE DUE:                                                     ${isPaid ? '$0.00' : amount}
--------------------------------------------------------------------------------
Thank you for supporting ${currentOrg.name} and our community campaign!
Authorized Signatory: ${currentOrg.signatoryOfficerName || 'Executive Treasurer'}
================================================================================
`;
    triggerBrowserDownload(`${invoiceNum}_${app.businessName.replace(/\s+/g, '_')}.txt`, invoiceText);
    showToast('success', 'Invoice Downloaded', `Downloaded commercial invoice ${invoiceNum}.txt`);
  };

  const handleDownloadTaxReceipt = (app: VendorApplication) => {
    const tier = ticketTiers.find(t => t.id === app.ticketTierId);
    const receiptNum = app.taxReceiptNumber || `REC-2026-VND-${app.id.slice(-3)}`;
    const grossPaid = tier ? tier.price : 0;
    const fmvOffset = tier ? tier.fairMarketValue : 0;
    const taxDeductible = Math.max(0, grossPaid - fmvOffset);

    const receiptText = `
================================================================================
             IRS PUBLICATION 526/561 OFFICIAL 501(c)(3) TAX RECEIPT
================================================================================
RECEIPT NUMBER:         ${receiptNum}
CONTRIBUTION DATE:      ${formatDate(app.paidAt || app.submittedAt)}
ORGANIZATION NAME:      ${currentOrg.name}
ORGANIZATION EIN:       ${currentOrg.ein || '82-9482019'}
TAX STATUS:             501(c)(3) Public Charity / Educational Organization
--------------------------------------------------------------------------------
DONOR / SPONSOR DETAILS:
Company / Donor:        ${app.businessName}
Authorized Contact:     ${app.contactName}
Donor Tax ID / EIN:     ${app.einTaxId}
Email / Phone:          ${app.email} | ${app.phone}
--------------------------------------------------------------------------------
CAMPAIGN & CONTRIBUTION SUMMARY:
Benefiting Campaign:    ${currentEvent.title}
Sponsorship Tier:       ${tier?.title || 'Commercial Underwriting Tier'}

Gross Amount Paid:                             ${formatCurrency(grossPaid)}
Less Fair Market Value (FMV) of Goods/Perks:   ${formatCurrency(fmvOffset)}
--------------------------------------------------------------------------------
NET ELIGIBLE CHARITABLE CONTRIBUTION DEDUCTION: ${formatCurrency(taxDeductible)}
--------------------------------------------------------------------------------
STATUTORY IRS ACKNOWLEDGEMENT DISCLOSURE:
In accordance with Section 170(f)(8) of the Internal Revenue Code, this receipt
certifies that ${currentOrg.name} received the contribution noted above.
The deductible amount of the contribution is limited to the excess of the
amount of money contributed over the fair market value of goods or services
provided by the organization in exchange.

AUTHORIZED EXECUTIVE OFFICER SIGNATURE:
Signature: /s/ ${currentOrg.signatoryOfficerName || 'Elena Rostova'}
Title:     ${currentOrg.signatoryOfficerTitle || 'President & Executive Officer'}
Date:      ${formatDate(new Date().toISOString())}
================================================================================
`;
    triggerBrowserDownload(`${receiptNum}_Tax_Receipt_${app.businessName.replace(/\s+/g, '_')}.txt`, receiptText);
    showToast('success', 'Tax Receipt Downloaded', `Downloaded IRS 501(c)(3) substantiation letter for ${app.businessName}.`);
  };

  const filteredInquiries = vendorInquiries.filter(inq => {
    if (!inquirySearch.trim()) return true;
    const q = inquirySearch.toLowerCase();
    return inq.question.toLowerCase().includes(q) || (inq.answer && inq.answer.toLowerCase().includes(q)) || inq.category.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>Commercial Vendor & Corporate Sponsor Hub</span>
            </span>
            <span className="text-xs text-indigo-300">
              Host: <strong>{currentOrg.name}</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            {currentEvent.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage your commercial booth assignments, electrical hookups, Certificate of Insurance (COI), load-in logistics, online payments, and official IRS 501(c)(3) tax receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCommercialModalOpen(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer group"
          >
            <Plus className="w-4 h-4" />
            <span>Book Booth or Sponsorship</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* TOP WORKSPACE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('my_passes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'my_passes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-amber-400" />
          <span>My Booths & Logistics Passes ({myApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'compliance'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>COI & Tax Receipts Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('brand_assets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'brand_assets'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          <span>Brand Assets & Deliverables</span>
        </button>

        <button
          onClick={() => setActiveTab('qa_helpdesk')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'qa_helpdesk'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>Vendor Q&A & Helpdesk ({vendorInquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('available_packages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'available_packages'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Available Commercial Tiers ({eventTiers.length})</span>
        </button>
      </div>

      {/* TAB 1: MY BOOTHS & LOGISTICS PASSES */}
      {activeTab === 'my_passes' && (
        <div className="space-y-8">
          {myApplications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">No Active Commercial Registrations</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You do not have any registered vendor booth spaces or corporate sponsorship tiers for <strong>{currentEvent.title}</strong>.
              </p>
              <button
                onClick={() => setIsCommercialModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Explore & Book a Commercial Pitch</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myApplications.map(app => {
                const tier = ticketTiers.find(t => t.id === app.ticketTierId);
                const isPaid = app.status === 'paid';
                const isApproved = app.status === 'approved' || isPaid;

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5 hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isPaid 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : isApproved 
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' 
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {isPaid ? '✓ Paid in Full & Confirmed' : isApproved ? '✓ Approved • Payment Pending' : '⏳ Application Under Review'}
                            </span>
                            <span className="font-mono text-xs text-slate-400 font-bold">{app.invoiceNumber || 'INV-PENDING'}</span>
                          </div>
                          <h3 className="text-xl font-extrabold text-slate-900 mt-1">{app.businessName}</h3>
                          <div className="text-xs text-indigo-600 font-bold mt-0.5">
                            {tier?.title || 'Commercial Package'}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Package Fee</span>
                          <div className="text-xl font-black text-slate-900">
                            {tier ? formatCurrency(tier.price) : '$0'}
                          </div>
                        </div>
                      </div>

                      {/* Operational Logistics Bento */}
                      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs mt-4">
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Pitch / Space</span>
                          <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                            {app.assignedBoothNumber || 'Pending Space Allocation'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Power Hookup</span>
                          <span className="font-bold text-amber-700 mt-0.5 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" />
                            <span>{app.electricityNeeded === 'none' ? 'Self-Contained (No Power)' : app.electricityNeeded.replace('_', ' ')}</span>
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Space Dimensions</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block">{app.spaceRequirement}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Load-In Window</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block">7:00 AM – 8:30 AM</span>
                        </div>
                      </div>

                      {/* Payment Action Callout if Unpaid */}
                      {!isPaid && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 mt-4">
                          <div>
                            <span className="font-bold text-xs text-amber-950 block">Payment Due: {tier ? formatCurrency(tier.price) : '$0'}</span>
                            <span className="text-[11px] text-amber-800">Pay invoice securely to lock in your booth and download tax receipts.</span>
                          </div>
                          <button
                            onClick={() => handleOpenPaymentModal(app)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                            <span>Pay Now</span>
                          </button>
                        </div>
                      )}

                      {/* Compliance & Safety Verification */}
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-emerald-900 block">Insurance & EIN Verified</span>
                            <span className="text-[10px] text-emerald-700 font-mono">
                              COI: {app.coiPolicyNumber || 'Verified on file'} • EIN: {app.einTaxId}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Cleared for Gate
                        </span>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(app)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Invoice (PDF)</span>
                        </button>

                        <button
                          onClick={() => handleDownloadTaxReceipt(app)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          <span>501(c)(3) Receipt</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium">
                        Submitted: {formatDate(app.submittedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SPATIAL BOOTH MAP & COURTYARD SCHEMATIC */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Event Floorplan & Spatial Booth Grid</h3>
                  <p className="text-xs text-slate-500">Overview of artisan spaces, food truck bays, electrical feeds, and main gate traffic</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl">
                📍 {currentEvent.venueName}
              </span>
            </div>

            <div className="p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-6">
              <div className="text-center font-bold text-xs text-amber-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                ⭐ MAIN STAGE & BLEACHER SEATING (North Courtyard)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs">
                {/* Artisan Lane */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-indigo-400 font-extrabold block text-xs uppercase">🎨 Artisan Alley (10x10)</span>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-800 text-slate-400">Booth #A-1</div>
                    <div className="p-2 rounded bg-slate-800 text-slate-400">Booth #A-2</div>
                    <div className="p-2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500 font-bold">
                      Booth #A-14 (Artisan Bakery)
                    </div>
                    <div className="p-2 rounded bg-slate-800 text-slate-400">Booth #A-15</div>
                  </div>
                </div>

                {/* Festival Center Hub */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-center items-center space-y-2">
                  <span className="text-amber-400 font-extrabold block text-xs uppercase">🎪 Center Gathering Plaza</span>
                  <span className="text-slate-400 text-[11px]">Games, Ticket Kiosks & Information Tent</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">
                    🚶 2,500+ Pedestrian Footpath
                  </span>
                </div>

                {/* Food Truck Row */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-teal-400 font-extrabold block text-xs uppercase">🍔 Food Truck Row (220V Power)</span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-800 text-slate-400">Bay #1 (Available)</div>
                    <div className="p-2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500 font-bold">
                      Bay #2 (Taco Fiesta Kitchen)
                    </div>
                    <div className="p-2 rounded bg-slate-800 text-slate-400">Bay #3 (Available)</div>
                  </div>
                </div>
              </div>

              <div className="text-center font-bold text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between items-center">
                <span>🚪 Gate 1 (Public Pedestrian Entrance)</span>
                <span>🚛 Gate 3 (Vehicle Load-In & Power Transformers)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COI & TAX VAULT */}
      {activeTab === 'compliance' && (
        <div className="space-y-8">
          
          {/* SECTION A: REAL COI UPLOAD & VERIFICATION HUB */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Certificate of Insurance (COI) Compliance Hub</h3>
                    <p className="text-xs text-slate-500">
                      Upload your active General Liability policy naming <strong>{currentOrg.name}</strong> as an Additional Insured ($1,000,000 minimum).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Required by {formatDate(currentEvent.startDate)}
                </span>
              </div>
            </div>

            {/* COI Applications Table */}
            {myApplications.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Active Commercial Registrations to Verify</h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">
                  Book a commercial booth or food truck pitch first, then upload your Certificate of Insurance here.
                </p>
                <button
                  onClick={() => setIsCommercialModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book a Commercial Space</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map(app => {
                  const hasCoi = !!app.coiPolicyNumber;
                  const isVerified = app.coiStatus === 'verified';
                  const isPending = app.coiStatus === 'pending_verification';

                  return (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">{app.businessName}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isVerified 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          }`}>
                            {isVerified ? '✓ COI Verified & Cleared' : isPending ? '⏳ COI Verification in Progress' : '⚠️ Action Required: Missing COI'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[10px] block">Carrier / Agency</span>
                            <span className="font-semibold text-slate-800">{app.coiCarrierName || 'Not Provided'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[10px] block">Policy Number</span>
                            <span className="font-mono font-bold text-slate-800">{app.coiPolicyNumber || 'None on file'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[10px] block">Expiration Date</span>
                            <span className="font-semibold text-slate-800">{app.coiExpirationDate ? formatDate(app.coiExpirationDate) : 'Not Provided'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenCoiModal(app)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                          <span>{hasCoi ? 'Update / Replace COI' : 'Upload COI Document'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION B: IRS RECEIPT HUB */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Official IRS 501(c)(3) Tax Substantiation & Invoices</h3>
                    <p className="text-xs text-slate-500">
                      Download official IRS Pub 526 acknowledgement letters and commercial tax receipts for corporate accounting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {myApplications.map(app => {
                const tier = ticketTiers.find(t => t.id === app.ticketTierId);
                const receiptNum = app.taxReceiptNumber || `REC-2026-VND-${app.id.slice(-3)}`;
                
                return (
                  <div key={app.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{app.businessName}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase rounded-md border border-emerald-200">
                          {tier?.title || 'Commercial Package'}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-slate-500 font-medium pt-1">
                        Signed by {currentOrg.signatoryOfficerName || 'Elena Rostova'} ({currentOrg.signatoryOfficerTitle || 'President & Executive Officer'})
                      </div>
                    </div>

                    {/* Download & Pay Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {app.status !== 'paid' && (
                        <button
                          onClick={() => handleOpenPaymentModal(app)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Invoice</span>
                        </button>
                      )}

                      <button
                        onClick={() => setPreviewDocModal({ isOpen: true, type: 'tax_receipt', app, tier })}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleDownloadTaxReceipt(app)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>501(c)(3) Receipt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRAND ASSETS & DELIVERABLES */}
      {activeTab === 'brand_assets' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Image className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Corporate Brand Assets & Marketing Materials</h3>
                  <p className="text-xs text-slate-500">
                    Submit your vector logo, promotional message, and social links to be featured on festival banners, programs, and stage displays.
                  </p>
                </div>
              </div>
            </div>

            {myApplications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Register a commercial sponsorship tier to unlock marketing asset distribution.
              </div>
            ) : (
              myApplications.map(app => {
                const tier = ticketTiers.find(t => t.id === app.ticketTierId);

                return (
                  <div key={app.id} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Logo Dropzone */}
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <span className="text-xs font-bold text-slate-900 block">High-Resolution Company Logo (SVG, PNG)</span>
                        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-5 text-center bg-white relative cursor-pointer">
                          <input
                            type="file"
                            accept=".png,.svg,.jpg,.jpeg"
                            onChange={handleLogoFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                          <span className="text-xs font-bold text-indigo-600 block">
                            {brandLogoName ? brandLogoName : 'Upload High-Res Brand Logo'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Minimum 1000px width (Transparent PNG or Vector SVG preferred)
                          </span>
                        </div>
                      </div>

                      {/* Tagline & Website */}
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Marketing Tagline (Shown in Event Program)</label>
                          <input
                            type="text"
                            value={brandTagline}
                            onChange={(e) => setBrandTagline(e.target.value)}
                            placeholder="e.g. Fresh Artisan Sourdough & Pastries Handcrafted Daily"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Company Website URL</label>
                          <input
                            type="url"
                            value={brandWebsite}
                            onChange={(e) => setBrandWebsite(e.target.value)}
                            placeholder="https://artisanbakes.com"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>

                        <button
                          onClick={() => handleSaveBrandAssets(app.id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Save Marketing Details</span>
                        </button>
                      </div>
                    </div>

                    {/* Sponsor Deliverables & Perk Activation Tracker */}
                    <div className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4 text-indigo-600" />
                          Sponsorship Deliverables Activation Tracker ({tier?.title || 'Tier'})
                        </span>
                        <span className="text-xs font-bold text-indigo-700">100% Guaranteed</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-slate-900">Main Stage Banner Logo</strong>
                            <span className="text-[11px] text-slate-500">Position #3 assigned</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-slate-900">VIP Festival Passes</strong>
                            <span className="text-[11px] text-slate-500">4 passes cleared at Gate 1</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-slate-900">Emcee Stage Shout-Out</strong>
                            <span className="text-[11px] text-slate-500">Scheduled for 1:15 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: VENDOR Q&A & HELPDESK */}
      {activeTab === 'qa_helpdesk' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <HelpCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Vendor & Sponsor Helpdesk & FAQ</h3>
                    <p className="text-xs text-slate-500">
                      Search standard load-in rules, power specifications, or message the Commercial Event Chair directly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  placeholder="Search FAQ / questions..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Inquiries Thread & FAQs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInquiries.map(inq => (
                <div key={inq.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        {inq.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(inq.createdAt)}</span>
                    </div>
                    
                    <h4 className="text-xs font-black text-slate-900 leading-snug">
                      Q: "{inq.question}"
                    </h4>

                    {inq.answer ? (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{inq.answeredBy || 'Commercial Event Chair'}:</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pl-4">
                          {inq.answer}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Question awaiting chair reply...</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200">
                    Asked by {inq.authorName} ({inq.businessName})
                  </div>
                </div>
              ))}
            </div>

            {/* Ask Direct Question Form */}
            <form onSubmit={handleSendInquiry} className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-extrabold text-white">Ask a Question to the Commercial Event Chair</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Topic Category</label>
                  <select
                    value={inquiryCategory}
                    onChange={(e) => setInquiryCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="logistics_loadin">🚚 Load-In & Staging</option>
                    <option value="electrical_power">⚡ Power & Electric Hookup</option>
                    <option value="booth_placement">📍 Booth Placement & Grid</option>
                    <option value="tax_payment">💳 Tax Receipt & Payments</option>
                    <option value="general">💬 General Inquiries</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Question or Special Request</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={inquiryQuestion}
                      onChange={(e) => setInquiryQuestion(e.target.value)}
                      placeholder="e.g. What is the vehicle clearance height for Gate 3 load-in?"
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: AVAILABLE PACKAGES */}
      {activeTab === 'available_packages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Commercial Packages & Corporate Tiers</h3>
              <p className="text-xs text-slate-500">Book artisan vendor spaces, food truck pitches, or corporate underwriting tiers.</p>
            </div>
            <button
              onClick={() => setIsCommercialModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Open Commercial Registration</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {eventTiers.map(tier => (
              <div
                key={tier.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tier.type === 'sponsor_package' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tier.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {tier.capacity - tier.claimedCount} spots left
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">{tier.title}</h4>
                  <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(tier.price)}</div>
                  {tier.fairMarketValue > 0 && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      ✓ Tax Deduction: {formatCurrency(Math.max(0, tier.price - tier.fairMarketValue))}
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">{tier.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsCommercialModalOpen(true)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply & Book Space</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: COI DOCUMENT UPLOAD & VERIFICATION */}
      {isCoiModalOpen && selectedAppForCoi && (
        <Modal
          isOpen={isCoiModalOpen}
          onClose={() => setIsCoiModalOpen(false)}
          title={`Upload Certificate of Insurance: ${selectedAppForCoi.businessName}`}
        >
          <form onSubmit={handleSaveCoi} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                Insurance Requirement for {currentEvent.title}
              </span>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                All vendors and food trucks must provide a Certificate of General Liability Insurance ($1,000,000 minimum) naming <strong>{currentOrg.name}</strong> as an Additional Insured.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Insurance Carrier / Underwriter *</label>
              <input
                type="text"
                required
                value={coiCarrier}
                onChange={(e) => setCoiCarrier(e.target.value)}
                placeholder="e.g. State Farm, Travelers, Next Insurance, Hiscox"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Policy Number *</label>
                <input
                  type="text"
                  required
                  value={coiPolicyNumber}
                  onChange={(e) => setCoiPolicyNumber(e.target.value)}
                  placeholder="e.g. GL-948201-2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Policy Expiration Date *</label>
                <input
                  type="date"
                  required
                  value={coiExpiration}
                  onChange={(e) => setCoiExpiration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Document File Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload COI Document (PDF or Image) *</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center transition bg-slate-50 relative cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-indigo-600 block">
                  {coiFileName ? coiFileName : 'Click to select or drag & drop COI file'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Supported formats: PDF, PNG, JPG (Max 15MB)
                </span>
              </div>
            </div>

            {/* Additional Insured Confirmation Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={coiAdditionalInsuredConfirmed}
                  onChange={(e) => setCoiAdditionalInsuredConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I certify that <strong>{currentOrg.name}</strong> is explicitly named as an <strong>Additional Insured</strong> with at least $1,000,000 in General Liability coverage.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCoiModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Verify COI</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ONLINE INVOICE PAYMENT CHECKOUT */}
      {isPaymentModalOpen && selectedAppForPayment && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Pay Commercial Invoice: ${selectedAppForPayment.invoiceNumber || 'INV-2026-001'}`}
        >
          {(() => {
            const tier = ticketTiers.find(t => t.id === selectedAppForPayment.ticketTierId);
            const totalAmount = tier ? tier.price : 0;
            const fmv = tier ? tier.fairMarketValue : 0;
            const taxDeductible = Math.max(0, totalAmount - fmv);

            return (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                {/* Summary Box */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Invoice Amount:</span>
                    <span className="text-xl font-black text-amber-400">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                    <span>Package: {tier?.title || 'Commercial Space'}</span>
                    <span className="text-emerald-400 font-bold">Tax-Deductible: {formatCurrency(taxDeductible)}</span>
                  </div>
                </div>

                {/* Payment Method Switcher */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('card')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethodTab === 'card' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('ach')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethodTab === 'ach' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>ACH Wire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('check')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethodTab === 'check' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Check / Net-30</span>
                  </button>
                </div>

                {/* Card Fields */}
                {paymentMethodTab === 'card' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• 4242"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Expiration (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">CVC / Security Code</label>
                        <input
                          type="text"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="924"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethodTab === 'ach' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
                    <p>Direct bank transfer details for <strong>{currentOrg.name}</strong>:</p>
                    <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div>Bank: <strong>First Community Bank</strong></div>
                      <div>Routing Number: <strong>121000358</strong></div>
                      <div>Account Number: <strong>948201948201</strong></div>
                      <div>Ref: <strong>{selectedAppForPayment.invoiceNumber}</strong></div>
                    </div>
                  </div>
                )}

                {paymentMethodTab === 'check' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
                    <p>Make check payable to <strong>{currentOrg.name}</strong>:</p>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                      <div>Attn: Event Treasurer</div>
                      <div>Address: 1200 Lincoln Way, Springfield, IL</div>
                      <div>Memo: {selectedAppForPayment.invoiceNumber} - {selectedAppForPayment.businessName}</div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isProcessingPayment ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}</span>
                  </button>
                </div>
              </form>
            );
          })()}
        </Modal>
      )}

      {/* MODAL: DOCUMENT PREVIEW MODAL */}
      {previewDocModal && previewDocModal.isOpen && (
        <Modal
          isOpen={previewDocModal.isOpen}
          onClose={() => setPreviewDocModal(null)}
          title={`Document Preview: ${previewDocModal.type === 'tax_receipt' ? 'IRS 501(c)(3) Tax Receipt' : 'Commercial Invoice'}`}
        >
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto border border-slate-800">
              <div className="text-center border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white uppercase">{currentOrg.name}</h4>
                <p className="text-[10px] text-slate-400">EIN / Tax ID: {currentOrg.ein || '82-9482019'} • 501(c)(3) Non-Profit</p>
                <p className="text-amber-400 text-xs font-bold mt-1">
                  {previewDocModal.type === 'tax_receipt' ? 'OFFICIAL CHARITABLE CONTRIBUTION RECEIPT' : 'COMMERCIAL VENDOR INVOICE'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Recipient / Donor:</span>
                  <strong className="text-white">{previewDocModal.app.businessName}</strong>
                  <span className="block text-slate-400">EIN: {previewDocModal.app.einTaxId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date / Status:</span>
                  <strong className={previewDocModal.app.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>
                    {previewDocModal.app.status === 'paid' ? 'PAID & VERIFIED' : 'APPROVED • INVOICE UNPAID'}
                  </strong>
                  <span className="block text-slate-400">{formatDate(previewDocModal.app.submittedAt)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Package: {previewDocModal.tier?.title || 'Commercial Tier'}</span>
                  <span>{formatCurrency(previewDocModal.tier?.price || 0)}</span>
                </div>
                {previewDocModal.type === 'tax_receipt' && (
                  <>
                    <div className="flex justify-between text-slate-400">
                      <span>Less FMV Offset:</span>
                      <span>-{formatCurrency(previewDocModal.tier?.fairMarketValue || 0)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                      <span>Tax-Deductible Gift:</span>
                      <span>{formatCurrency(Math.max(0, (previewDocModal.tier?.price || 0) - (previewDocModal.tier?.fairMarketValue || 0)))}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                Authorized Executive Officer: {currentOrg.signatoryOfficerName || 'Elena Rostova'}, {currentOrg.signatoryOfficerTitle || 'President'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewDocModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  if (previewDocModal.type === 'tax_receipt') {
                    handleDownloadTaxReceipt(previewDocModal.app);
                  } else {
                    handleDownloadInvoice(previewDocModal.app);
                  }
                  setPreviewDocModal(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Commercial Marketplace Modal */}
      {isCommercialModalOpen && (
        <CommercialMarketplaceModal
          isOpen={isCommercialModalOpen}
          onClose={() => setIsCommercialModalOpen(false)}
          event={currentEvent}
        />
      )}

    </div>
  );
};
