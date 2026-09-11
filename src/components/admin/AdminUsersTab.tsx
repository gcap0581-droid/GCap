import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  Award,
  AlertTriangle,
  UserCheck,
  UserX,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { Language, UserProfile } from '../../types';

interface AdminUsersTabProps {
  users: UserProfile[];
  language: Language;
  onAddUser: () => void;
  onEditUser: (user: UserProfile) => void;
  onToggleUserStatus: (userId: string, currentStatus: 'ACTIVE' | 'BLOCKED') => void;
  onDeleteUser: (userId: string) => void;
  onViewAgreement?: (user: UserProfile) => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  language,
  onAddUser,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
  onViewAgreement,
  onRefresh,
  isSyncing = false,
}) => {
  const isHi = language === 'hi';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const uName = String(u.name || '').toLowerCase();
    const uLogin = String(u.loginId || '').toLowerCase();
    const uPhone = String(u.phone || '');
    const uEmail = String(u.email || '').toLowerCase();
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      uName.includes(search) ||
      uLogin.includes(search) ||
      uPhone.includes(search) ||
      uEmail.includes(search);

    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const userToDelete = users.find((u) => u && u.id === deleteConfirmId);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>{isHi ? 'पंजीकृत निवेशक एवं एडमिन खाता प्रबंधन' : 'Registered Users & Accounts Management'}</span>
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isHi ? 'सेंट्रल डेटाबेस रीयल-टाइम लाइव सिंक' : 'Central DB Real-Time Live Sync'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHi
              ? `कुल पंजीकृत खाते: ${users.length} • सभी डिवाइसेज़ व एडमिन सत्रों पर एक ही केंद्रीय डेटाबेस से रीयल-टाइम सिंक रहता है`
              : `Total Accounts: ${users.length} • Single authoritative central database synchronized across all admin sessions in real time`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRefresh && (
            <button
              id="btn-admin-refresh-users"
              onClick={onRefresh}
              disabled={isSyncing}
              title={isHi ? 'सर्वर से नया डेटा खींचें' : 'Fetch latest users from server'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-300'}`} />
              <span>{isSyncing ? (isHi ? 'सिंक हो रहा है...' : 'Syncing...') : (isHi ? 'रीफ़्रेश' : 'Refresh')}</span>
            </button>
          )}

          <button
            id="btn-admin-add-user"
            onClick={onAddUser}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHi ? '+ नया यूज़र जोड़ें' : '+ Add New Account'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isHi ? 'नाम, मोबाइल, आईडी से खोजें...' : 'Search by name, ID, phone...'}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 hidden sm:inline">{isHi ? 'फ़िल्टर:' : 'Filter:'}</span>
          {(['ALL', 'USER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterRole === r
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === 'ALL' ? (isHi ? 'सभी' : 'All') : r === 'USER' ? (isHi ? 'निवेशक' : 'Users') : 'Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{isHi ? 'यूज़र / नाम' : 'User / Name'}</th>
                <th className="py-3 px-4">{isHi ? 'लॉगिन आईडी व फ़ोन' : 'Login ID & Phone'}</th>
                <th className="py-3 px-4">{isHi ? 'रोल' : 'Role'}</th>
                <th className="py-3 px-4">{isHi ? 'स्थिति' : 'Status'}</th>
                <th className="py-3 px-4">{isHi ? 'शामिल होने की तिथि' : 'Joined Date'}</th>
                <th className="py-3 px-4 text-right">{isHi ? 'कार्रवाई (Actions)' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {isHi ? 'कोई यूज़र नहीं मिला।' : 'No users found matching query.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'ADMIN';
                  const isBlocked = u.status === 'BLOCKED';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isAdmin
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {isAdmin ? '👑' : (u.name || u.loginId || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name || u.loginId || 'Investor'}</span>
                              {(() => {
                                const todayStr = new Date().toISOString().split('T')[0];
                                const isNew =
                                  u.joinedDate === todayStr ||
                                  (u.id.startsWith('usr-') &&
                                    Date.now() - Number(u.id.replace('usr-', '')) < 24 * 60 * 60 * 1000);
                                if (isNew) {
                                  return (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 uppercase tracking-wider animate-pulse">
                                      {isHi ? '✨ नया' : '✨ NEW'}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                              {u.referralCode && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                  {u.referralCode}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email || 'No email registered'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Login ID & Phone */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-200 font-bold">{u.loginId}</div>
                        <div className="text-[11px] text-slate-400">{u.phone}</div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isAdmin
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isAdmin ? 'SUPER ADMIN' : 'INVESTOR'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isBlocked
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isBlocked ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
                            }`}
                          ></span>
                          {isBlocked ? (isHi ? 'निलंबित' : 'Blocked') : (isHi ? 'सक्रिय' : 'Active')}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {u.joinedDate}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View & Print Legal Agreement */}
                          <button
                            onClick={() => onViewAgreement && onViewAgreement(u)}
                            className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                            title={isHi ? 'कानूनी अनुबंध पत्र देखें / प्रिंट करें' : 'View & Print Legal Agreement PDF'}
                          >
                            <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden sm:inline">{isHi ? 'अनुबंध PDF' : 'Agreement'}</span>
                          </button>

                          {/* Toggle Block / Unblock */}
                          <button
                            onClick={() => onToggleUserStatus(u.id, u.status)}
                            disabled={u.loginId === 'admin'}
                            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              isBlocked
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}
                            title={isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => onEditUser(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all cursor-pointer"
                            title={isHi ? 'यूज़र संपादित करें' : 'Edit User'}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteConfirmId(u.id)}
                            disabled={u.loginId === 'admin'}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isHi ? 'यूज़र हटाएं' : 'Delete User'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {isHi ? 'यूज़र खाता हटाएं?' : 'Delete User Account?'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isHi ? 'इस यूज़र का लॉगिन और रिकॉर्ड हटा दिया जाएगा।' : 'This account and access will be removed.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="font-bold text-white">{userToDelete.name} ({userToDelete.loginId})</div>
              <div className="text-slate-400">{userToDelete.phone} • {userToDelete.role}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteUser(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30"
              >
                {isHi ? 'हां, खाता हटाएं' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
