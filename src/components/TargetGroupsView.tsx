import React, { useMemo, useState } from 'react';
import {
  Accessibility,
  Award,
  Baby,
  FileSpreadsheet,
  HeartHandshake,
  Home,
  MapPinOff,
  Printer,
  Search,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react';
import { Household, Resident, TargetGroupKey } from '../types/population';
import {
  calculateAge,
  filterHouseholdsByGroup,
  filterResidentsByGroup,
  formatDateVN,
  normalizeVietnamese,
} from '../utils/formatters';

interface TargetGroupsViewProps {
  households: Household[];
  residents: Resident[];
  selectedGroup: TargetGroupKey;
  onSelectGroup: (group: TargetGroupKey) => void;
  onViewHousehold: (household: Household) => void;
  onEditResident: (resident: Resident) => void;
  onExportGroupResidents: (title: string, items: Resident[]) => void;
  onExportGroupHouseholds: (title: string, items: Household[]) => void;
  onPrintGroupResidents: (title: string, items: Resident[]) => void;
  onPrintGroupHouseholds: (title: string, items: Household[]) => void;
}

interface GroupMeta {
  key: TargetGroupKey;
  label: string;
  description: string;
  entityType: 'resident' | 'household';
  icon: React.ComponentType<{ className?: string }>;
}

const GROUP_DEFS: GroupMeta[] = [
  {
    key: 'children_under_16',
    label: 'Trẻ em dưới 16 tuổi',
    description: 'Nhân khẩu có độ tuổi dưới 16 tính theo ngày sinh thực tế',
    entityType: 'resident',
    icon: Baby,
  },
  {
    key: 'elderly_60_plus',
    label: 'Người cao tuổi (≥ 60t)',
    description: 'Công dân từ 60 tuổi trở lên đang cư trú tại địa bàn',
    entityType: 'resident',
    icon: Users,
  },
  {
    key: 'military_service',
    label: 'Thanh niên độ tuổi NVQS',
    description: 'Công dân Nam trong độ tuổi 18 đến 27 tuổi',
    entityType: 'resident',
    icon: ShieldAlert,
  },
  {
    key: 'poor_households',
    label: 'Hộ nghèo',
    description: 'Các hộ gia đình thuộc danh sách hộ nghèo của thôn',
    entityType: 'household',
    icon: Home,
  },
  {
    key: 'near_poor_households',
    label: 'Hộ cận nghèo',
    description: 'Các hộ gia đình thuộc diện cận nghèo theo rà soát',
    entityType: 'household',
    icon: Home,
  },
  {
    key: 'policy_households',
    label: 'Gia đình chính sách',
    description: 'Hộ gia đình hưởng chế độ chính sách ưu đãi',
    entityType: 'household',
    icon: HeartHandshake,
  },
  {
    key: 'meritorious_people',
    label: 'Người có công với CM',
    description: 'Thương binh, bệnh binh, người có công với cách mạng',
    entityType: 'resident',
    icon: Award,
  },
  {
    key: 'disabled_people',
    label: 'Người khuyết tật',
    description: 'Đối tượng người khuyết tật cần quan tâm hỗ trợ',
    entityType: 'resident',
    icon: Accessibility,
  },
  {
    key: 'temporary_residents',
    label: 'Người tạm trú',
    description: 'Nhân khẩu đăng ký tạm trú trên địa bàn Thôn 1',
    entityType: 'resident',
    icon: UserCheck,
  },
  {
    key: 'absent_residents',
    label: 'Vắng mặt khỏi địa phương',
    description: 'Nhân khẩu tạm vắng, đi làm ăn xa hoặc đi học ngoài xã',
    entityType: 'resident',
    icon: MapPinOff,
  },
];

export const TargetGroupsView: React.FC<TargetGroupsViewProps> = ({
  households,
  residents,
  selectedGroup,
  onSelectGroup,
  onViewHousehold,
  onEditResident,
  onExportGroupResidents,
  onExportGroupHouseholds,
  onPrintGroupResidents,
  onPrintGroupHouseholds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const householdMap = useMemo(
    () => new Map(households.map((h) => [h.id, h])),
    [households]
  );

  const groupCounts = useMemo(() => {
    const counts: Record<TargetGroupKey, number> = {
      children_under_16: filterResidentsByGroup('children_under_16', residents).length,
      elderly_60_plus: filterResidentsByGroup('elderly_60_plus', residents).length,
      military_service: filterResidentsByGroup('military_service', residents).length,
      poor_households: filterHouseholdsByGroup('poor_households', households).length,
      near_poor_households: filterHouseholdsByGroup('near_poor_households', households).length,
      policy_households: filterHouseholdsByGroup('policy_households', households).length,
      meritorious_people: filterResidentsByGroup('meritorious_people', residents).length,
      disabled_people: filterResidentsByGroup('disabled_people', residents).length,
      temporary_residents: filterResidentsByGroup('temporary_residents', residents).length,
      absent_residents: filterResidentsByGroup('absent_residents', residents).length,
    };
    return counts;
  }, [households, residents]);

  const activeMeta = GROUP_DEFS.find((g) => g.key === selectedGroup) || GROUP_DEFS[0];

  const matchedHouseholds = useMemo(() => {
    if (activeMeta.entityType !== 'household') return [];
    const base = filterHouseholdsByGroup(selectedGroup, households);
    const q = normalizeVietnamese(searchQuery);
    if (!q) return base;
    return base.filter(
      (h) =>
        normalizeVietnamese(h.maHoKhau).includes(q) ||
        normalizeVietnamese(h.chuHoTen).includes(q) ||
        normalizeVietnamese(h.diaChiThuongTru).includes(q)
    );
  }, [activeMeta.entityType, selectedGroup, households, searchQuery]);

  const matchedResidents = useMemo(() => {
    if (activeMeta.entityType !== 'resident') return [];
    const base = filterResidentsByGroup(selectedGroup, residents);
    const q = normalizeVietnamese(searchQuery);
    if (!q) return base;
    return base.filter((r) => {
      const hh = householdMap.get(r.householdId);
      return (
        normalizeVietnamese(r.hoTen).includes(q) ||
        normalizeVietnamese(r.cccd).includes(q) ||
        normalizeVietnamese(hh?.maHoKhau || '').includes(q)
      );
    });
  }, [activeMeta.entityType, selectedGroup, residents, householdMap, searchQuery]);

  const totalMatched =
    activeMeta.entityType === 'household' ? matchedHouseholds.length : matchedResidents.length;

  return (
    <section className="space-y-4">
      {/* 10 Category Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {GROUP_DEFS.map((g) => {
          const Icon = g.icon;
          const isActive = g.key === selectedGroup;
          const count = groupCounts[g.key];

          return (
            <button
              key={g.key}
              type="button"
              onClick={() => {
                onSelectGroup(g.key);
                setSearchQuery('');
              }}
              className={`text-left p-3.5 rounded-xl border transition-colors flex flex-col justify-between min-h-[88px] cursor-pointer ${
                isActive
                  ? 'bg-[#0A1E3F] text-white border-[#0A1E3F] shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-[#1D4ED8]/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FACC15]' : 'text-[#1D4ED8]'}`} />
                <span
                  className={`font-mono text-lg font-extrabold tabular-nums ${
                    isActive ? 'text-[#FACC15]' : 'text-[#0A1E3F]'
                  }`}
                >
                  {count}
                </span>
              </div>
              <p className="mt-2 text-xs font-bold leading-snug">{g.label}</p>
            </button>
          );
        })}
      </div>

      {/* Active Group Detail Panel */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0A1E3F]">
              {activeMeta.label} ({totalMatched})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{activeMeta.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc nhanh trong nhóm..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
              />
            </div>

            <button
              type="button"
              disabled={totalMatched === 0}
              onClick={() =>
                activeMeta.entityType === 'household'
                  ? onExportGroupHouseholds(activeMeta.label, matchedHouseholds)
                  : onExportGroupResidents(activeMeta.label, matchedResidents)
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-semibold min-h-[38px] disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              disabled={totalMatched === 0}
              onClick={() =>
                activeMeta.entityType === 'household'
                  ? onPrintGroupHouseholds(activeMeta.label, matchedHouseholds)
                  : onPrintGroupResidents(activeMeta.label, matchedResidents)
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0A1E3F] hover:bg-[#112F62] text-white text-xs font-semibold min-h-[38px] disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In danh sách</span>
            </button>
          </div>
        </div>

        {totalMatched === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Hiện không có trường hợp nào thuộc nhóm &ldquo;{activeMeta.label}&rdquo;.
          </p>
        ) : activeMeta.entityType === 'household' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5">Mã hộ</th>
                  <th className="px-3 py-2.5">Chủ hộ</th>
                  <th className="px-3 py-2.5">CCCD / SĐT</th>
                  <th className="px-3 py-2.5">Địa chỉ</th>
                  <th className="px-3 py-2.5">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {matchedHouseholds.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-mono text-xs font-bold text-[#1D4ED8]">
                      <button
                        type="button"
                        onClick={() => onViewHousehold(h)}
                        className="hover:underline cursor-pointer"
                      >
                        {h.maHoKhau}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{h.chuHoTen}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600">
                      {h.chuHoCCCD || '—'} · {h.chuHoSDT || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">{h.diaChiThuongTru}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{h.ghiChu || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5">Họ và tên</th>
                  <th className="px-3 py-2.5">Giới tính / Tuổi</th>
                  <th className="px-3 py-2.5">CCCD</th>
                  <th className="px-3 py-2.5">Mã hộ / Chủ hộ</th>
                  <th className="px-3 py-2.5">Cư trú / Nghề nghiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {matchedResidents.map((r) => {
                  const hh = householdMap.get(r.householdId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => onEditResident(r)}
                          className="font-bold text-slate-900 hover:text-[#1D4ED8] text-left cursor-pointer"
                        >
                          {r.hoTen}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap">
                        {r.gioiTinh} · <span className="font-mono font-bold">{calculateAge(r.ngaySinh)} tuổi</span> ({formatDateVN(r.ngaySinh)})
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-600">{r.cccd || '—'}</td>
                      <td className="px-3 py-2.5 text-xs">
                        {hh ? (
                          <button
                            type="button"
                            onClick={() => onViewHousehold(hh)}
                            className="font-mono font-bold text-[#1D4ED8] hover:underline cursor-pointer"
                          >
                            {hh.maHoKhau}
                          </button>
                        ) : (
                          '—'
                        )}
                        <span className="text-slate-500"> · {hh?.chuHoTen || ''}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-700">
                        {r.tinhTrangCuTru} · {r.ngheNghiep || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
