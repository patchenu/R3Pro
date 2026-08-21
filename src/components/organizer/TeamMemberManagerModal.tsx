import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Users, Mail, Shield, Plus, Trash2, CheckCircle2, AlertCircle, Edit3, Briefcase, Phone, X } from 'lucide-react';
import { UserRole, User } from '../../types';

interface TeamMemberManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamMemberManagerModal: React.FC<TeamMemberManagerModalProps> = ({ isOpen, onClose }) => {
  const { currentOrg, users, currentUser, subParts, inviteTeamMember, updateTeamMember, removeTeamMember, showToast } = useApp();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('event_planner');
  const [selectedSubPartId, setSelectedSubPartId] = useState<string>(subParts[0]?.id || '');

  // Edit Member State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('event_planner');
  const [editSubPartId, setEditSubPartId] = useState<string>(subParts[0]?.id || '');

  const orgUsers = users.filter(u => u.orgId === currentOrg.id);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    inviteTeamMember({
      orgId: currentOrg.id,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      phone: invitePhone.trim() || '(555) 000-0000',
      role: inviteRole,
      assignedSubPartIds: inviteRole === 'committee_lead' && selectedSubPartId ? [selectedSubPartId] : []
    });

    setInviteEmail('');
    setInviteName('');
    setInvitePhone('');
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditSubPartId(user.assignedSubPartIds?.[0] || subParts[0]?.id || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateTeamMember(editingUser.id, {
      role: editRole,
      assignedSubPartIds: editRole === 'committee_lead' && editSubPartId ? [editSubPartId] : []
    });

    setEditingUser(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Members & Role Delegations"
      subtitle={`Manage coordinator, planner, and committee lead permissions for ${currentOrg.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        
        {/* Invite Form */}
        <form onSubmit={handleSendInvite} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Invite New Coordinator or Committee Lead</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Rachel Green"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (Optional)</label>
              <input
                type="text"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                placeholder="(555) 234-5678"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="event_planner">Event Planner (Full Event Logistics)</option>
                <option value="committee_lead">Committee Lead (Scoped Department)</option>
                <option value="org_admin">Org Co-Admin (Full Org Access)</option>
              </select>
            </div>

            {inviteRole === 'committee_lead' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department / Sub-Part</label>
                <select
                  value={selectedSubPartId}
                  onChange={(e) => setSelectedSubPartId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  {subParts.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name} ({sp.reportingGate})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
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
            {orgUsers.map(u => {
              const isCurrent = u.id === currentUser.id;
              const assignedDept = subParts.find(sp => u.assignedSubPartIds?.includes(sp.id));

              return (
                <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shadow-xs">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-xs">{u.name}</h4>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-bold rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{u.email} {u.phone && `• ${u.phone}`}</p>
                      {assignedDept && (
                        <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                          Department: {assignedDept.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'org_admin' ? 'bg-purple-600 text-white' :
                      u.role === 'event_planner' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Role & Delegation"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove ${u.name} from organization team roles?`)) {
                            removeTeamMember(u.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove Team Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Edit Team Member Role */}
        {editingUser && (
          <Modal
            isOpen={Boolean(editingUser)}
            onClose={() => setEditingUser(null)}
            title={`Edit Permissions: ${editingUser.name}`}
            subtitle="Change role level or assign to a different committee department"
          >
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Level</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="event_planner">Event Planner (Full Event Logistics)</option>
                  <option value="committee_lead">Committee Lead (Scoped Department)</option>
                  <option value="org_admin">Org Co-Admin (Full Org Access)</option>
                </select>
              </div>

              {editRole === 'committee_lead' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Department</label>
                  <select
                    value={editSubPartId}
                    onChange={(e) => setEditSubPartId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {subParts.map(sp => (
                      <option key={sp.id} value={sp.id}>{sp.name} ({sp.reportingGate})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Permissions
                </button>
              </div>
            </form>
          </Modal>
        )}

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
