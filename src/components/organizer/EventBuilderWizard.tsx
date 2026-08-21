import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EVENT_TEMPLATES, EventTemplatePreset } from '../../data/templates';
import { Modal } from '../common/Modal';
import { 
  Sparkles, Calendar, MapPin, DollarSign, Users, 
  Gift, Check, ChevronRight, Layers, LayoutTemplate,
  Tag, Plus, X, Copy, History, HelpCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface EventBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_EVENT_TAGS = [
  'Family Friendly',
  'STEM & Tech',
  'Food & Bake Sale',
  'Carnival & Games',
  'Athletics & Sports',
  'Arts & Music',
  'Charity Gala',
  'Silent Auction',
  'Student Service Hours',
  'Outdoors',
  'Free Admission'
];

export const EventBuilderWizard: React.FC<EventBuilderWizardProps> = ({ isOpen, onClose }) => {
  const { createEvent, currentOrg, events, subParts, shifts, itemSlots, showToast } = useApp();

  // Template Source Mode: 'blueprint' | 'clone_past' | 'blank'
  const [sourceMode, setSourceMode] = useState<'blueprint' | 'clone_past' | 'blank'>('blueprint');
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplatePreset | null>(EVENT_TEMPLATES[0]);
  const [selectedPastEventId, setSelectedPastEventId] = useState<string>('');

  const [title, setTitle] = useState(EVENT_TEMPLATES[0].title);
  const [tagline, setTagline] = useState(EVENT_TEMPLATES[0].tagline);
  const [goal, setGoal] = useState(EVENT_TEMPLATES[0].defaultGoal);
  const [venueName, setVenueName] = useState('Main Community Center');
  const [venueAddress, setVenueAddress] = useState('1420 Lincoln Blvd, Springfield, IL');
  const [startDate, setStartDate] = useState('2026-10-15T09:00:00');
  const [endDate, setEndDate] = useState('2026-10-15T17:00:00');

  // Event Tags
  const [selectedTags, setSelectedTags] = useState<string[]>(['Family Friendly', 'Carnival & Games', 'Student Service Hours']);
  const [customTagInput, setCustomTagInput] = useState('');

  const orgPastEvents = events.filter(e => e.orgId === currentOrg.id);

  const handleSelectPreset = (preset: EventTemplatePreset) => {
    setSelectedTemplate(preset);
    setTitle(preset.title);
    setTagline(preset.tagline);
    setGoal(preset.defaultGoal);
    if (preset.id === 'tpl_stem_night') {
      setSelectedTags(['STEM & Tech', 'Robotics', 'Student Service Hours']);
    } else if (preset.id === 'tpl_charity_gala') {
      setSelectedTags(['Charity Gala', 'Silent Auction', 'Dinner & Symphony']);
    } else {
      setSelectedTags(['Family Friendly', 'Carnival & Games', 'Student Service Hours']);
    }
  };

  const handleSelectPastEvent = (pastEventId: string) => {
    setSelectedPastEventId(pastEventId);
    const past = events.find(e => e.id === pastEventId);
    if (past) {
      setTitle(`${past.title.replace(/\d{4}/, '')} ${new Date().getFullYear() + 1}`.trim());
      setTagline(past.tagline);
      setGoal(past.fundraisingGoal);
      setVenueName(past.venueName);
      setVenueAddress(past.venueAddress);
      setSelectedTags(past.tags || ['Family Friendly']);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setCustomTagInput('');
  };

  const isDuplicateEvent = events.some(e => 
    e.orgId === currentOrg.id && 
    e.title.toLowerCase().trim() === title.toLowerCase().trim() && 
    e.startDate.slice(0, 10) === startDate.slice(0, 10)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isDuplicateEvent) {
      showToast('error', 'Duplicate Event Detected', `An event titled "${title}" is already scheduled on ${startDate.slice(0, 10)} for ${currentOrg.name}.`);
      return;
    }

    const templateId = sourceMode === 'blueprint' ? selectedTemplate?.id : undefined;

    createEvent({
      title,
      tagline,
      description: selectedTemplate?.description || `Community fundraiser and volunteer event for ${currentOrg.name}`,
      fundraisingGoal: goal,
      venueName,
      venueAddress,
      startDate,
      endDate,
      tags: selectedTags,
      coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80'
    }, templateId);

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event / Campaign"
      subtitle={`Campaign Setup & Tag Configuration for ${currentOrg.name}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleCreate} className="space-y-6">
        
        {/* Source & Template Selection Strategy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Choose Campaign Setup Source
            </label>
            <span className="text-[11px] text-slate-400 font-semibold">Where do shifts & committees come from?</span>
          </div>

          {/* 3 Source Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setSourceMode('blueprint');
                if (selectedTemplate) handleSelectPreset(selectedTemplate);
              }}
              className={`py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                sourceMode === 'blueprint'
                  ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
              <span>Industry Blueprints</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceMode('clone_past');
                if (orgPastEvents.length > 0) handleSelectPastEvent(orgPastEvents[0].id);
              }}
              className={`py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                sourceMode === 'clone_past'
                  ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-600" />
              <span>Clone Past Event</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceMode('blank');
                setTitle('New Community Event');
                setTagline('Support our community drive');
                setSelectedTags(['Community Event', 'Family Friendly']);
              }}
              className={`py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 ${
                sourceMode === 'blank'
                  ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Blank (Start from Scratch)</span>
            </button>
          </div>

          {/* Blueprint Cards */}
          {sourceMode === 'blueprint' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
              {EVENT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectPreset(tmpl)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedTemplate?.id === tmpl.id
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
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
                    {tmpl.departments.length} Preloaded Departments
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clone Past Event Picker */}
          {sourceMode === 'clone_past' && (
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-900">Select Past Event to Duplicate:</span>
              </div>

              {orgPastEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {orgPastEvents.map(past => (
                    <div
                      key={past.id}
                      onClick={() => handleSelectPastEvent(past.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        selectedPastEventId === past.id
                          ? 'bg-white border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-white/80 border-purple-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{past.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {past.eventKey} • Raised {formatCurrency(past.totalRaised)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-purple-700">No past events recorded yet. Industry blueprints recommended!</p>
              )}
            </div>
          )}

          {/* Blank Event Notice */}
          {sourceMode === 'blank' && (
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Starting from a Blank Slate:</strong> No pre-populated shifts or items will be created. Once published, you can dynamically add custom committee departments, volunteer shifts, and item wishlist needs inside the <strong>📊 Planner Hub</strong> anytime with 1-click creation modals!
              </div>
            </div>
          )}
        </div>

        {/* 2. Basic Campaign Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            2. Campaign Overview & Location
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fundraising Target Goal ($) *</label>
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
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tagline & Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Venue / Facility Name</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 3. Event Tags for Public Search & Filtering */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Public Search & Filter Tags</span>
            </label>
            <span className="text-[11px] text-slate-500 font-semibold">Allows attendees & volunteers to filter events</span>
          </div>

          {/* Active Selected Tags */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-white rounded-xl border border-slate-200">
            {selectedTags.length > 0 ? (
              selectedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs shadow-2xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className="hover:text-purple-950 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No tags selected yet. Click presets below or type custom tag.</span>
            )}
          </div>

          {/* Preset Tag Library */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Suggested Tag Library:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_EVENT_TAGS.map(presetTag => {
                const isSelected = selectedTags.includes(presetTag);
                return (
                  <button
                    key={presetTag}
                    type="button"
                    onClick={() => handleToggleTag(presetTag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{presetTag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTag();
                }
              }}
              placeholder="Type custom tag (e.g. 5K Run, High School, Book Fair)..."
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tag</span>
            </button>
          </div>
        </div>

        {/* Pre-populated departments breakdown for blueprint */}
        {sourceMode === 'blueprint' && selectedTemplate && (
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

