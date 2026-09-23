import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { InvestmentPlan, Language, RiskLevel } from '../../types';

interface PlanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InvestmentPlan | null; // null if adding new plan
  onSave: (plan: InvestmentPlan) => void;
  language: Language;
}

export const PlanEditModal: React.FC<PlanEditModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSave,
  language,
}) => {
  const isHi = language === 'hi';
  const isEditing = !!plan;

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [dailyRoiPercent, setDailyRoiPercent] = useState<number>(2.0);
  const [durationDays, setDurationDays] = useState<number>(15);
  const [minAmount, setMinAmount] = useState<number>(1000);
  const [maxAmount, setMaxAmount] = useState<number>(50000);
  const [payoutFrequency, setPayoutFrequency] = useState<'Daily' | 'Hourly' | 'At Maturity'>('Daily');
  const [risk, setRisk] = useState<RiskLevel>('Low');
  const [tag, setTag] = useState('Popular');
  const [tagHi, setTagHi] = useState('लोकप्रिय');
  const [badge, setBadge] = useState('🔥 High Yield');
  const [description, setDescription] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');
  const [featuresHiStr, setFeaturesHiStr] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      setId(plan.id);
      setName(plan.name);
      setNameHi(plan.nameHi);
      setDailyRoiPercent(plan.dailyRoiPercent);
      setDurationDays(plan.durationDays);
      setMinAmount(plan.minAmount);
      setMaxAmount(plan.maxAmount);
      setPayoutFrequency(plan.payoutFrequency || 'Daily');
      setRisk(plan.risk || 'Low');
      setTag(plan.tag || 'Popular');
      setTagHi(plan.tagHi || 'लोकप्रिय');
      setBadge(plan.badge || '');
      setDescription(plan.description);
      setDescriptionHi(plan.descriptionHi);
      setFeaturesStr(plan.features?.join('\n') || '');
      setFeaturesHiStr(plan.featuresHi?.join('\n') || '');
    } else {
      const generatedId = `plan-${Date.now()}`;
      setId(generatedId);
      setName('Custom Growth Plan');
      setNameHi('कस्टम ग्रोथ प्लान');
      setDailyRoiPercent(2.0);
      setDurationDays(15);
      setMinAmount(1000);
      setMaxAmount(50000);
      setPayoutFrequency('Daily');
      setRisk('Low');
      setTag('New Launch');
      setTagHi('नया लॉन्च');
      setBadge('✨ 30% ROI');
      setDescription('Guaranteed daily returns with instant capital withdrawal upon maturity.');
      setDescriptionHi('दैनिक रिटर्न और परिपक्वता पर तत्काल मूलधन वापसी।');
      setFeaturesStr('2.0% Daily Returns credited automatically\n100% Capital refunded at end of term\nInstant withdrawal to UPI\n24x7 Support');
      setFeaturesHiStr('2.0% दैनिक रिटर्न सीधे वॉलेट में\nअवधि समाप्त होने पर 100% मूलधन वापस\nतत्काल UPI निकासी\n24x7 सहायता');
    }
    setError('');
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isHi ? 'कृपया प्लान का नाम दर्ज करें।' : 'Plan name is required.');
      return;
    }
    if (dailyRoiPercent <= 0) {
      setError(isHi ? 'दैनिक रिटर्न 0% से अधिक होना चाहिए।' : 'Daily ROI must be greater than 0%.');
      return;
    }
    if (durationDays < 1) {
      setError(isHi ? 'अवधि कम से कम 1 दिन होनी चाहिए।' : 'Duration must be at least 1 day.');
      return;
    }
    if (minAmount < 100) {
      setError(isHi ? 'न्यूनतम राशि कम से कम ₹100 होनी चाहिए।' : 'Minimum amount must be at least ₹100.');
      return;
    }
    if (maxAmount <= minAmount) {
      setError(isHi ? 'अधिकतम राशि न्यूनतम राशि से अधिक होनी चाहिए।' : 'Max amount must be greater than min amount.');
      return;
    }

    const features = featuresStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const featuresHi = featuresHiStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const savedPlan: InvestmentPlan = {
      id: id.trim() || `plan-${Date.now()}`,
      name: name.trim(),
      nameHi: nameHi.trim() || name.trim(),
      dailyRoiPercent: Number(dailyRoiPercent),
      durationDays: Number(durationDays),
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
      payoutFrequency,
      payoutFrequencyHi: payoutFrequency === 'Daily' ? 'दैनिक (Daily)' : 'परिपक्वता पर (At Maturity)',
      risk,
      tag: tag.trim(),
      tagHi: tagHi.trim() || tag.trim(),
      badge: badge.trim(),
      description: description.trim(),
      descriptionHi: descriptionHi.trim() || description.trim(),
      features: features.length > 0 ? features : ['Guaranteed daily return payout', 'Principal returned at maturity'],
      featuresHi: featuresHi.length > 0 ? featuresHi : ['सुनिश्चित दैनिक रिटर्न पेआउट', 'परिपक्वता पर मूलधन वापस'],
    };

    onSave(savedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing
                  ? (isHi ? 'निवेश प्लान संपादित करें (Edit Plan)' : 'Edit Investment Plan')
                  : (isHi ? 'नया निवेश प्लान जोड़ें (Add New Plan)' : 'Add New Investment Plan')}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'ROI, अवधि, और न्यूनतम/अधिकतम सीमाएं सेट करें' : 'Configure ROI %, duration, and limits'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'प्लान का नाम (English):' : 'Plan Name (English):'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                placeholder="e.g. Platinum Super Booster"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'प्लान का नाम (हिंदी):' : 'Plan Name (Hindi):'}
              </label>
              <input
                type="text"
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                placeholder="उदा. प्लैटिनम सुपर बूस्टर प्लान"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'दैनिक रिटर्न दर (Daily ROI %):' : 'Daily ROI (%):'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={dailyRoiPercent}
                onChange={(e) => setDailyRoiPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:border-amber-400 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {isHi ? `कुल लाभ: ${(dailyRoiPercent * durationDays).toFixed(1)}%` : `Total ROI: ${(dailyRoiPercent * durationDays).toFixed(1)}%`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'अवधि (Duration in Days):' : 'Duration (Days):'}
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'जोखिम स्तर (Risk Level):' : 'Risk Level:'}
              </label>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value as RiskLevel)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Low">Low (सुरक्षित)</option>
                <option value="Moderate">Moderate (मध्यम)</option>
                <option value="High">High (उच्च)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'कम से कम निवेश (Min Amount ₹):' : 'Minimum Amount (₹):'}
              </label>
              <input
                type="number"
                step="100"
                min="100"
                value={minAmount}
                onChange={(e) => setMinAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'अधिकतम निवेश (Max Amount ₹):' : 'Maximum Amount (₹):'}
              </label>
              <input
                type="number"
                step="500"
                min="500"
                value={maxAmount}
                onChange={(e) => setMaxAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'टैग (Tag):' : 'Badge Tag (EN):'}
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                placeholder="e.g. Best Value"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'टैग (हिंदी):' : 'Badge Tag (HI):'}
              </label>
              <input
                type="text"
                value={tagHi}
                onChange={(e) => setTagHi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                placeholder="उदा. सर्वश्रेष्ठ"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'हाइलाइट बैज (Highlight Badge):' : 'Highlight Badge:'}
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-300 focus:border-amber-400 focus:outline-none"
                placeholder="e.g. 🔥 40% in 20 Days"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'प्लान विवरण (English Description):' : 'Description (EN):'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
              placeholder="Short description of this plan..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'प्लान विवरण (हिंदी विवरण):' : 'Description (HI):'}
            </label>
            <textarea
              rows={2}
              value={descriptionHi}
              onChange={(e) => setDescriptionHi(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
              placeholder="इस योजना का संक्षिप्त विवरण..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'मुख्य विशेषताएं (प्रति पंक्ति एक बिंदु):' : 'Key Features (1 per line, EN):'}
              </label>
              <textarea
                rows={3}
                value={featuresStr}
                onChange={(e) => setFeaturesStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'विशेषताएं (हिंदी - प्रति पंक्ति एक बिंदु):' : 'Key Features (1 per line, HI):'}
              </label>
              <textarea
                rows={3}
                value={featuresHiStr}
                onChange={(e) => setFeaturesHiStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? (isHi ? 'अपडेट सुरक्षित करें' : 'Save Changes') : (isHi ? 'प्लान बनाएं' : 'Create Plan')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
