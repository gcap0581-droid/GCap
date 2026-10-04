import React from 'react';
import {
  LayoutDashboard,
  Flame,
  TrendingUp,
  Wallet,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { DesktopCategoryTab, Language } from '../types';

interface DesktopCategoryNavProps {
  activeTab: DesktopCategoryTab;
  onTabChange: (tab: DesktopCategoryTab) => void;
  language: Language;
  activeInvestmentsCount: number;
}

export const DesktopCategoryNav: React.FC<DesktopCategoryNavProps> = ({
  activeTab,
  onTabChange,
  language,
  activeInvestmentsCount,
}) => {
  const isHi = language === 'hi';

  const categories: {
    id: DesktopCategoryTab;
    labelEn: string;
    labelHi: string;
    subEn: string;
    subHi: string;
    icon: React.FC<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      labelEn: 'Super Deals',
      labelHi: 'मुख्य डील्स',
      subEn: 'Offers & Today Deals',
      subHi: 'ऑफर व दैनिक अपडेट',
      icon: LayoutDashboard,
    },
    {
      id: 'plans',
      labelEn: 'Top Plans 🔥',
      labelHi: 'सुपर प्लान्स 🔥',
      subEn: '641D / 365D Schemes',
      subHi: '2.2% से 3.5% दैनिक लाभ',
      icon: Flame,
      badge: 'TOP ROI',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black',
    },
    {
      id: 'investments',
      labelEn: 'My Orders',
      labelHi: 'माई ऑर्डर्स',
      subEn: 'Active Portfolio & Returns',
      subHi: 'सक्रिय निवेश व रिटर्न',
      icon: TrendingUp,
      badge: activeInvestmentsCount > 0 ? `${activeInvestmentsCount} Active` : undefined,
      badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black',
    },
    {
      id: 'wallet',
      labelEn: 'Wallet Pay',
      labelHi: 'वॉलेट पे',
      subEn: 'UPI / Bank / Passbook',
      subHi: 'पैसे जोड़ें व निकालें',
      icon: Wallet,
    },
    {
      id: 'calculator',
      labelEn: 'ROI Calculator',
      labelHi: 'मुनाफा कैलकुलेटर',
      subEn: 'Simulate Profit & Duration',
      subHi: 'रिटर्न व मुनाफा जांचें',
      icon: Calculator,
      badge: 'ESTIMATE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold',
    },
    {
      id: 'rules',
      labelEn: 'GCap Assured',
      labelHi: 'गारंटी नीतियां',
      subEn: '100% Capital Protection',
      subHi: '100% मूलधन सुरक्षा गारंटी',
      icon: ShieldCheck,
      badge: 'ASSURED',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black',
    },
  ];

  return (
    <div className="w-full bg-slate-950/80 border border-white/[0.08] rounded-2xl p-1.5 sm:p-2 shadow-xl shadow-black/40 backdrop-blur-xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              id={`desktop-category-tab-${cat.id}`}
              onClick={() => onTabChange(cat.id)}
              className={`relative flex flex-col items-start p-3 rounded-xl transition-all duration-200 cursor-pointer text-left group overflow-hidden active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-950/90 border border-amber-500/50 shadow-lg shadow-amber-950/30'
                  : 'hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
              }`}
            >
              {/* Active Indicator Top Edge Glow */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              )}

              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/40'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {cat.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider shadow-sm ${
                      cat.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </div>

              <div className="mt-0.5 w-full">
                <div
                  className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${
                    isActive ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {isHi ? cat.labelHi : cat.labelEn}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                  {isHi ? cat.subHi : cat.subEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
