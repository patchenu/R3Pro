import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubPart } from '../../types';
import { Modal } from '../common/Modal';
import { Send, MessageSquare, AlertCircle, Smartphone, Mail } from 'lucide-react';

interface LeadBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  subPart: SubPart;
}

export const LeadBroadcastModal: React.FC<LeadBroadcastModalProps> = ({
  isOpen,
  onClose,
  subPart
}) => {
  const { postAnnouncement, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'important' | 'urgent_emergency'>('normal');
  const [channel, setChannel] = useState<'in_app' | 'sms_simulated' | 'email_simulated' | 'all'>('all');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    postAnnouncement({
      eventId: subPart.eventId,
      subPartId: subPart.id,
      subPartName: subPart.name,
      senderName: currentUser.name,
      senderRole: `${subPart.name} Lead`,
      title,
      message,
      urgency,
      channel
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Broadcast to ${subPart.name} Team`}
      subtitle="Send direct SMS/Email reminders strictly to your department's registered volunteers"
      maxWidth="lg"
    >
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Subject *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Please label all gluten-free items / Meet at Dock Bay 2"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body *</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide specific instructions, weather updates, or shift logistics..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Level</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            >
              <option value="normal">Normal Update</option>
              <option value="important">Important (High Priority)</option>
              <option value="urgent_emergency">Urgent / Emergency Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Channels</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            >
              <option value="all">In-App + SMS + Email</option>
              <option value="sms_simulated">Mobile SMS Only</option>
              <option value="email_simulated">Email Only</option>
              <option value="in_app">In-App Board Only</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            This message will be dispatched strictly to volunteers assigned to <strong>{subPart.name}</strong>.
          </span>
        </div>

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
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Department Broadcast</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
