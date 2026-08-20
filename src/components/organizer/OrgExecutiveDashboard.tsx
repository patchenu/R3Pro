import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORG_TEMPLATES } from '../../data/templates';
import { VolunteerCrm } from './VolunteerCrm';
import { 
  Building2, Users, Shield, Award, DollarSign, 
  History, Plus, Check, Settings, Sparkles 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrgExecutiveDashboard: React.FC = () => {
  const { currentOrg, users, auditLogs, events, volunteerCrm } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'crm' | 'team' | 'audit' | 'templates'>('crm');

  const totalOrgFunds = events.filter(e => e.orgId === currentOrg.id).reduce((sum, e) => sum + e.totalRaised, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Executive Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                Executive Super Admin Portal
              </span>
              <span className="text-xs text-slate-300">
                EIN: <strong>{currentOrg.ein}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {currentOrg.name} Executive Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Cross-event organization memory, team role delegations, 501(c)(3) compliance settings, and permanent audit logs.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Lifetime Org Revenue</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatCurrency(totalOrgFunds)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('crm')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'crm' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Volunteer & Donor CRM Directory ({volunteerCrm.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'team' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Leadership & Committee Leads ({users.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'templates' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Organization Setup Templates
        </button>

        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeAdminTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: CRM */}
      {activeAdminTab === 'crm' && (
        <VolunteerCrm />
      )}

      {/* TAB 2: Team Members & Roles */}
      {activeAdminTab === 'team' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Organization Staff & Committee Leaders</h3>
              <p className="text-xs text-slate-500">Manage role-based access control and scoped department assignments</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {users.filter(u => u.orgId === currentOrg.id).map(user => (
              <div key={user.id} className="py-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{user.name}</h4>
                    <p className="text-slate-500">{user.email} • {user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold uppercase text-[10px]">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Organization Setup Templates */}
      {activeAdminTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900">Turnkey Organization Onboarding Templates</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-5">Pre-configured industry presets with standard waivers, approval thresholds, and committee departments</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ORG_TEMPLATES.map(tmpl => (
                <div
                  key={tmpl.id}
                  className={`p-5 rounded-2xl border ${
                    currentOrg.type === tmpl.type
                      ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {tmpl.badge}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1.5">{tmpl.name}</h4>
                    </div>
                    {currentOrg.type === tmpl.type && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold">
                        ACTIVE TEMPLATE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{tmpl.description}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <strong>Default Committees:</strong> {tmpl.defaultDepartments.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Immutable Audit Trail */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Security & Compliance Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger recording all financial and role operations</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Actor / User</th>
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-500">{formatDate(log.timestamp)}</td>
                    <td className="py-3 font-bold text-slate-900 font-sans">{log.actorName} ({log.actorRole})</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
