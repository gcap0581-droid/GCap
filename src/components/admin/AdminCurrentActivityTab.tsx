import React, { useState, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  Database,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Layers,
  Award,
  DollarSign,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  PieChart,
  RefreshCw,
  Wallet as WalletIcon
} from 'lucide-react';
import { ActiveInvestment, CompanyTreasury, Language, Transaction, UserProfile, Wallet } from '../../types';
import { formatINR } from '../../utils/storage';

interface AdminCurrentActivityTabProps {
  language: Language;
  users: UserProfile[];
  investments: ActiveInvestment[];
  transactions: Transaction[];
  treasury?: CompanyTreasury | null;
  wallets?: Record<string, Wallet>;
}

type SectionView = 'ALL' | 'DEPOSITED' | 'WITHDRAWN' | 'BALANCES' | 'DETAILED_TXNS' | 'USER_BREAKDOWN' | 'PLAN_BREAKDOWN';
type DateFilterType = 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';

export const AdminCurrentActivityTab: React.FC<AdminCurrentActivityTabProps> = ({
  language,
  users = [],
  investments = [],
  transactions = [],
  treasury,
  wallets = {},
}) => {
  const isHi = language === 'hi';

  // State: Dropdown section selector & Date filter
  const [selectedSection, setSelectedSection] = useState<SectionView>('ALL');
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterType>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Helper to parse dates cleanly
  const getDateRange = (mode: DateFilterType, customStart?: string, customEnd?: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (mode === 'TODAY') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
      return { start, end, label: isHi ? `आज (${todayStr})` : `Today (${todayStr})` };
    }

    if (mode === 'YESTERDAY') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      const start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0).getTime();
      const end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999).getTime();
      return { start, end, label: isHi ? `कल (${yStr})` : `Yesterday (${yStr})` };
    }

    if (mode === 'THIS_WEEK') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(now.setDate(diff));
      const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0).getTime();
      const end = Date.now();
      return { start, end, label: isHi ? 'इस सप्ताह' : 'This Week' };
    }

    if (mode === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
      const end = Date.now();
      return { start, end, label: isHi ? 'इस महीने' : 'This Month' };
    }

    if (mode === 'CUSTOM' && (customStart || customEnd)) {
      const start = customStart ? new Date(`${customStart}T00:00:00`).getTime() : 0;
      const end = customEnd ? new Date(`${customEnd}T23:59:59`).getTime() : Date.now();
      return {
        start,
        end,
        label: `${customStart || 'Begin'} to ${customEnd || 'Now'}`,
      };
    }

    return { start: 0, end: Infinity, label: isHi ? 'सभी समय (All Time)' : 'All Time' };
  };

  const activeRange = useMemo(
    () => getDateRange(dateFilterMode, customStartDate, customEndDate),
    [dateFilterMode, customStartDate, customEndDate, isHi]
  );

  // Filter transactions based on date filter
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tTime = t.timestamp || (t.date ? new Date(t.date).getTime() : 0);
      const inRange = tTime >= activeRange.start && tTime <= activeRange.end;
      if (!inRange) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
        (t.userName && t.userName.toLowerCase().includes(q)) ||
        (t.userPhone && t.userPhone.includes(q)) ||
        (t.type && t.type.toLowerCase().includes(q)) ||
        (t.id && t.id.toLowerCase().includes(q))
      );
    });
  }, [transactions, activeRange, searchQuery]);

  // Filter investments based on date filter (by startDate / timestamp)
  const filteredInvestments = useMemo(() => {
    return investments.filter((i) => {
      const iTime = i.timestamp || (i.startDate ? new Date(i.startDate).getTime() : 0);
      if (activeRange.start > 0 && activeRange.end < Infinity) {
        return iTime >= activeRange.start && iTime <= activeRange.end;
      }
      return true;
    });
  }, [investments, activeRange]);

  // Metric Computations based on filtered/total data
  const totalUsersCount = users.length;
  const totalActivePlans = filteredInvestments.filter((i) => i.status === 'ACTIVE').length;
  const totalCompletedPlans = filteredInvestments.filter((i) => i.status === 'COMPLETED' || i.isMatured).length;

  // Deposited & Inflows
  const depositTxns = filteredTransactions.filter(
    (t) => t.type === 'DEPOSIT' || (t.type as string) === 'ADMIN_ADD' || t.type === 'SWAP_GP'
  );
  const totalCashDeposited = depositTxns
    .filter((t) => (t.type === 'DEPOSIT' || (t.type as string) === 'ADMIN_ADD') && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPendingDeposits = depositTxns
    .filter((t) => t.type === 'DEPOSIT' && t.status === 'PENDING')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalGpSwapped = depositTxns
    .filter((t) => t.type === 'SWAP_GP' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.gpEarned || t.amount || 0), 0);

  const totalInvestedPrincipal = filteredInvestments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalEarnedSoFar = filteredInvestments.reduce(
    (sum, i) => sum + (i.earnedSoFar || i.totalEarnedSoFar || 0),
    0
  );
  const totalRoiGenerated = totalEarnedSoFar;

  // Withdrawn & Outflows
  const withdrawalTxns = filteredTransactions.filter(
    (t) => t.type === 'WITHDRAWAL' || (t.type as string) === 'WITHDRAW' || t.type === 'TRANSFER' || (t.type as string) === 'ADMIN_DEDUCT'
  );
  const totalCashWithdrawn = withdrawalTxns
    .filter((t) => (t.type === 'WITHDRAWAL' || (t.type as string) === 'WITHDRAW') && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPendingWithdrawals = withdrawalTxns
    .filter((t) => (t.type === 'WITHDRAWAL' || (t.type as string) === 'WITHDRAW') && t.status === 'PENDING')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalTransferredGp = withdrawalTxns
    .filter((t) => t.type === 'TRANSFER' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalFeesCollected = withdrawalTxns
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.adminFeeAmount || 0), 0);

  // Balances across system (Current Live State)
  const treasuryBalance = treasury?.balance || 0;
  const totalWalletCashBalance = Object.values(wallets).reduce((sum, w: any) => sum + (w?.cashBalance || 0), 0);
  const totalWalletGpBalance = Object.values(wallets).reduce((sum, w: any) => sum + (w?.gpBalance || 0), 0);
  const totalWalletEarningsBalance = Object.values(wallets).reduce((sum, w: any) => sum + (w?.totalEarnings || w?.totalEarned || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* SECTION HEADER & CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                {isHi
                  ? 'कंपनी करंट एक्टिविटी एवं संपूर्ण लेजर समरी (Admin Master Ledger)'
                  : 'Company Current Activity & Master Ledger Summary'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {isHi
                ? 'ड्रॉपडाउन मेनू से इच्छित बिंदु चुनें और दिनांक अनुसार संपूर्ण जमा, निकासी व बैलेंस रिपोर्ट देखें।'
                : 'Select any specific point from the dropdown menu and inspect real-time deposits, withdrawals & balances date-wise.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 font-mono font-bold border border-slate-700">
              🔒 {isHi ? 'एडमिन अधिकृत' : 'Admin Authorized'}
            </span>
          </div>
        </div>

        {/* PRIMARY CONTROLS: 1. DROPDOWN POINT SELECTOR & 2. DATE FILTER BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-slate-800/80">
          {/* 1. DROPDOWN MENU (POINT / SECTION SELECTOR) */}
          <div className="lg:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHi ? '📌 देखने हेतु मुख्य बिंदु चुनें (Select Detail Point):' : '📌 Select Detail Point to View:'}</span>
            </label>
            <div className="relative">
              <select
                id="select-admin-activity-section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as SectionView)}
                className="w-full appearance-none px-4 py-2.5 bg-slate-950 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all cursor-pointer pr-10 shadow-lg shadow-cyan-950/20"
              >
                <option value="ALL">
                  {isHi ? '🌐 सभी विवरण एक साथ देखें (Master Overview & All Points)' : '🌐 Master Overview & All Points (Show All)'}
                </option>
                <option value="DEPOSITED">
                  {isHi ? '📥 1. कुल जमा राशि समरी (Total Deposited Inflow - Cash, GP, Plans, Users)' : '📥 1. Total Deposited Inflow (Cash, GP, Plans, Users)'}
                </option>
                <option value="WITHDRAWN">
                  {isHi ? '📤 2. कुल निकासी राशि समरी (Total Withdrawn Outflow - Cash, P2P, Fees, Completed)' : '📤 2. Total Withdrawn Outflow (Cash, P2P, Fees, Completed)'}
                </option>
                <option value="BALANCES">
                  {isHi ? '💰 3. कुल शेष बैलेंस लेजर (Total Current Balance Ledger - Treasury, User Wallets)' : '💰 3. Total Current Balance Ledger (Treasury & User Wallets)'}
                </option>
                <option value="DETAILED_TXNS">
                  {isHi ? '📋 4. विस्तृत ट्रांजैक्शन एवं गतिविधि लेजर (Detailed Activity Audit Ledger)' : '📋 4. Detailed Activity Audit Ledger'}
                </option>
                <option value="USER_BREAKDOWN">
                  {isHi ? '👥 5. यूज़रवार बैलेंस एवं पोर्टफोलियो ब्रेकडाउन (User-wise Wallets & Activity)' : '👥 5. User-wise Wallets & Activity Breakdown'}
                </option>
                <option value="PLAN_BREAKDOWN">
                  {isHi ? '📊 6. प्लानवार निवेश एवं रिटर्न समरी (Plan-wise Principal & Return Breakdown)' : '📊 6. Plan-wise Principal & Return Breakdown'}
                </option>
              </select>
              <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. DATE FILTER PRESETS */}
          <div className="lg:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? '📅 दिनांक अनुसार फ़िल्टर (Date-wise Inspection):' : '📅 Date-wise Inspection Filter:'}</span>
              <span className="text-[10px] text-amber-400 font-mono ml-auto">
                [{activeRange.label}]
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', labelHi: 'सभी समय', labelEn: 'All Time' },
                { id: 'TODAY', labelHi: 'आज', labelEn: 'Today' },
                { id: 'YESTERDAY', labelHi: 'कल', labelEn: 'Yesterday' },
                { id: 'THIS_WEEK', labelHi: 'इस सप्ताह', labelEn: 'This Week' },
                { id: 'THIS_MONTH', labelHi: 'इस माह', labelEn: 'This Month' },
                { id: 'CUSTOM', labelHi: 'कस्टम रेंज', labelEn: 'Custom' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  id={`btn-date-filter-${btn.id.toLowerCase()}`}
                  onClick={() => setDateFilterMode(btn.id as DateFilterType)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dateFilterMode === btn.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isHi ? btn.labelHi : btn.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CUSTOM DATE PICKER ROW (Visible only when CUSTOM selected) */}
        {dateFilterMode === 'CUSTOM' && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-wrap items-center gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{isHi ? 'प्रारंभिक दिनांक:' : 'Start Date:'}</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{isHi ? 'अंतिम दिनांक:' : 'End Date:'}</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            {(customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer"
              >
                {isHi ? 'रीसेट करें' : 'Clear'}
              </button>
            )}
          </div>
        )}

        {/* SEARCH BAR (For filtered transaction or user lookup) */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isHi
                ? 'नाम, फ़ोन नंबर, रेफ़रेंस ID या प्रकार से तुरंत खोजें...'
                : 'Search transactions by Name, Phone, Reference ID, or Type...'
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* RENDER SELECTED SECTION OR ALL ACCORDING TO USER DROPDOWN SELECTION */}

      {/* ======================================================== */}
      {/* SECTION 1: TOTAL DEPOSITED SUMMARY (कुल जमा राशि) */}
      {/* ======================================================== */}
      {(selectedSection === 'ALL' || selectedSection === 'DEPOSITED') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '1. कुल जमा राशि समरी (Total Deposited Inflow)' : '1. Total Deposited Inflow Summary'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">[{activeRange.label}]</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {formatINR(totalCashDeposited + totalInvestedPrincipal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'कुल कैश डिपॉजिट (Cash Deposits):' : 'Total Cash Deposits:'}
              </span>
              <span className="text-lg font-black font-mono text-white">{formatINR(totalCashDeposited)}</span>
              {totalPendingDeposits > 0 && (
                <span className="text-[10px] text-amber-400 block mt-1">
                  ⏳ {formatINR(totalPendingDeposits)} {isHi ? 'पेंडिंग' : 'Pending'}
                </span>
              )}
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'कुल स्वैप GP (Swapped GP):' : 'Total Swapped GP:'}
              </span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {totalGpSwapped.toLocaleString()} GP
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                ≈ {formatINR(totalGpSwapped)}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'सक्रिय प्लान मूलधन (Active Principal):' : 'Active Plan Principal Invested:'}
              </span>
              <span className="text-lg font-black font-mono text-cyan-400">
                {formatINR(totalInvestedPrincipal)}
              </span>
              <span className="text-[10px] text-cyan-400 block mt-1">
                {totalActivePlans} {isHi ? 'सक्रिय प्लान्स' : 'Active Plans'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'कुल पंजीकृत यूज़र्स (Total Users):' : 'Total Registered Users:'}
              </span>
              <span className="text-lg font-black font-mono text-amber-400">
                {totalUsersCount} {isHi ? 'यूज़र्स' : 'Users'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {users.filter((u) => u.status === 'ACTIVE').length} {isHi ? 'सक्रिय' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: TOTAL WITHDRAWN SUMMARY (कुल निकासी राशि) */}
      {/* ======================================================== */}
      {(selectedSection === 'ALL' || selectedSection === 'WITHDRAWN') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '2. कुल निकासी राशि समरी (Total Withdrawn Outflow)' : '2. Total Withdrawn Outflow Summary'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">[{activeRange.label}]</span>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {formatINR(totalCashWithdrawn)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'कुल कैश निकासी (Cash Withdrawn):' : 'Total Cash Withdrawn:'}
              </span>
              <span className="text-lg font-black font-mono text-rose-400">{formatINR(totalCashWithdrawn)}</span>
              {totalPendingWithdrawals > 0 && (
                <span className="text-[10px] text-amber-400 block mt-1">
                  ⏳ {formatINR(totalPendingWithdrawals)} {isHi ? 'पेंडिंग अप्रूवल' : 'Pending Approval'}
                </span>
              )}
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'कुल P2P ट्रांसफर GP (P2P Transferred GP):' : 'Total P2P GP Transferred:'}
              </span>
              <span className="text-lg font-black font-mono text-amber-400">
                {totalTransferredGp.toLocaleString()} GP
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                ≈ {formatINR(totalTransferredGp)}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'कुल एडमिन फीस / टीडीएस (Admin Fees):' : 'Total Admin Fees Collected:'}
              </span>
              <span className="text-lg font-black font-mono text-emerald-400">{formatINR(totalFeesCollected)}</span>
              <span className="text-[10px] text-emerald-400 block mt-1">
                {isHi ? 'कंपनी रेवेन्यू' : 'Platform Revenue'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'परिपूर्ण / बंद प्लान (Completed Plans):' : 'Completed / Matured Plans:'}
              </span>
              <span className="text-lg font-black font-mono text-cyan-400">
                {totalCompletedPlans} {isHi ? 'प्लान' : 'Plans'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {isHi ? 'परिपक्वता पूर्ण' : 'Fully Matured'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: TOTAL BALANCE SUMMARY (कुल शेष बैलेंस) */}
      {/* ======================================================== */}
      {(selectedSection === 'ALL' || selectedSection === 'BALANCES') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '3. कुल शेष बैलेंस समरी (Total Current Balance Ledger)' : '3. Total Current Balance Ledger Summary'}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {formatINR(treasuryBalance + totalWalletCashBalance)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'कंपनी ट्रेजरी रिजर्व (Treasury Reserve):' : 'Company Treasury Reserve:'}
              </span>
              <span className="text-lg font-black font-mono text-emerald-400">{formatINR(treasuryBalance)}</span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {isHi ? 'मुख्य सुरक्षित रिजर्व' : 'Master Reserve Pool'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'यूज़र्स का कुल कैश वॉलेट (User Wallets Cash):' : 'Total User Cash Wallets:'}
              </span>
              <span className="text-lg font-black font-mono text-white">{formatINR(totalWalletCashBalance)}</span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {Object.keys(wallets).length} {isHi ? 'वॉलेट्स में' : 'User Wallets'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'यूज़र्स का कुल GP वॉलेट (User Wallets GP):' : 'Total User GP Wallets:'}
              </span>
              <span className="text-lg font-black font-mono text-amber-400">
                {totalWalletGpBalance.toLocaleString()} GP
              </span>
              <span className="text-[10px] text-amber-400/80 block mt-1">
                ≈ {formatINR(totalWalletGpBalance)}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">
                {isHi ? 'कुल जनरेटेड अर्निंग (Total Earnings Generated):' : 'Total Earnings Generated:'}
              </span>
              <span className="text-lg font-black font-mono text-cyan-400">{formatINR(totalRoiGenerated)}</span>
              <span className="text-[10px] text-cyan-400/80 block mt-1">
                {isHi ? 'ROI + रॉयल्टी रिटर्न' : 'ROI + Royalty Pay'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: DETAILED INSPECTION LEDGER TABLE */}
      {/* ======================================================== */}
      {(selectedSection === 'ALL' || selectedSection === 'DETAILED_TXNS') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi
                  ? '4. विस्तृत गतिविधि एवं ट्रांजैक्शन लेजर (Detailed Activity Audit Ledger)'
                  : '4. Detailed Activity Audit Ledger'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {filteredTransactions.length} / {transactions.length} {isHi ? 'रिकॉर्ड्स' : 'Records'}
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-800 text-amber-300 font-mono font-bold">
                {activeRange.label}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                  <th className="p-3">Ref / ID</th>
                  <th className="p-3">{isHi ? 'यूज़र / खाता' : 'User / Account'}</th>
                  <th className="p-3">{isHi ? 'प्रकार' : 'Type'}</th>
                  <th className="p-3">{isHi ? 'स्थिति' : 'Status'}</th>
                  <th className="p-3">{isHi ? 'राशि' : 'Amount'}</th>
                  <th className="p-3">{isHi ? 'विवरण' : 'Description'}</th>
                  <th className="p-3">{isHi ? 'दिनांक' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                      {isHi ? 'चयनित दिनांक / फ़िल्टर में कोई लेन-देन रिकॉर्ड नहीं मिला।' : 'No transactions found for the selected filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.slice(0, 100).map((t, idx) => (
                    <tr key={`${t.id || 'txn'}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-emerald-400">{t.referenceId || t.id.slice(-8)}</td>
                      <td className="p-3 text-white font-sans">
                        <div className="font-bold">{t.userName || t.actor || 'User'}</div>
                        {t.userPhone && <div className="text-[10px] text-slate-500">{t.userPhone}</div>}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            t.type === 'DEPOSIT' || (t.type as string) === 'ADMIN_ADD'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : t.type === 'WITHDRAWAL' || (t.type as string) === 'WITHDRAW'
                              ? 'bg-rose-500/10 text-rose-400'
                              : t.type === 'SWAP_GP'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-cyan-500/10 text-cyan-400'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            t.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : t.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">{formatINR(t.amount || 0)}</td>
                      <td className="p-3 font-sans text-slate-400 max-w-xs truncate">
                        {isHi ? t.noteHi || t.note : t.note}
                      </td>
                      <td className="p-3 text-[11px] text-slate-500">
                        {new Date(t.date || t.timestamp || Date.now()).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: USER-WISE BREAKDOWN */}
      {/* ======================================================== */}
      {(selectedSection === 'ALL' || selectedSection === 'USER_BREAKDOWN') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi
                  ? '5. यूज़रवार बैलेंस एवं गतिविधि ब्रेकडाउन (User-wise Wallets & Activity Breakdown)'
                  : '5. User-wise Wallets & Activity Breakdown'}
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400">
              {users.length} {isHi ? 'पंजीकृत यूज़र्स' : 'Registered Users'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                  <th className="p-3">{isHi ? 'यूज़र नाम / फ़ोन' : 'User Name / Phone'}</th>
                  <th className="p-3">{isHi ? 'रोल / स्थिति' : 'Role / Status'}</th>
                  <th className="p-3">{isHi ? 'कैश बैलेंस' : 'Cash Balance'}</th>
                  <th className="p-3">{isHi ? 'GP बैलेंस' : 'GP Balance'}</th>
                  <th className="p-3">{isHi ? 'सक्रिय निवेश' : 'Invested'}</th>
                  <th className="p-3">{isHi ? 'कुल कमाई' : 'Total Earned'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {users.map((u, idx) => {
                  const w = wallets[u.id] || wallets[u.phone] || wallets[u.loginId || ''] || {};
                  const userInvs = investments.filter(
                    (i) => i.userId === u.id || (u.phone && i.userId === u.phone)
                  );
                  const userInvested = userInvs.reduce((sum, i) => sum + i.investedAmount, 0);

                  return (
                    <tr key={`${u.id || 'usr'}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-white font-sans">
                        <div className="font-bold">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.phone} ({u.loginId})</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {u.status} ({u.role})
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">{formatINR((w as any)?.cashBalance || 0)}</td>
                      <td className="p-3 font-bold text-amber-400">{((w as any)?.gpBalance || 0).toLocaleString()} GP</td>
                      <td className="p-3 font-bold text-cyan-400">{formatINR(userInvested || (w as any)?.totalInvested || 0)}</td>
                      <td className="p-3 font-bold text-emerald-400">{formatINR((w as any)?.totalEarnings || (w as any)?.totalEarned || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 6: PLAN-WISE BREAKDOWN */}
      {/* ======================================================== */}
      {(selectedSection === 'ALL' || selectedSection === 'PLAN_BREAKDOWN') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi
                  ? '6. प्लानवार निवेश एवं रिटर्न समरी (Plan-wise Principal & Return Breakdown)'
                  : '6. Plan-wise Principal & Return Breakdown'}
              </h3>
            </div>
            <span className="text-xs font-mono text-purple-400">
              {filteredInvestments.length} {isHi ? 'प्लान्स फ़िल्टर' : 'Plans Filtered'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                  <th className="p-3">{isHi ? 'प्लान कोड / नाम' : 'Plan Code / Name'}</th>
                  <th className="p-3">{isHi ? 'यूज़र' : 'User'}</th>
                  <th className="p-3">{isHi ? 'मूलधन राशि' : 'Principal'}</th>
                  <th className="p-3">{isHi ? 'दैनिक रिटर्न' : 'Daily Return'}</th>
                  <th className="p-3">{isHi ? 'अर्जित रिटर्न' : 'Earned So Far'}</th>
                  <th className="p-3">{isHi ? 'अवधि / स्थिति' : 'Duration / Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                      {isHi ? 'कोई प्लान्स नहीं मिले।' : 'No plans found.'}
                    </td>
                  </tr>
                ) : (
                  filteredInvestments.map((inv, idx) => (
                    <tr key={`${inv.id || 'inv'}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-sans font-bold text-white">
                        <div>{inv.planName}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{inv.planUniqueCode || inv.planId}</div>
                      </td>
                      <td className="p-3 text-slate-300 font-sans">{inv.userName || inv.userId}</td>
                      <td className="p-3 font-bold text-cyan-400">{formatINR(inv.investedAmount)}</td>
                      <td className="p-3 text-emerald-400 font-bold">
                        +{formatINR(inv.dailyReturnAmount || (inv.investedAmount * 0.164) / 100)} /day
                      </td>
                      <td className="p-3 text-emerald-400 font-black">
                        +{formatINR(inv.earnedSoFar || inv.totalEarnedSoFar || 0)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            inv.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-cyan-500/10 text-cyan-400'
                          }`}
                        >
                          {inv.status} ({inv.durationDays}d)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
