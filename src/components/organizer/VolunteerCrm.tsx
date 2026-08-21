import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VolunteerCrmRecord, VolunteerEventHistory } from '../../types';
import { 
  Users, Award, HeartHandshake, Clock, Search, 
  Tag, Send, Sparkles, Filter, CheckCircle2, Calendar, 
  DollarSign, Eye, ShieldCheck, ChevronRight, Package, Info, UserCheck, Plus, X, Cake 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate, formatBirthDate, calculateAge } from '../../utils/formatters';

export const VolunteerCrm: React.FC = () => {
  const { currentOrg, volunteerCrm, addVolunteerTag, removeVolunteerTag, updateVolunteerNotes, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);
  const [newCustomTag, setNewCustomTag] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const selectedVolunteer = volunteerCrm.find(v => v.id === selectedVolunteerId) || null;

  const PRESET_ORGANIZATION_TAGS = [
    'Board Member',
    'Past Event Chair',
    'VIP Major Donor ($1K+)',
    'Recurring Monthly Supporter',
    'In-Kind Goods Sponsor',
    'Truck / Van Owner',
    'Heavy Lifting Crew',
    'Certified Electrician',
    'Sound & AV Tech',
    'Certified First Aid / CPR',
    'Food Safety / ServSafe',
    'Chaperone Background Cleared',
    'High School NHS Student',
    'Bilingual / Spanish',
    'Bilingual / Mandarin',
    'Professional Photographer',
    'Master Baker',
    'Grant Writer',
    'Alumni'
  ];

  const allTags = Array.from(new Set(volunteerCrm.flatMap(v => v.tags)));

  const filtered = volunteerCrm.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = selectedTag === 'all' || v.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleBlastReinvite = () => {
    showToast(
      'success',
      'Invitations Dispatched',
      `Sent personalized invitations for upcoming events to ${filtered.length} volunteers in this filtered segment.`
    );
  };

  const getTagExplanation = (tag: string) => {
    switch (tag) {
      case 'Reliable Helper':
        return 'System-Awarded: Achieved ≥95% on-time attendance rate across historical events with zero unexcused no-shows.';
      case 'VIP Donor':
      case 'VIP Major Donor ($1K+)':
        return 'Financial Classification: Cumulative lifetime philanthropic giving exceeds organization major donor threshold.';
      case 'Parent Volunteer':
        return 'Family Classification: Registered household dependents/minors or coordinated family volunteer shifts.';
      case 'Certified First Aid':
      case 'Certified First Aid / CPR':
        return 'Skill-Verified: Holds current CPR, First Aid, or AED emergency safety certification.';
      case 'Master Baker':
        return 'Specialty Skill: Donates allergen-safe baked goods and coordinates bake sale booths.';
      case 'STEM Advocate':
        return 'Program Specialty: Actively supports school robotics, science fairs, and academic competitions.';
      case 'Creative Lead':
        return 'Specialty Skill: Leads event face painting, photo booths, and visual art promotions.';
      case 'Board Member':
        return 'Governance Role: Active member of the Board of Directors or Executive Committee.';
      case 'Past Event Chair':
        return 'Leadership Role: Has chaired or co-chaired previous major campaigns or galas.';
      case 'Truck / Van Owner':
        return 'Logistics Asset: Has transport vehicle available for hauling tents, tables, and equipment.';
      case 'Heavy Lifting Crew':
        return 'Labor Crew: Available for morning setup, heavy canopy lifting, and teardown.';
      case 'High School NHS Student':
        return 'Student Program: Verified student completing community service graduation requirements.';
      case 'Alumni':
        return 'Community Role: Past graduate or long-time alumnus supporter of the organization.';
      default:
        return 'Coordinator-Assigned custom badge tag.';
    }
  };

  const calculateEconomicValue = (volunteer: VolunteerCrmRecord) => {
    const INDEPENDENT_SECTOR_HOURLY_RATE = 31.80; // Official US volunteer labor valuation rate
    return (volunteer.lifetimeHours * INDEPENDENT_SECTOR_HOURLY_RATE) + volunteer.lifetimeDonations;
  };

  const getImportanceTier = (volunteer: VolunteerCrmRecord) => {
    const totalVal = calculateEconomicValue(volunteer);
    if (totalVal >= 1500 || volunteer.lifetimeHours >= 30) {
      return {
        title: 'Tier 1: Organization Pillar',
        badge: '👑 Pillar',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        desc: 'Top 5% Lifetime Contributor — High strategic value across labor and giving.'
      };
    }
    if (totalVal >= 500 || volunteer.lifetimeHours >= 15) {
      return {
        title: 'Tier 2: Dedicated Core Supporter',
        badge: '🌟 Core Supporter',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        desc: 'Reliable recurring helper with consistent shift attendance across multiple seasons.'
      };
    }
    if (volunteer.lifetimeHours >= 5) {
      return {
        title: 'Tier 3: Active Contributor',
        badge: '🤝 Contributor',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        desc: 'Engaged community participant with verified completed shifts.'
      };
    }
    return {
      title: 'New Supporter',
      badge: '🌱 Newcomer',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      desc: 'Recently joined the volunteer network.'
    };
  };

  const handleOpenVolunteer = (v: VolunteerCrmRecord) => {
    setSelectedVolunteerId(v.id);
    setEditingNotes(v.notes || '');
    setIsEditingNotes(false);
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer || !newCustomTag.trim()) return;
    addVolunteerTag(selectedVolunteer.id, newCustomTag.trim());
    setNewCustomTag('');
  };

  const handleSaveNotes = () => {
    if (!selectedVolunteer) return;
    updateVolunteerNotes(selectedVolunteer.id, editingNotes);
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
            Organization Memory & CRM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">{currentOrg.name} Volunteer & Donor Directory</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Cross-event database tracking lifetime service hours, cumulative philanthropic donations, automated reliability tags, and historical event outcomes.
          </p>
        </div>

        <button
          onClick={handleBlastReinvite}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Invite Segment ({filtered.length} Volunteers)</span>
        </button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search volunteers by name, email, skill..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedTag === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({volunteerCrm.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedTag === tag ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(volunteer => {
          const tier = getImportanceTier(volunteer);
          const econValue = calculateEconomicValue(volunteer);

          return (
            <div
              key={volunteer.id}
              onClick={() => handleOpenVolunteer(volunteer)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition cursor-pointer group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition">
                      {volunteer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1">
                          <span>{volunteer.name}</span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${tier.color}`}>
                          {tier.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{volunteer.email} • {volunteer.phone}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {volunteer.attendanceRate}% Reliability
                  </span>
                </div>

                {/* Badges / Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {volunteer.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      title={getTagExplanation(tag)}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md flex items-center gap-1 border border-indigo-100/50"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Skills */}
                {volunteer.skills.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600">
                    <strong>Specialty Skills:</strong> {volunteer.skills.join(', ')}
                  </div>
                )}

                {/* Birthday Milestone Tag */}
                {volunteer.birthDate && (
                  <div className="mt-2 text-[10px] text-pink-700 bg-pink-50/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-semibold border border-pink-200/60">
                    <Cake className="w-3 h-3 text-pink-500" />
                    <span>🎂 Birthday: {formatBirthDate(volunteer.birthDate)} (Age: {calculateAge(volunteer.birthDate)})</span>
                  </div>
                )}
              </div>

              {/* Lifetime Stats Footer */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lifetime Labor</span>
                  <div className="text-xs font-bold text-slate-900">{volunteer.lifetimeHours} hrs</div>
                  <span className="text-[9px] text-slate-400">(${Math.round(volunteer.lifetimeHours * 31.80).toLocaleString()} val)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Donated</span>
                  <div className="text-xs font-bold text-emerald-600">{formatCurrency(volunteer.lifetimeDonations)}</div>
                  <span className="text-[9px] text-emerald-700/80 font-medium">Direct Giving</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Events Supported</span>
                  <div className="text-xs font-bold text-indigo-600 flex items-center justify-center gap-1">
                    <span>{volunteer.eventsParticipated}</span>
                    <span className="text-[10px] text-indigo-400 font-normal">events</span>
                  </div>
                  <span className="text-[9px] text-indigo-700/80 font-medium">Impact Timeline</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: INSIGHTFUL VOLUNTEER PROFILE, CUSTOM TAGGING & HISTORICAL EVENT OUTCOMES */}
      {selectedVolunteer && (
        <Modal
          isOpen={Boolean(selectedVolunteer)}
          onClose={() => setSelectedVolunteerId(null)}
          title={`${selectedVolunteer.name} — Volunteer Profile & Impact Analysis`}
          subtitle={`Community CRM Record • ${selectedVolunteer.email} • ${selectedVolunteer.phone}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            
            {/* Importance Tier & Economic Value Header */}
            {(() => {
              const tier = getImportanceTier(selectedVolunteer);
              const econVal = calculateEconomicValue(selectedVolunteer);
              return (
                <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${tier.color}`}>
                        {tier.title}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        Last Active: <strong>{formatDate(selectedVolunteer.lastActive)}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed max-w-md">
                      {tier.desc}
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/15 p-3 rounded-xl text-center sm:text-right">
                    <span className="text-[10px] text-purple-200 uppercase font-bold block">
                      Estimated Lifetime Economic Value
                    </span>
                    <div className="text-xl font-black text-emerald-400">
                      {formatCurrency(econVal)}
                    </div>
                    <span className="text-[9px] text-slate-300 block">
                      ({selectedVolunteer.lifetimeHours}h @ $31.80/h + {formatCurrency(selectedVolunteer.lifetimeDonations)} cash)
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* 4 Stat Ribbon */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifetime Hours</span>
                <span className="text-base font-black text-slate-900">{selectedVolunteer.lifetimeHours} hrs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Direct Cash Donations</span>
                <span className="text-base font-black text-emerald-600">{formatCurrency(selectedVolunteer.lifetimeDonations)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Events Participated</span>
                <span className="text-base font-black text-indigo-600">{selectedVolunteer.eventsParticipated}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance Reliability</span>
                <span className="text-base font-black text-emerald-600">{selectedVolunteer.attendanceRate}%</span>
              </div>
            </div>

            {/* Volunteer Birthday & Milestone Greeting Automation */}
            {selectedVolunteer.birthDate && (
              <div className="p-3 bg-pink-50/70 rounded-xl border border-pink-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cake className="w-4 h-4 text-pink-600 shrink-0" />
                  <span className="font-bold text-pink-900 text-xs">
                    Date of Birth: {formatBirthDate(selectedVolunteer.birthDate)} (Current Age: {calculateAge(selectedVolunteer.birthDate)})
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>🎂 Automated Birthday Greetings Active</span>
                </span>
              </div>
            )}

            {/* TAG MANAGEMENT STUDIO (AUTOMATED + CUSTOM MANUAL TAGS) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>Classifications, Tags & Specialty Badges ({selectedVolunteer.tags.length})</span>
                </h4>
                <span className="text-[10px] text-slate-400">Click ✕ to remove or select below to add</span>
              </div>

              {/* Active Tag Chips */}
              <div className="flex flex-wrap gap-1.5">
                {selectedVolunteer.tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="pl-2.5 pr-1.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50/80 text-indigo-900 font-bold text-xs flex items-center gap-1.5 group"
                    title={getTagExplanation(tag)}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeVolunteerTag(selectedVolunteer.id, tag)}
                      className="w-4 h-4 rounded-md hover:bg-indigo-200 text-indigo-500 hover:text-indigo-800 flex items-center justify-center transition"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Tags Controls */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Preset Dropdown */}
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addVolunteerTag(selectedVolunteer.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="">+ Add from Recommended Tag Library...</option>
                  {PRESET_ORGANIZATION_TAGS.filter(t => !selectedVolunteer.tags.includes(t)).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>

                {/* Custom Tag Input */}
                <form onSubmit={handleAddCustomTag} className="flex gap-1.5">
                  <input
                    type="text"
                    value={newCustomTag}
                    onChange={(e) => setNewCustomTag(e.target.value)}
                    placeholder="Create custom tag..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition whitespace-nowrap"
                  >
                    + Add
                  </button>
                </form>
              </div>
            </div>

            {/* Coordinator Internal Notes */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>Coordinator Internal Notes & Engagement Memory</span>
                </span>
                {!isEditingNotes && (
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="text-amber-800 hover:text-amber-950 font-bold text-[11px] underline"
                  >
                    Edit Notes
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Add internal coordinator observations, family relationships, employer matching details..."
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1 bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs shadow-xs"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-900 leading-relaxed font-sans">
                  {selectedVolunteer.notes || 'No internal coordinator notes recorded yet. Click "Edit Notes" to add context.'}
                </p>
              )}
            </div>

            {/* Historical Events Supported & Impact Tie-Back */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Historical Events Supported & Tied Campaign Outcomes ({selectedVolunteer.eventHistory?.length || 0})</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">Every shift, supply drop-off, and donation tied directly to event outcomes</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Chronological Ledger</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(selectedVolunteer.eventHistory || []).map((evt, eIdx) => (
                  <div key={eIdx} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 hover:shadow-xs transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{evt.eventTitle}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(evt.eventDate)}</span>
                      </div>

                      {evt.eventOutcomeRaised && (
                        <div className="text-right">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-lg text-[10px] border border-emerald-200">
                            🎯 Event Raised {formatCurrency(evt.eventOutcomeRaised)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[9px] block">Shifts / Roles Served</span>
                        <div className="font-bold text-slate-800">{evt.rolesServed.join(', ')}</div>
                        <div className="text-indigo-600 font-semibold text-[10px]">{evt.hoursContributed} hrs contributed</div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[9px] block">Supplies & Pledges</span>
                        <div className="text-slate-700">{evt.itemsDonated ? evt.itemsDonated.join('; ') : 'None requested'}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[9px] block">Donations & Verification</span>
                        <div className="font-bold text-emerald-700">{evt.amountDonated ? formatCurrency(evt.amountDonated) : '$0.00'}</div>
                        {evt.verifiedBy && <div className="text-[9px] text-slate-400">Verified by: {evt.verifiedBy}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVolunteerId(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

