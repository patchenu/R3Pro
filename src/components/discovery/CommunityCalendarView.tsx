import React, { useState } from 'react';
import { Event, Organization } from '../../types';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, ArrowRight, ShieldCheck, Users, Sparkles 
} from 'lucide-react';
import { formatCurrency, formatDate, formatTimeRange } from '../../utils/formatters';

interface CommunityCalendarViewProps {
  events: Event[];
  organizations: Organization[];
  onSelectEvent: (event: Event) => void;
}

export const CommunityCalendarView: React.FC<CommunityCalendarViewProps> = ({
  events,
  organizations,
  onSelectEvent
}) => {
  // Default to September 2026 (matching the active campaign dates)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 is September (0-indexed)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(events[0] || null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Find events strictly matching this month and specific day
  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.startDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });
  };

  // Events in this entire month
  const eventsInMonth = events.filter(e => {
    const d = new Date(e.startDate);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      
      {/* Calendar Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-extrabold text-slate-900">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {eventsInMonth.length === 1 
              ? `1 event scheduled in ${monthNames[currentMonth]} ${currentYear}`
              : `${eventsInMonth.length} events scheduled in ${monthNames[currentMonth]} ${currentYear}`}
          </p>
        </div>

        {/* Month Switcher Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(8); // September 2026
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Sep 2026
          </button>
          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(9); // October 2026
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Oct 2026
          </button>

          <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-200 text-slate-700 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-200 text-slate-700 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real Interactive 7-Column Month Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        {/* Day of Week Headers */}
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-slate-100 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {day}
          </div>
        ))}

        {/* Leading Empty Cells */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[95px] p-2" />
        ))}

        {/* Real Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const dayEvents = getEventsForDay(day);
          const isSelected = selectedEvent && dayEvents.some(e => e.id === selectedEvent.id);

          return (
            <div
              key={day}
              className={`min-h-[105px] p-2 transition flex flex-col justify-between ${
                dayEvents.length > 0
                  ? isSelected
                    ? 'bg-indigo-50/90 ring-2 ring-indigo-600 z-10'
                    : 'bg-white hover:bg-indigo-50/40 cursor-pointer'
                  : 'bg-white text-slate-700'
              }`}
              onClick={() => {
                if (dayEvents.length > 0) {
                  setSelectedEvent(dayEvents[0]);
                }
              }}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                  dayEvents.length > 0
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700'
                }`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                    {dayEvents.length} Event
                  </span>
                )}
              </div>

              {/* Event Marker Pills */}
              <div className="space-y-1 mt-1">
                {dayEvents.map(e => {
                  const org = organizations.find(o => o.id === e.orgId);
                  return (
                    <div
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onSelectEvent(e);
                      }}
                      className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[10px] font-bold leading-tight shadow-sm hover:from-indigo-700 hover:to-indigo-800 transition truncate cursor-pointer transform hover:scale-[1.02]"
                      title={`Click to view ${e.title} and volunteer`}
                    >
                      <span className="block truncate">{e.title}</span>
                      <span className="text-[9px] text-indigo-200 font-semibold block">{e.startDate.slice(11, 16)} • Volunteer & Sign Up →</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Event Preview & Quick Sign-Up Drawer */}
      {selectedEvent ? (
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                {formatDate(selectedEvent.startDate)}
              </span>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeRange(selectedEvent.startDate, selectedEvent.endDate)}
              </span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900">{selectedEvent.title}</h4>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {selectedEvent.venueName} • {selectedEvent.venueAddress}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedEvent.fundraisingGoal > 0 && (
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Campaign Goal</span>
                <span className="text-sm font-extrabold text-indigo-700">{formatCurrency(selectedEvent.fundraisingGoal)}</span>
              </div>
            )}

            <button
              onClick={() => onSelectEvent(selectedEvent)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
            >
              <span>View Needs & Volunteer Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
          No events scheduled for the selected month. Click <strong>Oct 2026</strong> above to view upcoming campaigns.
        </div>
      )}

    </div>
  );
};
