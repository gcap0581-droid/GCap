import React, { useState, useEffect } from 'react';
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
  Wallet as WalletIcon,
  Sparkles,
  ArrowUpDown,
  LogIn,
  LogOut,
  Clock,
  Radio,
} from 'lucide-react';
import { Language, UserProfile, Wallet } from '../../types';
import { getWalletForUser } from '../../utils/centralSync';
import { enrichUsersWithPresence } from '../../utils/authStorage';

interface AdminUsersTabProps {
  users: UserProfile[];
  wallets?: Record<string, Wallet>;
  language: Language;
  onAddUser: () => void;
  onEditUser: (user: UserProfile) => void;
  onEditUserWallet?: (user: UserProfile) => void;
  onToggleUserStatus: (userId: string, currentStatus: 'ACTIVE' | 'BLOCKED') => void;
  onDeleteUser: (userId: string) => void;
  onViewAgreement?: (user: UserProfile) => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
  defaultFilterStatus?: 'ALL' | 'ONLINE' | 'OFFLINE' | 'USER' | 'ADMIN';
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  wallets = {},
  language,
  onAddUser,
  onEditUser,
  onEditUserWallet,
  onToggleUserStatus,
  onDeleteUser,
  onViewAgreement,
  onRefresh,
  isSyncing = false,
  defaultFilterStatus,
}) => {
  const isHi = language === 'hi';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'USER' | 'ADMIN'>(defaultFilterStatus || 'ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (defaultFilterStatus) {
      setFilterStatus(defaultFilterStatus);
    }
  }, [defaultFilterStatus]);

  const enrichedUsers = enrichUsersWithPresence(users);
  const onlineClients = enrichedUsers.filter((u) => u && u.role !== 'ADMIN' && Boolean(u.isOnline));
  const onlineAdmins = enrichedUsers.filter((u) => u && u.role === 'ADMIN' && Boolean(u.isOnline));
  const onlineCount = enrichedUsers.filter((u) => u && Boolean(u.isOnline)).length;
  const offlineCount = enrichedUsers.length - onlineCount;

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return isHi ? 'उपलब्ध नहीं' : 'Not recorded';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  const filteredUsers = enrichedUsers.filter((u) => {
    if (!u) return false;
    const uPhone = String(u.phone || '').trim();
    const uCleanPhone = uPhone.replace(/[^0-9]/g, '');
    const uName = String(u.name || '').toLowerCase();
    const uLogin = String(u.loginId || '').toLowerCase();
    const search = searchTerm.toLowerCase().trim();
    const searchClean = search.replace(/[^0-9]/g, '');

    // Primary matching by Mobile Number first, then Name/ID if entered
    const matchesSearch =
      !search ||
      (searchClean && uCleanPhone.includes(searchClean)) ||
      uPhone.includes(search) ||
      uName.includes(search) ||
      uLogin.includes(search);

    const isOnline = Boolean(u.isOnline);
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ONLINE' && isOnline) ||
      (filterStatus === 'OFFLINE' && !isOnline) ||
      (filterStatus === 'USER' && u.role === 'USER') ||
      (filterStatus === 'ADMIN' && u.role === 'ADMIN');

    return matchesSearch && matchesStatus;
  });

  const userToDelete = enrichedUsers.find((u) => u && u.id === deleteConfirmId);

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
              ? `कुल पंजीकृत खाते: ${users.length} • एडमिन किसी भी यूज़र का वॉलेट बैलेंस, प्रोफ़ाइल, पासवर्ड और सभी विवरण सीधे एडिट कर सकता है`
              : `Total Accounts: ${users.length} • Full administrative control over user wallets, balances, profiles, passwords, and banks`}
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

      {/* Live Online & Offline Quick Presence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Online Users */}
        <button
          type="button"
          id="btn-filter-online-users"
          onClick={() => setFilterStatus(filterStatus === 'ONLINE' ? 'ALL' : 'ONLINE')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            filterStatus === 'ONLINE'
              ? 'bg-emerald-950/50 border-emerald-500/70 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-950/60'
              : 'bg-slate-900/80 border-slate-800/90 hover:border-emerald-500/40 hover:bg-slate-850/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span>{isHi ? 'वर्तमान में ऑनलाइन यूज़र्स' : 'Currently Online Users'}</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {onlineCount > 0 ? (isHi ? '🟢 लाइव सक्रिय' : 'LIVE ACTIVE') : (isHi ? 'कोई नहीं' : '0 ACTIVE')}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-3xl font-black font-mono text-emerald-400">{onlineCount}</span>
            <span className="text-xs text-slate-300">
              {isHi
                ? `कुल सक्रिय (${onlineClients.length} ग्राहक + ${onlineAdmins.length} एडमिन)`
                : `Active (${onlineClients.length} Clients + ${onlineAdmins.length} Admin)`}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className={`font-semibold transition-colors ${filterStatus === 'ONLINE' ? 'text-emerald-300 underline' : 'text-emerald-400/90 group-hover:text-emerald-300'}`}>
              {filterStatus === 'ONLINE'
                ? (isHi ? '✓ ऑनलाइन यूज़र्स दिख रहे हैं (क्लिक करके हटाएं)' : '✓ Filtering Online (Click to reset)')
                : (isHi ? '👉 केवल ऑनलाइन यूज़र्स देखें' : '👉 View Online Users Only')}
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {users.length > 0 ? Math.round((onlineCount / users.length) * 100) : 0}% {isHi ? 'सक्रिय' : 'active'}
            </span>
          </div>
        </button>

        {/* Card 2: Offline Users */}
        <button
          type="button"
          id="btn-filter-offline-users"
          onClick={() => setFilterStatus(filterStatus === 'OFFLINE' ? 'ALL' : 'OFFLINE')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            filterStatus === 'OFFLINE'
              ? 'bg-slate-800 border-slate-500 ring-2 ring-slate-400/30 shadow-xl'
              : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>{isHi ? 'वर्तमान में ऑफ़लाइन यूज़र्स' : 'Currently Offline Users'}</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              OFFLINE
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-3xl font-black font-mono text-slate-200">{offlineCount}</span>
            <span className="text-xs text-slate-400">
              {isHi ? 'लोग अभी लॉगआउट / निष्क्रिय हैं' : 'users disconnected'}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className={`font-semibold transition-colors ${filterStatus === 'OFFLINE' ? 'text-slate-200 underline' : 'text-slate-400 group-hover:text-slate-300'}`}>
              {filterStatus === 'OFFLINE'
                ? (isHi ? '✓ ऑफ़लाइन यूज़र्स दिख रहे हैं (क्लिक करके हटाएं)' : '✓ Filtering Offline (Click to reset)')
                : (isHi ? '👉 केवल ऑफ़लाइन यूज़र्स देखें' : '👉 View Offline Users Only')}
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {users.length > 0 ? Math.round((offlineCount / users.length) * 100) : 0}% {isHi ? 'ऑफ़लाइन' : 'offline'}
            </span>
          </div>
        </button>

        {/* Card 3: Total Accounts */}
        <button
          type="button"
          id="btn-filter-all-users"
          onClick={() => setFilterStatus('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            filterStatus === 'ALL'
              ? 'bg-cyan-950/40 border-cyan-500/60 ring-2 ring-cyan-500/30 shadow-xl'
              : 'bg-slate-900/80 border-slate-800/90 hover:border-cyan-500/30 hover:bg-slate-850/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHi ? 'कुल पंजीकृत खाते' : 'Total Accounts'}</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {isHi ? 'समस्त खाते' : 'ALL USERS'}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-3xl font-black font-mono text-cyan-300">{users.length}</span>
            <span className="text-xs text-slate-400">
              {isHi ? 'सिस्टम में कुल दर्ज सदस्य' : 'total registered accounts'}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className={`font-semibold transition-colors ${filterStatus === 'ALL' ? 'text-cyan-300 underline' : 'text-cyan-400/90 group-hover:text-cyan-300'}`}>
              {filterStatus === 'ALL'
                ? (isHi ? '✓ सभी यूज़र्स प्रदर्शित हैं' : '✓ Showing All Accounts')
                : (isHi ? '👉 सभी यूज़र्स देखें' : '👉 View All Accounts')}
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              100% {isHi ? 'डेटाबेस' : 'database'}
            </span>
          </div>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isHi ? 'मोबाइल नंबर / यूज़र नाम से खोजें...' : 'Search by Mobile Number / Name...'}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <span className="text-xs text-slate-400 hidden sm:inline mr-1">{isHi ? 'फ़िल्टर:' : 'Filter:'}</span>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isHi ? `सभी (${users.length})` : `All (${users.length})`}
          </button>
          <button
            onClick={() => setFilterStatus('ONLINE')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'ONLINE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isHi ? `ऑनलाइन (${onlineCount})` : `Online (${onlineCount})`}</span>
          </button>
          <button
            onClick={() => setFilterStatus('OFFLINE')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'OFFLINE'
                ? 'bg-slate-700 text-slate-200 border border-slate-600'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>{isHi ? `ऑफ़लाइन (${offlineCount})` : `Offline (${offlineCount})`}</span>
          </button>
          <button
            onClick={() => setFilterStatus('USER')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'USER'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isHi ? 'निवेशक' : 'Users'}
          </button>
          <button
            onClick={() => setFilterStatus('ADMIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'ADMIN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Active Presence Filter Banner */}
      {(filterStatus === 'ONLINE' || filterStatus === 'OFFLINE') && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs animate-fadeIn ${
            filterStatus === 'ONLINE'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/40'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {filterStatus === 'ONLINE' ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            )}
            <span className="font-bold">
              {filterStatus === 'ONLINE'
                ? (isHi ? `🟢 वर्तमान में ${filteredUsers.length} यूज़र ऑनलाइन हैं:` : `🟢 Currently ${filteredUsers.length} user(s) online:`)
                : (isHi ? `⚫ वर्तमान में ${filteredUsers.length} यूज़र ऑफ़लाइन हैं:` : `⚫ Currently ${filteredUsers.length} user(s) offline:`)}
            </span>
            <span className="text-[11px] opacity-80 hidden sm:inline">
              {filterStatus === 'ONLINE'
                ? (isHi ? '(रीयल-टाइम सक्रिय सेशन)' : '(real-time active sessions)')
                : (isHi ? '(लॉगआउट या 2 मिनट से अधिक निष्क्रिय)' : '(logged out or inactive > 2m)')}
            </span>
          </div>
          <button
            onClick={() => setFilterStatus('ALL')}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/70 text-white border border-white/10 cursor-pointer transition-colors"
          >
            {isHi ? 'सभी देखें ✕' : 'Clear Filter ✕'}
          </button>
        </div>
      )}

      {/* Users List - Responsive Views */}
      {/* Mobile & Tablet Card Layout (Visible on small & medium screens) */}
      <div className="block lg:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            {isHi ? 'कोई यूज़र नहीं मिला।' : 'No users found matching query.'}
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isAdmin = u.role === 'ADMIN';
            const isBlocked = u.status === 'BLOCKED';
            const uPhone10 = (u.phone || "").replace(/[^0-9]/g, "").slice(-10);
            const uPhoneClean = (u.phone || "").replace(/[^0-9]/g, "");
            const userWallet = getWalletForUser(u.id, wallets, users);

            const todayStr = new Date().toISOString().split('T')[0];
            const isNew =
              u.joinedDate === todayStr ||
              (u.id.startsWith('usr-') && Date.now() - Number(u.id.replace('usr-', '')) < 24 * 60 * 60 * 1000);

            return (
              <div
                key={u.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3.5 shadow-lg transition-all"
              >
                {/* User Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                        isAdmin
                          ? 'bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-amber-300 border border-amber-500/40'
                          : 'bg-gradient-to-br from-cyan-500/30 to-blue-700/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {isAdmin ? '👑' : (u.name || u.loginId || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-sm">{u.name || u.loginId || 'Investor'}</span>
                        {isNew && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 uppercase tracking-wider animate-pulse">
                            {isHi ? '✨ नया' : '✨ NEW'}
                          </span>
                        )}
                        {u.referralCode && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {u.referralCode}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-cyan-300 font-semibold">{u.loginId}</span>
                        <span>•</span>
                        <span>{u.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role, Presence & Status Badge */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {u.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{isHi ? 'ऑनलाइन' : 'Online'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-slate-800 text-slate-400 border-slate-700/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        <span>{isHi ? 'ऑफ़लाइन' : 'Offline'}</span>
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          isAdmin
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {isAdmin ? 'ADMIN' : 'INVESTOR'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          isBlocked
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                        {isBlocked ? (isHi ? 'निलंबित' : 'Blocked') : (isHi ? 'सक्रिय' : 'Active')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Login & Logout Timestamps Bar */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <LogIn className="w-3 h-3 text-cyan-400 shrink-0" />
                      {isHi ? 'अंतिम लॉगिन:' : 'Last Login:'}
                    </span>
                    <span className="font-semibold text-slate-200 block font-mono text-[10px]">
                      {formatDateTime(u.lastLoginAt)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <LogOut className="w-3 h-3 text-amber-400 shrink-0" />
                      {isHi ? 'लॉगआउट समय:' : 'Logout Time:'}
                    </span>
                    <span className="font-semibold block font-mono text-[10px]">
                      {u.isOnline ? (
                        <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {isHi ? 'सक्रिय (Online)' : 'Active now'}
                        </span>
                      ) : (
                        <span className="text-slate-400">{formatDateTime(u.lastLogoutAt)}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Live Balances Grid on Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'नकद शेष (Cash)' : 'Cash Balance'}</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      ₹{userWallet.cashBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'GP पॉइंट्स' : 'GP Points'}</span>
                    <span className="text-xs font-bold text-cyan-300 font-mono">
                      {userWallet.gpBalance.toLocaleString('en-IN')} GP
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/20">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'कुल कमाई' : 'Total Earned'}</span>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      ₹{userWallet.totalEarned.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/20">
                    <span className="text-[10px] text-slate-400 block">{isHi ? 'रॉयल्टी' : 'Royalty'}</span>
                    <span className="text-xs font-bold text-purple-300 font-mono">
                      ₹{userWallet.royaltyEarned.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Card Action Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (onEditUserWallet ? onEditUserWallet(u) : onEditUser(u))}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <WalletIcon className="w-3.5 h-3.5" />
                      <span>{isHi ? '💰 वॉलेट एडिट' : '💰 Edit Wallet'}</span>
                    </button>
                    <button
                      onClick={() => onEditUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isHi ? '✏️ प्रोफ़ाइल' : 'Profile'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onViewAgreement && (
                      <button
                        onClick={() => onViewAgreement(u)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 cursor-pointer"
                        title={isHi ? 'अनुबंध पत्र देखें' : 'View Agreement'}
                      >
                        <FileCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleUserStatus(u.id, u.status)}
                      disabled={u.loginId === 'admin'}
                      className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-30 ${
                        isBlocked
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                      title={isBlocked ? 'Unblock' : 'Block'}
                    >
                      {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(u.id)}
                      disabled={u.loginId === 'admin'}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer disabled:opacity-30"
                      title={isHi ? 'यूज़र हटाएं' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (Visible on Large Screens) */}
      <div className="hidden lg:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">{isHi ? 'यूज़र / नाम' : 'User / Name'}</th>
                <th className="py-3.5 px-4">{isHi ? 'लॉगिन आईडी व फ़ोन' : 'Login ID & Phone'}</th>
                <th className="py-3.5 px-4">{isHi ? 'वॉलेट शेष (Live Balances)' : 'Wallet Balances'}</th>
                <th className="py-3.5 px-4">{isHi ? 'उपस्थिति व स्थिति' : 'Presence & Status'}</th>
                <th className="py-3.5 px-4">{isHi ? 'लॉगिन / लॉगआउट समय' : 'Login & Logout Times'}</th>
                <th className="py-3.5 px-4 text-right">{isHi ? 'कार्रवाई (Actions)' : 'Actions'}</th>
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
                  const uPhone10 = (u.phone || "").replace(/[^0-9]/g, "").slice(-10);
                  const uPhoneClean = (u.phone || "").replace(/[^0-9]/g, "");
                  const userWallet = getWalletForUser(u.id, wallets, users);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {isAdmin ? '👑' : (u.name || u.loginId || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
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
                        <div className="text-[10px] text-slate-500 mt-0.5">Joined: {u.joinedDate}</div>
                      </td>

                      {/* Wallet Balances Column */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                              💵 ₹{userWallet.cashBalance.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                              🪙 {userWallet.gpBalance.toLocaleString('en-IN')} GP
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>Earned: <strong className="text-amber-300 font-mono">₹{userWallet.totalEarned.toLocaleString('en-IN')}</strong></span>
                            {userWallet.royaltyEarned > 0 && (
                              <span>Royalty: <strong className="text-purple-300 font-mono">₹{userWallet.royaltyEarned.toLocaleString('en-IN')}</strong></span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status & Online Presence */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          {/* Live Online Badge */}
                          <div>
                            {u.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                                <span>{isHi ? 'ऑनलाइन' : 'Online'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-slate-800 text-slate-400 border-slate-700/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                <span>{isHi ? 'ऑफ़लाइन' : 'Offline'}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                isAdmin
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              }`}
                            >
                              {isAdmin ? 'ADMIN' : 'INVESTOR'}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                isBlocked
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              <span className={`w-1 h-1 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                              {isBlocked ? (isHi ? 'निलंबित' : 'Blocked') : (isHi ? 'सक्रिय' : 'Active')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Login & Logout Times */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <LogIn className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-slate-400 text-[10px]">{isHi ? 'लॉगिन:' : 'Login:'}</span>
                            <span className="font-semibold text-slate-200 text-[11px]">{formatDateTime(u.lastLoginAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <LogOut className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-slate-400 text-[10px]">{isHi ? 'लॉगआउट:' : 'Logout:'}</span>
                            {u.isOnline ? (
                              <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {isHi ? 'सक्रिय (Online Now)' : 'Active now'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">{formatDateTime(u.lastLogoutAt)}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Quick Wallet Edit Button */}
                          <button
                            onClick={() => (onEditUserWallet ? onEditUserWallet(u) : onEditUser(u))}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                            title={isHi ? 'वॉलेट राशि बदलें / जोड़ें / घटाएं' : 'Edit or adjust user wallet balances'}
                          >
                            <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isHi ? '💰 वॉलेट एडिट' : '💰 Wallet'}</span>
                          </button>

                          {/* Edit User Profile & Password Button */}
                          <button
                            onClick={() => onEditUser(u)}
                            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            title={isHi ? 'पूरी प्रोफ़ाइल, पासवर्ड व बैंक विवरण संपादित करें' : 'Edit profile, password, bank, etc.'}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{isHi ? '✏️ प्रोफ़ाइल' : 'Edit'}</span>
                          </button>

                          {/* View & Print Legal Agreement */}
                          <button
                            onClick={() => onViewAgreement && onViewAgreement(u)}
                            className="p-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                            title={isHi ? 'कानूनी अनुबंध पत्र देखें / प्रिंट करें' : 'View & Print Legal Agreement PDF'}
                          >
                            <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Toggle Block / Unblock */}
                          <button
                            onClick={() => onToggleUserStatus(u.id, u.status)}
                            disabled={u.loginId === 'admin'}
                            className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              isBlocked
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}
                            title={isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteConfirmId(u.id)}
                            disabled={u.loginId === 'admin'}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
