import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { 
  User as UserIcon, Building2, Calendar, ShieldCheck, 
  Receipt, QrCode, CheckCircle2, Clock, MapPin, LogOut, ArrowRight, Plus 
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
  const { currentUser, currentOrg, organizations, events, registrations, shifts, subParts, donations, switchOrganization, switchEvent, switchRole, cancelRegistration } = useApp();

  const [activeTab, setActiveTab] = useState<'memberships' | 'my_shifts' | 'my_donations'>('memberships');
  const [qrPassToken, setQrPassToken] = useState<string | null>(null);

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

            <button
              onClick={() => {
                onClose();
                onOpenOrgWizard();
              }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Organization</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('memberships')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'memberships' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏢 Organizations & Roles I Lead ({userMemberships.length})
            </button>

            <button
              onClick={() => setActiveTab('my_shifts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'my_shifts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🙋‍♂️ My Volunteer Passes ({myRegistrations.length})
            </button>

            <button
              onClick={() => setActiveTab('my_donations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'my_donations' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🧾 Tax Receipts ({myDonations.length})
            </button>
          </div>

          {/* TAB 1: Organizations & Roles I Lead */}
          {activeTab === 'memberships' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                You can switch between your administrative, coordinator, and lead roles across all organizations you belong to:
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
                      onClick={() => printIrsTaxLetterHtml(don, currentOrg, events[0])}
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
