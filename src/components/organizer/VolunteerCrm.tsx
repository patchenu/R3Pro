import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VolunteerCrmRecord, VolunteerEventHistory } from '../../types';
import { 
  Users, Award, HeartHandshake, Clock, Search, 
  Tag, Send, Sparkles, Filter, CheckCircle2, Calendar, 
  DollarSign, Eye, ShieldCheck, ChevronRight, Package, Info, UserCheck, Plus, X 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const VolunteerCrm: React.FC = () => {
  const { currentOrg, volunteerCrm, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerCrmRecord | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

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
        return 'System-Awarded: Cumulative lifetime philanthropic giving exceeds organization threshold ($250+).';
      case 'Parent Volunteer':
        return 'System-Awarded: Registered household dependents/minors or coordinated family volunteer shifts.';
      case 'Certified First Aid':
        return 'Skill-Verified: Holds current CPR, First Aid, or AED emergency safety certification.';
      case 'Master Baker':
        return 'Specialty Badge: Donates allergen-safe baked goods and coordinates bake sale booths.';
      case 'STEM Advocate':
        return 'Community Role: Actively supports school robotics, science fairs, and academic competitions.';
      case 'Creative Lead':
        return 'Specialty Badge: Leads event face painting, photo booths, and visual art promotions.';
      case 'Alumni':
        return 'Community Role: Past graduate or long-time alumnus supporter of the organization.';
      default:
        return 'Coordinator-Assigned custom badge tag.';
    }
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
        {filtered.map(volunteer => (
          <div
            key={volunteer.id}
            onClick={() => setSelectedVolunteer(volunteer)}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition cursor-pointer group"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition">
                    {volunteer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                      <span>{volunteer.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                    </h4>
                    <p className="text-xs text-slate-500">{volunteer.email} • {volunteer.phone}</p>
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
            </div>

            {/* Lifetime Stats Footer */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Lifetime Hours</span>
                <div className="text-sm font-bold text-slate-900">{volunteer.lifetimeHours} hrs</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Donated</span>
                <div className="text-sm font-bold text-emerald-600">{formatCurrency(volunteer.lifetimeDonations)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Events Supported</span>
                <div className="text-sm font-bold text-indigo-600 flex items-center justify-center gap-1">
                  <span>{volunteer.eventsParticipated}</span>
                  <span className="text-[10px] text-indigo-400 font-normal">events</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: VOLUNTEER PROFILE, TAG EXPLANATIONS & HISTORICAL EVENT OUTCOMES */}
      {selectedVolunteer && (
        <Modal
          isOpen={Boolean(selectedVolunteer)}
          onClose={() => setSelectedVolunteer(null)}
          title={`${selectedVolunteer.name} — Volunteer Impact & Event History`}
          subtitle={`Verified Community Member • ${selectedVolunteer.email} • ${selectedVolunteer.phone}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifetime Hours</span>
                <span className="text-lg font-black text-slate-900">{selectedVolunteer.lifetimeHours} hrs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Financial Giving</span>
                <span className="text-lg font-black text-emerald-600">{formatCurrency(selectedVolunteer.lifetimeDonations)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Events Participated</span>
                <span className="text-lg font-black text-indigo-600">{selectedVolunteer.eventsParticipated}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance Reliability</span>
                <span className="text-lg font-black text-emerald-600">{selectedVolunteer.attendanceRate}%</span>
              </div>
            </div>

            {/* How Tags Are Awarded Section */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Badges & How They Were Awarded</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedVolunteer.tags.map((tag, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{tag}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {getTagExplanation(tag)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedVolunteer.notes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <strong>Coordinator Internal Notes:</strong> {selectedVolunteer.notes}
              </div>
            )}

            {/* Historical Events Supported & Impact Tie-Back */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Historical Events Supported & Tied Campaign Outcomes ({selectedVolunteer.eventHistory?.length || 0})</span>
                </h4>
                <span className="text-[11px] text-slate-400">Chronological Impact Ledger</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(selectedVolunteer.eventHistory || []).map((evt, eIdx) => (
                  <div key={eIdx} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{evt.eventTitle}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(evt.eventDate)}</span>
                      </div>

                      {evt.eventOutcomeRaised && (
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-[10px] border border-emerald-200">
                            Event Raised {formatCurrency(evt.eventOutcomeRaised)}
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
                onClick={() => setSelectedVolunteer(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm"
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

