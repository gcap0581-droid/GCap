import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  AlertTriangle,
  Receipt,
  FileCheck
} from 'lucide-react';
import { apiFetch } from '../../utils/apiConfig';
import { formatINR } from '../../utils/storage';

interface LedgerEntry {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
  addedBy: string;
  createdAt: string;
}

interface AdminLedgerTabProps {
  language: 'en' | 'hi';
}

export const AdminLedgerTab: React.FC<AdminLedgerTabProps> = ({ language }) => {
  const isHi = language === 'hi';
  
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Client Deposit');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Categories preset lists
  const incomePresets = [
    isHi ? 'क्लाइंट डिपॉजिट' : 'Client Deposit',
    isHi ? 'ब्याज आय' : 'Interest Income',
    isHi ? 'प्रशासनिक शुल्क' : 'Admin Commission',
    isHi ? 'निवेश पूँजी' : 'Investment Capital',
    isHi ? 'अन्य आय' : 'Other Income'
  ];

  const expensePresets = [
    isHi ? 'प्लान रिटर्न भुगतान' : 'Plan Return Payout',
    isHi ? 'कार्यालय किराया' : 'Office Rent',
    isHi ? 'वेतन व पारिश्रमिक' : 'Staff Salaries',
    isHi ? 'सर्वर और होस्टिंग' : 'Server & Web Hosting',
    isHi ? 'मार्केटिंग और विज्ञापन' : 'Marketing & Ads',
    isHi ? 'सरकारी कर व टीडीएस' : 'Taxes & TDS Paid',
    isHi ? 'अन्य व्यय' : 'Other Expense'
  ];

  // Set default category when type changes
  useEffect(() => {
    if (type === 'INCOME') {
      setCategory(incomePresets[0]);
    } else {
      setCategory(expensePresets[0]);
    }
  }, [type]);

  const fetchLedgerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admin/ledger');
      if (!res.ok) {
        throw new Error(isHi ? 'खाता डेटा लोड करने में असमर्थ' : 'Failed to fetch ledger data');
      }
      const data = await res.json();
      if (data.success) {
        setLedger(data.ledger || []);
        setTotalIncome(data.totalIncome || 0);
        setTotalExpense(data.totalExpense || 0);
        setBalance(data.balance || 0);
      } else {
        throw new Error(data.error || 'Server returned unsuccessful');
      }
    } catch (err: any) {
      console.error('[AdminLedgerTab] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();

    // Subscribe to updates if any
    const handleSync = () => {
      fetchLedgerData();
    };
    window.addEventListener('app_users_updated', handleSync);
    return () => {
      window.removeEventListener('app_users_updated', handleSync);
    };
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert(isHi ? 'कृपया एक वैध सकारात्मक राशि दर्ज करें' : 'Please enter a valid positive amount');
      return;
    }

    const finalCategory = category === 'CUSTOM' ? customCategory.trim() : category;
    if (!finalCategory) {
      alert(isHi ? 'कृपया श्रेणी (Category) निर्दिष्ट करें' : 'Please specify a category');
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await apiFetch('/api/admin/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category: finalCategory,
          description,
          date,
          addedBy: 'Admin'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || (isHi ? 'प्रविष्टि जोड़ने में विफल' : 'Failed to add ledger entry'));
      }

      setAmount('');
      setDescription('');
      setCustomCategory('');
      setSuccessMsg(isHi ? 'खाता प्रविष्टि सफलतापूर्वक जोड़ी गई!' : 'Ledger entry added successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Refresh
      await fetchLedgerData();
    } catch (err: any) {
      alert(err.message || 'Error saving entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm(isHi ? 'क्या आप सचमुच इस प्रविष्टि को हटाना चाहते हैं?' : 'Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/ledger/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchLedgerData();
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting entry');
    }
  };

  // Unique categories list for filtering
  const allCategories = Array.from(new Set(ledger.map(item => item.category)));

  // Filter entries
  const filteredLedger = ledger.filter(item => {
    const matchesSearch = searchQuery 
      ? item.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.amount).includes(searchQuery)
      : true;

    const matchesType = typeFilter === 'ALL' ? true : item.type === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' ? true : item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleExportCSV = () => {
    if (filteredLedger.length === 0) {
      alert(isHi ? 'निर्यात करने के लिए कोई डेटा उपलब्ध नहीं है' : 'No data available to export');
      return;
    }
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Type,Category,Description,Amount (INR),Added By,Created At\n';

    filteredLedger.forEach(item => {
      const row = [
        item.date,
        item.type,
        `"${item.category.replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        item.amount,
        item.addedBy,
        item.createdAt
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gcap_company_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Sync Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
              {isHi ? 'कंपनी आय-व्यय बहीखाता' : 'Company Income & Expense Ledger'}
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono font-black px-2 py-0.5 rounded border border-amber-500/30">
                OFFICIAL LEDGER
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {isHi ? 'कंपनी के संपूर्ण वित्तीय लेनदेन, राजस्व आय और परिचालन व्यय का आधिकारिक रिकॉर्ड रखें।' : 'Official track of company incoming revenues and operational spendings.'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchLedgerData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg border border-slate-700/80 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 3v5h-5" /></svg>
          )}
          {isHi ? 'डेटा रीफ्रेश करें' : 'Refresh Ledger'}
        </button>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-emerald-500/30 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-emerald-400/80 font-mono tracking-widest">{isHi ? 'कुल प्राप्तियाँ / आय' : 'Total Revenue (Income)'}</span>
            <h3 className="text-2xl font-black text-emerald-300 tracking-tight mt-1">
              {formatINR(totalIncome)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">{isHi ? 'क्लाइंट जमा और अन्य राजस्व' : 'Client deposits & other inflows'}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-rose-500/30 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black text-rose-400/80 font-mono tracking-widest">{isHi ? 'कुल व्यय / ख़र्चा' : 'Total Expenditures'}</span>
            <h3 className="text-2xl font-black text-rose-300 tracking-tight mt-1">
              {formatINR(totalExpense)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">{isHi ? 'प्लान रिटर्न और परिचालन खर्च' : 'ROI payouts & company operations'}</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-8 h-8" />
          </div>
        </div>

        {/* Remaining Net Balance */}
        <div className={`bg-slate-900/80 rounded-2xl p-5 border shadow-lg flex items-center justify-between ${balance >= 0 ? 'border-amber-500/30' : 'border-rose-500/50'}`}>
          <div>
            <span className="text-[10px] uppercase font-black text-amber-400/80 font-mono tracking-widest">{isHi ? 'निवल खाता शेष' : 'Net Account Balance'}</span>
            <h3 className={`text-2xl font-black tracking-tight mt-1 ${balance >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
              {formatINR(balance)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">{isHi ? 'शेष शुद्ध राशि' : 'Net retained liquid buffer'}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
            <Receipt className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Form and History Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Add Entry Form (5/12 width) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                {isHi ? 'नया हिसाब-किताब दर्ज करें' : 'Record New Entry'}
              </h3>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
                <FileCheck className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleAddEntry} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  {isHi ? 'लेनदेन प्रकार' : 'Transaction Type'}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={`py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all ${
                      type === 'INCOME'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isHi ? 'आय / पैसा आया' : 'INCOME (In)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={`py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all ${
                      type === 'EXPENSE'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isHi ? 'व्यय / खर्चा हुआ' : 'EXPENSE (Out)'}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  {isHi ? 'लेनदेन राशि (INR)' : 'Amount (INR)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  {isHi ? 'लेनदेन तिथि' : 'Transaction Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  {isHi ? 'लेनदेन श्रेणी' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {type === 'INCOME' 
                    ? incomePresets.map((p, idx) => (
                        <option key={idx} value={p}>{p}</option>
                      ))
                    : expensePresets.map((p, idx) => (
                        <option key={idx} value={p}>{p}</option>
                      ))
                  }
                  <option value="CUSTOM">{isHi ? '✎ कस्टम श्रेणी जोड़ें...' : '✎ Enter Custom...'}</option>
                </select>
              </div>

              {/* Custom Category Input */}
              {category === 'CUSTOM' && (
                <div className="animate-fadeIn">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    {isHi ? 'कस्टम श्रेणी का नाम' : 'Custom Category Name'}
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder={isHi ? 'उदा. सर्वर मेंटेनेंस' : 'e.g. Server Maintenance'}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  {isHi ? 'विवरण / रिमार्क' : 'Description / Remarks'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={isHi ? 'लेनदेन की अतिरिक्त जानकारी यहाँ लिखें...' : 'Enter details of the transaction...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-750 text-slate-950 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isHi ? 'खाते में जोड़ें' : 'Save Entry'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: History Table & Search (8/12 width) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            
            {/* Table Action Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                {isHi ? 'वित्तीय हिसाब-किताब इतिहास' : 'Financial Ledger Statement'}
                <span className="text-xs text-slate-500 font-mono">({filteredLedger.length})</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/85 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isHi ? 'CSV एक्सपोर्ट' : 'Export CSV'}
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search Query */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={isHi ? 'विवरण या श्रेणी खोजें...' : 'Search category/remarks...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">{isHi ? 'सभी लेनदेन प्रकार' : 'All Types'}</option>
                  <option value="INCOME">{isHi ? 'केवल आय (Inflows)' : 'Only Income'}</option>
                  <option value="EXPENSE">{isHi ? 'केवल ख़र्चा (Outflows)' : 'Only Expenses'}</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">{isHi ? 'सभी श्रेणियां' : 'All Categories'}</option>
                  {allCategories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table View */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-bold">{isHi ? 'खाता विवरण लोड हो रहा है...' : 'Loading ledger entries...'}</p>
              </div>
            ) : filteredLedger.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-slate-300 font-bold text-sm">
                  {isHi ? 'कोई प्रविष्टि नहीं मिली' : 'No entries found'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isHi ? 'सर्च क्वेरी बदलें या कोई नया हिसाब-किताब जोड़ें।' : 'Try tweaking your filters or record a new financial entry.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-black text-slate-400 font-mono">
                      <th className="p-3">{isHi ? 'तिथि' : 'Date'}</th>
                      <th className="p-3">{isHi ? 'प्रकार' : 'Type'}</th>
                      <th className="p-3">{isHi ? 'श्रेणी' : 'Category'}</th>
                      <th className="p-3">{isHi ? 'विवरण' : 'Description'}</th>
                      <th className="p-3 text-right">{isHi ? 'राशि (INR)' : 'Amount (INR)'}</th>
                      <th className="p-3 text-center">{isHi ? 'क्रिया' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLedger.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-850/30 transition-colors text-xs">
                        {/* Date */}
                        <td className="p-3 text-slate-300 whitespace-nowrap font-mono">
                          {item.date}
                        </td>
                        
                        {/* Type Badge */}
                        <td className="p-3 whitespace-nowrap">
                          {item.type === 'INCOME' ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded">
                              {isHi ? 'आय' : 'INCOME'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase rounded">
                              {isHi ? 'ख़र्च' : 'EXPENSE'}
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-3 text-amber-200 font-semibold whitespace-nowrap">
                          {item.category}
                        </td>

                        {/* Description */}
                        <td className="p-3 text-slate-400 max-w-xs truncate" title={item.description}>
                          {item.description || <span className="italic text-slate-600 font-medium">No remarks</span>}
                        </td>

                        {/* Amount */}
                        <td className={`p-3 text-right font-mono font-bold whitespace-nowrap ${item.type === 'INCOME' ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {item.type === 'INCOME' ? '+' : '-'}{formatINR(item.amount)}
                        </td>

                        {/* Action Delete */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteEntry(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded hover:bg-rose-500/10 cursor-pointer"
                            title={isHi ? 'प्रविष्टि हटाएं' : 'Delete Entry'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom calculation note */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2.5">
              <span className="p-1 bg-amber-500/10 text-amber-400 rounded-lg font-bold">INFO</span>
              <p>
                {isHi 
                  ? 'यह खाता बही कंपनी के बाहरी खातों को प्रभावित किए बिना संपूर्ण राजस्व और व्यय विश्लेषण का रिकॉर्ड रखने के काम आता है। सभी प्रविष्टियाँ रीयल-टाइम में सिंक होती हैं।'
                  : 'This ledger acts as the definitive analytical log for managing physical revenue inflows and company operational costs. It is independent of raw treasury liquid pools.'}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
