import React from 'react';
import { Baby, Home, ShieldAlert, Users } from 'lucide-react';
import { DashboardStats, TargetGroupKey } from '../types/population';

interface StatsDashboardProps {
  stats: DashboardStats;
  onSelectGroup?: (group: TargetGroupKey) => void;
  onNavigateTab?: (tab: 'households' | 'residents') => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  onSelectGroup,
  onNavigateTab,
}) => {
  return (
    <section
      aria-label="Bảng điều khiển thống kê"
      className="no-print grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {/* Card 1: TỔNG SỐ HỘ KHẨU */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-bold tracking-wide text-[#0A1E3F] uppercase">
              Tổng số hộ khẩu
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab?.('households')}
              className="w-10 h-10 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0 hover:bg-blue-100 transition-colors cursor-pointer"
              title="Xem danh sách hộ khẩu"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#0A1E3F] tabular-nums">
            {stats.totalHouseholds}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-500">Hộ thường trú</span>
            <span className="mt-0.5 text-base font-bold text-slate-800 tabular-nums">
              {stats.permanentHouseholds}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500">Hộ tạm trú</span>
            <span className="mt-0.5 text-base font-bold text-blue-700 tabular-nums">
              {stats.temporaryHouseholds}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: TỔNG SỐ NHÂN KHẨU */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-bold tracking-wide text-[#0A1E3F] uppercase">
              Tổng số nhân khẩu
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab?.('residents')}
              className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 hover:bg-sky-100 transition-colors cursor-pointer"
              title="Xem danh sách nhân khẩu"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#0A1E3F] tabular-nums">
            {stats.totalResidents}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-500">Nam giới</span>
            <span className="mt-0.5 text-base font-bold text-slate-800 tabular-nums">
              {stats.maleCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500">Nữ giới</span>
            <span className="mt-0.5 text-base font-bold text-slate-800 tabular-nums">
              {stats.femaleCount}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: TRẺ EM & CAO TUỔI */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-bold tracking-wide text-[#0A1E3F] uppercase">
              Trẻ em &amp; Cao tuổi
            </h2>
            <button
              type="button"
              onClick={() => onSelectGroup?.('children_under_16')}
              className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Tra cứu nhóm trẻ em & cao tuổi"
            >
              <Baby className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-[#0A1E3F] tabular-nums">
              {stats.childrenUnder16 + stats.elderly60Plus}
            </p>
            <span className="text-xs text-slate-500">người thuộc diện theo dõi</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectGroup?.('children_under_16')}
            className="flex flex-col text-left hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span className="text-slate-500">Dưới 16 tuổi</span>
            <span className="mt-0.5 text-base font-bold text-amber-700 tabular-nums">
              {stats.childrenUnder16}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectGroup?.('elderly_60_plus')}
            className="flex flex-col text-left hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span className="text-slate-500">Từ 60 tuổi trở lên</span>
            <span className="mt-0.5 text-base font-bold text-slate-800 tabular-nums">
              {stats.elderly60Plus}
            </span>
          </button>
        </div>
      </div>

      {/* Card 4: NVQS & HỘ CHÍNH SÁCH */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-bold tracking-wide text-[#0A1E3F] uppercase">
              NVQS &amp; Hộ chính sách
            </h2>
            <button
              type="button"
              onClick={() => onSelectGroup?.('military_service')}
              className="w-10 h-10 rounded-lg bg-red-50 text-[#C8102E] flex items-center justify-center shrink-0 hover:bg-red-100 transition-colors cursor-pointer"
              title="Xem danh sách NVQS & chính sách"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-[#C8102E] tabular-nums">
              {stats.militaryServiceMales}
            </p>
            <span className="text-xs font-medium text-slate-600">nam NVQS (18–27 tuổi)</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => onSelectGroup?.('poor_households')}
            className="flex flex-col text-left hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span className="text-slate-500 truncate">Hộ nghèo</span>
            <span className="mt-0.5 text-base font-bold text-red-700 tabular-nums">
              {stats.poorHouseholds}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectGroup?.('near_poor_households')}
            className="flex flex-col text-left hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span className="text-slate-500 truncate">Cận nghèo</span>
            <span className="mt-0.5 text-base font-bold text-amber-700 tabular-nums">
              {stats.nearPoorHouseholds}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectGroup?.('policy_households')}
            className="flex flex-col text-left hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span className="text-slate-500 truncate">Chính sách</span>
            <span className="mt-0.5 text-base font-bold text-[#0A1E3F] tabular-nums">
              {stats.policyHouseholds}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
