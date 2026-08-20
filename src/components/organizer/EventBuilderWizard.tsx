import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EVENT_TEMPLATES, EventTemplatePreset } from '../../data/templates';
import { Modal } from '../common/Modal';
import { 
  Sparkles, Calendar, MapPin, DollarSign, Users, 
  Gift, Check, ChevronRight, Layers, LayoutTemplate 
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface EventBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventBuilderWizard: React.FC<EventBuilderWizardProps> = ({ isOpen, onClose }) => {
  const { createEvent, currentOrg } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplatePreset | null>(EVENT_TEMPLATES[0]);
  const [title, setTitle] = useState(EVENT_TEMPLATES[0].title);
  const [tagline, setTagline] = useState(EVENT_TEMPLATES[0].tagline);
  const [goal, setGoal] = useState(EVENT_TEMPLATES[0].defaultGoal);
  const [venueName, setVenueName] = useState('Main Community Center');
  const [venueAddress, setVenueAddress] = useState('1420 Lincoln Blvd, Springfield, IL');
  const [startDate, setStartDate] = useState('2026-10-15T09:00:00');
  const [endDate, setEndDate] = useState('2026-10-15T17:00:00');

  const handleSelectPreset = (preset: EventTemplatePreset) => {
    setSelectedTemplate(preset);
    setTitle(preset.title);
    setTagline(preset.tagline);
    setGoal(preset.defaultGoal);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    createEvent({
      title,
      tagline,
      description: selectedTemplate?.description || 'Community Event',
      fundraisingGoal: goal,
      venueName,
      venueAddress,
      startDate,
      endDate,
      coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80'
    }, selectedTemplate?.id);

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event / Campaign"
      subtitle={`Turnkey Setup for ${currentOrg.name}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleCreate} className="space-y-6">
        
        {/* Template Chooser */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Choose an Event Setup Template (Pre-loads shifts, items, and committees)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EVENT_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleSelectPreset(tmpl)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedTemplate?.id === tmpl.id
                    ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div>
                  <span className="text-2xl mb-1 block">{tmpl.icon}</span>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{tmpl.title}</h4>
                  <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                    Goal: {formatCurrency(tmpl.defaultGoal)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">
                  {tmpl.departments.length} Committee Departments
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fundraising Target Goal ($) *</label>
              <input
                type="number"
                min={500}
                required
                value={goal}
                onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-indigo-900"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline & Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Facility Name</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Pre-populated subparts preview */}
        {selectedTemplate && (
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900">
            <span className="font-bold block mb-1">Pre-Configured Department Breakdown:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-indigo-800">
              {selectedTemplate.departments.map((d, dIdx) => (
                <li key={dIdx}>
                  <strong>{d.name}</strong> — {d.shifts.length} shifts ({d.shifts.reduce((a, b) => a + b.capacity, 0)} total volunteers) & {d.items.length} supply items
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Event & Publish</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
