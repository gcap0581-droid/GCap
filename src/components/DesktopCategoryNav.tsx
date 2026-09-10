import React from 'react';
import {
  LayoutDashboard,
  Flame,
  TrendingUp,
  Wallet,
  Calculator,
  ShieldCheck,
  Tag,
  Star,
  Zap,
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
      badgeColor: 'bg-amber-500 text-slate-950 font-black',
    },
    {
      id: 'investments',
      labelEn: 'My Orders',
      labelHi: 'माई ऑर्डर्स',
      subEn: 'Active Portfolio & Returns',
      subHi: 'सक्रिय निवेश व रिटर्न',
      icon: TrendingUp,
      badge: activeInvestmentsCount > 0 ? `${activeInvestmentsCount} Active` : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950 font-black',
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
      badgeColor: 'bg-teal-500 text-slate-950 font-bold',
    },
    {
      id: 'rules',
      labelEn: 'GCap Assured',
      labelHi: 'गारंटी नीतियां',
      subEn: '100% Capital Protection',
      subHi: '100% मूलधन सुरक्षा गारंटी',
      icon: ShieldCheck,
      badge: 'ASSURED',
      badgeColor: 'bg-cyan-400 text-slate-950 font-black',
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-1.5 sm:p-2 shadow-lg backdrop-blur-md">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              id={`desktop-category-tab-${cat.id}`}
              onClick={() => onTabChange(cat.id)}
              className={`relative flex flex-col items-start p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer text-left group overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/50 shadow-md shadow-amber-950/20'
                  : 'hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
              }`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm" />
              )}

              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {cat.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider ${
                      cat.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </div>

              <div className="mt-0.5 w-full">
                <div
                  className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
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
