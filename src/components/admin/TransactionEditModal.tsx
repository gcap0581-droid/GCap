import React, { useState, useEffect } from 'react';
import { X, Receipt, Check, AlertCircle } from 'lucide-react';
import { Language, Transaction, TransactionType } from '../../types';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null; // null if adding new transaction
  onSave: (txn: Transaction) => void;
  language: Language;
}

export const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSave,
  language,
}) => {
  const isHi = language === 'hi';
  const isEditing = !!transaction;

  const [id, setId] = useState('');
  const [type, setType] = useState<TransactionType>('DEPOSIT');
  const [amount, setAmount] = useState<number>(5000);
  const [status, setStatus] = useState<'SUCCESS' | 'PENDING' | 'FAILED' | 'REJECTED'>('SUCCESS');
  const [method, setMethod] = useState('UPI / Admin Credit');
  const [referenceId, setReferenceId] = useState('');
  const [note, setNote] = useState('');
  const [noteHi, setNoteHi] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setId(transaction.id);
      setType(transaction.type);
      setAmount(transaction.amount);
      setStatus(transaction.status);
      setMethod(transaction.method || 'UPI / PhonePe');
      setReferenceId(transaction.referenceId || '');
      setNote(transaction.note);
      setNoteHi(transaction.noteHi || transaction.note);
    } else {
      setId(`txn-${Date.now()}`);
      setType('DEPOSIT');
      setAmount(5000);
      setStatus('SUCCESS');
      setMethod('Admin Direct Manual Adjustment');
      setReferenceId(`ADM${Math.floor(100000 + Math.random() * 900000)}`);
      setNote('Admin manual credit to account');
      setNoteHi('एडमिन द्वारा खाते में जमा की गई राशि');
    }
    setError('');
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError(isHi ? 'राशि 0 से अधिक होनी चाहिए।' : 'Amount must be greater than 0.');
      return;
    }

    const savedTxn: Transaction = {
      id: id.trim() || `txn-${Date.now()}`,
      type,
      amount: Number(amount),
      status,
      method: method.trim() || 'UPI / Direct',
      referenceId: referenceId.trim() || `REF${Date.now()}`,
      note: note.trim() || `${type} transaction processed`,
      noteHi: noteHi.trim() || (isHi ? 'लेनदेन सफल रहा' : 'Transaction processed'),
      date: transaction?.date || new Date().toISOString(),
      timestamp: transaction?.timestamp || Date.now(),
    };

    onSave(savedTxn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing
                  ? (isHi ? 'लेन-देन संपादित करें (Edit Transaction)' : 'Edit Transaction Record')
                  : (isHi ? 'मैन्युअल लेन-देन दर्ज करें (Add Transaction)' : 'Add Manual Transaction Record')}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'राशि, स्थिति और विवरण अपडेट करें' : 'Update amount, status, reference ID and notes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'लेन-देन प्रकार (Type):' : 'Transaction Type:'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="DEPOSIT">DEPOSIT (जमा)</option>
                <option value="WITHDRAWAL">WITHDRAWAL (निकासी)</option>
                <option value="INVEST">INVEST (योजना निवेश)</option>
                <option value="RETURN_PAYOUT">RETURN_PAYOUT (दैनिक रिटर्न)</option>
                <option value="CAPITAL_REFUND">CAPITAL_REFUND (मूलधन वापसी)</option>
                <option value="REFERRAL_BONUS">REFERRAL_BONUS (रेफरल बोनस)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'राशि (Amount ₹):' : 'Amount (₹):'}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:border-purple-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'स्थिति (Status):' : 'Status:'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'SUCCESS' | 'PENDING' | 'REJECTED')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="SUCCESS">SUCCESS (सफल)</option>
                <option value="PENDING">PENDING (लंबित)</option>
                <option value="REJECTED">REJECTED (अस्वीकृत)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'रेफरेंस आईडी (Reference ID):' : 'Reference / UTR ID:'}
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:border-purple-400 focus:outline-none"
                placeholder="UPI/IMPS Reference"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'भुगतान विधि (Payment Method / Channel):' : 'Method / Channel:'}
            </label>
            <input
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none"
              placeholder="e.g. UPI / GooglePay / Admin Direct"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'विवरण (Note / Remarks EN):' : 'Note / Description (EN):'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none"
              placeholder="e.g. Direct credit approved by Admin"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'विवरण (हिंदी):' : 'Note / Description (HI):'}
            </label>
            <input
              type="text"
              value={noteHi}
              onChange={(e) => setNoteHi(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none"
              placeholder="उदा. एडमिन द्वारा स्वीकृत प्रत्यक्ष क्रेडिट"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? (isHi ? 'अपडेट करें' : 'Save Changes') : (isHi ? 'दर्ज करें' : 'Add Record')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
