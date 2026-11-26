import React, { useMemo, useState } from 'react';
import {
  Edit3,
  Eye,
  FileSpreadsheet,
  Home,
  Plus,
  Printer,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { Household, Resident } from '../types/population';
import { formatDateVN, normalizeVietnamese } from '../utils/formatters';

interface HouseholdsViewProps {
  households: Household[];
  residents: Resident[];
  onAddHousehold: () => void;
  onViewHousehold: (household: Household) => void;
  onEditHousehold: (household: Household) => void;
  onDeleteHousehold: (household: Household) => void;
  onAddMemberToHousehold: (householdId: string) => void;
  onExportExcel: (filtered: Household[]) => void;
  onPrintList: (filtered: Household[]) => void;
}

export const HouseholdsView: React.FC<HouseholdsViewProps> = ({
  households,
  residents,
  onAddHousehold,
  onViewHousehold,
  onEditHousehold,
  onDeleteHousehold,
  onAddMemberToHousehold,
  onExportExcel,
  onPrintList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [residencyFilter, setResidencyFilter] = useState<'all' | 'Thường trú' | 'Tạm trú'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'poor' | 'near_poor' | 'policy'>('all');

  const membersByHousehold = useMemo(() => {
    const map = new Map<string, Resident[]>();
    for (const r of residents) {
      if (r.tinhTrangCuTru === 'Đã chuyển đi') continue;
      const list = map.get(r.householdId) || [];
      list.push(r);
      map.set(r.householdId, list);
    }
    return map;
  }, [residents]);

  const filteredHouseholds = useMemo(() => {
    const q = normalizeVietnamese(searchQuery);
    return households.filter((h) => {
      if (residencyFilter !== 'all' && h.loaiCuTru !== residencyFilter) return false;
      if (categoryFilter === 'poor' && !h.laHoNgheo) return false;
      if (categoryFilter === 'near_poor' && !h.laHoCanNgheo) return false;
      if (categoryFilter === 'policy' && !h.laHoChinhSach) return false;

      if (!q) return true;

      const members = membersByHousehold.get(h.id) || [];
      const memberMatch = members.some(
        (m) =>
          normalizeVietnamese(m.hoTen).includes(q) ||
          normalizeVietnamese(m.cccd).includes(q) ||
          normalizeVietnamese(m.sdt).includes(q)
      );

      return (
        normalizeVietnamese(h.maHoKhau).includes(q) ||
        normalizeVietnamese(h.chuHoTen).includes(q) ||
        normalizeVietnamese(h.chuHoCCCD).includes(q) ||
        normalizeVietnamese(h.chuHoSDT).includes(q) ||
        normalizeVietnamese(h.diaChiThuongTru).includes(q) ||
        normalizeVietnamese(h.thonBuon).includes(q) ||
        memberMatch
      );
    });
  }, [households, membersByHousehold, searchQuery, residencyFilter, categoryFilter]);

  return (
    <section className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Smart Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo chủ hộ, tên nhân khẩu, mã hộ (HK-...), CCCD, SĐT hoặc địa chỉ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
            />
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onAddHousehold}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0A1E3F] font-bold text-xs sm:text-sm min-h-[40px] whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm hộ khẩu</span>
            </button>
            <button
              type="button"
              onClick={() => onExportExcel(filteredHouseholds)}
              disabled={filteredHouseholds.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm min-h-[40px] whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              onClick={() => onPrintList(filteredHouseholds)}
              disabled={filteredHouseholds.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A1E3F] hover:bg-[#112F62] text-white font-semibold text-xs sm:text-sm min-h-[40px] whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In danh sách</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Cư trú:</span>
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg">
              {(['all', 'Thường trú', 'Tạm trú'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setResidencyFilter(type)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    residencyFilter === type
                      ? 'bg-white text-[#0A1E3F] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'all' ? 'Tất cả' : type}
                </button>
              ))}
            </div>

            <span className="text-xs font-semibold text-slate-500 sm:ml-2">Diện hộ:</span>
            <div className="inline-flex flex-wrap items-center bg-slate-100 p-0.5 rounded-lg">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'poor', label: 'Hộ nghèo' },
                  { id: 'near_poor', label: 'Cận nghèo' },
                  { id: 'policy', label: 'Chính sách' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-white text-[#0A1E3F] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 tabular-nums">
            Hiển thị <strong className="text-slate-800">{filteredHouseholds.length}</strong> / {households.length} hộ khẩu
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filteredHouseholds.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Home className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-base font-bold text-slate-800">
            {households.length === 0 ? 'Chưa có dữ liệu hộ khẩu' : 'Không tìm thấy hộ khẩu phù hợp'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {households.length === 0
              ? 'Nhấn "Thêm hộ khẩu" để tạo hộ mới hoặc sử dụng nút "Nạp 20 hộ mẫu" ở đầu trang để trải nghiệm.'
              : 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc cư trú / phân loại.'}
          </p>
          {households.length === 0 && (
            <button
              type="button"
              onClick={onAddHousehold}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0A1E3F] text-white text-sm font-semibold min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm hộ khẩu đầu tiên</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Mã hộ</th>
                    <th className="px-4 py-3">Chủ hộ</th>
                    <th className="px-4 py-3">CCCD / SĐT</th>
                    <th className="px-4 py-3">Địa chỉ</th>
                    <th className="px-4 py-3">Cư trú &amp; Phân loại</th>
                    <th className="px-4 py-3 text-right">Số khẩu</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredHouseholds.map((h) => {
                    const memberCount = (membersByHousehold.get(h.id) || []).length;
                    const classifications: string[] = [];
                    if (h.laHoNgheo) classifications.push('Hộ nghèo');
                    if (h.laHoCanNgheo) classifications.push('Cận nghèo');
                    if (h.laHoChinhSach) classifications.push('Chính sách');

                    return (
                      <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#0A1E3F] whitespace-nowrap">
                          {h.maHoKhau}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onViewHousehold(h)}
                            className="font-bold text-slate-900 hover:text-[#1D4ED8] text-left cursor-pointer"
                          >
                            {h.chuHoTen}
                          </button>
                          <p className="text-xs text-slate-500">
                            {h.chuHoGioiTinh} · Sinh {formatDateVN(h.chuHoNgaySinh)}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700 whitespace-nowrap">
                          <div>{h.chuHoCCCD || '—'}</div>
                          <div className="text-slate-500">{h.chuHoSDT || '—'}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-xs">
                          <p className="truncate font-medium" title={h.diaChiThuongTru}>
                            {h.diaChiThuongTru}
                          </p>
                          <p className="text-xs text-slate-500">{h.thanhPhanHo}</p>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p
                            className={`font-semibold ${
                              h.loaiCuTru === 'Thường trú' ? 'text-emerald-700' : 'text-blue-700'
                            }`}
                          >
                            {h.loaiCuTru}
                          </p>
                          {classifications.length > 0 && (
                            <p className="text-red-700 font-medium mt-0.5">
                              {classifications.join(' · ')}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {memberCount}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onViewHousehold(h)}
                              className="p-2 rounded-lg text-[#0A1E3F] hover:bg-slate-100 cursor-pointer"
                              title="Xem chi tiết & danh sách thành viên"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddMemberToHousehold(h.id)}
                              className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                              title="Thêm nhân khẩu vào hộ"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditHousehold(h)}
                              className="p-2 rounded-lg text-[#1D4ED8] hover:bg-blue-50 cursor-pointer"
                              title="Sửa thông tin hộ khẩu"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteHousehold(h)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Xóa hộ khẩu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / iPhone 11 Card List */}
          <div className="lg:hidden space-y-3">
            {filteredHouseholds.map((h) => {
              const memberCount = (membersByHousehold.get(h.id) || []).length;
              const classifications: string[] = [];
              if (h.laHoNgheo) classifications.push('Hộ nghèo');
              if (h.laHoCanNgheo) classifications.push('Cận nghèo');
              if (h.laHoChinhSach) classifications.push('Chính sách');

              return (
                <article
                  key={h.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-[#1D4ED8]">
                        {h.maHoKhau} · {h.loaiCuTru}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                        {h.chuHoTen}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sinh {formatDateVN(h.chuHoNgaySinh)} · CCCD: <span className="font-mono">{h.chuHoCCCD || '—'}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold text-[#0A1E3F] tabular-nums block">
                        {memberCount}
                      </span>
                      <span className="text-[11px] text-slate-500">nhân khẩu</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {h.diaChiThuongTru}
                    {classifications.length > 0 && (
                      <span className="block mt-1 font-semibold text-red-700">
                        {classifications.join(' · ')}
                      </span>
                    )}
                  </p>

                  <div className="pt-2.5 border-t border-slate-100 grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewHousehold(h)}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold min-h-[42px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddMemberToHousehold(h.id)}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold min-h-[42px]"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Thêm NK</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditHousehold(h)}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold min-h-[42px]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHousehold(h)}
                      className="flex items-center justify-center gap-1 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold min-h-[42px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
