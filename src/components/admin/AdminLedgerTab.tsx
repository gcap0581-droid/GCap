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
  FileCheck,
  Edit3,
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  Save,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { apiFetch } from '../../utils/apiConfig';
import { formatINR } from '../../utils/storage';
import {
  getCachedFirestoreState,
  fetchFullFirestoreState,
  saveCompanyLedgerToFirestore,
  subscribeToFirestoreState,
} from '../../lib/firestoreBridge';

export interface LedgerEntry {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
  addedBy: string;
  createdAt: string;
  updatedAt?: string;
}

interface AdminLedgerTabProps {
  language: 'en' | 'hi';
}

export const OFFICIAL_ALL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: "led-1790689769786-920",
    type: "EXPENSE",
    amount: 2041,
    category: "प्लान रिटर्न भुगतान",
    description: "Payment to Amit kumar Arya",
    date: "2026-09-28",
    addedBy: "Admin",
    createdAt: "2026-09-29T13:49:29.786Z"
  },
  {
    id: "led-1790688865436-13",
    type: "EXPENSE",
    amount: 5000,
    category: "अन्य व्यय",
    description: "Startup India Registration",
    date: "2026-09-29",
    addedBy: "Admin",
    createdAt: "2026-09-29T13:34:25.436Z"
  },
  {
    id: "led-1790688785634-811",
    type: "EXPENSE",
    amount: 200,
    category: "अन्य व्यय",
    description: "Rubber stamp",
    date: "2026-09-29",
    addedBy: "Admin",
    createdAt: "2026-09-29T13:33:05.634Z"
  },
  {
    id: "led-1790688743297-183",
    type: "EXPENSE",
    amount: 350,
    category: "प्रशासनिक शुल्क",
    description: "Stamp paper aggreement",
    date: "2026-09-28",
    addedBy: "Admin",
    createdAt: "2026-09-29T13:32:23.297Z"
  },
  {
    id: "led-1790268660436-292",
    type: "EXPENSE",
    amount: 750,
    category: "अन्य व्यय",
    description: "Welfare",
    date: "2026-09-23",
    addedBy: "Admin",
    createdAt: "2026-09-24T16:51:00.436Z"
  },
  {
    id: "led-1790268637141-220",
    type: "EXPENSE",
    amount: 22500,
    category: "सरकारी कर व टीडीएस",
    description: "Ragistration",
    date: "2026-09-23",
    addedBy: "Admin",
    createdAt: "2026-09-24T16:50:37.141Z"
  },
  {
    id: "led-1790268592567-687",
    type: "INCOME",
    amount: 100000,
    category: "क्लाइंट डिपॉजिट",
    description: "Amit Kumar Arya  Bhabhua",
    date: "2026-09-23",
    addedBy: "Admin",
    createdAt: "2026-09-24T16:49:52.567Z"
  }
];

export function sanitizeLedgerEntries(entries: LedgerEntry[]): LedgerEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries.map((e) => {
    if (!e) return e;
    if (e.id === "led-1790688785634-811" || (e.description && String(e.description).toLowerCase().includes("rubber stamp"))) {
      return { ...e, type: "EXPENSE", category: "अन्य व्यय" };
    }
    if (e.id === "led-1790688743297-183" || (e.description && String(e.description).toLowerCase().includes("stamp paper"))) {
      return { ...e, type: "EXPENSE", category: "प्रशासनिक शुल्क" };
    }
    return e;
  });
}

export const AdminLedgerTab: React.FC<AdminLedgerTabProps> = ({ language }) => {
  const isHi = language === 'hi';
  
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSynced, setCloudSynced] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State for Adding New Entry
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Client Deposit');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Modal State
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [editAmount, setEditAmount] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editCustomCategory, setEditCustomCategory] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editAddedBy, setEditAddedBy] = useState<string>('Admin');
  const [isEditingSubmitting, setIsEditingSubmitting] = useState<boolean>(false);

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
  }, [type, isHi]);

  // Helper to merge lists ensuring no lost entries and respecting latest user updates
  const mergeEntries = (lists: (LedgerEntry[] | undefined)[]): LedgerEntry[] => {
    const map = new Map<string, LedgerEntry>();
    
    // Seed default baseline entries first
    OFFICIAL_ALL_LEDGER_ENTRIES.forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });

    // Merge each list in priority order (later lists override earlier defaults)
    lists.forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(item => {
          if (item && item.id) {
            map.set(item.id, { ...item });
          }
        });
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return dateB - dateA;
    });

    return sanitizeLedgerEntries(merged);
  };

  const applyLedgerState = (entries: LedgerEntry[]) => {
    let valid = Array.isArray(entries) ? entries : [];
    if (valid.length === 0) {
      valid = OFFICIAL_ALL_LEDGER_ENTRIES;
    }
    
    valid = sanitizeLedgerEntries(valid);

    // Use valid entries directly so user edits and deletions are fully respected
    const map = new Map<string, LedgerEntry>();
    valid.forEach(e => {
      if (e?.id) map.set(e.id, { ...e });
    });

    const finalEntries = Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return dateB - dateA;
    });

    let inc = 0;
    let exp = 0;
    finalEntries.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'INCOME') inc += amt;
      else if (item.type === 'EXPENSE') exp += amt;
    });

    setLedger(finalEntries);
    setTotalIncome(inc);
    setTotalExpense(exp);
    setBalance(inc - exp);
  };

  const fetchLedgerData = async () => {
    setIsLoading(true);
    setError(null);

    let gathered: LedgerEntry[] = OFFICIAL_ALL_LEDGER_ENTRIES;

    // 1. Check local/memory cache first
    const cached = getCachedFirestoreState();
    if (cached && Array.isArray(cached.companyLedger) && cached.companyLedger.length > 0) {
      gathered = mergeEntries([gathered, cached.companyLedger]);
      applyLedgerState(gathered);
    }

    // 2. Fetch from Server API
    try {
      const res = await apiFetch('/api/admin/ledger');
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.success && Array.isArray(data.ledger)) {
          gathered = mergeEntries([gathered, data.ledger]);
        }
      }
    } catch (_) {}

    // 3. Fetch from Firestore Cloud Database
    try {
      const fsState = await fetchFullFirestoreState();
      if (fsState && Array.isArray(fsState.companyLedger) && fsState.companyLedger.length > 0) {
        gathered = mergeEntries([gathered, fsState.companyLedger]);
      }
    } catch (err: any) {
      console.warn('[AdminLedgerTab] Error loading Firestore ledger:', err);
    }

    // Apply combined state and persist to Firestore
    applyLedgerState(gathered);
    saveCompanyLedgerToFirestore(gathered).catch(() => {});
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLedgerData();

    // 1. Subscribe to real-time Firebase Firestore changes (Instant multi-device cloud sync)
    const unsub = subscribeToFirestoreState((fsState) => {
      if (fsState && Array.isArray(fsState.companyLedger) && fsState.companyLedger.length > 0) {
        applyLedgerState(fsState.companyLedger);
      }
    });

    // 2. Server-Sent Events (SSE) listener for realtime server broadcasts
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && (data.type === 'LEDGER_UPDATED' || data.type === 'STATE_CHANGED' || data.type === 'FULL_SYNC')) {
            fetchLedgerData();
          }
        } catch (_) {}
      };
    } catch (_) {}

    // 3. Tab visibility / Window focus instant sync
    const handleFocus = () => {
      fetchLedgerData();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchLedgerData();
      }
    });

    // 4. Periodic lightweight background sync (every 10s)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        apiFetch('/api/admin/ledger')
          .then(res => res.json())
          .then(data => {
            if (data && data.success && Array.isArray(data.ledger)) {
              applyLedgerState(data.ledger);
            }
          })
          .catch(() => {});
      }
    }, 10000);

    return () => {
      unsub();
      if (eventSource) eventSource.close();
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Force Cloud Sync Handler
  const handleForceCloudSync = async () => {
    setIsCloudSyncing(true);
    setCloudSynced(false);
    try {
      const merged = mergeEntries([OFFICIAL_ALL_LEDGER_ENTRIES, ledger]);
      applyLedgerState(merged);
      
      // Save directly to Firebase Firestore
      await saveCompanyLedgerToFirestore(merged);
      
      // Sync to Server API
      await apiFetch('/api/admin/ledger/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ledger: merged })
      }).catch(() => {});

      setCloudSynced(true);
      setSuccessMsg(isHi ? 'पूरा हिसाब-किताब Firebase Cloud पर सफलतापूर्वक सिंक हो गया!' : 'Entire ledger successfully synced to Firebase Cloud!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error syncing to cloud');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Add New Entry
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

    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      amount: Number(amount),
      category: finalCategory,
      description: description.trim(),
      date,
      addedBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    const updatedLedger = [newEntry, ...ledger];
    applyLedgerState(updatedLedger);

    try {
      // 1. Save directly to Firebase Firestore for 100% persistent cloud storage
      await saveCompanyLedgerToFirestore(updatedLedger);

      // 2. Background sync to server API
      apiFetch('/api/admin/ledger', {
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
      }).catch(() => {});

      setAmount('');
      setDescription('');
      setCustomCategory('');
      setSuccessMsg(isHi ? 'खाता प्रविष्टि सफलतापूर्वक जोड़ी गई और Firebase पर सुरक्षित हुई!' : 'Ledger entry added successfully and saved to Firebase!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (entry: LedgerEntry) => {
    setEditingEntry(entry);
    setEditType(entry.type);
    setEditAmount(String(entry.amount));
    setEditDate(entry.date || new Date().toISOString().split('T')[0]);
    setEditDescription(entry.description || '');
    setEditAddedBy(entry.addedBy || 'Admin');

    const allPresets = [...incomePresets, ...expensePresets];
    if (allPresets.includes(entry.category)) {
      setEditCategory(entry.category);
      setEditCustomCategory('');
    } else {
      setEditCategory('CUSTOM');
      setEditCustomCategory(entry.category);
    }
  };

  // Save Edited Entry
  const handleSaveEditEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    if (!editAmount || isNaN(Number(editAmount)) || Number(editAmount) <= 0) {
      alert(isHi ? 'कृपया एक वैध सकारात्मक राशि दर्ज करें' : 'Please enter a valid positive amount');
      return;
    }

    const finalCategory = editCategory === 'CUSTOM' ? editCustomCategory.trim() : editCategory;
    if (!finalCategory) {
      alert(isHi ? 'कृपया श्रेणी (Category) निर्दिष्ट करें' : 'Please specify a category');
      return;
    }

    setIsEditingSubmitting(true);

    const updatedEntry: LedgerEntry = {
      ...editingEntry,
      type: editType,
      amount: Number(editAmount),
      category: finalCategory,
      description: editDescription.trim(),
      date: editDate,
      addedBy: editAddedBy || 'Admin',
      updatedAt: new Date().toISOString()
    };

    const updatedLedger = ledger.map(item => item.id === editingEntry.id ? updatedEntry : item);
    applyLedgerState(updatedLedger);

    try {
      // 1. Direct Firebase Firestore update
      await saveCompanyLedgerToFirestore(updatedLedger);

      // 2. Update via Server API
      await apiFetch(`/api/admin/ledger/${editingEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editType,
          amount: Number(editAmount),
          category: finalCategory,
          description: editDescription.trim(),
          date: editDate,
          addedBy: editAddedBy || 'Admin'
        })
      }).catch(() => {});

      // 3. Fallback sync
      apiFetch('/api/admin/ledger/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ledger: updatedLedger })
      }).catch(() => {});

      setEditingEntry(null);
      setSuccessMsg(isHi ? 'प्रविष्टि सफलतापूर्वक अपडेट की गई और Firebase पर सिंक हो गई!' : 'Entry updated successfully and synced to Firebase!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating entry');
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (id: string) => {
    if (!confirm(isHi ? 'क्या आप सचमुच इस प्रविष्टि को हटाना चाहते हैं?' : 'Are you sure you want to delete this entry?')) {
      return;
    }

    const updatedLedger = ledger.filter(item => item.id !== id);
    applyLedgerState(updatedLedger);

    try {
      // Direct Firebase write
      await saveCompanyLedgerToFirestore(updatedLedger);

      // API delete
      apiFetch(`/api/admin/ledger/${id}`, {
        method: 'DELETE'
      }).catch(() => {});
      
      setSuccessMsg(isHi ? 'प्रविष्टि हटा दी गई।' : 'Entry removed.');
      setTimeout(() => setSuccessMsg(null), 3000);
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
        String(item.amount).includes(searchQuery) ||
        item.date.includes(searchQuery)
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
      {/* Header and Cloud Sync Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-amber-500/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold tracking-tight text-white font-sans">
                {isHi ? 'कंपनी आय-व्यय बहीखाता (Company Bahi-Khata)' : 'Company Income & Expense Ledger'}
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-black px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                FIREBASE CLOUD SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isHi 
                ? 'कंपनी के संपूर्ण वित्तीय लेनदेन, राजस्व आय और परिचालन व्यय का आधिकारिक रिकॉर्ड — कहीं से भी प्रबंधित करें।' 
                : 'Official cloud-synced analytical record of revenues, startup costs & operational spendings.'}
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleForceCloudSync}
            disabled={isCloudSyncing}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title={isHi ? 'डेटा को Firebase Cloud पर सिंक करें' : 'Sync all data to Firebase Cloud'}
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Cloud className="w-4 h-4 text-emerald-200" />
            )}
            <span>{isHi ? 'Firebase सिंक' : 'Firebase Cloud Sync'}</span>
          </button>

          <button
            onClick={fetchLedgerData}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl border border-slate-700/80 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-amber-400" />
            )}
            <span>{isHi ? 'डेटा रीफ्रेश' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Global Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

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
            <p className="text-[10px] text-slate-400 mt-1">{isHi ? 'पंजीकरण, शुल्क और परिचालन खर्च' : 'Registrations & company operations'}</p>
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
            <p className="text-[10px] text-slate-400 mt-1">{isHi ? 'शुद्ध सुरक्षित शेष' : 'Net retained operational buffer'}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
            <Receipt className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Form and History Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Add Entry Form (4/12 width) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                {isHi ? 'नया हिसाब-किताब दर्ज करें' : 'Record New Entry'}
              </h3>
            </div>

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
                    className={`py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                      type === 'INCOME'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isHi ? 'आय (पैसा आया)' : 'INCOME (In)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={`py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                      type === 'EXPENSE'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isHi ? 'व्यय (खर्चा हुआ)' : 'EXPENSE (Out)'}
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
                  <option value="CUSTOM">{isHi ? '✎ कस्टम श्रेणी जोड़ें...' : '✎ Enter Custom Category...'}</option>
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
                    placeholder={isHi ? 'उदा. स्टेशनरी या रबर स्टाम्प' : 'e.g. Stationery, Legal Stamp'}
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
                  placeholder={isHi ? 'लेनदेन का विवरण यहाँ लिखें (जैसे: Startup India Registration, Rubber Stamp, Stamp Paper)...' : 'Enter transaction details (e.g. Registration, Stamp paper)...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-750 text-slate-950 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isHi ? 'खाते में जोड़ें (Save Entry)' : 'Save Entry'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: History Table & Search (8/12 width) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            
            {/* Table Action Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  {isHi ? 'वित्तीय हिसाब-किताब इतिहास' : 'Financial Ledger Statement'}
                  <span className="text-xs text-amber-400 font-mono bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {filteredLedger.length} {isHi ? 'प्रविष्टियाँ' : 'entries'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isHi ? 'किसी भी प्रविष्टि को संपादित (Edit) या डिलीट (Delete) करने के लिए नीचे क्रिया कॉलम का उपयोग करें।' : 'Click Edit or Delete on any entry to modify or remove records.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/85 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
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
                  placeholder={isHi ? 'विवरण, श्रेणी, तिथि खोजें...' : 'Search category, remarks, date...'}
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
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs text-slate-400 font-bold">{isHi ? 'खाता विवरण Firebase से लोड हो रहा है...' : 'Loading ledger entries from Firebase...'}</p>
              </div>
            ) : filteredLedger.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
                <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-slate-300 font-bold text-sm">
                  {isHi ? 'कोई प्रविष्टि नहीं मिली' : 'No entries found'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isHi ? 'सर्च फ़िल्टर रीसेट करें या "सभी डेटा पुनर्प्राप्त करें" पर क्लिक करें।' : 'Reset filters or retrieve previous entries.'}
                </p>
                <button
                  onClick={fetchLedgerData}
                  className="px-4 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isHi ? 'डेटा पुनर्प्राप्त करें' : 'Restore All Entries'}
                </button>
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
                      <th className="p-3 text-center">{isHi ? 'क्रियाएं' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLedger.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-850/40 transition-colors text-xs">
                        {/* Date */}
                        <td className="p-3 text-slate-300 whitespace-nowrap font-mono font-medium">
                          {item.date}
                        </td>
                        
                        {/* Type Badge */}
                        <td className="p-3 whitespace-nowrap">
                          {item.type === 'INCOME' ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase rounded flex items-center gap-1 w-fit">
                              <TrendingUp className="w-3 h-3" />
                              {isHi ? 'आय' : 'INCOME'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase rounded flex items-center gap-1 w-fit">
                              <TrendingDown className="w-3 h-3" />
                              {isHi ? 'ख़र्च' : 'EXPENSE'}
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-3 text-amber-200 font-semibold whitespace-nowrap">
                          {item.category}
                        </td>

                        {/* Description */}
                        <td className="p-3 text-slate-200 text-xs break-words leading-relaxed max-w-sm">
                          {item.description ? (
                            <span className="font-medium text-slate-200">{item.description}</span>
                          ) : (
                            <span className="italic text-slate-600 font-medium">{isHi ? 'कोई विवरण नहीं' : 'No remarks'}</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className={`p-3 text-right font-mono font-bold whitespace-nowrap ${item.type === 'INCOME' ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {item.type === 'INCOME' ? '+' : '-'}{formatINR(item.amount)}
                        </td>

                        {/* Action Buttons: Edit & Delete */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title={isHi ? 'इस प्रविष्टि को संपादित करें' : 'Edit this entry'}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isHi ? 'एडिट' : 'Edit'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteEntry(item.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded hover:bg-rose-500/10 cursor-pointer active:scale-95"
                              title={isHi ? 'प्रविष्टि हटाएं' : 'Delete Entry'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
                  ? 'यह बहीखाता सीधे Firebase Firestore क्लाउड पर रियल-टाइम में सुरक्षित होता है। आप किसी भी डिवाइस, ऐप या ब्राउज़र से कहीं से भी प्रविष्टियों को जोड़, संपादित और प्रबंधित कर सकते हैं।'
                  : 'This ledger is continuously persisted in Firebase Firestore Cloud in real time. You can view, add, and edit financial records from any platform or device.'}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* EDIT ENTRY MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isHi ? 'बहीखाता प्रविष्टि संपादित करें' : 'Edit Ledger Entry'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {editingEntry.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditEntry} className="p-5 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  {isHi ? 'लेनदेन प्रकार' : 'Transaction Type'}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditType('INCOME')}
                    className={`py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                      editType === 'INCOME'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isHi ? 'आय (पैसा आया)' : 'INCOME (In)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('EXPENSE')}
                    className={`py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                      editType === 'EXPENSE'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isHi ? 'व्यय (खर्चा हुआ)' : 'EXPENSE (Out)'}
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
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
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
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
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
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {editType === 'INCOME' 
                    ? incomePresets.map((p, idx) => (
                        <option key={idx} value={p}>{p}</option>
                      ))
                    : expensePresets.map((p, idx) => (
                        <option key={idx} value={p}>{p}</option>
                      ))
                  }
                  <option value="CUSTOM">{isHi ? '✎ कस्टम श्रेणी जोड़ें...' : '✎ Custom Category...'}</option>
                </select>
              </div>

              {/* Custom Category Input */}
              {editCategory === 'CUSTOM' && (
                <div className="animate-fadeIn">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    {isHi ? 'कस्टम श्रेणी का नाम' : 'Custom Category Name'}
                  </label>
                  <input
                    type="text"
                    value={editCustomCategory}
                    onChange={(e) => setEditCustomCategory(e.target.value)}
                    placeholder={isHi ? 'उदा. स्टेशनरी, स्टाम्प' : 'e.g. Legal, Maintenance'}
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isEditingSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-750 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isEditingSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isHi ? 'बदलाव सहेजें (Save Changes)' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
