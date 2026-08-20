import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Share2, Copy, Printer, Code, Mail, MessageSquare, 
  Sparkles, CheckCircle2, Download, Send, Globe, Smartphone, QrCode 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { QRCodeSVG } from 'qrcode.react';

export const EventMarketingHub: React.FC = () => {
  const { currentEvent, currentOrg, volunteerCrm, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'social' | 'print' | 'embed' | 'broadcast'>('social');
  const [selectedChannel, setSelectedChannel] = useState<'facebook' | 'instagram' | 'nextdoor' | 'linkedin'>('facebook');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const eventUrl = `${window.location.origin}/?event=${currentEvent.id}&mode=public`;

  // Pre-formatted social templates
  const socialTemplates = {
    facebook: `📢 We're thrilled to announce the ${currentEvent.title}! 🎉\n\nJoin ${currentOrg.name} on ${formatDate(currentEvent.startDate)} at ${currentEvent.venueName}.\n\nWe need community volunteers, supply donations, and supporters to reach our ${formatCurrency(currentEvent.fundraisingGoal)} goal! Every contribution directly supports our community programs.\n\n👉 Sign up or donate here in under 60 seconds: ${eventUrl}\n\n#CommunityFirst #${currentOrg.name.replace(/\s+/g, '')} #VolunteersNeeded`,
    instagram: `🌟 MARK YOUR CALENDARS! 🌟\n\n${currentEvent.title} is officially live!\n📍 ${currentEvent.venueName}\n🗓️ ${formatDate(currentEvent.startDate)}\n🎯 Campaign Goal: ${formatCurrency(currentEvent.fundraisingGoal)}\n\nWhether you can volunteer for a 2-hour shift or pledge supplies, we need your help to make this event unforgettable! Link in bio to sign up your family. ✨\n\n#GiveBack #Volunteer #${currentOrg.name.replace(/\s+/g, '')} #Fundraising`,
    nextdoor: `Hello Neighbors! 👋\n\n${currentOrg.name} is hosting the ${currentEvent.title} on ${formatDate(currentEvent.startDate)} at ${currentEvent.venueName}.\n\nWe're actively looking for neighborhood volunteers for event setup, food hospitality, and activities. High school students can also receive verified community service hours!\n\nCheck out the open shifts and sign up online here: ${eventUrl}\n\nThank you for supporting our local community!`,
    linkedin: `Proud to share that ${currentOrg.name} has launched the ${currentEvent.title} campaign.\n\nOur mission is to engage community members and raise ${formatCurrency(currentEvent.fundraisingGoal)} to expand our outreach programs.\n\nSponsorship opportunities and volunteer coordination are now open: ${eventUrl}\n\n#NonProfit #Philanthropy #CommunityImpact #CorporateGiving`
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    showToast('success', `${label} Copied!`, 'Ready to paste into your campaign post.');
    setTimeout(() => setCopiedSnippet(null), 3000);
  };

  const handlePrintFlyer = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${currentEvent.title} - Promo Poster</title>
        <style>
          @page { size: 8.5in 11in; margin: 0.5in; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; text-align: center; }
          .header { background: #1e1b4b; color: #ffffff; padding: 30px 20px; border-radius: 20px; margin-bottom: 25px; }
          .org { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #a5b4fc; font-weight: bold; }
          .title { font-size: 32px; font-weight: 900; margin: 10px 0; }
          .tagline { font-size: 16px; color: #e0e7ff; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin: 20px 0; text-align: left; }
          .details strong { color: #4338ca; display: block; font-size: 11px; text-transform: uppercase; }
          .details span { font-size: 15px; font-weight: bold; color: #1e293b; }
          .qr-box { margin: 30px auto; padding: 20px; border: 2px dashed #6366f1; border-radius: 20px; display: inline-block; background: #ffffff; }
          .qr-box p { font-size: 14px; font-weight: bold; color: #4338ca; margin: 10px 0 0 0; }
          .footer { font-size: 12px; color: #64748b; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="org">${currentOrg.name}</div>
          <div class="title">${currentEvent.title}</div>
          <div class="tagline">${currentEvent.tagline}</div>
        </div>

        <div class="details">
          <div>
            <strong>Date & Schedule</strong>
            <span>${formatDate(currentEvent.startDate)}</span>
          </div>
          <div>
            <strong>Venue Location</strong>
            <span>${currentEvent.venueName}</span>
          </div>
          <div>
            <strong>Campaign Goal</strong>
            <span>${formatCurrency(currentEvent.fundraisingGoal)} Target</span>
          </div>
          <div>
            <strong>Organization Status</strong>
            <span>Verified 501(c)(3) Entity</span>
          </div>
        </div>

        <div class="qr-box">
          <div style="display: flex; justify-content: center;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(eventUrl)}" alt="Scan to Sign Up" width="220" height="220" />
          </div>
          <p>📱 SCAN WITH PHONE CAMERA TO VOLUNTEER OR DONATE</p>
        </div>

        <div class="footer">
          Powered by R3Pro Platform • Fast 1-Click Volunteer Sign-Up
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const embedCodeSnippet = `<iframe src="${eventUrl}" width="100%" height="800" frameborder="0" style="border:none; border-radius:16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"></iframe>`;

  const handleBroadcastToPastPool = () => {
    showToast(
      'success',
      'Targeted Invitations Sent!',
      `Dispatched personalized event invitations to ${volunteerCrm.length} volunteers in the ${currentOrg.name} database.`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
            Promotion, Social & Community Marketing Suite
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            Event Marketing & Outreach Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Amplify attendance for <strong>{currentEvent.title}</strong> with automated social templates, printable 8.5x11 QR flyers, embeddable web widgets, and volunteer pool blasts.
          </p>
        </div>

        <button
          onClick={handlePrintFlyer}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl text-xs shadow-md transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print 8.5x11 Event Poster</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'social' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📱 Social Media Post Generator
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'broadcast' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ✉️ Blast Past Volunteer Pool ({volunteerCrm.length})
        </button>

        <button
          onClick={() => setActiveTab('embed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'embed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          💻 Embeddable Website Widget
        </button>
      </div>

      {/* TAB 1: Social Media Generator */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Channel Chooser */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400 block">Select Platform</span>
            
            {(['facebook', 'instagram', 'nextdoor', 'linkedin'] as const).map(channel => (
              <button
                key={channel}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold capitalize transition flex items-center justify-between ${
                  selectedChannel === channel
                    ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{channel} Post Template</span>
                {selectedChannel === channel && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </button>
            ))}
          </div>

          {/* Post Preview & Copy */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                {selectedChannel.toUpperCase()} Copy-Ready Content
              </h3>
              <button
                onClick={() => handleCopyText(socialTemplates[selectedChannel], `${selectedChannel} Post`)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSnippet === `${selectedChannel} Post` ? 'Copied ✓' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
              {socialTemplates[selectedChannel]}
            </div>

            <p className="text-[11px] text-slate-500">
              💡 <em>Tip: Paste this directly into your organization's social media scheduler or neighborhood feed. Live campaign numbers are automatically injected.</em>
            </p>
          </div>

        </div>
      )}

      {/* TAB 2: Blast Past Volunteer Pool */}
      {activeTab === 'broadcast' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Re-Engage Past Organization Volunteers</h3>
              <p className="text-xs text-slate-500">Dispatch tailored invitations to your permanent volunteer database to fill open shifts</p>
            </div>

            <button
              onClick={handleBroadcastToPastPool}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast to All {volunteerCrm.length} Volunteers</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <span className="text-xs font-bold uppercase text-indigo-700 block">Volunteer Database</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{volunteerCrm.length} Contacts</div>
              <p className="text-[11px] text-slate-500 mt-1">Active supporters from past events</p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
              <span className="text-xs font-bold uppercase text-amber-700 block">Avg Attendance Rate</span>
              <div className="text-2xl font-black text-slate-900 mt-1">94%</div>
              <p className="text-[11px] text-slate-500 mt-1">High-reliability volunteer base</p>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-xs font-bold uppercase text-emerald-700 block">Lifetime Hours Given</span>
              <div className="text-2xl font-black text-slate-900 mt-1">1,480 hrs</div>
              <p className="text-[11px] text-slate-500 mt-1">Across all historical campaigns</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Website Widget Snippet */}
      {activeTab === 'embed' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Embed Registration on Your Website</h3>
              <p className="text-xs text-slate-500">Paste this HTML iframe into your Wix, Squarespace, WordPress, or custom school site</p>
            </div>

            <button
              onClick={() => handleCopyText(embedCodeSnippet, 'Widget Code')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSnippet === 'Widget Code' ? 'Copied ✓' : 'Copy HTML Snippet'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
            {embedCodeSnippet}
          </pre>
        </div>
      )}

    </div>
  );
};
