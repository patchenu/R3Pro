import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Award, HeartHandshake, Clock, Search, 
  Tag, Send, Sparkles, Filter, CheckCircle2 
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const VolunteerCrm: React.FC = () => {
  const { currentOrg, volunteerCrm, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

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

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
            Organization Memory & CRM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">{currentOrg.name} Volunteer Directory</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Cross-event database tracking lifetime service hours, total financial contributions, attendance reliability, and skill tags.
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
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{volunteer.name}</h4>
                  <p className="text-xs text-slate-500">{volunteer.email} • {volunteer.phone}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  {volunteer.attendanceRate}% Reliability
                </span>
              </div>

              {/* Badges / Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {volunteer.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Skills */}
              {volunteer.skills.length > 0 && (
                <div className="mt-2 text-xs text-slate-600">
                  <strong>Skills:</strong> {volunteer.skills.join(', ')}
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
                <div className="text-sm font-bold text-indigo-600">{volunteer.eventsParticipated}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
