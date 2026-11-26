import React from 'react';
import {
  BarChart3,
  Home,
  Layers,
  Shield,
  Users,
} from 'lucide-react';
import { NavTab } from '../types/population';

interface NavigationTabsProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  counts: {
    households: number;
    residents: number;
  };
}

const NAV_ITEMS: { id: NavTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'households', label: 'Quản lý Hộ khẩu', shortLabel: 'Hộ khẩu', icon: Home },
  { id: 'residents', label: 'Quản lý Nhân khẩu', shortLabel: 'Nhân khẩu', icon: Users },
  { id: 'groups', label: 'Nhóm đối tượng', shortLabel: 'Đối tượng', icon: Layers },
  { id: 'reports', label: 'Báo cáo & Thống kê', shortLabel: 'Báo cáo', icon: BarChart3 },
  { id: 'admin', label: 'Quản trị & Sao lưu', shortLabel: 'Quản trị', icon: Shield },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  counts,
}) => {
  return (
    <>
      {/* Desktop / Tablet horizontal segmented navigation bar */}
      <nav
        aria-label="Điều hướng chính"
        className="no-print hidden md:flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-sm overflow-x-auto no-scrollbar"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeCount =
            item.id === 'households'
              ? counts.households
              : item.id === 'residents'
              ? counts.residents
              : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px] ${
                isActive
                  ? 'bg-[#0A1E3F] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0A1E3F] hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FACC15]' : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {badgeCount !== null && (
                <span
                  className={`text-xs font-mono tabular-nums ${
                    isActive ? 'text-yellow-300' : 'text-slate-400'
                  }`}
                >
                  ({badgeCount})
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile compact bottom tab bar (height <= 60px, well under 15% of mobile screen) */}
      <nav
        aria-label="Điều hướng di động"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-2px_10px_rgba(15,23,42,0.06)]"
      >
        <div className="grid grid-cols-5 h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] px-1 transition-colors ${
                  isActive ? 'text-[#0A1E3F] font-bold' : 'text-slate-500 font-medium'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#1D4ED8]' : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] leading-tight truncate max-w-full">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
