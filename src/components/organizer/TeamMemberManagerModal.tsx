import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Users, Mail, Shield, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

interface TeamMemberManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamMemberManagerModal: React.FC<TeamMemberManagerModalProps> = ({ isOpen, onClose }) => {
  const { currentOrg, users, events, subParts, showToast } = useApp();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('event_planner');
  const [selectedSubPartId, setSelectedSubPartId] = useState<string>(subParts[0]?.id || '');

  const orgUsers = users.filter(u => u.orgId === currentOrg.id);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    showToast(
      'success',
      'Invitation Dispatched!',
      `Sent ${inviteRole.replace('_', ' ')} invitation to ${inviteName} (${inviteEmail}).`
    );

    setInviteEmail('');
    setInviteName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Members & Role Delegations"
      subtitle={`Manage coordinator and committee permissions for ${currentOrg.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        
        {/* Invite Form */}
        <form onSubmit={handleSendInvite} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Invite New Coordinator or Committee Lead
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Rachel Green"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="rachel@example.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              >
                <option value="event_planner">Event Planner (Full Event Scope)</option>
                <option value="committee_lead">Committee Lead (Scoped Department)</option>
                <option value="org_admin">Org Co-Admin (Full Org Access)</option>
              </select>
            </div>

            {inviteRole === 'committee_lead' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
                <select
                  value={selectedSubPartId}
                  onChange={(e) => setSelectedSubPartId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  {subParts.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Role Invitation</span>
            </button>
          </div>
        </form>

        {/* Existing Team Members List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Active Leadership Team ({orgUsers.length})
          </span>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {orgUsers.map(u => (
              <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{u.name}</h4>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
};
