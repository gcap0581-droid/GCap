import React, { useState } from 'react';
import { PlusCircle, Edit3, Trash2, RotateCcw, TrendingUp, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { InvestmentPlan, Language } from '../../types';
import { formatINR } from '../../utils/storage';

interface AdminPlansTabProps {
  plans: InvestmentPlan[];
  language: Language;
  onAddPlan: () => void;
  onEditPlan: (plan: InvestmentPlan) => void;
  onDeletePlan: (planId: string) => void;
  onResetPlans: () => void;
}

export const AdminPlansTab: React.FC<AdminPlansTabProps> = ({
  plans,
  language,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  onResetPlans,
}) => {
  const isHi = language === 'hi';
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const planToDelete = plans.find((p) => p.id === deleteConfirmId);

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>{isHi ? 'निवेश योजनाएं प्रबंधन (Investment Plans Manager)' : 'Investment Plans Management'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHi
              ? `कुल सक्रिय प्लान: ${plans.length} • आप नए प्लान बना सकते हैं, मौजूदा को एडिट कर सकते हैं या हटा सकते हैं।`
              : `Total Plans: ${plans.length} • Add new schemes, update ROI/limits, or delete obsolete plans.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-admin-reset-plans"
            onClick={onResetPlans}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title={isHi ? 'डिफ़ॉल्ट प्लान्स पर रीसेट करें' : 'Reset to Default Plans'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{isHi ? 'रीसेट डिफ़ॉल्ट' : 'Reset Defaults'}</span>
          </button>

          <button
            id="btn-admin-add-plan"
            onClick={onAddPlan}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHi ? '+ नया प्लान जोड़ें' : '+ Add New Plan'}</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const totalRoi = (plan.dailyRoiPercent * plan.durationDays).toFixed(1);

          return (
            <div
              key={plan.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative group transition-all"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {isHi ? plan.tagHi : plan.tag}
                  </span>
                  {plan.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Plan Titles */}
                <h4 className="text-base font-extrabold text-white">
                  {isHi ? plan.nameHi : plan.name}
                </h4>
                <div className="text-xs text-slate-400 font-medium">
                  {isHi ? plan.name : plan.nameHi}
                </div>

                {/* ROI & Duration Highlights */}
                <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">
                      {isHi ? 'दैनिक रिटर्न' : 'Daily ROI'}
                    </div>
                    <div className="text-base font-extrabold text-emerald-400 font-mono">
                      {plan.dailyRoiPercent}% / day
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">
                      {isHi ? 'अवधि / कुल लाभ' : 'Term / Total'}
                    </div>
                    <div className="text-base font-extrabold text-white font-mono">
                      {plan.durationDays}D ({totalRoi}%)
                    </div>
                  </div>
                </div>

                {/* Min/Max Limits */}
                <div className="mt-3 text-xs flex items-center justify-between text-slate-400 px-1">
                  <span>{isHi ? 'निवेश सीमा:' : 'Min / Max:'}</span>
                  <span className="font-mono font-bold text-slate-200">
                    {formatINR(plan.minAmount)} - {formatINR(plan.maxAmount)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {isHi ? plan.descriptionHi : plan.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[110px]">
                  ID: {plan.id}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditPlan(plan)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                    title={isHi ? 'प्लान संपादित करें' : 'Edit Plan'}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? 'एडिट' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(plan.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
                    title={isHi ? 'प्लान हटाएं' : 'Delete Plan'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isHi ? 'हटाएं' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {isHi ? 'क्या आप इस प्लान को हटाना चाहते हैं?' : 'Confirm Plan Deletion'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isHi ? 'यह क्रिया वापस नहीं ली जा सकती।' : 'This action cannot be undone.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white">{planToDelete.name} ({planToDelete.nameHi})</div>
              <div className="text-slate-400">
                {planToDelete.dailyRoiPercent}% daily • {planToDelete.durationDays} days • {formatINR(planToDelete.minAmount)} min
              </div>
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
                  onDeletePlan(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30"
              >
                {isHi ? 'हां, प्लान हटाएं' : 'Yes, Delete Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
