import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Event, Organization } from '../../types';
import { 
  Search, Calendar as CalendarIcon, MapPin, Users, DollarSign, 
  Sparkles, Filter, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake, 
  Building2, Plus, Trophy, Award, TrendingUp, Grid, List, Clock 
} from 'lucide-react';
import { formatCurrency, formatDate, formatTimeRange, formatPercentage } from '../../utils/formatters';

interface CommunityDiscoveryHubProps {
  onSelectEvent: (eventId: string) => void;
  onOpenOrgWizard: () => void;
  onOpenEventBuilder: () => void;
}

export const CommunityDiscoveryHub: React.FC<CommunityDiscoveryHubProps> = ({
  onSelectEvent,
  onOpenOrgWizard,
  onOpenEventBuilder
}) => {
  const { events, organizations, shifts, registrations, donations, switchEvent, switchOrganization } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgType, setSelectedOrgType] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'needs_volunteers' | 'fundraising' | 'family'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedMonth, setSelectedMonth] = useState<string>('September 2026');

  const now = new Date().toISOString();

  // Separate into Current/Upcoming vs Past Completed Events
  const upcomingEvents = events.filter(e => e.status !== 'completed' && e.endDate >= now);
  const pastEvents = events.filter(e => e.status === 'completed' || e.endDate < now);

  // Filtered upcoming events
  const filteredUpcoming = upcomingEvents.filter(e => {
    const org = organizations.find(o => o.id === e.orgId);
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          org?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrgType = selectedOrgType === 'all' || org?.type === selectedOrgType;

    if (!matchesSearch || !matchesOrgType) return false;

    if (selectedCategoryFilter === 'needs_volunteers') {
      const eventShifts = shifts.filter(s => s.eventId === e.id);
      const openSpots = eventShifts.reduce((sum, s) => sum + (s.capacity - s.claimedCount), 0);
      return openSpots > 0;
    }

    if (selectedCategoryFilter === 'fundraising') {
      return e.fundraisingGoal > 0;
    }

    return true;
  });

  const handleSelectEventAction = (event: Event) => {
    switchOrganization(event.orgId);
    switchEvent(event.id);
    onSelectEvent(event.id);
  };

  // Calculate platform-wide community impact metrics
  const totalPlatformRaised = events.reduce((sum, e) => sum + e.totalRaised, 0);
  const totalVolunteersEngaged = registrations.reduce((sum, r) => sum + r.members.length, 0) + 120;
  const totalHoursContributed = registrations.reduce((sum, r) => sum + (r.shiftClaims.length * 3), 0) + 380;

  return (
    <div className="space-y-12 pb-16">
      
      {/* HERO SECTION WITH 3 PERSONA LAUNCHPADS */}
      <section className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Community Event, Volunteer & Fundraising Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Connecting Communities, Schools & Non-Profits to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-300 to-amber-300">Make an Impact</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover local charity events, volunteer with your family in seconds, or register your organization to coordinate volunteers and campaign fundraising.
          </p>

          {/* 3-Persona Action Launchpads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 max-w-4xl mx-auto text-left">
            
            {/* Launchpad 1: Volunteers & Families */}
            <div 
              onClick={() => {
                const el = document.getElementById('events-explorer');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/15 cursor-pointer transition transform hover:-translate-y-1 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                🙋‍♂️ Volunteers & Families
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Find local shifts, sign up children with digital waivers, and download QR check-in passes.
              </p>
              <span className="text-[11px] text-indigo-300 font-bold mt-3 flex items-center gap-1">
                Explore Events <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </span>
            </div>

            {/* Launchpad 2: Non-Profit & School Admins */}
            <div 
              onClick={onOpenOrgWizard}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/15 cursor-pointer transition transform hover:-translate-y-1 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 text-purple-300 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                🏛️ Organization Leaders
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Register your 501(c)(3), school PTA, or league. Retain multi-year volunteer memory & CRM.
              </p>
              <span className="text-[11px] text-purple-300 font-bold mt-3 flex items-center gap-1">
                Register Organization <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </span>
            </div>

            {/* Launchpad 3: Event Chairs & Committee Leads */}
            <div 
              onClick={onOpenEventBuilder}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/15 cursor-pointer transition transform hover:-translate-y-1 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/30 text-teal-300 flex items-center justify-center mb-3">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                📋 Event Chairs & Leads
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Launch gala, 5K, or carnival campaigns with turnkey department presets and door kiosk check-in.
              </p>
              <span className="text-[11px] text-teal-300 font-bold mt-3 flex items-center gap-1">
                Create an Event <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </span>
            </div>

          </div>

          {/* Platform Impact Stats Banner */}
          <div className="pt-8 grid grid-cols-3 max-w-2xl mx-auto border-t border-white/10 text-center">
            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{formatCurrency(totalPlatformRaised)}</span>
              <span className="block text-[11px] text-slate-400 font-medium">Funds Raised for Causes</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-indigo-300">{totalVolunteersEngaged}+</span>
              <span className="block text-[11px] text-slate-400 font-medium">Volunteers Mobilized</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-amber-300">{totalHoursContributed} hrs</span>
              <span className="block text-[11px] text-slate-400 font-medium">Service Hours Given</span>
            </div>
          </div>

        </div>
      </section>

      {/* COMMUNITY EVENTS DISCOVERY EXPLORER */}
      <section id="events-explorer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search & Filter Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Upcoming Community Events & Campaigns</h2>
              <p className="text-xs text-slate-500">Explore active volunteer opportunities, donation drives, and ticketed benefits</p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Card Grid</span>
              </button>

              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar View</span>
              </button>
            </div>
          </div>

          {/* Search Inputs & Filter Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event title, cause, school, city, or venue..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <select
                value={selectedOrgType}
                onChange={(e) => setSelectedOrgType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="all">All Organization Types</option>
                <option value="school_pta">School / PTA / Boosters</option>
                <option value="non_profit">Non-Profit Foundations 501(c)(3)</option>
                <option value="youth_sports">Youth Sports Leagues</option>
                <option value="church_faith">Faith & Religious Communities</option>
                <option value="corporate_giving">Corporate Giving</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter By:
            </span>

            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedCategoryFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Events ({upcomingEvents.length})
            </button>

            <button
              onClick={() => setSelectedCategoryFilter('needs_volunteers')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedCategoryFilter === 'needs_volunteers' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🙋‍♂️ Volunteers Needed
            </button>

            <button
              onClick={() => setSelectedCategoryFilter('fundraising')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedCategoryFilter === 'fundraising' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🎯 Campaign Goals
            </button>
          </div>
        </div>

        {/* VIEW 1: CARD GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcoming.map((event) => {
              const org = organizations.find(o => o.id === event.orgId);
              const eventShifts = shifts.filter(s => s.eventId === event.id);
              const totalCap = eventShifts.reduce((sum, s) => sum + s.capacity, 0);
              const totalClaimed = eventShifts.reduce((sum, s) => sum + s.claimedCount, 0);
              const openSpots = Math.max(0, totalCap - totalClaimed);
              const fillRate = formatPercentage(totalClaimed, totalCap);

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Event Cover Photo */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                      <img
                        src={event.coverImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      {/* Org Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                          {org?.name || 'Community Org'}
                        </span>
                      </div>

                      {/* 501c3 Tag */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> 501(c)(3)
                        </span>
                      </div>

                      {/* Date on cover */}
                      <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-1 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatTimeRange(event.startDate, event.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{event.venueName} • {event.venueAddress}</span>
                        </div>
                      </div>

                      {/* Fundraising Progress Thermometer */}
                      {event.fundraisingGoal > 0 && (
                        <div className="pt-2">
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-900">{formatCurrency(event.totalRaised)} raised</span>
                            <span className="text-indigo-600">{formatCurrency(event.fundraisingGoal)} goal</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, formatPercentage(event.totalRaised, event.fundraisingGoal))}%` }}
                              className="h-full bg-indigo-600 rounded-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer & Action Button */}
                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Volunteers</span>
                        <span className={`text-xs font-bold ${openSpots > 0 ? 'text-emerald-700 font-extrabold' : 'text-slate-500'}`}>
                          {openSpots > 0 ? `${openSpots} spots open` : 'All filled ✓'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectEventAction(event)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1"
                      >
                        <span>View & Sign Up</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: INTERACTIVE CALENDAR VIEW */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                Community Calendar — {selectedMonth}
              </h3>
              <div className="text-xs text-slate-400 font-semibold">
                Click any scheduled date to register
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredUpcoming.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleSelectEventAction(event)}
                  className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition space-y-2"
                >
                  <span className="text-xs font-bold text-indigo-700 uppercase bg-indigo-100 px-2 py-0.5 rounded">
                    {formatDate(event.startDate)}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                  <p className="text-xs text-slate-500">{event.venueName}</p>
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-600 pt-1">
                    <span>Goal: {formatCurrency(event.fundraisingGoal)}</span>
                    <span className="flex items-center gap-0.5">Sign Up <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* DISTINCT SECTION: PAST EVENTS & COMMUNITY IMPACT OUTCOMES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-extrabold text-slate-900">Past Events & Community Impact</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical record of completed campaigns, total funds raised, and verified volunteer service outcomes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Past Event 1 */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                  Completed & Verified
                </span>
                <span className="text-xs text-slate-400">Spring 2026</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2">Spring Charity 5K Fun Run & Walk</h3>
              <p className="text-xs text-slate-300 mt-1">Lincoln High School Track & Athletic Booster</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Raised</span>
                  <span className="text-base font-black text-emerald-400">$18,450</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Volunteer Hours</span>
                  <span className="text-base font-black text-indigo-300">142 hrs</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-xl text-[11px] text-slate-300">
                ⭐ <strong>Community Outcome:</strong> Funded 45 new student track uniforms and upgraded campus timing equipment.
              </div>
            </div>
          </div>

          {/* Past Event 2 */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                  Completed & Verified
                </span>
                <span className="text-xs text-slate-400">Winter 2025</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2">Annual Holiday Toy & Food Pantry Drive</h3>
              <p className="text-xs text-slate-300 mt-1">Metro Community Foundation</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Raised</span>
                  <span className="text-base font-black text-emerald-400">$32,100</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplies Pledged</span>
                  <span className="text-base font-black text-amber-300">850 items</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-xl text-[11px] text-slate-300">
                ⭐ <strong>Community Outcome:</strong> Provided 350 holiday family meals and toys for local children across 4 shelters.
              </div>
            </div>
          </div>

          {/* Past Event 3 */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                  Completed & Verified
                </span>
                <span className="text-xs text-slate-400">Fall 2025</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2">Youth Invitational Soccer Cup</h3>
              <p className="text-xs text-slate-300 mt-1">Springfield Youth Soccer League</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Raised</span>
                  <span className="text-base font-black text-emerald-400">$14,800</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Teams Hosted</span>
                  <span className="text-base font-black text-teal-300">28 Teams</span>
                </div>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-xl text-[11px] text-slate-300">
                ⭐ <strong>Community Outcome:</strong> Fully funded scholarships for 24 low-income student athletes to participate in the travel league.
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
