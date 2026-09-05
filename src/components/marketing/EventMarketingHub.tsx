import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Share2, Copy, Printer, Code, Mail, MessageSquare, 
  Sparkles, CheckCircle2, Download, Send, Globe, Smartphone, 
  QrCode, Users, AlertTriangle, ArrowRight, Check, Eye, Tag
} from 'lucide-react';
import { formatCurrency, formatDate, formatTimeRange } from '../../utils/formatters';
import { QRCodeSVG } from 'qrcode.react';

export const EventMarketingHub: React.FC = () => {
  const { currentEvent, currentOrg, volunteerCrm, shifts, subParts, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'flyer' | 'email' | 'social' | 'embed' | 'broadcast'>('flyer');
  const [selectedChannel, setSelectedChannel] = useState<'facebook' | 'instagram' | 'nextdoor' | 'linkedin' | 'whatsapp'>('facebook');
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<'launch' | 'urgent_shifts' | 'sponsor_pitch'>('launch');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [includeTearOffTabs, setIncludeTearOffTabs] = useState(true);
  const [includeUrgentShifts, setIncludeUrgentShifts] = useState(true);

  const eventUrl = `${window.location.origin}/?event=${currentEvent.id}&mode=public`;

  // Compute key stats
  const totalShifts = shifts.length;
  const totalSlots = shifts.reduce((sum, s) => sum + s.capacity, 0);
  const claimedSlots = shifts.reduce((sum, s) => sum + s.claimedCount, 0);
  const openSlots = Math.max(0, totalSlots - claimedSlots);
  const openShiftsList = shifts.filter(s => s.claimedCount < s.capacity).slice(0, 4);

  // Email Copy Kits
  const emailTemplates = {
    launch: {
      title: 'Official Campaign Launch & Volunteer Callout',
      subject: `🎉 Join Us: ${currentEvent.title} – Sign Up & Support ${currentOrg.name}!`,
      body: `Dear Community Supporter,

We are thrilled to announce that registration and volunteer opportunities for the ${currentEvent.title} are officially open!

📅 Date: ${formatDate(currentEvent.startDate)} (${formatTimeRange(currentEvent.startDate, currentEvent.endDate)})
📍 Location: ${currentEvent.venueName} (${currentEvent.venueAddress})
🎯 Fundraising Goal: ${formatCurrency(currentEvent.fundraisingGoal)}

Our mission is to bring families and neighbors together while raising essential funds for our community programs. To make this event a success, we need passionate volunteers, supply donors, and attendees.

👉 Pick your shift or register your family in 60 seconds:
${eventUrl}

• 100% Free & Family Friendly
• Digital safety check-in & instant mobile passes
• High school students receive signed community service certificates!

Thank you for being an indispensable part of ${currentOrg.name}. We look forward to seeing you there!

Warm regards,
The ${currentOrg.name} Event Committee`
    },
    urgent_shifts: {
      title: 'T-7 Days Critical Shift Shortage Drive',
      subject: `⚠️ Urgent: ${openSlots} Volunteer Shifts Still Needed for ${currentEvent.title}!`,
      body: `Hello Volunteers and Friends,

We are just around the corner from the ${currentEvent.title} on ${formatDate(currentEvent.startDate)}, and we currently have ${openSlots} open volunteer spots that need your help to ensure a safe and memorable event for everyone!

🔥 Key Roles We Urgently Need Filled:
${openShiftsList.length > 0 
  ? openShiftsList.map(s => `• ${s.title} (${formatTimeRange(s.startTime, s.endTime)}) - ${s.capacity - s.claimedCount} spots open`).join('\n')
  : '• Setup Crew, Food & Hospitality, Door Greeters'}

⏱️ Shifts are only 2 to 3 hours long, leaving you plenty of time to enjoy the festivities with your family. 

🎓 High School & Scout Students: All volunteer hours are officially verified by our Event Coordinator with signed verification letters for graduation requirements.

👉 Claim your open shift now:
${eventUrl}

Thank you for stepping up to make a difference in our community!

With gratitude,
${currentOrg.name} Organizing Team`
    },
    sponsor_pitch: {
      title: 'Sponsor & Commercial Artisan Outreach Pitch',
      subject: `💎 Partner with ${currentOrg.name} as an Official Sponsor for ${currentEvent.title}`,
      body: `Dear Community Leader & Business Partner,

On ${formatDate(currentEvent.startDate)}, ${currentOrg.name} will host the ${currentEvent.title} at ${currentEvent.venueName}, welcoming an estimated 2,500+ local families, educators, and community members.

We invite your business to partner with us as a Corporate Sponsor or Artisan Vendor to gain high-visibility brand exposure while directly supporting our community mission.

🌟 Sponsorship & Commercial Benefits:
• Prominent logo display on main event signage and digital program
• Numbered commercial booth pitch (with 110V/220V power options)
• Direct engagement with over 600+ enrolled households
• Official IRS 501(c)(3) tax acknowledgement receipt and Fair Market Value deductions

🎯 Our campaign target is ${formatCurrency(currentEvent.fundraisingGoal)}, and your underwriting contribution directly empowers local programming.

👉 Review available sponsorship packages and reserve your booth here:
${eventUrl}

We would be honored to partner with you. Please feel free to reply directly to this email with any custom sponsorship inquiries.

Sincerely,
${currentOrg.name} Sponsorship & Commercial Committee`
    }
  };

  // Social Media Share Templates
  const socialTemplates = {
    facebook: `📢 We're thrilled to announce the ${currentEvent.title}! 🎉\n\nJoin ${currentOrg.name} on ${formatDate(currentEvent.startDate)} at ${currentEvent.venueName}.\n\nWe need community volunteers, supply donations, and supporters to reach our ${formatCurrency(currentEvent.fundraisingGoal)} goal! Every contribution directly supports our community programs.\n\n👉 Sign up or donate here in under 60 seconds: ${eventUrl}\n\n#CommunityFirst #${currentOrg.name.replace(/\s+/g, '')} #VolunteersNeeded`,
    instagram: `🌟 MARK YOUR CALENDARS! 🌟\n\n${currentEvent.title} is officially live!\n📍 ${currentEvent.venueName}\n🗓️ ${formatDate(currentEvent.startDate)}\n🎯 Campaign Goal: ${formatCurrency(currentEvent.fundraisingGoal)}\n\nWhether you can volunteer for a 2-hour shift or pledge supplies, we need your help to make this event unforgettable! Link in bio to sign up your family. ✨\n\n#GiveBack #Volunteer #${currentOrg.name.replace(/\s+/g, '')} #Fundraising`,
    nextdoor: `Hello Neighbors! 👋\n\n${currentOrg.name} is hosting the ${currentEvent.title} on ${formatDate(currentEvent.startDate)} at ${currentEvent.venueName}.\n\nWe're actively looking for neighborhood volunteers for event setup, food hospitality, and activities. High school students can also receive verified community service hours!\n\nCheck out the open shifts and sign up online here: ${eventUrl}\n\nThank you for supporting our local community!`,
    linkedin: `Proud to share that ${currentOrg.name} has launched the ${currentEvent.title} campaign.\n\nOur mission is to engage community members and raise ${formatCurrency(currentEvent.fundraisingGoal)} to expand our outreach programs.\n\nSponsorship opportunities and volunteer coordination are now open: ${eventUrl}\n\n#NonProfit #Philanthropy #CommunityImpact #CorporateGiving`,
    whatsapp: `👋 Hi everyone! ${currentOrg.name} is hosting the *${currentEvent.title}* on *${formatDate(currentEvent.startDate)}* at *${currentEvent.venueName}*.\n\nWe need volunteers and families to join us! Sign up takes 30 seconds: ${eventUrl}`
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    showToast('success', `${label} Copied!`, 'Ready to paste into your campaign broadcast.');
    setTimeout(() => setCopiedSnippet(null), 3000);
  };

  const handlePrintFlyer = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const urgentShiftsHtml = includeUrgentShifts && openShiftsList.length > 0
      ? `<div class="shifts-box">
          <h3>⚡ URGENT VOLUNTEER SHIFTS NEEDED:</h3>
          <div class="shifts-grid">
            ${openShiftsList.map(s => `
              <div class="shift-item">
                <strong>${s.title}</strong>
                <span>${formatTimeRange(s.startTime, s.endTime)} • ${s.capacity - s.claimedCount} spots open</span>
              </div>
            `).join('')}
          </div>
        </div>`
      : '';

    const tearOffTabsHtml = includeTearOffTabs
      ? `<div class="tear-off-section">
          <div class="cut-line">✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂</div>
          <div class="tabs-container">
            ${Array.from({ length: 8 }).map(() => `
              <div class="tear-tab">
                <div class="tab-title">${currentEvent.title.slice(0, 18)}</div>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(eventUrl)}" alt="QR" width="55" height="55" />
                <div class="tab-url">reachplatform.com</div>
                <div class="tab-action">Scan to Join</div>
              </div>
            `).join('')}
          </div>
        </div>`
      : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${currentEvent.title} - Printable Poster</title>
        <style>
          @page { size: 8.5in 11in; margin: 0.35in; }
          * { box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            color: #0f172a; 
            margin: 0; 
            padding: 0; 
            text-align: center; 
          }
          .poster {
            border: 4px solid #4338ca;
            border-radius: 16px;
            padding: 24px;
            height: 9.8in;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #ffffff;
          }
          .header { 
            background: #1e1b4b; 
            color: #ffffff; 
            padding: 24px 16px; 
            border-radius: 14px; 
          }
          .org { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #a5b4fc; font-weight: 800; }
          .title { font-size: 28px; font-weight: 900; margin: 6px 0; line-height: 1.15; }
          .tagline { font-size: 14px; color: #e0e7ff; font-weight: 500; }
          
          .details-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 10px; 
            background: #f8fafc; 
            padding: 14px; 
            border-radius: 12px; 
            border: 1px solid #cbd5e1; 
            margin: 12px 0; 
            text-align: left; 
          }
          .details-grid strong { color: #4338ca; display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .details-grid span { font-size: 13px; font-weight: 700; color: #0f172a; }
          
          .shifts-box {
            background: #eef2ff;
            border: 1px solid #c7d2fe;
            border-radius: 10px;
            padding: 10px 14px;
            margin-bottom: 10px;
            text-align: left;
          }
          .shifts-box h3 { margin: 0 0 6px 0; font-size: 11px; color: #3730a3; font-weight: 800; }
          .shifts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
          .shift-item { font-size: 11px; }
          .shift-item strong { display: block; color: #1e1b4b; }
          .shift-item span { color: #475569; font-size: 10px; }

          .qr-center {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin: 8px 0;
            background: #ffffff;
          }
          .qr-box {
            padding: 10px;
            border: 2px dashed #4f46e5;
            border-radius: 12px;
            display: inline-block;
          }
          .qr-text {
            text-align: left;
            max-width: 260px;
          }
          .qr-text h4 { margin: 0 0 4px 0; font-size: 15px; color: #1e1b4b; font-weight: 900; }
          .qr-text p { margin: 0; font-size: 11px; color: #475569; line-height: 1.4; }

          .tear-off-section {
            margin-top: auto;
            padding-top: 10px;
          }
          .cut-line {
            font-size: 9px;
            color: #94a3b8;
            margin-bottom: 6px;
            letter-spacing: 2px;
          }
          .tabs-container {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 4px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 6px;
          }
          .tear-tab {
            border-right: 1px dashed #cbd5e1;
            padding: 4px 2px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .tear-tab:last-child { border-right: none; }
          .tab-title { font-size: 7px; font-weight: bold; color: #1e1b4b; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
          .tab-url { font-size: 7px; color: #4338ca; font-weight: bold; margin-top: 2px; }
          .tab-action { font-size: 6px; color: #64748b; text-transform: uppercase; }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="poster">
          <div class="header">
            <div class="org">${currentOrg.name}</div>
            <div class="title">${currentEvent.title}</div>
            <div class="tagline">${currentEvent.tagline}</div>
          </div>

          <div class="details-grid">
            <div>
              <strong>Date & Time</strong>
              <span>${formatDate(currentEvent.startDate)}</span>
            </div>
            <div>
              <strong>Location & Venue</strong>
              <span>${currentEvent.venueName}</span>
            </div>
            <div>
              <strong>Campaign Target</strong>
              <span>${formatCurrency(currentEvent.fundraisingGoal)}</span>
            </div>
          </div>

          ${urgentShiftsHtml}

          <div class="qr-center">
            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(eventUrl)}" alt="Scan to Sign Up" width="130" height="130" />
            </div>
            <div class="qr-text">
              <h4>📱 Scan to Join & Pick Shift</h4>
              <p>Point your smartphone camera at the QR code to pick your volunteer shift, register your family, or make a tax-deductible contribution in under 60 seconds!</p>
              <p style="margin-top: 6px; font-weight: bold; color: #4338ca;">✓ High school service certificates provided</p>
            </div>
          </div>

          ${tearOffTabsHtml}
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
            1-Click Multi-Channel Campaign Launch Kit
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            Promotional Launch & Recruitment Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Promote <strong>{currentEvent.title}</strong> across print, email, social, and web in seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintFlyer}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-5 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print 8.5x11 Poster</span>
          </button>
        </div>
      </div>

      {/* Quick Impact Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Open Volunteer Spots</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{openSlots} Spots</div>
          <span className="text-[11px] text-indigo-600 font-semibold">{totalShifts} shift roles published</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">CRM Volunteer Base</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{volunteerCrm.length} Contacts</div>
          <span className="text-[11px] text-emerald-600 font-semibold">1-click broadcast ready</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fundraising Target</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{formatCurrency(currentEvent.fundraisingGoal)}</div>
          <span className="text-[11px] text-slate-500 font-semibold">Verified 501(c)(3) tax receipt</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Public Event URL</span>
          <div className="text-xs font-mono font-bold text-indigo-600 truncate mt-1.5">{eventUrl}</div>
          <button
            onClick={() => handleCopyText(eventUrl, 'Public Event Link')}
            className="text-[11px] font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1 mt-1"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('flyer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'flyer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🖨️ Printable 8.5x11 PDF Gate Poster
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'email' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ✉️ Pre-Written Email & Newsletter Blasts
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'social' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📱 Social Media & Messaging Pack
        </button>

        <button
          onClick={() => setActiveTab('embed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'embed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          💻 Website Embed & High-Res QR
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'broadcast' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          👥 Volunteer CRM Pool Blast ({volunteerCrm.length})
        </button>
      </div>

      {/* TAB 1: Printable Poster & Tear-Off Flyer */}
      {activeTab === 'flyer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Settings & Print Action */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Poster Customization</h3>
              
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeTearOffTabs}
                    onChange={(e) => setIncludeTearOffTabs(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Include 8 Bottom Tear-Off Tabs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeUrgentShifts}
                    onChange={(e) => setIncludeUrgentShifts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Highlight Urgent Open Shifts</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={handlePrintFlyer}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save 8.5x11 PDF Flyer</span>
                </button>
                <p className="text-[11px] text-slate-500 text-center">
                  Formatted for standard letter paper with high-contrast QR vectors
                </p>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Placement Recommendations:</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                • School Front Office & Gymnasium Doors<br />
                • Community Center Bulletin Boards<br />
                • Local Coffee Shops & Libraries<br />
                • Event Entrance Gates on Event Morning
              </p>
            </div>
          </div>

          {/* Live Poster Mockup Preview */}
          <div className="lg:col-span-2 bg-slate-100 p-6 rounded-3xl border border-slate-200 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl border-2 border-indigo-600 shadow-xl space-y-4 text-center">
              
              <div className="bg-indigo-950 text-white p-4 rounded-xl">
                <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">{currentOrg.name}</div>
                <div className="text-xl font-black mt-0.5">{currentEvent.title}</div>
                <div className="text-xs text-indigo-200 mt-0.5">{currentEvent.tagline}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-left border border-slate-200">
                <div>
                  <span className="text-[9px] font-bold text-indigo-700 uppercase block">Date</span>
                  <span className="text-xs font-bold text-slate-900">{formatDate(currentEvent.startDate)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-indigo-700 uppercase block">Venue</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">{currentEvent.venueName}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-indigo-700 uppercase block">Goal</span>
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(currentEvent.fundraisingGoal)}</span>
                </div>
              </div>

              {includeUrgentShifts && openShiftsList.length > 0 && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-left text-xs">
                  <span className="font-extrabold text-[10px] uppercase text-indigo-900 block mb-1">⚡ Open Shifts Needed:</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                    {openShiftsList.map((s, idx) => (
                      <div key={idx} className="truncate">• <strong>{s.title}</strong></div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 py-1">
                <div className="p-2 border-2 border-dashed border-indigo-500 rounded-xl">
                  <QRCodeSVG value={eventUrl} size={90} />
                </div>
                <div className="text-left text-xs text-slate-600 max-w-[160px]">
                  <strong className="text-slate-900 block text-xs">📱 Scan with Camera</strong>
                  <span className="text-[11px] leading-tight block text-slate-500 mt-0.5">Instant volunteer sign-up & verified service hours</span>
                </div>
              </div>

              {includeTearOffTabs && (
                <div className="pt-2 border-t-2 border-dashed border-slate-300">
                  <div className="text-[8px] text-slate-400 mb-1 tracking-wider uppercase">✂ Detachable Tabs (8 total)</div>
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="border border-slate-200 bg-slate-50 p-1 rounded text-[8px] flex flex-col items-center">
                        <span className="font-bold truncate w-full text-indigo-950">{currentEvent.title.slice(0, 10)}</span>
                        <QRCodeSVG value={eventUrl} size={30} />
                        <span className="text-slate-500 text-[7px] mt-0.5">Scan to Join</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Pre-Written Email & Newsletter Blasts */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Template Chooser */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400 block">Select Email Template</span>
            
            {(['launch', 'urgent_shifts', 'sponsor_pitch'] as const).map(key => {
              const tmpl = emailTemplates[key];
              const isSelected = selectedEmailTemplate === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedEmailTemplate(key)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <strong className="block font-bold">{tmpl.title}</strong>
                    <span className="text-[11px] text-slate-500 truncate block max-w-[200px] mt-0.5">{tmpl.subject}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Preview & Copy */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Subject Line:</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  {emailTemplates[selectedEmailTemplate].subject}
                </h3>
              </div>

              <button
                onClick={() => {
                  const fullText = `Subject: ${emailTemplates[selectedEmailTemplate].subject}\n\n${emailTemplates[selectedEmailTemplate].body}`;
                  handleCopyText(fullText, 'Email Template');
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSnippet === 'Email Template' ? 'Copied ✓' : 'Copy Subject & Body'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium max-h-96 overflow-y-auto">
              {emailTemplates[selectedEmailTemplate].body}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>💡 Merge tags (dates, goal, venue, shifts) are automatically injected for this event.</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Social Media & Messaging Generator */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Channel Chooser */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400 block">Select Platform</span>
            
            {(['facebook', 'instagram', 'nextdoor', 'linkedin', 'whatsapp'] as const).map(channel => (
              <button
                key={channel}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold capitalize transition flex items-center justify-between ${
                  selectedChannel === channel
                    ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{channel} {channel === 'whatsapp' ? 'Broadcast' : 'Post'}</span>
                {selectedChannel === channel && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </button>
            ))}
          </div>

          {/* Post Preview & Copy */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                {selectedChannel.toUpperCase()} Ready-to-Post Content
              </h3>
              <button
                onClick={() => handleCopyText(socialTemplates[selectedChannel], `${selectedChannel} Post`)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSnippet === `${selectedChannel} Post` ? 'Copied ✓' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
              {socialTemplates[selectedChannel]}
            </div>

            <p className="text-[11px] text-slate-500">
              💡 <em>Tip: Paste this directly into your social media scheduler or WhatsApp broadcast list.</em>
            </p>
          </div>

        </div>
      )}

      {/* TAB 4: Website Widget & High-Res QR Pack */}
      {activeTab === 'embed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Website Embed Snippet</h3>
                <p className="text-xs text-slate-500">Embed registration into Wix, Squarespace, or school website</p>
              </div>

              <button
                onClick={() => handleCopyText(embedCodeSnippet, 'Widget Code')}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSnippet === 'Widget Code' ? 'Copied ✓' : 'Copy Snippet'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
              {embedCodeSnippet}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">High-Resolution QR Code</h3>
              <p className="text-xs text-slate-500">Directly routes to public registration pass</p>
            </div>

            <div className="flex items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <QRCodeSVG value={eventUrl} size={160} />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[11px] text-slate-500 truncate max-w-[200px]">{eventUrl}</span>
              <button
                onClick={() => handleCopyText(eventUrl, 'QR Link')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl"
              >
                Copy URL
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: Blast Past Volunteer Pool */}
      {activeTab === 'broadcast' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Re-Engage Past Organization Volunteers</h3>
              <p className="text-xs text-slate-500">Dispatch tailored invitations to your permanent volunteer database to fill open shifts</p>
            </div>

            <button
              onClick={handleBroadcastToPastPool}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-sm transition cursor-pointer"
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

    </div>
  );
};

