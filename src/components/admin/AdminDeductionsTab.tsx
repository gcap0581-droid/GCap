import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Percent,
  ShieldAlert,
  ArrowDownRight,
  RefreshCw,
  Building2,
  Tag,
  FileText,
  Sparkles,
  X,
  User,
  Phone,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Language, Transaction, TreasuryLog } from '../../types';
import { formatINR } from '../../utils/storage';

export type DeductionCategory = 'ALL' | 'ADMIN_FEE' | 'TDS_TAX' | 'GP_TRANSFER_FEE' | 'WITHDRAWAL_CHARGE' | 'OTHER';
export type DatePreset = 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_30_DAYS' | 'CUSTOM';
export type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC';

export interface FlattenedDeductionItem {
  id: string;
  txnId: string;
  date: string;
  timestamp: number;
  userName: string;
  userLoginId: string;
  userPhone: string;
  category: DeductionCategory;
  categoryLabelEn: string;
  categoryLabelHi: string;
  grossAmount: number;
  ratePercent?: number;
  deductedAmount: number;
  netAmount: number;
  referenceId: string;
  note: string;
  status: string;
}

interface AdminDeductionsTabProps {
  transactions: Transaction[];
  treasuryLogs?: TreasuryLog[];
  language: Language;
}

export const AdminDeductionsTab: React.FC<AdminDeductionsTabProps> = ({
  transactions,
  treasuryLogs = [],
  language,
}) => {
  const isHi = language === 'hi';

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<DeductionCategory>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('DATE_DESC');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Extract all individual deduction entries from transactions and logs
  const allDeductionItems = useMemo(() => {
    const items: FlattenedDeductionItem[] = [];

    transactions.forEach((t) => {
      const uName = t.userName || t.userId || 'User';
      const uLogin = t.userLoginId || '';
      const uPhone = t.userPhone || '';
      const refId = t.referenceId || t.id;

      // 1. Withdrawal Admin Fee
      if (t.type === 'WITHDRAWAL' && (t.adminFeeAmount && t.adminFeeAmount > 0)) {
        const gross = t.grossAmount || (t.amount + (t.adminFeeAmount || 0) + (t.tdsAmount || 0));
        items.push({
          id: `${t.id}-admin-fee`,
          txnId: t.id,
          date: t.date,
          timestamp: t.timestamp || new Date(t.date).getTime() || Date.now(),
          userName: uName,
          userLoginId: uLogin,
          userPhone: uPhone,
          category: 'ADMIN_FEE',
          categoryLabelEn: 'Admin Charge',
          categoryLabelHi: 'एडमिन शुल्क (Admin Fee)',
          grossAmount: gross,
          ratePercent: t.adminFeePercent || 0.02,
          deductedAmount: t.adminFeeAmount,
          netAmount: t.netAmount || t.amount,
          referenceId: refId,
          note: t.note || 'Withdrawal Admin Charge',
          status: t.status,
        });
      }

      // 2. Withdrawal TDS Tax
      if (t.type === 'WITHDRAWAL' && (t.tdsAmount && t.tdsAmount > 0)) {
        const gross = t.grossAmount || (t.amount + (t.adminFeeAmount || 0) + (t.tdsAmount || 0));
        items.push({
          id: `${t.id}-tds-tax`,
          txnId: t.id,
          date: t.date,
          timestamp: t.timestamp || new Date(t.date).getTime() || Date.now(),
          userName: uName,
          userLoginId: uLogin,
          userPhone: uPhone,
          category: 'TDS_TAX',
          categoryLabelEn: 'TDS Tax Deduction',
          categoryLabelHi: 'TDS टैक्स कटौती (Govt TDS)',
          grossAmount: gross,
          ratePercent: t.tdsPercent || 5.0,
          deductedAmount: t.tdsAmount,
          netAmount: t.netAmount || t.amount,
          referenceId: refId,
          note: t.note || 'Withdrawal Govt TDS Tax',
          status: t.status,
        });
      }

      // 3. P2P GP Transfer Fee
      if (t.type === 'TRANSFER' && (t.adminFeeAmount || t.note?.includes('Fee:'))) {
        let fee = t.adminFeeAmount || 0;
        if (!fee && t.note) {
          const match = t.note.match(/Fee:\s*([\d.]+)/i);
          if (match && match[1]) {
            fee = parseFloat(match[1]);
          }
        }
        if (fee > 0) {
          items.push({
            id: `${t.id}-gp-transfer-fee`,
            txnId: t.id,
            date: t.date,
            timestamp: t.timestamp || new Date(t.date).getTime() || Date.now(),
            userName: uName,
            userLoginId: uLogin,
            userPhone: uPhone,
            category: 'GP_TRANSFER_FEE',
            categoryLabelEn: 'GP Transfer Fee',
            categoryLabelHi: 'GP ट्रांसफर चार्ज (P2P Fee)',
            grossAmount: t.amount,
            ratePercent: t.adminFeePercent || 2.0,
            deductedAmount: fee,
            netAmount: t.amount - fee,
            referenceId: refId,
            note: t.note || 'P2P GP Transfer Fee',
            status: t.status,
          });
        }
      }

      // 4. Combined Withdrawal Charge if withdrawal has generic fee but no separate breakdown
      if (t.type === 'WITHDRAWAL' && !t.adminFeeAmount && !t.tdsAmount && t.grossAmount && t.grossAmount > t.amount) {
        const diff = t.grossAmount - t.amount;
        items.push({
          id: `${t.id}-withdrawal-charge`,
          txnId: t.id,
          date: t.date,
          timestamp: t.timestamp || new Date(t.date).getTime() || Date.now(),
          userName: uName,
          userLoginId: uLogin,
          userPhone: uPhone,
          category: 'WITHDRAWAL_CHARGE',
          categoryLabelEn: 'Withdrawal Processing Fee',
          categoryLabelHi: 'निकासी प्रक्रिया शुल्क',
          grossAmount: t.grossAmount,
          ratePercent: undefined,
          deductedAmount: diff,
          netAmount: t.amount,
          referenceId: refId,
          note: t.note || 'Withdrawal Processing Deduction',
          status: t.status,
        });
      }
    });

    // Treasury Logs manual deductions
    treasuryLogs.forEach((log, idx) => {
      if (log.type === 'ADMIN_DEDUCT' || log.type === 'USER_PAYOUT_DEDUCT') {
        items.push({
          id: `tlog-${log.id || 'log'}-${idx}`,
          txnId: log.id,
          date: log.date,
          timestamp: new Date(log.date).getTime() || Date.now(),
          userName: log.actor || 'System Admin',
          userLoginId: 'ADMIN',
          userPhone: '',
          category: 'OTHER',
          categoryLabelEn: 'Treasury Deduction',
          categoryLabelHi: 'ट्रेजरी / वॉलेट समायोजन',
          grossAmount: log.amount,
          ratePercent: undefined,
          deductedAmount: log.amount,
          netAmount: 0,
          referenceId: `TLOG-${log.id.slice(0, 8)}`,
          note: log.reasonHi || log.reason || 'System Reserve Deduction',
          status: 'SUCCESS',
        });
      }
    });

    return items;
  }, [transactions, treasuryLogs]);

  // Apply filtering and sorting
  const filteredItems = useMemo(() => {
    return allDeductionItems.filter((item) => {
      // 1. Category Filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'WITHDRAWAL_CHARGE') {
          if (item.category !== 'WITHDRAWAL_CHARGE' && item.category !== 'ADMIN_FEE' && item.category !== 'TDS_TAX') {
            return false;
          }
        } else if (item.category !== selectedCategory) {
          return false;
        }
      }

      // 2. Search Term Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = item.userName.toLowerCase().includes(q);
        const matchesLogin = item.userLoginId.toLowerCase().includes(q);
        const matchesPhone = item.userPhone.toLowerCase().includes(q);
        const matchesRef = item.referenceId.toLowerCase().includes(q);
        const matchesNote = item.note.toLowerCase().includes(q);
        if (!matchesName && !matchesLogin && !matchesPhone && !matchesRef && !matchesNote) {
          return false;
        }
      }

      // 3. Date Presets & Custom Date Filter
      const itemDate = new Date(item.timestamp);
      const now = new Date();

      if (datePreset === 'TODAY') {
        const todayStr = now.toISOString().split('T')[0];
        const itemStr = itemDate.toISOString().split('T')[0];
        if (todayStr !== itemStr) return false;
      } else if (datePreset === 'YESTERDAY') {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        const yestStr = yest.toISOString().split('T')[0];
        const itemStr = itemDate.toISOString().split('T')[0];
        if (yestStr !== itemStr) return false;
      } else if (datePreset === 'THIS_WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (itemDate < weekAgo) return false;
      } else if (datePreset === 'THIS_MONTH') {
        if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (datePreset === 'LAST_30_DAYS') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (itemDate < thirtyDaysAgo) return false;
      } else if (datePreset === 'CUSTOM') {
        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0, 0, 0, 0);
          if (itemDate < s) return false;
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          if (itemDate > e) return false;
        }
      }

      // 4. Amount Range Filter
      if (minAmount && !isNaN(Number(minAmount))) {
        if (item.deductedAmount < Number(minAmount)) return false;
      }
      if (maxAmount && !isNaN(Number(maxAmount))) {
        if (item.deductedAmount > Number(maxAmount)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'DATE_DESC') return b.timestamp - a.timestamp;
      if (sortBy === 'DATE_ASC') return a.timestamp - b.timestamp;
      if (sortBy === 'AMOUNT_DESC') return b.deductedAmount - a.deductedAmount;
      if (sortBy === 'AMOUNT_ASC') return a.deductedAmount - b.deductedAmount;
      return 0;
    });
  }, [allDeductionItems, selectedCategory, searchTerm, datePreset, startDate, endDate, minAmount, maxAmount, sortBy]);

  // Calculate totals for KPI summary boxes
  const totalAdminCharges = useMemo(() => {
    return allDeductionItems
      .filter((i) => i.category === 'ADMIN_FEE')
      .reduce((sum, i) => sum + i.deductedAmount, 0);
  }, [allDeductionItems]);

  const totalTdsTax = useMemo(() => {
    return allDeductionItems
      .filter((i) => i.category === 'TDS_TAX')
      .reduce((sum, i) => sum + i.deductedAmount, 0);
  }, [allDeductionItems]);

  const totalGpTransferFee = useMemo(() => {
    return allDeductionItems
      .filter((i) => i.category === 'GP_TRANSFER_FEE')
      .reduce((sum, i) => sum + i.deductedAmount, 0);
  }, [allDeductionItems]);

  const totalFilteredDeductions = useMemo(() => {
    return filteredItems.reduce((sum, i) => sum + i.deductedAmount, 0);
  }, [filteredItems]);

  const totalFilteredGross = useMemo(() => {
    return filteredItems.reduce((sum, i) => sum + i.grossAmount, 0);
  }, [filteredItems]);

  // Export Filtered Deductions to Excel
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

      // Summary sheet
      const summaryRows = [
        { Parameter: 'Report Name', Value: 'GCap System Deductions & Charges Audit Statement' },
        { Parameter: 'Generated Date', Value: new Date().toLocaleString('en-IN') },
        { Parameter: 'Category Filter', Value: selectedCategory },
        { Parameter: 'Date Preset Filter', Value: datePreset },
        { Parameter: 'Total Admin Charges Collected', Value: `₹${totalAdminCharges.toFixed(2)}` },
        { Parameter: 'Total TDS Tax Deducted', Value: `₹${totalTdsTax.toFixed(2)}` },
        { Parameter: 'Total GP Transfer Fees Collected', Value: `₹${totalGpTransferFee.toFixed(2)}` },
        { Parameter: 'Filtered Deductions Sum', Value: `₹${totalFilteredDeductions.toFixed(2)}` },
        { Parameter: 'Filtered Item Count', Value: filteredItems.length },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary['!cols'] = [{ wch: 36 }, { wch: 45 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Deductions Summary');

      // Detailed Items sheet
      const detailRows = filteredItems.map((item, index) => ({
        'S.No': index + 1,
        'Date & Time': new Date(item.timestamp).toLocaleString('en-IN'),
        'User Name': item.userName,
        'Login ID / Phone': item.userLoginId || item.userPhone || 'N/A',
        'Deduction Type': isHi ? item.categoryLabelHi : item.categoryLabelEn,
        'Gross Amount': item.grossAmount,
        'Deduction Rate (%)': item.ratePercent ? `${item.ratePercent}%` : 'N/A',
        'Deducted Amount': item.deductedAmount,
        'Net Payout / Remainder': item.netAmount,
        'Reference ID': item.referenceId,
        'Status': item.status,
        'Note / Description': item.note,
      }));

      const wsDetails = XLSX.utils.json_to_sheet(detailRows);
      wsDetails['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 22 },
        { wch: 18 },
        { wch: 25 },
        { wch: 16 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 12 },
        { wch: 40 },
      ];
      XLSX.utils.book_append_sheet(wb, wsDetails, 'Itemized Deductions');

      XLSX.writeFile(wb, `GCap_Deductions_Report_${timestamp}.xlsx`);
    } catch (err) {
      console.warn('Failed to export Excel:', err);
      alert(isHi ? 'एक्सेल फाइल डाउनलोड करने में त्रुटि हुई।' : 'Failed to generate Excel download.');
    }
  };

  // Launch browser print window with custom print styles
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Printable Report Styles Header (Hidden in UI, visible in browser Print) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #deductions-printable-area, #deductions-printable-area * {
            visibility: visible !important;
          }
          #deductions-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            border-bottom: 2px solid #000;
            margin-bottom: 20px;
            padding-bottom: 10px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .print-table th, .print-table td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            text-align: left;
          }
          .print-table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
        }
      `}</style>

      {/* Main Container Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>{isHi ? 'ग्लोबल कटौती एवं शुल्क ऑडिट (Deductions & Charges Audit)' : 'Global Deductions & Fee Audit'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHi
                  ? 'एडमिन चार्ज, GP ट्रांसफर शुल्क, TDS टैक्स कटौती और समस्त सिस्टम शुल्क की पृथक रिपोर्ट'
                  : 'Comprehensive itemized breakdown of Admin Charges, GP Transfer Fees, TDS Tax & System Deductions'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Export Excel & Print */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <button
            id="btn-export-deductions-excel"
            onClick={handleExportExcel}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isHi ? 'एक्सेल में डाउनलोड' : 'Export Excel (.xlsx)'}</span>
          </button>

          <button
            id="btn-print-deductions-report"
            onClick={handlePrintReport}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{isHi ? 'प्रिंट रिपोर्ट (Print)' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Filtered Deductions */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-rose-950/40 border border-rose-500/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-rose-300">{isHi ? 'कुल सम्पूर्ण कटौती' : 'Total Deductions Sum'}</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {formatINR(totalFilteredDeductions)}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
            <span>{isHi ? 'चयनित कुल रिकॉर्ड्स:' : 'Filtered Records:'}</span>
            <span className="font-bold text-rose-400">{filteredItems.length} Entries</span>
          </div>
        </div>

        {/* Total Admin Charges */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-amber-300">{isHi ? 'एडमिन चार्ज (Admin Charges)' : 'Admin Charges'}</span>
            <Tag className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 tracking-tight">
            {formatINR(totalAdminCharges)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
            {isHi ? 'निकासी पर एडमिन शुल्क' : 'Platform processing fees'}
          </p>
        </div>

        {/* Total TDS Tax Deductions */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-purple-300">{isHi ? 'TDS टैक्स कटौती (Govt TDS)' : 'TDS Tax Collected'}</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300 tracking-tight">
            {formatINR(totalTdsTax)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
            {isHi ? 'सरकारी TDS कटौती (5.0%)' : 'Government tax withholding'}
          </p>
        </div>

        {/* Total GP Transfer Fees */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-cyan-300">{isHi ? 'GP ट्रांसफर चार्ज (P2P Fee)' : 'GP Transfer Fees'}</span>
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 tracking-tight">
            {formatINR(totalGpTransferFee)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
            {isHi ? 'P2P ट्रांसफर शुल्क (2%)' : 'Peer-to-peer transfer fees'}
          </p>
        </div>
      </div>

      {/* Category Tabs Selection */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'ALL'
              ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-white'
          }`}
        >
          🌐 {isHi ? 'सभी कटौतियां (All Deductions)' : 'All Deductions'} ({allDeductionItems.length})
        </button>

        <button
          onClick={() => setSelectedCategory('ADMIN_FEE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'ADMIN_FEE'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-white'
          }`}
        >
          💼 {isHi ? 'एडमिन चार्ज (Admin Charges)' : 'Admin Charges'}
        </button>

        <button
          onClick={() => setSelectedCategory('TDS_TAX')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'TDS_TAX'
              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-white'
          }`}
        >
          🏛️ {isHi ? 'TDS टैक्स (Govt TDS)' : 'TDS Tax'}
        </button>

        <button
          onClick={() => setSelectedCategory('GP_TRANSFER_FEE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'GP_TRANSFER_FEE'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-white'
          }`}
        >
          ⚡ {isHi ? 'GP ट्रांसफर चार्ज (Transfer Fee)' : 'GP Transfer Fee'}
        </button>

        <button
          onClick={() => setSelectedCategory('WITHDRAWAL_CHARGE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'WITHDRAWAL_CHARGE'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-white'
          }`}
        >
          💳 {isHi ? 'समस्त निकासी शुल्क (Withdrawal Charges)' : 'Withdrawal Charges'}
        </button>
      </div>

      {/* Multi-Dimensional Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>{isHi ? 'फ़िल्टर एवं खोज मापदंड (Filter & Search Criteria)' : 'Filter & Search Criteria'}</span>
          </div>
          {(searchTerm || datePreset !== 'ALL' || startDate || endDate || minAmount || maxAmount) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDatePreset('ALL');
                setStartDate('');
                setEndDate('');
                setMinAmount('');
                setMaxAmount('');
                setSortBy('DATE_DESC');
              }}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isHi ? 'फ़िल्टर रिसेट करें' : 'Reset Filters'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isHi ? 'यूज़र / रेफरेंस खोजें:' : 'Search User / Ref:'}
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isHi ? 'नाम, फोन, ID या नोट...' : 'Name, Phone, ID or Note...'}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Date Preset Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isHi ? 'दिनांक फ़िल्टर (Date Filter):' : 'Date Preset:'}
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DatePreset)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{isHi ? 'सभी समय (All Time)' : 'All Time'}</option>
              <option value="TODAY">{isHi ? 'आज (Today)' : 'Today'}</option>
              <option value="YESTERDAY">{isHi ? 'कल (Yesterday)' : 'Yesterday'}</option>
              <option value="THIS_WEEK">{isHi ? 'इस सप्ताह (This Week)' : 'This Week'}</option>
              <option value="THIS_MONTH">{isHi ? 'इस महीने (This Month)' : 'This Month'}</option>
              <option value="LAST_30_DAYS">{isHi ? 'पिछले 30 दिन (Last 30 Days)' : 'Last 30 Days'}</option>
              <option value="CUSTOM">{isHi ? '📅 कस्टम तिथि सीमा (Custom Range)' : 'Custom Date Range'}</option>
            </select>
          </div>

          {/* Amount Range (Min & Max) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isHi ? 'कटौती राशि सीमा (Min - Max ₹):' : 'Amount Range (₹):'}
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Min"
                className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <span className="text-slate-600 font-bold">-</span>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Max"
                className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isHi ? 'क्रमबद्ध करें (Sort By):' : 'Sort Order:'}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="DATE_DESC">{isHi ? 'दिनांक (नवीनतम पहले)' : 'Date (Newest First)'}</option>
              <option value="DATE_ASC">{isHi ? 'दिनांक (पुराने पहले)' : 'Date (Oldest First)'}</option>
              <option value="AMOUNT_DESC">{isHi ? 'राशि (उच्चतम कटौती पहले)' : 'Amount (Highest First)'}</option>
              <option value="AMOUNT_ASC">{isHi ? 'राशि (न्यूनतम कटौती पहले)' : 'Amount (Lowest First)'}</option>
            </select>
          </div>
        </div>

        {/* Custom Date Pickers if CUSTOM Date Preset selected */}
        {datePreset === 'CUSTOM' && (
          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
            <div>
              <label className="block text-[10px] font-bold text-cyan-400 mb-1">
                {isHi ? 'आरंभ तिथि (Start Date):' : 'Start Date:'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-cyan-400 mb-1">
                {isHi ? 'अंतिम तिथि (End Date):' : 'End Date:'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Deduction Data Table (Printable Target Area) */}
      <div id="deductions-printable-area" className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Printable Only Header */}
        <div className="hidden print:block print-header text-center">
          <h1 className="text-xl font-black text-black uppercase">GCap Smart Investment Platform</h1>
          <h2 className="text-sm font-bold text-slate-700">Official Deductions & Charges Audit Statement</h2>
          <p className="text-xs text-slate-600 mt-1">
            Printed Date: {new Date().toLocaleString('en-IN')} | Total Records: {filteredItems.length} | Filter Category: {selectedCategory}
          </p>
          <div className="my-2 p-2 border border-slate-400 text-xs">
            <strong>Total Filtered Deductions Collected: ₹{totalFilteredDeductions.toFixed(2)}</strong>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-slate-300">
              {isHi ? 'कोई कटौती रिकॉर्ड नहीं मिला।' : 'No deduction records match your filter criteria.'}
            </p>
            <p className="text-xs text-slate-500">
              {isHi ? 'कृपया फ़िल्टर की तारीख या सर्च शब्द बदल कर प्रयास करें।' : 'Try resetting your date preset or search terms.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3">{isHi ? 'दिनांक व समय' : 'Date & Time'}</th>
                  <th className="py-3 px-3">{isHi ? 'यूज़र विवरण' : 'User Details'}</th>
                  <th className="py-3 px-3">{isHi ? 'कटौती प्रकार' : 'Deduction Type'}</th>
                  <th className="py-3 px-3 text-right">{isHi ? 'मूल राशि (Gross)' : 'Gross Amount'}</th>
                  <th className="py-3 px-3 text-center">{isHi ? 'दर (%)' : 'Rate'}</th>
                  <th className="py-3 px-3 text-right text-rose-400 font-black">{isHi ? 'कटौती (₹)' : 'Deducted (₹)'}</th>
                  <th className="py-3 px-3 text-right">{isHi ? 'शुद्ध राशि (Net)' : 'Net Amount'}</th>
                  <th className="py-3 px-3">{isHi ? 'रेफरेंस आईडी व नोट' : 'Ref ID & Note'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-3 text-center text-slate-500 font-mono font-bold text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <p className="text-xs font-bold text-white">
                        {new Date(item.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </td>

                    {/* User */}
                    <td className="py-3 px-3">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {item.userName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.userLoginId || item.userPhone || 'N/A'}
                      </p>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.category === 'ADMIN_FEE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Tag className="w-3 h-3" />
                          <span>{isHi ? 'एडमिन चार्ज' : 'Admin Charge'}</span>
                        </span>
                      )}
                      {item.category === 'TDS_TAX' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          <Building2 className="w-3 h-3" />
                          <span>{isHi ? 'TDS टैक्स' : 'Govt TDS'}</span>
                        </span>
                      )}
                      {item.category === 'GP_TRANSFER_FEE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{isHi ? 'GP ट्रांसफर शुल्क' : 'GP Transfer Fee'}</span>
                        </span>
                      )}
                      {item.category === 'WITHDRAWAL_CHARGE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <Receipt className="w-3 h-3" />
                          <span>{isHi ? 'निकासी शुल्क' : 'Withdrawal Fee'}</span>
                        </span>
                      )}
                      {item.category === 'OTHER' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          <ShieldAlert className="w-3 h-3" />
                          <span>{isHi ? 'ट्रेजरी कटौती' : 'Treasury Adj'}</span>
                        </span>
                      )}
                    </td>

                    {/* Gross */}
                    <td className="py-3 px-3 text-right font-mono text-slate-300 font-semibold">
                      {formatINR(item.grossAmount)}
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                      {item.ratePercent ? `${item.ratePercent}%` : '-'}
                    </td>

                    {/* Deducted Amount */}
                    <td className="py-3 px-3 text-right font-mono text-sm font-black text-rose-400">
                      -{formatINR(item.deductedAmount)}
                    </td>

                    {/* Net Amount */}
                    <td className="py-3 px-3 text-right font-mono text-xs text-emerald-400 font-bold">
                      {formatINR(item.netAmount)}
                    </td>

                    {/* Reference & Note */}
                    <td className="py-3 px-3 max-w-xs">
                      <p className="text-[11px] font-bold font-mono text-cyan-300 truncate">
                        {item.referenceId}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate" title={item.note}>
                        {item.note}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary Footer Row */}
              <tfoot>
                <tr className="bg-slate-950 border-t-2 border-slate-800 text-white font-bold">
                  <td colSpan={4} className="py-3.5 px-4 text-right uppercase text-xs tracking-wider">
                    {isHi ? 'कुल योग (Total Summary):' : 'Total Summary:'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-sm font-bold text-slate-300">
                    {formatINR(totalFilteredGross)}
                  </td>
                  <td className="py-3.5 px-3 text-center text-xs text-slate-500">-</td>
                  <td className="py-3.5 px-3 text-right font-mono text-base font-black text-rose-400">
                    -{formatINR(totalFilteredDeductions)}
                  </td>
                  <td colSpan={2} className="py-3.5 px-3 text-left text-xs text-slate-400">
                    {filteredItems.length} {isHi ? 'कटौती प्रविष्टियां' : 'Total Records'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Printable Signatory Block (Visible in print) */}
        <div className="hidden print:block pt-12 mt-8 border-t border-slate-300">
          <div className="flex justify-between items-end text-xs text-slate-800">
            <div>
              <p>Prepared By: ___________________</p>
              <p className="text-[10px] text-slate-500">Accounts & Compliance Executive</p>
            </div>
            <div className="text-right">
              <p>Authorized Signature: ___________________</p>
              <p className="font-bold text-black mt-1">GCap Platform System Admin Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
