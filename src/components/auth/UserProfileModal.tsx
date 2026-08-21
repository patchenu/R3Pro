import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { 
  User as UserIcon, Building2, Calendar, ShieldCheck, 
  Receipt, QrCode, CheckCircle2, Clock, MapPin, LogOut, ArrowRight, Plus, Settings, Lock, KeyRound 
} from 'lucide-react';
import { formatCurrency, formatTimeRange, formatDate } from '../../utils/formatters';
import { QrCodeModal } from '../common/QrCodeModal';
import { printIrsTaxLetterHtml } from '../../utils/exportPdf';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrgWizard: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenOrgWizard
}) => {
  const { 
    currentUser, currentOrg, organizations, events, registrations, 
    shifts, subParts, donations, switchOrganization, switchEvent, 
    switchRole, cancelRegistration, updateUserProfile, resetPassword, logout 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'memberships' | 'my_shifts' | 'my_donations' | 'settings'>('memberships');
  const [qrPassToken, setQrPassToken] = useState<string | null>(null);

  // Settings form state
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // User's volunteer registrations across all events matching their email or phone
  const myRegistrations = registrations.filter(r => 
    r.primaryEmail.toLowerCase() === currentUser.email.toLowerCase() ||
    r.primaryName.toLowerCase() === currentUser.name.toLowerCase()
  );

  // User's donations
  const myDonations = donations.filter(d => 
    d.donorEmail.toLowerCase() === currentUser.email.toLowerCase() ||
    d.donorName.toLowerCase() === currentUser.name.toLowerCase()
  );

  // User's roles across organizations
  const userMemberships = currentUser.memberships || [
    {
      orgId: currentOrg.id,
      orgName: currentOrg.name,
      role: currentUser.role,
      status: 'active' as const
    }
  ];

  const handleSelectRoleOrg = (orgId: string, role: any) => {
    switchOrganization(orgId);
    switchRole(role);
    onClose();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      email: editEmail,
      phone: editPhone
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    resetPassword(currentUser.email, newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="My Account & Delegated Roles"
        subtitle={`Signed in as ${currentUser.name} (${currentUser.email})`}
        maxWidth="3xl"
      >
        <div className="space-y-6">
          
          {/* Top User Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/40">
                    Active: {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{currentUser.email} • {currentUser.phone || '(555) 000-0000'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenOrgWizard();
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Org</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold py-2 px-3 rounded-xl text-xs transition"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('memberships')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'memberships' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏢 Organizations & Roles I Lead ({userMemberships.length})
            </button>

            <button
              onClick={() => setActiveTab('my_shifts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'my_shifts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🙋‍♂️ My Volunteer Passes ({myRegistrations.length})
            </button>

            <button
              onClick={() => setActiveTab('my_donations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'my_donations' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🧾 Tax Receipts ({myDonations.length})
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⚙️ Settings & Password
            </button>
          </div>

          {/* TAB 1: Organizations & Roles I Lead */}
          {activeTab === 'memberships' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Switch between your administrative, coordinator, and lead roles across all organizations you belong to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {organizations.map(org => {
                  const isCurrent = org.id === currentOrg.id;
                  return (
                    <div
                      key={org.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {org.type.replace('_', ' ')}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                              Current Org
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">{org.name}</h4>
                        <p className="text-xs text-slate-500">EIN: {org.ein}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 uppercase text-[11px]">
                          Role: {currentUser.role.replace('_', ' ')}
                        </span>
                        {!isCurrent && (
                          <button
                            onClick={() => handleSelectRoleOrg(org.id, currentUser.role)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            Switch into Org <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenOrgWizard();
                  }}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Register Another Organization or School</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: My Volunteer Shifts & Family Registrations */}
          {activeTab === 'my_shifts' && (
            <div className="space-y-4">
              {myRegistrations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  You have not registered for any volunteer shifts yet. Click on any public event to sign up!
                </div>
              ) : (
                myRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Registration Confirmed
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{reg.primaryName}</h4>
                        <p className="text-xs text-slate-500">{reg.primaryEmail} • {reg.primaryPhone}</p>
                      </div>

                      <button
                        onClick={() => setQrPassToken(reg.manageToken)}
                        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm transition"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Check-In QR Pass</span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 pt-2 border-t border-slate-100">
                      {reg.shiftClaims.map((claim, cIdx) => {
                        const shift = shifts.find(s => s.id === claim.shiftId);
                        const member = reg.members.find(m => m.id === claim.groupMemberId) || reg.members[0];

                        return (
                          <div key={cIdx} className="py-2 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-900">{shift?.title || 'Volunteer Shift'}</span>
                              <span className="block text-slate-500 text-[11px]">
                                Volunteer: <strong>{member.name}</strong> • Schedule: {shift ? formatTimeRange(shift.startTime, shift.endTime) : ''}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              claim.checkedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {claim.checkedIn ? 'Checked In ✓' : 'Shift Upcoming'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Tax Receipts */}
          {activeTab === 'my_donations' && (
            <div className="space-y-4">
              {myDonations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  No charitable contributions recorded under this email address.
                </div>
              ) : (
                myDonations.map((don) => (
                  <div
                    key={don.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white flex justify-between items-center text-xs shadow-sm"
                  >
                    <div>
                      <span className="font-mono font-bold text-indigo-600 text-xs">{don.taxReceiptNumber}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{formatCurrency(don.amount)}</h4>
                      <p className="text-slate-500 text-[11px]">{formatDate(don.createdAt)} • Deductible: {formatCurrency(don.deductibleAmount)}</p>
                    </div>

                    <button
                      onClick={() => printIrsTaxLetterHtml(events.find(e => e.id === don.eventId) || events[0], currentOrg, don)}
                      className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 transition"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Print IRS Letter</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Settings & Security */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              {/* Profile Details */}
              <form onSubmit={handleSaveProfile} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Profile Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>

              {/* Password Change */}
              <form onSubmit={handleChangePassword} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Change Account Password
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!newPassword || newPassword !== confirmPassword}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* Sign Out Action */}
              <div className="pt-2 flex justify-between items-center border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  Signed in on this browser as <strong>{currentUser.email}</strong>
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of R3Pro</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </Modal>

      {/* QR Code Pass Modal */}
      {qrPassToken && (
        <QrCodeModal
          isOpen={!!qrPassToken}
          onClose={() => setQrPassToken(null)}
          title="Volunteer Express Check-In Pass"
          url={`${window.location.origin}/?manage=${qrPassToken}`}
          subTitle="Present this digital pass at the door Check-In Kiosk"
        />
      )}
    </>
  );
};
